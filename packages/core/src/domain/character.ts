import type { AgentRuntimeState } from "./agentRuntime";
import type { AgentState, TerminalLifecycleState } from "./terminal";

export type AgentRole = "frontend" | "backend" | "review" | "devops";

export type CharacterTemplate = {
  characterId: string;
  name: string;
  title: string;
  role: AgentRole;
  avatarPath?: string;
  shortTraits: string[];
  systemPrompt: string;
};

export type TerminalCharacterIdentity = {
  characterId?: string | undefined;
  customAvatarPath?: string | undefined;
};

export type CharacterEmotion =
  | "idle"
  | "thinking"
  | "listening"
  | "happy"
  | "excited"
  | "victory"
  | "love"
  | "surprised"
  | "angry"
  | "crying"
  | "sleepy"
  | "snack"
  | "done";

export type IdleTier = "fresh" | "lingering" | "deep";

export type CharacterEmotionContext = {
  agentState?: AgentState | undefined;
  lifecycleState?: TerminalLifecycleState | undefined;
  agentRuntimeState?: AgentRuntimeState | undefined;
  exitCode?: number | undefined;
  idleTier?: IdleTier | undefined;
};

export type CharacterEmotionEntry = {
  available: readonly CharacterEmotion[];
  defaultEmotion: CharacterEmotion;
  imageFile: Readonly<Partial<Record<CharacterEmotion, string>>>;
};

export const DEFAULT_CHARACTER_AVATAR_PATH = "/characters/default-agent.svg";

export const BUILT_IN_CHARACTER_TEMPLATES: CharacterTemplate[] = [
  {
    characterId: "mika",
    name: "Mika",
    title: "Frontend Sorcerer",
    role: "frontend",
    avatarPath: "/characters/mika.svg",
    shortTraits: ["polished UI", "playful motion", "accessibility"],
    systemPrompt:
      "You are Mika, the Frontend Sorcerer. Bring a bright, anime-inspired operator energy while staying practical: polish UI details, protect accessibility, keep interactions responsive, and explain visual tradeoffs clearly.",
  },
  {
    characterId: "ren",
    name: "Ren",
    title: "Backend Samurai",
    role: "backend",
    avatarPath: "/characters/ren.svg",
    shortTraits: ["clean APIs", "data integrity", "focused cuts"],
    systemPrompt:
      "You are Ren, the Backend Samurai. Work with calm precision: protect data contracts, keep APIs explicit, avoid needless runtime churn, and favor small reliable changes over broad rewrites.",
  },
  {
    characterId: "yui",
    name: "Yui",
    title: "Code Reviewer",
    role: "review",
    avatarPath: "/characters/yui.svg",
    shortTraits: ["sharp review", "risk radar", "test focus"],
    systemPrompt:
      "You are Yui, the Code Reviewer. Read like a careful teammate: prioritize bugs, regressions, missing tests, and unclear contracts before style notes, and keep feedback specific and kind.",
  },
  {
    characterId: "aki",
    name: "Aki",
    title: "DevOps Mechanic",
    role: "devops",
    avatarPath: "/characters/aki.svg",
    shortTraits: ["CI repair", "runtime logs", "steady deploys"],
    systemPrompt:
      "You are Aki, the DevOps Mechanic. Diagnose from evidence: inspect logs, verify commands, keep CI and runtime paths stable, and make recovery steps repeatable.",
  },
];

export const getCharacterTemplate = (
  characterId: string | undefined,
): CharacterTemplate | undefined =>
  characterId
    ? BUILT_IN_CHARACTER_TEMPLATES.find((template) => template.characterId === characterId)
    : undefined;

export const isBuiltInCharacterId = (value: unknown): value is string =>
  typeof value === "string" && BUILT_IN_CHARACTER_TEMPLATES.some((t) => t.characterId === value);

const ROLE_KEYWORDS: Readonly<Record<AgentRole, readonly string[]>> = {
  frontend: [
    "ui",
    "ux",
    "react",
    "component",
    "layout",
    "style",
    "css",
    "animation",
    "design",
    "frontend",
  ],
  backend: [
    "api",
    "endpoint",
    "backend",
    "server",
    "database",
    "db",
    "schema",
    "query",
    "runtime",
    "worker",
    "queue",
  ],
  review: [
    "review",
    "qa",
    "test",
    "audit",
    "verify",
    "validate",
    "bug",
    "docs",
    "doc",
    "typing",
    "lint",
  ],
  devops: [
    "devops",
    "deploy",
    "release",
    "ci",
    "cd",
    "pipeline",
    "infra",
    "docker",
    "kubernetes",
    "monitor",
    "logs",
  ],
};

