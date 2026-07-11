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
  guideLabel?: string;
}

export const EXERCISES: ExerciseDef[] = [
  {
    id: 1,
    title: "Field Numbers",
    guideUrl: "/basics/#numbers",
    guideLabel: "Basics > Field Numbers",
    scenario:
      "Every protobuf field needs a numeric tag. The tag is what appears in the binary payload; the field name is for generated code and JSON.\n\nA valid field declaration looks like this:\n\n```protobuf\nmessage Example {\n  string some_field = 1;\n}\n```\n\nThis schema defines `UserProfile`, but its fields are missing tag numbers.",
    task: "Assign unique field numbers to `id`, `name`, and `email` so the schema compiles.",
    hint: "Use `= number;` before the semicolon. Each field in the message needs a different number.",
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
    title: "Naming",
    scenario:
      "Generated APIs are easier to use when schemas follow protobuf naming conventions. Message names use PascalCase. Field names use snake_case.\n\nThis schema uses names that will produce awkward generated APIs.",
    task: "Rename the message to `UserProfile` and the fields to `user_id`, `email_address`, and `profile_image`.",
    hint: "Use `PascalCase` for message names and `snake_case` for field names.",
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
    title: "Integer Types",
    guideUrl: "/basics/#guidelines-for-integers",
    guideLabel: "Basics > Guidelines for Integers",
    scenario:
      "Numeric types affect both meaning and wire size. Plain `int32` and `int64` are inefficient for negative values. `sint32` and `sint64` use ZigZag encoding for signed values. Counts that cannot be negative should use unsigned types.",
    task: "Change `ledger_balance` to `sint64`, and change `hardware_counter` to `uint32` or `uint64`.",
    hint: "`ledger_balance` can go negative, so use `sint64`. `hardware_counter` cannot, so use an unsigned integer type.",
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
    title: "Repeated Fields",
    guideUrl: "/basics/#repeated",
    guideLabel: "Basics > Repeated Fields",
    scenario:
      "Use `repeated` for lists. Repeated field names are usually plural, because generated code exposes them as collections.",
    task: "Change `tag` into a repeated string field named `tags`.",
    hint: "Use `repeated string tags = 3;`.",
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
    title: "Reserved Fields",
    guideUrl: "/advanced/#schema-evolution",
    guideLabel: "Advanced > Schema Evolution",
    scenario:
      "When a field is removed from a message, its number and name should not be reused. Reserving them prevents future schema edits from accidentally colliding with old serialized data.",
    task: "Reserve field number `3` and field name `phone` in `UserAccount`.",
    hint: 'Use `reserved 3;` and `reserved "phone";`, or put both reservations in valid reserved declarations.',
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
    title: "Field Presence",
    guideUrl: "/advanced/#presence",
    guideLabel: "Advanced > Field Presence",
    scenario:
      "In proto3, a scalar field with its default value is usually omitted from the wire. For a boolean, that means a receiver cannot distinguish `false` from not set unless the field has explicit presence.",
    task: "Add explicit field presence tracking to the `is_admin` field.",
    hint: "In proto3, add `optional` before the field type.",
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
    title: "Oneof",
    guideUrl: "/basics/#oneof",
    guideLabel: "Basics > Oneof",
    scenario:
      "A notification target can be identified by either a `user_id` or an `email`, but not both.",
    task: "Group `user_id` and `email` inside a `oneof` block named `identifier`.",
    hint: "Wrap the two field declarations in `oneof identifier { ... }`.",
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
    title: "Well-Known Types",
    guideUrl: "/basics/#types",
    guideLabel: "Basics > Types",
    scenario:
      "This event needs a creation time. Instead of inventing a string or integer convention, use protobuf's standard `Timestamp` message.",
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
