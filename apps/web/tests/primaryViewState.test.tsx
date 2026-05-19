import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { PrimaryViewState } from "../src/components/ui/PrimaryViewState";

describe("PrimaryViewState", () => {
  it("renders an empty state with HUD frame, sparkle host, kana label, and octopus glyph", () => {
    render(
      <PrimaryViewState
        tone="empty"
        kanaLabel="エンプティ"
        title="Nothing here yet"
        description="Hook one up to get started."
        testId="empty-state"
      />,
    );

    const host = screen.getByTestId("empty-state");
    expect(host).toHaveClass("primary-view-state", "primary-view-state--empty");
    expect(host).toHaveClass("mm-hud-frame", "mm-sparkle-host");

    expect(screen.getByText("エンプティ")).toHaveClass("mm-hud-frame__label");
    expect(screen.getByText("Nothing here yet")).toBeInTheDocument();
    expect(screen.getByText("Hook one up to get started.")).toBeInTheDocument();
    expect(screen.getByTestId("empty-state-glyph")).toBeInTheDocument();
  });

  it("renders an error state using the warning HUD frame variant", () => {
    render(
      <PrimaryViewState
        tone="error"
        kanaLabel="エラー"
        title="Sync failed"
        description="Try again."
        testId="error-state"
      />,
    );

    const host = screen.getByTestId("error-state");
    expect(host).toHaveClass("primary-view-state--error");
    expect(host).toHaveClass("mm-hud-frame--warning");
    expect(host).toHaveAttribute("role", "alert");
  });

  it("renders a loading state with status role", () => {
    render(
      <PrimaryViewState
        tone="loading"
        kanaLabel="ロード中"
        title="Loading..."
        testId="loading-state"
      />,
    );

    const host = screen.getByTestId("loading-state");
    expect(host).toHaveClass("primary-view-state--loading");
    expect(host).toHaveAttribute("role", "status");
  });
});
