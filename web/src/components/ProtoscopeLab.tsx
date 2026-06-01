import React, { useState, useEffect, useMemo } from "react";
import { Zap, Terminal, Database, Settings2, ExternalLink } from "lucide-react";
import { fromJson, toBinary, type FileRegistry } from "@bufbuild/protobuf";
import { CyberPanel, TechnicalNuance, CyberButton } from "./shared/Common";
import { JsonEditor } from "./shared/JsonEditor";
import { InteractiveSchemaEditor } from "./shared/InteractiveSchemaEditor";
import { convertToProtoscope, generateFake } from "../utils/wasm-parser";
import { createDynamicRegistry } from "../utils/dynamic-registry";
import { Modal } from "./shared/Modal";
import { INITIAL_PROTO } from "../utils/initial-proto";
import { trackEvent } from "../utils/analytics";

interface ProtoscopeLabProps {
  protoSource: string;
  setProtoSource: (s: string) => void;
}

const DEFAULT_EXAMPLE = {
  id: "550e8400-e29b-41d4-a716-446655440000",
  name: "Hiro Protagonist",
  email: "hiro@metaverse.com",
  age: 24,
  heightCm: 175.5,
  weightKg: 70.2,
  role: 2,
  birthDate: {
    year: 1992,
    month: 5,
    day: 22,
  },
};

