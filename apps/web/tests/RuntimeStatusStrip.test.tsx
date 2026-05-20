import { render, screen, within } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { RuntimeStatusStrip } from "../src/components/RuntimeStatusStrip";

describe("RuntimeStatusStrip", () => {
  it("shows loading placeholders before claude usage loads", () => {
    const { container } = render(
      <RuntimeStatusStrip sparklinePoints="" usageData={null} claudeUsage={null} />,
    );

    const usage = screen.getByLabelText("Claude usage limits");
    expect(within(usage).getAllByText("···")).toHaveLength(2);
    expect(container.querySelector('.console-status-main img[src^="/characters/"]')).not.toBeNull();
    expect(container.querySelector(".console-status-speedlines")).not.toBeNull();
    expect(screen.getByText("LINK SCAN")).toBeInTheDocument();
    expect(screen.getByText("THREAT: LOW")).toBeInTheDocument();
  });

  it("uses a 5h label for oauth-backed usage", () => {
    render(
      <RuntimeStatusStrip
        sparklinePoints=""
        usageData={null}
        claudeUsage={{
          status: "ok",
          source: "oauth-api",
          fetchedAt: "2026-04-09T10:00:00.000Z",
          primaryUsedPercent: 14,
          secondaryUsedPercent: 52,
        }}
      />,
    );

    const usage = screen.getByLabelText("Claude usage limits");
    expect(within(usage).getByText("5h")).toBeInTheDocument();
    expect(within(usage).getByText("14%")).toBeInTheDocument();
    expect(within(usage).getByText("52%")).toBeInTheDocument();
    expect(screen.getByText("SQUAD STABLE")).toBeInTheDocument();
    expect(screen.getByText("THREAT: LOW")).toBeInTheDocument();
  });

  it("shows unavailable values instead of a permanent loading state", () => {
    render(
      <RuntimeStatusStrip
        sparklinePoints=""
        usageData={null}
        claudeUsage={{
          status: "unavailable",
          source: "none",
          fetchedAt: "2026-04-09T10:00:00.000Z",
          message: "Claude credentials not found. Run `claude login`.",
        }}
      />,
    );

    const usage = screen.getByLabelText("Claude usage limits");
    expect(within(usage).getAllByText("NA")).toHaveLength(2);
    expect(within(usage).queryByText("···")).toBeNull();
    expect(screen.getByText("SQUAD STABLE")).toBeInTheDocument();
    expect(screen.getByText("THREAT: UNKNOWN")).toBeInTheDocument();
  });

  it("marks the strip as warning when usage crosses 60%", () => {
    render(
      <RuntimeStatusStrip
        sparklinePoints=""
        usageData={null}
        claudeUsage={{
          status: "ok",
          source: "oauth-api",
          fetchedAt: "2026-04-09T10:00:00.000Z",
          primaryUsedPercent: 67,
          secondaryUsedPercent: 52,
        }}
      />,
    );

    const strip = screen.getByLabelText("Runtime status strip");
    expect(strip).toHaveAttribute("data-alert-level", "warning");
    expect(screen.getByText("SYNC WATCH")).toBeInTheDocument();
    expect(screen.getByText("THREAT: GUARDED")).toBeInTheDocument();
  });

  it("marks the strip as critical when usage crosses 85%", () => {
    render(
      <RuntimeStatusStrip
        sparklinePoints=""
        usageData={null}
        claudeUsage={{
          status: "ok",
          source: "oauth-api",
          fetchedAt: "2026-04-09T10:00:00.000Z",
          primaryUsedPercent: 87,
          secondaryUsedPercent: 42,
        }}
      />,
    );

    const strip = screen.getByLabelText("Runtime status strip");
    expect(strip).toHaveAttribute("data-alert-level", "critical");
    expect(screen.getByText("MISSION ALERT")).toBeInTheDocument();
    expect(screen.getByText("THREAT: HIGH")).toBeInTheDocument();
  });

  it("marks the refresh button as rotating while Claude usage is refreshing", () => {
    render(
      <RuntimeStatusStrip
        sparklinePoints=""
        usageData={null}
        claudeUsage={null}
        isRefreshingClaudeUsage
        onRefreshClaudeUsage={() => {}}
      />,
    );

    expect(screen.getByRole("button", { name: "Refresh Claude usage" })).toHaveAttribute(
      "data-refreshing",
      "true",
    );
  });
});
