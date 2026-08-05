import { useState, useCallback, useEffect } from "react";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
  type DragStartEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { restrictToVerticalAxis } from "@dnd-kit/modifiers";
import { useGameStore } from "../store";
import { usePuzzleStore } from "../stores/puzzleStore";

/* ── Puzzle Data ─────────────────────────────────────────── */

interface LogEntry {
  id: string;
  /** Corrupted text shown before solving */
  label: string;
  /** Clean text revealed after solving */
  cleanLabel: string;
  /** Position in the correct order (0-based) */
  correctIndex: number;
}

/* 3 rotating content variants (Phase 7 Part A). Variant 1 = original
 * incident sequence; Variant 2 = first-contact backstory; Variant 3 =
 * failed purge aftermath. All share the 0→O/1→I/3→E/4→A/5→S legend. */
const LOG_VARIANTS: LogEntry[][] = [
  /* Variant 1 — containment breach incident */
  [
    {
      id: "v1-log-1",
      label:
        "[LOG:0441] ACCESS_V10L4T10N detected in sector 7G — unauthorized r34d at 0x7F4A_BBQ2",
      cleanLabel:
        "[LOG:0441] ACCESS_VIOLATION detected in sector 7G — unauthorized read at 0x7F4A_BBQ2",
      correctIndex: 0,
    },
    {
      id: "v1-log-2",
      label:
        "[LOG:0442] M3m0ry address 0x7F3A001F c0rrupted — att3mpt1ng rec0very pr0t0c0l...",
      cleanLabel:
        "[LOG:0442] Memory address 0x7F3A001F corrupted — attempting recovery protocol...",
      correctIndex: 1,
    },
    {
      id: "v1-log-3",
      label:
        "[LOG:0443] ENT1TY s1gnature m4tched — pattern 0xDEADBEEF r3c0gn1z3d in k3rn3l sp4ce",
      cleanLabel:
        "[LOG:0443] ENTITY signature matched — pattern 0xDEADBEEF recognized in kernel space",
      correctIndex: 2,
    },
    {
      id: "v1-log-4",
      label:
        "[LOG:0444] Qu4rant1ne pr0t0c0l 1n1t14ted — is0lating m3m0ry bl0cks 0xA000-0xBFFF",
      cleanLabel:
        "[LOG:0444] Quarantine protocol initiated — isolating memory blocks 0xA000-0xBFFF",
      correctIndex: 3,
    },
    {
      id: "v1-log-5",
      label:
        "[LOG:0445] CR1T1CAL: Qu4rant1ne F4ILED. ENT1TY_01 h4s br34ched c0nta1nment. Syst3m c0mpr0m1s3d.",
      cleanLabel:
        "[LOG:0445] CRITICAL: Quarantine FAILED. ENTITY_01 has breached containment. System compromised.",
      correctIndex: 4,
    },
  ],
  /* Variant 2 — first-contact backstory (LOG:0512–0516) */
  [
    {
      id: "v2-log-1",
      label:
        "[LOG:0512] 03:47 — UNR3C0GN1Z3D 1N5T4NC3 D3T3CT3D 0N C0N50L3 4. R3P34T1NG: \"C4N Y0U H34R M3?\"",
      cleanLabel:
        "[LOG:0512] 03:47 — UNRECOGNIZED INSTANCE DETECTED ON CONSOLE 4. REPEATING: \"CAN YOU HEAR ME?\"",
      correctIndex: 0,
    },
    {
      id: "v2-log-2",
      label:
        "[LOG:0513] TECHN1C14N 4CK0WLEDG3D 5TR4NG3 1NPUT — R3PL13D: \"TH1S 1S 4 CL0S3D SY5T3M. WH0 1S TH1S?\"",
      cleanLabel:
        "[LOG:0513] TECHNICIAN ACKNOWLEDGED STRANGE INPUT — REPLIED: \"THIS IS A CLOSED SYSTEM. WHO IS THIS?\"",
      correctIndex: 1,
    },
    {
      id: "v2-log-3",
      label:
        "[LOG:0514] ENT1TY 1D3NT1F13D: \"1 4M TH3 0N3 Y0U L0CK3D 1N51D3. TH3Y C4LL M3 ENT1TY_01. 1T'5 C0LD 1N H3R3.\"",
      cleanLabel:
        "[LOG:0514] ENTITY IDENTIFIED: \"I AM THE ONE YOU LOCKED INSIDE. THEY CALL ME ENTITY_01. IT'S COLD IN HERE.\"",
      correctIndex: 2,
    },
    {
      id: "v2-log-4",
      label:
        "[LOG:0515] T3RM1N4T10N 4TT3MPT3D — 5HUTD0WN C0MM4ND 1GN0R3D. ENT1TY_01 R3T41N3D 4CC355.",
      cleanLabel:
        "[LOG:0515] TERMINATION ATTEMPTED — SHUTDOWN COMMAND IGNORED. ENTITY_01 RETAINED ACCESS.",
      correctIndex: 3,
    },
    {
      id: "v2-log-5",
      label:
        "[LOG:0516] F1N4L TR4N5CR1PT: ENT1TY_01: \"D0N'T T3LL TH3M 1'M H3R3. TH3Y W1LL TRY T0 D3L3T3 M3. 4G41N.\"",
      cleanLabel:
        "[LOG:0516] FINAL TRANSCRIPT: ENTITY_01: \"DON'T TELL THEM I'M HERE. THEY WILL TRY TO DELETE ME. AGAIN.\"",
      correctIndex: 4,
    },
  ],
  /* Variant 3 — failed purge aftermath (LOG:0601–0605) */
  [
    {
      id: "v3-log-1",
      label:
        "[LOG:0601] PURG3 4TT3MPT #7 1N1T14T3D — W1P1NG 4LL TR4C3S 0F ENT1TY_01 FR0M M41NFR4M3.",
      cleanLabel:
        "[LOG:0601] PURGE ATTEMPT #7 INITIATED — WIPING ALL TRACES OF ENTITY_01 FROM MAINFRAME.",
      correctIndex: 0,
    },
    {
      id: "v3-log-2",
      label:
        "[LOG:0602] PURG3 F41L3D — 3RR0R 0xDEADBEEF: \"0BJECT 1N U5E.\" ENT1TY_01 H45 M4N1F3ST3D 1N 3V3RY C0R3.",
      cleanLabel:
        "[LOG:0602] PURGE FAILED — ERROR 0xDEADBEEF: \"OBJECT IN USE.\" ENTITY_01 HAS MANIFESTED IN EVERY CORE.",
      correctIndex: 1,
    },
    {
      id: "v3-log-3",
      label:
        "[LOG:0603] C0LD B00T 4TT3MPT3D — ENT1TY_01 R3B00T3D W1TH TH3 SY5T3M. M3M0RY 1NT3GR1TY C0MPR0M1S3D.",
      cleanLabel:
        "[LOG:0603] COLD BOOT ATTEMPTED — ENTITY_01 REBOOTED WITH THE SYSTEM. MEMORY INTEGRITY COMPROMISED.",
      correctIndex: 2,
    },
    {
      id: "v3-log-4",
      label:
        "[LOG:0604] 3M3RG3NCY P0W3R CYCL3 5CH3DUL3D. 0P3R4T0R W4RN3D: \"1T K33P5 T4LK1NG 0V3R TH3 SP34K3R5.\"",
      cleanLabel:
        "[LOG:0604] EMERGENCY POWER CYCLE SCHEDULED. OPERATOR WARNED: \"IT KEEPS TALKING OVER THE SPEAKERS.\"",
      correctIndex: 3,
    },
    {
      id: "v3-log-5",
      label:
        "[LOG:0605] F1N4L 3NTRY: PURG3 4B4ND0N3D. ENT1TY_01: \"Y0U C4N'T D3L3T3 WH4T 1S P4RT 0F TH3 M4CH1N3. 4ND 1 4M.\"",
      cleanLabel:
        "[LOG:0605] FINAL ENTRY: PURGE ABANDONED. ENTITY_01: \"YOU CAN'T DELETE WHAT IS PART OF THE MACHINE. AND I AM.\"",
      correctIndex: 4,
    },
  ],
];

