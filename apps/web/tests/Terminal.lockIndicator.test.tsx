import { render } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import type { AgentRuntimeState } from "@octogent/core";

/**
 * We test a small pure helper that derives the lock indicator label + tone
 * from an AgentRuntimeState. This keeps the test decoupled from xterm /
 * WebSocket setup in Terminal.tsx.
 */
import { LockIndicator, deriveLockIndicator } from "../src/components/TerminalLockIndicator";

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
  it("renders the indicator span when state is non-idle", () => {
    const { container } = render(<LockIndicator state="processing" />);
    const node = container.querySelector(".terminal-lock-indicator");
    expect(node).not.toBeNull();
    expect(node?.textContent).toContain("CASTING");
    expect(node?.classList.contains("terminal-lock-indicator--mint")).toBe(true);
  });

  it("renders nothing when state is idle", () => {
    const { container } = render(<LockIndicator state="idle" />);
    expect(container.querySelector(".terminal-lock-indicator")).toBeNull();
  });

  /**
   * Regression: when an agent transitions from a non-idle state back to idle,
   * the indicator span must be fully unmounted from the DOM — not merely
   * hidden via CSS. Leaving the span behind would keep its aria-label in the
   * accessibility tree, where a screen reader could still announce a stale
   * "Agent state: casting" after the work has completed.
   */
  it("unmounts the indicator when transitioning from processing to idle", () => {
    const { container, rerender } = render(<LockIndicator state="processing" />);

    const initial = container.querySelector(".terminal-lock-indicator");
    expect(initial).not.toBeNull();
    expect(initial?.getAttribute("aria-label")).toBe("Agent state: casting");

    rerender(<LockIndicator state="idle" />);

    expect(container.querySelector(".terminal-lock-indicator")).toBeNull();
    // No residual aria-label should linger in the container — a CSS-hidden
    // span would still satisfy a node check but leave this attribute behind.
    expect(container.querySelector("[aria-label^='Agent state']")).toBeNull();
    // The container must be empty: any leftover element would be a regression
    // (e.g. an empty wrapper kept around for animation purposes).
    expect(container.firstChild).toBeNull();
  });

  it.each<AgentRuntimeState>(["waiting_for_permission", "waiting_for_user"])(
    "unmounts the indicator when transitioning from %s to idle",
    (initialState) => {
      const { container, rerender } = render(<LockIndicator state={initialState} />);
      expect(container.querySelector(".terminal-lock-indicator")).not.toBeNull();

      rerender(<LockIndicator state="idle" />);

      expect(container.querySelector(".terminal-lock-indicator")).toBeNull();
      expect(container.querySelector("[aria-label^='Agent state']")).toBeNull();
    },
  );
});
