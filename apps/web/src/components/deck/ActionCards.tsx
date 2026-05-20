import { Check } from "lucide-react";

import type { TerminalAgentProvider } from "../../app/types";
import { CharacterAvatar } from "../character";

export const AGENT_PROVIDER_OPTIONS: { value: TerminalAgentProvider; label: string }[] = [
  { value: "claude-code", label: "Claude Code" },
  { value: "codex", label: "Codex" },
];

export type ActionCardsProps = {
  compact?: boolean;
  selectedAgent: TerminalAgentProvider;
  setSelectedAgent: (agent: TerminalAgentProvider) => void;
  agentMenuOpen: boolean;
  setAgentMenuOpen: (open: boolean | ((prev: boolean) => boolean)) => void;
  agentMenuRef: React.RefObject<HTMLDivElement | null>;
  onAddManually: () => void;
  onLaunchAgent: () => void;
  isLaunchingAgent?: boolean;
};

export const ActionCards = ({
  compact,
  selectedAgent,
  setSelectedAgent,
  agentMenuOpen,
  setAgentMenuOpen,
  agentMenuRef,
  onAddManually,
  onLaunchAgent,
  isLaunchingAgent,
}: ActionCardsProps) => (
  <div className={`deck-empty-actions${compact ? " deck-empty-actions--compact" : ""}`}>
    <button
      type="button"
      className="deck-empty-card mm-hud-frame mm-sparkle-host"
      onClick={onAddManually}
    >
      <div className="deck-empty-card-icon">
        <CharacterAvatar characterId="mika" size={compact ? "md" : "lg"} />
      </div>
      <div className="deck-empty-card-text">
        <span className="deck-empty-card-title">Awaken First Tentacle</span>
        <span className="deck-empty-card-desc">
          Create your first specialist and start the squad formation.
        </span>
      </div>
    </button>
    <div className="deck-empty-card mm-hud-frame mm-sparkle-host mm-scanline">
      <span aria-hidden="true" className="mm-hud-frame__label">
        コマンド
      </span>
      <span aria-hidden="true" className="mm-hud-frame__corner-bl" />
      <span aria-hidden="true" className="mm-hud-frame__corner-br" />
      <span className="deck-empty-card-icon deck-empty-card-icon--terminal">&gt;_</span>
      <div className="deck-empty-card-text">
        <span className="deck-empty-card-title">Open Command Gate</span>
        <span className="deck-empty-card-desc">
          Launch an agent to scout your repo and suggest ready-to-run tentacles.
        </span>
        <div className="deck-empty-agent-select-row">
          <div className="deck-empty-agent-picker" ref={agentMenuRef}>
            <button
              type="button"
              className="deck-empty-agent-trigger"
              aria-expanded={agentMenuOpen}
              aria-haspopup="menu"
              onClick={() => setAgentMenuOpen((p: boolean) => !p)}
            >
              {AGENT_PROVIDER_OPTIONS.find((o) => o.value === selectedAgent)?.label}
              <svg className="deck-empty-agent-chevron" viewBox="0 0 10 6" aria-hidden="true">
                <path d="M1 1l4 4 4-4" fill="none" stroke="currentColor" strokeWidth="1.5" />
              </svg>
            </button>
            {agentMenuOpen && (
              <div className="deck-empty-agent-menu" role="menu">
                {AGENT_PROVIDER_OPTIONS.map((opt) => (
                  <button
                    key={opt.value}
                    type="button"
                    className="deck-empty-agent-menu-item"
                    role="menuitem"
                    data-active={opt.value === selectedAgent ? "true" : "false"}
                    onClick={() => {
                      setSelectedAgent(opt.value);
                      setAgentMenuOpen(false);
                    }}
                  >
                    {opt.label}
                    {opt.value === selectedAgent && (
                      <span className="deck-empty-agent-menu-check">
                        <Check size={12} />
                      </span>
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>
          <button
            type="button"
            className="deck-empty-agent-launch"
            disabled={isLaunchingAgent}
            onClick={onLaunchAgent}
          >
            {isLaunchingAgent ? "..." : "Launch"}
          </button>
        </div>
      </div>
    </div>
    <button
      type="button"
      className="deck-empty-card mm-hud-frame mm-hud-frame--warning mm-sparkle-host mm-sparkle-host--subtle"
      onClick={onAddManually}
    >
      <span aria-hidden="true" className="mm-hud-frame__label">
        クラフト
      </span>
      <span aria-hidden="true" className="mm-hud-frame__corner-bl" />
      <span aria-hidden="true" className="mm-hud-frame__corner-br" />
      <span className="deck-empty-card-icon deck-empty-card-icon--terminal">+</span>
      <div className="deck-empty-card-text">
        <span className="deck-empty-card-title">Forge Tentacle Manually</span>
        <span className="deck-empty-card-desc">
          Craft a custom specialist with your own role, style, and skills.
        </span>
      </div>
    </button>
  </div>
);
