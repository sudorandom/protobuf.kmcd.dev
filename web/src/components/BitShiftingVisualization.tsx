import { motion } from "framer-motion";

export const BitShiftingVisualization = () => {
  const BIT_WIDTH = 40;
  const BIT_HEIGHT = 45;
  const GAP = 4;

  const originalBits = [0, 0, 0, 0, 0, 0, 0, 1];

  const duration = 6;
  const repeatDelay = 2;
  const shiftStartTime = 0.4;
  const shiftEndTime = 0.55;

  return (
    <div className="w-full max-w-4xl mx-auto my-4 overflow-hidden flex flex-col items-center gap-8">
      <svg
        viewBox="0 0 600 220"
        className="w-full h-auto max-w-2xl font-mono"
        style={{ color: "var(--text-color)" }}
      >
        <defs>
          <filter
            id="glow-shifting"
            x="-20%"
            y="-20%"
            width="140%"
            height="140%"
          >
            <feGaussianBlur stdDeviation="3" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
        </defs>

        {/* Static Header */}
        <g transform="translate(300, 25)">
          <text
            textAnchor="middle"
            fill="var(--text-dim)"
            fontSize="10"
            className="font-cyber font-bold uppercase tracking-widest"
          >
            Bit Shifting Field #1
          </text>
        </g>

        {/* Main Bit Row */}
        <g transform="translate(80, 60)">
          {/* Background Slots for the Byte */}
          {[...Array(8)].map((_, i) => (
            <rect
              key={`slot-${i}`}
              x={i * (BIT_WIDTH + GAP)}
              y={0}
              width={BIT_WIDTH}
              height={BIT_HEIGHT}
              rx="3"
              fill="white"
              fillOpacity="0.02"
              stroke="var(--border-light)"
              strokeWidth="1"
              strokeDasharray="2,2"
            />
          ))}

          {/* Animating Bits */}
          {originalBits.map((bit, i) => (
            <g
              key={`bit-pos-${i}`}
              transform={`translate(${i * (BIT_WIDTH + GAP)}, 0)`}
            >
              <motion.g
                animate={{
                  x: [0, 0, -(BIT_WIDTH + GAP) * 3, -(BIT_WIDTH + GAP) * 3],
                  opacity: [1, 1, i < 3 ? 0 : 1, i < 3 ? 0 : 1],
                }}
                transition={{
                  duration,
                  repeat: Infinity,
                  repeatDelay,
                  times: [0, shiftStartTime, shiftEndTime, 1],
                }}
              >
                <rect
                  width={BIT_WIDTH}
                  height={BIT_HEIGHT}
                  rx="3"
                  fill="var(--cyber-neon-blue)"
                  fillOpacity="0.1"
                  stroke="var(--cyber-neon-blue)"
                  strokeWidth="1.5"
                />
                <text
                  x={BIT_WIDTH / 2}
                  y={BIT_HEIGHT / 2 + 6}
                  textAnchor="middle"
                  fill="var(--cyber-neon-blue)"
                  fontSize="18"
                  className="font-bold"
                >
                  {bit}
                </text>
              </motion.g>
            </g>
          ))}

          {/* Incoming Zeroes */}
          {[0, 1, 2].map((i) => (
            <g
              key={`wire-slot-${i}`}
              transform={`translate(${(5 + i) * (BIT_WIDTH + GAP)}, 0)`}
            >
              <motion.g
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{
                  opacity: [0, 0, 1, 1],
                  scale: [0.8, 0.8, 1, 1],
                  x: [(BIT_WIDTH + GAP) * 3, (BIT_WIDTH + GAP) * 3, 0, 0],
                }}
                transition={{
                  duration,
                  repeat: Infinity,
                  repeatDelay,
                  times: [0, shiftStartTime, shiftEndTime, 1],
                }}
              >
                <rect
                  width={BIT_WIDTH}
                  height={BIT_HEIGHT}
                  rx="3"
                  fill="var(--cyber-neon-pink)"
                  fillOpacity="0.1"
                  stroke="var(--cyber-neon-pink)"
                  strokeWidth="1.5"
                  strokeDasharray="4,2"
                />
                <text
                  x={BIT_WIDTH / 2}
                  y={BIT_HEIGHT / 2 + 6}
                  textAnchor="middle"
                  fill="var(--cyber-neon-pink)"
                  fontSize="18"
                  className="font-bold"
                >
                  0
                </text>
              </motion.g>
            </g>
          ))}

          {/* Shift Action Operator (To the right) */}
          <g
            transform={`translate(${8 * (BIT_WIDTH + GAP) + 20}, ${BIT_HEIGHT / 2})`}
          >
            <motion.text
              animate={{
                opacity: [0.2, 0.2, 1, 1, 0.2],
                x: [0, 0, 5, 5, 0],
                scale: [1, 1, 1.2, 1.2, 1],
              }}
              transition={{
                duration,
                repeat: Infinity,
                repeatDelay,
                times: [
                  0,
                  shiftStartTime - 0.1,
                  shiftStartTime,
                  shiftEndTime,
                  shiftEndTime + 0.1,
                ],
              }}
              textAnchor="start"
              fill="var(--cyber-neon-pink)"
              fontSize="20"
              className="font-cyber font-bold"
              style={{ dominantBaseline: "central" }}
            >
              {"<< 3"}
            </motion.text>
          </g>
        </g>

        {/* Binary Summary Display */}
        <g transform="translate(300, 150)">
          {/* Always show original value */}
          <g>
            <text
              textAnchor="middle"
              fill="var(--cyber-neon-blue)"
              fontSize="14"
              className="font-bold uppercase tracking-widest"
            >
              VALUE: 1 (00000001)
            </text>
          </g>

          {/* Reveal shifted value after shift is done */}
          <g transform="translate(0, 35)">
            <motion.g
              animate={{
                opacity: [0, 0, 1, 1],
                y: [5, 5, 0, 0],
              }}
              transition={{
                duration,
                repeat: Infinity,
                repeatDelay,
                times: [0, shiftEndTime, shiftEndTime + 0.05, 1],
              }}
            >
              <text
                textAnchor="middle"
                fill="var(--cyber-neon-pink)"
                fontSize="14"
                className="font-bold uppercase tracking-widest"
              >
                SHIFTED VALUE: 8 (00001000)
              </text>
            </motion.g>
          </g>
        </g>
      </svg>
    </div>
  );
};

export default BitShiftingVisualization;
