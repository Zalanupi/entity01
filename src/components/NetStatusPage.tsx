export default function NetStatusPage() {
  return (
    <div className="flex flex-col items-center justify-center h-full gap-3">
      <h2 className="text-lg font-mono text-red-400 tracking-widest">
        NET_STATUS
      </h2>
      <p className="text-xs font-mono text-zinc-600 animate-pulse">
        [ SIGNAL LOST ]
      </p>
    </div>
  );
}
