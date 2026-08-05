import { Router, Route } from "wouter";
import { useHashLocation } from "wouter/use-hash-location";
import { useGameStore } from "./store";
import BriefingPage from "./components/BriefingPage";
import Shell from "./components/Shell";
import LogExtractPage from "./components/LogExtractPage";
import RootDirPage from "./components/RootDirPage";
import CoreDumpPage from "./components/CoreDumpPage";
import NetStatusPage from "./components/NetStatusPage";
import LossScreen from "./components/LossScreen";
import WinScreen from "./components/WinScreen";

export default function App() {
  const hasBooted = useGameStore((s) => s.hasBooted);
  const hasWon = useGameStore((s) => s.hasWon);
  const sessionId = useGameStore((s) => s.sessionId);
  const systemIntegrity = useGameStore((s) => s.systemIntegrity);

  // Loss state: integrity at 0 (only reachable via NET_STATUS wrong traces).
  // Rendered above everything; REBOOT on it restores integrity to 42.
  if (systemIntegrity === 0) {
    return <LossScreen />;
  }

  // Win state: EXIT_SYSTEM at 100% integrity — the door opens.
  if (hasWon) {
    return <WinScreen />;
  }

  // Session-start gate: Briefing Screen renders before the shell
  if (!hasBooted) {
    return <BriefingPage />;
  }

  return (
    <Router hook={useHashLocation}>
      <Shell>
        <Route path="/" component={LogExtractPage} />
        <Route path="/log-extract" component={LogExtractPage} />
        {/* Puzzle routes get a sessionId key so REBOOT remounts them fresh */}
        <Route path="/root-dir">
          <RootDirPage key={`root-dir-${sessionId}`} />
        </Route>
        <Route path="/core-dump">
          <CoreDumpPage key={`core-dump-${sessionId}`} />
        </Route>
        <Route path="/net-status">
          <NetStatusPage key={`net-status-${sessionId}`} />
        </Route>
      </Shell>
    </Router>
  );
}
