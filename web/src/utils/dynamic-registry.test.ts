import { describe, it, expect } from 'vitest';
import { createDynamicRegistry } from './dynamic-registry';
import { fromJson, toBinary } from '@bufbuild/protobuf';

describe('Dynamic Registry Library', () => {
  it('should parse a simple proto and create a registry', async () => {
    const proto = `
      syntax = "proto3";
      package test.v1;
      message User {
        string name = 1;
        int32 age = 2;
      }
    `;
    const result = await createDynamicRegistry(proto);
    if (result.kind === "error") throw new Error("Expected success, got errors: " + JSON.stringify(result.errors));
    const registry = result.registry;
    const userType = registry.getMessage("test.v1.User");
    
    expect(userType).toBeDefined();
    expect(userType?.typeName).toBe("test.v1.User");
    
    const message = fromJson(userType!, { name: "Alice", age: 30 });
    const binary = toBinary(userType!, message);
    expect(binary.length).toBeGreaterThan(0);
  });

  it('should handle complex protos with enums and nested messages', async () => {
    const proto = `
      syntax = "proto3";
      package complex.v1;
      message Container {
        enum Status {
          UNKNOWN = 0;
          ACTIVE = 1;
        }
        Status status = 1;
        message Inner {
          string value = 1;
        }
        repeated Inner items = 2;
      }
    `;
    const result = await createDynamicRegistry(proto);
    if (result.kind === "error") throw new Error("Expected success, got errors: " + JSON.stringify(result.errors));
    const registry = result.registry;
    const containerType = registry.getMessage("complex.v1.Container");
    
    expect(containerType).toBeDefined();
    
    const data = {
      status: 1, // ACTIVE
      items: [{ value: "foo" }, { value: "bar" }]
    };
    const message = fromJson(containerType!, data);
    // @ts-expect-error dynamic message fields
    expect(message.status).toBe(1);
    // @ts-expect-error dynamic message fields
    expect(message.items).toHaveLength(2);
  });

  it('should support google.protobuf.Timestamp via stubs', async () => {
    const proto = `
      syntax = "proto3";
      package time.v1;
      import "google/protobuf/timestamp.proto";
      message Event {
        google.protobuf.Timestamp occurred_at = 1;
      }
    `;
    const result = await createDynamicRegistry(proto);
    if (result.kind === "error") throw new Error("Expected success, got errors: " + JSON.stringify(result.errors));
    const registry = result.registry;
    const eventType = registry.getMessage("time.v1.Event");
    
    expect(eventType).toBeDefined();
    const data = { occurredAt: "2026-05-05T12:00:00Z" };
    const message = fromJson(eventType!, data);
    // @ts-expect-error dynamic message fields
    expect(message.occurredAt).toBeDefined();
  });

  it('should support buf.validate annotations via stubs', async () => {
    const proto = `
      syntax = "proto3";
      package valid.v1;
      import "buf/validate/validate.proto";
      message User {
        string email = 1 [(buf.validate.field).string.email = true];
      }
    `;
    // This should not throw during registry creation
    const result = await createDynamicRegistry(proto);
    if (result.kind === "error") throw new Error("Expected success, got errors: " + JSON.stringify(result.errors));
    const registry = result.registry;
    const userType = registry.getMessage("valid.v1.User");
    expect(userType).toBeDefined();
  });

  it('should return errors if no package is declared', async () => {
    const proto = `
      syntax = "proto3";
      message NoPackage {}
    `;
    const result = await createDynamicRegistry(proto);
    expect(result.kind).toBe("error");
    if (result.kind === "error") {
      expect(result.errors[0].message).toContain("Proto source must have a package declaration");
    }
  });

  it('should return structured compilation errors for invalid syntax', async () => {
    const proto = `
      syntax = "proto3";
      package test.v1;
      message User {
        string name = 1
      }
    `;
    const result = await createDynamicRegistry(proto);
    expect(result.kind).toBe("error");
    if (result.kind === "error") {
      expect(result.errors.length).toBeGreaterThan(0);
      expect(result.errors[0].line).toBe(6);
      expect(result.errors[0].message).toContain("expecting ';'");
    }
  });
});
