export type DeckSceneMode = "grid" | "detail";
export type DeckEmptyViewMode = "idle" | "adding";

export type DeckSceneChoreography = "orbit-idle" | "summon-sequence" | "focus-lock";

export type DeckSceneInput = {
    mode: DeckSceneMode;
    emptyViewMode: DeckEmptyViewMode;
    hasTentacles: boolean;
};

export const deriveDeckSceneChoreography = ({
    mode,
    emptyViewMode,
    hasTentacles,
}: DeckSceneInput): DeckSceneChoreography => {
    if (!hasTentacles && emptyViewMode === "adding") {
        return "summon-sequence";
    }

    if (mode === "detail") {
        return "focus-lock";
    }

    return "orbit-idle";
};
