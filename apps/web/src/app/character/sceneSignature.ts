export type CharacterSceneSignature = "starlight" | "blade" | "ribbon" | "gear" | "neutral";

export type SceneBeat = "calm" | "charge" | "alert";

type RuntimeAlertLevel = "stable" | "warning" | "critical" | "scanning";
type TentacleStatus = "idle" | "active" | "blocked" | "needs-review";

export const deriveCharacterSceneSignature = (
  characterId: string | undefined,
): CharacterSceneSignature => {
  switch (characterId) {
    case "mika":
      return "starlight";
    case "ren":
      return "blade";
    case "yui":
      return "ribbon";
    case "aki":
      return "gear";
    default:
      return "neutral";
  }
};

export const deriveRuntimeSceneBeat = (alertLevel: RuntimeAlertLevel): SceneBeat => {
  if (alertLevel === "critical") return "alert";
  if (alertLevel === "warning") return "charge";
  return "calm";
};

export const deriveTentacleSceneBeat = (status: TentacleStatus): SceneBeat => {
  if (status === "blocked") return "alert";
  if (status === "active" || status === "needs-review") return "charge";
  return "calm";
};
