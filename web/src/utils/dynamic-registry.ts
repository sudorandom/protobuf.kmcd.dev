import { createFileRegistry, fromBinary, type Registry } from "@bufbuild/protobuf";
import { FileDescriptorSetSchema } from "@bufbuild/protobuf/wkt";
import { type CompilationError, parseWithWasm } from "./wasm-parser";

/**
 * Result of creating a dynamic registry.
 */
export type RegistryResult = 
  | { kind: "success"; registry: Registry; fileDescriptorSet: Uint8Array }
  | { kind: "error"; errors: CompilationError[] };

/**
 * Parses a .proto source string and creates a Buf Registry.
 */
export async function createDynamicRegistry(protoSource: string): Promise<RegistryResult> {
  console.log("createDynamicRegistry: Parsing proto source...", protoSource.substring(0, 100) + "...");
  const result = await parseWithWasm({
    "input.proto": protoSource,
  });

  if ("compilationErrors" in result && result.compilationErrors) {
    console.log("createDynamicRegistry: Compilation errors found:", result.compilationErrors);
    return { kind: "error", errors: result.compilationErrors };
  }

  console.log("createDynamicRegistry: Successfully parsed to FileDescriptorSet");
  const fileDescriptorSet = result.fileDescriptorSet;
  const registry = createFileRegistry(fromBinary(FileDescriptorSetSchema, fileDescriptorSet));

  const file = registry.getFile("input.proto");
  if (!file) {
    console.warn("createDynamicRegistry: input.proto not found in registry");
    throw new Error("Could not find any user-defined messages in the provided proto source.");
  }
  if (!file.proto.package) {
    console.log("createDynamicRegistry: Missing package declaration");
    return { 
      kind: "error", 
      errors: [{
        file: "input.proto",
        line: 1,
        col: 1,
        offset: 0,
        message: "Proto source must have a package declaration"
      }]
    };
  }

  console.log("createDynamicRegistry: Registry created successfully with package:", file.proto.package);
  return { kind: "success", registry, fileDescriptorSet };
}
