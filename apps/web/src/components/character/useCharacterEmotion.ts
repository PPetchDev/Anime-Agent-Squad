import { useEffect, useMemo, useState } from "react";

import {
  type AgentRuntimeState,
  type AgentState,
  type CharacterEmotion,
  type IdleTier,
  type TerminalLifecycleState,
  resolveCharacterEmotion,
} from "@octogent/core";

export type CharacterEmotionInput = {
  characterId?: string | undefined;
  agentState?: AgentState | undefined;
  lifecycleState?: TerminalLifecycleState | undefined;
  lifecycleUpdatedAt?: string | undefined;
  startedAt?: string | undefined;
  createdAt?: string | undefined;
  agentRuntimeState?: AgentRuntimeState | undefined;
  exitCode?: number | undefined;
};

export type CharacterEmotionOptions = {
  now?: () => number;
  thresholds?: {
    lingeringMs: number;
    deepMs: number;
  };
};

export const DEFAULT_IDLE_THRESHOLDS = {
  lingeringMs: 30_000,
  deepMs: 90_000,
} as const;

const IDLE_REEVAL_INTERVAL_MS = 10_000;

const parseTimestamp = (value: string | undefined): number | null => {
  if (!value) return null;
  const parsed = Date.parse(value);
  return Number.isFinite(parsed) ? parsed : null;
};

const pickIdleReference = (
  lifecycleUpdatedAt: string | undefined,
  startedAt: string | undefined,
  createdAt: string | undefined,
): number | null =>
  parseTimestamp(lifecycleUpdatedAt) ?? parseTimestamp(startedAt) ?? parseTimestamp(createdAt);

const deriveIdleTier = (
  elapsedMs: number,
  thresholds: { lingeringMs: number; deepMs: number },
): IdleTier => {
  if (elapsedMs >= thresholds.deepMs) return "deep";
  if (elapsedMs >= thresholds.lingeringMs) return "lingering";
  return "fresh";
};

// useCharacterEmotion resolves the avatar emotion for a terminal snapshot.
// When the agent is idle, it polls every 10s so the tier (fresh → lingering →
// deep) can re-evaluate without external state changes. The polling timer is
// only mounted while idle so other states don't pay the cost.
export const useCharacterEmotion = (
  input: CharacterEmotionInput,
  options?: CharacterEmotionOptions,
): CharacterEmotion => {
  const now = options?.now ?? Date.now;
  const thresholds = options?.thresholds ?? DEFAULT_IDLE_THRESHOLDS;
  const {
    characterId,
    agentState,
    lifecycleState,
    lifecycleUpdatedAt,
    startedAt,
    createdAt,
    agentRuntimeState,
    exitCode,
  } = input;
  const isIdle = agentState === "idle";

  const [tick, setTick] = useState(0);
  useEffect(() => {
    if (!isIdle) return;
    const id = window.setInterval(() => {
      setTick((value) => value + 1);
    }, IDLE_REEVAL_INTERVAL_MS);
    return () => {
      window.clearInterval(id);
    };
  }, [isIdle]);

  return useMemo(() => {
    // `tick` is read here so the memo re-computes when the idle interval
    // fires — without referencing it, biome would (correctly) flag the
    // dependency below as unused.
    void tick;
    const idleReference = isIdle
      ? pickIdleReference(lifecycleUpdatedAt, startedAt, createdAt)
      : null;
    const idleTier: IdleTier | undefined =
      isIdle && idleReference !== null
        ? deriveIdleTier(now() - idleReference, thresholds)
        : isIdle
          ? "fresh"
          : undefined;

    return resolveCharacterEmotion(characterId, {
      agentState,
      lifecycleState,
      agentRuntimeState,
      exitCode,
      idleTier,
    });
  }, [
    characterId,
    agentState,
    lifecycleState,
    agentRuntimeState,
    exitCode,
    lifecycleUpdatedAt,
    startedAt,
    createdAt,
    isIdle,
    now,
    thresholds,
    tick,
  ]);
};
