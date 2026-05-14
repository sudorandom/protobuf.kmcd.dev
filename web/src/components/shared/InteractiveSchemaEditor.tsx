import { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  CheckCircle2,
  XCircle,
  FileCode,
  Download,
  Terminal,
  Database,
  Code2
} from 'lucide-react';
import { fromBinary, toJson, type Registry } from '@bufbuild/protobuf';
import { FileDescriptorSetSchema } from '@bufbuild/protobuf/wkt';
import { CyberPanel, SyntaxHighlighter } from './Common';
import { SchemaEditor } from './SchemaEditor';
import { createDynamicRegistry, type RegistryResult } from '../../utils/dynamic-registry';
import { type CompilationError } from '../../utils/wasm-parser';

interface InteractiveSchemaEditorProps {
  initialValue: string;
  onApply: (source: string) => void;
  title?: string;
}

export const InteractiveSchemaEditor: React.FC<InteractiveSchemaEditorProps> = ({
  initialValue,
  onApply,
  title = "Interactive Schema Editor"
}) => {
  const [localValue, setLocalValue] = useState(initialValue);
  const [localErrors, setLocalErrors] = useState<CompilationError[]>([]);
  const [isValidating, setIsValidating] = useState(false);
  const [fds, setFds] = useState<Uint8Array | null>(null);
  const [registry, setRegistry] = useState<Registry | null>(null);
  const [activeTab, setActiveTab] = useState<'errors' | 'descriptor'>('errors');

  useEffect(() => {
    let isMounted = true;
    const timer = setTimeout(async () => {
      setIsValidating(true);
      try {
        const result: RegistryResult = await createDynamicRegistry(localValue);
        if (isMounted) {
          if (result.kind === "success") {
            setLocalErrors([]);
            setFds(result.fileDescriptorSet);
            setRegistry(result.registry);
          } else {
            setLocalErrors(result.errors);
            setFds(null);
            setRegistry(null);
            setActiveTab('errors');
          }
        }
      } catch (e) {
        console.error("Schema validation failed:", e);
      } finally {
        if (isMounted) {
          setIsValidating(false);
        }
      }
    }, 500);

    return () => {
      isMounted = false;
      clearTimeout(timer);
    };
  }, [localValue]);

  const descriptorJson = useMemo(() => {
    if (!fds) return null;
    try {
      const message = fromBinary(FileDescriptorSetSchema, fds);
      return JSON.stringify(toJson(FileDescriptorSetSchema, message, { registry: registry ?? undefined }), null, 2);
    } catch (e) {
      console.error("Failed to convert FDS to JSON:", e);
      return null;
    }
  }, [fds, registry]);

  const downloadBinary = () => {
    if (!fds) return;
    const blob = new Blob([fds.slice()], { type: 'application/octet-stream' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'descriptor.bin';
    a.click();
    URL.revokeObjectURL(url);
  };

  const downloadJson = () => {
    if (!descriptorJson) return;
    const blob = new Blob([descriptorJson], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'descriptor.json';
    a.click();
    URL.revokeObjectURL(url);
  };

  const isValid = localErrors.length === 0 && !isValidating;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-stretch">
      <div className="space-y-4 flex flex-col">
        <CyberPanel
          title={title}
          headerExtra={
            <div className="flex items-center gap-3">
              {isValidating && (
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-[var(--cyber-neon-blue)] rounded-full animate-pulse" />
                  <span className="text-[10px] font-mono text-[var(--cyber-neon-blue)] uppercase tracking-widest">Compiling...</span>
                </div>
              )}
              {isValid && (
                <button
                  onClick={() => onApply(localValue)}
                  className="px-3 py-1 bg-[var(--cyber-neon-blue)]/20 hover:bg-[var(--cyber-neon-blue)]/30 text-[var(--cyber-neon-blue)] border border-[var(--cyber-neon-blue)]/50 rounded text-[10px] font-cyber font-bold transition-all uppercase"
                >
                  Apply Changes
                </button>
              )}
            </div>
          }
        >
          <div className="h-[400px] lg:h-[500px]">
            <SchemaEditor value={localValue} onChange={setLocalValue} errors={localErrors} />
          </div>
        </CyberPanel>
      </div>

      <div className="flex flex-col space-y-4">
        <CyberPanel
          title="COMPILATION_OUTPUT"
          headerExtra={
            <div className="flex gap-2">
               <button
                 onClick={() => setActiveTab('errors')}
                 className={`px-2 py-0.5 text-[9px] font-mono rounded border transition-all ${activeTab === 'errors' ? 'bg-[var(--cyber-neon-pink)]/20 border-[var(--cyber-neon-pink)]/50 text-[var(--cyber-neon-pink)]' : 'border-[var(--border-light)] text-[var(--text-dim)] hover:text-[var(--text-color)]'}`}
               >
                 {localErrors.length > 0 ? `ERRORS (${localErrors.length})` : 'STATUS'}
               </button>
               <button
                 onClick={() => setActiveTab('descriptor')}
                 disabled={!descriptorJson}
                 className={`px-2 py-0.5 text-[9px] font-mono rounded border transition-all disabled:opacity-30 ${activeTab === 'descriptor' ? 'bg-[var(--cyber-neon-blue)]/20 border-[var(--cyber-neon-blue)]/50 text-[var(--cyber-neon-blue)]' : 'border-[var(--border-light)] text-[var(--text-dim)] hover:text-[var(--text-color)]'}`}
               >
                 JSON_DESCRIPTOR
               </button>
            </div>
          }
        >
          <div className="h-[400px] lg:h-[500px] flex flex-col">
            <div className="flex-1 overflow-auto p-4 custom-scrollbar">
              <AnimatePresence mode="wait">
                {activeTab === 'errors' ? (
                  <motion.div
                    key="errors"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="space-y-4"
                  >
                    {localErrors.length > 0 ? (
                      <div className="space-y-2">
                        {localErrors.map((err, i) => (
                          <div key={i} className="p-3 bg-[var(--text-error)]/10 border border-[var(--text-error)]/20 rounded flex gap-3 animate-in fade-in slide-in-from-left-2">
                            <XCircle className="w-4 h-4 text-[var(--text-error)] shrink-0 mt-0.5" />
                            <div className="flex flex-col gap-1">
                              <span className="text-[10px] font-mono text-[var(--text-error)] uppercase">Line {err.line}, Col {err.col}</span>
                              <p className="text-sm text-[var(--text-color)] font-mono">{err.message}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="flex flex-col items-center justify-center h-full gap-4 py-20">
                        <div className="w-16 h-16 bg-[var(--cyber-neon-green)]/10 rounded-full flex items-center justify-center border border-[var(--cyber-neon-green)]/30">
                          <CheckCircle2 className="w-8 h-8 text-[var(--cyber-neon-green)]" />
                        </div>
                        <div className="text-center space-y-1">
                          <h4 className="font-cyber font-bold text-[var(--text-color)] uppercase tracking-widest">Compilation Successful</h4>
                          <p className="text-xs text-[var(--text-dim)] uppercase">Binary descriptor generated</p>
                        </div>
                        {fds && (
                          <div className="flex flex-col gap-2">
                            <button
                              onClick={downloadBinary}
                              className="flex items-center gap-2 px-4 py-2 bg-[var(--overlay-bg)] border border-[var(--border-light)] rounded-md text-xs font-cyber font-bold hover:border-[var(--cyber-neon-blue)]/50 transition-all group"
                            >
                              <Download className="w-4 h-4 text-[var(--cyber-neon-blue)] group-hover:animate-bounce" />
                              DOWNLOAD_BINARY_PROTOSET
                            </button>
                            {descriptorJson && (
                              <button
                                onClick={downloadJson}
                                className="flex items-center gap-2 px-4 py-2 bg-[var(--overlay-bg)] border border-[var(--border-light)] rounded-md text-xs font-cyber font-bold hover:border-[var(--cyber-neon-pink)]/50 transition-all group"
                              >
                                <FileCode className="w-4 h-4 text-[var(--cyber-neon-pink)] group-hover:animate-bounce" />
                                DOWNLOAD_JSON_DESCRIPTOR
                              </button>
                            )}
                          </div>
                        )}
                      </div>
                    )}
                  </motion.div>
                ) : (
                  <motion.div
                    key="descriptor"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="h-full flex flex-col"
                  >
                    {descriptorJson ? (
                      <div className="space-y-4 flex-1 flex flex-col min-h-0">
                        <div className="flex items-center justify-between border-b border-[var(--border-light)] pb-2 mb-2 shrink-0">
                          <span className="text-[10px] font-mono text-[var(--text-dim)] uppercase tracking-widest flex items-center gap-2">
                            <Code2 className="w-3 h-3" /> FileDescriptorSet (JSON)
                          </span>
                          <button
                            onClick={downloadJson}
                            className="flex items-center gap-1.5 px-2 py-0.5 bg-[var(--cyber-neon-pink)]/10 border border-[var(--cyber-neon-pink)]/30 rounded text-[9px] font-cyber font-bold text-[var(--cyber-neon-pink)] hover:bg-[var(--cyber-neon-pink)]/20 transition-all uppercase"
                          >
                            <Download className="w-3 h-3" /> Save JSON
                          </button>
                        </div>
                        <div className="flex-1 min-h-0">
                          <SyntaxHighlighter language="json" code={descriptorJson} wrap />
                        </div>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center justify-center h-full text-[var(--text-dim)] gap-4 py-20">
                         <Terminal className="w-12 h-12 opacity-20" />
                         <p className="font-cyber text-xs uppercase tracking-widest opacity-40 text-center">Correct compilation errors<br/>to view descriptor</p>
                      </div>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
            {isValid && (
              <div className="p-4 border-t border-[var(--border-light)] bg-[var(--overlay-bg)]">
                <div className="flex items-start gap-3">
                  <div className="p-2 bg-[var(--cyber-neon-blue)]/10 rounded">
                    <Database className="w-4 h-4 text-[var(--cyber-neon-blue)]" />
                  </div>
                  <div className="space-y-1">
                    <h5 className="text-[10px] font-cyber font-bold text-[var(--text-color)] uppercase tracking-wider">Reflection Ready</h5>
                    <p className="text-[10px] text-[var(--text-dim)] leading-relaxed uppercase">
                      This schema is now representable as a <code>FileDescriptorSet</code> message, enabling dynamic tools and reflection.
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </CyberPanel>
      </div>
    </div>
  );
};
