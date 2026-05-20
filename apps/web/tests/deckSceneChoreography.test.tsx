import { describe, expect, it } from "vitest";

import { deriveDeckSceneChoreography } from "../src/app/deck/sceneChoreography";

describe("deriveDeckSceneChoreography", () => {
    it("returns summon sequence while empty deck is in adding mode", () => {
        expect(
            deriveDeckSceneChoreography({
                mode: "grid",
                emptyViewMode: "adding",
                hasTentacles: false,
            }),
        ).toBe("summon-sequence");
    });

    it("returns focus lock when deck is in detail mode", () => {
        expect(
            deriveDeckSceneChoreography({
                mode: "detail",
                emptyViewMode: "idle",
                hasTentacles: true,
            }),
        ).toBe("focus-lock");
    });

    it("returns orbit idle for default grid state", () => {
        expect(
            deriveDeckSceneChoreography({
                mode: "grid",
                emptyViewMode: "idle",
                hasTentacles: true,
            }),
        ).toBe("orbit-idle");
    });
});
