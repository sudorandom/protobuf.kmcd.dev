import { useState, useEffect, useMemo } from "react";
import {
  Award,
  CheckCircle2,
  HelpCircle,
  Lock,
  RotateCcw,
  Sparkles,
  AlertTriangle,
  ArrowRight,
  Trophy,
} from "lucide-react";
import { fromBinary } from "@bufbuild/protobuf";
import { FileDescriptorSetSchema } from "@bufbuild/protobuf/wkt";
import { EXERCISES } from "../data/practice-data";
import { createDynamicRegistry } from "../utils/dynamic-registry";
import { type CompilationError } from "../utils/wasm-parser";
import { SchemaEditor } from "../components/shared/SchemaEditor";
import { Section, CyberPanel, SyntaxHighlighter } from "../components/shared/Common";

const formatCodeText = (text: string, highlightColorClass: string = "text-[var(--cyber-neon-blue)]") => {
  const parts = text.split(/`([^`]+)`/g);
  return parts.map((part, i) => {
    if (i % 2 === 1) {
      return (
        <code
          key={i}
          className={`font-mono bg-black/50 border border-[var(--border-light)] px-1.5 py-0.5 rounded text-xs mx-0.5 ${highlightColorClass}`}
        >
          {part}
        </code>
      );
    }
    return part;
  });
};

const formatScenarioText = (text: string) => {
  const parts = text.split(/(```[a-z]*\n[\s\S]*?\n```)/g);
  return parts.map((part, i) => {
    if (part.startsWith("```")) {
      const lines = part.split("\n").slice(1, -1).join("\n");
      return (
        <div key={i} className="bg-[var(--overlay-bg)] border border-[var(--border-light)] p-3 rounded my-3 text-xs">
          <SyntaxHighlighter language="proto" code={lines} />
        </div>
      );
    }
    return <span key={i} className="whitespace-pre-wrap">{part}</span>;
  });
};

