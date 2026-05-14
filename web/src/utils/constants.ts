export const INITIAL_PROTO = `edition = "2023";\n\npackage demo.v1;\n\nimport "buf/validate/validate.proto";\n\nmessage User {\n  string id = 1 [(buf.validate.field).string.uuid = true];\n  string name = 2 [(buf.validate.field).string.min_len = 1];\n  string email = 3 [(buf.validate.field).string.email = true];\n  \n  // Numeric data for efficiency demo\n  uint32 age = 4 [(buf.validate.field).uint32.lt = 150];\n  float height_cm = 5 [(buf.validate.field).float = {gte: 0, lte: 500}];\n  double weight_kg = 6 [(buf.validate.field).double = {gte: 0, lte: 2000}];\n  \n  Role role = 7;\n  Date birth_date = 8;\n  User manager = 9;\n\n  enum Role {\n    ROLE_UNSPECIFIED = 0;\n    ROLE_USER = 1;\n    ROLE_ADMIN = 2;\n  }\n}\n\nmessage Date {\n  int32 year = 1 [(buf.validate.field).int32 = {gte: 1900, lte: 2100}];\n  int32 month = 2 [(buf.validate.field).int32 = {gte: 1, lte: 12}];\n  int32 day = 3 [(buf.validate.field).int32 = {gte: 1, lte: 31}];\n}`;

export const SIZE_EXAMPLES = {
  BASIC: {
    id: "550e8400-e29b-41d4-a716-446655440000",
    name: "Hiro Protagonist",
    email: "hiro@metaverse.com",
    age: 24,
    heightCm: 175.5,
    weightKg: 70.2,
    role: 2,
    birthDate: { year: 1992, month: 5, day: 22 }
  },
  'LARGE PAYLOAD': {
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
            birthDate: { year: 1996, month: 5, day: 5 }
          }
        }
      }
    }
  },
  MINIMAL: {
    id: "550e8400-e29b-41d4-a716-446655440000",
    name: "Recursive Node",
    email: "node@cluster.local",
    age: 1,
    role: 0
  }
};
