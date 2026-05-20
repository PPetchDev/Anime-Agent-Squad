import { describe, expect, it } from "vitest";

import {
  deriveCharacterSceneSignature,
  deriveRuntimeSceneBeat,
  deriveTentacleSceneBeat,
} from "../src/app/character/sceneSignature";

describe("sceneSignature", () => {
  it("maps built-in character IDs to deterministic scene signatures", () => {
    expect(deriveCharacterSceneSignature("mika")).toBe("starlight");
    expect(deriveCharacterSceneSignature("ren")).toBe("blade");
    expect(deriveCharacterSceneSignature("yui")).toBe("ribbon");
    expect(deriveCharacterSceneSignature("aki")).toBe("gear");
    expect(deriveCharacterSceneSignature("unknown")).toBe("neutral");
  });

  it("maps runtime alert levels to synchronized beats", () => {
    expect(deriveRuntimeSceneBeat("stable")).toBe("calm");
    expect(deriveRuntimeSceneBeat("warning")).toBe("charge");
    expect(deriveRuntimeSceneBeat("critical")).toBe("alert");
    expect(deriveRuntimeSceneBeat("scanning")).toBe("calm");
  });

  it("maps tentacle status to synchronized beats", () => {
    expect(deriveTentacleSceneBeat("idle")).toBe("calm");
    expect(deriveTentacleSceneBeat("active")).toBe("charge");
    expect(deriveTentacleSceneBeat("needs-review")).toBe("charge");
    expect(deriveTentacleSceneBeat("blocked")).toBe("alert");
  });
});
