import { motion } from "framer-motion";

export const ProtobufSyntaxVisualization = () => {
  const callouts = [
    {
      x: 140,
      y: 35,
      label: "Syntax",
      desc: "Specifies version (proto3)",
      color: "var(--cyber-neon-pink)",
    },
    {
      x: 145,
      y: 65,
      label: "Package",
      desc: "Prevents name collisions",
      color: "var(--cyber-neon-blue)",
    },
    {
      x: 135,
      y: 95,
      label: "Import",
      desc: "Use other definitions",
      color: "var(--cyber-neon-green)",
    },
    {
      x: 135,
      y: 125,
      label: "Option",
      desc: "Global file behavior",
      color: "var(--cyber-neon-yellow)",
    },
    {
      x: 140,
      y: 215,
      label: "Enum",
      desc: "Named constants",
      color: "var(--cyber-neon-pink)",
    },
    {
      x: 145,
      y: 305,
      label: "Message",
      desc: "The data contract",
      color: "var(--cyber-neon-blue)",
    },
    {
      x: 235,
      y: 335,
      label: "Field Type",
      desc: "Strictly typed",
      color: "var(--cyber-neon-green)",
    },
    {
      x: 300,
      y: 335,
      label: "Field Name",
      desc: "Logical name",
      color: "var(--text-color)",
    },
    {
      x: 380,
      y: 335,
      label: "Field Option",
      desc: "Custom constraints",
      color: "var(--cyber-neon-yellow)",
    },
  ];

  return (
    <div className="w-full max-w-5xl mx-auto my-16 overflow-hidden flex justify-center bg-[var(--section-bg-dark)]/30 rounded-2xl border border-[var(--border-light)] p-8 shadow-2xl backdrop-blur-sm relative">
      <svg
        viewBox="0 0 900 480"
        className="w-full h-auto max-w-full font-mono"
        style={{ color: "var(--text-color)" }}
      >
        <defs>
          <filter id="syntax-glow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="3" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
        </defs>

        {/* Code Block Container */}
        <rect
          x="50"
          y="20"
          width="480"
          height="440"
          rx="8"
          fill="var(--panel-bg)"
          stroke="var(--border-light)"
          strokeWidth="1"
        />

        {/* Code Content */}
        <g transform="translate(70, 45)" className="text-[14px]">
          <text y="0">
            <tspan fill="var(--cyber-neon-pink)">syntax</tspan> ={" "}
            <tspan fill="var(--cyber-neon-green)">"proto3"</tspan>;
          </text>
          <text y="30">
            <tspan fill="var(--cyber-neon-pink)">package</tspan> demo.v1;
          </text>
          <text y="60">
            <tspan fill="var(--cyber-neon-pink)">import</tspan>{" "}
            <tspan fill="var(--cyber-neon-green)">
              "buf/validate/validate.proto"
            </tspan>
            ;
          </text>
          <text y="90">
            <tspan fill="var(--cyber-neon-pink)">option</tspan> go_package ={" "}
            <tspan fill="var(--cyber-neon-green)">"gen/v1"</tspan>;
          </text>

          <g transform="translate(0, 150)">
            <text y="0">
              <tspan fill="var(--cyber-neon-pink)">enum</tspan> Role {"{"}
            </text>
            <text y="25" x="20">
              ROLE_UNSPECIFIED = <tspan fill="var(--text-color)">0</tspan>;
            </text>
            <text y="50" x="20">
              ROLE_ADMIN = <tspan fill="var(--text-color)">1</tspan>;
            </text>
            <text y="75">{"}"}</text>
          </g>

          <g transform="translate(0, 260)">
            <text y="0">
              <tspan fill="var(--cyber-neon-pink)">message</tspan> User {"{"}
            </text>
            <text y="30" x="20">
              <tspan fill="var(--cyber-neon-blue)">string</tspan> email ={" "}
              <tspan fill="var(--text-color)">1</tspan> [
            </text>
            <text y="55" x="40">
              (<tspan fill="var(--cyber-neon-yellow)">buf.validate.field</tspan>
              ).string.email = <tspan fill="var(--cyber-neon-pink)">true</tspan>
            </text>
            <text y="80" x="20">
              ];
            </text>
            <text y="110">{"}"}</text>
          </g>
        </g>

        {/* Callouts and Arrows */}
        {callouts.map((c, i) => (
          <motion.g
            key={i}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.5 + i * 0.1 }}
          >
            {/* Arrow */}
            <path
              d={`M ${c.x} ${c.y} L 600 ${c.y}`}
              fill="none"
              stroke={c.color}
              strokeWidth="1"
              strokeDasharray="4,2"
              opacity="0.4"
            />
            {/* Label Block */}
            <g transform={`translate(610, ${c.y - 15})`}>
              <rect
                width="220"
                height="40"
                rx="4"
                fill={c.color}
                fillOpacity="0.05"
                stroke={c.color}
                strokeWidth="1"
                strokeOpacity="0.3"
              />
              <text
                x="10"
                y="18"
                fill={c.color}
                fontSize="12"
                className="font-bold uppercase tracking-wider"
                filter="url(#syntax-glow)"
              >
                {c.label}
              </text>
              <text x="10" y="32" fill="var(--text-dim)" fontSize="12">
                {c.desc}
              </text>
            </g>
          </motion.g>
        ))}
      </svg>
    </div>
  );
};

export default ProtobufSyntaxVisualization;
