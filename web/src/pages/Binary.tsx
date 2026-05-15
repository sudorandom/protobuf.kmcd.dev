import React, { useState, useMemo } from "react";
import { motion } from "framer-motion";
import {
  Binary,
  Layers,
  SearchCheck,
  Zap,
  Database,
  Hash,
  MousePointer2,
  ChevronRight,
} from "lucide-react";
import { fromJson, toBinary, type DescMessage } from "@bufbuild/protobuf";
import {
  Section,
  SectionTitle,
  CyberPanel,
  ExternalLinkText,
} from "../components/shared/Common";
import { JsonEditor } from "../components/shared/JsonEditor";
import VarintExplainer from "../components/VarintExplainer";
import { MemoryLayoutVisualization } from "../components/MemoryLayoutVisualization";
import MultiFieldEncoding from "../components/MultiFieldEncoding";
import { decodeBinary, type DecodedSegment } from "../utils/decoder";
import { SIZE_EXAMPLES } from "../utils/constants";
import { generateFake, convertToProtoscope } from "../utils/wasm-parser";
import { ProtoscopeLab } from "../components/ProtoscopeLab";

// --- Static Envelope Diagrams ---

const PacketDiagram = ({
  title = "Length-Delimited Field (Wire Type 2)",
}: {
  title?: string;
}) => (
  <div className="w-full max-w-2xl mx-auto my-12">
    <div className="flex items-stretch gap-1 h-20">
      <div className="flex-1 bg-[var(--cyber-neon-blue)]/10 border border-[var(--cyber-neon-blue)]/30 rounded flex flex-col items-center justify-center text-[var(--cyber-neon-blue)] font-mono text-xs relative group px-2 text-center">
        <div className="absolute -top-6 left-0 text-xs uppercase text-[var(--text-dim)] font-bold tracking-widest flex items-center gap-1">
          <Hash className="w-3 h-3" /> Tag
        </div>
        <span className="font-bold">VARINT</span>
        <span className="text-xs opacity-60">(Field # | Type)</span>
      </div>
      <div className="flex-[0.7] bg-[var(--cyber-neon-yellow)]/10 border border-[var(--cyber-neon-yellow)]/30 rounded flex flex-col items-center justify-center text-[var(--cyber-neon-yellow)] font-mono text-xs relative group px-2 text-center">
        <div className="absolute -top-6 left-0 text-xs uppercase text-[var(--text-dim)] font-bold tracking-widest flex items-center gap-1">
          <Zap className="w-3 h-3" /> Length
        </div>
        <span className="font-bold">VARINT</span>
        <span className="text-xs opacity-60">N Bytes</span>
      </div>
      <div className="flex-[2] bg-[var(--cyber-neon-green)]/10 border border-[var(--cyber-neon-green)]/30 rounded flex flex-col items-center justify-center text-[var(--cyber-neon-green)] font-mono text-xs relative group px-2 text-center">
        <div className="absolute -top-6 left-0 text-xs uppercase text-[var(--text-dim)] font-bold tracking-widest flex items-center gap-1">
          <Database className="w-3 h-3" /> Payload
        </div>
        <span className="font-bold">DATA</span>
        <span className="text-xs opacity-60">Binary Bytes</span>
      </div>
    </div>
    <div className="flex justify-between mt-8 px-2">
      <div className="flex flex-col items-center gap-1">
        <div className="w-px h-4 bg-[var(--border-light)]" />
        <span className="text-xs font-mono text-[var(--text-dim)] uppercase">
          1-5 Bytes
        </span>
      </div>
      <div className="flex flex-col items-center gap-1">
        <div className="w-px h-4 bg-[var(--border-light)]" />
        <span className="text-xs font-mono text-[var(--text-dim)] uppercase">
          1-5 Bytes
        </span>
      </div>
      <div className="flex flex-col items-center gap-1">
        <div className="w-px h-4 bg-[var(--border-light)]" />
        <span className="text-xs font-mono text-[var(--text-dim)] uppercase">
          N Bytes
        </span>
      </div>
    </div>
    <div className="text-xs font-mono text-[var(--text-dim)] uppercase text-center mt-4 italic border-t border-[var(--border-light)] pt-4">
      Anatomy of a {title}
    </div>
  </div>
);

const FixedPacketDiagram = ({
  title = "Fixed-Size Field (Wire Type 1 or 5)",
  size = "4 or 8 Bytes",
}: {
  title?: string;
  size?: string;
}) => (
  <div className="w-full max-w-2xl mx-auto my-12">
    <div className="flex items-stretch gap-1 h-20">
      <div className="flex-1 bg-[var(--cyber-neon-blue)]/10 border border-[var(--cyber-neon-blue)]/30 rounded flex flex-col items-center justify-center text-[var(--cyber-neon-blue)] font-mono text-xs relative group px-2 text-center">
        <div className="absolute -top-6 left-0 text-xs uppercase text-[var(--text-dim)] font-bold tracking-widest flex items-center gap-1">
          <Hash className="w-3 h-3" /> Tag
        </div>
        <span className="font-bold">VARINT</span>
        <span className="text-xs opacity-60">(Field # | Type)</span>
      </div>
      <div className="flex-[2.7] bg-[var(--cyber-neon-green)]/10 border border-[var(--cyber-neon-green)]/30 rounded flex flex-col items-center justify-center text-[var(--cyber-neon-green)] font-mono text-xs relative group px-2 text-center">
        <div className="absolute -top-6 left-0 text-xs uppercase text-[var(--text-dim)] font-bold tracking-widest flex items-center gap-1">
          <Database className="w-3 h-3" /> Payload
        </div>
        <span className="font-bold">DATA</span>
        <span className="text-xs opacity-60">{size}</span>
      </div>
    </div>
    <div className="flex justify-between mt-8 px-2">
      <div className="flex flex-col items-center gap-1">
        <div className="w-px h-4 bg-[var(--border-light)]" />
        <span className="text-xs font-mono text-[var(--text-dim)] uppercase">
          1-5 Bytes
        </span>
      </div>
      <div className="flex flex-col items-center gap-1">
        <div className="w-px h-4 bg-[var(--border-light)]" />
        <span className="text-xs font-mono text-[var(--text-dim)] uppercase">
          {size}
        </span>
      </div>
    </div>
    <div className="text-xs font-mono text-[var(--text-dim)] uppercase text-center mt-4 italic border-t border-[var(--border-light)] pt-4">
      Anatomy of a {title}
    </div>
  </div>
);

const VarintPacketDiagram = () => (
  <div className="w-full max-w-2xl mx-auto my-12">
    <div className="flex items-stretch gap-1 h-20">
      <div className="flex-1 bg-[var(--cyber-neon-blue)]/10 border border-[var(--cyber-neon-blue)]/30 rounded flex flex-col items-center justify-center text-[var(--cyber-neon-blue)] font-mono text-xs relative group px-2 text-center">
        <div className="absolute -top-6 left-0 text-xs uppercase text-[var(--text-dim)] font-bold tracking-widest flex items-center gap-1">
          <Hash className="w-3 h-3" /> Tag
        </div>
        <span className="font-bold">VARINT</span>
        <span className="text-xs opacity-60">(Field # | Type)</span>
      </div>
      <div className="flex-[2.7] bg-[var(--cyber-neon-green)]/10 border border-[var(--cyber-neon-green)]/30 rounded flex flex-col items-center justify-center text-[var(--cyber-neon-green)] font-mono text-xs relative group px-2 text-center">
        <div className="absolute -top-6 left-0 text-xs uppercase text-[var(--text-dim)] font-bold tracking-widest flex items-center gap-1">
          <Database className="w-3 h-3" /> Payload
        </div>
        <span className="font-bold">VARINT</span>
        <span className="text-xs opacity-60">1-10 Bytes</span>
      </div>
    </div>
    <div className="flex justify-between mt-8 px-2">
      <div className="flex flex-col items-center gap-1">
        <div className="w-px h-4 bg-[var(--border-light)]" />
        <span className="text-xs font-mono text-[var(--text-dim)] uppercase">
          1-5 Bytes
        </span>
      </div>
      <div className="flex flex-col items-center gap-1">
        <div className="w-px h-4 bg-[var(--border-light)]" />
        <span className="text-xs font-mono text-[var(--text-dim)] uppercase">
          1-10 Bytes
        </span>
      </div>
    </div>
    <div className="text-xs font-mono text-[var(--text-dim)] uppercase text-center mt-4 italic border-t border-[var(--border-light)] pt-4">
      Anatomy of a Varint Field (Wire Type 0)
    </div>
  </div>
);

// --- Sub-components for Binary Matrix ---

const ByteBreakdown = ({
  label,
  bytes,
  color,
}: {
  label: string;
  bytes: Uint8Array;
  color: string;
}) => {
  if (!bytes || bytes.length === 0) return null;
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <span className="text-xs font-mono text-[var(--text-dim)] uppercase tracking-widest">
          {label}
        </span>
        <span className="text-xs font-mono text-[var(--text-dim)] opacity-60 uppercase">
          {bytes.length} {bytes.length === 1 ? "Byte" : "Bytes"}
        </span>
      </div>
      <div className="flex flex-col gap-2 p-3 bg-[var(--section-bg-dark)]/50 border border-[var(--border-light)] rounded">
        <div
          className="flex flex-wrap gap-2 font-mono text-sm"
          style={{ color }}
        >
          {Array.from(bytes).map((b, i) => (
            <span
              key={i}
              className="px-1.5 py-0.5 bg-[var(--overlay-bg)] rounded border border-[var(--border-light)]"
            >
              {b.toString(16).padStart(2, "0").toUpperCase()}
            </span>
          ))}
        </div>
        <div
          className="flex flex-wrap gap-x-3 gap-y-1 font-mono text-xs opacity-70 break-all"
          style={{ color }}
        >
          {Array.from(bytes).map((b, i) => (
            <span key={i} className="whitespace-nowrap">
              {b.toString(2).padStart(8, "0")}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
};

const TagSectionBreakdown = ({
  bytes,
  fieldNumber,
  wireType,
}: {
  bytes: Uint8Array;
  fieldNumber: number;
  wireType: number;
}) => {
  if (!bytes || bytes.length === 0) return null;

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <span className="text-xs font-mono text-[var(--text-dim)] uppercase tracking-widest">
          Tag Section
        </span>
        <span className="text-xs font-mono text-[var(--text-dim)] opacity-60 uppercase">
          {bytes.length} {bytes.length === 1 ? "Byte" : "Bytes"}
        </span>
      </div>

      <div className="flex flex-col gap-3 p-3 bg-[var(--section-bg-dark)]/50 border border-[var(--border-light)] rounded">
        {Array.from(bytes).map((byte, i) => {
          const bits = byte.toString(2).padStart(8, "0").split("");

          return (
            <div key={i} className="space-y-2">
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono text-[var(--cyber-neon-blue)] bg-[var(--cyber-neon-blue)]/10 px-1.5 py-0.5 rounded border border-[var(--cyber-neon-blue)]/20">
                  {byte.toString(16).padStart(2, "0").toUpperCase()}
                </span>
                {bytes.length > 1 && (
                  <span className="text-xs font-mono text-[var(--text-dim)] uppercase opacity-60">
                    Byte {i}
                  </span>
                )}
              </div>

              <div className="flex gap-1">
                {bits.map((bit, bitIdx) => {
                  const actualBitIdx = 7 - bitIdx;
                  let bitColor: string;
                  let label: string;
                  const isMsb = actualBitIdx === 7;

                  if (isMsb) {
                    bitColor = "var(--cyber-neon-pink)";
                    label = "MSB";
                  } else if (i === 0) {
                    if (actualBitIdx <= 2) {
                      bitColor = "var(--cyber-neon-yellow)";
                      label = "TYPE";
                    } else {
                      bitColor = "var(--cyber-neon-blue)";
                      label = "NUM";
                    }
                  } else {
                    bitColor = "var(--cyber-neon-blue)";
                    label = "NUM";
                  }

                  return (
                    <div
                      key={bitIdx}
                      className="flex flex-col items-center flex-1 min-w-0"
                    >
                      <div
                        className="w-full h-6 flex items-center justify-center font-mono text-xs border border-transparent transition-all"
                        style={{
                          backgroundColor: `color-mix(in srgb, ${bitColor}, transparent 90%)`,
                          borderColor: `color-mix(in srgb, ${bitColor}, transparent 70%)`,
                          color: bitColor,
                        }}
                      >
                        {bit}
                      </div>
                      <div
                        className="text-xs font-mono mt-1 opacity-60 overflow-hidden"
                        style={{ color: bitColor }}
                      >
                        {label}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}

        <div className="grid grid-cols-2 gap-4 mt-1 pt-3 border-t border-[var(--border-light)]/30">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-[var(--cyber-neon-blue)]" />
            <span className="text-xs font-mono text-[var(--text-dim)] uppercase tracking-tighter">
              Field #{fieldNumber}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-[var(--cyber-neon-yellow)]" />
            <span className="text-xs font-mono text-[var(--text-dim)] uppercase tracking-tighter">
              Wire Type {wireType}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

const TagCalculator = () => {
  const [mode, setMode] = useState<"small" | "large">("small");

  const examples = {
    small: {
      field: 1,
      type: 2,
      label: "Length-Delimited",
      bytes: [
        {
          bits: [0, 0, 0, 0, 1, 0, 1, 0],
          labels: ["MSB", "NUM", "NUM", "NUM", "NUM", "TYPE", "TYPE", "TYPE"],
          colors: [
            "pink",
            "blue",
            "blue",
            "blue",
            "blue",
            "yellow",
            "yellow",
            "yellow",
          ],
        },
      ],
      steps: [
        {
          label: "1. Combined Value",
          math: "(field << 3) | type",
          calc: "(1 << 3) | 2",
          res: "10",
          color: "var(--text-color)",
        },
        {
          label: "2. Varint Byte 0",
          math: "val & 0b01111111",
          calc: "10 & 0b01111111",
          res: "0b00001010",
          color: "var(--cyber-neon-green)",
          bold: true,
        },
      ],
    },
    large: {
      field: 16,
      type: 2,
      label: "Length-Delimited",
      bytes: [
        {
          bits: [1, 0, 0, 0, 0, 0, 1, 0],
          labels: ["MSB", "NUM", "NUM", "NUM", "NUM", "TYPE", "TYPE", "TYPE"],
          colors: [
            "pink",
            "blue",
            "blue",
            "blue",
            "blue",
            "yellow",
            "yellow",
            "yellow",
          ],
        },
        {
          bits: [0, 0, 0, 0, 0, 0, 0, 1],
          labels: ["MSB", "NUM", "NUM", "NUM", "NUM", "NUM", "NUM", "NUM"],
          colors: [
            "pink",
            "blue",
            "blue",
            "blue",
            "blue",
            "blue",
            "blue",
            "blue",
          ],
        },
      ],
      steps: [
        {
          label: "1. Combined Value",
          math: "(field << 3) | type",
          calc: "(16 << 3) | 2",
          res: "130",
          color: "var(--text-color)",
        },
        {
          label: "2. Varint Byte 0",
          math: "(val & 0b01111111) | 0b10000000",
          calc: "(130 & 0b01111111) | 0b10000000",
          res: "0b10000010",
          color: "var(--cyber-neon-pink)",
        },
        {
          label: "3. Varint Byte 1",
          math: "val >> 7",
          calc: "130 >> 7",
          res: "0b00000001",
          color: "var(--cyber-neon-green)",
          bold: true,
        },
      ],
    },
  };

  const current = examples[mode];

  return (
    <CyberPanel
      title="TAG_BIT_STRUCTURE"
      headerExtra={
        <div className="flex bg-[var(--overlay-bg)] p-1 rounded border border-[var(--border-light)]">
          <button
            onClick={() => setMode("small")}
            className={`px-3 py-1 text-xs font-mono rounded transition-all ${mode === "small" ? "bg-[var(--cyber-neon-blue)]/20 text-[var(--cyber-neon-blue)]" : "text-[var(--text-dim)] hover:text-[var(--text-color)]"}`}
            aria-label="Show tag for field number 1"
          >
            FIELD_1
          </button>
          <button
            onClick={() => setMode("large")}
            className={`px-3 py-1 text-xs font-mono rounded transition-all ${mode === "large" ? "bg-[var(--cyber-neon-pink)]/20 text-[var(--cyber-neon-pink)]" : "text-[var(--text-dim)] hover:text-[var(--text-color)]"}`}
            aria-label="Show tag for field number 16"
          >
            FIELD_16
          </button>
        </div>
      }
    >
      <div className="p-6 space-y-8">
        <div className="space-y-6">
          {current.bytes.map((byte, byteIdx) => (
            <div key={byteIdx} className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono text-[var(--text-dim)] uppercase opacity-60">
                  Byte {byteIdx}
                </span>
                {byteIdx === 0 && (
                  <span className="text-[10px] font-mono text-[var(--cyber-neon-green)] uppercase">
                    Wire Type 2
                  </span>
                )}
              </div>
              <div className="flex gap-1 h-10">
                {byte.bits.map((bit, i) => {
                  const color = `var(--cyber-neon-${byte.colors[i]})`;
                  return (
                    <div
                      key={i}
                      className="flex-1 flex items-center justify-center font-mono text-base border"
                      style={{
                        backgroundColor: `color-mix(in srgb, ${color}, transparent 90%)`,
                        borderColor: `color-mix(in srgb, ${color}, transparent 70%)`,
                        color: color,
                      }}
                    >
                      {bit}
                    </div>
                  );
                })}
              </div>
              <div className="flex justify-between">
                {byte.labels.map((label, i) => (
                  <div
                    key={i}
                    className="flex-1 text-center text-[7px] font-mono opacity-60 uppercase"
                    style={{ color: `var(--cyber-neon-${byte.colors[i]})` }}
                  >
                    {label}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div className="space-y-4">
          <p className="text-xs text-[var(--text-dim)] leading-relaxed italic">
            {mode === "small"
              ? "Tag value (10) fits in 7 bits, so only one Varint byte is needed."
              : "Tag value (130) exceeds 127, requiring the Varint continuation logic (MSB=1)."}
          </p>
          <div className="p-4 bg-[var(--overlay-bg)] rounded border border-[var(--border-light)] font-mono text-xs space-y-4">
            {current.steps.map((step, i) => (
              <div
                key={i}
                className={`space-y-1 ${step.bold ? "pt-3 mt-3 border-t border-[var(--border-light)]" : ""}`}
              >
                <div className="flex justify-between opacity-50 text-[10px] uppercase">
                  <span>{step.label}</span>
                  <span>{step.math}</span>
                </div>
                <div className="flex justify-between items-baseline">
                  <span className="text-[var(--text-dim)]">{step.calc}</span>
                  <span
                    className="text-base font-bold"
                    style={{ color: step.color }}
                  >
                    = {step.res}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </CyberPanel>
  );
};

const WireFormatBreakdown = () => {
  const wireTypes = [
    {
      type: 0,
      label: "Varint",
      desc: "Most numeric types. Variable length allows small numbers to take very little space.",
      types: ["int32", "int64", "uint32", "uint64", "bool", "enum"],
      color: "var(--cyber-neon-green)",
    },
    {
      type: 1,
      label: "I64",
      desc: "Fixed 64-bit values. Used when values are frequently large or need exact precision.",
      types: ["fixed64", "sfixed64", "double"],
      color: "var(--cyber-neon-blue)",
    },
    {
      type: 2,
      label: "LEN",
      desc: "Length-delimited blobs. Includes a length prefix followed by the payload data.",
      types: ["string", "bytes", "message", "repeated"],
      color: "var(--cyber-neon-pink)",
    },
    {
      type: 5,
      label: "I32",
      desc: "Fixed 32-bit values. Efficient for common hardware types.",
      types: ["fixed32", "sfixed32", "float"],
      color: "var(--cyber-neon-yellow)",
    },
  ];

  return (
    <div className="space-y-12">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {wireTypes.map((wt) => (
          <CyberPanel
            key={wt.type}
            className="hover:border-[var(--cyber-neon-blue)]/50 transition-colors"
          >
            <div className="p-4 space-y-3">
              <h4
                className="font-cyber font-bold uppercase text-sm tracking-widest"
                style={{ color: wt.color }}
              >
                {wt.label}
              </h4>
              <p className="text-xs text-[var(--text-dim)] leading-relaxed min-h-[40px]">
                {wt.desc}
              </p>
              <div className="pt-3 border-t border-[var(--border-light)]">
                <div className="flex flex-wrap gap-1">
                  {wt.types.map((t) => (
                    <span
                      key={t}
                      className="text-xs font-mono px-1.5 py-0.5 bg-[var(--overlay-bg)] border border-[var(--border-light)] rounded opacity-80"
                    >
                      {t}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </CyberPanel>
        ))}
      </div>

      <div className="space-y-16">
        <div className="space-y-6">
          <div className="max-w-4xl">
            <h3 className="text-[var(--cyber-neon-pink)] font-cyber uppercase text-sm font-bold tracking-[0.2em] mb-4">
              Length-Delimited (Wire Type 2)
            </h3>
            <p className="text-sm text-[var(--text-dim)] leading-relaxed">
              Strings, bytes, and nested messages use{" "}
              <strong>Length-Delimited</strong> encoding. These fields include
              an explicit length byte (encoded as a varint) immediately after
              the tag, telling the decoder exactly how many subsequent bytes
              belong to this field.
            </p>
          </div>
          <PacketDiagram />
        </div>

        <div className="pt-12 border-t border-[var(--border-light)]/30 space-y-6">
          <div className="max-w-4xl">
            <h3 className="text-[var(--cyber-neon-green)] font-cyber uppercase text-sm font-bold tracking-[0.2em] mb-4">
              Varint Fields (Wire Type 0)
            </h3>
            <p className="text-sm text-[var(--text-dim)] leading-relaxed">
              Most numeric types use <strong>Wire Type 0</strong>. The length is
              implicit because the decoder reads bytes one by one until it finds
              a byte where the MSB (Most Significant Bit) is 0. This
              "continuation bit" logic allows the payload to be self-delimiting.
            </p>
          </div>
          <VarintPacketDiagram />
        </div>

        <div className="pt-12 border-t border-[var(--border-light)]/30 space-y-6">
          <div className="max-w-4xl">
            <h3 className="text-[var(--cyber-neon-blue)] font-cyber uppercase text-sm font-bold tracking-[0.2em] mb-4">
              Fixed-Size Fields (Wire Type 1, 5)
            </h3>
            <p className="text-sm text-[var(--text-dim)] leading-relaxed">
              For <code>double</code>, <code>fixed64</code> (Wire Type 1), and{" "}
              <code>float</code>, <code>fixed32</code> (Wire Type 5), the length
              is hard-coded into the specification. The decoder knows to read
              exactly 8 or 4 bytes respectively immediately following the tag.
            </p>
          </div>
          <FixedPacketDiagram />
        </div>
      </div>
    </div>
  );
};

const BinaryBasics = () => (
  <div className="space-y-32">
    <div className="max-w-4xl mx-auto text-center space-y-4">
      <p className="text-xl text-[var(--text-dim)] leading-relaxed">
        Before we dig into protobuf encoding, there are three concepts to cover
        when working with binary data: <strong>Endianness</strong>,{" "}
        <strong>
          <ExternalLinkText href="https://en.wikipedia.org/wiki/Bitwise_operation#Bit_shifts">
            bit shifting
          </ExternalLinkText>
        </strong>
        , and the{" "}
        <strong>
          <ExternalLinkText href="https://en.wikipedia.org/wiki/Bitwise_operation#OR">
            bitwise OR operator
          </ExternalLinkText>
        </strong>
        .
      </p>
    </div>

    {/* Endianness */}
    <div className="space-y-8">
      <div className="max-w-4xl mx-auto text-center space-y-4">
        <h3 className="text-3xl font-cyber font-bold text-[var(--text-color)] uppercase tracking-tight">
          Endianness
        </h3>
        <p className="text-lg text-[var(--text-dim)] leading-relaxed">
          Endianness refers to the order in which bytes are arranged in computer
          memory. Protobuf standardizes on <strong>Little-Endian</strong> for
          all fixed-size numeric types and <strong>Base-128 Varints</strong>.
        </p>
        <p className="text-sm text-[var(--text-dim)] leading-relaxed max-w-2xl mx-auto">
          In Little-Endian systems, the "least significant byte" (the one with
          the smallest numerical weight) is stored first.
        </p>
      </div>
      <div className="max-w-4xl mx-auto">
        <CyberPanel title="MEMORY_LAYOUT_VISUALIZATION">
          <MemoryLayoutVisualization />
          <div className="mt-4 p-4 bg-[var(--overlay-bg)] rounded-lg border border-[var(--border-light)] text-center max-w-2xl mx-auto">
            <p className="text-xs text-[var(--text-dim)] leading-relaxed">
              Protobuf stores the{" "}
              <strong className="text-[var(--cyber-neon-green)]">
                Least Significant Byte (Low Weight)
              </strong>{" "}
              at the first memory address. This is why the green part appears to
              come "before" the blue part in the raw binary stream.
            </p>
          </div>
        </CyberPanel>
      </div>

      <div className="mt-16 max-w-4xl mx-auto space-y-12">
        <div className="text-center space-y-4">
          <h3 className="text-3xl font-cyber font-bold text-[var(--text-color)] uppercase tracking-tight">
            Why Little Endian?
          </h3>
          <p className="text-lg text-[var(--text-dim)] leading-relaxed">
            Choosing Little-Endian over the traditional Big-Endian "Network
            Order" was a deliberate engineering decision based on speed and
            scale.
          </p>
        </div>

        <div className="max-w-3xl mx-auto space-y-12">
          <div className="space-y-4">
            <h4 className="text-sm font-cyber font-bold text-[var(--cyber-neon-blue)] uppercase tracking-widest">
              1. Base-128 Mechanics
            </h4>
            <p className="text-sm text-[var(--text-dim)] leading-relaxed">
              The Varint algorithm processes integers by dropping leading
              zeros. It looks at the least significant 7 bits, sets a
              continuation bit, and writes it. Because this loop starts at the
              bottom and works its way up, the least significant bytes are
              inherently written first. Sticking to Little-Endian allows
              encoding and decoding in a single, lightning-fast loop without
              extra buffering or length look-ahead.
            </p>
          </div>
          <div className="space-y-4">
            <h4 className="text-sm font-cyber font-bold text-[var(--cyber-neon-green)] uppercase tracking-widest">
              2. Hardware Synergy
            </h4>
            <p className="text-sm text-[var(--text-dim)] leading-relaxed">
              Google's data centers were built on x86 hardware, which is
              natively Little-Endian. Forcing servers to flip bytes into "network
              order" just to satisfy convention wastes CPU cycles. At Google's
              massive scale, those wasted cycles translate to significant hardware
              and power costs. By aligning the format with the native CPU
              architecture, they optimized for raw performance.
            </p>
          </div>
          <div className="space-y-4">
            <h4 className="text-sm font-cyber font-bold text-[var(--cyber-neon-pink)] uppercase tracking-widest">
              3. Payload vs Transport
            </h4>
            <p className="text-sm text-[var(--text-dim)] leading-relaxed">
              It helps to draw a hard line between transport and payload. TCP/IP
              headers are Big-Endian so routers can read them, but Protobuf is
              an application-layer payload. The network infrastructure never reads
              it. As long as the sending and receiving applications agree on the
              rules, the payload can be formatted in whatever way is most
              computationally efficient for the end hosts.
            </p>
          </div>
        </div>
      </div>
    </div>

    {/* Bit Shifting */}
    <div className="space-y-8">
      <div className="max-w-4xl mx-auto text-center space-y-4">
        <h3 className="text-3xl font-cyber font-bold text-[var(--text-color)] uppercase tracking-tight">
          Bit Shifting
        </h3>
        <p className="text-lg text-[var(--text-dim)] leading-relaxed">
          Bitwise shifting is the primary tool for <strong>Bit Packing</strong>.
          In Protobuf, we frequently shift field numbers to the left to "make
          room" for the wire type metadata.
        </p>
        <p className="text-sm text-[var(--text-dim)] leading-relaxed max-w-2xl mx-auto">
          A left shift (<code>&lt;&lt;</code>) moves every bit in a number a
          specific number of places to the left. The vacated spots on the right
          are filled with zeroes. This is mathematically equivalent to
          multiplying by <code>2^n</code>.
        </p>
      </div>
      <div className="max-w-3xl mx-auto">
        <CyberPanel title="LEFT_SHIFT_LOGIC (<< 3)">
          <div className="p-8 space-y-6 font-mono text-sm">
            <div className="space-y-2">
              <div className="flex justify-between text-[var(--text-dim)] uppercase text-xs">
                <span>1. Original bits (Field #1)</span>
                <span className="text-[var(--cyber-neon-blue)]">00001</span>
              </div>
              <div className="flex gap-1 h-10">
                {[0, 0, 0, 0, 1].map((b, i) => (
                  <div
                    key={i}
                    className="flex-1 flex items-center justify-center border border-[var(--cyber-neon-blue)]/30 bg-[var(--cyber-neon-blue)]/10 text-[var(--cyber-neon-blue)] text-lg rounded-sm"
                  >
                    {b}
                  </div>
                ))}
                <div className="w-16 flex items-center justify-center text-xl font-bold">
                  {"<<"}
                </div>
                <div className="w-12 flex items-center justify-center text-xl text-[var(--cyber-neon-pink)] font-bold">
                  3
                </div>
              </div>
            </div>

            <div className="relative h-12">
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-px h-full bg-gradient-to-b from-transparent via-[var(--border-light)] to-transparent"></div>
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between text-[var(--text-dim)] uppercase text-xs">
                <span>2. Result (Value 8)</span>
                <span>01000</span>
              </div>
              <div className="flex gap-1 h-10">
                <div className="flex-[0.625] flex gap-1">
                  {[0, 1, 0, 0, 0].map((b, i) => (
                    <div
                      key={i}
                      className={`flex-1 flex items-center justify-center border ${i === 1 ? "border-[var(--cyber-neon-blue)]/50 bg-[var(--cyber-neon-blue)]/20 text-[var(--cyber-neon-blue)]" : "border-[var(--border-light)] text-[var(--text-dim)]"} text-lg rounded-sm`}
                    >
                      {b}
                    </div>
                  ))}
                </div>
                <div className="flex-[0.375] flex gap-1">
                  <div className="flex-1 flex items-center justify-center border border-[var(--cyber-neon-pink)]/40 bg-[var(--cyber-neon-pink)]/10 text-[var(--cyber-neon-pink)] text-lg rounded-sm">
                    0
                  </div>
                  <div className="flex-1 flex items-center justify-center border border-[var(--cyber-neon-pink)]/40 bg-[var(--cyber-neon-pink)]/10 text-[var(--cyber-neon-pink)] text-lg rounded-sm">
                    0
                  </div>
                  <div className="flex-1 flex items-center justify-center border border-[var(--cyber-neon-pink)]/40 bg-[var(--cyber-neon-pink)]/10 text-[var(--cyber-neon-pink)] text-lg rounded-sm">
                    0
                  </div>
                </div>
              </div>
              <div className="flex justify-between text-[10px] opacity-40 uppercase">
                <span>Original shifted left</span>
                <span className="text-[var(--cyber-neon-pink)]">
                  3 New Zeroes
                </span>
              </div>
            </div>
          </div>
        </CyberPanel>
      </div>
    </div>

    {/* OR Operation */}
    <div className="space-y-8">
      <div className="max-w-4xl mx-auto text-center space-y-4">
        <h3 className="text-3xl font-cyber font-bold text-[var(--text-color)] uppercase tracking-tight">
          The OR Operation
        </h3>
        <p className="text-lg text-[var(--text-dim)] leading-relaxed">
          The bitwise <strong>OR</strong> (<code>|</code>) is used to combine
          binary values. It acts like a logic gate: if either input bit is{" "}
          <code>1</code>, the output bit is <code>1</code>.
        </p>
        <p className="text-sm text-[var(--text-dim)] leading-relaxed max-w-2xl mx-auto">
          In Protobuf, this is the final assembly step. We take the shifted
          field number (which now has three <code>0</code>s at the end) and "OR"
          it with the 3-bit wire type. This effectively plugs the wire type into
          the empty slot.
        </p>
      </div>
      <div className="max-w-3xl mx-auto">
        <CyberPanel title="BITWISE_MERGE_LOGIC">
          <div className="p-8 flex flex-col gap-3 font-mono">
            <div className="flex items-center justify-between px-6 py-4 bg-[var(--cyber-neon-blue)]/5 border border-[var(--cyber-neon-blue)]/20 rounded-lg group hover:border-[var(--cyber-neon-blue)]/40 transition-colors">
              <div className="flex flex-col">
                <span className="text-[10px] uppercase opacity-50 mb-1">
                  Shifted Field
                </span>
                <span className="text-xl tracking-[0.2em] text-[var(--cyber-neon-blue)]">
                  00001 <span className="opacity-30">000</span>
                </span>
              </div>
              <span className="text-xs text-[var(--text-dim)]">
                #1 {"<<"} 3
              </span>
            </div>

            <div className="flex items-center justify-center text-2xl text-[var(--text-dim)] font-bold py-2">
              <span className="bg-[var(--section-bg-dark)] px-4 py-1 rounded-full border border-[var(--border-light)] text-xs">
                OR
              </span>
            </div>

            <div className="flex items-center justify-between px-6 py-4 bg-[var(--cyber-neon-yellow)]/5 border border-[var(--cyber-neon-yellow)]/20 rounded-lg group hover:border-[var(--cyber-neon-yellow)]/40 transition-colors">
              <div className="flex flex-col">
                <span className="text-[10px] uppercase opacity-50 mb-1">
                  Wire Type
                </span>
                <span className="text-xl tracking-[0.2em] text-[var(--cyber-neon-yellow)]">
                  <span className="opacity-30">00000</span> 010
                </span>
              </div>
              <span className="text-xs text-[var(--text-dim)]">Type 2</span>
            </div>

            <div className="mt-6 pt-6 border-t-2 border-dashed border-[var(--border-light)] flex items-center justify-between px-6">
              <div className="flex flex-col">
                <span className="text-xs uppercase font-bold text-[var(--cyber-neon-green)] mb-1 tracking-widest">
                  Final Encoded Tag
                </span>
                <span className="text-2xl tracking-[0.3em] font-bold">
                  <span className="text-[var(--cyber-neon-blue)]">00001</span>
                  <span className="text-[var(--cyber-neon-yellow)]">010</span>
                </span>
              </div>
              <div className="text-right">
                <span className="block text-2xl font-bold text-[var(--cyber-neon-green)]">
                  0A
                </span>
                <span className="text-[10px] opacity-50 uppercase">
                  Hex Result
                </span>
              </div>
            </div>
          </div>
        </CyberPanel>
      </div>
    </div>
  </div>
);

export const BinaryMatrix = ({
  messageSchema,
  fds,
}: {
  messageSchema: DescMessage | null;
  fds: Uint8Array | null;
}) => {
  const [activeExample, setActiveExample] = useState<
    keyof typeof SIZE_EXAMPLES | null
  >("BASIC");
  const [jsonInput, setJsonInput] = useState(
    JSON.stringify(SIZE_EXAMPLES.BASIC, null, 2),
  );
  const [selectedSegmentIdx, setSelectedSegmentIdx] = useState<number | null>(
    0,
  );
  const [isGenerating, setIsGenerating] = useState(false);
  const [viewMode, setViewMode] = useState<"hex" | "scope">("hex");
  const [protoscopeOutput, setProtoscopeOutput] = useState("");

  const stats = useMemo(() => {
    if (!messageSchema)
      return { binary: new Uint8Array(), segments: [], error: "NO_SCHEMA" };
    try {
      const obj = JSON.parse(jsonInput);
      const user = fromJson(messageSchema, obj, { ignoreUnknownFields: true });
      const binary = toBinary(messageSchema, user);
      const segments = decodeBinary(binary, messageSchema);
      return { binary, segments, error: null };
    } catch (e: unknown) {
      const error = e instanceof Error ? e.message : String(e);
      return { binary: new Uint8Array(), segments: [], error };
    }
  }, [jsonInput, messageSchema]);

  React.useEffect(() => {
    if (stats.binary.length > 0) {
      convertToProtoscope(stats.binary)
        .then(setProtoscopeOutput)
        .catch(console.error);
    }
  }, [stats.binary]);

  const handleExampleChange = (key: keyof typeof SIZE_EXAMPLES) => {
    setActiveExample(key);
    const example = SIZE_EXAMPLES[key];
    setJsonInput(JSON.stringify(example, null, 2));
    setSelectedSegmentIdx(0);
  };

  const handleGenerateFake = async () => {
    if (!fds || !messageSchema) return;
    setIsGenerating(true);
    try {
      const fakeData = await generateFake(messageSchema.typeName, fds);
      setJsonInput(fakeData);
      setActiveExample(null);
      setSelectedSegmentIdx(0);
    } catch (e) {
      console.error(e);
    } finally {
      setIsGenerating(false);
    }
  };

  const selectedSegment =
    selectedSegmentIdx !== null ? stats.segments[selectedSegmentIdx] : null;

  const getSegmentColor = (seg: DecodedSegment) => {
    switch (seg.wireType) {
      case 0:
        return "var(--cyber-neon-green)";
      case 1:
        return "var(--cyber-neon-blue)";
      case 2:
        return "var(--cyber-neon-pink)";
      case 5:
        return "var(--cyber-neon-yellow)";
      default:
        return "var(--text-dim)";
    }
  };

  return (
    <Section
      id="matrix"
      className="py-24 px-4 sm:px-8 bg-[var(--section-bg-dark)] border-t border-[var(--border-light)]"
    >
      <div className="max-w-7xl mx-auto">
        <SectionTitle icon={Binary} subtitle="05b_EXPLORER">
          Segment Explorer
        </SectionTitle>

        <div className="mb-16 space-y-6">
          <p className="text-[var(--text-dim)] leading-relaxed max-w-4xl">
            When multiple fields are sent together, they are simply concatenated
            one after another in the binary stream. The decoder reads the{" "}
            <strong>Tag</strong> of the first field, uses it to determine how
            many bytes to read, and then repeats the process for the next field
            until the end of the stream is reached.
          </p>
          <MultiFieldEncoding />
        </div>

        <div className="flex flex-wrap gap-4 items-center justify-between mb-8">
          <div className="flex flex-wrap gap-2">
            {(
              Object.keys(SIZE_EXAMPLES) as Array<keyof typeof SIZE_EXAMPLES>
            ).map((key) => (
              <button
                key={key}
                onClick={() => handleExampleChange(key)}
                className={`px-3 py-1 text-xs font-cyber font-bold border transition-all rounded-md ${
                  activeExample === key
                    ? "bg-[var(--cyber-neon-blue)] border-[var(--cyber-neon-blue)] text-black shadow-[0_0_10px_rgba(0,243,255,0.3)]"
                    : "bg-[var(--overlay-bg)] border-[var(--border-light)] text-[var(--text-dim)] hover:border-white/30 hover:text-[var(--text-color)]"
                }`}
                aria-label={`Load ${key} example`}
              >
                {key}
              </button>
            ))}
          </div>
          <button
            onClick={handleGenerateFake}
            disabled={isGenerating || !fds}
            className="px-4 py-1.5 text-xs font-cyber font-bold border border-[var(--cyber-neon-pink)] bg-[var(--cyber-neon-pink)] text-black hover:bg-[var(--cyber-neon-pink)]/90 transition-all flex items-center gap-2 disabled:opacity-30 disabled:cursor-not-allowed rounded-md shadow-[0_0_15px_rgba(255,0,255,0.4)]"
            aria-label="Generate Random Data"
          >
            <Zap
              className={`w-3.5 h-3.5 ${isGenerating ? "animate-spin" : ""}`}
            />
            {isGenerating ? "GENERATING..." : "RANDOMIZE"}
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 relative">
          {/* Global Interactive Sign for Large Screens */}
          <div className="absolute -left-48 top-48 hidden xl:flex flex-col items-end gap-2 text-[var(--cyber-neon-pink)] pointer-events-none animate-pulse z-10 opacity-70">
            <span className="font-cyber text-xs uppercase tracking-widest text-right">
              These Panels
              <br />
              Are Live!
              <br />
              Change The Data
            </span>
            <div className="flex gap-2">
              <svg
                width="40"
                height="24"
                viewBox="0 0 40 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M0 12h30" />
                <path d="M24 6l6 6-6 6" />
              </svg>
            </div>
          </div>

          {/* Left: Input & Hex View */}
          <div className="space-y-8">
            <CyberPanel title="JSON_INPUT">
              <div className="h-64">
                <JsonEditor
                  value={jsonInput}
                  onChange={setJsonInput}
                  className="h-full rounded-none border-none bg-transparent"
                />
              </div>
            </CyberPanel>

            <CyberPanel
              title={
                viewMode === "hex" ? "ENCODED_STREAM (HEX)" : "PROTOSCOPE_VIEW"
              }
              headerExtra={
                <div className="flex bg-[var(--overlay-bg)] p-1 rounded border border-[var(--border-light)]">
                  <button
                    onClick={() => setViewMode("hex")}
                    className={`px-3 py-1 text-xs font-mono rounded transition-all ${viewMode === "hex" ? "bg-[var(--cyber-neon-blue)]/20 text-[var(--cyber-neon-blue)]" : "text-[var(--text-dim)] hover:text-[var(--text-color)]"}`}
                    aria-label="Switch to HEX view"
                  >
                    HEX
                  </button>
                  <button
                    onClick={() => setViewMode("scope")}
                    className={`px-3 py-1 text-xs font-mono rounded transition-all ${viewMode === "scope" ? "bg-[var(--cyber-neon-pink)]/20 text-[var(--cyber-neon-pink)]" : "text-[var(--text-dim)] hover:text-[var(--text-color)]"}`}
                    aria-label="Switch to Protoscope view"
                  >
                    SCOPE
                  </button>
                </div>
              }
            >
              <div className="p-4 space-y-4">
                {viewMode === "hex" ? (
                  <>
                    <div className="flex flex-col gap-2 font-mono text-sm leading-relaxed max-h-128 overflow-y-auto pr-2 custom-scrollbar">
                      {stats.segments.map((seg, i) => {
                        const color = getSegmentColor(seg);
                        const isActive = selectedSegmentIdx === i;

                        return (
                          <motion.button
                            key={i}
                            onClick={() => setSelectedSegmentIdx(i)}
                            className={`group relative grid grid-cols-[1rem_1fr_auto] items-center gap-4 p-2 rounded-lg border transition-all text-left ${isActive ? "bg-[var(--overlay-bg)] border-[var(--border-light)]" : "border-transparent hover:bg-[var(--overlay-bg)]/50"}`}
                            aria-label={`Inspect segment ${i}${seg.fieldName ? `: ${seg.fieldName}` : ""}`}
                          >
                            <div className="flex justify-center">
                              {isActive && (
                                <motion.div layoutId="selection-arrow">
                                  <ChevronRight className="w-4 h-4 text-[var(--cyber-neon-blue)]" />
                                </motion.div>
                              )}
                            </div>

                            <div className="flex flex-wrap gap-1 min-w-0">
                              {seg.rawHex.map((byte, byteIdx) => {
                                let byteColor = color;
                                if (byteIdx === 0)
                                  byteColor = "var(--cyber-neon-blue)";
                                else if (seg.wireType === 2 && byteIdx === 1)
                                  byteColor = "var(--cyber-neon-yellow)";

                                return (
                                  <span
                                    key={byteIdx}
                                    className="px-1.5 py-0.5 rounded border font-mono text-xs transition-colors"
                                    style={{
                                      borderColor: isActive
                                        ? byteColor
                                        : "var(--border-light)",
                                      backgroundColor: isActive
                                        ? `color-mix(in srgb, ${byteColor}, transparent 80%)`
                                        : "transparent",
                                      color: isActive
                                        ? byteColor
                                        : "var(--text-color)",
                                    }}
                                  >
                                    {byte}
                                  </span>
                                );
                              })}
                            </div>

                            {seg.fieldName && (
                              <span
                                className={`text-xs uppercase font-cyber tracking-widest opacity-60 flex-shrink-0 ${isActive ? "text-[var(--text-color)]" : "text-[var(--text-dim)]"}`}
                              >
                                {seg.fieldName}
                              </span>
                            )}
                          </motion.button>
                        );
                      })}
                    </div>
                    <div className="pt-4 border-t border-[var(--border-light)] flex flex-wrap gap-4">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-[var(--cyber-neon-blue)]" />
                        <span className="text-xs font-mono text-[var(--text-dim)] uppercase">
                          Tag
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-[var(--cyber-neon-yellow)]" />
                        <span className="text-xs font-mono text-[var(--text-dim)] uppercase">
                          Length
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-[var(--cyber-neon-green)]" />
                        <span className="text-xs font-mono text-[var(--text-dim)] uppercase">
                          Payload
                        </span>
                      </div>
                    </div>
                  </>
                ) : (
                  <pre className="font-mono text-sm text-[var(--cyber-neon-pink)] leading-relaxed max-h-128 overflow-auto custom-scrollbar p-2 bg-[var(--section-bg-dark)]/30 rounded border border-[var(--border-light)]">
                    {protoscopeOutput}
                  </pre>
                )}
                <p className="text-xs font-mono text-[var(--text-dim)] uppercase tracking-widest">
                  {viewMode === "hex"
                    ? "Click a segment to investigate its structure"
                    : "Disassembled binary stream (schema-agnostic)"}
                </p>
              </div>
            </CyberPanel>
          </div>

          {/* Right: Segment Analysis */}
          <div className="space-y-8">
            <CyberPanel
              title="SEGMENT_INSPECTOR"
              className="h-full flex flex-col min-h-[500px]"
            >
              <div className="p-6 flex-1 space-y-8">
                {selectedSegment ? (
                  <div className="space-y-8">
                    <div className="grid grid-cols-2 gap-8">
                      <div className="space-y-1">
                        <span className="text-xs font-mono text-[var(--text-dim)] uppercase tracking-widest">
                          {selectedSegment.fieldName
                            ? `Field: ${selectedSegment.fieldName}`
                            : "Field ID"}
                        </span>
                        <div className="text-2xl font-cyber font-bold text-[var(--text-color)]">
                          #{selectedSegment.tag}
                        </div>
                      </div>
                      <div className="space-y-1">
                        <span className="text-xs font-mono text-[var(--text-dim)] uppercase tracking-widest">
                          Wire Type
                        </span>
                        <div className="text-2xl font-cyber font-bold text-[var(--cyber-neon-blue)]">
                          {selectedSegment.wireType}
                        </div>
                      </div>
                    </div>

                    <div className="space-y-6">
                      <TagSectionBreakdown
                        bytes={selectedSegment.tagBytes}
                        fieldNumber={selectedSegment.tag}
                        wireType={selectedSegment.wireType}
                      />
                      {selectedSegment.lengthBytes && (
                        <ByteBreakdown
                          label="Length Section"
                          bytes={selectedSegment.lengthBytes}
                          color="var(--cyber-neon-yellow)"
                        />
                      )}
                      <ByteBreakdown
                        label="Payload Section"
                        bytes={selectedSegment.payloadBytes}
                        color={getSegmentColor(selectedSegment)}
                      />
                    </div>

                    <div className="p-4 bg-[var(--overlay-bg)] border border-[var(--border-light)] rounded-lg space-y-4">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-mono text-[var(--text-dim)] uppercase">
                          Semantic Value{" "}
                          {selectedSegment.fieldType &&
                            `(${selectedSegment.fieldType})`}
                        </span>
                        <span className="text-xs font-mono px-1.5 py-0.5 bg-[var(--cyber-neon-blue)]/10 text-[var(--cyber-neon-blue)] rounded uppercase">
                          {selectedSegment.wireType === 0
                            ? "Varint"
                            : selectedSegment.wireType === 2
                              ? "Length-Delimited"
                              : "Fixed"}
                        </span>
                      </div>
                      <div className="text-lg font-mono text-[var(--text-color)] break-all">
                        {selectedSegment.value.toString()}
                      </div>
                    </div>

                    <div className="space-y-3">
                      <div className="flex items-center gap-2">
                        <MousePointer2 className="w-4 h-4 text-[var(--cyber-neon-blue)]" />
                        <span className="text-xs font-cyber font-bold uppercase tracking-widest">
                          Wire Logic
                        </span>
                      </div>
                      <pre className="p-4 bg-[var(--section-bg-dark)] border border-[var(--border-light)] rounded font-mono text-xs leading-relaxed text-[var(--text-dim)]">
                        {selectedSegment.wireType === 0 &&
                          `// Wire Type 0: Read varint until MSB=0\nval = decodeVarint(stream)`}
                        {selectedSegment.wireType === 2 &&
                          `// Wire Type 2: Read length varint, then N bytes\nlen = decodeVarint(stream)\ndata = readBytes(len)`}
                        {(selectedSegment.wireType === 1 ||
                          selectedSegment.wireType === 5) &&
                          `// Fixed Size: Read exactly ${selectedSegment.wireType === 1 ? "8" : "4"} bytes\ndata = readBytes(${selectedSegment.wireType === 1 ? "8" : "4"})`}
                      </pre>
                    </div>
                  </div>
                ) : (
                  <div className="h-full flex flex-col items-center justify-center text-[var(--text-dim)] gap-4 py-20">
                    <SearchCheck className="w-12 h-12 opacity-20" />
                    <p className="font-cyber text-sm uppercase tracking-widest opacity-40">
                      Select a segment to analyze
                    </p>
                  </div>
                )}
              </div>
            </CyberPanel>
          </div>
        </div>
      </div>
    </Section>
  );
};

const BinaryPage = ({
  messageSchema,
  fds,
  protoSource,
  setProtoSource,
}: {
  messageSchema: DescMessage | null;
  fds: Uint8Array | null;
  protoSource: string;
  setProtoSource: (s: string) => void;
}) => (
  <>
    {/* 1. Introduction & Roadmap */}
    <Section
      id="binary-intro"
      className="py-24 px-4 sm:px-8 bg-[var(--bg-color)]"
    >
      <div className="max-w-7xl mx-auto">
        <SectionTitle icon={Binary} subtitle="05_WIRE_FORMAT">
          Digging into the binary
        </SectionTitle>

        <div className="mb-16 max-w-4xl space-y-6 mx-auto text-center">
          <p className="text-lg text-[var(--text-dim)] leading-relaxed">
            To understand how Protobuf achieves its performance, we must look at
            the raw bytes. On this page, we will journey through the physical
            layer of the specification:
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pt-8 text-left">
            <div className="space-y-4">
              <div className="flex gap-3 items-start">
                <div className="w-8 h-8 rounded bg-[var(--cyber-neon-green)]/10 border border-[var(--cyber-neon-green)]/30 flex items-center justify-center shrink-0 font-mono text-xs text-[var(--cyber-neon-green)]">
                  01
                </div>
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-[var(--text-color)]">
                    Binary Primitives
                  </h4>
                  <p className="text-xs text-[var(--text-dim)] mt-1">
                    Foundational concepts like Endianness and Bit Shifting.
                  </p>
                </div>
              </div>
              <div className="flex gap-3 items-start">
                <div className="w-8 h-8 rounded bg-[var(--cyber-neon-blue)]/10 border border-[var(--cyber-neon-blue)]/30 flex items-center justify-center shrink-0 font-mono text-xs text-[var(--cyber-neon-blue)]">
                  02
                </div>
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-[var(--text-color)]">
                    Base-128 Varint Encoding
                  </h4>
                  <p className="text-xs text-[var(--text-dim)] mt-1">
                    The fundamental compression technique for integers.
                  </p>
                </div>              </div>
            </div>
            <div className="space-y-4">
              <div className="flex gap-3 items-start">
                <div className="w-8 h-8 rounded bg-[var(--cyber-neon-yellow)]/10 border border-[var(--cyber-neon-yellow)]/30 flex items-center justify-center shrink-0 font-mono text-xs text-[var(--cyber-neon-yellow)]">
                  03
                </div>
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-[var(--text-color)]">
                    The Tag System
                  </h4>
                  <p className="text-xs text-[var(--text-dim)] mt-1">
                    How field numbers and wire types are packed into bytes.
                  </p>
                </div>
              </div>
              <div className="flex gap-3 items-start">
                <div className="w-8 h-8 rounded bg-[var(--cyber-neon-pink)]/10 border border-[var(--cyber-neon-pink)]/30 flex items-center justify-center shrink-0 font-mono text-xs text-[var(--cyber-neon-pink)]">
                  04
                </div>
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-[var(--text-color)]">
                    Wire Types
                  </h4>
                  <p className="text-xs text-[var(--text-dim)] mt-1">
                    Physical formats (Varint, Fixed, Length-Delimited).
                  </p>
                </div>
              </div>
            </div>
            <div className="space-y-4">
              <div className="flex gap-3 items-start">
                <div className="w-8 h-8 rounded bg-[var(--cyber-neon-cyan)]/10 border border-[var(--cyber-neon-cyan)]/30 flex items-center justify-center shrink-0 font-mono text-xs text-[var(--cyber-neon-cyan)]">
                  05
                </div>
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-[var(--text-color)]">
                    Stream Explorer
                  </h4>
                  <p className="text-xs text-[var(--text-dim)] mt-1">
                    Live inspection and schema-agnostic disassembly.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="pt-24 mt-24 border-t border-[var(--border-light)]/30">
          <SectionTitle icon={Zap} subtitle="05_BASICS">
            Foundations: Binary 101
          </SectionTitle>
          <BinaryBasics />
        </div>
      </div>
    </Section>

    {/* 1.2 Varints */}
    <Section
      id="varints"
      className="py-24 px-4 sm:px-8 bg-[var(--bg-color)] border-t border-[var(--border-light)]/30"
    >
      <div className="max-w-7xl mx-auto space-y-16">
        <div className="max-w-4xl mx-auto text-center space-y-6">
          <h3 className="text-4xl font-cyber font-bold text-[var(--text-color)] uppercase tracking-tight">
            Base-128 Varint Encoding
          </h3>
          <p className="text-xl text-[var(--text-dim)] leading-relaxed">
            Varints are the fundamental building block of Protobuf efficiency,
            allowing integers to occupy only as many bytes as necessary.
          </p>
          <div className="max-w-3xl mx-auto text-[var(--text-dim)] leading-relaxed space-y-4 text-left bg-[var(--section-bg-dark)] p-8 rounded-xl border border-[var(--border-light)]">
            <p>
              Standard integers in memory take 4 or 8 bytes regardless of their
              value. Varints use <strong>Base-128 Serialization</strong> to
              represent smaller numbers with fewer bytes.
            </p>
            <p>
              Each byte in a varint, except the last byte, has the{" "}
              <strong>most significant bit (MSB)</strong> set to <code>1</code>.
              This acts as a continuation flag, telling the decoder "more bytes
              are coming."
            </p>
            <p>
              The lower 7 bits of each byte store the data in groups of 7,{" "}
              <strong>least significant group first</strong>. This means
              Protobuf uses a Little-Endian approach even at the bit-group
              level.
            </p>
          </div>
        </div>

        <div className="max-w-5xl mx-auto">
          <VarintExplainer />
        </div>
      </div>
    </Section>

    {/* 1.5 The Tag Specification */}
    <Section
      id="binary-tag"
      className="py-24 px-4 sm:px-8 bg-[var(--bg-color)] border-t border-[var(--border-light)]/30"
    >
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 items-start">
          <div className="lg:col-span-7 space-y-8">
            <h3 className="text-3xl font-cyber font-bold text-[var(--text-color)] uppercase tracking-tight">
              The Field Tag
            </h3>
            <p className="text-lg text-[var(--text-dim)] leading-relaxed">
              Every field in a Protobuf message is prefixed by a{" "}
              <strong>Tag</strong>. This tag is the only reason the decoder
              knows which field it's currently processing and how to interpret
              the bytes that follow.
            </p>

            <div className="space-y-6">
              <div className="p-6 bg-[var(--section-bg-dark)] border-l-4 border-[var(--cyber-neon-blue)] rounded-r-xl">
                <h4 className="text-xs font-bold text-[var(--cyber-neon-blue)] uppercase tracking-widest mb-2">
                  Tag Composition
                </h4>
                <p className="text-sm text-[var(--text-dim)] leading-relaxed">
                  A tag is a single <strong>Varint</strong> that combines two
                  pieces of information:
                </p>
                <ul className="mt-4 space-y-3">
                  <li className="flex items-center gap-3">
                    <div className="w-1.5 h-1.5 rounded-full bg-[var(--cyber-neon-blue)]" />
                    <span className="text-sm text-[var(--text-color)]">
                      <strong>Field Number</strong> (bits 3 through N)
                    </span>
                  </li>
                  <li className="flex items-center gap-3">
                    <div className="w-1.5 h-1.5 rounded-full bg-[var(--cyber-neon-yellow)]" />
                    <span className="text-sm text-[var(--text-color)]">
                      <strong>Wire Type</strong> (the bottom 3 bits)
                    </span>
                  </li>
                </ul>
              </div>

              <p className="text-[var(--text-dim)] leading-relaxed">
                The formula for the tag value is{" "}
                <code>(field_number &lt;&lt; 3) | wire_type</code>. While small
                field numbers fit in a single byte, larger ones (16 and above)
                will trigger the Varint continuation logic and require
                additional bytes.
              </p>
            </div>
          </div>

          <div className="lg:col-span-5">
            <TagCalculator />
          </div>
        </div>
      </div>
    </Section>

    {/* 2. Wire Types & Envelope Strategies */}
    <Section
      id="wire-types"
      className="py-24 px-4 sm:px-8 bg-[var(--section-bg-alt)]/20 border-y border-[var(--border-light)]"
    >
      <div className="max-w-7xl mx-auto">
        <SectionTitle icon={Layers} subtitle="05a_STRUCTURE">
          Wire Types & Envelopes
        </SectionTitle>
        <div className="mb-16 max-w-3xl">
          <p className="text-[var(--text-dim)] leading-relaxed">
            Every field on the wire is wrapped in an "envelope" that tells the
            decoder two things: <strong>which field number</strong> it is, and{" "}
            <strong>how to read</strong> the payload. These are packed into a
            single Tag byte.
          </p>
        </div>
        <WireFormatBreakdown />
      </div>
    </Section>

    {/* 3. The Explorer Matrix */}
    <BinaryMatrix messageSchema={messageSchema} fds={fds} />

    {/* 4. Protoscope Section */}
    <Section
      id="protoscope"
      className="py-24 px-4 sm:px-8 bg-[var(--section-bg-alt)] border-t border-[var(--border-light)]"
    >
      <div className="max-w-7xl mx-auto">
        <SectionTitle icon={SearchCheck} subtitle="05c_DEBUGGING">
          Protoscope
        </SectionTitle>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 mb-12">
          <div className="lg:col-span-7 space-y-6">
            <h3 className="text-2xl font-cyber font-bold text-[var(--text-color)] uppercase tracking-tight">
              The Wire-Level Language
            </h3>
            <p className="text-lg text-[var(--text-dim)] leading-relaxed">
              <strong>Protoscope</strong> is a specialized tool and
              human-editable language designed for inspecting, debugging, and
              manually constructing Protocol Buffers wire format data.
            </p>
            <p className="text-[var(--text-dim)] leading-relaxed">
              Standard tools like <code>protoc</code> require a{" "}
              <code>.proto</code> schema to make sense of binary data.
              Protoscope is different: it operates at the{" "}
              <strong>wire level</strong>, decoding the underlying binary
              structure (varints, tags, and length-prefixes) using heuristics,
              even when the original schema is missing.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-4">
              <div className="space-y-3">
                <h4 className="font-cyber font-bold text-xs text-[var(--cyber-neon-green)] uppercase tracking-widest">
                  Strengths
                </h4>
                <ul className="space-y-2">
                  <li className="text-xs text-[var(--text-dim)] flex gap-2">
                    <span className="text-[var(--cyber-neon-green)]">+</span>
                    <p>Schema-agnostic debugging of any Protobuf stream.</p>
                  </li>
                  <li className="text-xs text-[var(--text-dim)] flex gap-2">
                    <span className="text-[var(--cyber-neon-green)]">+</span>
                    <p>
                      Perfect for crafting malformed messages for security
                      testing.
                    </p>
                  </li>
                  <li className="text-xs text-[var(--text-dim)] flex gap-2">
                    <span className="text-[var(--cyber-neon-green)]">+</span>
                    <p>
                      Human-readable representation of complex binary
                      structures.
                    </p>
                  </li>
                </ul>
              </div>
              <div className="space-y-3">
                <h4 className="font-cyber font-bold text-xs text-[var(--cyber-neon-pink)] uppercase tracking-widest">
                  Weaknesses
                </h4>
                <ul className="space-y-2">
                  <li className="text-xs text-[var(--text-dim)] flex gap-2">
                    <span className="text-[var(--cyber-neon-pink)]">-</span>
                    <p>
                      Lossy: Cannot distinguish between <code>int32</code> and{" "}
                      <code>uint32</code>.
                    </p>
                  </li>
                  <li className="text-xs text-[var(--text-dim)] flex gap-2">
                    <span className="text-[var(--cyber-neon-pink)]">-</span>
                    <p>
                      Ambiguous: May misidentify embedded messages as strings.
                    </p>
                  </li>
                  <li className="text-xs text-[var(--text-dim)] flex gap-2">
                    <span className="text-[var(--cyber-neon-pink)]">-</span>
                    <p>
                      No field names: You only see numeric tags (e.g.,{" "}
                      <code>1:</code>).
                    </p>
                  </li>
                </ul>
              </div>
            </div>
          </div>

          <div className="lg:col-span-5">
            <CyberPanel title="HOW_IT_WORKS" className="h-full">
              <div className="p-6 space-y-6">
                <div className="space-y-2">
                  <p className="text-xs font-bold text-[var(--text-color)] uppercase">
                    1. Heuristic Disassembly
                  </p>
                  <p className="text-xs text-[var(--text-dim)] leading-relaxed">
                    Protoscope scans bytes and "guesses" types based on valid
                    UTF-8 sequences or nested tag patterns.
                  </p>
                </div>
                <div className="space-y-2">
                  <p className="text-xs font-bold text-[var(--text-color)] uppercase">
                    2. Minimalist Syntax
                  </p>
                  <p className="text-xs text-[var(--text-dim)] leading-relaxed font-mono bg-[var(--overlay-bg)] p-2 rounded">
                    1: 150 {"// Varint"}
                    <br />
                    2: "Alice" {"// String"}
                  </p>
                </div>
                <div className="space-y-2">
                  <p className="text-xs font-bold text-[var(--text-color)] uppercase">
                    3. Bi-directional
                  </p>
                  <p className="text-xs text-[var(--text-dim)] leading-relaxed">
                    It can compile text back into binary, making it a powerful
                    "hex editor" for Protobuf.
                  </p>
                </div>
              </div>
            </CyberPanel>
          </div>
        </div>

        <ProtoscopeLab
          messageSchema={messageSchema}
          fds={fds}
          protoSource={protoSource}
          setProtoSource={setProtoSource}
        />
      </div>
    </Section>
  </>
);

export default BinaryPage;
