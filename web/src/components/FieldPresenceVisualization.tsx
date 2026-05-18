import { useState } from "react";
import { motion } from "framer-motion";
import { CyberPanel } from "./shared/Common";

export const FieldPresenceVisualization = () => {
  const [restartKey] = useState(0);

  const scenarios = [
    {
      id: "standard-default",
      title: "Standard Proto3 Field",
      schema: "int32 count = 1;",
      value: "0 (Default)",
      status: "OMITTED",
      color: "var(--cyber-neon-blue)",
      hex: [],
      labels: [],
      desc: "Standard fields are omitted from the wire if they hold the default value.",
    },
    {
      id: "optional-default",
      title: "Optional Proto3 Field",
      schema: "optional int32 count = 1;",
      value: "0 (Default)",
      status: "SERIALIZED",
      color: "var(--cyber-neon-pink)",
      hex: ["08", "00"],
      labels: ["Tag", "Data"],
      desc: "Optional fields track explicit presence. They are serialized even if set to 0.",
    },
  ];

  return (
    <div className="w-full space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {scenarios.map((s) => (
          <CyberPanel key={s.id} title={s.title.toUpperCase()}>
            <div className="p-6 space-y-6">
              <div className="flex flex-col gap-2">
                <div className="text-[10px] font-mono text-[var(--text-dim)] uppercase tracking-widest">
                  Schema Definition
                </div>
                <div className="bg-[var(--overlay-bg)] p-3 rounded font-mono text-sm border border-[var(--border-light)] text-[var(--cyber-neon-blue)]">
                  {s.schema}
                </div>
              </div>

              <div className="flex justify-between items-end">
                <div className="flex flex-col gap-2">
                  <div className="text-[10px] font-mono text-[var(--text-dim)] uppercase tracking-widest">
                    Assigned Value
                  </div>
                  <div className="text-xl font-cyber font-bold text-[var(--text-color)]">
                    {s.value}
                  </div>
                </div>
                <div
                  className={`px-3 py-1 rounded-full text-[10px] font-cyber font-bold tracking-widest border ${
                    s.status === "OMITTED"
                      ? "border-[var(--text-dim)]/30 text-[var(--text-dim)] bg-[var(--text-dim)]/5"
                      : "border-[var(--cyber-neon-green)]/30 text-[var(--cyber-neon-green)] bg-[var(--cyber-neon-green)]/10 shadow-[0_0_10px_rgba(0,255,0,0.1)]"
                  }`}
                >
                  {s.status}
                </div>
              </div>

              <div className="pt-6 border-t border-[var(--border-light)]/30 space-y-4">
                <div className="text-[10px] font-mono text-[var(--text-dim)] uppercase tracking-widest">
                  Wire Representation
                </div>
                <div className="h-20 flex items-center justify-center bg-[var(--section-bg-dark)]/50 rounded-lg border border-dashed border-[var(--border-light)]">
                  {s.hex.length > 0 ? (
                    <div className="flex gap-3" key={restartKey}>
                      {s.hex.map((h, j) => (
                        <motion.div
                          key={j}
                          initial={{ opacity: 0, scale: 0.8 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{ delay: j * 0.1 }}
                          className="flex flex-col items-center gap-2"
                        >
                          <div
                            className={`w-12 h-10 flex items-center justify-center rounded font-mono font-bold text-sm border ${
                              s.labels[j] === "Tag"
                                ? "border-[var(--cyber-neon-blue)]/40 bg-[var(--cyber-neon-blue)]/10 text-[var(--cyber-neon-blue)]"
                                : "border-[var(--cyber-neon-green)]/40 bg-[var(--cyber-neon-green)]/10 text-[var(--cyber-neon-green)]"
                            }`}
                          >
                            {h}
                          </div>
                          <span className="text-[10px] font-mono text-[var(--text-dim)] uppercase">
                            {s.labels[j]}
                          </span>
                        </motion.div>
                      ))}
                    </div>
                  ) : (
                    <motion.span
                      key={restartKey + "empty"}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="text-sm font-mono text-[var(--text-dim)] uppercase italic"
                    >
                      (Zero Bytes)
                    </motion.span>
                  )}
                </div>
              </div>

              <p className="text-sm text-[var(--text-dim)] leading-relaxed italic">
                {s.desc}
              </p>
            </div>
          </CyberPanel>
        ))}
      </div>
    </div>
  );
};