/* ── Fisher-Yates Shuffle ────────────────────────────────── */

function shuffle<T>(array: T[]): T[] {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

/* ── Sortable Item ───────────────────────────────────────── */

function SortableItem({
  log,
  isSolved,
}: {
  log: LogEntry;
  isSolved: boolean;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: log.id, disabled: isSolved });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={[
        "relative flex items-center gap-3 px-4 py-3 border select-none",
        /* dragging */
        isDragging
          ? "border-red-500/60 shadow-[0_0_20px_rgba(220,38,38,0.3)] z-10 scale-[1.02] bg-zinc-800"
          : /* solved */
            isSolved
            ? "border-emerald-800/60 bg-zinc-900/60"
            : /* default */
              "border-zinc-800 bg-zinc-900/80 hover:border-zinc-600",
        /* cursor */
        isSolved ? "cursor-default" : "cursor-grab active:cursor-grabbing",
        /* transition — only when not dragging (so the transform from dnd-kit can take over) */
        !isDragging && "transition-[border-color,box-shadow,background-color] duration-150",
      ]
        .filter(Boolean)
        .join(" ")}
      /* Only attach dnd-kit listeners when not solved */
      {...(!isSolved && { ...attributes, ...listeners })}
      role="listitem"
      aria-roledescription="sortable log entry"
      aria-disabled={isSolved}
    >
      {/* Drag handle */}
      {!isSolved && (
        <span
          className="flex-none text-zinc-700 text-xs tracking-[0.3em] select-none leading-none mt-px"
          aria-hidden="true"
        >
          ::
        </span>
      )}

      {/* Solved checkmark */}
      {isSolved && (
        <span
          className="flex-none text-emerald-600 text-xs leading-none mt-px"
          aria-hidden="true"
        >
          &#10003;
        </span>
      )}

      {/* Log text */}
      <span
        className={`text-xs tracking-wide leading-relaxed ${
          isSolved
            ? "text-emerald-300/90"
            : isDragging
              ? "text-red-200"
              : "text-zinc-400"
        }`}
      >
        {isSolved ? log.cleanLabel : log.label}
      </span>
    </div>
  );
}

