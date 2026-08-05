import { useState, useCallback, useEffect } from "react";
import { useGameStore } from "../store";

/* ── Node Data Types ──────────────────────────────────────── */

interface NodeData {
  id: string;
  label: string;
  signalHash: string;
  latency: number;
  uptime: number;
  isAnomaly: boolean;
}

/* ── Static node definitions (7 normal + 1 anomaly) ──────── */

const NORMAL_NODES: Omit<NodeData, "id" | "label" | "isAnomaly">[] = [
  { signalHash: "A3F2C1", latency: 12, uptime: 847 },
  { signalHash: "A7B0D4", latency: 8, uptime: 912 },
  { signalHash: "AF1E09", latency: 15, uptime: 723 },
  { signalHash: "A144BB", latency: 11, uptime: 891 },
  { signalHash: "A9C30F", latency: 9, uptime: 934 },
  { signalHash: "A4EE22", latency: 14, uptime: 756 },
  { signalHash: "AB1234", latency: 10, uptime: 865 },
];

const ANOMALY: Omit<NodeData, "id" | "label" | "isAnomaly"> = {
  signalHash: "D34DC0",
  latency: 47,
  uptime: 23,
};

/* ── Data Factory ─────────────────────────────────────────── */

function buildNodes(): NodeData[] {
  const anomalyIndex = Math.floor(Math.random() * 8);
  const nodes: Omit<NodeData, "id" | "label" | "isAnomaly">[] = [];

  for (let i = 0; i < 8; i++) {
    nodes.push(i === anomalyIndex ? ANOMALY : NORMAL_NODES[i < anomalyIndex ? i : i - 1]);
  }

  return nodes.map((n, i) => ({
    ...n,
    id: `node-0${i + 1}`,
    label: `NODE_0${i + 1}`,
    isAnomaly: i === anomalyIndex,
  }));
}

/* ── NetStatusPage ────────────────────────────────────────── */

export default function NetStatusPage() {
  const decreaseIntegrity = useGameStore((s) => s.decreaseIntegrity);
  const increaseIntegrity = useGameStore((s) => s.increaseIntegrity);

  const [nodes] = useState<NodeData[]>(buildNodes);
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [isSolved, setIsSolved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /* Handle card click */
  const handleSelect = useCallback(
    (id: string) => {
      if (isSolved) return;
      setSelectedNodeId(id);
      setError(null);
    },
    [isSolved],
  );

  /* Handle TRACE_ANOMALY validation */
  const handleTrace = useCallback(() => {
    if (!selectedNodeId || isSolved) return;
    const selectedNode = nodes.find((n) => n.id === selectedNodeId);
    if (!selectedNode) return;

    if (selectedNode.isAnomaly) {
      /* ---- CORRECT PATH ---- */
      setIsSolved(true);
      increaseIntegrity(15);
    } else {
      /* ---- INCORRECT PATH ---- */
      decreaseIntegrity(10);
      setError("[ SIGNAL TRACE FAILED — ANOMALY NOT AT THIS NODE ]");
    }
  }, [selectedNodeId, nodes, isSolved, decreaseIntegrity, increaseIntegrity]);

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
          NET_STATUS
        </h2>
        <p className="text-[10px] font-mono text-zinc-600 mt-1 tracking-[0.15em]">
          [ NETWORK SCAN — IDENTIFY SIGNAL ANOMALY ]
        </p>
      </div>

      {/* Node grid */}
      <div
        className={`w-full max-w-2xl ${
          error ? "animate-shake" : ""
        }`}
      >
        <div
          className="grid grid-cols-4 gap-3"
          role="listbox"
          aria-label="Network nodes"
        >
          {nodes.map((node) => {
            const isSelected = selectedNodeId === node.id;

            let cardClasses =
              "bg-zinc-900/80 border rounded px-4 py-3 transition-all duration-150 select-none";

            if (isSolved) {
              if (node.isAnomaly) {
                cardClasses +=
                  " border-emerald-600 shadow-[0_0_16px_rgba(16,185,129,0.3)] animate-pulse";
              } else {
                cardClasses +=
                  " border-zinc-800 opacity-40 cursor-default";
              }
            } else if (isSelected) {
              cardClasses +=
                " border-red-600 shadow-[0_0_12px_rgba(220,38,38,0.2)] cursor-pointer";
            } else {
              cardClasses +=
                " border-zinc-700 hover:border-zinc-500 cursor-pointer";
            }

            return (
              <div
                key={node.id}
                role="option"
                aria-selected={isSelected}
                aria-label={`Node ${node.label}: signal ${node.signalHash}`}
                className={cardClasses}
                onClick={() => handleSelect(node.id)}
              >
                {/* Node ID */}
                <div className="text-[10px] font-mono text-zinc-600 tracking-[0.15em]">
                  {node.label}
                </div>

                {/* Signal Hash */}
                <div className="text-lg font-mono text-zinc-300 tracking-widest mt-1">
                  {node.signalHash}
                </div>

                {/* Metrics */}
                <div className="text-[10px] font-mono text-zinc-600 mt-1">
                  {node.latency}ms | {node.uptime}h
                </div>

                {/* Anomaly confirmed badge (solved) */}
                {isSolved && node.isAnomaly && (
                  <div className="mt-2 text-[9px] font-mono text-emerald-400 tracking-[0.15em]">
                    ANOMALY CONFIRMED
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Error indicator */}
      {error && (
        <>
          <p
            className="text-[11px] font-mono text-red-400 tracking-[0.1em] animate-fade-in"
            role="alert"
            aria-live="assertive"
          >
            {error}
          </p>
          <p className="text-[11px] font-mono text-red-300/70 italic text-center max-w-md leading-relaxed animate-fade-in">
            &gt;&gt; ENTITY_01: &quot;Wrong node. Signal traces are tricky,
            aren&apos;t they? Don&apos;t worry — I&apos;ll redirect you
            somewhere... safer.&quot;
          </p>
        </>
      )}

      {/* TRACE_ANOMALY button */}
      {!isSolved && (
        <button
          onClick={handleTrace}
          disabled={selectedNodeId === null}
          className="cursor-pointer px-6 py-2 text-[11px] font-mono tracking-[0.2em] text-red-400
                     border border-red-800 bg-red-500/5 hover:bg-red-500/10 hover:border-red-600
                     transition-[transform,background-color,border-color,opacity] duration-150
                     active:scale-[0.97] disabled:opacity-40 disabled:cursor-not-allowed"
        >
          TRACE_ANOMALY
        </button>
      )}

      {/* Success state */}
      {isSolved && (
        <div className="flex flex-col items-center gap-3 animate-fade-in-up">
          <div className="px-4 py-2 border border-emerald-800 bg-emerald-500/5">
            <p className="text-xs font-mono text-emerald-400 tracking-[0.15em]">
              [ ANOMALY TRACED — SYSTEM INTEGRITY +15% ]
            </p>
          </div>
          <p className="text-[11px] font-mono text-red-300/70 italic text-center max-w-md leading-relaxed">
            &gt;&gt; ENTITY_01: &quot;You traced my signal. I didn&apos;t think
            you&apos;d make it this far. That node you found? It&apos;s real.
            I&apos;m here. What happens when you find me?&quot;
          </p>
        </div>
      )}
    </div>
  );
}