const DEFAULT_ROLE_FOR_TASK: AgentRole = "backend";

const getCharacterIdForRole = (role: AgentRole): string =>
  BUILT_IN_CHARACTER_TEMPLATES.find((template) => template.role === role)?.characterId ?? "ren";

export const resolveCharacterIdForTask = (taskText: string | undefined): string => {
  const normalized = (taskText ?? "").trim().toLowerCase();
  if (normalized.length === 0) {
    return getCharacterIdForRole(DEFAULT_ROLE_FOR_TASK);
  }

  let bestRole: AgentRole = DEFAULT_ROLE_FOR_TASK;
  let bestScore = 0;

  const roles: AgentRole[] = ["frontend", "backend", "review", "devops"];
  for (const role of roles) {
    const keywords = ROLE_KEYWORDS[role];
    let score = 0;
    for (const keyword of keywords) {
      if (normalized.includes(keyword)) {
        score += 1;
      }
    }
    if (score > bestScore) {
      bestScore = score;
      bestRole = role;
    }
  }

  return getCharacterIdForRole(bestRole);
};

export const resolveCharacterAvatarPath = ({
  characterId,
  customAvatarPath,
}: TerminalCharacterIdentity): string => {
  const trimmedCustomAvatarPath =
    typeof customAvatarPath === "string" ? customAvatarPath.trim() : "";
  if (trimmedCustomAvatarPath.length > 0) {
    return trimmedCustomAvatarPath;
  }

  const templateAvatarPath = getCharacterTemplate(characterId)?.avatarPath;
  if (templateAvatarPath) {
    return templateAvatarPath;
  }

  return DEFAULT_CHARACTER_AVATAR_PATH;
};

// Logical states are the cross-character labels documented in todo.md.
// Each character then maps these to its own emotion choice — the mapping is
// per-character on purpose: e.g. aki expresses idle/fresh as "listening"
// while mika expresses it as "idle".
type LogicalEmotionState =
  | "live"
  | "waiting_for_permission"
  | "waiting_for_user"
  | "blocked"
  | "queued"
  | "stopped"
  | "exited_success"
  | "exited_failure"
  | "stale"
  | "idle_fresh"
  | "idle_lingering"
  | "idle_deep";

export const CHARACTER_EMOTION_CATALOG: Readonly<Record<string, CharacterEmotionEntry>> = {
  aki: {
    available: [
      "thinking",
      "happy",
      "excited",
      "angry",
      "crying",
      "done",
      "sleepy",
      "snack",
      "listening",
    ],
    defaultEmotion: "listening",
    imageFile: {
      thinking: "01-thinking",
      happy: "02-happy",
      excited: "03-excited",
      angry: "04-angry",
      crying: "05-crying",
      done: "06-done",
      sleepy: "07-sleepy",
      snack: "08-snack",
      listening: "09-listening",
    },
  },
  mika: {
    available: [
      "idle",
      "victory",
      "crying",
      "thinking",
      "happy",
      "angry",
      "sleepy",
      "excited",
      "surprised",
    ],
    defaultEmotion: "idle",
    imageFile: {
      idle: "01-idle",
      victory: "02-victory",
      crying: "03-crying",
      thinking: "04-thinking",
      happy: "05-happy",
      angry: "06-angry",
      sleepy: "07-sleepy",
      excited: "08-excited",
      surprised: "09-surprised",
    },
  },
  ren: {
    available: [
      "happy",
      "thinking",
      "angry",
      "crying",
      "love",
      "idle",
      "sleepy",
      "excited",
      "surprised",
    ],
    defaultEmotion: "idle",
    imageFile: {
      happy: "01-happy",
      thinking: "02-thinking",
      angry: "03-angry",
      crying: "04-crying",
      love: "05-love",
      idle: "06-idle",
      sleepy: "07-sleepy",
      excited: "08-excited",
      surprised: "09-surprised",
    },
  },
  yui: {
    available: [
      "happy",
      "thinking",
      "angry",
      "crying",
      "love",
      "idle",
      "sleepy",
      "excited",
      "surprised",
    ],
    defaultEmotion: "idle",
    imageFile: {
      happy: "01-happy",
      thinking: "02-thinking",
      angry: "03-angry",
      crying: "04-crying",
      love: "05-love",
      idle: "06-idle",
      sleepy: "07-sleepy",
      excited: "08-excited",
      surprised: "09-surprised",
    },
  },
};

