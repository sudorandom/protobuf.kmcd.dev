import { useMemo } from "react";
import { CyberPanel, SyntaxHighlighter } from "./shared/Common";
import { create, toJsonString, toBinary } from "@bufbuild/protobuf";
import { UserSchema } from "../gen/demo/v1/user_pb";

export const ConsoleMock = () => {
  const output = useMemo(() => {
    try {
      const user = create(UserSchema, {
        id: "usr_123",
        username: "cyber_ninja",
        isActive: true,
      });

      const jsonStr = toJsonString(UserSchema, user, { prettySpaces: 2 });
      const bin = toBinary(UserSchema, user);

      const lines = [
        `> import { create, toJsonString, toBinary } from "@bufbuild/protobuf";`,
        `> import { UserSchema } from "./gen/demo/v1/user_pb";`,
        `>`,
        `> const user = create(UserSchema, {`,
        `    id: "usr_123",`,
        `    username: "cyber_ninja",`,
        `    isActive: true,`,
        `  });`,
        `>`,
        `> console.log(user);`,
        `{ id: 'usr_123', username: 'cyber_ninja', isActive: true }`,
        `>`,
        `> console.log(toJsonString(UserSchema, user, { prettySpaces: 2 }));`,
        jsonStr,
        `>`,
        `> const bytes = toBinary(UserSchema, user);`,
        `> console.log(bytes);`,
        `Uint8Array(${bin.length}) [ ${Array.from(bin).join(", ")} ]`,
      ];

      return lines.join("\n");
    } catch (e) {
      return `Error: ${e}`;
    }
  }, []);

  return (
    <CyberPanel title="4. USE GENERATED CODE (JS CONSOLE)">
      <div className="p-4 bg-[var(--section-bg-dark)] font-mono text-sm overflow-x-auto text-[var(--cyber-neon-green)]">
        <SyntaxHighlighter language="typescript" code={output} wrap={false} />
      </div>
    </CyberPanel>
  );
};
