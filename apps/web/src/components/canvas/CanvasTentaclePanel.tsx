import { Terminal, X } from "lucide-react";
import { type Ref, useCallback, useMemo, useState } from "react";

import {
  BUILT_IN_CHARACTER_TEMPLATES,
  type DeckTentacleSummary,
  type TentacleWorkspaceMode,
  resolveCharacterIdForTask,
} from "@octogent/core";
import type { GraphNode } from "../../app/canvas/types";
import { mapTentacleStatusToEmotionContext } from "../../app/character/tentacleEmotion";
import type { CreateTerminalCharacterOptions } from "../../app/hooks/useTerminalMutations";
import type { ConversationSessionSummary } from "../../app/types";
import {
  buildDeckTodoAddUrl,
  buildDeckTodoDeleteUrl,
  buildDeckTodoEditUrl,
  buildDeckTodoSolveUrl,
  buildDeckTodoToggleUrl,
} from "../../runtime/runtimeEndpoints";
import { CharacterAvatar, CharacterPicker, useCharacterEmotion } from "../character";

function hashStr(str: string): number {
  let h = 0;
  for (let i = 0; i < str.length; i++) {
    h = ((h << 5) - h + str.charCodeAt(i)) | 0;
  }
  return Math.abs(h);
}

type CanvasTentaclePanelProps = {
  node: GraphNode;
  isFocused?: boolean;
  onClose: () => void;
  onFocus?: () => void;
  panelRef?: Ref<HTMLDivElement> | undefined;
  tentacle: DeckTentacleSummary | null;
  sessions: ConversationSessionSummary[];
  isClaudeDangerouslySkipPermissionsEnabled?: boolean;
  onCreateAgent?:
    | ((tentacleId: string, character?: CreateTerminalCharacterOptions) => void)
    | undefined;
  onSolveTodoItem?: ((tentacleId: string, itemIndex: number) => void) | undefined;
  onSpawnSwarm?: ((tentacleId: string, workspaceMode: TentacleWorkspaceMode) => void) | undefined;
  onNavigateToConversation?: ((sessionId: string) => void) | undefined;
  onRefreshTentacleData?: (() => Promise<void>) | undefined;
};

const STATUS_LABELS: Record<string, string> = {
  idle: "idle",
  active: "active",
  blocked: "blocked",
  "needs-review": "review",
};

const formatTime = (isoString: string | null): string => {
  if (!isoString) return "—";
  const d = new Date(isoString);
  const now = new Date();
  const diffMs = now.getTime() - d.getTime();
  const diffMin = Math.floor(diffMs / 60000);
  if (diffMin < 1) return "just now";
  if (diffMin < 60) return `${diffMin}m ago`;
  const diffHr = Math.floor(diffMin / 60);
  if (diffHr < 24) return `${diffHr}h ago`;
  const diffDay = Math.floor(diffHr / 24);
  return `${diffDay}d ago`;
};

