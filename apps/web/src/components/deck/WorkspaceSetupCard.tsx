import type { WorkspaceSetupSnapshot, WorkspaceSetupStepId } from "@octogent/core";
import { CharacterAvatar } from "../character";

type WorkspaceSetupCardProps = {
  compact?: boolean;
  workspaceSetup: WorkspaceSetupSnapshot | null;
  isLoading: boolean;
  error: string | null;
  onRunStep: (stepId: WorkspaceSetupStepId) => void;
  onLaunchClaudeCode: () => void;
  isLaunchingAgent?: boolean;
  isRunningStepId?: WorkspaceSetupStepId | null;
};

const buildStepSummary = (stepId: WorkspaceSetupStepId, description: string) => {
  if (stepId === "create-tentacles") {
    return "Launch Claude Code so it can plan and create the first tentacles.";
  }

  return description;
};

export const WorkspaceSetupCard = ({
  compact,
  workspaceSetup,
  isLoading,
  error,
  onRunStep,
  onLaunchClaudeCode,
  isLaunchingAgent,
  isRunningStepId,
}: WorkspaceSetupCardProps) => (
  <section
    className={`workspace-setup-card mm-hud-frame mm-scanline${compact ? " workspace-setup-card--compact" : ""}`}
    aria-label="Workspace setup"
  >
    <span aria-hidden="true" className="mm-hud-frame__label">
      ブリッジ
    </span>
    <span aria-hidden="true" className="mm-hud-frame__corner-bl" />
    <span aria-hidden="true" className="mm-hud-frame__corner-br" />
    <header className="workspace-setup-card-header">
      <div className="workspace-setup-card-glyph">
        <CharacterAvatar characterId="mika" size={compact ? "md" : "lg"} />
      </div>
      <div className="workspace-setup-card-copy">
        <h2 className="workspace-setup-card-title">Bridge Calibration</h2>
        <p className="workspace-setup-card-desc">
          Run each ritual step explicitly. Octogent confirms completion only after the workspace
          scan reports green.
        </p>
      </div>
    </header>

    {error ? <p className="workspace-setup-card-error">{error}</p> : null}

    <div className="workspace-setup-step-list">
      {(workspaceSetup?.steps ?? []).map((step) => {
        const isCreateTentaclesStep = step.id === "create-tentacles";
        const buttonLabel = isCreateTentaclesStep ? "Launch Claude Code" : step.actionLabel;
        const isButtonDisabled = isCreateTentaclesStep ? isLaunchingAgent : isLoading;
        const isButtonRunning = isCreateTentaclesStep
          ? isLaunchingAgent
          : isRunningStepId === step.id;

        return (
          <article key={step.id} className="workspace-setup-step" data-complete={step.complete}>
            <div className="workspace-setup-step-main">
              <div className="workspace-setup-step-title-row">
                <span className="workspace-setup-step-title">{step.title}</span>
                <span className="workspace-setup-step-state">
                  {step.complete ? "Done" : step.required ? "Required" : "Optional"}
                </span>
              </div>
              <p className="workspace-setup-step-desc">
                {buildStepSummary(step.id, step.description)}
              </p>
            </div>
            {buttonLabel ? (
              <button
                type="button"
                className="workspace-setup-step-action"
                disabled={Boolean(isButtonDisabled)}
                onClick={() => {
                  if (isCreateTentaclesStep) {
                    onLaunchClaudeCode();
                    return;
                  }

                  onRunStep(step.id);
                }}
              >
                {isButtonRunning ? "..." : buttonLabel}
              </button>
            ) : null}
          </article>
        );
      })}
      {isLoading && workspaceSetup === null ? (
        <p className="workspace-setup-card-loading">Loading workspace setup…</p>
      ) : null}
    </div>
  </section>
);
