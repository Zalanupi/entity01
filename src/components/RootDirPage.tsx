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

const LOG_ENTRIES: LogEntry[] = [
  {
    id: "log-1",
    label:
      "[LOG:0441] ACCESS_V10L4T10N detected in sector 7G — unauthorized r34d at 0x7F4A_BBQ2",
    cleanLabel:
      "[LOG:0441] ACCESS_VIOLATION detected in sector 7G — unauthorized read at 0x7F4A_BBQ2",
    correctIndex: 0,
  },
  {
    id: "log-2",
    label:
      "[LOG:0442] M3m0ry address 0x7F3A001F c0rrupted — att3mpt1ng rec0very pr0t0c0l...",
    cleanLabel:
      "[LOG:0442] Memory address 0x7F3A001F corrupted — attempting recovery protocol...",
    correctIndex: 1,
  },
  {
    id: "log-3",
    label:
      "[LOG:0443] ENT1TY s1gnature m4tched — pattern 0xDEADBEEF r3c0gn1z3d in k3rn3l sp4ce",
    cleanLabel:
      "[LOG:0443] ENTITY signature matched — pattern 0xDEADBEEF recognized in kernel space",
    correctIndex: 2,
  },
  {
    id: "log-4",
    label:
      "[LOG:0444] Qu4rant1ne pr0t0c0l 1n1t14ted — is0lating m3m0ry bl0cks 0xA000-0xBFFF",
    cleanLabel:
      "[LOG:0444] Quarantine protocol initiated — isolating memory blocks 0xA000-0xBFFF",
    correctIndex: 3,
  },
  {
    id: "log-5",
    label:
      "[LOG:0445] CR1T1CAL: Qu4rant1ne F4ILED. ENT1TY_01 h4s br34ched c0nta1nment. Syst3m c0mpr0m1s3d.",
    cleanLabel:
      "[LOG:0445] CRITICAL: Quarantine FAILED. ENTITY_01 has breached containment. System compromised.",
    correctIndex: 4,
  },
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

  const [items, setItems] = useState<LogEntry[]>(() => shuffle(LOG_ENTRIES));
  const [isSolved, setIsSolved] = useState(false);
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
      setIsSolved(true);
      increaseIntegrity(15);
    } else {
      setError("[ SEQUENCE MISMATCH — LOG INTEGRITY NOT RESTORED ]");
    }
  }, [items, isSolved, isDragging, increaseIntegrity]);

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
