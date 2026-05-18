import type { AgentRuntimeState } from "@octogent/core";

export type LockIndicatorTone = "mint" | "warning";

export type LockIndicatorDescriptor = {
  label: string;
  tone: LockIndicatorTone;
};

export const deriveLockIndicator = (
  state: AgentRuntimeState,
): LockIndicatorDescriptor | null => {
  switch (state) {
    case "processing":
      return { label: "CASTING", tone: "mint" };
    case "waiting_for_permission":
      return { label: "PERMISSION", tone: "warning" };
    case "waiting_for_user":
      return { label: "AWAITING", tone: "warning" };
    default:
      return null;
  }
};

type LockIndicatorProps = {
  state: AgentRuntimeState;
};

export const LockIndicator = ({ state }: LockIndicatorProps) => {
  const descriptor = deriveLockIndicator(state);
  if (descriptor === null) {
    return null;
  }
  return (
    <span
      className={`terminal-lock-indicator terminal-lock-indicator--${descriptor.tone}`}
      aria-label={`Agent state: ${descriptor.label.toLowerCase()}`}
    >
      <span aria-hidden="true">◢</span>
      <span>{descriptor.label}</span>
      <span aria-hidden="true">◣</span>
    </span>
  );
};
