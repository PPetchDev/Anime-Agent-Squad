import { getCharacterTemplate } from "@octogent/core";
import { describe, expect, it } from "vitest";

import { prependCharacterPrompt } from "../src/terminalRuntime/characterPrompts";

describe("character prompt composition", () => {
  it("prepends the selected character system prompt", () => {
    const template = getCharacterTemplate("mika");
    const result = prependCharacterPrompt("Build the dashboard.", "mika");

    expect(result).toBe(`${template?.systemPrompt}\n\nBuild the dashboard.`);
  });

  it("leaves prompts unchanged when no character is selected", () => {
    expect(prependCharacterPrompt("Build the dashboard.", undefined)).toBe("Build the dashboard.");
  });
});
