import { motion, useAnimationControls } from "framer-motion";
import { useEffect } from "react";

export const BitwiseMergeVisualization = () => {
  const BIT_WIDTH = 38;
  const BIT_HEIGHT = 42;
  const GAP = 4;
  const BYTE_GAP = 12;

  const shiftedField = [0, 0, 0, 0, 1, 0, 0, 0];
  const wireType = [0, 0, 0, 0, 0, 0, 1, 0];

  const COLOR_A = "var(--cyber-neon-blue)";
  const COLOR_B = "var(--cyber-neon-yellow)";

  const controls = useAnimationControls();

  useEffect(() => {
    const sequence = async () => {
      while (true) {
        // Reset to initial state
        controls.set("initial");
        await new Promise((resolve) => setTimeout(resolve, 1500));

        // Start the fall
        await controls.start("fall");

        // Show the result
        await controls.start("result");
        await new Promise((resolve) => setTimeout(resolve, 2500));
      }
    };
    sequence();
  }, [controls]);

  const fallingBitVariants = (distance: number) => ({
    initial: { translateY: 0, opacity: 1 },
    fall: {
      translateY: distance,
      opacity: 1, // Remain visible during fall
      transition: { duration: 1, ease: "easeIn" },
    },
    result: { 
      opacity: 0, // Disappear when result is shown
      transition: { duration: 0.01 } 
    },
  });

  const resultCellVariants = (isActive: boolean, color: string) => ({
    initial: {
      fill: "var(--text-dim)",
      fillOpacity: 0.05,
      stroke: "var(--border-light)",
    },
    fall: { transition: { duration: 0 } },
    result: isActive ? {
      fill: color,
      fillOpacity: 0.1,
      stroke: color,
      transition: { duration: 0.3 },
    } : {},
  });

  const resultZeroVariants = (isActive: boolean) => ({
    initial: { opacity: 1 },
    fall: { transition: { duration: 0 } },
    result: { opacity: isActive ? 0 : 1, transition: { duration: 0.3 } },
  });

  const resultOneVariants = (isActive: boolean) => ({
    initial: { opacity: 0 },
    fall: { transition: { duration: 0 } },
    result: { opacity: isActive ? 1 : 0, transition: { duration: 0.3 } },
  });


  return (
    <div className="w-full max-w-4xl mx-auto my-4 overflow-hidden flex flex-col items-center gap-8 text-[var(--text-color)]">
      <svg viewBox="0 0 500 320" className="w-full h-auto max-w-xl font-mono">
        {/* Input A */}
        <g transform="translate(60, 40)">
          <text x="-50" y={BIT_HEIGHT / 2 + 5} fill="var(--text-dim)" fontSize="10" className="font-cyber font-bold uppercase tracking-tighter">Input A</text>
          <g>
            {shiftedField.map((bit, i) => {
              const x = i * (BIT_WIDTH + GAP) + (i >= 4 ? BYTE_GAP : 0);
              return (
                <g key={`a-${i}`} transform={`translate(${x}, 0)`}>
                  <rect width={BIT_WIDTH} height={BIT_HEIGHT} rx="3" fill={COLOR_A} fillOpacity={0.02} stroke={COLOR_A} strokeWidth="1" />
                  <text x={BIT_WIDTH / 2} y={BIT_HEIGHT / 2 + 6} textAnchor="middle" fill={COLOR_A} fontSize="16" >{bit}</text>
                  {bit === 1 && (
                    <motion.g animate={controls} variants={fallingBitVariants(190)}>
                      <rect width={BIT_WIDTH} height={BIT_HEIGHT} rx="3" fill={COLOR_A} fillOpacity={0.1} stroke={COLOR_A} strokeWidth="1.5" />
                      <text x={BIT_WIDTH / 2} y={BIT_HEIGHT / 2 + 6} textAnchor="middle" fill={COLOR_A} fontSize="16" className="font-bold">1</text>
                    </motion.g>
                  )}
                </g>
              );
            })}
          </g>
        </g>

        {/* OR Label */}
        <g transform="translate(250, 115)">
          <text textAnchor="middle" fill="var(--text-dim)" fontSize="14" className="font-cyber font-bold uppercase tracking-widest">Bitwise OR</text>
        </g>

        {/* Input B */}
        <g transform="translate(60, 140)">
          <text x="-50" y={BIT_HEIGHT / 2 + 5} fill="var(--text-dim)" fontSize="10" className="font-cyber font-bold uppercase tracking-tighter">Input B</text>
          <g>
            {wireType.map((bit, i) => {
              const x = i * (BIT_WIDTH + GAP) + (i >= 4 ? BYTE_GAP : 0);
              return (
                <g key={`b-${i}`} transform={`translate(${x}, 0)`}>
                  <rect width={BIT_WIDTH} height={BIT_HEIGHT} rx="3" fill={COLOR_B} fillOpacity={0.02} stroke={COLOR_B} strokeWidth="1" />
                  <text x={BIT_WIDTH / 2} y={BIT_HEIGHT / 2 + 6} textAnchor="middle" fill={COLOR_B} fontSize="16">{bit}</text>
                   {bit === 1 && (
                    <motion.g animate={controls} variants={fallingBitVariants(90)}>
                      <rect width={BIT_WIDTH} height={BIT_HEIGHT} rx="3" fill={COLOR_B} fillOpacity={0.1} stroke={COLOR_B} strokeWidth="1.5" />
                      <text x={BIT_WIDTH / 2} y={BIT_HEIGHT / 2 + 6} textAnchor="middle" fill={COLOR_B} fontSize="16" className="font-bold">1</text>
                    </motion.g>
                  )}
                </g>
              );
            })}
          </g>
        </g>

        {/* Separator line */}
        <line x1="20" y1="210" x2="480" y2="210" stroke="var(--border-light)" strokeWidth="1" strokeDasharray="4,4" />

        {/* Result */}
        <g transform="translate(60, 230)">
          <text x="-50" y={BIT_HEIGHT / 2 + 5} fill="var(--text-color)" fontSize="10" className="font-cyber font-bold uppercase tracking-tighter">Result</text>
          <g>
            {shiftedField.map((_, i) => {
               const x = i * (BIT_WIDTH + GAP) + (i >= 4 ? BYTE_GAP : 0);
               const isFromA = shiftedField[i] === 1;
               const isFromB = wireType[i] === 1;
               const isActive = isFromA || isFromB;
               const resultColor = isFromA ? COLOR_A : isFromB ? COLOR_B : "white";

               return (
                 <g key={`r-${i}`} transform={`translate(${x}, 0)`}>
                    <motion.rect animate={controls} variants={resultCellVariants(isActive, resultColor)} width={BIT_WIDTH} height={BIT_HEIGHT} rx="3" />
                    <motion.text animate={controls} variants={resultZeroVariants(isActive)} x={BIT_WIDTH / 2} y={BIT_HEIGHT / 2 + 6} textAnchor="middle" fill="var(--text-dim)" fontSize="16" className="font-mono">0</motion.text>
                    <motion.text animate={controls} variants={resultOneVariants(isActive)} x={BIT_WIDTH / 2} y={BIT_HEIGHT / 2 + 6} textAnchor="middle" fill={resultColor} fontSize="16" className="font-bold font-mono">1</motion.text>
                 </g>
               )
            })}
          </g>
          
          <motion.g animate={controls} variants={{initial: {opacity: 0}, fall: {opacity: 0}, result: {opacity: 1}}}>
            <text x="360" y={BIT_HEIGHT / 2 + 7} fill="var(--cyber-neon-green)" fontSize="18" className="font-bold">= 0x0A</text>
          </motion.g>
        </g>
      </svg>
    </div>
  );
};
export default BitwiseMergeVisualization;
