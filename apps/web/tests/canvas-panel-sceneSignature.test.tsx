import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { CanvasTentaclePanel } from "../src/components/canvas/CanvasTentaclePanel";

const baseTentacle = {
    tentacleId: "docs-knowledge",
    displayName: "Docs & Knowledge",
    description: "Keep docs aligned with the product.",
    status: "active" as const,
    color: "#ff6b2b",
    octopus: {
        animation: null,
        expression: null,
        accessory: null,
        hairColor: null,
    },
    scope: { paths: [], tags: [] },
    vaultFiles: ["todo.md"],
    todoTotal: 2,
    todoDone: 0,
    todoItems: [
        { text: "Audit docs", done: false },
        { text: "Consolidate principles", done: false },
    ],
    suggestedSkills: ["docs-writer", "release-helper"],
};

describe("CanvasTentaclePanel scene signature metadata", () => {
    it("renders scene signature and beat metadata for active tentacle", () => {
        const { container } = render(
            <CanvasTentaclePanel
                node={{
                    id: "docs-knowledge",
                    type: "tentacle",
                    x: 0,
                    y: 0,
                    vx: 0,
                    vy: 0,
                    pinned: false,
                    radius: 48,
                    tentacleId: "docs-knowledge",
                    label: "Docs & Knowledge",
                    color: "#ff6b2b",
                }}
                tentacle={baseTentacle}
                sessions={[]}
                onClose={() => {}}
            />,
        );

        expect(screen.getByText("Command Deck")).toBeInTheDocument();
        const panel = container.querySelector<HTMLElement>(".detail-panel");
        expect(panel?.dataset.beat).toBe("charge");
        expect(["starlight", "blade", "ribbon", "gear", "neutral"]).toContain(
            panel?.dataset.signature,
        );
    });
});