export const Practice = ({ activeId }: { activeId: string }) => {
  const isConclusion = activeId === "conclusion";
  const currentExerciseIndex = isConclusion
    ? 8
    : Math.max(0, Math.min(EXERCISES.length - 1, parseInt(activeId, 10) - 1));

  const [highestUnlockedIndex, setHighestUnlockedIndex] = useState(() => {
    if (typeof window !== "undefined") {
      const savedHighest = localStorage.getItem("protobuf_practice_highest_unlocked");
      if (savedHighest) {
        return parseInt(savedHighest, 10);
      }
    }
    return 0;
  });

  // Track code edits per exercise index
  const [exerciseCodes, setExerciseCodes] = useState<Record<number, string>>(() => {
    if (typeof window !== "undefined") {
      const savedCodes = localStorage.getItem("protobuf_practice_codes");
      if (savedCodes) {
        try {
          return JSON.parse(savedCodes);
        } catch (e) {
          console.error("Failed to parse saved practice codes", e);
        }
      }
    }
    const initial: Record<number, string> = {};
    EXERCISES.forEach((ex) => {
      initial[ex.id] = ex.initialCode;
    });
    return initial;
  });

  // Track completed exercises
  const [completedExercises, setCompletedExercises] = useState<Record<number, boolean>>(() => {
    if (typeof window !== "undefined") {
      const savedCompleted = localStorage.getItem("protobuf_practice_completed");
      if (savedCompleted) {
        try {
          return JSON.parse(savedCompleted);
        } catch (e) {
          console.error("Failed to parse saved completed exercises", e);
        }
      }
    }
    return {};
  });

  const activeExercise = EXERCISES[isConclusion ? 0 : currentExerciseIndex];
  const activeCode = exerciseCodes[activeExercise.id] ?? activeExercise.initialCode;

  // Compilation & Assertion states
  const [isValidating, setIsValidating] = useState(false);
  const [compilationErrors, setCompilationErrors] = useState<CompilationError[]>([]);
  const [assertionResults, setAssertionResults] = useState<{
    id: string;
    description: string;
    passed: boolean;
    errorMsg?: string;
  }[]>([]);

  const [showHint, setShowHint] = useState(false);
  const [isCompletedJustNow, setIsCompletedJustNow] = useState(false);

  // Save codes to localStorage when updated
  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem("protobuf_practice_codes", JSON.stringify(exerciseCodes));
    }
  }, [exerciseCodes]);

  // Save completion state to localStorage
  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem("protobuf_practice_completed", JSON.stringify(completedExercises));
      localStorage.setItem("protobuf_practice_highest_unlocked", highestUnlockedIndex.toString());
    }
  }, [completedExercises, highestUnlockedIndex]);

  // Redirect guard for locked stages
  useEffect(() => {
    if (typeof window !== "undefined") {
      const savedCompleted = localStorage.getItem("protobuf_practice_completed");
      const savedHighest = localStorage.getItem("protobuf_practice_highest_unlocked");
      let currentHighest = 0;
      if (savedHighest) {
        currentHighest = parseInt(savedHighest, 10);
      }

      if (isConclusion) {
        const savedCompletedObj = savedCompleted ? JSON.parse(savedCompleted) : {};
        const allCompleted = EXERCISES.every((k) => savedCompletedObj[k.id]);
        if (!allCompleted) {
          window.location.replace(`/practice/${currentHighest + 1}/`);
        }
      } else if (currentExerciseIndex > currentHighest) {
        window.location.replace(`/practice/${currentHighest + 1}/`);
      }
    }
  }, [currentExerciseIndex, isConclusion]);

  // Reset hint state when switching exercises
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setShowHint(false);
    setIsCompletedJustNow(false);
  }, [currentExerciseIndex]);

  // Debounced execution of compilation and assertions
  useEffect(() => {
    if (isConclusion) return;

    let isMounted = true;
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setIsValidating(true);

    const timer = setTimeout(async () => {
      try {
        const result = await createDynamicRegistry(activeCode);
        if (!isMounted) return;

        if (result.kind === "error") {
          setCompilationErrors(result.errors);
          setAssertionResults(
            activeExercise.assertions.map((a) => ({
              id: a.id,
              description: a.description,
              passed: false,
              errorMsg: "Compilation failed.",
            }))
          );
          setIsValidating(false);
          return;
        }

        setCompilationErrors([]);

        const fds = fromBinary(FileDescriptorSetSchema, result.userFileDescriptorSet);
        
        const results = activeExercise.assertions.map((a) => {
          try {
            a.validate(fds);
            return { id: a.id, description: a.description, passed: true };
          } catch (err: any) {
            return {
              id: a.id,
              description: a.description,
              passed: false,
              errorMsg: err.message || "Assertion failed.",
            };
          }
        });

        setAssertionResults(results);

        const allPassed = results.every((r) => r.passed);
        if (allPassed) {
          if (!completedExercises[activeExercise.id]) {
            setCompletedExercises((prev) => ({ ...prev, [activeExercise.id]: true }));
            setIsCompletedJustNow(true);

            const nextIdx = currentExerciseIndex + 1;
            if (nextIdx < EXERCISES.length && nextIdx > highestUnlockedIndex) {
              setHighestUnlockedIndex(nextIdx);
            }
          }
        } else {
          setCompletedExercises((prev) => {
            if (prev[activeExercise.id]) {
              const updated = { ...prev };
              delete updated[activeExercise.id];
              return updated;
            }
            return prev;
          });
        }

      } catch (e: any) {
        console.error("Evaluation loop crashed", e);
        if (isMounted) {
          setCompilationErrors([
            {
              file: "input.proto",
              line: 1,
              col: 1,
              offset: 0,
              message: e.message || "Internal evaluation error.",
            },
          ]);
        }
      } finally {
        if (isMounted) {
          setIsValidating(false);
        }
      }
    }, 400);

    return () => {
      isMounted = false;
      clearTimeout(timer);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeCode, currentExerciseIndex, isConclusion]);

  // Code editor handlers
  const handleCodeChange = (newCode: string) => {
    if (isConclusion) return;
    setExerciseCodes((prev) => ({
      ...prev,
      [activeExercise.id]: newCode,
    }));
  };

  const handleReset = () => {
    if (isConclusion) return;
    if (confirm("Are you sure you want to reset this exercise's code to its initial template?")) {
      handleCodeChange(activeExercise.initialCode);
      setCompletedExercises((prev) => {
        const updated = { ...prev };
        delete updated[activeExercise.id];
        return updated;
      });
    }
  };

  const handleResetAll = () => {
    if (confirm("Reset all practice progress? This will clear all code changes and locked states.")) {
      const initial: Record<number, string> = {};
      EXERCISES.forEach((ex) => {
        initial[ex.id] = ex.initialCode;
      });
      setExerciseCodes(initial);
      setCompletedExercises({});
      setHighestUnlockedIndex(0);
      localStorage.removeItem("protobuf_practice_codes");
      localStorage.removeItem("protobuf_practice_completed");
      localStorage.removeItem("protobuf_practice_highest_unlocked");
      window.location.href = "/practice/1/";
    }
  };

  // Stepper steps configuration
  const steps = useMemo(() => {
    return [
      ...EXERCISES.map((k) => ({
        id: k.id.toString(),
        title: k.title,
        isCompleted: !!completedExercises[k.id],
        isLocked: k.id - 1 > highestUnlockedIndex,
        isActive: !isConclusion && currentExerciseIndex === k.id - 1,
        url: `/practice/${k.id}/`,
      })),
      {
        id: "conclusion",
        title: "Conclusion",
        isCompleted: false,
        isLocked: !EXERCISES.every((k) => completedExercises[k.id]),
        isActive: isConclusion,
        url: "/practice/conclusion/",
      },
    ];
  }, [completedExercises, highestUnlockedIndex, isConclusion, currentExerciseIndex]);

  const isExerciseCompleted = !!completedExercises[activeExercise.id] || isCompletedJustNow;

  // Stepper Header helper
  const renderStepperBar = () => (
    <div className="cyber-box p-4 bg-[var(--panel-bg)] space-y-4">
      {/* Header Info Row */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 border-b border-[var(--border-light)] pb-2.5">
        <span className="text-[10px] font-mono tracking-widest text-[var(--cyber-neon-pink)] uppercase">
          Practice Progress
        </span>
        <h3 className="text-xs font-cyber font-bold text-[var(--text-color)] uppercase tracking-wider">
          {isConclusion ? "Mastery Achieved" : `Exercise ${activeExercise.id}: ${activeExercise.title}`}
        </h3>
      </div>
      {/* Stepper Track Row */}
      <div className="flex items-center justify-start md:justify-center overflow-x-auto py-1 custom-scrollbar gap-1.5 w-full">
        {steps.map((step, idx) => {
          const isLast = idx === steps.length - 1;
          return (
            <div key={step.id} className="flex items-center">
              {step.isLocked ? (
                <div
                  className="flex items-center justify-center w-8 h-8 rounded-full border border-[var(--border-light)] text-[var(--text-dim)]/40 opacity-50 cursor-not-allowed select-none shrink-0"
                  title={`${step.title} (Locked)`}
                >
                  <Lock className="w-3 h-3" />
                </div>
              ) : (
                <a
                  href={step.url}
                  className={`flex items-center justify-center w-8 h-8 rounded-full border font-cyber font-bold text-xs shrink-0 select-none transition-all ${
                    step.isActive
                      ? "bg-[var(--cyber-neon-blue)]/20 border-[var(--cyber-neon-blue)] text-[var(--cyber-neon-blue)] shadow-[0_0_10px_rgba(0,243,255,0.3)] ring-2 ring-[var(--cyber-neon-blue)]/25 animate-pulse"
                      : step.isCompleted
                      ? "bg-[var(--cyber-neon-green)]/15 border-[var(--cyber-neon-green)] text-[var(--cyber-neon-green)]"
                      : "bg-[var(--overlay-bg)] border-[var(--border-light)] text-[var(--text-dim)] hover:border-[var(--cyber-neon-blue)] hover:text-[var(--text-color)]"
                  }`}
                  title={step.title}
                >
                  {step.id === "conclusion" ? (
                    <Trophy className="w-3.5 h-3.5" />
                  ) : step.isCompleted ? (
                    <CheckCircle2 className="w-3.5 h-3.5" />
                  ) : (
                    step.id
                  )}
                </a>
              )}
              {!isLast && (
                <div
                  className={`h-0.5 w-3 sm:w-5 md:w-6 shrink-0 transition-colors mx-1 ${
                    step.isCompleted ? "bg-[var(--cyber-neon-green)]" : "bg-[var(--border-light)]"
                  }`}
                />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );

  // Render Conclusion View
  if (isConclusion) {
    return (
      <Section id="practice" className="min-h-[calc(100vh-var(--header-height))] p-4 sm:p-6 lg:p-8 pt-[74px] flex items-center justify-center">
        <div className="max-w-7xl w-full mx-auto space-y-6">
          {renderStepperBar()}
          
          <CyberPanel className="text-center p-8 space-y-6 flex flex-col items-center">
            <div className="relative">
              <div className="absolute -inset-4 bg-[var(--cyber-neon-green)]/20 rounded-full blur-xl animate-pulse" />
              <div className="relative w-20 h-20 rounded-full bg-[var(--cyber-neon-green)]/15 border-2 border-[var(--cyber-neon-green)] flex items-center justify-center shadow-[0_0_20px_rgba(0,255,159,0.4)]">
                <Trophy className="w-10 h-10 text-[var(--cyber-neon-green)]" />
              </div>
            </div>

            <div className="space-y-2">
              <h1 className="text-3xl sm:text-4xl font-cyber font-black tracking-widest text-[var(--text-color)]">
                PROTOBUF <span className="cyber-text-gradient">MASTERY</span>
              </h1>
              <p className="text-sm text-[var(--text-dim)] max-w-xl mx-auto leading-relaxed">
                You have repaired schemas, inspected compiled AST descriptors, and learned the core rules of backward compatibility.
              </p>
            </div>

            <div className="flex justify-center w-full pt-4">
              <div className="p-4 border border-[var(--border-light)] bg-[var(--overlay-bg)] rounded-lg flex flex-col items-center space-y-1 min-w-[200px]">
                <span className="text-[10px] font-mono text-[var(--text-dim)] uppercase tracking-wider">Stages Completed</span>
                <span className="text-2xl font-cyber font-bold text-[var(--cyber-neon-green)]">8 / 8</span>
              </div>
            </div>

            <div className="border-t border-[var(--border-light)] w-full pt-6 flex items-center justify-center">
              <a
                href="/"
                className="px-8 py-2.5 bg-[var(--cyber-neon-blue)] text-[var(--neon-contrast-text)] hover:shadow-[0_0_15px_rgba(0,243,255,0.4)] font-cyber font-bold uppercase tracking-wider text-xs rounded transition-all text-center"
              >
                Return to Home Page
              </a>
            </div>
          </CyberPanel>
        </div>
      </Section>
    );
  }

  // Render Standard Exercise View
  return (
    <Section id="practice" className="min-h-[calc(100vh-var(--header-height))] p-4 sm:p-6 lg:p-8 pt-[74px]">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Page Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-[var(--border-light)] pb-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-cyber font-bold tracking-wider text-[var(--text-color)] uppercase flex items-center gap-2">
              <Award className="w-7 h-7 text-[var(--cyber-neon-pink)]" />
              PROTOBUF PRACTICE
            </h1>
            <p className="text-sm text-[var(--text-dim)] mt-1">
              Refactor schemas, compile AST descriptors, and achieve Protobuf mastery.
            </p>
          </div>
          <button
            onClick={handleResetAll}
            className="flex items-center gap-1.5 px-3 py-1.5 border border-[var(--error-border)] hover:bg-[var(--text-error)]/10 text-[var(--text-error)] transition-colors text-xs font-cyber font-bold uppercase tracking-wider rounded"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            Reset All Progress
          </button>
        </div>

        {/* Dynamic Stepper */}
        {renderStepperBar()}



        <CyberPanel
          title={activeExercise.title}
          className="space-y-4"
        >
          {/* The Scenario (Context) */}
          <div className="space-y-1.5">
            <span className="text-xs font-mono uppercase tracking-[0.2em] text-[var(--cyber-neon-pink)]">
              The Scenario
            </span>
            <div className="text-sm text-[var(--text-color)] leading-relaxed space-y-2">
              {formatScenarioText(activeExercise.scenario)}
            </div>
          </div>

          <div className="border-t border-[var(--border-light)] my-2" />

          {/* The Task (Primary Objective) */}
          <div className="space-y-1.5">
            <span className="text-xs font-mono uppercase tracking-[0.2em] text-[var(--cyber-neon-blue)]">
              The Task
            </span>
            <p className="text-sm text-[var(--text-color)] leading-relaxed">
              {formatCodeText(activeExercise.task, "text-[var(--cyber-neon-blue)]")}
            </p>
          </div>

          {/* Hint button & details */}
          <div className="pt-2">
            <button
              onClick={() => setShowHint(!showHint)}
              className={`text-[10px] font-mono flex items-center gap-1.5 transition-all uppercase tracking-widest px-3 py-1.5 rounded border ${
                showHint
                  ? "bg-[var(--cyber-neon-yellow)]/15 border-[var(--cyber-neon-yellow)]/40 text-[var(--text-color)]"
                  : "bg-[var(--overlay-bg)] border-[var(--border-light)] text-[var(--text-dim)] hover:border-[var(--cyber-neon-yellow)]/50 hover:text-[var(--text-color)]"
              }`}
            >
              <HelpCircle className="w-3.5 h-3.5" />
              {showHint ? "Hide Hint" : "Show Hint"}
            </button>
            {showHint && (
              <div className="mt-3 text-xs text-[var(--text-dim)] leading-relaxed font-sans animate-in fade-in slide-in-from-top-2 duration-200">
                {formatCodeText(activeExercise.hint, "text-[var(--cyber-neon-yellow)]")}
              </div>
            )}
          </div>
        </CyberPanel>

        {/* Main Workspace Split-Pane */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
          {/* Left Column (Monaco-like Editor) */}
          <div className="lg:col-span-8 flex flex-col border border-[var(--border-light)] rounded-lg overflow-hidden bg-[var(--panel-bg)] min-h-[450px]">
            <div className="flex items-center justify-between px-4 py-2 border-b border-[var(--border-light)] bg-[var(--overlay-bg)]">
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono text-[var(--text-dim)] uppercase tracking-wider">
                  schema.proto
                </span>
              </div>
              <div className="flex items-center gap-2">
                {isValidating && (
                  <div className="flex items-center gap-1.5 px-2 py-0.5 rounded bg-[var(--cyber-neon-blue)]/10 text-[var(--cyber-neon-blue)] border border-[var(--cyber-neon-blue)]/20 text-[10px] font-mono uppercase tracking-widest animate-pulse">
                    Compiling
                  </div>
                )}
                {!isValidating && compilationErrors.length === 0 && (
                  <div className="flex items-center gap-1 px-2 py-0.5 rounded bg-[var(--cyber-neon-green)]/10 text-[var(--cyber-neon-green)] border border-[var(--cyber-neon-green)]/20 text-[10px] font-mono uppercase tracking-widest">
                    Valid Schema
                  </div>
                )}
                {!isValidating && compilationErrors.length > 0 && (
                  <div className="flex items-center gap-1 px-2 py-0.5 rounded bg-[var(--text-error)]/10 text-[var(--text-error)] border border-[var(--text-error)]/20 text-[10px] font-mono uppercase tracking-widest">
                    Syntax Error
                  </div>
                )}
                <button
                  onClick={handleReset}
                  className="flex items-center gap-1 px-2.5 py-1 text-[10px] font-mono uppercase text-[var(--text-dim)] hover:text-[var(--text-color)] transition-colors border border-[var(--border-light)] rounded"
                >
                  Reset stage
                </button>
              </div>
            </div>

            <div className="flex-1 relative">
              <SchemaEditor
                value={activeCode}
                onChange={handleCodeChange}
                errors={compilationErrors}
              />
            </div>
          </div>

          {/* Right Column (Assertions checklist) */}
          <div className="lg:col-span-4 flex flex-col gap-4">
            {/* Assertions checklist */}
            <CyberPanel title="EVALUATION_CHECKS" className="h-full space-y-4">
              {compilationErrors.length > 0 ? (
                <div className="bg-[var(--text-error)]/5 border border-[var(--text-error)]/20 rounded p-3 text-xs font-mono text-[var(--text-error)] space-y-2">
                  <div className="flex items-center gap-2 font-bold uppercase tracking-wider">
                    <AlertTriangle className="w-4 h-4 shrink-0" />
                    Compilation Failed
                  </div>
                  <div className="space-y-1">
                    {compilationErrors.map((err, i) => (
                      <div key={i} className="pl-6 relative">
                        <span className="absolute left-0">L{err.line}:</span>
                        {err.message}
                      </div>
                    ))}
                  </div>
                </div>
              ) : assertionResults.length === 0 ? (
                <div className="space-y-3">
                  {activeExercise.assertions.map((assert: any) => (
                    <div
                      key={assert.id}
                      className="flex gap-3 items-start p-2.5 rounded border border-[var(--border-light)] bg-[var(--overlay-bg)] opacity-50 animate-pulse"
                    >
                      <div className="mt-0.5 shrink-0">
                        <div className="w-4 h-4 rounded-full border border-[var(--border-light)] flex items-center justify-center text-xs font-mono text-[var(--text-dim)]" />
                      </div>
                      <div className="space-y-0.5 min-w-0">
                        <span className="text-sm font-cyber font-bold uppercase tracking-wider text-[var(--text-color)]">
                          {assert.description}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="space-y-3">
                  {assertionResults.map((assert) => (
                    <div
                      key={assert.id}
                      className={`flex gap-3 items-start p-2.5 rounded border transition-colors ${
                        assert.passed
                          ? "bg-[var(--cyber-neon-green)]/5 border-[var(--cyber-neon-green)]/25"
                          : "bg-[var(--overlay-bg)] border-[var(--border-light)]"
                      }`}
                    >
                      <div className="mt-0.5 shrink-0">
                        {assert.passed ? (
                          <div className="w-4 h-4 rounded-full bg-[var(--cyber-neon-green)]/15 border border-[var(--cyber-neon-green)] flex items-center justify-center shadow-[0_0_8px_rgba(0,255,159,0.3)]">
                            <div className="w-1.5 h-1.5 rounded-full bg-[var(--cyber-neon-green)] animate-ping" />
                          </div>
                        ) : (
                          <div className="w-4 h-4 rounded-full border border-[var(--border-light)] flex items-center justify-center text-xs font-mono text-[var(--text-dim)]">
                            -
                          </div>
                        )}
                      </div>
                      <div className="space-y-0.5 min-w-0">
                        <span
                          className={`text-sm font-cyber font-bold uppercase tracking-wider transition-colors ${
                            assert.passed
                              ? "text-[var(--cyber-neon-green)]"
                              : "text-[var(--text-color)]"
                          }`}
                        >
                          {assert.description}
                        </span>
                        {!assert.passed &&
                          assert.errorMsg &&
                          assert.errorMsg !== "Compilation failed." && (
                            <p className="text-xs text-[var(--text-dim)] font-mono opacity-80 pt-0.5 leading-normal">
                              {assert.errorMsg}
                            </p>
                          )}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Stage Progression Banner (Completed / Incomplete States) */}
              {isExerciseCompleted ? (
                <div className="bg-[var(--cyber-neon-green)]/15 border border-[var(--cyber-neon-green)]/30 rounded p-4 text-center space-y-3 animate-in fade-in slide-in-from-bottom-2 duration-300">
                  <div className="inline-flex w-10 h-10 rounded-full bg-[var(--cyber-neon-green)]/20 items-center justify-center text-[var(--cyber-neon-green)] shadow-[0_0_15px_rgba(0,255,159,0.4)]">
                    <Sparkles className="w-5 h-5" />
                  </div>
                  <div className="space-y-1">
                    <h4 className="text-sm font-cyber font-bold text-[var(--cyber-neon-green)] uppercase tracking-widest">
                      Mastery Passed!
                    </h4>
                    <p className="text-xs text-[var(--text-color)]">
                      Your descriptor satisfies all strict constraints.
                    </p>
                  </div>

                  {currentExerciseIndex + 1 < EXERCISES.length ? (
                    <a
                      href={`/practice/${currentExerciseIndex + 2}/`}
                      className="w-full py-2 bg-[var(--cyber-neon-green)] text-[var(--neon-contrast-text)] hover:shadow-[0_0_15px_rgba(0,255,159,0.5)] font-cyber font-bold uppercase tracking-wider text-xs rounded flex items-center justify-center gap-1.5 transition-all text-center"
                    >
                      Next Exercise: {EXERCISES[currentExerciseIndex + 1].title}
                      <ArrowRight className="w-4 h-4" />
                    </a>
                  ) : (
                    <a
                      href="/practice/conclusion/"
                      className="w-full py-2 bg-[var(--cyber-neon-green)] text-[var(--neon-contrast-text)] hover:shadow-[0_0_15px_rgba(0,255,159,0.5)] font-cyber font-bold uppercase tracking-wider text-xs rounded flex items-center justify-center gap-1.5 transition-all text-center"
                    >
                      Go to Conclusion
                      <ArrowRight className="w-4 h-4" />
                    </a>
                  )}
                </div>
              ) : (
                <div className="bg-[var(--panel-bg)] border border-[var(--border-light)] rounded p-4 text-center space-y-3 opacity-60">
                  <div className="inline-flex w-10 h-10 rounded-full bg-black/40 border border-[var(--border-light)] items-center justify-center text-[var(--text-dim)]/50">
                    <Lock className="w-5 h-5" />
                  </div>
                  <div className="space-y-1">
                    <h4 className="text-sm font-cyber font-bold text-[var(--text-dim)] uppercase tracking-widest">
                      Exercise Incomplete
                    </h4>
                    <p className="text-xs text-[var(--text-dim)]">
                      Please satisfy all checks above
                    </p>
                  </div>
                  <button
                    disabled
                    className="w-full py-2 bg-[var(--overlay-bg)] border border-[var(--border-light)] text-[var(--text-dim)]/40 font-cyber font-bold uppercase tracking-wider text-xs rounded cursor-not-allowed text-center"
                  >
                    Complete all checks to continue
                  </button>
                </div>
              )}
            </CyberPanel>
          </div>
        </div>
      </div>
    </Section>
  );
};
