import { useState } from "react";
import { motion } from "framer-motion";

export const FixedWireTypeVisualization = () => {
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
            id="cyber-gradient-fixed"
            x1="0%"
            y1="0%"
            x2="100%"
            y2="0%"
          >
            <stop offset="0%" stopColor="var(--cyber-neon-blue)" />
            <stop offset="100%" stopColor="var(--cyber-neon-yellow)" />
          </linearGradient>
          <filter id="glow-fixed" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="4" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
          <marker
            id="arrowhead-fixed"
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
            id="arrowhead-pink-fixed"
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
            float
          </text>
          <text x="170" y="110" fill="currentColor" fontSize="14">
            height =
          </text>
          <text x="250" y="110" fill="var(--cyber-neon-yellow)" fontSize="14">
            2
          </text>
          <text x="260" y="110" fill="currentColor" fontSize="14">
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
            height
          </text>
          <text x="495" y="95" fill="currentColor" fontSize="14">
            :
          </text>
          <text x="510" y="95" fill="var(--cyber-neon-green)" fontSize="14">
            3.14
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
            markerEnd="url(#arrowhead-fixed)"
            className="opacity-60"
          />
          <path
            d="M 570 170 L 570 210 L 440 210 L 440 240"
            fill="none"
            stroke="var(--cyber-neon-green)"
            strokeWidth="2"
            strokeDasharray="5,5"
            markerEnd="url(#arrowhead-fixed)"
            className="opacity-60"
          />

          <circle
            cx="400"
            cy="210"
            r="16"
            fill="var(--panel-bg)"
            stroke="var(--cyber-neon-pink)"
            strokeWidth="2"
            filter="url(#glow-fixed)"
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
            markerEnd="url(#arrowhead-pink-fixed)"
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
            stroke="url(#cyber-gradient-fixed)"
            strokeWidth="2"
            filter="url(#glow-fixed)"
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
              width="130"
              height="30"
              rx="4"
              fill="var(--cyber-neon-blue)"
              fillOpacity="0.2"
            />
            <text
              x="65"
              y="0"
              fill="var(--cyber-neon-blue)"
              fontSize="18"
              textAnchor="middle"
              className="font-bold"
            >
              15
            </text>
            <text
              x="65"
              y="25"
              fill="var(--text-dim)"
              fontSize="12"
              textAnchor="middle"
            >
              Tag
            </text>

            <rect
              x="150"
              y="-20"
              width="270"
              height="30"
              rx="4"
              fill="var(--cyber-neon-green)"
              fillOpacity="0.2"
            />
            <text
              x="285"
              y="0"
              fill="var(--cyber-neon-green)"
              fontSize="18"
              textAnchor="middle"
              className="font-bold tracking-widest"
            >
              db 0f 49 40
            </text>
            <text
              x="285"
              y="25"
              fill="var(--text-dim)"
              fontSize="12"
              textAnchor="middle"
            >
              Value (3.14 float, Little-Endian)
            </text>
          </g>

          <g transform="translate(190, 355)">
            <text
              x="65"
              y="0"
              fontSize="12"
              textAnchor="middle"
              className="font-mono"
            >
              <tspan fill="var(--cyber-neon-blue)">00010</tspan>
              <tspan fill="var(--cyber-neon-pink)">101</tspan>
            </text>
            <text
              x="35"
              y="24"
              fill="var(--text-dim)"
              fontSize="11"
              textAnchor="middle"
              className="font-mono"
            >
              Field 2
            </text>
            <text
              x="95"
              y="24"
              fill="var(--text-dim)"
              fontSize="11"
              textAnchor="middle"
              className="font-mono"
            >
              Type 5
            </text>

            <text
              x="285"
              y="-8"
              fill="var(--cyber-neon-green)"
              fontSize="11"
              textAnchor="middle"
              className="font-mono tracking-wider"
            >
              11011011 00001111
            </text>
            <text
              x="285"
              y="8"
              fill="var(--cyber-neon-green)"
              fontSize="11"
              textAnchor="middle"
              className="font-mono tracking-wider"
            >
              01001001 01000000
            </text>
            <text
              x="285"
              y="24"
              fill="var(--text-dim)"
              fontSize="11"
              textAnchor="middle"
              className="font-mono"
            >
              Fixed 32-bit (4 Bytes)
            </text>
          </g>
        </motion.g>
      </svg>
    </div>
  );
};

export default FixedWireTypeVisualization;
