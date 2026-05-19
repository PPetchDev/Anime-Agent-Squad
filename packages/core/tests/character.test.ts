import { existsSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

import { describe, expect, it } from "vitest";

import {
  BUILT_IN_CHARACTER_TEMPLATES,
  CHARACTER_EMOTION_CATALOG,
  type AgentRole,
  type CharacterEmotion,
  type CharacterEmotionContext,
  DEFAULT_CHARACTER_AVATAR_PATH,
  getCharacterTemplate,
  isBuiltInCharacterId,
  resolveCharacterAvatarPath,
  resolveCharacterEmotion,
  resolveCharacterEmotionImagePath,
} from "../src/domain/character";

const MONOREPO_ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "../../..");

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

describe("BUILT_IN_CHARACTER_TEMPLATES integrity", () => {
  const REQUIRED_ROLES: AgentRole[] = ["frontend", "backend", "review", "devops"];

  it("has all four roles represented", () => {
    const roles = BUILT_IN_CHARACTER_TEMPLATES.map((t) => t.role);
    for (const role of REQUIRED_ROLES) {
      expect(roles, `role "${role}" must be present`).toContain(role);
    }
  });

  it("has unique characterIds", () => {
    const ids = BUILT_IN_CHARACTER_TEMPLATES.map((t) => t.characterId);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it("every template has a non-empty systemPrompt", () => {
    for (const template of BUILT_IN_CHARACTER_TEMPLATES) {
      expect(
        template.systemPrompt.trim().length,
        `${template.characterId} must have a non-empty systemPrompt`,
      ).toBeGreaterThan(0);
    }
  });

  it("every avatarPath matches a file the web app ships", () => {
    for (const template of BUILT_IN_CHARACTER_TEMPLATES) {
      expect(
        template.avatarPath,
        `${template.characterId} must have an avatarPath`,
      ).toBeTruthy();
      const relativePath = template.avatarPath!.replace(/^\//, "");
      const filePath = resolve(MONOREPO_ROOT, "apps/web/public", relativePath);
      expect(
        existsSync(filePath),
        `${template.characterId}: avatarPath "${template.avatarPath}" not found at ${filePath}`,
      ).toBe(true);
    }
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

describe("resolveCharacterAvatarPath", () => {
  it("returns trimmed customAvatarPath when non-empty", () => {
    expect(
      resolveCharacterAvatarPath({ characterId: "mika", customAvatarPath: "/custom/avatar.png" }),
    ).toBe("/custom/avatar.png");
  });

  it("trims whitespace from customAvatarPath before checking emptiness", () => {
    expect(
      resolveCharacterAvatarPath({ characterId: "mika", customAvatarPath: "  /custom/avatar.png  " }),
    ).toBe("/custom/avatar.png");
  });

  it("ignores customAvatarPath that is only whitespace and falls back to template", () => {
    expect(resolveCharacterAvatarPath({ characterId: "ren", customAvatarPath: "   " })).toBe(
      "/characters/ren.svg",
    );
  });

  it("ignores empty string customAvatarPath and falls back to template", () => {
    expect(resolveCharacterAvatarPath({ characterId: "aki", customAvatarPath: "" })).toBe(
      "/characters/aki.svg",
    );
  });

  it("falls back to template avatarPath when customAvatarPath is absent", () => {
    expect(resolveCharacterAvatarPath({ characterId: "mika" })).toBe("/characters/mika.svg");
    expect(resolveCharacterAvatarPath({ characterId: "ren" })).toBe("/characters/ren.svg");
    expect(resolveCharacterAvatarPath({ characterId: "yui" })).toBe("/characters/yui.svg");
    expect(resolveCharacterAvatarPath({ characterId: "aki" })).toBe("/characters/aki.svg");
  });

  it("falls back to DEFAULT_CHARACTER_AVATAR_PATH when characterId is unknown and no custom path", () => {
    expect(resolveCharacterAvatarPath({ characterId: "unknown" })).toBe(
      DEFAULT_CHARACTER_AVATAR_PATH,
    );
  });

  it("falls back to DEFAULT_CHARACTER_AVATAR_PATH when characterId is undefined and no custom path", () => {
    expect(resolveCharacterAvatarPath({})).toBe(DEFAULT_CHARACTER_AVATAR_PATH);
  });

  it("prefers customAvatarPath over template even when characterId is valid", () => {
    expect(
      resolveCharacterAvatarPath({ characterId: "mika", customAvatarPath: "/override.png" }),
    ).toBe("/override.png");
  });
});

describe("getCharacterTemplate", () => {
  it("returns the matching template for a known characterId", () => {
    const template = getCharacterTemplate("mika");
    expect(template).toBeDefined();
    expect(template?.characterId).toBe("mika");
    expect(template?.name).toBe("Mika");
    expect(template?.role).toBe("frontend");
  });

  it("returns undefined for an unknown characterId", () => {
    expect(getCharacterTemplate("nonexistent")).toBeUndefined();
  });

  it("returns undefined when characterId is undefined", () => {
    expect(getCharacterTemplate(undefined)).toBeUndefined();
  });

  it("returns all four built-in characters", () => {
    const ids = BUILT_IN_CHARACTER_TEMPLATES.map((t) => t.characterId);
    for (const id of ids) {
      expect(getCharacterTemplate(id)).toBeDefined();
    }
  });
});

describe("isBuiltInCharacterId", () => {
  it("returns true for each built-in character id", () => {
    expect(isBuiltInCharacterId("mika")).toBe(true);
    expect(isBuiltInCharacterId("ren")).toBe(true);
    expect(isBuiltInCharacterId("yui")).toBe(true);
    expect(isBuiltInCharacterId("aki")).toBe(true);
  });

  it("returns false for unknown string values", () => {
    expect(isBuiltInCharacterId("unknown")).toBe(false);
    expect(isBuiltInCharacterId("")).toBe(false);
  });

  it("returns false for non-string types", () => {
    expect(isBuiltInCharacterId(null)).toBe(false);
    expect(isBuiltInCharacterId(undefined)).toBe(false);
    expect(isBuiltInCharacterId(42)).toBe(false);
    expect(isBuiltInCharacterId({})).toBe(false);
    expect(isBuiltInCharacterId([])).toBe(false);
  });
});
