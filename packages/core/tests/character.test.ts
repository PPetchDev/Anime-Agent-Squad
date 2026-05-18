import { describe, expect, it } from "vitest";

import {
  CHARACTER_EMOTION_CATALOG,
  type CharacterEmotion,
  type CharacterEmotionContext,
  DEFAULT_CHARACTER_AVATAR_PATH,
  resolveCharacterEmotion,
  resolveCharacterEmotionImagePath,
} from "../src/domain/character";

type CharRow = {
  ctx: CharacterEmotionContext;
  expected: {
    aki: CharacterEmotion;
    mika: CharacterEmotion;
    ren: CharacterEmotion;
    yui: CharacterEmotion;
  };
  label: string;
};

const cases: CharRow[] = [
  {
    label: "agentRuntimeState=processing",
    ctx: { agentRuntimeState: "processing" },
    expected: { aki: "thinking", mika: "thinking", ren: "thinking", yui: "thinking" },
  },
  {
    label: "state=live",
    ctx: { agentState: "live" },
    expected: { aki: "thinking", mika: "thinking", ren: "thinking", yui: "thinking" },
  },
  {
    label: "agentRuntimeState=waiting_for_permission",
    ctx: { agentRuntimeState: "waiting_for_permission" },
    expected: { aki: "listening", mika: "surprised", ren: "surprised", yui: "surprised" },
  },
  {
    label: "agentRuntimeState=waiting_for_user",
    ctx: { agentRuntimeState: "waiting_for_user" },
    expected: { aki: "listening", mika: "thinking", ren: "thinking", yui: "thinking" },
  },
  {
    label: "state=blocked",
    ctx: { agentState: "blocked" },
    expected: { aki: "angry", mika: "angry", ren: "angry", yui: "angry" },
  },
  {
    label: "state=queued",
    ctx: { agentState: "queued" },
    expected: { aki: "listening", mika: "idle", ren: "idle", yui: "idle" },
  },
  {
    label: "state=stopped",
    ctx: { agentState: "stopped" },
    expected: { aki: "sleepy", mika: "sleepy", ren: "sleepy", yui: "sleepy" },
  },
  {
    label: "state=exited & exitCode=0",
    ctx: { agentState: "exited", exitCode: 0 },
    expected: { aki: "done", mika: "victory", ren: "happy", yui: "happy" },
  },
  {
    label: "state=exited & exitCode=1",
    ctx: { agentState: "exited", exitCode: 1 },
    expected: { aki: "crying", mika: "crying", ren: "crying", yui: "crying" },
  },
  {
    label: "state=stale",
    ctx: { agentState: "stale" },
    expected: { aki: "sleepy", mika: "sleepy", ren: "sleepy", yui: "sleepy" },
  },
  {
    label: "state=idle & idleTier=fresh",
    ctx: { agentState: "idle", idleTier: "fresh" },
    expected: { aki: "listening", mika: "idle", ren: "idle", yui: "idle" },
  },
  {
    label: "state=idle & idleTier=lingering",
    ctx: { agentState: "idle", idleTier: "lingering" },
    expected: { aki: "sleepy", mika: "sleepy", ren: "sleepy", yui: "sleepy" },
  },
  {
    label: "state=idle & idleTier=deep",
    ctx: { agentState: "idle", idleTier: "deep" },
    expected: { aki: "snack", mika: "sleepy", ren: "love", yui: "love" },
  },
];

describe("resolveCharacterEmotion — full state → emotion mapping", () => {
  for (const row of cases) {
    it(`maps ${row.label} for all four characters`, () => {
      expect(resolveCharacterEmotion("aki", row.ctx)).toBe(row.expected.aki);
      expect(resolveCharacterEmotion("mika", row.ctx)).toBe(row.expected.mika);
      expect(resolveCharacterEmotion("ren", row.ctx)).toBe(row.expected.ren);
      expect(resolveCharacterEmotion("yui", row.ctx)).toBe(row.expected.yui);
    });
  }
});

