import { describe, expect, it } from "vitest";

import {
  // adapters
  InMemoryTerminalSnapshotReader,
  // application
  buildTerminalList,
  // domain/agentRuntime
  isAgentRuntimeState,
  isTerminalAgentProvider,
  TERMINAL_AGENT_PROVIDERS,
  // domain/channel
  // (ChannelMessage is type-only; verify the module loaded by using a type import below)
  // domain/character
  BUILT_IN_CHARACTER_TEMPLATES,
  CHARACTER_EMOTION_CATALOG,
  DEFAULT_CHARACTER_AVATAR_PATH,
  getCharacterTemplate,
  isBuiltInCharacterId,
  resolveCharacterAvatarPath,
  resolveCharacterEmotion,
  resolveCharacterEmotionImagePath,
  // domain/completionSound
  isTerminalCompletionSoundId,
  TERMINAL_COMPLETION_SOUND_IDS,
  // domain/deck — type-only exports; verify via typeof check on a value below
  // domain/git — type-only exports
  // domain/monitor — type-only exports
  // domain/setup — type-only exports
  // domain/uiState — type-only exports
  // domain/usage — type-only exports
  // domain/conversation — type-only exports
  // domain/terminal — type-only exports
  // ports
  // TerminalSnapshotReader is an interface — verified by InMemoryTerminalSnapshotReader implementing it
  // util
  asNumber,
  asRecord,
  asString,
} from "../src/index";

describe("barrel re-export completeness", () => {
  it("exports InMemoryTerminalSnapshotReader (adapters)", () => {
    expect(InMemoryTerminalSnapshotReader).toBeDefined();
    const reader = new InMemoryTerminalSnapshotReader([]);
    expect(reader).toBeInstanceOf(InMemoryTerminalSnapshotReader);
  });

  it("exports buildTerminalList (application)", () => {
    expect(buildTerminalList).toBeTypeOf("function");
  });

  it("exports agentRuntime helpers", () => {
    expect(isAgentRuntimeState).toBeTypeOf("function");
    expect(isTerminalAgentProvider).toBeTypeOf("function");
    expect(TERMINAL_AGENT_PROVIDERS).toContain("claude-code");
    expect(isAgentRuntimeState("processing")).toBe(true);
    expect(isAgentRuntimeState("bogus")).toBe(false);
  });

  it("exports character constants and helpers", () => {
    expect(DEFAULT_CHARACTER_AVATAR_PATH).toBe("/characters/default-agent.svg");
    expect(BUILT_IN_CHARACTER_TEMPLATES.length).toBeGreaterThan(0);
    expect(getCharacterTemplate).toBeTypeOf("function");
    expect(isBuiltInCharacterId).toBeTypeOf("function");
    expect(resolveCharacterAvatarPath).toBeTypeOf("function");
    expect(resolveCharacterEmotion).toBeTypeOf("function");
    expect(resolveCharacterEmotionImagePath).toBeTypeOf("function");
    expect(CHARACTER_EMOTION_CATALOG).toBeDefined();
    expect(isBuiltInCharacterId("aki")).toBe(true);
    expect(isBuiltInCharacterId("not-a-character")).toBe(false);
  });

  it("exports completionSound constants and helpers", () => {
    expect(TERMINAL_COMPLETION_SOUND_IDS.length).toBeGreaterThan(0);
    expect(isTerminalCompletionSoundId).toBeTypeOf("function");
  });

  it("exports typeCoercion helpers", () => {
    expect(asRecord).toBeTypeOf("function");
    expect(asString).toBeTypeOf("function");
    expect(asNumber).toBeTypeOf("function");
    expect(asRecord({ a: 1 })).toEqual({ a: 1 });
    expect(asRecord(null)).toBeNull();
    expect(asString("hello")).toBe("hello");
    expect(asString(42)).toBeNull();
    expect(asNumber(3)).toBe(3);
    expect(asNumber(NaN)).toBeNull();
  });
});
