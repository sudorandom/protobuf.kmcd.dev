import { motion } from "framer-motion";

export const MemoryLayoutVisualization = () => {
  const highByte = [0, 0, 0, 0, 0, 0, 1, 1];
  const lowByte = [1, 1, 1, 0, 1, 0, 0, 0];

  const BIT_WIDTH = 35;
  const BIT_HEIGHT = 45;
  const GAP = 4;
  const BYTE_GAP = 20;

  const renderByte = (
    bits: number[],
    startX: number,
    startY: number,
    color: string,
    powerOffset: number,
  ) => {
    return bits.map((bit, i) => {
      const x = startX + i * (BIT_WIDTH + GAP);
      return (
        <g key={i}>
          <rect
            x={x}
            y={startY}
            width={BIT_WIDTH}
            height={BIT_HEIGHT}
            rx="2"
            fill={color}
            fillOpacity="0.05"
            stroke={color}
            strokeOpacity="0.3"
            strokeWidth="1"
          />
          <text
            x={x + BIT_WIDTH / 2}
            y={startY + BIT_HEIGHT / 2 + 6}
            textAnchor="middle"
            fill={color}
            fontSize="18"
            className="font-mono"
          >
            {bit}
          </text>
          <text
            x={x + BIT_WIDTH / 2}
            y={startY + BIT_HEIGHT + 12}
            textAnchor="middle"
            fill="var(--text-dim)"
            fontSize="8"
            className="font-mono opacity-40"
          >
            2^{powerOffset - i}
          </text>
        </g>
      );
    });
  };

  return (
    <div className="w-full max-w-4xl mx-auto my-4 overflow-hidden flex justify-center">
      <svg
        viewBox="0 0 800 400"
        className="w-full h-auto max-w-full font-mono"
        style={{ color: "var(--text-color)" }}
      >
        <defs>
          <marker
            id="arrowhead-blue"
            markerWidth="10"
            markerHeight="7"
            refX="9"
            refY="3.5"
            orient="auto"
          >
            <polygon
              points="0 0, 10 3.5, 0 7"
              fill="var(--cyber-neon-blue)"
              opacity="0.4"
            />
          </marker>
          <marker
            id="arrowhead-green"
            markerWidth="10"
            markerHeight="7"
            refX="9"
            refY="3.5"
            orient="auto"
          >
            <polygon
              points="0 0, 10 3.5, 0 7"
              fill="var(--cyber-neon-green)"
              opacity="0.4"
            />
          </marker>
        </defs>

        {/* Step 1: Logical Value */}
        <g transform="translate(50, 40)">
          <motion.g
            initial={{ opacity: 0, y: -20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <text
              x="0"
              y="0"
              fill="var(--text-color)"
              fontSize="12"
              className="font-cyber font-bold uppercase tracking-widest"
            >
              1. Logical Value (1,000)
            </text>
            <text
              x="700"
              y="0"
              textAnchor="end"
              fill="var(--text-dim)"
              fontSize="10"
              className="font-mono uppercase opacity-50"
            >
              Binary representation
            </text>

            <g transform="translate(0, 30)">
              <text
                x="0"
                y="-10"
                fill="var(--text-dim)"
                fontSize="10"
                className="font-mono uppercase opacity-50"
              >
                High Byte (Most Sig)
              </text>
              {renderByte(highByte, 0, 0, "var(--cyber-neon-blue)", 15)}

              <g
                transform={`translate(${(BIT_WIDTH + GAP) * 8 + BYTE_GAP}, 0)`}
              >
                <text
                  x="0"
                  y="-10"
                  fill="var(--text-dim)"
                  fontSize="10"
                  className="font-mono uppercase opacity-50"
                >
                  Low Byte (Least Sig)
                </text>
                {renderByte(lowByte, 0, 0, "var(--cyber-neon-green)", 7)}
              </g>
            </g>
          </motion.g>
        </g>

        {/* Bit Crossing Arrows */}
        <g>
          {/* High Byte to Storage Second */}
          {highByte.map((_, i) => {
            const startX = 50 + i * (BIT_WIDTH + GAP) + BIT_WIDTH / 2;
            const startY = 140;
            const endX =
              50 +
              (BIT_WIDTH + GAP) * 8 +
              BYTE_GAP +
              i * (BIT_WIDTH + GAP) +
              BIT_WIDTH / 2;
            const endY = 280;
            return (
              <motion.path
                key={`high-${i}`}
                d={`M ${startX} ${startY} C ${startX} ${startY + 60}, ${endX} ${endY - 60}, ${endX} ${endY}`}
                fill="none"
                stroke="var(--cyber-neon-blue)"
                strokeWidth="1"
                strokeDasharray="4,4"
                markerEnd="url(#arrowhead-blue)"
                initial={{ pathLength: 0, opacity: 0 }}
                whileInView={{ pathLength: 1, opacity: 0.2 }}
                viewport={{ once: true }}
                transition={{ duration: 1, delay: 0.8 + i * 0.05 }}
              />
            );
          })}

          {/* Low Byte to Storage First */}
          {lowByte.map((_, i) => {
            const startX =
              50 +
              (BIT_WIDTH + GAP) * 8 +
              BYTE_GAP +
              i * (BIT_WIDTH + GAP) +
              BIT_WIDTH / 2;
            const startY = 140;
            const endX = 50 + i * (BIT_WIDTH + GAP) + BIT_WIDTH / 2;
            const endY = 280;
            return (
              <motion.path
                key={`low-${i}`}
                d={`M ${startX} ${startY} C ${startX} ${startY + 60}, ${endX} ${endY - 60}, ${endX} ${endY}`}
                fill="none"
                stroke="var(--cyber-neon-green)"
                strokeWidth="1"
                strokeDasharray="4,4"
                markerEnd="url(#arrowhead-green)"
                initial={{ pathLength: 0, opacity: 0 }}
                whileInView={{ pathLength: 1, opacity: 0.2 }}
                viewport={{ once: true }}
                transition={{ duration: 1, delay: 0.8 + i * 0.05 }}
              />
            );
          })}
        </g>

        {/* Step 2: Memory Storage */}
        <g transform="translate(50, 290)">
          <motion.g
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.5 }}
          >
            <text
              x="0"
              y="0"
              fill="var(--text-color)"
              fontSize="12"
              className="font-cyber font-bold uppercase tracking-widest"
            >
              2. Little-Endian Memory (Storage)
            </text>
            <text
              x="700"
              y="0"
              textAnchor="end"
              fill="var(--text-dim)"
              fontSize="10"
              className="font-mono uppercase opacity-50"
            >
              Low address first
            </text>

            <g transform="translate(0, 30)">
              <text
                x="0"
                y="-10"
                fill="var(--text-dim)"
                fontSize="10"
                className="font-mono uppercase opacity-50"
              >
                Low Byte (Stored First)
              </text>
              {renderByte(lowByte, 0, 0, "var(--cyber-neon-green)", 7)}

              <g
                transform={`translate(${(BIT_WIDTH + GAP) * 8 + BYTE_GAP}, 0)`}
              >
                <text
                  x="0"
                  y="-10"
                  fill="var(--text-dim)"
                  fontSize="10"
                  className="font-mono uppercase opacity-50"
                >
                  High Byte (Stored Second)
                </text>
                {renderByte(highByte, 0, 0, "var(--cyber-neon-blue)", 15)}
              </g>
            </g>
          </motion.g>
        </g>
      </svg>
    </div>
  );
};

export default MemoryLayoutVisualization;
