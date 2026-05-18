import type { WorkspaceSetupStepId } from "@octogent/core";
import { useCallback, useState } from "react";

import { useWorkspaceSetup } from "./useWorkspaceSetup";

type UseWorkspaceSetupRunnerResult = ReturnType<typeof useWorkspaceSetup> & {
  runningWorkspaceSetupStepId: WorkspaceSetupStepId | null;
  runWorkspaceSetupStepTracked: (stepId: WorkspaceSetupStepId) => Promise<void>;
};

/**
 * Layers single-step "running" tracking on top of `useWorkspaceSetup` so the
 * UI can highlight the in-flight step. The underlying fetch returns the full
 * snapshot — we only own the "which step are we waiting on right now" flag.
 */
export const useWorkspaceSetupRunner = (): UseWorkspaceSetupRunnerResult => {
  const workspaceSetup = useWorkspaceSetup();
  const [runningWorkspaceSetupStepId, setRunningWorkspaceSetupStepId] =
    useState<WorkspaceSetupStepId | null>(null);

  const runWorkspaceSetupStepTracked = useCallback(
    async (stepId: WorkspaceSetupStepId) => {
      setRunningWorkspaceSetupStepId(stepId);
      try {
        await workspaceSetup.runWorkspaceSetupStep(stepId);
      } finally {
        setRunningWorkspaceSetupStepId(null);
      }
    },
    [workspaceSetup],
  );

  return {
    ...workspaceSetup,
    runningWorkspaceSetupStepId,
    runWorkspaceSetupStepTracked,
  };
};
