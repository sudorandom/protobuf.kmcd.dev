import { motion } from 'framer-motion';

export const MultiFieldEncoding = () => {
  const fields = [
    {
      id: 'string',
      type: 'string',
      name: 'name',
      number: 1,
      value: '"Alice"',
      hex: [
        { val: '0a', label: 'Tag (1,2)', color: 'var(--cyber-neon-blue)' },
        { val: '05', label: 'Len', color: 'var(--cyber-neon-yellow)' },
        { val: '41 6c 69 63 65', label: '"Alice"', color: 'var(--cyber-neon-green)' }
      ]
    },
    {
      id: 'int',
      type: 'uint32',
      name: 'age',
      number: 2,
      value: '25',
      hex: [
        { val: '10', label: 'Tag (2,0)', color: 'var(--cyber-neon-blue)' },
        { val: '19', label: '25', color: 'var(--cyber-neon-green)' }
      ]
    },
    {
      id: 'double',
      type: 'double',
      name: 'score',
      number: 3,
      value: '175.5',
      hex: [
        { val: '19', label: 'Tag (3,1)', color: 'var(--cyber-neon-blue)' },
        { val: '00 00 00 00 00 f0 65 40', label: '175.5', color: 'var(--cyber-neon-green)' }
      ]
    }
  ];

  return (
    <div className="w-full max-w-5xl mx-auto my-16 overflow-hidden flex justify-center bg-[var(--section-bg-dark)]/30 rounded-2xl border border-[var(--border-light)] p-8 shadow-2xl backdrop-blur-sm">
      <svg
        viewBox="0 0 900 480"
        className="w-full h-auto max-w-full font-mono"
        style={{ color: 'var(--text-color)' }}
      >
        <defs>
          <filter id="glow-small" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="2" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
          <marker id="arrowhead-blue" markerWidth="10" markerHeight="7" refX="9" refY="3.5" orient="auto">
            <polygon points="0 0, 10 3.5, 0 7" fill="var(--cyber-neon-blue)" opacity="0.6" />
          </marker>
        </defs>

        {/* Header Labels */}
        <text x="50" y="30" fill="var(--text-dim)" fontSize="12" letterSpacing="2" className="uppercase font-bold">Schema & Data</text>
        <text x="500" y="30" fill="var(--text-dim)" fontSize="12" letterSpacing="2" className="uppercase font-bold">Wire Encoding (Hex)</text>

        {fields.map((field, idx) => {
          const yBase = 80 + idx * 140;
          return (
            <g key={field.id}>
              {/* Left Side: Schema/Data Block */}
              <motion.g
                initial={{ opacity: 0, x: -30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: idx * 0.2 }}
              >
                <rect x="50" y={yBase} width="320" height="90" rx="8" fill="var(--panel-bg)" stroke="var(--border-light)" strokeWidth="1" />
                <rect x="50" y={yBase} width="4" height="90" fill={field.hex[0].color} rx="2" />
                
                <text x="70" y={yBase + 30} fontSize="14">
                  <tspan fill="var(--cyber-neon-pink)">{field.type}</tspan>
                  <tspan fill="currentColor"> {field.name} = </tspan>
                  <tspan fill="var(--cyber-neon-yellow)">{field.number}</tspan>
                  <tspan fill="currentColor">;</tspan>
                </text>
                
                <text x="70" y={yBase + 65} fontSize="14">
                  <tspan fill="var(--text-dim)" opacity="0.6">{field.name}: </tspan>
                  <tspan fill={field.hex[field.hex.length - 1].color} className="font-bold">{field.value}</tspan>
                </text>

                {/* Tag info helper */}
                <text x="360" y={yBase + 15} textAnchor="end" fill="var(--text-dim)" fontSize="9" className="uppercase opacity-50">
                  Wire Type {field.id === 'string' ? '2' : field.id === 'int' ? '0' : '1'}
                </text>
              </motion.g>

              {/* Connecting Line */}
              <motion.path
                d={`M 370 ${yBase + 45} L 480 ${yBase + 45}`}
                fill="none"
                stroke="var(--cyber-neon-blue)"
                strokeWidth="2"
                strokeDasharray="4,4"
                markerEnd="url(#arrowhead-blue)"
                initial={{ pathLength: 0, opacity: 0 }}
                animate={{ pathLength: 1, opacity: 0.4 }}
                transition={{ duration: 0.8, delay: 0.4 + idx * 0.2 }}
              />

              {/* Right Side: Hex Blocks */}
              <g transform={`translate(500, ${yBase + 25})`}>
                {field.hex.map((h, hIdx) => {
                  const xPos = field.hex.slice(0, hIdx).reduce((acc, curr) => acc + (curr.val.length * 12 + 40), 0);
                  const blockWidth = h.val.length * 12 + 30;
                  
                  return (
                    <motion.g
                      key={hIdx}
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ duration: 0.4, delay: 0.8 + idx * 0.2 + hIdx * 0.1 }}
                    >
                      <rect x={xPos} y="0" width={blockWidth} height="35" rx="4" fill={h.color} fillOpacity="0.15" stroke={h.color} strokeWidth="1" filter="url(#glow-small)" />
                      <text x={xPos + blockWidth / 2} y="22" fill={h.color} fontSize="16" textAnchor="middle" className="font-bold">{h.val}</text>
                      <text x={xPos + blockWidth / 2} y="55" fill="var(--text-dim)" fontSize="12" textAnchor="middle" className="uppercase tracking-tighter opacity-80">{h.label}</text>
                    </motion.g>
                  );
                })}
              </g>
            </g>
          );
        })}

        {/* Overall Stream Indicator */}
        <motion.g
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 2 }}
        >
          <path d="M 500 450 L 850 450" fill="none" stroke="var(--border-light)" strokeWidth="1" strokeDasharray="2,2" />
          <text x="675" y="470" fill="var(--text-dim)" fontSize="12" textAnchor="middle" className="uppercase tracking-[0.3em]">Sequential Wire Stream</text>
        </motion.g>
      </svg>
    </div>
  );
};

export default MultiFieldEncoding;