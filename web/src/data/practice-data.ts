export interface ExerciseAssertion {
  id: string;
  description: string;
  validate: (fds: any) => void;
}

export interface ExerciseDef {
  id: number;
  title: string;
  scenario: string;
  task: string;
  hint: string;
  initialCode: string;
  rootMessage: string;
  assertions: ExerciseAssertion[];
  guideUrl?: string;
}

export const EXERCISES: ExerciseDef[] = [
  {
    id: 1,
    title: "The Foundation",
    guideUrl: "/basics/#numbers",
    scenario:
      "Protocol Buffers use unique numeric tags (field numbers) to identify fields in their compiled binary format instead of sending long string names over the wire. This makes the payload incredibly compact and fast to parse. However, if a field is not assigned a number, the schema cannot compile.\n\nFor example, a valid message with a single field looks like this:\n\n```protobuf\nmessage Example {\n  string some_field = 1;\n}\n```\n\nHere, we are defining a UserProfile message, but we haven't assigned the mandatory numbers to ID, name, and email fields.",
    task: "Assign valid, unique field numbers (e.g. `1`, `2`, and `3`) to the fields of `UserProfile` so the schema compiles successfully.",
    hint: "To assign a tag number to a field, use the `= number;` syntax before the semicolon. Make sure each field within the message has a unique tag (e.g. `1`, `2`, `3`).",
    rootMessage: "practice.UserProfile",
    initialCode: `syntax = "proto3";

package practice;

message UserProfile {
  string id;
  string name;
  string email;
}
`,
    assertions: [
      {
        id: "compile",
        description: "The Protobuf schema compiles successfully.",
        validate: (fds: any) => {
          const file = fds.file.find((f: any) => f.package === "practice");
          if (!file) throw new Error("Package 'practice' not declared.");
        },
      },
      {
        id: "msg_exists",
        description: "Message 'UserProfile' is defined.",
        validate: (fds: any) => {
          const file = fds.file.find((f: any) => f.package === "practice");
          const msg = file?.messageType.find(
            (m: any) => m.name === "UserProfile",
          );
          if (!msg) throw new Error("Message 'UserProfile' not found.");
        },
      },
      {
        id: "fields_have_numbers",
        description:
          "All fields (id, name, email) are assigned unique numbers.",
        validate: (fds: any) => {
          const file = fds.file.find((f: any) => f.package === "practice");
          const msg = file.messageType.find(
            (m: any) => m.name === "UserProfile",
          );
          const idField = msg.field.find((f: any) => f.name === "id");
          const nameField = msg.field.find((f: any) => f.name === "name");
          const emailField = msg.field.find((f: any) => f.name === "email");

          if (!idField || !idField.number)
            throw new Error("Field 'id' needs a valid field number.");
          if (!nameField || !nameField.number)
            throw new Error("Field 'name' needs a valid field number.");
          if (!emailField || !emailField.number)
            throw new Error("Field 'email' needs a valid field number.");

          const numbers = [idField.number, nameField.number, emailField.number];
          const uniqueNumbers = new Set(numbers);
          if (uniqueNumbers.size !== 3) {
            throw new Error("Each field must have a unique field number.");
          }
        },
      },
    ],
  },
  {
    id: 2,
    title: "The Style Guide",
    guideUrl: "/basics/#packages",
    scenario:
      "Consistency is critical when generating SDKs across different programming languages. The official Protobuf style guide dictates that message names should use PascalCase (e.g. UserProfile) and field names should use snake_case (e.g. user_id).\n\nIf you use camelCase inside a schema, plugins converting schemas to JSON or stub stencils will produce inconsistent or broken interfaces in target languages (like Go, Java, or TypeScript).",
    task: "Refactor the schema to adhere to standard Protobuf naming conventions (`PascalCase` for the message name, and `snake_case` for the field names).",
    hint: "Look at the casing rules: the message name itself should use `PascalCase` (CapitalizedWords), and all field names should be renamed to use `snake_case` (lowercase_with_underscores).",
    rootMessage: "practice.UserProfile",
    initialCode: `syntax = "proto3";

package practice;

message user_profile {
  string userId = 1;
  string emailAddress = 2;
  string profileImage = 3;
}
`,
    assertions: [
      {
        id: "msg_exists",
        description: "Message 'UserProfile' is defined.",
        validate: (fds: any) => {
          const file = fds.file.find((f: any) => f.package === "practice");
          const goodMsg = file?.messageType.find(
            (m: any) => m.name === "UserProfile",
          );
          if (!goodMsg) throw new Error("Message 'UserProfile' not found.");
        },
      },
      {
        id: "pascal_case_msg",
        description:
          "The old snake_case message name 'user_profile' is removed.",
        validate: (fds: any) => {
          const file = fds.file.find((f: any) => f.package === "practice");
          const badMsg = file?.messageType.find(
            (m: any) => m.name === "user_profile",
          );
          if (badMsg)
            throw new Error(
              "Message name 'user_profile' should be PascalCase: 'UserProfile'.",
            );
        },
      },
      {
        id: "snake_case_fields",
        description:
          "Field names use snake_case (user_id, email_address, profile_image).",
        validate: (fds: any) => {
          const file = fds.file.find((f: any) => f.package === "practice");
          const msg = file?.messageType.find(
            (m: any) => m.name === "UserProfile",
          );
          if (!msg) throw new Error("Message 'UserProfile' not found.");

          if (msg.field.some((f: any) => f.name === "userId"))
            throw new Error("Field 'userId' must be snake_case: 'user_id'.");
          if (msg.field.some((f: any) => f.name === "emailAddress"))
            throw new Error(
              "Field 'emailAddress' must be snake_case: 'email_address'.",
            );
          if (msg.field.some((f: any) => f.name === "profileImage"))
            throw new Error(
              "Field 'profileImage' must be snake_case: 'profile_image'.",
            );

          const hasUserId = msg.field.some((f: any) => f.name === "user_id");
          const hasEmail = msg.field.some(
            (f: any) => f.name === "email_address",
          );
          const hasImage = msg.field.some(
            (f: any) => f.name === "profile_image",
          );

          if (!hasUserId) throw new Error("Field 'user_id' not found.");
          if (!hasEmail) throw new Error("Field 'email_address' not found.");
          if (!hasImage) throw new Error("Field 'profile_image' not found.");
        },
      },
    ],
  },
  {
    id: 3,
    title: "The Weight of Data (Integers)",
    guideUrl: "/basics/#guidelines-for-integers",
    scenario:
      "Selecting the correct numeric type is crucial for wire efficiency. Standard 'int32' and 'int64' types are encoded using sign extension for negative numbers, meaning a negative value (even a simple '-1') always takes a massive 10 bytes on the wire.\n\nTo optimize signed metrics that swing negative, Protobuf provides 'sint32' and 'sint64', which use ZigZag encoding (mapping signed values to unsigned space before compression: -1 becomes 1, 1 becomes 2, etc.). Unsigned metrics (which are always positive and can grow up to billions) should use 'uint32' or 'uint64' to enforce bounds and keep serialization lightweight.",
    task: "Change the field types from `int32` to optimized types: use `sint64` for `ledger_balance` (efficient signed representation) and `uint32` or `uint64` for `hardware_counter` (unsigned counts).",
    hint: "Replace the `int32` types. Prepend/change `ledger_balance` to use `sint64` (enables ZigZag encoding for values that swing negative), and `hardware_counter` to use `uint32` or `uint64` (since counters are strictly non-negative).",
    rootMessage: "practice.Metrics",
    initialCode: `syntax = "proto3";

package practice;

message Metrics {
  int32 ledger_balance = 1;
  int32 hardware_counter = 2;
}
`,
    assertions: [
      {
        id: "ledger_type",
        description:
          "ledger_balance uses 'sint64' for zigzag encoding efficiency.",
        validate: (fds: any) => {
          const file = fds.file.find((f: any) => f.package === "practice");
          const msg = file?.messageType.find((m: any) => m.name === "Metrics");
          const ledger = msg?.field.find(
            (f: any) => f.name === "ledger_balance",
          );
          if (!ledger) throw new Error("Field 'ledger_balance' not found.");
          if (ledger.type !== 18)
            throw new Error(
              "ledger_balance type must be 'sint64' (found type " +
                ledger.type +
                ").",
            );
        },
      },
      {
        id: "counter_type",
        description:
          "hardware_counter uses unsigned integer type ('uint32' or 'uint64').",
        validate: (fds: any) => {
          const file = fds.file.find((f: any) => f.package === "practice");
          const msg = file?.messageType.find((m: any) => m.name === "Metrics");
          const counter = msg?.field.find(
            (f: any) => f.name === "hardware_counter",
          );
          if (!counter) throw new Error("Field 'hardware_counter' not found.");
          if (counter.type !== 13 && counter.type !== 4) {
            throw new Error(
              "hardware_counter must be 'uint32' (13) or 'uint64' (4). Found: " +
                counter.type,
            );
          }
        },
      },
    ],
  },
  {
    id: 4,
    title: "The Shape of Lists",
    guideUrl: "/basics/#repeated",
    scenario:
      "To represent lists, arrays, or sequences of elements in Protobuf, we prepend the field declaration with the 'repeated' keyword. In proto3, repeated fields of basic numeric and boolean types use packed encoding by default, packing multiple values into a single contiguous block of bytes on the wire for maximum compression.",
    task: "Modify the schema to support a list of tags. Rename the field to its plural form `tags` and prepend it with the correct keyword to make it repeated.",
    hint: "Use the `repeated` keyword before the field type to declare an array/list, and rename the field from its singular form `tag` to its plural form `tags` to match list naming conventions.",
    rootMessage: "practice.BlogPost",
    initialCode: `syntax = "proto3";

package practice;

message BlogPost {
  string id = 1;
  string title = 2;
  string tag = 3;
}
`,
    assertions: [
      {
        id: "plural_name",
        description: "Field name is renamed to plural 'tags'.",
        validate: (fds: any) => {
          const file = fds.file.find((f: any) => f.package === "practice");
          const msg = file?.messageType.find((m: any) => m.name === "BlogPost");
          if (msg?.field.some((f: any) => f.name === "tag")) {
            throw new Error("The field 'tag' should be pluralized to 'tags'.");
          }
          if (!msg?.field.some((f: any) => f.name === "tags")) {
            throw new Error("Field 'tags' not found.");
          }
        },
      },
      {
        id: "repeated_label",
        description: "Field 'tags' uses the 'repeated' keyword.",
        validate: (fds: any) => {
          const file = fds.file.find((f: any) => f.package === "practice");
          const msg = file?.messageType.find((m: any) => m.name === "BlogPost");
          const tags = msg?.field.find((f: any) => f.name === "tags");
          if (tags?.label !== 3) {
            // LABEL_REPEATED = 3
            throw new Error("Field 'tags' must be repeated.");
          }
        },
      },
    ],
  },
  {
    id: 5,
    title: "The Immutable Law",
    guideUrl: "/advanced/#schema-evolution",
    scenario:
      "Backward compatibility is the cornerstone of Protobuf schema design. When fields are deprecated and deleted from a message, you must ensure that their field numbers and names are never reused by future updates.\n\nIf another developer reuses tag number 3 for a new field of a different type, legacy clients still running older stubs in production will attempt to decode the new type as the old type, causing silent data corruption, deserialization crashes, or validation errors. To enforce this protection, we use the 'reserved' keyword.",
    task: "Reserve field number `3` and field name `phone` so they are blocked from being reused in the `UserAccount` message.",
    hint: "Use the `reserved` keyword to block the tag number `3` and the field name `phone` from being reused in the message body. You can declare them using separate `reserved` lines or on a single line.",
    rootMessage: "practice.UserAccount",
    initialCode: `syntax = "proto3";

package practice;

message UserAccount {
  string id = 1;
  string email = 2;
  // The field 'phone' at number 3 was removed. Protect it!
}
`,
    assertions: [
      {
        id: "reserved_number",
        description: "Field number 3 is reserved.",
        validate: (fds: any) => {
          const file = fds.file.find((f: any) => f.package === "practice");
          const msg = file?.messageType.find(
            (m: any) => m.name === "UserAccount",
          );
          if (!msg) throw new Error("UserAccount message not found.");

          const hasReserved3 = msg.reservedRange.some(
            (r: any) => r.start <= 3 && r.end > 3,
          );
          if (!hasReserved3)
            throw new Error(
              "Field number 3 must be reserved. Add 'reserved 3;'",
            );

          if (msg.field.some((f: any) => f.number === 3)) {
            throw new Error(
              "A field is still using tag number 3! Remove it before reserving.",
            );
          }
        },
      },
      {
        id: "reserved_name",
        description: "Field name 'phone' is reserved.",
        validate: (fds: any) => {
          const file = fds.file.find((f: any) => f.package === "practice");
          const msg = file?.messageType.find(
            (m: any) => m.name === "UserAccount",
          );
          if (!msg) throw new Error("UserAccount message not found.");

          const hasReservedPhone = msg.reservedName.includes("phone");
          if (!hasReservedPhone)
            throw new Error(
              "Field name 'phone' must be reserved. Add 'reserved \"phone\";'",
            );

          if (msg.field.some((f: any) => f.name === "phone")) {
            throw new Error(
              "Field name 'phone' is still defined in the message! Remove it before reserving.",
            );
          }
        },
      },
    ],
  },
  {
    id: 6,
    title: "The Illusion of Presence",
    guideUrl: "/advanced/#presence",
    scenario:
      "In proto3, basic types like boolean are omitted from wire serialization if they have their default value (false). This makes it impossible to distinguish between an unset field and a false value. We need explicit presence for the 'is_admin' field.",
    task: "Add explicit field presence tracking to the `is_admin` field.",
    hint: "In proto3, prepending the `optional` keyword to a field enables explicit presence tracking (giving it a nullable behavior on the wire).",
    rootMessage: "practice.UserSession",
    initialCode: `syntax = "proto3";

package practice;

message UserSession {
  string username = 1;
  bool is_admin = 2;
}
`,
    assertions: [
      {
        id: "optional_admin",
        description:
          "Field 'is_admin' uses the 'optional' keyword for presence.",
        validate: (fds: any) => {
          const file = fds.file.find((f: any) => f.package === "practice");
          const msg = file?.messageType.find(
            (m: any) => m.name === "UserSession",
          );
          const isAdmin = msg?.field.find((f: any) => f.name === "is_admin");
          if (!isAdmin) throw new Error("Field 'is_admin' not found.");
          if (!isAdmin.proto3Optional) {
            throw new Error(
              "Field 'is_admin' must have explicit presence. Prepend the 'optional' keyword.",
            );
          }
        },
      },
    ],
  },
  {
    id: 7,
    title: "Mutually Exclusive Reality",
    guideUrl: "/basics/#oneof",
    scenario:
      "A notification targets either a specific user_id or a generic email address, but must never contain both at the same time.",
    task: "Enforce this constraint by grouping `user_id` and `email` inside a oneof block named `identifier`.",
    hint: "Wrap the mutually exclusive fields inside a `oneof identifier { ... }` block. Make sure to keep the field types and numbers on the field declarations inside the block.",
    rootMessage: "practice.NotificationTarget",
    initialCode: `syntax = "proto3";

package practice;

message NotificationTarget {
  string user_id = 1;
  string email = 2;
}
`,
    assertions: [
      {
        id: "oneof_exists",
        description: "A oneof block named 'identifier' is declared.",
        validate: (fds: any) => {
          const file = fds.file.find((f: any) => f.package === "practice");
          const msg = file?.messageType.find(
            (m: any) => m.name === "NotificationTarget",
          );
          if (!msg) throw new Error("NotificationTarget message not found.");
          const oneof = msg.oneofDecl.find((o: any) => o.name === "identifier");
          if (!oneof)
            throw new Error(
              "No oneof declaration named 'identifier' was found.",
            );
        },
      },
      {
        id: "fields_in_oneof",
        description:
          "Both 'user_id' and 'email' fields are members of the 'identifier' oneof.",
        validate: (fds: any) => {
          const file = fds.file.find((f: any) => f.package === "practice");
          const msg = file?.messageType.find(
            (m: any) => m.name === "NotificationTarget",
          );
          const oneofIdx = msg.oneofDecl.findIndex(
            (o: any) => o.name === "identifier",
          );

          const userId = msg.field.find((f: any) => f.name === "user_id");
          const email = msg.field.find((f: any) => f.name === "email");

          if (!userId) throw new Error("Field 'user_id' not found.");
          if (!email) throw new Error("Field 'email' not found.");

          if (userId.oneofIndex !== oneofIdx || userId.proto3Optional) {
            throw new Error(
              "Field 'user_id' is not inside the 'identifier' oneof.",
            );
          }
          if (email.oneofIndex !== oneofIdx || email.proto3Optional) {
            throw new Error(
              "Field 'email' is not inside the 'identifier' oneof.",
            );
          }
        },
      },
    ],
  },
  {
    id: 8,
    title: "The Well-Known Path",
    guideUrl: "/advanced/#imports",
    scenario:
      "We need to track when an event occurred. Storing timestamps as custom integers or strings is error-prone. Standardizing on Protobuf's official Timestamp type is the best practice.",
    task: "Import `google/protobuf/timestamp.proto` and add a `created_at` field of type `google.protobuf.Timestamp` at tag number `2`.",
    hint: "Import Google's timestamp file from the standard library (`google/protobuf/timestamp.proto`) at the top of the schema file. Then declare the field `created_at` using the fully qualified type `google.protobuf.Timestamp`.",
    rootMessage: "practice.EventLog",
    initialCode: `syntax = "proto3";

package practice;

// EventLog tracks generic events
message EventLog {
  string event_name = 1;
}
`,
    assertions: [
      {
        id: "import_wkt",
        description: "Imports 'google/protobuf/timestamp.proto'.",
        validate: (fds: any) => {
          const file = fds.file.find((f: any) => f.package === "practice");
          if (!file) throw new Error("Package 'practice' not declared.");
          const hasImport = file.dependency.includes(
            "google/protobuf/timestamp.proto",
          );
          if (!hasImport)
            throw new Error(
              "Missing import of 'google/protobuf/timestamp.proto'.",
            );
        },
      },
      {
        id: "timestamp_field",
        description:
          "Field 'created_at' of type 'google.protobuf.Timestamp' exists.",
        validate: (fds: any) => {
          const file = fds.file.find((f: any) => f.package === "practice");
          const msg = file?.messageType.find((m: any) => m.name === "EventLog");
          if (!msg) throw new Error("Message 'EventLog' not found.");

          const createdAt = msg.field.find((f: any) => f.name === "created_at");
          if (!createdAt) throw new Error("Field 'created_at' not found.");
          if (createdAt.type !== 11)
            throw new Error("Field 'created_at' must be a message type.");
          if (createdAt.typeName !== ".google.protobuf.Timestamp") {
            throw new Error(
              "Field 'created_at' must be of type 'google.protobuf.Timestamp'. Found: " +
                createdAt.typeName,
            );
          }
          if (createdAt.number !== 2) {
            throw new Error("Field 'created_at' must use tag number 2.");
          }
        },
      },
    ],
  },
];
