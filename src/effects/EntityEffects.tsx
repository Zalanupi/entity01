import { useEffect, useRef } from "react";
import { useChatStore } from "../stores/chatStore";
import { useEffectStore } from "../stores/effectStore";
import { useGameStore } from "../store";
import { unlockAudio } from "./sound";
import GlitchFlash from "./GlitchFlash";
import FakeCrash from "./FakeCrash";
import Jumpscare from "./Jumpscare";

/** JUMPSCARE only fires once the system is already critically degraded. */
const JUMPSCARE_MAX_INTEGRITY = 30;

/**
 * Mounted at the app root (inside the Router). Watches the chat store for
 * new non-NONE actions and dispatches them to the effect bus, which renders
 * the matching visual overlay component. INTEGRITY_SHAKE is handled by
 * Shell (it shakes the integrity meter); EntityEffects returns null for it.
 *
 * JUMPSCARE is gated on systemIntegrity: it only renders below 30%, so it
 * reads as an intensifying moment inside the already-degraded state rather
 * than a random event. Above that threshold it degrades to a GlitchFlash.
 */
export default function EntityEffects() {
  const lastAction = useChatStore((s) => s.lastAction);
  const actionNonce = useChatStore((s) => s.actionNonce);
  const fire = useEffectStore((s) => s.fire);
  const active = useEffectStore((s) => s.active);
  const prevNonceRef = useRef(actionNonce);
  const systemIntegrity = useGameStore((s) => s.systemIntegrity);

  /* Listener: forward every new non-NONE action to the effect bus */
  useEffect(() => {
    if (actionNonce === prevNonceRef.current) return;
    prevNonceRef.current = actionNonce;
    if (lastAction) {
      // Unlock audio context on the first effect (user has already interacted)
      unlockAudio();
      fire(lastAction);
    }
  }, [actionNonce, lastAction, fire]);

  if (!active) return null;

  switch (active) {
    case "GLITCH_FLASH":
      return <GlitchFlash />;
    case "FAKE_CRASH":
      return <FakeCrash />;
    case "JUMPSCARE":
      // Only below critical integrity; otherwise escalate down to a glitch flash
      return systemIntegrity < JUMPSCARE_MAX_INTEGRITY ? <Jumpscare /> : <GlitchFlash />;
    // INTEGRITY_SHAKE is consumed by Shell's IntegrityMeter, not here
    default:
      return null;
  }
}