export const ProtoscopeLab: React.FC<ProtoscopeLabProps> = ({
  protoSource,
  setProtoSource,
}) => {
  const [jsonInput, setJsonInput] = useState(
    JSON.stringify(DEFAULT_EXAMPLE, null, 2),
  );
  const [protoscopeOutput, setProtoscopeOutput] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
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
        console.error("Protoscope Lab schema compilation failed:", e);
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

  useEffect(() => {
    const updateProtoscope = async () => {
      if (!localMessageSchema) {
        setProtoscopeOutput("");
        return;
      }
      try {
        const obj = JSON.parse(jsonInput);
        const msg = fromJson(localMessageSchema, obj, {
          ignoreUnknownFields: true,
        });
        const binary = toBinary(localMessageSchema, msg);
        const output = await convertToProtoscope(binary);
        setProtoscopeOutput(output);
        setError(null);
      } catch (e: unknown) {
        const msg = e instanceof Error ? e.message : String(e);
        setError(msg);
      }
    };

    const timer = setTimeout(updateProtoscope, 300);
    return () => clearTimeout(timer);
  }, [jsonInput, localMessageSchema]);

  const PRESET_PAYLOADS = {
    minimal: {
      id: "550e8400-e29b-41d4-a716-446655440000",
    },
    basic: {
      id: "550e8400-e29b-41d4-a716-446655440000",
      name: "Hiro Protagonist",
      email: "hiro@metaverse.com",
      role: 2,
    },
    large: DEFAULT_EXAMPLE,
  };

  const applyPreset = (preset: keyof typeof PRESET_PAYLOADS) => {
    trackEvent("apply_preset_payload", { preset });
    setJsonInput(JSON.stringify(PRESET_PAYLOADS[preset], null, 2));
  };

  const handleGenerateFake = async () => {
    if (!localFds || !rootMessageName) return;
    setIsGenerating(true);
    trackEvent("generate_fake_data_clicked", { messageType: rootMessageName });
    try {
      const fakeData = await generateFake(rootMessageName, localFds);
      setJsonInput(fakeData);
    } catch (e) {
      console.error(e);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="relative space-y-12">
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

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-stretch">
        {/* Left Column: Payload Input */}
        <div className="space-y-4 flex flex-col">
          <div className="flex items-center justify-between h-8">
            <div className="flex items-center gap-4">
              <h3 className="text-sm font-cyber font-bold text-[var(--text-color)] uppercase flex items-center gap-2 tracking-widest">
                <Database className="w-4 h-4 text-[var(--cyber-neon-blue)]" />
                Payload Input
              </h3>
              <button
                onClick={() => {
                  trackEvent("open_schema_editor");
                  setIsModalOpen(true);
                }}
                className="text-sm font-cyber font-bold text-[var(--cyber-neon-blue)] hover:text-[var(--cyber-neon-blue)]/80 transition-colors uppercase flex items-center gap-1 group"
                aria-label="Open Protobuf schema editor"
              >
                <Settings2 className="w-3 h-3 group-hover:rotate-45 transition-transform" />
                Edit Schema
              </button>
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            <CyberButton
              onClick={() => applyPreset("minimal")}
              ariaLabel="Load minimal payload"
            >
              Minimal
            </CyberButton>
            <CyberButton
              onClick={() => applyPreset("basic")}
              ariaLabel="Load basic payload"
            >
              Basic
            </CyberButton>
            <CyberButton
              onClick={() => applyPreset("large")}
              ariaLabel="Load large payload"
            >
              Large
            </CyberButton>
            <div className="w-[1px] h-6 bg-[var(--border-light)] mx-1" />
            <CyberButton
              onClick={handleGenerateFake}
              disabled={isGenerating || !localFds}
              variant="pink"
              icon={Zap}
              className={isGenerating ? "animate-pulse" : ""}
              ariaLabel="Generate random JSON data from schema"
            >
              Randomize
            </CyberButton>
          </div>

          <CyberPanel
            title="JSON_INPUT"
            className="flex-1 min-h-[400px] flex flex-col"
          >
            <div className="flex-1 flex flex-col min-h-0 relative">
              <div className="flex-1 relative min-h-0">
                <JsonEditor
                  value={jsonInput}
                  onChange={setJsonInput}
                  className="h-full rounded-none border-none bg-transparent"
                />
              </div>
              {error && (
                <div className="p-2 bg-[var(--text-error)]/10 border-t border-[var(--text-error)]/30 text-[var(--text-error)] text-sm font-mono z-30 break-words">
                  {error}
                </div>
              )}
            </div>
          </CyberPanel>
        </div>

        {/* Right Column: Protoscope Output */}
        <div className="space-y-4 flex flex-col">
          <div className="flex items-center justify-between h-8">
            <h3 className="text-sm font-cyber font-bold text-[var(--text-color)] uppercase flex items-center gap-2 tracking-widest">
              <Terminal className="w-4 h-4 text-[var(--cyber-neon-pink)]" />
              Protoscope Output
            </h3>
            <a
              href="https://github.com/protocolbuffers/protoscope"
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm font-cyber font-bold text-[var(--text-dim)] hover:text-[var(--text-color)] transition-colors uppercase flex items-center gap-1"
            >
              Protoscope <ExternalLink className="w-2.5 h-2.5" />
            </a>
          </div>

          <CyberPanel
            title="PROTOSCOPE_OUTPUT"
            className="flex-1 min-h-[400px] flex flex-col"
          >
            <div className="flex-1 flex flex-col bg-[var(--section-bg-dark)]/30">
              <div className="flex-1 overflow-auto p-6 custom-scrollbar">
                {protoscopeOutput ? (
                  <pre className="font-mono text-sm text-[var(--cyber-neon-pink)] leading-relaxed animate-in fade-in slide-in-from-bottom-2">
                    {protoscopeOutput}
                  </pre>
                ) : (
                  <div className="h-full flex flex-col items-center justify-center text-[var(--text-dim)] gap-4 opacity-70 py-20">
                    <Terminal className="w-10 h-10" />
                    <p className="font-cyber text-sm uppercase tracking-widest text-center">
                      Correct input to
                      <br />
                      view stream
                    </p>
                  </div>
                )}
              </div>
            </div>
          </CyberPanel>
        </div>
      </div>

      <TechnicalNuance title="DEBUGGING_TIP">
        Protoscope is especially useful when debugging "Unknown Fields". If a
        client sends a field that your server's schema doesn't know about,
        Protoscope will still show you the data, whereas a standard JSON decoder
        would simply drop it.
      </TechnicalNuance>

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
            trackEvent("schema_editor_saved", { messageType: rootMessageName });
            setProtoSource(s);
            if (rootMessageName && result) {
              try {
                const fakeData = await generateFake(
                  rootMessageName,
                  result.fds,
                );
                setJsonInput(fakeData);
              } catch (e) {
                console.error("Failed to generate faux data after save:", e);
              }
            }
            setIsModalOpen(false);
          }}
          onCancel={() => setIsModalOpen(false)}
        />
      </Modal>
    </div>
  );
};
