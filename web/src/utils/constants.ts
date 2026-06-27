import validationProto from "../proto/validation.proto?raw";
import descriptorProto from "../proto/descriptor.proto?raw";

export const APP_ROUTES = [
  "intro",
  "basics",
  "advanced",
  "efficiency",
  "binary",
  "ecosystem",
  "conclusion",
] as const;

export const VALIDATION_PROTO = validationProto;
export const DESCRIPTOR_PROTO = descriptorProto;

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
  LARGE: {
    id: "550e8400-e29b-41d4-a716-446655440001",
    name: "CEO",
    email: "ceo@megacorp.com",
    age: 65,
    heightCm: 180.0,
    weightKg: 80.0,
    role: 2,
    birthDate: { year: 1959, month: 1, day: 1 },
    manager: {
      id: "550e8400-e29b-41d4-a716-446655440002",
      name: "VP of Engineering",
      email: "vp@megacorp.com",
      age: 50,
      heightCm: 170.0,
      weightKg: 75.0,
      role: 2,
      birthDate: { year: 1974, month: 2, day: 2 },
      manager: {
        id: "550e8400-e29b-41d4-a716-446655440003",
        name: "Director of Engineering",
        email: "director@megacorp.com",
        age: 40,
        heightCm: 172.0,
        weightKg: 72.0,
        role: 2,
        birthDate: { year: 1984, month: 3, day: 3 },
        manager: {
          id: "550e8400-e29b-41d4-a716-446655440004",
          name: "Engineering Manager",
          email: "em@megacorp.com",
          age: 35,
          heightCm: 165.0,
          weightKg: 65.0,
          role: 2,
          birthDate: { year: 1989, month: 4, day: 4 },
          manager: {
            id: "550e8400-e29b-41d4-a716-446655440005",
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
    age: 18,
    role: 0,
  },
};