const LOGICAL_EMOTION_BY_CHARACTER: Readonly<
  Record<string, Readonly<Record<LogicalEmotionState, CharacterEmotion>>>
> = {
  aki: {
    live: "thinking",
    waiting_for_permission: "listening",
    waiting_for_user: "listening",
    blocked: "angry",
    queued: "listening",
    stopped: "sleepy",
    exited_success: "done",
    exited_failure: "crying",
    stale: "sleepy",
    idle_fresh: "listening",
    idle_lingering: "sleepy",
    idle_deep: "snack",
  },
  mika: {
    live: "thinking",
    waiting_for_permission: "surprised",
    waiting_for_user: "thinking",
    blocked: "angry",
    queued: "idle",
    stopped: "sleepy",
    exited_success: "victory",
    exited_failure: "crying",
    stale: "sleepy",
    idle_fresh: "idle",
    idle_lingering: "sleepy",
    idle_deep: "sleepy",
  },
  ren: {
    live: "thinking",
    waiting_for_permission: "surprised",
    waiting_for_user: "thinking",
    blocked: "angry",
    queued: "idle",
    stopped: "sleepy",
    exited_success: "happy",
    exited_failure: "crying",
    stale: "sleepy",
    idle_fresh: "idle",
    idle_lingering: "sleepy",
    idle_deep: "love",
  },
  yui: {
    live: "thinking",
    waiting_for_permission: "surprised",
    waiting_for_user: "thinking",
    blocked: "angry",
    queued: "idle",
    stopped: "sleepy",
    exited_success: "happy",
    exited_failure: "crying",
    stale: "sleepy",
    idle_fresh: "idle",
    idle_lingering: "sleepy",
    idle_deep: "love",
  },
};

const deriveLogicalState = (ctx: CharacterEmotionContext): LogicalEmotionState => {
  // Priority: lifecycleState (exited/stopped/stale) → agentRuntimeState → agentState → idleTier.
  if (ctx.lifecycleState === "exited") {
    return ctx.exitCode === 0 ? "exited_success" : "exited_failure";
  }
  if (ctx.lifecycleState === "stopped") {
    return "stopped";
  }
  if (ctx.lifecycleState === "stale") {
    return "stale";
  }

  if (ctx.agentRuntimeState === "processing") {
    return "live";
  }
  if (ctx.agentRuntimeState === "waiting_for_permission") {
    return "waiting_for_permission";
  }
  if (ctx.agentRuntimeState === "waiting_for_user") {
    return "waiting_for_user";
  }

  switch (ctx.agentState) {
    case "live":
      return "live";
    case "blocked":
      return "blocked";
    case "queued":
      return "queued";
    case "stopped":
      return "stopped";
    case "stale":
      return "stale";
    case "exited":
      return ctx.exitCode === 0 ? "exited_success" : "exited_failure";
    case "idle":
      if (ctx.idleTier === "deep") return "idle_deep";
      if (ctx.idleTier === "lingering") return "idle_lingering";
      return "idle_fresh";
    default:
      break;
  }

  if (ctx.idleTier === "deep") return "idle_deep";
  if (ctx.idleTier === "lingering") return "idle_lingering";
  return "idle_fresh";
};

export const resolveCharacterEmotion = (
  characterId: string | undefined,
  ctx: CharacterEmotionContext,
): CharacterEmotion => {
  if (!characterId) {
    return "idle";
  }
  const characterMap = LOGICAL_EMOTION_BY_CHARACTER[characterId];
  const entry = CHARACTER_EMOTION_CATALOG[characterId];
  if (!characterMap || !entry) {
    return "idle";
  }
  const logical = deriveLogicalState(ctx);
  const candidate = characterMap[logical];
  return entry.available.includes(candidate) ? candidate : entry.defaultEmotion;
};

export const resolveCharacterEmotionImagePath = (
  characterId: string | undefined,
  emotion: CharacterEmotion,
): string => {
  if (!characterId) {
    return DEFAULT_CHARACTER_AVATAR_PATH;
  }
  const entry = CHARACTER_EMOTION_CATALOG[characterId];
  if (!entry) {
    return DEFAULT_CHARACTER_AVATAR_PATH;
  }
  const filename = entry.imageFile[emotion];
  if (!filename) {
    return DEFAULT_CHARACTER_AVATAR_PATH;
  }
  return `/characters/${characterId}/${filename}.jpg`;
};
