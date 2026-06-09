import { useState } from "react";
import { motion } from "framer-motion";

export const LengthDelimitedWireTypeVisualization = () => {
  const [restartKey, setRestartKey] = useState(0);

  return (
    <div
      className="w-full max-w-4xl mx-auto my-8 overflow-hidden flex flex-col items-center group cursor-pointer -mx-4 sm:mx-auto w-[calc(100%+2rem)] sm:w-full px-0 sm:px-4"
      onClick={() => setRestartKey((prev) => prev + 1)}
    >
      <svg
        key={restartKey}
        viewBox="0 0 800 440"
        className="w-full h-auto max-w-full font-mono drop-shadow-2xl"
        style={{ color: "var(--text-color)" }}
      >
        <defs>
          <linearGradient
            id="cyber-gradient-length"
            x1="0%"
            y1="0%"
            x2="100%"
            y2="0%"
          >
            <stop offset="0%" stopColor="var(--cyber-neon-blue)" />
            <stop offset="100%" stopColor="var(--cyber-neon-pink)" />
          </linearGradient>
          <filter id="glow-length" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="4" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
          <marker
            id="arrowhead-length"
            markerWidth="10"
            markerHeight="7"
            refX="9"
            refY="3.5"
            orient="auto"
          >
            <polygon
              points="0 0, 10 3.5, 0 7"
              fill="var(--cyber-neon-blue)"
              opacity="0.8"
            />
          </marker>
          <marker
            id="arrowhead-pink-length"
            markerWidth="10"
            markerHeight="7"
            refX="9"
            refY="3.5"
            orient="auto"
          >
            <polygon
              points="0 0, 10 3.5, 0 7"
              fill="var(--cyber-neon-pink)"
              opacity="0.8"
            />
          </marker>
        </defs>

        {/* Schema Box */}
        <motion.g
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
        >
          <rect
            x="90"
            y="50"
            width="280"
            height="120"
            rx="8"
            fill="var(--panel-bg)"
            stroke="var(--cyber-neon-blue)"
            strokeWidth="1"
            opacity="0.9"
          />
          <text
            x="105"
            y="80"
            fill="var(--cyber-neon-pink)"
            fontSize="14"
            className="font-bold"
          >
            message
          </text>
          <text x="170" y="80" fill="currentColor" fontSize="14">
            {"User {"}
          </text>
          <text x="120" y="110" fill="var(--cyber-neon-blue)" fontSize="14">
            string
          </text>
          <text x="175" y="110" fill="currentColor" fontSize="14">
            name =
          </text>
          <text x="235" y="110" fill="var(--cyber-neon-yellow)" fontSize="14">
            3
          </text>
          <text x="245" y="110" fill="currentColor" fontSize="14">
            ;
          </text>
          <text x="105" y="140" fill="currentColor" fontSize="14">
            {"}"}
          </text>
          <text
            x="105"
            y="40"
            fill="var(--text-dim)"
            fontSize="12"
            letterSpacing="2"
            className="uppercase font-bold"
          >
            Schema
          </text>
        </motion.g>

        {/* Data Box */}
        <motion.g
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
        >
          <rect
            x="430"
            y="50"
            width="280"
            height="120"
            rx="8"
            fill="var(--panel-bg)"
            stroke="var(--cyber-neon-green)"
            strokeWidth="1"
            opacity="0.9"
          />
          <text x="445" y="95" fill="var(--cyber-neon-blue)" fontSize="14">
            name
          </text>
          <text x="485" y="95" fill="currentColor" fontSize="14">
            :
          </text>
          <text x="500" y="95" fill="var(--cyber-neon-green)" fontSize="14">
            "Alice"
          </text>
          <text
            x="445"
            y="40"
            fill="var(--text-dim)"
            fontSize="12"
            letterSpacing="2"
            className="uppercase font-bold"
          >
            Data
          </text>
        </motion.g>

        {/* Connecting Lines */}
        <motion.g
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 1 }}
        >
          <path
            d="M 230 170 L 230 210 L 360 210 L 360 240"
            fill="none"
            stroke="var(--cyber-neon-blue)"
            strokeWidth="2"
            strokeDasharray="5,5"
            markerEnd="url(#arrowhead-length)"
            className="opacity-60"
          />
          <path
            d="M 570 170 L 570 210 L 440 210 L 440 240"
            fill="none"
            stroke="var(--cyber-neon-green)"
            strokeWidth="2"
            strokeDasharray="5,5"
            markerEnd="url(#arrowhead-length)"
            className="opacity-60"
          />

          <circle
            cx="400"
            cy="210"
            r="16"
            fill="var(--panel-bg)"
            stroke="var(--cyber-neon-pink)"
            strokeWidth="2"
            filter="url(#glow-length)"
          />
          <text
            x="400"
            y="215"
            fill="var(--cyber-neon-pink)"
            fontSize="18"
            textAnchor="middle"
            className="font-bold"
          >
            +
          </text>
        </motion.g>

        {/* Connecting Line to Output */}
        <motion.g
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 1.4 }}
        >
          <path
            d="M 400 325 L 400 360"
            fill="none"
            stroke="var(--cyber-neon-pink)"
            strokeWidth="2"
            strokeDasharray="5,5"
            markerEnd="url(#arrowhead-pink-length)"
            className="opacity-60"
          />
        </motion.g>

        {/* Encoded Output Box */}
        <motion.g
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 1.2 }}
        >
          <rect
            x="150"
            y="250"
            width="500"
            height="150"
            rx="8"
            fill="var(--panel-bg)"
            stroke="url(#cyber-gradient-length)"
            strokeWidth="2"
            filter="url(#glow-length)"
            opacity="0.9"
          />
          <text
            x="170"
            y="240"
            fill="var(--text-dim)"
            fontSize="12"
            letterSpacing="2"
            className="uppercase font-bold"
          >
            Encoded Payload
          </text>

          <g transform="translate(190, 290)">
            <rect
              x="0"
              y="-20"
              width="100"
              height="30"
              rx="4"
              fill="var(--cyber-neon-blue)"
              fillOpacity="0.2"
            />
            <text
              x="50"
              y="0"
              fill="var(--cyber-neon-blue)"
              fontSize="18"
              textAnchor="middle"
              className="font-bold"
            >
              1a
            </text>
            <text
              x="50"
              y="25"
              fill="var(--text-dim)"
              fontSize="12"
              textAnchor="middle"
            >
              Tag
            </text>

            <rect
              x="110"
              y="-20"
              width="100"
              height="30"
              rx="4"
              fill="var(--cyber-neon-yellow)"
              fillOpacity="0.2"
            />
            <text
              x="160"
              y="0"
              fill="var(--cyber-neon-yellow)"
              fontSize="18"
              textAnchor="middle"
              className="font-bold"
            >
              05
            </text>
            <text
              x="160"
              y="25"
              fill="var(--text-dim)"
              fontSize="12"
              textAnchor="middle"
            >
              Len
            </text>

            <rect
              x="220"
              y="-20"
              width="200"
              height="30"
              rx="4"
              fill="var(--cyber-neon-green)"
              fillOpacity="0.2"
            />
            <text
              x="320"
              y="0"
              fill="var(--cyber-neon-green)"
              fontSize="18"
              textAnchor="middle"
              className="font-bold tracking-widest"
            >
              41 6c 69 63 65
            </text>
            <text
              x="320"
              y="25"
              fill="var(--text-dim)"
              fontSize="12"
              textAnchor="middle"
            >
              "Alice"
            </text>
          </g>

          <g transform="translate(190, 355)">
            <text
              x="50"
              y="0"
              fontSize="12"
              textAnchor="middle"
              className="font-mono"
            >
              <tspan fill="var(--cyber-neon-blue)">00011</tspan>
              <tspan fill="var(--cyber-neon-pink)">010</tspan>
            </text>
            <text
              x="25"
              y="24"
              fill="var(--text-dim)"
              fontSize="11"
              textAnchor="middle"
              className="font-mono"
            >
              Field 3
            </text>
            <text
              x="75"
              y="24"
              fill="var(--text-dim)"
              fontSize="11"
              textAnchor="middle"
              className="font-mono"
            >
              Type 2
            </text>

            <text
              x="160"
              y="0"
              fill="var(--cyber-neon-yellow)"
              fontSize="12"
              textAnchor="middle"
              className="font-mono"
            >
              00000101
            </text>
            <text
              x="160"
              y="24"
              fill="var(--text-dim)"
              fontSize="11"
              textAnchor="middle"
              className="font-mono"
            >
              Length 5
            </text>

            <text
              x="320"
              y="-8"
              fill="var(--cyber-neon-green)"
              fontSize="11"
              textAnchor="middle"
              className="font-mono tracking-wider"
            >
              01000001 01101100
            </text>
            <text
              x="320"
              y="8"
              fill="var(--cyber-neon-green)"
              fontSize="11"
              textAnchor="middle"
              className="font-mono tracking-wider"
            >
              01101001 01100011 01100101
            </text>
            <text
              x="320"
              y="24"
              fill="var(--text-dim)"
              fontSize="11"
              textAnchor="middle"
              className="font-mono"
            >
              "Alice" ASCII
            </text>
          </g>
        </motion.g>
      </svg>
    </div>
  );
};

export default LengthDelimitedWireTypeVisualization;
