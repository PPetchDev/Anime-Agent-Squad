import { render, screen, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import type { UseMonitorRuntimeResult } from "../src/app/hooks/useMonitorRuntime";
import { CodeIntelPrimaryView } from "../src/components/CodeIntelPrimaryView";
import { ConversationsPrimaryView } from "../src/components/ConversationsPrimaryView";
import { GitHubPrimaryView } from "../src/components/GitHubPrimaryView";
import { MonitorPrimaryView } from "../src/components/MonitorPrimaryView";
import { PromptsPrimaryView } from "../src/components/PromptsPrimaryView";

const buildMonitorRuntime = (
  overrides: Partial<UseMonitorRuntimeResult> = {},
): UseMonitorRuntimeResult => ({
  monitorConfig: null,
  monitorFeed: null,
  isRefreshingMonitorFeed: false,
  isSavingMonitorConfig: false,
  monitorError: null,
  refreshMonitorFeed: async () => undefined,
  patchMonitorConfig: async () => true,
  ...overrides,
});

const FEED_BASE = {
  providerId: "x" as const,
  queryTerms: [] as string[],
  refreshPolicy: {
    maxCacheAgeMs: 0,
    maxPosts: 30,
    searchWindowDays: 7 as const,
  },
  lastFetchedAt: null,
  staleAfter: null,
  isStale: false,
  lastError: null,
  posts: [] as never[],
  usage: null,
};

const noopProps = {
  githubRepoLabel: "owner/repo",
  githubStatusPill: "STABLE",
  isRefreshingGitHubSummary: false,
  onRefresh: () => undefined,
  githubStarCountLabel: "0",
  githubOpenIssuesLabel: "0",
  githubOpenPrsLabel: "0",
  githubRecentCommits: [],
  githubCommitCount30d: 0,
  githubOverviewHoverLabel: "",
  githubOverviewGraphPolylinePoints: "",
  githubOverviewGraphSeries: [],
  hoveredGitHubOverviewPointIndex: null,
  onHoveredGitHubOverviewPointIndexChange: () => undefined,
};

describe("Primary view empty/error/loading states", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe("MonitorPrimaryView", () => {
    it("renders the magical-mecha empty state when the feed has no posts", () => {
      render(
        <MonitorPrimaryView monitorRuntime={buildMonitorRuntime({ monitorFeed: FEED_BASE })} />,
      );

      const empty = screen.getByTestId("monitor-feed-empty");
      expect(empty).toHaveClass("primary-view-state--empty", "mm-hud-frame", "mm-sparkle-host");
      expect(screen.getByText("エンプティ")).toBeInTheDocument();
    });

    it("renders the warning HUD error state when monitorError is set", () => {
      render(
        <MonitorPrimaryView
          monitorRuntime={buildMonitorRuntime({ monitorError: "X token rejected" })}
        />,
      );

      const errorState = screen.getByTestId("monitor-feed-error");
      expect(errorState).toHaveClass("primary-view-state--error", "mm-hud-frame--warning");
      expect(errorState).toHaveAttribute("role", "alert");
      expect(screen.getByText("X token rejected")).toBeInTheDocument();
    });

    it("renders a distinct loading state separate from the empty state", () => {
      render(
        <MonitorPrimaryView
          monitorRuntime={buildMonitorRuntime({ isRefreshingMonitorFeed: true })}
        />,
      );

      const loading = screen.getByTestId("monitor-feed-loading");
      expect(loading).toHaveClass("primary-view-state--loading");
      expect(loading).toHaveAttribute("role", "status");
    });
  });

  describe("GitHubPrimaryView", () => {
    it("renders the magical-mecha empty state when no recent commits exist", () => {
      render(<GitHubPrimaryView {...noopProps} githubRecentCommits={[]} />);

      const empty = screen.getByTestId("github-recent-empty");
      expect(empty).toHaveClass("primary-view-state--empty", "mm-hud-frame", "mm-sparkle-host");
      expect(screen.getByText("エンプティ")).toBeInTheDocument();
    });

    it("renders the warning HUD error state when githubError is set", () => {
      render(
        <GitHubPrimaryView {...noopProps} githubError="Rate limited" githubRecentCommits={[]} />,
      );

      const errorState = screen.getByTestId("github-error");
      expect(errorState).toHaveClass("primary-view-state--error", "mm-hud-frame--warning");
      expect(screen.getByText("Rate limited")).toBeInTheDocument();
    });

    it("renders a distinct loading state separate from the empty state", () => {
      render(<GitHubPrimaryView {...noopProps} githubRecentCommits={[]} isLoadingGitHubSummary />);

      const loading = screen.getByTestId("github-loading");
      expect(loading).toHaveClass("primary-view-state--loading");
    });
  });

  describe("CodeIntelPrimaryView", () => {
    it("renders a magical-mecha empty state when no events exist", async () => {
      vi.spyOn(globalThis, "fetch").mockResolvedValue(
        new Response(JSON.stringify({ events: [] }), {
          status: 200,
          headers: { "Content-Type": "application/json" },
        }),
      );

      render(<CodeIntelPrimaryView enabled />);

      const empty = await screen.findByTestId("code-intel-empty");
      expect(empty).toHaveClass("primary-view-state--empty", "mm-hud-frame", "mm-sparkle-host");
      expect(screen.getByText("エンプティ")).toBeInTheDocument();
    });

    it("renders a warning HUD error state when the fetch fails", async () => {
      vi.spyOn(globalThis, "fetch").mockResolvedValue(
        new Response("nope", {
          status: 500,
          headers: { "Content-Type": "text/plain" },
        }),
      );

      render(<CodeIntelPrimaryView enabled />);

      const errorState = await screen.findByTestId("code-intel-error");
      expect(errorState).toHaveClass("primary-view-state--error", "mm-hud-frame--warning");
    });
  });

  describe("ConversationsPrimaryView", () => {
    it("renders a magical-mecha empty state when no session is selected", async () => {
      vi.spyOn(globalThis, "fetch").mockResolvedValue(
        new Response(JSON.stringify({ sessions: [] }), {
          status: 200,
          headers: { "Content-Type": "application/json" },
        }),
      );

      render(<ConversationsPrimaryView enabled />);

      const empty = await screen.findByTestId("conversations-empty");
      expect(empty).toHaveClass("primary-view-state--empty", "mm-hud-frame", "mm-sparkle-host");
    });

    it("renders the warning HUD error state when the runtime reports an error", async () => {
      vi.spyOn(globalThis, "fetch").mockResolvedValue(
        new Response("nope", {
          status: 500,
          headers: { "Content-Type": "text/plain" },
        }),
      );

      render(<ConversationsPrimaryView enabled />);

      await waitFor(() => {
        expect(screen.getByTestId("conversations-error")).toHaveClass(
          "primary-view-state--error",
          "mm-hud-frame--warning",
        );
      });
    });
  });

  describe("PromptsPrimaryView", () => {
    it("renders a magical-mecha empty state when no prompt is selected", async () => {
      vi.spyOn(globalThis, "fetch").mockResolvedValue(
        new Response(JSON.stringify({ prompts: [] }), {
          status: 200,
          headers: { "Content-Type": "application/json" },
        }),
      );

      render(<PromptsPrimaryView enabled isClaudeDangerouslySkipPermissionsEnabled={false} />);

      const empty = await screen.findByTestId("prompts-empty");
      expect(empty).toHaveClass("primary-view-state--empty", "mm-hud-frame", "mm-sparkle-host");
    });

    it("renders the warning HUD error state when the runtime reports an error", async () => {
      vi.spyOn(globalThis, "fetch").mockResolvedValue(
        new Response("nope", {
          status: 500,
          headers: { "Content-Type": "text/plain" },
        }),
      );

      render(<PromptsPrimaryView enabled isClaudeDangerouslySkipPermissionsEnabled={false} />);

      await waitFor(() => {
        expect(screen.getByTestId("prompts-error")).toHaveClass(
          "primary-view-state--error",
          "mm-hud-frame--warning",
        );
      });
    });
  });
});
