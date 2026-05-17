import { useState } from "react";
import { motion } from "framer-motion";
import { RefreshCcw } from "lucide-react";

export const MultiFieldEncoding = () => {
  const [restartKey, setRestartKey] = useState(0);

  const fields = [
    {
      id: "name",
      label: "string name = 1",
      value: '"Alice"',
      color: "var(--cyber-neon-pink)",
      hex: ["0a", "05", "41 6c 69 63 65"],
      labels: ["Tag", "Len", "Data"],
    },
    {
      id: "id",
      label: "int32 id = 2",
      value: "150",
      color: "var(--cyber-neon-blue)",
      hex: ["10", "96 01"],
      labels: ["Tag", "Data"],
    },
    {
      id: "score",
      label: "float score = 3",
      value: "95.5",
      color: "var(--cyber-neon-green)",
      hex: ["1d", "00 00 bf 42"],
      labels: ["Tag", "Data"],
    },
  ];

  return (
    <div
      className="w-full max-w-5xl mx-auto my-16 overflow-hidden flex flex-col items-center gap-2 group cursor-pointer"
      onClick={() => setRestartKey((prev) => prev + 1)}
      title="Click to restart animation"
    >
      <div className="opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-2 text-[var(--cyber-neon-blue)] font-cyber text-xs uppercase tracking-widest">
        <RefreshCcw className="w-3 h-3" /> Click to Restart
      </div>
      <div className="w-full flex justify-center bg-[var(--section-bg-dark)]/30 rounded-2xl border border-[var(--border-light)] p-8">
        <svg
          key={restartKey}
          viewBox="0 0 900 480"
          className="w-full h-auto max-w-full font-mono"
          style={{ color: "var(--text-color)" }}
        >
          <defs>
            <filter
              id="glow-small"
              x="-20%"
              y="-20%"
              width="140%"
              height="140%"
            >
              <feGaussianBlur stdDeviation="2" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
          </defs>

          {/* Labels */}
          <text
            x="50"
            y="40"
            fill="var(--text-dim)"
            fontSize="12"
            letterSpacing="2"
            className="uppercase font-bold"
          >
            Protobuf Fields
          </text>
          <text
            x="550"
            y="40"
            fill="var(--text-dim)"
            fontSize="12"
            letterSpacing="2"
            className="uppercase font-bold"
          >
            Binary Stream (Hex)
          </text>

          {fields.map((field, i) => (
            <g key={field.id} transform={`translate(0, ${70 + i * 130})`}>
              {/* Field Box */}
              <motion.g
                initial={{ opacity: 0, x: -30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: i * 0.2 }}
              >
                <rect
                  x="50"
                  y="10"
                  width="280"
                  height="80"
                  rx="8"
                  fill="var(--panel-bg)"
                  stroke={field.color}
                  strokeWidth="1"
                  opacity="0.8"
                />
                <text
                  x="70"
                  y="40"
                  fill={field.color}
                  fontSize="14"
                  className="font-bold"
                >
                  {field.label}
                </text>
                <text x="70" y="65" fill="var(--text-color)" fontSize="14">
                  Value: {field.value}
                </text>
              </motion.g>

              {/* Connection Arrow */}
              <motion.path
                d="M 330 50 L 520 50"
                fill="none"
                stroke={field.color}
                strokeWidth="2"
                strokeDasharray="4,4"
                initial={{ pathLength: 0, opacity: 0 }}
                animate={{ pathLength: 1, opacity: 0.4 }}
                transition={{ duration: 0.8, delay: 0.5 + i * 0.2 }}
              />

              {/* Hex Blocks */}
              <g transform="translate(530, 10)">
                {field.hex.map((h, j) => {
                  // Adjust widths for longer hex strings
                  const width = h.length > 2 ? h.length * 10 + 20 : 60;
                  let currentX = 0;
                  for (let k = 0; k < j; k++) {
                    const prevH = field.hex[k];
                    currentX +=
                      (prevH.length > 2 ? prevH.length * 10 + 20 : 60) + 10;
                  }

                  return (
                    <motion.g
                      key={j}
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{
                        duration: 0.4,
                        delay: 0.8 + i * 0.2 + j * 0.1,
                      }}
                    >
                      <rect
                        x={currentX}
                        y="15"
                        width={width}
                        height="40"
                        rx="4"
                        fill={
                          field.labels[j] === "Tag"
                            ? "var(--cyber-neon-blue)"
                            : field.labels[j] === "Len"
                              ? "var(--cyber-neon-yellow)"
                              : "var(--cyber-neon-green)"
                        }
                        fillOpacity="0.15"
                        stroke={
                          field.labels[j] === "Tag"
                            ? "var(--cyber-neon-blue)"
                            : field.labels[j] === "Len"
                              ? "var(--cyber-neon-yellow)"
                              : "var(--cyber-neon-green)"
                        }
                        strokeWidth="1"
                      />
                      <text
                        x={currentX + width / 2}
                        y="40"
                        textAnchor="middle"
                        fill={
                          field.labels[j] === "Tag"
                            ? "var(--cyber-neon-blue)"
                            : field.labels[j] === "Len"
                              ? "var(--cyber-neon-yellow)"
                              : "var(--cyber-neon-green)"
                        }
                        fontSize="14"
                        className="font-bold"
                      >
                        {h}
                      </text>
                      <text
                        x={currentX + width / 2}
                        y="75"
                        textAnchor="middle"
                        fill="var(--text-dim)"
                        fontSize="12"
                        className="uppercase tracking-tighter"
                      >
                        {field.labels[j]}
                      </text>
                    </motion.g>
                  );
                })}
              </g>
            </g>
          ))}

          {/* Legend */}
          <g transform="translate(50, 450)">
            <circle cx="0" cy="0" r="4" fill="var(--cyber-neon-blue)" />
            <text
              x="12"
              y="4"
              fill="var(--text-dim)"
              fontSize="12"
              className="uppercase tracking-widest"
            >
              Field Tag
            </text>

            <circle cx="120" cy="0" r="4" fill="var(--cyber-neon-yellow)" />
            <text
              x="132"
              y="4"
              fill="var(--text-dim)"
              fontSize="12"
              className="uppercase tracking-widest"
            >
              Length Prefix
            </text>

            <circle cx="260" cy="0" r="4" fill="var(--cyber-neon-green)" />
            <text
              x="272"
              y="4"
              fill="var(--text-dim)"
              fontSize="12"
              className="uppercase tracking-widest"
            >
              Value Payload
            </text>
          </g>
        </svg>
      </div>
    </div>
  );
};

export default MultiFieldEncoding;
