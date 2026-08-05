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
  const sessionId = useGameStore((s) => s.sessionId);
  const systemIntegrity = useGameStore((s) => s.systemIntegrity);

  // Auto-trigger screens watch integrity directly (mirrors LossScreen pattern):
  //   Loss at 0% → SYSTEM_LOST full-screen overlay
  //   Win  at 100% → SYSTEM_STABILIZED full-screen overlay
  // These fire on any puzzle page, on any tab, without player interaction.
  if (systemIntegrity === 0) {
    return <LossScreen />;
  }
  if (systemIntegrity >= 100) {
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