describe("resolveCharacterEmotion — priority order", () => {
  it("lifecycleState=exited beats agentRuntimeState and agentState", () => {
    expect(
      resolveCharacterEmotion("mika", {
        lifecycleState: "exited",
        exitCode: 0,
        agentRuntimeState: "processing",
        agentState: "live",
      }),
    ).toBe("victory");
  });

  it("lifecycleState=stopped beats agentState=live", () => {
    expect(
      resolveCharacterEmotion("ren", {
        lifecycleState: "stopped",
        agentState: "live",
      }),
    ).toBe("sleepy");
  });

  it("lifecycleState=stale beats agentRuntimeState=processing", () => {
    expect(
      resolveCharacterEmotion("yui", {
        lifecycleState: "stale",
        agentRuntimeState: "processing",
      }),
    ).toBe("sleepy");
  });

  it("agentRuntimeState beats agentState", () => {
    expect(
      resolveCharacterEmotion("mika", {
        agentRuntimeState: "processing",
        agentState: "idle",
        idleTier: "deep",
      }),
    ).toBe("thinking");
  });

  it("agentRuntimeState=waiting_for_permission beats agentState=blocked", () => {
    expect(
      resolveCharacterEmotion("ren", {
        agentRuntimeState: "waiting_for_permission",
        agentState: "blocked",
      }),
    ).toBe("surprised");
  });

  it("agentRuntimeState=idle is ignored — agentState takes over", () => {
    expect(
      resolveCharacterEmotion("mika", {
        agentRuntimeState: "idle",
        agentState: "blocked",
      }),
    ).toBe("angry");
  });

  it("lifecycleState=exited with no exitCode treats it as failure", () => {
    expect(
      resolveCharacterEmotion("yui", {
        lifecycleState: "exited",
      }),
    ).toBe("crying");
  });
});

describe("resolveCharacterEmotion — fallback semantics", () => {
  it("returns 'idle' when characterId is undefined", () => {
    expect(resolveCharacterEmotion(undefined, { agentRuntimeState: "processing" })).toBe("idle");
  });

  it("returns 'idle' when characterId is unknown", () => {
    expect(resolveCharacterEmotion("nonexistent", { agentRuntimeState: "processing" })).toBe(
      "idle",
    );
  });

  it("uses defaultEmotion when context yields no specific signal", () => {
    expect(resolveCharacterEmotion("mika", {})).toBe("idle");
    expect(resolveCharacterEmotion("aki", {})).toBe("listening");
    expect(resolveCharacterEmotion("ren", {})).toBe("idle");
    expect(resolveCharacterEmotion("yui", {})).toBe("idle");
  });
});

describe("resolveCharacterEmotionImagePath", () => {
  it("builds /characters/<id>/<file>.jpg for a known emotion", () => {
    expect(resolveCharacterEmotionImagePath("mika", "thinking")).toBe(
      "/characters/mika/04-thinking.jpg",
    );
    expect(resolveCharacterEmotionImagePath("aki", "snack")).toBe("/characters/aki/08-snack.jpg");
    expect(resolveCharacterEmotionImagePath("ren", "love")).toBe("/characters/ren/05-love.jpg");
    expect(resolveCharacterEmotionImagePath("yui", "surprised")).toBe(
      "/characters/yui/09-surprised.jpg",
    );
  });

  it("falls back to DEFAULT_CHARACTER_AVATAR_PATH for unknown characterId", () => {
    expect(resolveCharacterEmotionImagePath("nonexistent", "thinking")).toBe(
      DEFAULT_CHARACTER_AVATAR_PATH,
    );
    expect(resolveCharacterEmotionImagePath(undefined, "thinking")).toBe(
      DEFAULT_CHARACTER_AVATAR_PATH,
    );
  });

  it("falls back when the character has no asset for that emotion", () => {
    // aki has no "love" file → fall back to default path
    expect(resolveCharacterEmotionImagePath("aki", "love")).toBe(DEFAULT_CHARACTER_AVATAR_PATH);
    // mika has no "listening" file
    expect(resolveCharacterEmotionImagePath("mika", "listening")).toBe(
      DEFAULT_CHARACTER_AVATAR_PATH,
    );
  });
});

describe("CHARACTER_EMOTION_CATALOG integrity", () => {
  it("every entry in `available` has a matching `imageFile` filename", () => {
    for (const [characterId, entry] of Object.entries(CHARACTER_EMOTION_CATALOG)) {
      for (const emotion of entry.available) {
        expect(
          entry.imageFile[emotion],
          `${characterId}.${emotion} should have an image file`,
        ).toBeTruthy();
      }
    }
  });

  it("defaultEmotion is always part of `available`", () => {
    for (const [characterId, entry] of Object.entries(CHARACTER_EMOTION_CATALOG)) {
      expect(
        entry.available.includes(entry.defaultEmotion),
        `${characterId}.defaultEmotion=${entry.defaultEmotion} must appear in available`,
      ).toBe(true);
    }
  });
});
