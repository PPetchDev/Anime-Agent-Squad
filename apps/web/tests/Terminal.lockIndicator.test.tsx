import { render } from "@testing-library/react";
import { describe, expect, it } from "vitest";

/**
 * We test a small pure helper that derives the lock indicator label + tone
 * from an AgentRuntimeState. This keeps the test decoupled from xterm /
 * WebSocket setup in Terminal.tsx.
 */
import { deriveLockIndicator } from "../src/components/terminalLockIndicator";

describe("deriveLockIndicator", () => {
  it("returns null for idle", () => {
    expect(deriveLockIndicator("idle")).toBeNull();
  });

  it("returns CASTING for processing", () => {
    expect(deriveLockIndicator("processing")).toEqual({
      label: "CASTING",
      tone: "mint",
    });
  });

  it("returns PERMISSION for waiting_for_permission", () => {
    expect(deriveLockIndicator("waiting_for_permission")).toEqual({
      label: "PERMISSION",
      tone: "warning",
    });
  });

  it("returns AWAITING for waiting_for_user", () => {
    expect(deriveLockIndicator("waiting_for_user")).toEqual({
      label: "AWAITING",
      tone: "warning",
    });
  });
});

describe("Terminal lock indicator rendering", () => {
  it("renders the indicator span when state is non-idle", async () => {
    const { LockIndicator } = await import("../src/components/terminalLockIndicator");
    const { container } = render(<LockIndicator state="processing" />);
    const node = container.querySelector(".terminal-lock-indicator");
    expect(node).not.toBeNull();
    expect(node?.textContent).toContain("CASTING");
    expect(node?.classList.contains("terminal-lock-indicator--mint")).toBe(true);
  });

  it("renders nothing when state is idle", async () => {
    const { LockIndicator } = await import("../src/components/terminalLockIndicator");
    const { container } = render(<LockIndicator state="idle" />);
    expect(container.querySelector(".terminal-lock-indicator")).toBeNull();
  });
});
