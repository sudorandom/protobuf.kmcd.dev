import { createFileRegistry, fromBinary, create, toBinary, type FileRegistry } from "@bufbuild/protobuf";
import { 
  FileDescriptorSetSchema, 
  file_google_protobuf_any,
  file_google_protobuf_api,
  file_google_protobuf_descriptor,
  file_google_protobuf_duration,
  file_google_protobuf_empty,
  file_google_protobuf_field_mask,
  file_google_protobuf_source_context,
  file_google_protobuf_struct,
  file_google_protobuf_timestamp,
  file_google_protobuf_type,
  file_google_protobuf_wrappers,
} from "@bufbuild/protobuf/wkt";
import { file_buf_validate_validate } from "../gen/buf/validate/validate_pb";
import { type CompilationError, parseWithWasm } from "./wasm-parser";

/**
 * Standard Protobuf files that are always available to satisfy imports.
 * The order is important: dependencies must appear before the files that import them.
 */
const standardFiles = [
  file_google_protobuf_descriptor.proto,
  file_google_protobuf_any.proto,
  file_google_protobuf_duration.proto,
  file_google_protobuf_empty.proto,
  file_google_protobuf_field_mask.proto,
  file_google_protobuf_source_context.proto,
  file_google_protobuf_struct.proto,
  file_google_protobuf_timestamp.proto,
  file_google_protobuf_wrappers.proto,
  file_google_protobuf_type.proto,
  file_google_protobuf_api.proto,
  file_buf_validate_validate.proto,
];

/**
 * Result of creating a dynamic registry.
 */
export type RegistryResult = 
  | { kind: "success"; registry: FileRegistry; fileDescriptorSet: Uint8Array; userFileDescriptorSet: Uint8Array }
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
  const parsedFileDescriptorSet = result.fileDescriptorSet;
  const fds = fromBinary(FileDescriptorSetSchema, parsedFileDescriptorSet);
  
  // Create a registry containing all standard files plus the newly parsed files.
  // We put standard files first to ensure they are available as dependencies.
  const allFiles = [
    ...standardFiles,
    ...fds.file,
  ];

  const registry = createFileRegistry({
    $typeName: "google.protobuf.FileDescriptorSet",
    file: allFiles,
  });

  // Create a full binary FileDescriptorSet including standard files.
  // This is needed for WASM functions like generateFakeData which need to resolve imports.
  const fullFds = create(FileDescriptorSetSchema, {
    file: allFiles,
  });
  const fileDescriptorSet = toBinary(FileDescriptorSetSchema, fullFds);

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

  const targetPackage = file.proto.package;

  // Filter to only include the files that were actually in the input AND match the target package
  const userFds = create(FileDescriptorSetSchema, {
    file: fds.file.filter(f => f.package === targetPackage),
  });
  const userFileDescriptorSet = toBinary(FileDescriptorSetSchema, userFds);

  console.log("createDynamicRegistry: Registry created successfully with package:", targetPackage);
  return { kind: "success", registry, fileDescriptorSet, userFileDescriptorSet };
}
