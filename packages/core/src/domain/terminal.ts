import type { AgentRuntimeState } from "./agentRuntime";

export type AgentState = "live" | "idle" | "queued" | "blocked" | "stopped" | "exited" | "stale";
export type TerminalLifecycleState = "registered" | "running" | "stopped" | "exited" | "stale";
export type TentacleWorkspaceMode = "shared" | "worktree";

/**
 * A point-in-time view of one terminal as emitted by the API and consumed by the web UI.
 *
 * Invariants:
 *  - `tentacleName`, `workspaceMode`, and `lifecycleState` are always present; the API sets them
 *    on every terminal at creation time and keeps them up to date.
 *  - `lifecycleReason` and `lifecycleUpdatedAt` are set together whenever the lifecycle state
 *    transitions away from "registered" (i.e. when a session starts, stops, exits, or goes stale).
 *  - `processId` and `startedAt` are set when the terminal enters the "running" state and cleared
 *    when it leaves it.
 *  - `endedAt`, `exitCode`, and `exitSignal` are set when the terminal transitions to "stopped" or
 *    "exited" and remain set until the terminal is deleted.
 *  - `characterId` and `customAvatarPath` are present only when an operator has assigned a
 *    character identity to the terminal.
 */
export type TerminalSnapshot = {
  terminalId: string;
  label: string;
  state: AgentState;
  tentacleId: string;
  tentacleName: string;
  workspaceMode: TentacleWorkspaceMode;
  createdAt: string;
  lifecycleState: TerminalLifecycleState;
  hasUserPrompt?: boolean;
  parentTerminalId?: string;
  characterId?: string;
  customAvatarPath?: string;
  agentRuntimeState?: AgentRuntimeState;
  lifecycleReason?: string;
  lifecycleUpdatedAt?: string;
  processId?: number;
  startedAt?: string;
  endedAt?: string;
  exitCode?: number;
  exitSignal?: number | string;
};
