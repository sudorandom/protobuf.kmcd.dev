import React, { useState, useMemo, useEffect } from "react";
import { trackEvent } from "../utils/analytics";
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
  Settings2,
} from "lucide-react";
import { fromJson, toBinary, type FileRegistry } from "@bufbuild/protobuf";
import {
  Section,
  SectionTitle,
  RoadmapGrid,
  CyberPanel,
  ExternalLinkText,
} from "../components/shared/Common";
import { JsonEditor } from "../components/shared/JsonEditor";
import { Modal } from "../components/shared/Modal";
import { InteractiveSchemaEditor } from "../components/shared/InteractiveSchemaEditor";
import { createDynamicRegistry } from "../utils/dynamic-registry";
import VarintExplainer from "../components/VarintExplainer";
import { MemoryLayoutVisualization } from "../components/MemoryLayoutVisualization";
import { BitShiftingVisualization } from "../components/BitShiftingVisualization";
import { BitwiseMergeVisualization } from "../components/BitwiseMergeVisualization";
import MultiFieldEncoding from "../components/MultiFieldEncoding";
import { decodeBinary, type DecodedSegment } from "../utils/decoder";
import { SIZE_EXAMPLES } from "../utils/constants";
import { INITIAL_PROTO } from "../utils/initial-proto";
import { generateFake, convertToProtoscope } from "../utils/wasm-parser";
import { ProtoscopeLab } from "../components/ProtoscopeLab";

// --- Static Envelope Diagrams ---

