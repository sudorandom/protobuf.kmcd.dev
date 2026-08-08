import { getExtension, hasExtension } from "@bufbuild/protobuf";
import type { FieldOptions } from "@bufbuild/protobuf/wkt";
import { field as validateField } from "../gen/buf/validate/validate_pb";

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
      "Every field needs a numeric tag. That number is what goes on the wire; the name is only for generated code and JSON. These fields are missing theirs.",
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
      "Convention is PascalCase for messages, snake_case for fields. This schema follows neither, and the generated API will show it.",
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
      "Integer choice affects wire size. `int32`/`int64` waste bytes on negatives; `sint32`/`sint64` ZigZag-encode them. Values that never go negative should be unsigned.",
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
      "Removing a field frees its number and name for reuse, and reuse silently misreads old data. `reserved` blocks that.",
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
      "In proto3 a scalar at its default value is omitted from the wire, so a receiver cannot tell `false` from unset. Explicit presence fixes that.",
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
      "This event needs a creation time. Rather than inventing a string or integer convention, use the standard `Timestamp`.",
    task: "Import `google/protobuf/timestamp.proto` and add a `created_at` field of type `google.protobuf.Timestamp` at tag number `2`.",
    hint: "Add the import at the top, then use the fully qualified type: `google.protobuf.Timestamp created_at = 2;`",
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
  {
    id: 9,
    title: "Schema-Level Validation",
    guideUrl: "/validation/",
    guideLabel: "Validation",
    scenario:
      "Types stop at `string`; they cannot say which strings are valid. protovalidate puts those rules in the schema as options, so every language enforces the same ones.",
    task: "Import `buf/validate/validate.proto`, require `email` to be a valid email address, and require `age` to be at least 18.",
    hint: "Rules go in field options: `[(buf.validate.field).string.email = true]` and `[(buf.validate.field).uint32.gte = 18]`.",
    rootMessage: "practice.Signup",
    initialCode: `syntax = "proto3";

package practice;

// Signup is submitted when a new account is created
message Signup {
  string email = 1;
  uint32 age = 2;
}
`,
    assertions: [
      {
        id: "import_protovalidate",
        description: "Imports 'buf/validate/validate.proto'.",
        validate: (fds: any) => {
          const file = fds.file.find((f: any) => f.package === "practice");
          if (!file) throw new Error("Package 'practice' not declared.");
          if (!file.dependency.includes("buf/validate/validate.proto")) {
            throw new Error("Missing import of 'buf/validate/validate.proto'.");
          }
        },
      },
      {
        id: "email_rule",
        description: "Field 'email' requires a valid email address.",
        validate: (fds: any) => {
          const rules = getFieldRules(fds, "email");
          if (rules.type.case !== "string") {
            throw new Error(
              "Field 'email' needs a string rule, e.g. (buf.validate.field).string.email.",
            );
          }
          const wellKnown = rules.type.value.wellKnown;
          if (wellKnown?.case !== "email" || wellKnown.value !== true) {
            throw new Error(
              "Set '(buf.validate.field).string.email = true' on 'email'.",
            );
          }
        },
      },
      {
        id: "age_rule",
        description: "Field 'age' must be at least 18.",
        validate: (fds: any) => {
          const rules = getFieldRules(fds, "age");
          if (rules.type.case !== "uint32") {
            throw new Error(
              "Field 'age' needs a uint32 rule, e.g. (buf.validate.field).uint32.gte.",
            );
          }
          const greaterThan = rules.type.value.greaterThan;
          if (greaterThan?.case !== "gte") {
            throw new Error(
              "Use 'gte' on 'age' so that 18 itself is allowed. 'gt' would require 19.",
            );
          }
          if (Number(greaterThan.value) !== 18) {
            throw new Error(
              `Expected '(buf.validate.field).uint32.gte = 18' on 'age'. Found ${greaterThan.value}.`,
            );
          }
        },
      },
    ],
  },
];

// getFieldRules pulls the buf.validate.field extension off a field in the
// practice message. The WASM compiler hands back the extension as unknown
// bytes on FieldOptions, which protobuf-es decodes on demand.
function getFieldRules(fds: any, fieldName: string) {
  const file = fds.file.find((f: any) => f.package === "practice");
  const msg = file?.messageType.find((m: any) => m.name === "Signup");
  if (!msg) throw new Error("Message 'Signup' not found.");

  const field = msg.field.find((f: any) => f.name === fieldName);
  if (!field) throw new Error(`Field '${fieldName}' not found.`);

  const options = field.options as FieldOptions | undefined;
  if (!options || !hasExtension(options, validateField)) {
    throw new Error(`Field '${fieldName}' has no (buf.validate.field) rules.`);
  }
  return getExtension(options, validateField);
}
