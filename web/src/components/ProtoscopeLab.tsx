import React, { useState, useEffect } from 'react';
import { 
  Zap, 
  Terminal,
  Database,
  Settings2,
  ExternalLink
} from 'lucide-react';
import { fromJson, toBinary, type DescMessage } from '@bufbuild/protobuf';
import { 
  CyberPanel,
  TechnicalNuance
} from './shared/Common';
import { JsonEditor } from './shared/JsonEditor';
import { InteractiveSchemaEditor } from './shared/InteractiveSchemaEditor';
import { convertToProtoscope, generateFake } from '../utils/wasm-parser';
import { Modal } from './shared/Modal';
import { INITIAL_PROTO } from '../utils/constants';

interface ProtoscopeLabProps {
  messageSchema: DescMessage | null;
  fds: Uint8Array | null;
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
    day: 22
  }
};

export const ProtoscopeLab: React.FC<ProtoscopeLabProps> = ({ 
  messageSchema, 
  fds, 
  protoSource, 
  setProtoSource 
}) => {
  const [jsonInput, setJsonInput] = useState(JSON.stringify(DEFAULT_EXAMPLE, null, 2));
  const [protoscopeOutput, setProtoscopeOutput] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    const updateProtoscope = async () => {
      if (!messageSchema) {
        setProtoscopeOutput('');
        return;
      }
      try {
        const obj = JSON.parse(jsonInput);
        const user = fromJson(messageSchema, obj, { ignoreUnknownFields: true });
        const binary = toBinary(messageSchema, user);
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
  }, [jsonInput, messageSchema]);

  const handleGenerateFake = async () => {
    if (!fds || !messageSchema) return;
    setIsGenerating(true);
    try {
      const fakeData = await generateFake(messageSchema.typeName, fds);
      setJsonInput(fakeData);
    } catch (e) {
      console.error(e);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="space-y-8">
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
                onClick={() => setIsModalOpen(true)}
                className="text-[10px] font-cyber font-bold text-[var(--cyber-neon-blue)] hover:text-[var(--cyber-neon-blue)]/80 transition-colors uppercase flex items-center gap-1 group"
              >
                <Settings2 className="w-3 h-3 group-hover:rotate-45 transition-transform" />
                Edit Schema
              </button>
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            <button
              onClick={handleGenerateFake}
              disabled={isGenerating || !fds}
              className="px-2 py-1 text-[9px] font-cyber font-bold border border-[var(--cyber-neon-pink)] bg-[var(--cyber-neon-pink)]/10 text-[var(--cyber-neon-pink)] hover:bg-[var(--cyber-neon-pink)]/20 transition-all flex items-center gap-1.5 disabled:opacity-30 disabled:cursor-not-allowed rounded uppercase tracking-wider"
            >
              <Zap className={`w-2.5 h-2.5 ${isGenerating ? 'animate-spin' : ''}`} />
              Randomize
            </button>
          </div>
          
          <CyberPanel title="JSON_INPUT" className="flex-1 min-h-[400px] flex flex-col">
            <div className="flex-1 relative">
              {error && (
                <div className="absolute top-0 left-0 right-0 p-2 bg-[var(--text-error)]/10 border-b border-[var(--text-error)]/30 text-[var(--text-error)] text-[10px] font-mono z-30 break-words line-clamp-2">
                  {error}
                </div>
              )}
              <JsonEditor value={jsonInput} onChange={setJsonInput} className="h-full rounded-none border-none bg-transparent" />
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
              className="text-[10px] font-cyber font-bold text-[var(--text-dim)] hover:text-[var(--text-color)] transition-colors uppercase flex items-center gap-1"
            >
              Spec <ExternalLink className="w-2.5 h-2.5" />
            </a>
          </div>

          <CyberPanel title="PROTOSCOPE_STREAM" className="flex-1 min-h-[400px] flex flex-col">
            <div className="flex-1 flex flex-col bg-[var(--section-bg-dark)]/30">
              <div className="flex-1 overflow-auto p-6 custom-scrollbar">
                {protoscopeOutput ? (
                  <pre className="font-mono text-sm text-[var(--cyber-neon-pink)] leading-relaxed animate-in fade-in slide-in-from-bottom-2">
                    {protoscopeOutput}
                  </pre>
                ) : (
                  <div className="h-full flex flex-col items-center justify-center text-[var(--text-dim)] gap-4 opacity-40 py-20">
                    <Terminal className="w-10 h-10" />
                    <p className="font-cyber text-[10px] uppercase tracking-widest text-center">Correct input to<br />view stream</p>
                  </div>
                )}
              </div>
            </div>
          </CyberPanel>
        </div>
      </div>
      
      <TechnicalNuance title="DEBUGGING_TIP">
        Protoscope is especially useful when debugging "Unknown Fields". If a client sends a field that your server's schema doesn't know about, Protoscope will still show you the data, whereas a standard JSON decoder would simply drop it.
      </TechnicalNuance>

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Schema Definition (.proto)"
      >
        <InteractiveSchemaEditor
          initialValue={protoSource}
          defaultValue={INITIAL_PROTO}
          onSave={async (s, result) => {
            setProtoSource(s);
            if (result) {
              const schema = result.registry.getMessage("demo.v1.User") || result.registry.getFile("input.proto")?.messages[0];
              if (schema) {
                try {
                  const fakeData = await generateFake(schema.typeName, result.fds);
                  setJsonInput(fakeData);
                } catch (e) {
                  console.error("Failed to generate faux data after save:", e);
                }
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