const PacketDiagram = () => (
  <div className="w-full max-w-2xl mx-auto my-12">
    <div className="flex items-stretch gap-1 h-20">
      <div className="flex-1 bg-[var(--cyber-neon-blue)]/10 border border-[var(--cyber-neon-blue)]/30 rounded flex flex-col items-center justify-center text-[var(--cyber-neon-blue)] font-mono text-sm relative group px-2 text-center">
        <div className="absolute -top-6 left-0 text-sm uppercase text-[var(--text-dim)] font-bold tracking-widest flex items-center gap-1">
          <Hash className="w-3 h-3" /> Tag
        </div>
        <span className="font-bold">VARINT</span>
        <span className="text-sm ">(Field # | Type)</span>
      </div>
      <div className="flex-[0.7] bg-[var(--cyber-neon-yellow)]/10 border border-[var(--cyber-neon-yellow)]/30 rounded flex flex-col items-center justify-center text-[var(--cyber-neon-yellow)] font-mono text-sm relative group px-2 text-center">
        <div className="absolute -top-6 left-0 text-sm uppercase text-[var(--text-dim)] font-bold tracking-widest flex items-center gap-1">
          <Zap className="w-3 h-3" /> Length
        </div>
        <span className="font-bold">VARINT</span>
        <span className="text-sm ">N Bytes</span>
      </div>
      <div className="flex-[2] bg-[var(--cyber-neon-green)]/10 border border-[var(--cyber-neon-green)]/30 rounded flex flex-col items-center justify-center text-[var(--cyber-neon-green)] font-mono text-sm relative group px-2 text-center">
        <div className="absolute -top-6 left-0 text-sm uppercase text-[var(--text-dim)] font-bold tracking-widest flex items-center gap-1">
          <Database className="w-3 h-3" /> Payload
        </div>
        <span className="font-bold">DATA</span>
        <span className="text-sm ">Binary Bytes</span>
      </div>
    </div>
    <div className="flex justify-between mt-8 px-2">
      <div className="flex flex-col items-center gap-1">
        <div className="w-px h-4 bg-[var(--border-light)]" />
        <span className="text-sm font-mono text-[var(--text-dim)] uppercase">
          1-5 Bytes
        </span>
      </div>
      <div className="flex flex-col items-center gap-1">
        <div className="w-px h-4 bg-[var(--border-light)]" />
        <span className="text-sm font-mono text-[var(--text-dim)] uppercase">
          1-5 Bytes
        </span>
      </div>
      <div className="flex flex-col items-center gap-1">
        <div className="w-px h-4 bg-[var(--border-light)]" />
        <span className="text-sm font-mono text-[var(--text-dim)] uppercase">
          N Bytes
        </span>
      </div>
    </div>
  </div>
);

const FixedPacketDiagram = ({ size = "4 or 8 Bytes" }: { size?: string }) => (
  <div className="w-full max-w-2xl mx-auto my-12">
    <div className="flex items-stretch gap-1 h-20">
      <div className="flex-1 bg-[var(--cyber-neon-blue)]/10 border border-[var(--cyber-neon-blue)]/30 rounded flex flex-col items-center justify-center text-[var(--cyber-neon-blue)] font-mono text-sm relative group px-2 text-center">
        <div className="absolute -top-6 left-0 text-sm uppercase text-[var(--text-dim)] font-bold tracking-widest flex items-center gap-1">
          <Hash className="w-3 h-3" /> Tag
        </div>
        <span className="font-bold">VARINT</span>
        <span className="text-sm ">(Field # | Type)</span>
      </div>
      <div className="flex-[2.7] bg-[var(--cyber-neon-green)]/10 border border-[var(--cyber-neon-green)]/30 rounded flex flex-col items-center justify-center text-[var(--cyber-neon-green)] font-mono text-sm relative group px-2 text-center">
        <div className="absolute -top-6 left-0 text-sm uppercase text-[var(--text-dim)] font-bold tracking-widest flex items-center gap-1">
          <Database className="w-3 h-3" /> Payload
        </div>
        <span className="font-bold">DATA</span>
        <span className="text-sm ">{size}</span>
      </div>
    </div>
    <div className="flex justify-between mt-8 px-2">
      <div className="flex flex-col items-center gap-1">
        <div className="w-px h-4 bg-[var(--border-light)]" />
        <span className="text-sm font-mono text-[var(--text-dim)] uppercase">
          1-5 Bytes
        </span>
      </div>
      <div className="flex flex-col items-center gap-1">
        <div className="w-px h-4 bg-[var(--border-light)]" />
        <span className="text-sm font-mono text-[var(--text-dim)] uppercase">
          {size}
        </span>
      </div>
    </div>
  </div>
);

const VarintPacketDiagram = () => (
  <div className="w-full max-w-2xl mx-auto my-12">
    <div className="flex items-stretch gap-1 h-20">
      <div className="flex-1 bg-[var(--cyber-neon-blue)]/10 border border-[var(--cyber-neon-blue)]/30 rounded flex flex-col items-center justify-center text-[var(--cyber-neon-blue)] font-mono text-sm relative group px-2 text-center">
        <div className="absolute -top-6 left-0 text-sm uppercase text-[var(--text-dim)] font-bold tracking-widest flex items-center gap-1">
          <Hash className="w-3 h-3" /> Tag
        </div>
        <span className="font-bold">VARINT</span>
        <span className="text-sm ">(Field # | Type)</span>
      </div>
      <div className="flex-[2.7] bg-[var(--cyber-neon-green)]/10 border border-[var(--cyber-neon-green)]/30 rounded flex flex-col items-center justify-center text-[var(--cyber-neon-green)] font-mono text-sm relative group px-2 text-center">
        <div className="absolute -top-6 left-0 text-sm uppercase text-[var(--text-dim)] font-bold tracking-widest flex items-center gap-1">
          <Database className="w-3 h-3" /> Payload
        </div>
        <span className="font-bold">VARINT</span>
        <span className="text-sm ">1-10 Bytes</span>
      </div>
    </div>
    <div className="flex justify-between mt-8 px-2">
      <div className="flex flex-col items-center gap-1">
        <div className="w-px h-4 bg-[var(--border-light)]" />
        <span className="text-sm font-mono text-[var(--text-dim)] uppercase">
          1-5 Bytes
        </span>
      </div>
      <div className="flex flex-col items-center gap-1">
        <div className="w-px h-4 bg-[var(--border-light)]" />
        <span className="text-sm font-mono text-[var(--text-dim)] uppercase">
          1-10 Bytes
        </span>
      </div>
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
        <span className="text-sm font-mono text-[var(--text-dim)] uppercase tracking-widest">
          {label}
        </span>
        <span className="text-sm font-mono text-[var(--text-dim)]  uppercase">
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
          className="flex flex-wrap gap-x-3 gap-y-1 font-mono text-sm  break-all"
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
        <span className="text-sm font-mono text-[var(--text-dim)] uppercase tracking-widest">
          Tag Section
        </span>
        <span className="text-sm font-mono text-[var(--text-dim)]  uppercase">
          {bytes.length} {bytes.length === 1 ? "Byte" : "Bytes"}
        </span>
      </div>

      <div className="flex flex-col gap-3 p-3 bg-[var(--section-bg-dark)]/50 border border-[var(--border-light)] rounded">
        {Array.from(bytes).map((byte, i) => {
          const bits = byte.toString(2).padStart(8, "0").split("");

          return (
            <div key={i} className="space-y-2">
              <div className="flex items-center gap-2">
                <span className="text-sm font-mono text-[var(--cyber-neon-blue)] bg-[var(--cyber-neon-blue)]/10 px-1.5 py-0.5 rounded border border-[var(--cyber-neon-blue)]/20">
                  {byte.toString(16).padStart(2, "0").toUpperCase()}
                </span>
                {bytes.length > 1 && (
                  <span className="text-sm font-mono text-[var(--text-dim)] uppercase ">
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
                        className="w-full h-6 flex items-center justify-center font-mono text-sm border border-transparent transition-all"
                        style={{
                          backgroundColor: `color-mix(in srgb, ${bitColor}, transparent 90%)`,
                          borderColor: `color-mix(in srgb, ${bitColor}, transparent 70%)`,
                          color: bitColor,
                        }}
                      >
                        {bit}
                      </div>
                      <div
                        className="text-sm font-mono mt-1  overflow-hidden"
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
            <span className="text-sm font-mono text-[var(--text-dim)] uppercase tracking-tighter">
              Field #{fieldNumber}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-[var(--cyber-neon-yellow)]" />
            <span className="text-sm font-mono text-[var(--text-dim)] uppercase tracking-tighter">
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

  const field = mode === "small" ? 1 : 16;
  const type = 2; // Length-delimited
  const tagValue = (field << 3) | type;

  // Step calculations
  const fieldBits = field.toString(2).padStart(8, "0").split("").map(Number);
  const shiftedBits = (field << 3)
    .toString(2)
    .padStart(8, "0")
    .split("")
    .map(Number);
  const typeBits = type.toString(2).padStart(3, "0").split("").map(Number);

  // Tag bits are shifted bits OR type bits
  const tagBits = [...shiftedBits];
  if (tagBits.length >= 3) {
    tagBits[tagBits.length - 1] = typeBits[2];
    tagBits[tagBits.length - 2] = typeBits[1];
    tagBits[tagBits.length - 3] = typeBits[0];
  }

  // Varint logic
  const varintBytes: number[] = [];
  let temp = tagValue;
  if (temp === 0) varintBytes.push(0);
  while (temp >= 128) {
    varintBytes.push((temp & 0x7f) | 0x80);
    temp >>= 7;
  }
  varintBytes.push(temp);

  return (
    <CyberPanel
      title="TAG_BIT_STRUCTURE"
      headerExtra={
        <div className="flex bg-[var(--overlay-bg)] p-1 rounded border border-[var(--border-light)]">
          <button
            onClick={() => setMode("small")}
            className={`px-3 py-1 text-sm font-mono rounded transition-all ${mode === "small" ? "bg-[var(--cyber-neon-blue)]/20 text-[var(--cyber-neon-blue)]" : "text-[var(--text-dim)] hover:text-[var(--text-color)]"}`}
            aria-label="FIELD_1 - Show tag for field number 1"
          >
            FIELD_1
          </button>
          <button
            onClick={() => setMode("large")}
            className={`px-3 py-1 text-sm font-mono rounded transition-all ${mode === "large" ? "bg-[var(--cyber-neon-pink)]/20 text-[var(--cyber-neon-pink)]" : "text-[var(--text-dim)] hover:text-[var(--text-color)]"}`}
            aria-label="FIELD_16 - Show tag for field number 16"
          >
            FIELD_16
          </button>
        </div>
      }
    >
      <div className="p-6 space-y-10">
        {/* Step 1: Shift */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-cyber text-[var(--cyber-neon-blue)] uppercase tracking-widest">
              01. Bit Shift (field &lt;&lt; 3)
            </h3>
            <div className="text-xs font-mono text-[var(--text-dim)] bg-[var(--section-bg-dark)] px-2 py-0.5 rounded border border-[var(--border-light)]">
              {field} {"<<"} 3 = {field << 3}
            </div>
          </div>
          <div className="space-y-2">
            <div className="grid grid-cols-8 gap-1">
              {fieldBits.map((bit, i) => (
                <div
                  key={i}
                  className="h-9 flex items-center justify-center font-mono border border-[var(--cyber-neon-blue)]/30 text-[var(--cyber-neon-blue)] bg-[var(--cyber-neon-blue)]/5 rounded-sm"
                >
                  {bit}
                </div>
              ))}
            </div>
            <div className="flex justify-center py-1">
              <div className="text-[var(--cyber-neon-blue)]  text-sm font-bold">
                ↓
              </div>
            </div>
            <div className="grid grid-cols-8 gap-1">
              {shiftedBits.slice(-8).map((bit, i) => (
                <div
                  key={i}
                  className={`h-9 flex items-center justify-center font-mono border rounded-sm ${i >= 5 ? "border-[var(--cyber-neon-blue)]/60 text-[var(--cyber-neon-blue)] bg-[var(--cyber-neon-blue)]/20 font-bold" : "border-[var(--cyber-neon-blue)]/30 text-[var(--cyber-neon-blue)] bg-[var(--cyber-neon-blue)]/5"}`}
                >
                  {bit}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Step 2: Merge */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-cyber text-[var(--cyber-neon-yellow)] uppercase tracking-widest">
              02. Bitwise OR (| wire_type)
            </h3>
            <div className="text-xs font-mono text-[var(--text-dim)] bg-[var(--section-bg-dark)] px-2 py-0.5 rounded border border-[var(--border-light)]">
              {field << 3} | {type} = {tagValue}
            </div>
          </div>
          <div className="space-y-2">
            <div className="grid grid-cols-8 gap-1">
              {tagBits.slice(-8).map((bit, i) => (
                <div
                  key={i}
                  className={`h-9 flex items-center justify-center font-mono border rounded-sm ${i >= 5 ? "border-[var(--cyber-neon-yellow)] text-[var(--cyber-neon-yellow)] bg-[var(--cyber-neon-yellow)]/10 font-bold" : "border-[var(--cyber-neon-blue)]/30 text-[var(--cyber-neon-blue)] bg-[var(--cyber-neon-blue)]/5"}`}
                >
                  {bit}
                </div>
              ))}
            </div>
            <div className="flex justify-between px-1 text-xs font-mono uppercase tracking-tighter ">
              <div className="text-[var(--cyber-neon-blue)]">
                Field Number Bits
              </div>
              <div className="text-[var(--cyber-neon-yellow)] font-bold">
                Wire Type (3 Bits)
              </div>
            </div>
          </div>
        </div>

        {/* Step 3: Varint */}
        <div className="space-y-4 pt-6 border-t border-[var(--border-light)]">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-cyber text-[var(--cyber-neon-green)] uppercase tracking-widest">
              03. Varint Encoding (Little-Endian)
            </h3>
            <div className="text-xs font-mono text-[var(--text-dim)] bg-[var(--section-bg-dark)] px-2 py-0.5 rounded border border-[var(--border-light)]">
              {tagValue} → {varintBytes.length} Byte(s)
            </div>
          </div>
          <div className="flex flex-col sm:flex-row gap-4">
            {varintBytes.map((byte, byteIdx) => {
              const bits = byte.toString(2).padStart(8, "0").split("");
              return (
                <div key={byteIdx} className="flex-1 space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-xs font-mono text-[var(--text-dim)] uppercase ">
                      Byte {byteIdx}
                    </span>
                    <span className="text-xs font-mono text-[var(--cyber-neon-green)] font-bold">
                      0x{byte.toString(16).toUpperCase().padStart(2, "0")}
                    </span>
                  </div>
                  <div className="flex gap-1 h-8">
                    {bits.map((bit, bitIdx) => (
                      <div
                        key={bitIdx}
                        className={`flex-1 flex items-center justify-center font-mono text-sm border rounded-sm ${bitIdx === 0 ? "border-[var(--cyber-neon-pink)]/50 text-[var(--cyber-neon-pink)] bg-[var(--cyber-neon-pink)]/10" : "border-[var(--cyber-neon-green)]/30 text-[var(--cyber-neon-green)] bg-[var(--cyber-neon-green)]/5"}`}
                      >
                        {bit}
                      </div>
                    ))}
                  </div>
                  <div className="flex justify-between text-xs font-mono  uppercase tracking-tighter">
                    <span className="text-[var(--cyber-neon-pink)]">MSB</span>
                    <span>7-Bit Value Chunk</span>
                  </div>
                </div>
              );
            })}
          </div>
          {mode === "large" && (
            <div className="p-3 bg-[var(--cyber-neon-pink)]/5 border border-[var(--cyber-neon-pink)]/20 rounded-sm">
              <p className="text-sm text-[var(--text-dim)] leading-relaxed italic">
                <strong className="text-[var(--cyber-neon-pink)] not-italic uppercase">
                  Overflow Alert:
                </strong>{" "}
                Field 16 shifted by 3 is 128 (
                <code className="bg-black/20 px-1 rounded text-[var(--cyber-neon-blue)]">
                  10000000
                </code>
                ). This exceeds the 7-bit capacity of a single Varint byte,
                forcing the "1" into Byte 1 and setting MSB=1 in Byte 0.
              </p>
            </div>
          )}
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
              <h3
                className="font-cyber font-bold uppercase text-sm tracking-widest"
                style={{ color: wt.color }}
              >
                {wt.label}
              </h3>
              <p className="text-sm text-[var(--text-dim)] leading-relaxed min-h-[40px]">
                {wt.desc}
              </p>
              <div className="pt-3 border-t border-[var(--border-light)]">
                <div className="flex flex-wrap gap-1">
                  {wt.types.map((t) => (
                    <span
                      key={t}
                      className="text-sm font-mono px-1.5 py-0.5 bg-[var(--overlay-bg)] border border-[var(--border-light)] rounded "
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
            <p className="text-sm text-[var(--text-dim)] leading-relaxed">
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

      <div className="mt-16 max-w-3xl mx-auto space-y-8">
        <div className="text-center space-y-4">
          <h3 className="text-3xl font-cyber font-bold text-[var(--text-color)] uppercase tracking-tight">
            Why Little Endian?
          </h3>
          <p className="text-lg text-[var(--text-dim)] leading-relaxed">
            Standardizing on Little-Endian instead of traditional Big-Endian
            "Network Order" is a deliberate optimization for performance and
            hardware alignment.
          </p>
        </div>

        <div className="space-y-6 text-[var(--text-dim)] leading-relaxed text-sm">
          <p>
            The decision boils down to two key factors. First, the{" "}
            <strong>Varint algorithm</strong> naturally processes integers by
            stripping the least significant bits first. Sticking to
            Little-Endian allows encoding and decoding in a single loop without
            extra buffering.
          </p>
          <p>
            Second, most modern hardware (including x86 and ARM) is natively{" "}
            <strong>Little-Endian</strong>. Forcing CPUs to flip bytes just to
            satisfy historical network conventions wastes cycles. By aligning
            the format with the hardware, Protobuf's foundations are optimized
            for speed.
          </p>
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
          <BitShiftingVisualization />
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
          Bitwise merging is a standard technique for assembly. We take two
          values, one shifted to provide a specific bitmask or "slot," and "OR"
          them together. This effectively "plugs" the second value into the
          empty bits of the first.
        </p>
      </div>
      <div className="max-w-3xl mx-auto">
        <CyberPanel title="BITWISE_MERGE_LOGIC">
          <BitwiseMergeVisualization />
        </CyberPanel>
      </div>
    </div>
  </div>
);

export const BinaryMatrix = ({
  protoSource,
  setProtoSource,
}: {
  protoSource: string;
  setProtoSource: (s: string) => void;
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
  const [isModalOpen, setIsModalOpen] = useState(false);

  // --- Local schema state ---
  const [localRegistry, setLocalRegistry] = useState<FileRegistry | null>(null);
  const [localFds, setLocalFds] = useState<Uint8Array | null>(null);
  const [rootMessageName, setRootMessageName] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    const timer = setTimeout(async () => {
      try {
        const result = await createDynamicRegistry(protoSource);
        if (active) {
          if (result.kind === "success") {
            setLocalRegistry(result.registry);
            setLocalFds(result.fullFileDescriptorSet);

            const messages = result.messageTypes;

            let newSelection: string | null = null;
            if (messages.length > 0) {
              if (rootMessageName && messages.includes(rootMessageName)) {
                newSelection = rootMessageName;
              } else if (messages.includes("demo.v1.User")) {
                newSelection = "demo.v1.User";
              } else {
                newSelection = messages[0];
              }
            }
            setRootMessageName(newSelection);
          } else {
            setLocalRegistry(null);
            setLocalFds(null);
            setRootMessageName(null);
          }
        }
      } catch (e) {
        console.error("Binary Explorer schema compilation failed:", e);
        if (active) {
          setLocalRegistry(null);
          setLocalFds(null);
          setRootMessageName(null);
        }
      }
    }, 500);

    return () => {
      active = false;
      clearTimeout(timer);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [protoSource]);

  const localMessageSchema = useMemo(() => {
    if (!localRegistry || !rootMessageName) return null;
    return localRegistry.getMessage(rootMessageName);
  }, [localRegistry, rootMessageName]);
  // ---

  const stats = useMemo(() => {
    if (!localMessageSchema)
      return { binary: new Uint8Array(), segments: [], error: "NO_SCHEMA" };
    try {
      const obj = JSON.parse(jsonInput);
      const user = fromJson(localMessageSchema, obj, {
        ignoreUnknownFields: true,
      });
      const binary = toBinary(localMessageSchema, user);
      const segments = decodeBinary(binary, localMessageSchema);
      return { binary, segments, error: null };
    } catch (e: unknown) {
      const error = e instanceof Error ? e.message : String(e);
      return { binary: new Uint8Array(), segments: [], error };
    }
  }, [jsonInput, localMessageSchema]);

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
    if (!rootMessageName || !localFds) return;
    setIsGenerating(true);
    try {
      const fakeData = await generateFake(rootMessageName, localFds);
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
          Binary Explorer
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
          <div className="flex flex-wrap gap-2 items-center">
            {(
              Object.keys(SIZE_EXAMPLES) as Array<keyof typeof SIZE_EXAMPLES>
            ).map((key) => (
              <button
                key={key}
                onClick={() => handleExampleChange(key)}
                className={`px-3 py-1 text-sm font-cyber font-bold border transition-all rounded-md ${
                  activeExample === key
                    ? "bg-[var(--cyber-neon-blue)] border-[var(--cyber-neon-blue)] text-[var(--neon-contrast-text)] shadow-[0_0_10px_rgba(0,243,255,0.3)]"
                    : "bg-[var(--overlay-bg)] border-[var(--border-light)] text-[var(--text-dim)] hover:border-[var(--cyber-neon-blue)]/50 hover:text-[var(--text-color)]"
                }`}
                aria-label={`Load ${key} example data`}
              >
                {key}
              </button>
            ))}

            <div className="w-px h-6 bg-[var(--border-light)] mx-2 hidden sm:block" />

            <button
              onClick={handleGenerateFake}
              disabled={isGenerating || !localFds}
              className="px-4 py-1.5 text-sm font-cyber font-bold border border-[var(--cyber-neon-pink)] bg-[var(--cyber-neon-pink)] text-[var(--neon-contrast-text)] hover:bg-[var(--cyber-neon-pink)]/90 transition-all flex items-center gap-2 disabled:opacity-30 disabled:cursor-not-allowed rounded-md shadow-[0_0_15px_rgba(255,0,255,0.4)]"
              aria-label="RANDOMIZE - Generate Random Data"
            >
              <Zap
                className={`w-3.5 h-3.5 ${isGenerating ? "animate-spin" : ""}`}
              />
              {isGenerating ? "GENERATING..." : "RANDOMIZE"}
            </button>
          </div>

          <button
            onClick={() => {
              trackEvent("open_schema_editor");
              setIsModalOpen(true);
            }}
            className="text-sm font-cyber font-bold text-[var(--cyber-neon-blue)] hover:text-[var(--cyber-neon-blue)]/80 transition-colors uppercase flex items-center gap-1 group"
            aria-label="EDIT SCHEMA - Edit Protobuf Schema"
          >
            <Settings2 className="w-3 h-3 group-hover:rotate-45 transition-transform" />
            Edit Schema
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 relative">
          {/* Global Interactive Sign for Large Screens */}
          <div className="absolute -left-48 top-48 hidden 2xl:flex flex-col items-end gap-2 text-[var(--cyber-neon-pink)] pointer-events-none z-10">
            <span className="font-cyber text-sm uppercase tracking-widest text-right">
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
                    className={`px-3 py-1 text-sm font-mono rounded transition-all ${viewMode === "hex" ? "bg-[var(--cyber-neon-blue)]/20 text-[var(--cyber-neon-blue)]" : "text-[var(--text-dim)] hover:text-[var(--text-color)]"}`}
                    aria-label="Switch to HEX view"
                  >
                    HEX
                  </button>
                  <button
                    onClick={() => setViewMode("scope")}
                    className={`px-3 py-1 text-sm font-mono rounded transition-all ${viewMode === "scope" ? "bg-[var(--cyber-neon-pink)]/20 text-[var(--cyber-neon-pink)]" : "text-[var(--text-dim)] hover:text-[var(--text-color)]"}`}
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
                            aria-label={`${seg.rawHex.join(" ")} ${seg.fieldName || "UNKNOWN"} - Click to inspect`}
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
                                    className="px-1.5 py-0.5 rounded border font-mono text-sm transition-colors"
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
                                className={`text-sm uppercase font-cyber tracking-widest  flex-shrink-0 ${isActive ? "text-[var(--text-color)]" : "text-[var(--text-dim)]"}`}
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
                        <span className="text-sm font-mono text-[var(--text-dim)] uppercase">
                          Tag
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-[var(--cyber-neon-yellow)]" />
                        <span className="text-sm font-mono text-[var(--text-dim)] uppercase">
                          Length
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-[var(--cyber-neon-green)]" />
                        <span className="text-sm font-mono text-[var(--text-dim)] uppercase">
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
                <p className="text-sm font-mono text-[var(--text-dim)] uppercase tracking-widest">
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
                        <span className="text-sm font-mono text-[var(--text-dim)] uppercase tracking-widest">
                          {selectedSegment.fieldName
                            ? `Field: ${selectedSegment.fieldName}`
                            : "Field ID"}
                        </span>
                        <div className="text-2xl font-cyber font-bold text-[var(--text-color)]">
                          #{selectedSegment.tag}
                        </div>
                      </div>
                      <div className="space-y-1">
                        <span className="text-sm font-mono text-[var(--text-dim)] uppercase tracking-widest">
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
                        <span className="text-sm font-mono text-[var(--text-dim)] uppercase">
                          Semantic Value{" "}
                          {selectedSegment.fieldType &&
                            `(${selectedSegment.fieldType})`}
                        </span>
                        <span className="text-sm font-mono px-1.5 py-0.5 bg-[var(--cyber-neon-blue)]/10 text-[var(--cyber-neon-blue)] rounded uppercase">
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
                        <span className="text-sm font-cyber font-bold uppercase tracking-widest">
                          Wire Logic
                        </span>
                      </div>
                      <pre className="p-4 bg-[var(--section-bg-dark)] border border-[var(--border-light)] rounded font-mono text-sm leading-relaxed text-[var(--text-dim)]">
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
                    <p className="font-cyber text-sm uppercase tracking-widest ">
                      Select a segment to analyze
                    </p>
                  </div>
                )}
              </div>
            </CyberPanel>
          </div>
        </div>
      </div>

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Schema Definition (.proto)"
      >
        <InteractiveSchemaEditor
          initialValue={protoSource}
          defaultValue={INITIAL_PROTO}
          showRootMessageSelector={true}
          onRootMessageChange={setRootMessageName}
          onCompileSuccess={(result) => {
            setLocalRegistry(result.registry);
            setLocalFds(result.fds);
          }}
          onSave={async (s, result) => {
            setProtoSource(s);
            if (rootMessageName && result) {
              try {
                const fakeJson = await generateFake(
                  rootMessageName,
                  result.fds,
                );
                setJsonInput(fakeJson);
                setActiveExample(null);
                setSelectedSegmentIdx(0);
              } catch (e) {
                console.error("Failed to generate faux data after save:", e);
              }
            }
            setIsModalOpen(false);
          }}
          onCancel={() => setIsModalOpen(false)}
        />
      </Modal>
    </Section>
  );
};

const BinaryPage = ({
  protoSource,
  setProtoSource,
}: {
  protoSource: string;
  setProtoSource: (s: string) => void;
}) => {
  const roadmapItems = [
    {
      id: "binary-intro",
      title: "Binary Primitives",
      desc: "Foundational concepts like Endianness and Bit Shifting.",
    },
    {
      id: "varints",
      title: "Base-128 Varint Encoding",
      desc: "The fundamental compression technique for integers.",
    },
    {
      id: "binary-tag",
      title: "The Tag System",
      desc: "How field numbers and wire types are packed into bytes.",
    },
    {
      id: "wire-types",
      title: "Wire Types",
      desc: "Physical formats (Varint, Fixed, Length-Delimited).",
    },
    {
      id: "matrix",
      title: "Stream Explorer",
      desc: "Live inspection and schema-agnostic disassembly.",
    },
  ];

  return (
    <>
      {/* 1. Introduction & Roadmap */}
      <Section
        id="binary-intro"
        className="py-24 px-4 sm:px-8 bg-[var(--bg-color)]"
      >
        <div className="max-w-7xl mx-auto">
          <SectionTitle icon={Binary} subtitle="05_WIRE_FORMAT" asH1={true}>
            Digging into the binary
          </SectionTitle>

          <div className="mb-16 max-w-4xl space-y-6 mx-auto text-center">
            <p className="text-[var(--text-dim)] leading-relaxed">
              To see how Protobuf gets its performance, we need to look at the
              raw bytes; this is the physical layer of the specification.
            </p>

            <RoadmapGrid items={roadmapItems} />
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
                Standard integers in memory take 4 or 8 bytes regardless of
                their value. Varints use <strong>Base-128 Serialization</strong>{" "}
                to represent smaller numbers with fewer bytes.
              </p>
              <p>
                Each byte in a varint, except the last byte, has the{" "}
                <strong>most significant bit (MSB)</strong> set to{" "}
                <code>1</code>. This acts as a continuation flag, telling the
                decoder "more bytes are coming."
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
            <div className="lg:col-span-6 space-y-8">
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
                  <h3 className="text-sm font-bold text-[var(--cyber-neon-blue)] uppercase tracking-widest mb-2">
                    Tag Composition
                  </h3>
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
                  <code>(field_number &lt;&lt; 3) | wire_type</code>. While
                  small field numbers fit in a single byte, larger ones (16 and
                  above) will trigger the Varint continuation logic and require
                  additional bytes.
                </p>
              </div>
            </div>

            <div className="lg:col-span-6">
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
      <BinaryMatrix protoSource={protoSource} setProtoSource={setProtoSource} />

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
                  <h3 className="font-cyber font-bold text-sm text-[var(--cyber-neon-green)] uppercase tracking-widest">
                    Strengths
                  </h3>
                  <ul className="space-y-2">
                    <li className="text-sm text-[var(--text-dim)] flex gap-2">
                      <span className="text-[var(--cyber-neon-green)]">+</span>
                      <p>Schema-agnostic debugging of any Protobuf stream.</p>
                    </li>
                    <li className="text-sm text-[var(--text-dim)] flex gap-2">
                      <span className="text-[var(--cyber-neon-green)]">+</span>
                      <p>
                        Perfect for crafting malformed messages for security
                        testing.
                      </p>
                    </li>
                    <li className="text-sm text-[var(--text-dim)] flex gap-2">
                      <span className="text-[var(--cyber-neon-green)]">+</span>
                      <p>
                        Human-readable representation of complex binary
                        structures.
                      </p>
                    </li>
                  </ul>
                </div>
                <div className="space-y-3">
                  <h3 className="font-cyber font-bold text-sm text-[var(--cyber-neon-pink)] uppercase tracking-widest">
                    Weaknesses
                  </h3>
                  <ul className="space-y-2">
                    <li className="text-sm text-[var(--text-dim)] flex gap-2">
                      <span className="text-[var(--cyber-neon-pink)]">-</span>
                      <p>
                        Lossy: Cannot distinguish between <code>int32</code> and{" "}
                        <code>uint32</code>.
                      </p>
                    </li>
                    <li className="text-sm text-[var(--text-dim)] flex gap-2">
                      <span className="text-[var(--cyber-neon-pink)]">-</span>
                      <p>
                        Ambiguous: May misidentify embedded messages as strings.
                      </p>
                    </li>
                    <li className="text-sm text-[var(--text-dim)] flex gap-2">
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
                    <p className="text-sm font-bold text-[var(--text-color)] uppercase">
                      1. Heuristic Disassembly
                    </p>
                    <p className="text-sm text-[var(--text-dim)] leading-relaxed">
                      Protoscope scans bytes and "guesses" types based on valid
                      UTF-8 sequences or nested tag patterns.
                    </p>
                  </div>
                  <div className="space-y-2">
                    <p className="text-sm font-bold text-[var(--text-color)] uppercase">
                      2. Minimalist Syntax
                    </p>
                    <p className="text-sm text-[var(--text-dim)] leading-relaxed font-mono bg-[var(--overlay-bg)] p-2 rounded">
                      1: 150 {"// Varint"}
                      <br />
                      2: "Alice" {"// String"}
                    </p>
                  </div>
                  <div className="space-y-2">
                    <p className="text-sm font-bold text-[var(--text-color)] uppercase">
                      3. Bi-directional
                    </p>
                    <p className="text-sm text-[var(--text-dim)] leading-relaxed">
                      It can compile text back into binary, making it a powerful
                      "hex editor" for Protobuf.
                    </p>
                  </div>
                </div>
              </CyberPanel>
            </div>
          </div>

          <ProtoscopeLab
            protoSource={protoSource}
            setProtoSource={setProtoSource}
          />
        </div>
      </Section>
    </>
  );
};

export default BinaryPage;
