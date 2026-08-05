import { Router, Route } from "wouter";
import { useHashLocation } from "wouter/use-hash-location";
import Shell from "./components/Shell";
import LogExtractPage from "./components/LogExtractPage";
import RootDirPage from "./components/RootDirPage";
import CoreDumpPage from "./components/CoreDumpPage";
import NetStatusPage from "./components/NetStatusPage";

export default function App() {
  return (
    <Router hook={useHashLocation}>
      <Shell>
        <Route path="/" component={LogExtractPage} />
        <Route path="/log-extract" component={LogExtractPage} />
        <Route path="/root-dir" component={RootDirPage} />
        <Route path="/core-dump" component={CoreDumpPage} />
        <Route path="/net-status" component={NetStatusPage} />
      </Shell>
    </Router>
  );
}
