import { getCharacterTemplate } from "@octogent/core";

const buildCharacterPromptBlock = (characterId: string | undefined): string | undefined => {
  const template = getCharacterTemplate(characterId);
  if (!template) {
    return undefined;
  }

  return template.systemPrompt;
};

export const prependCharacterPrompt = (
  prompt: string | undefined,
  characterId: string | undefined,
): string | undefined => {
  if (!prompt) {
    return prompt;
  }

  const characterPrompt = buildCharacterPromptBlock(characterId);
  if (!characterPrompt) {
    return prompt;
  }

  return `${characterPrompt}\n\n${prompt}`;
};
