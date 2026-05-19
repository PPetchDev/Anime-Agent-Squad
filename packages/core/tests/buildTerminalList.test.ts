import { describe, expect, it } from "vitest";

import { InMemoryTerminalSnapshotReader } from "../src/adapters/InMemoryTerminalSnapshotReader";
import { buildTerminalList } from "../src/application/buildTerminalList";

describe("buildTerminalList", () => {
  it("returns terminals sorted by creation time", async () => {
    const reader = new InMemoryTerminalSnapshotReader([
      {
        terminalId: "terminal-b",
        label: "terminal-b",
        state: "blocked",
        tentacleId: "backend",
        tentacleName: "backend-agent",
        workspaceMode: "shared",
        lifecycleState: "running",
        createdAt: "2026-02-24T10:05:00.000Z",
      },
      {
        terminalId: "terminal-a",
        label: "terminal-a",
        state: "live",
        tentacleId: "backend",
        tentacleName: "planner",
        workspaceMode: "worktree",
        lifecycleState: "running",
        createdAt: "2026-02-24T10:00:00.000Z",
      },
      {
        terminalId: "terminal-c",
        label: "terminal-c",
        state: "live",
        tentacleId: "frontend",
        tentacleName: "frontend-agent",
        workspaceMode: "shared",
        lifecycleState: "running",
        createdAt: "2026-02-24T10:10:00.000Z",
      },
    ]);

    const result = await buildTerminalList(reader);

    expect(result).toHaveLength(3);
    expect(result.map((t) => t.terminalId)).toEqual(["terminal-a", "terminal-b", "terminal-c"]);
  });

  it("preserves terminal fields including tentacle metadata", async () => {
    const reader = new InMemoryTerminalSnapshotReader([
      {
        terminalId: "terminal-1",
        label: "my-terminal",
        state: "live",
        tentacleId: "backend",
        tentacleName: "Backend Dev",
        workspaceMode: "worktree",
        lifecycleState: "running",
        createdAt: "2026-02-24T10:00:00.000Z",
      },
    ]);

    const result = await buildTerminalList(reader);

    expect(result[0]?.tentacleId).toBe("backend");
    expect(result[0]?.tentacleName).toBe("Backend Dev");
    expect(result[0]?.workspaceMode).toBe("worktree");
  });

  it("preserves terminal character identity fields", async () => {
    const reader = new InMemoryTerminalSnapshotReader([
      {
        terminalId: "terminal-1",
        label: "my-terminal",
        state: "live",
        tentacleId: "backend",
        tentacleName: "backend-agent",
        workspaceMode: "shared",
        lifecycleState: "running",
        createdAt: "2026-02-24T10:00:00.000Z",
        characterId: "ren",
        customAvatarPath: "/custom/ren.png",
      },
    ]);

    const result = await buildTerminalList(reader);

    expect(result[0]?.characterId).toBe("ren");
    expect(result[0]?.customAvatarPath).toBe("/custom/ren.png");
  });

  it("passes through workspaceMode when provided", async () => {
    const reader = new InMemoryTerminalSnapshotReader([
      {
        terminalId: "terminal-1",
        label: "terminal-1",
        state: "idle",
        tentacleId: "general",
        tentacleName: "general-agent",
        workspaceMode: "shared",
        lifecycleState: "registered",
        createdAt: "2026-02-24T10:00:00.000Z",
      },
    ]);

    const result = await buildTerminalList(reader);

    expect(result[0]?.workspaceMode).toBe("shared");
  });
});
