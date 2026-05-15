import { useState, useEffect, useCallback } from "react";
import { XCircle, RotateCcw, Check, X } from "lucide-react";
import { type FileRegistry } from "@bufbuild/protobuf";
import { SchemaEditor } from "./SchemaEditor";
import { CyberPanel } from "./Common";
import {
  createDynamicRegistry,
  type RegistryResult,
} from "../../utils/dynamic-registry";
import { type CompilationError } from "../../utils/wasm-parser";

interface InteractiveSchemaEditorProps {
  initialValue: string;
  defaultValue?: string;
  onSave?: (
    source: string,
    result?: { fds: Uint8Array; userFds: Uint8Array; registry: FileRegistry },
  ) => void;
  onApply?: (
    source: string,
    result?: { fds: Uint8Array; userFds: Uint8Array; registry: FileRegistry },
  ) => void;
  onCancel?: () => void;
  onCompileSuccess?: (result: {
    fds: Uint8Array;
    userFds: Uint8Array;
    registry: FileRegistry;
  }) => void;
  title?: string;
}

export const InteractiveSchemaEditor: React.FC<
  InteractiveSchemaEditorProps
> = ({
  initialValue,
  defaultValue,
  onSave,
  onApply,
  onCancel,
  onCompileSuccess,
  title,
}) => {
  const [localValue, setLocalValue] = useState(initialValue ?? "");
  const [prevInitialValue, setPrevInitialValue] = useState(initialValue);
  const [localErrors, setLocalErrors] = useState<CompilationError[]>([]);
  const [isValidating, setIsValidating] = useState(false);
  const [lastValidResult, setLastValidResult] = useState<{
    fds: Uint8Array;
    userFds: Uint8Array;
    registry: FileRegistry;
  } | null>(null);

  // Sync internal state if initialValue changes externally
  if (initialValue !== prevInitialValue) {
    setLocalValue(initialValue ?? "");
    setPrevInitialValue(initialValue);
  }

  useEffect(() => {
    let isMounted = true;
    const timer = setTimeout(async () => {
      setIsValidating(true);
      try {
        const result: RegistryResult = await createDynamicRegistry(localValue);
        if (isMounted) {
          if (result.kind === "success") {
            setLocalErrors([]);
            const validData = {
              fds: result.fileDescriptorSet,
              userFds: result.userFileDescriptorSet,
              registry: result.registry,
            };
            setLastValidResult(validData);
            onCompileSuccess?.(validData);
          } else {
            setLocalErrors(result.errors);
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
  }, [localValue, onCompileSuccess]);

  const handleSave = useCallback(() => {
    if (localErrors.length === 0) {
      if (onSave) onSave(localValue, lastValidResult ?? undefined);
      else if (onApply) onApply(localValue, lastValidResult ?? undefined);
    }
  }, [localValue, localErrors, onSave, onApply, lastValidResult]);

  const handleReset = useCallback(() => {
    setLocalValue(defaultValue ?? initialValue);
  }, [defaultValue, initialValue]);

  const editorContent = (
    <div className="flex flex-col h-full gap-4">
      {/* Editor Area */}
      <div className="flex-1 relative min-h-[300px] bg-[var(--overlay-bg)] rounded-lg border border-[var(--border-light)] overflow-hidden">
        <SchemaEditor
          value={localValue}
          onChange={setLocalValue}
          errors={localErrors}
        />

        {/* Validation Status Overlay */}
        <div className="absolute top-2 right-2 flex items-center gap-2 pointer-events-none">
          {isValidating && (
            <div className="flex items-center gap-2 bg-[var(--bg-color)]/80 backdrop-blur-sm px-2 py-1 rounded border border-[var(--cyber-neon-blue)]/30">
              <div className="w-1.5 h-1.5 bg-[var(--cyber-neon-blue)] rounded-full animate-pulse" />
              <span className="text-xs font-mono text-[var(--cyber-neon-blue)] uppercase tracking-widest">
                Compiling
              </span>
            </div>
          )}
          {!isValidating && localErrors.length === 0 && (
            <div className="flex items-center gap-2 bg-[var(--bg-color)]/80 backdrop-blur-sm px-2 py-1 rounded border border-[var(--cyber-neon-green)]/30 text-[var(--cyber-neon-green)]">
              <Check className="w-3 h-3" />
              <span className="text-xs font-mono uppercase tracking-widest">
                Valid
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Error Log */}
      {localErrors.length > 0 && (
        <div className="space-y-1 max-h-24 overflow-y-auto pr-2 custom-scrollbar">
          {localErrors.map((err, i) => (
            <div
              key={i}
              className="p-2 bg-[var(--text-error)]/5 border border-[var(--text-error)]/10 rounded flex gap-2 text-xs font-mono text-[var(--text-error)]"
            >
              <XCircle className="w-3.5 h-3.5 shrink-0 mt-0.5" />
              <span>
                L{err.line}: {err.message}
              </span>
            </div>
          ))}
        </div>
      )}

      {/* Footer Actions */}
      <div className="flex items-center justify-between pt-4 border-t border-[var(--border-light)] shrink-0">
        <button
          onClick={handleReset}
          className="flex items-center gap-2 px-4 py-2 text-xs font-cyber font-bold text-[var(--text-dim)] hover:text-[var(--text-color)] transition-colors uppercase tracking-widest"
          aria-label="Reset schema to default values"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          Reset
        </button>

        <div className="flex items-center gap-3">
          {onCancel && (
            <button
              onClick={onCancel}
              className="flex items-center gap-2 px-6 py-2 text-xs font-cyber font-bold border border-[var(--border-light)] text-[var(--text-dim)] hover:bg-[var(--overlay-bg)] hover:text-[var(--text-color)] transition-all rounded-md uppercase tracking-widest"
              aria-label="Cancel schema changes"
            >
              <X className="w-3.5 h-3.5" />
              Cancel
            </button>
          )}
          {(onSave || onApply) && (
            <button
              onClick={handleSave}
              disabled={localErrors.length > 0 || isValidating}
              className="flex items-center gap-2 px-8 py-2 text-xs font-cyber font-bold bg-[var(--cyber-neon-blue)] text-black hover:bg-[var(--cyber-neon-blue)]/90 transition-all rounded-md uppercase tracking-widest disabled:opacity-30 disabled:cursor-not-allowed shadow-[0_0_15px_rgba(0,243,255,0.3)]"
              aria-label={
                onSave ? "Save schema changes" : "Apply schema changes"
              }
            >
              <Check className="w-3.5 h-3.5" />
              {onSave ? "Save Changes" : "Apply Changes"}
            </button>
          )}
        </div>
      </div>
    </div>
  );

  if (title) {
    return (
      <CyberPanel title={title} className="h-full flex flex-col">
        <div className="flex-1 min-h-0">{editorContent}</div>
      </CyberPanel>
    );
  }

  return editorContent;
};