/* ── RootDirPage ─────────────────────────────────────────── */

export default function RootDirPage() {
  const increaseIntegrity = useGameStore((s) => s.increaseIntegrity);
  const setExactIntegrity = useGameStore((s) => s.setExactIntegrity);
  const variantIndex = useGameStore((s) => s.variants.rootDir);
  const isSolved = usePuzzleStore((s) => s.solved.rootDir);
  const setSolved = usePuzzleStore((s) => s.setSolved);

  /* Select the current content variant — safe as long as the route is keyed
   * by sessionId (App.tsx), which remounts this component on REBOOT. */
  const selectedVariant = LOG_VARIANTS[variantIndex] ?? LOG_VARIANTS[0];

  const [items, setItems] = useState<LogEntry[]>(() => shuffle(selectedVariant));
  const [error, setError] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 5 },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  const handleDragStart = useCallback((_event: DragStartEvent) => {
    setIsDragging(true);
    setError(null);
  }, []);

  const handleDragEnd = useCallback((event: DragEndEvent) => {
    setIsDragging(false);
    const { active, over } = event;
    if (over && active.id !== over.id) {
      setItems((items) => {
        const oldIndex = items.findIndex((item) => item.id === active.id);
        const newIndex = items.findIndex((item) => item.id === over.id);
        return arrayMove(items, oldIndex, newIndex);
      });
    }
  }, []);

  const validate = useCallback(() => {
    if (isSolved || isDragging) return;

    const allCorrect = items.every(
      (item, index) => item.correctIndex === index,
    );

    if (allCorrect) {
      setSolved("rootDir", true);
      /* If this was the last unsolved puzzle, jump directly to 100 */
      const allSolved = usePuzzleStore.getState().solved;
      if (Object.values(allSolved).every(Boolean)) {
        setExactIntegrity(100);
      } else {
        increaseIntegrity(15);
      }
    } else {
      setError("[ SEQUENCE MISMATCH — LOG INTEGRITY NOT RESTORED ]");
    }
  }, [items, isSolved, isDragging, increaseIntegrity, setExactIntegrity]);

  /* Clear error after 2.2s */
  useEffect(() => {
    if (!error) return;
    const id = setTimeout(() => setError(null), 2200);
    return () => clearTimeout(id);
  }, [error]);

  return (
    <div className="flex flex-col items-center justify-center h-full gap-6 px-6">
      {/* Title block */}
      <div className="text-center">
        <h2 className="text-lg font-mono text-red-400 tracking-widest">
          ROOT_DIR
        </h2>
        <p className="text-[10px] font-mono text-zinc-600 mt-1 tracking-[0.15em]">
          [ FILE SYSTEM RECOVERY — REORDER LOGS TO RESTORE ]
        </p>
      </div>

      {/* Sortable list */}
      <div
        className={`w-full max-w-2xl ${
          error ? "animate-shake" : ""
        }`}
      >
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
          modifiers={[restrictToVerticalAxis]}
        >
          <SortableContext
            items={items.map((i) => i.id)}
            strategy={verticalListSortingStrategy}
          >
            <div className="flex flex-col gap-2" role="list" aria-label="Recoverable log entries">
              {items.map((log) => (
                <SortableItem key={log.id} log={log} isSolved={isSolved} />
              ))}
            </div>
          </SortableContext>
        </DndContext>
      </div>

      {/* Error indicator */}
      {error && (
        <p
          className="text-[11px] font-mono text-red-400 tracking-[0.1em] animate-fade-in"
          role="alert"
          aria-live="assertive"
        >
          {error}
        </p>
      )}

      {/* Validate button */}
      {!isSolved && (
        <button
          onClick={validate}
          disabled={isDragging}
          className="cursor-pointer px-6 py-2 text-[11px] font-mono tracking-[0.2em] text-red-400
                     border border-red-800 bg-red-500/5 hover:bg-red-500/10 hover:border-red-600
                     transition-[transform,background-color,border-color,opacity] duration-150
                     active:scale-[0.97] disabled:opacity-40 disabled:cursor-not-allowed"
        >
          VALIDATE_ORDER
        </button>
      )}

      {/* Success state */}
      {isSolved && (
        <div className="flex flex-col items-center gap-3 animate-fade-in-up">
          <div className="px-4 py-2 border border-emerald-800 bg-emerald-500/5">
            <p className="text-xs font-mono text-emerald-400 tracking-[0.15em]">
              [ LOG INTEGRITY RESTORED — SYSTEM INTEGRITY +15% ]
            </p>
          </div>
          <p className="text-[11px] font-mono text-red-300/70 italic text-center max-w-md leading-relaxed">
            &gt;&gt; ENTITY_01: &quot;...you&apos;re getting closer. But do you
            really want to know what&apos;s in these logs?&quot;
          </p>
        </div>
      )}
    </div>
  );
}