export const CanvasTentaclePanel = ({
  node,
  isFocused,
  onClose,
  onFocus,
  panelRef,
  tentacle,
  sessions,
  isClaudeDangerouslySkipPermissionsEnabled = false,
  onCreateAgent,
  onSolveTodoItem,
  onSpawnSwarm,
  onNavigateToConversation,
  onRefreshTentacleData,
}: CanvasTentaclePanelProps) => {
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [editText, setEditText] = useState("");
  const [addingTodo, setAddingTodo] = useState(false);
  const [addText, setAddText] = useState("");
  const [solvingTodoIndex, setSolvingTodoIndex] = useState<number | null>(null);
  const defaultCharacterId = useMemo(() => {
    const index = hashStr(node.tentacleId) % BUILT_IN_CHARACTER_TEMPLATES.length;
    return BUILT_IN_CHARACTER_TEMPLATES[index]?.characterId ?? "mika";
  }, [node.tentacleId]);
  const [selectedCharacterId, setSelectedCharacterId] = useState(defaultCharacterId);
  const panelCharacterId = useMemo(() => {
    if (node.characterId) {
      return node.characterId;
    }
    return resolveCharacterIdForTask(
      `${node.label} ${node.tentacleId} ${tentacle?.description ?? ""}`,
    );
  }, [node.characterId, node.label, node.tentacleId, tentacle?.description]);
  const panelEmotion = useCharacterEmotion({
    characterId: panelCharacterId,
    ...mapTentacleStatusToEmotionContext(tentacle?.status ?? "idle"),
  });
  const refreshTentacleData = useCallback(async () => {
    await onRefreshTentacleData?.();
  }, [onRefreshTentacleData]);

  const handleTodoToggle = useCallback(
    async (itemIndex: number, done: boolean) => {
      try {
        const response = await fetch(buildDeckTodoToggleUrl(node.tentacleId), {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ itemIndex, done }),
        });
        if (!response.ok) return;
        await refreshTentacleData();
      } catch {
        // silent
      }
    },
    [node.tentacleId, refreshTentacleData],
  );

  const handleTodoEdit = useCallback(
    async (itemIndex: number, text: string) => {
      if (text.trim().length === 0) return;
      try {
        const response = await fetch(buildDeckTodoEditUrl(node.tentacleId), {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ itemIndex, text: text.trim() }),
        });
        if (!response.ok) return;
        setEditingIndex(null);
        await refreshTentacleData();
      } catch {
        // silent
      }
    },
    [node.tentacleId, refreshTentacleData],
  );

  const handleTodoAdd = useCallback(
    async (text: string) => {
      if (text.trim().length === 0) return;
      try {
        const response = await fetch(buildDeckTodoAddUrl(node.tentacleId), {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ text: text.trim() }),
        });
        if (!response.ok) return;
        setAddingTodo(false);
        setAddText("");
        await refreshTentacleData();
      } catch {
        // silent
      }
    },
    [node.tentacleId, refreshTentacleData],
  );

  const handleTodoDelete = useCallback(
    async (itemIndex: number) => {
      try {
        const response = await fetch(buildDeckTodoDeleteUrl(node.tentacleId), {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ itemIndex }),
        });
        if (!response.ok) return;
        await refreshTentacleData();
      } catch {
        // silent
      }
    },
    [node.tentacleId, refreshTentacleData],
  );

  const handleTodoSolve = useCallback(
    async (itemIndex: number) => {
      try {
        setSolvingTodoIndex(itemIndex);
        const response = await fetch(buildDeckTodoSolveUrl(node.tentacleId), {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            itemIndex,
            ...(isClaudeDangerouslySkipPermissionsEnabled
              ? { claudeDangerouslySkipPermissions: true }
              : {}),
          }),
        });
        if (!response.ok) return;
        onSolveTodoItem?.(node.tentacleId, itemIndex);
      } catch {
        // silent
      } finally {
        setSolvingTodoIndex((current) => (current === itemIndex ? null : current));
      }
    },
    [node.tentacleId, isClaudeDangerouslySkipPermissionsEnabled, onSolveTodoItem],
  );

  const progressPct =
    tentacle && tentacle.todoTotal > 0
      ? Math.round((tentacle.todoDone / tentacle.todoTotal) * 100)
      : 0;

  return (
    <div
      ref={panelRef}
      className={`detail-panel${isFocused ? " detail-panel--focused" : ""}`}
      tabIndex={-1}
      onPointerDown={() => onFocus?.()}
    >
      {/* Header */}
      <div
        className="detail-panel-header"
        style={{
          background: `linear-gradient(180deg, color-mix(in srgb, ${node.color ?? "var(--accent-primary)"} 90%, #ffd89d 10%) 0%, color-mix(in srgb, ${node.color ?? "var(--accent-primary)"} 78%, #d9851c 22%) 100%)`,
        }}
      >
        <span className="detail-title">{tentacle?.displayName ?? node.label}</span>
        {tentacle && (
          <span className="detail-type-badge">
            {STATUS_LABELS[tentacle.status] ?? tentacle.status}
          </span>
        )}
        <button className="detail-close" type="button" onClick={onClose} aria-label="Close panel">
          <X size={14} />
        </button>
      </div>

      {/* Content */}
      <div className="detail-content">
        {/* Identity: glyph + info side by side */}
        <div className="detail-identity">
          {panelCharacterId && (
            <div className="detail-glyph detail-glyph--character">
              <CharacterAvatar characterId={panelCharacterId} size="lg" emotion={panelEmotion} />
            </div>
          )}
          <div className="detail-identity-info">
            <div className="detail-name">{tentacle?.displayName ?? node.label}</div>
            <div className="detail-row">
              <span className="detail-label">ID</span>
              <span className="detail-value detail-value--mono">{node.tentacleId}</span>
            </div>
            {tentacle?.description && (
              <div className="detail-row">
                <span className="detail-label">Description</span>
                <span className="detail-value">{tentacle.description}</span>
              </div>
            )}
          </div>
        </div>

        {/* Actions section */}
        <div className="detail-section">
          <div className="detail-section-title">Actions</div>
          <CharacterPicker
            selectedCharacterId={selectedCharacterId}
            onChange={setSelectedCharacterId}
          />
          <div className="detail-actions">
            <button
              type="button"
              className="detail-action-btn"
              onClick={() => onCreateAgent?.(node.tentacleId, { characterId: selectedCharacterId })}
            >
              &gt;_ Create Agent
            </button>
            <button
              type="button"
              className="detail-action-btn"
              onClick={() => onSpawnSwarm?.(node.tentacleId, "worktree")}
            >
              ✦ Summon Squad (Worktrees)
            </button>
            <button
              type="button"
              className="detail-action-btn"
              onClick={() => onSpawnSwarm?.(node.tentacleId, "shared")}
            >
              ✧ Summon Squad (Shared)
            </button>
          </div>
        </div>

        {/* Progress section */}
        {tentacle && (
          <div className="detail-section">
            <div className="detail-section-title">Progress</div>
            {tentacle.todoTotal > 0 && (
              <div className="detail-progress">
                <div className="detail-progress-bar">
                  <div
                    className="detail-progress-fill"
                    style={{ width: `${progressPct}%`, backgroundColor: node.color }}
                  />
                </div>
                <span className="detail-progress-label">
                  {tentacle.todoDone}/{tentacle.todoTotal}
                </span>
              </div>
            )}
            {tentacle.todoItems.length > 0 && (
              <ul className="detail-todos">
                {tentacle.todoItems.map((item, i) => (
                  <li
                    key={`${i}-${item.text}`}
                    className={`detail-todo${item.done ? " detail-todo--done" : ""}`}
                  >
                    <div className="detail-todo-controls">
                      <button
                        type="button"
                        className="detail-todo-delete"
                        title="Delete item"
                        onClick={() => void handleTodoDelete(i)}
                      >
                        <X size={12} />
                      </button>
                      <button
                        type="button"
                        className="detail-todo-solve"
                        aria-label={`Spawn agent for todo item: ${item.text}`}
                        title="Spawn agent for this item"
                        disabled={item.done || solvingTodoIndex === i}
                        onClick={() => void handleTodoSolve(i)}
                      >
                        {solvingTodoIndex === i ? "…" : <Terminal size={15} strokeWidth={2.4} />}
                      </button>
                      <input
                        type="checkbox"
                        checked={item.done}
                        onChange={() => handleTodoToggle(i, !item.done)}
                      />
                    </div>
                    {editingIndex === i ? (
                      <input
                        className="detail-todo-edit-input"
                        type="text"
                        value={editText}
                        onChange={(e) => setEditText(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") void handleTodoEdit(i, editText);
                          if (e.key === "Escape") setEditingIndex(null);
                        }}
                        onBlur={() => void handleTodoEdit(i, editText)}
                      />
                    ) : (
                      <span
                        className="detail-todo-text"
                        onDoubleClick={() => {
                          setEditingIndex(i);
                          setEditText(item.text);
                        }}
                      >
                        {item.text}
                      </span>
                    )}
                  </li>
                ))}
              </ul>
            )}
            {addingTodo ? (
              <div className="detail-todo-add-row">
                <input
                  className="detail-todo-edit-input"
                  type="text"
                  placeholder="New todo item…"
                  value={addText}
                  onChange={(e) => setAddText(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") void handleTodoAdd(addText);
                    if (e.key === "Escape") {
                      setAddingTodo(false);
                      setAddText("");
                    }
                  }}
                  onBlur={() => {
                    if (addText.trim().length > 0) {
                      void handleTodoAdd(addText);
                    } else {
                      setAddingTodo(false);
                      setAddText("");
                    }
                  }}
                />
              </div>
            ) : (
              <button
                type="button"
                className="detail-todo-add-btn"
                onClick={() => setAddingTodo(true)}
              >
                + Add item
              </button>
            )}
          </div>
        )}

        {/* Vault files */}
        {tentacle && tentacle.vaultFiles.length > 0 && (
          <div className="detail-section">
            <div className="detail-section-title">Vault Files</div>
            <div className="detail-labels-list">
              {tentacle.vaultFiles.map((file) => (
                <span key={file} className="detail-label-tag">
                  {file}
                </span>
              ))}
            </div>
          </div>
        )}

        {tentacle && tentacle.suggestedSkills.length > 0 && (
          <div className="detail-section">
            <div className="detail-section-title">Suggested Skills</div>
            <div className="detail-labels-list">
              {tentacle.suggestedSkills.map((skill) => (
                <span key={skill} className="detail-label-tag">
                  {skill}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Sessions section */}
        <div className="detail-section">
          <div className="detail-section-title">Sessions ({sessions.length})</div>
          {sessions.length === 0 ? (
            <div className="detail-empty">No sessions yet</div>
          ) : (
            <div className="detail-sessions">
              {sessions.map((s) => (
                <button
                  key={s.sessionId}
                  type="button"
                  className="detail-session-item"
                  onClick={() => onNavigateToConversation?.(s.sessionId)}
                >
                  <span className="detail-session-preview">
                    {s.firstUserTurnPreview
                      ? s.firstUserTurnPreview.slice(0, 60)
                      : s.sessionId.slice(0, 16)}
                  </span>
                  <span className="detail-session-meta">
                    {s.turnCount} turns · {formatTime(s.lastEventAt)}
                  </span>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
