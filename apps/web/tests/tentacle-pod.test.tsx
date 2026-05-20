import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { TentaclePod } from "../src/components/deck/TentaclePod";

describe("TentaclePod skill editor", () => {
  it("renders character avatar from characters assets in the pod", () => {
    const { container } = render(
      <TentaclePod
        tentacle={{
          tentacleId: "docs",
          displayName: "Docs",
          description: "Docs and knowledge.",
          status: "idle",
          color: "#ff6b2b",
          octopus: {
            animation: null,
            expression: null,
            accessory: null,
            hairColor: null,
          },
          scope: { paths: [], tags: [] },
          vaultFiles: ["todo.md"],
          todoTotal: 0,
          todoDone: 0,
          todoItems: [],
          suggestedSkills: ["docs-writer"],
        }}
        visuals={{
          color: "#ff6b2b",
          animation: "sway",
          expression: "happy",
          accessory: "none",
        }}
        isFocused={false}
        availableSkills={[]}
      />,
    );

    expect(container.querySelector('.deck-pod-octopus img[src^="/characters/"]')).not.toBeNull();
    expect(
      container.querySelector('.deck-pod-octopus .character-avatar[data-emotion="idle"]'),
    ).not.toBeNull();
    expect(container.querySelector(".deck-pod .mm-hud-frame__label")?.textContent).toContain("ポッド");
  });

  it("maps active status to a live character emotion", () => {
    const { container } = render(
      <TentaclePod
        tentacle={{
          tentacleId: "docs-active",
          displayName: "Docs Active",
          description: "Docs and knowledge.",
          status: "active",
          color: "#ff6b2b",
          octopus: {
            animation: null,
            expression: null,
            accessory: null,
            hairColor: null,
          },
          scope: { paths: [], tags: [] },
          vaultFiles: ["todo.md"],
          todoTotal: 0,
          todoDone: 0,
          todoItems: [],
          suggestedSkills: [],
        }}
        visuals={{
          color: "#ff6b2b",
          animation: "sway",
          expression: "happy",
          accessory: "none",
        }}
        isFocused={false}
        availableSkills={[]}
      />,
    );

    expect(
      container.querySelector('.deck-pod-octopus .character-avatar[data-emotion="thinking"]'),
    ).not.toBeNull();
    expect(container.querySelector('.deck-pod-callout[data-status="active"]')).not.toBeNull();
    expect(screen.getByText("OVERDRIVE")).toBeInTheDocument();
  });

  it("saves suggested skills from the deck pod", async () => {
    const onSaveSuggestedSkills = vi.fn().mockResolvedValue(true);

    render(
      <TentaclePod
        tentacle={{
          tentacleId: "docs",
          displayName: "Docs",
          description: "Docs and knowledge.",
          status: "idle",
          color: "#ff6b2b",
          octopus: {
            animation: null,
            expression: null,
            accessory: null,
            hairColor: null,
          },
          scope: { paths: [], tags: [] },
          vaultFiles: ["todo.md"],
          todoTotal: 0,
          todoDone: 0,
          todoItems: [],
          suggestedSkills: ["docs-writer"],
        }}
        visuals={{
          color: "#ff6b2b",
          animation: "sway",
          expression: "happy",
          accessory: "none",
        }}
        isFocused={false}
        availableSkills={[
          {
            name: "docs-writer",
            description: "Keeps docs aligned with the product.",
            source: "project",
          },
          {
            name: "release-helper",
            description: "Helps with release coordination.",
            source: "user",
          },
        ]}
        onSaveSuggestedSkills={onSaveSuggestedSkills}
      />,
    );

    fireEvent.click(screen.getByRole("button", { name: "Skills" }));
    fireEvent.click(screen.getByLabelText(/release-helper/i));
    fireEvent.click(screen.getByRole("button", { name: /save skills/i }));

    await waitFor(() => {
      expect(onSaveSuggestedSkills).toHaveBeenCalledWith("docs", ["docs-writer", "release-helper"]);
    });
  });
});
