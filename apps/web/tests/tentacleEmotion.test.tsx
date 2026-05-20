import { describe, expect, it } from "vitest";

import { deriveTentacleEmotionContextFromConnectedNodes, mapTentacleStatusToEmotionContext } from "../src/app/character/tentacleEmotion";

describe("mapTentacleStatusToEmotionContext", () => {
    it("maps active status to live processing context", () => {
        expect(mapTentacleStatusToEmotionContext("active")).toEqual({
            agentState: "live",
            agentRuntimeState: "processing",
        });
    });

    it("maps blocked status to blocked idle context", () => {
        expect(mapTentacleStatusToEmotionContext("blocked")).toEqual({
            agentState: "blocked",
            agentRuntimeState: "idle",
        });
    });

    it("maps needs-review status to stale idle context", () => {
        expect(mapTentacleStatusToEmotionContext("needs-review")).toEqual({
            agentState: "stale",
            agentRuntimeState: "idle",
        });
    });

    it("maps idle status to idle idle context", () => {
        expect(mapTentacleStatusToEmotionContext("idle")).toEqual({
            agentState: "idle",
            agentRuntimeState: "idle",
        });
    });
});

describe("deriveTentacleEmotionContextFromConnectedNodes", () => {
    it("uses active-session priorities for agent and runtime states", () => {
        expect(
            deriveTentacleEmotionContextFromConnectedNodes([
                {
                    id: "s1",
                    type: "active-session",
                    x: 0,
                    y: 0,
                    vx: 0,
                    vy: 0,
                    pinned: false,
                    radius: 20,
                    tentacleId: "docs",
                    label: "s1",
                    color: "#fff",
                    agentState: "live",
                    agentRuntimeState: "processing",
                },
                {
                    id: "s2",
                    type: "active-session",
                    x: 0,
                    y: 0,
                    vx: 0,
                    vy: 0,
                    pinned: false,
                    radius: 20,
                    tentacleId: "docs",
                    label: "s2",
                    color: "#fff",
                    agentState: "blocked",
                    agentRuntimeState: "waiting_for_user",
                },
            ]),
        ).toEqual({
            agentState: "blocked",
            agentRuntimeState: "processing",
        });
    });

    it("returns idle context when there are no active sessions", () => {
        expect(
            deriveTentacleEmotionContextFromConnectedNodes([
                {
                    id: "i1",
                    type: "inactive-session",
                    x: 0,
                    y: 0,
                    vx: 0,
                    vy: 0,
                    pinned: false,
                    radius: 20,
                    tentacleId: "docs",
                    label: "i1",
                    color: "#fff",
                },
            ]),
        ).toEqual({
            agentState: "idle",
            agentRuntimeState: "idle",
        });
    });
});
