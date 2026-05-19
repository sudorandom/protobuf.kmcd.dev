export const INITIAL_PROTO = `edition = "2023";

package demo.v1;

import "buf/validate/validate.proto";

message User {
  string id = 1 [(buf.validate.field).string.uuid = true];
  string name = 2 [(buf.validate.field).string.min_len = 2, (buf.validate.field).string.max_len = 50];
  string email = 3 [(buf.validate.field).string.email = true];
  
  // Numeric data for efficiency demo
  uint32 age = 4 [(buf.validate.field).uint32 = { gte: 18, lt: 120 }];
  float height_cm = 5 [(buf.validate.field).float = { gte: 50, lte: 250 }];
  double weight_kg = 6 [(buf.validate.field).double = { gte: 2, lte: 500 }];
  
  Role role = 7 [(buf.validate.field).enum.defined_only = true];
  Date birth_date = 8;
  User manager = 9;

  enum Role {
    ROLE_UNSPECIFIED = 0;
    ROLE_USER = 1;
    ROLE_ADMIN = 2;
  }
}

message Date {
  int32 year = 1 [(buf.validate.field).int32 = { gte: 1900, lte: 2100 }];
  int32 month = 2 [(buf.validate.field).int32 = { gte: 1, lte: 12 }];
  int32 day = 3 [(buf.validate.field).int32 = { gte: 1, lte: 31 }];
}`;
