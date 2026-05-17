import { constants, accessSync, chmodSync, cpSync, existsSync, mkdirSync, statSync } from "node:fs";
import { createRequire } from "node:module";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import type { spawn as nodePtySpawn } from "node-pty";

const require = createRequire(import.meta.url);

type NodePtySpawn = typeof nodePtySpawn;

const getSpawnHelperCandidates = (packageDir: string) => [
  join(packageDir, "build", "Release", "spawn-helper"),
  join(packageDir, "prebuilds", `${process.platform}-${process.arch}`, "spawn-helper"),
];

const canExecute = (filePath: string): boolean => {
  try {
    accessSync(filePath, constants.X_OK);
    return true;
  } catch {
    return false;
  }
};

const ensureExecutable = (filePath: string): boolean => {
  if (canExecute(filePath)) {
    return true;
  }

  try {
    const currentMode = statSync(filePath).mode;
    chmodSync(filePath, currentMode | 0o755);
    return canExecute(filePath);
  } catch {
    return false;
  }
};

export const createShellEnvironment = (options?: { octogentSessionId?: string }) => {
  const env: Record<string, string> = {};
  for (const [key, value] of Object.entries(process.env)) {
    if (typeof value === "string") {
      env[key] = value;
    }
  }
  env.TERM = "xterm-256color";
  env.COLORTERM = "truecolor";
  if (options?.octogentSessionId) {
    env.OCTOGENT_SESSION_ID = options.octogentSessionId;
  }
  return env;
};

export const ensureNodePtySpawnHelperExecutable = () => {
  if (process.platform === "win32") {
    return true;
  }

  try {
    const packageJsonPath = require.resolve("node-pty/package.json");
    const packageDir = dirname(packageJsonPath);
    const helperCandidates = getSpawnHelperCandidates(packageDir);

    let didFindHelper = false;
    for (const helperPath of helperCandidates) {
      if (!existsSync(helperPath)) {
        continue;
      }

      didFindHelper = true;
      if (ensureExecutable(helperPath)) {
        return true;
      }
    }

    return !didFindHelper;
  } catch {
    // Let node-pty throw the actionable error if helper lookup/setup fails.
    return false;
  }
};

export const loadWritableNodePtySpawnFallback = (): NodePtySpawn | undefined => {
  if (process.platform === "win32") {
    return undefined;
  }

  try {
    const packageJsonPath = require.resolve("node-pty/package.json");
    const packageDir = dirname(packageJsonPath);
    const packageJson = require(packageJsonPath) as { version?: string };
    const version = packageJson.version ?? "unknown";
    const sourceHelpers = getSpawnHelperCandidates(packageDir).filter((helperPath) =>
      existsSync(helperPath),
    );

    if (sourceHelpers.length === 0 || sourceHelpers.some((helperPath) => canExecute(helperPath))) {
      return undefined;
    }

    const fallbackPackageDir = join(
      tmpdir(),
      "octogent-node-pty",
      `${version}-${process.platform}-${process.arch}`,
    );
    const fallbackPackageJsonPath = join(fallbackPackageDir, "package.json");
    if (!existsSync(fallbackPackageJsonPath)) {
      mkdirSync(dirname(fallbackPackageDir), { recursive: true });
      cpSync(packageDir, fallbackPackageDir, { recursive: true });
    }

    let hasExecutableFallbackHelper = false;
    for (const helperPath of getSpawnHelperCandidates(fallbackPackageDir)) {
      if (existsSync(helperPath) && ensureExecutable(helperPath)) {
        hasExecutableFallbackHelper = true;
      }
    }
    if (!hasExecutableFallbackHelper) {
      return undefined;
    }

    const fallbackModule = require(fallbackPackageDir) as { spawn?: NodePtySpawn };
    return typeof fallbackModule.spawn === "function" ? fallbackModule.spawn : undefined;
  } catch {
    return undefined;
  }
};
