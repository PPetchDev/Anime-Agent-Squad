import type {
  AgentRuntimeState,
  AgentState,
  DeckTentacleStatus,
  DeckTentacleSummary,
} from "@octogent/core";

import type { GraphNode } from "../canvas/types";

export type TentacleEmotionContext = {
  agentState: AgentState;
  agentRuntimeState: AgentRuntimeState;
};

export const mapTentacleStatusToEmotionContext = (
  status: DeckTentacleStatus,
): TentacleEmotionContext => {
  if (status === "active") {
    return { agentState: "live", agentRuntimeState: "processing" };
  }
  if (status === "blocked") {
    return { agentState: "blocked", agentRuntimeState: "idle" };
  }
  if (status === "needs-review") {
    return { agentState: "stale", agentRuntimeState: "idle" };
  }
  return { agentState: "idle", agentRuntimeState: "idle" };
};

export const deriveDominantTentacleStatus = (
  tentacles: DeckTentacleSummary[],
): DeckTentacleStatus => {
  if (tentacles.some((tentacle) => tentacle.status === "blocked")) {
    return "blocked";
  }
  if (tentacles.some((tentacle) => tentacle.status === "active")) {
    return "active";
  }
  if (tentacles.some((tentacle) => tentacle.status === "needs-review")) {
    return "needs-review";
  }
  return "idle";
};

const SESSION_AGENT_PRIORITY: AgentState[] = ["blocked", "live", "queued", "stale", "idle"];
const SESSION_RUNTIME_PRIORITY: AgentRuntimeState[] = [
  "processing",
  "waiting_for_permission",
  "waiting_for_user",
  "idle",
];

export const deriveTentacleEmotionContextFromConnectedNodes = (
  connectedNodes: GraphNode[],
): TentacleEmotionContext => {
  const sessions = connectedNodes.filter((node) => node.type === "active-session");

  const agentState =
    SESSION_AGENT_PRIORITY.find((state) =>
      sessions.some((session) => session.agentState === state),
    ) ?? "idle";

  const agentRuntimeState =
    SESSION_RUNTIME_PRIORITY.find((state) =>
      sessions.some((session) => session.agentRuntimeState === state),
    ) ?? "idle";

  return {
    agentState,
    agentRuntimeState,
  };
};
