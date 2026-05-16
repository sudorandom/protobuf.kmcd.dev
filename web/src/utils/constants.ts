export const VALIDATION_PROTO = `edition = "2023";

package demo.v1;

import "buf/validate/validate.proto";

message User {
  string id = 1 [(buf.validate.field).string.uuid = true];
  string name = 2 [(buf.validate.field).string.min_len = 1];
  string email = 3 [(buf.validate.field).string.email = true];
  
  uint32 age = 4 [(buf.validate.field).uint32.lt = 150];
  
  Role role = 7;
  Date birth_date = 8;

  enum Role {
    ROLE_UNSPECIFIED = 0;
    ROLE_USER = 1;
    ROLE_ADMIN = 2;
  }
}

message Date {
  int32 year = 1 [(buf.validate.field).int32 = {gte: 1900, lte: 2100}];
  int32 month = 2 [(buf.validate.field).int32 = {gte: 1, lte: 12}];
  int32 day = 3 [(buf.validate.field).int32 = {gte: 1, lte: 31}];
}`;

export const DESCRIPTOR_PROTO = `edition = "2023";

package demo.v1;

import "buf/validate/validate.proto";

message User {
  string id = 1 [json_name = "uid"];
  string name = 2;
  uint32 age = 3 [(buf.validate.field).uint32.lt = 150];
  Role role = 4;

  enum Role {
    ROLE_UNSPECIFIED = 0;
    ROLE_USER = 1;
    ROLE_ADMIN = 2;
  }
}`;

export const SIZE_EXAMPLES = {
  BASIC: {
    id: "550e8400-e29b-41d4-a716-446655440000",
    name: "Hiro Protagonist",
    email: "hiro@metaverse.com",
    age: 24,
    heightCm: 175.5,
    weightKg: 70.2,
    role: 2,
    birthDate: { year: 1992, month: 5, day: 22 },
  },
  "LARGE PAYLOAD": {
    id: "user-ceo",
    name: "CEO",
    email: "ceo@megacorp.com",
    age: 65,
    heightCm: 180.0,
    weightKg: 80.0,
    role: 2,
    birthDate: { year: 1959, month: 1, day: 1 },
    manager: {
      id: "user-vp",
      name: "VP of Engineering",
      email: "vp@megacorp.com",
      age: 50,
      heightCm: 170.0,
      weightKg: 75.0,
      role: 2,
      birthDate: { year: 1974, month: 2, day: 2 },
      manager: {
        id: "user-director",
        name: "Director of Engineering",
        email: "director@megacorp.com",
        age: 40,
        heightCm: 172.0,
        weightKg: 72.0,
        role: 2,
        birthDate: { year: 1984, month: 3, day: 3 },
        manager: {
          id: "user-manager",
          name: "Engineering Manager",
          email: "em@megacorp.com",
          age: 35,
          heightCm: 165.0,
          weightKg: 65.0,
          role: 2,
          birthDate: { year: 1989, month: 4, day: 4 },
          manager: {
            id: "user-ic",
            name: "Software Engineer",
            email: "swe@megacorp.com",
            age: 28,
            heightCm: 175.0,
            weightKg: 70.0,
            role: 1,
            birthDate: { year: 1996, month: 5, day: 5 },
          },
        },
      },
    },
  },
  MINIMAL: {
    id: "550e8400-e29b-41d4-a716-446655440000",
    name: "Recursive Node",
    email: "node@cluster.local",
    age: 1,
    role: 0,
  },
};
