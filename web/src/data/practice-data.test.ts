import { describe, it, expect } from "vitest";
import { fromBinary } from "@bufbuild/protobuf";
import { FileDescriptorSetSchema } from "@bufbuild/protobuf/wkt";
import { createDynamicRegistry } from "../utils/dynamic-registry";
import { EXERCISES } from "./practice-data";

/** Compiles a schema the same way the practice page does and returns its FDS. */
async function compile(proto: string) {
  const result = await createDynamicRegistry(proto);
  if (result.kind === "error") {
    throw new Error("compile failed: " + JSON.stringify(result.errors));
  }
  return fromBinary(FileDescriptorSetSchema, result.userFileDescriptorSet);
}

const validation = EXERCISES.find((e) => e.id === 9)!;

const run = (fds: unknown) =>
  validation.assertions.map((a) => {
    try {
      a.validate(fds);
      return { id: a.id, passed: true, error: "" };
    } catch (err) {
      return { id: a.id, passed: false, error: (err as Error).message };
    }
  });

describe("practice exercise 9: schema-level validation", () => {
  it("fails every assertion on the unmodified starting schema", async () => {
    const results = run(await compile(validation.initialCode));
    expect(results.every((r) => !r.passed)).toBe(true);
  });

  it("passes every assertion on the intended solution", async () => {
    const solution = `syntax = "proto3";

package practice;

import "buf/validate/validate.proto";

message Signup {
  string email = 1 [(buf.validate.field).string.email = true];
  uint32 age = 2 [(buf.validate.field).uint32.gte = 18];
}
`;
    const results = run(await compile(solution));
    expect(results.filter((r) => !r.passed)).toEqual([]);
  });

  it("rejects gt, which would exclude 18 itself", async () => {
    const nearMiss = `syntax = "proto3";

package practice;

import "buf/validate/validate.proto";

message Signup {
  string email = 1 [(buf.validate.field).string.email = true];
  uint32 age = 2 [(buf.validate.field).uint32.gt = 18];
}
`;
    const ageResult = run(await compile(nearMiss)).find(
      (r) => r.id === "age_rule",
    )!;
    expect(ageResult.passed).toBe(false);
    expect(ageResult.error).toContain("gte");
  });

  it("rejects a wrong string rule on email", async () => {
    const wrongRule = `syntax = "proto3";

package practice;

import "buf/validate/validate.proto";

message Signup {
  string email = 1 [(buf.validate.field).string.uuid = true];
  uint32 age = 2 [(buf.validate.field).uint32.gte = 18];
}
`;
    const emailResult = run(await compile(wrongRule)).find(
      (r) => r.id === "email_rule",
    )!;
    expect(emailResult.passed).toBe(false);
  });
});
