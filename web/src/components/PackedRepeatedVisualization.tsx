import { useState } from "react";
import { motion } from "framer-motion";
import { CyberPanel } from "./shared/Common";

export const PackedRepeatedVisualization = () => {
  const [restartKey] = useState(0);

  const scenarios = [
    {
      id: "non-packed",
      title: "Non-Packed (Old Way)",
      schema: "repeated int32 ids = 1 [packed=false];",
      values: [1, 2, 3],
      color: "var(--cyber-neon-blue)",
      hexGroups: [
        { hex: ["08", "01"], labels: ["Tag", "Val"] },
        { hex: ["08", "02"], labels: ["Tag", "Val"] },
        { hex: ["08", "03"], labels: ["Tag", "Val"] },
      ],
      desc: "Each element repeats the field tag. High overhead for many small elements.",
    },
    {
      id: "packed",
      title: "Packed (Default in Proto3)",
      schema: "repeated int32 ids = 1;",
      values: [1, 2, 3],
      color: "var(--cyber-neon-green)",
      hexGroups: [
        { hex: ["0a"], labels: ["Tag"] },
        { hex: ["03"], labels: ["Len"] },
        { hex: ["01", "02", "03"], labels: ["Data", "Data", "Data"] },
      ],
      desc: "Elements are concatenated into a single length-delimited record. One tag for the whole set.",
    },
  ];

  return (
    <div className="w-full space-y-8">
      <div className="grid grid-cols-1 gap-12">
        {scenarios.map((s) => (
          <CyberPanel key={s.id} title={s.title.toUpperCase()}>
            <div className="p-6 space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
                <div className="space-y-4">
                  <div className="flex flex-col gap-2">
                    <div className="text-[10px] font-mono text-[var(--text-dim)] uppercase tracking-widest">
                      Schema
                    </div>
                    <div className="bg-[var(--overlay-bg)] p-3 rounded font-mono text-sm border border-[var(--border-light)] text-[var(--cyber-neon-blue)]">
                      {s.schema}
                    </div>
                  </div>
                  <div className="flex flex-col gap-2">
                    <div className="text-[10px] font-mono text-[var(--text-dim)] uppercase tracking-widest">
                      Values
                    </div>
                    <div className="text-xl font-cyber font-bold text-[var(--text-color)]">
                      [{s.values.join(", ")}]
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="text-[10px] font-mono text-[var(--text-dim)] uppercase tracking-widest">
                    Wire Layout
                  </div>
                  <div className="flex flex-wrap gap-x-6 gap-y-8 bg-[var(--section-bg-dark)]/50 p-6 rounded-xl border border-[var(--border-light)] min-h-[100px] items-center justify-center">
                    {s.hexGroups.map((group, gi) => (
                      <div
                        key={gi}
                        className="flex gap-2 items-center"
                        style={{ color: s.color }}
                      >
                        {group.hex.map((h, hi) => (
                          <motion.div
                            key={gi + "-" + hi + restartKey}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: (gi * 3 + hi) * 0.05 }}
                            className="flex flex-col items-center gap-1"
                          >
                            <div
                              className={`w-10 h-10 flex items-center justify-center rounded font-mono font-bold text-xs border ${
                                group.labels[hi] === "Tag"
                                  ? "border-[var(--cyber-neon-blue)]/40 bg-[var(--cyber-neon-blue)]/10 text-[var(--cyber-neon-blue)]"
                                  : group.labels[hi] === "Len"
                                    ? "border-[var(--cyber-neon-yellow)]/40 bg-[var(--cyber-neon-yellow)]/10 text-[var(--cyber-neon-yellow)]"
                                    : "border-[var(--cyber-neon-green)]/40 bg-[var(--cyber-neon-green)]/10 text-[var(--cyber-neon-green)]"
                              }`}
                            >
                              {h}
                            </div>
                            <span className="text-[9px] font-mono text-[var(--text-dim)] uppercase">
                              {group.labels[hi]}
                            </span>
                          </motion.div>
                        ))}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              <p className="text-sm text-[var(--text-dim)] leading-relaxed italic border-t border-[var(--border-light)]/30 pt-4">
                {s.desc}
              </p>
            </div>
          </CyberPanel>
        ))}
      </div>
    </div>
  );
};
