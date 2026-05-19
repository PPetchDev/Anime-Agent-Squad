import { describe, expect, it, vi } from "vitest";

import { HttpTerminalSnapshotReader } from "../src/runtime/HttpTerminalSnapshotReader";

const VALID_SNAPSHOT = {
  terminalId: "agent-1",
  label: "root-a",
  state: "stale",
  tentacleId: "tentacle-a",
  tentacleName: "planner",
  workspaceMode: "shared",
  createdAt: "2026-02-24T10:00:00.000Z",
  lifecycleState: "stale",
  lifecycleReason: "missing_process",
  processId: 99999999,
} as const;

const okResponse = (payload: unknown) => ({
  ok: true,
  status: 200,
  json: async () => payload,
});

const getFetchInit = (fetcher: ReturnType<typeof vi.fn>, index = 0): Record<string, unknown> => {
  const call = fetcher.mock.calls[index];
  expect(call).toBeDefined();
  if (!call) {
    throw new Error(`Expected fetcher to be called at index ${index}`);
  }
  const [, init] = call as [string, Record<string, unknown>];
  return init;
};

describe("HttpTerminalSnapshotReader", () => {
  it("loads snapshots and filters out malformed payload entries", async () => {
    const reader = new HttpTerminalSnapshotReader({
      endpoint: "https://runtime.example.com/api/terminal-snapshots",
      fetcher: async () =>
        okResponse([
          { ...VALID_SNAPSHOT },
          {
            label: "invalid-entry",
          },
        ]),
    });

    await expect(reader.listTerminalSnapshots()).resolves.toEqual([{ ...VALID_SNAPSHOT }]);
  });

  it.each([
    ["terminalId", "terminalId is missing"],
    ["label", "label is missing"],
    ["state", "state is missing"],
    ["tentacleId", "tentacleId is missing"],
    ["tentacleName", "tentacleName is missing"],
    ["workspaceMode", "workspaceMode is missing"],
    ["createdAt", "createdAt is missing"],
    ["lifecycleState", "lifecycleState is missing"],
  ])("drops snapshots when required field %s is absent", async (field) => {
    const broken = { ...VALID_SNAPSHOT } as Record<string, unknown>;
    delete broken[field];

    const reader = new HttpTerminalSnapshotReader({
      endpoint: "https://runtime.example.com/api/terminal-snapshots",
      fetcher: async () => okResponse([broken, { ...VALID_SNAPSHOT }]),
    });

    await expect(reader.listTerminalSnapshots()).resolves.toEqual([{ ...VALID_SNAPSHOT }]);
  });

  it("drops snapshots whose required string fields have the wrong primitive type", async () => {
    const reader = new HttpTerminalSnapshotReader({
      endpoint: "https://runtime.example.com/api/terminal-snapshots",
      fetcher: async () =>
        okResponse([
          { ...VALID_SNAPSHOT, terminalId: 42 },
          { ...VALID_SNAPSHOT, label: null },
          { ...VALID_SNAPSHOT, createdAt: 1700000000 },
          { ...VALID_SNAPSHOT },
        ]),
    });

    await expect(reader.listTerminalSnapshots()).resolves.toEqual([{ ...VALID_SNAPSHOT }]);
  });

  it("drops snapshots with unknown state strings", async () => {
    const reader = new HttpTerminalSnapshotReader({
      endpoint: "https://runtime.example.com/api/terminal-snapshots",
      fetcher: async () =>
        okResponse([
          { ...VALID_SNAPSHOT, state: "running" }, // not in AgentState union
          { ...VALID_SNAPSHOT, state: "LIVE" }, // case-sensitive guard
          { ...VALID_SNAPSHOT, state: "" },
          { ...VALID_SNAPSHOT, state: null },
          { ...VALID_SNAPSHOT, terminalId: "kept", state: "live" },
        ]),
    });

    await expect(reader.listTerminalSnapshots()).resolves.toEqual([
      { ...VALID_SNAPSHOT, terminalId: "kept", state: "live" },
    ]);
  });

  it("drops snapshots with unknown lifecycleState strings", async () => {
    const reader = new HttpTerminalSnapshotReader({
      endpoint: "https://runtime.example.com/api/terminal-snapshots",
      fetcher: async () =>
        okResponse([
          { ...VALID_SNAPSHOT, lifecycleState: "pending" },
          { ...VALID_SNAPSHOT, lifecycleState: "" },
          { ...VALID_SNAPSHOT, lifecycleState: 7 },
          {
            ...VALID_SNAPSHOT,
            terminalId: "kept",
            lifecycleState: "running",
          },
        ]),
    });

    await expect(reader.listTerminalSnapshots()).resolves.toEqual([
      {
        ...VALID_SNAPSHOT,
        terminalId: "kept",
        lifecycleState: "running",
      },
    ]);
  });

  it("throws when API response is not ok", async () => {
    const reader = new HttpTerminalSnapshotReader({
      endpoint: "https://runtime.example.com/api/terminal-snapshots",
      fetcher: async () => ({
        ok: false,
        status: 503,
        json: async () => [],
      }),
    });

    await expect(reader.listTerminalSnapshots()).rejects.toThrow(
      "Unable to load terminal snapshots (503)",
    );
  });

  it.each([500, 502, 504])("throws on 5xx response status %d", async (status) => {
    const reader = new HttpTerminalSnapshotReader({
      endpoint: "https://runtime.example.com/api/terminal-snapshots",
      fetcher: async () => ({
        ok: false,
        status,
        json: async () => [],
      }),
    });

    await expect(reader.listTerminalSnapshots()).rejects.toThrow(
      `Unable to load terminal snapshots (${status})`,
    );
  });

  it.each([
    ["object payload", { terminals: [VALID_SNAPSHOT] }],
    ["null payload", null],
    ["string payload", "not-an-array"],
    ["number payload", 42],
    ["boolean payload", true],
  ])("returns an empty list when the payload is a %s", async (_label, payload) => {
    const reader = new HttpTerminalSnapshotReader({
      endpoint: "https://runtime.example.com/api/terminal-snapshots",
      fetcher: async () => okResponse(payload),
    });

    await expect(reader.listTerminalSnapshots()).resolves.toEqual([]);
  });

  it("forwards the abort signal to the fetcher and surfaces aborts", async () => {
    const controller = new AbortController();
    const fetcher = vi.fn(async (_input: string, init: { signal?: AbortSignal | null }) => {
      // Simulate a fetch implementation that rejects with an AbortError when the signal fires.
      return await new Promise<never>((_resolve, reject) => {
        const onAbort = () => {
          const error = new Error("The operation was aborted.");
          error.name = "AbortError";
          reject(error);
        };
        if (init.signal?.aborted) {
          onAbort();
          return;
        }
        init.signal?.addEventListener("abort", onAbort, { once: true });
      });
    });

    const reader = new HttpTerminalSnapshotReader({
      endpoint: "https://runtime.example.com/api/terminal-snapshots",
      fetcher,
      signal: controller.signal,
    });

    const pending = reader.listTerminalSnapshots();
    controller.abort();

    await expect(pending).rejects.toMatchObject({ name: "AbortError" });
    expect(fetcher).toHaveBeenCalledTimes(1);
    const init = getFetchInit(fetcher);
    expect(init.signal).toBe(controller.signal);
    expect(init.method).toBe("GET");
    expect(init.headers).toEqual({ Accept: "application/json" });
  });

  it("rejects synchronously when the signal is already aborted before the request starts", async () => {
    const controller = new AbortController();
    controller.abort();

    const fetcher = vi.fn(async (_input: string, init: { signal?: AbortSignal | null }) => {
      if (init.signal?.aborted) {
        const error = new Error("The operation was aborted.");
        error.name = "AbortError";
        throw error;
      }
      return okResponse([]);
    });

    const reader = new HttpTerminalSnapshotReader({
      endpoint: "https://runtime.example.com/api/terminal-snapshots",
      fetcher,
      signal: controller.signal,
    });

    await expect(reader.listTerminalSnapshots()).rejects.toMatchObject({
      name: "AbortError",
    });
    expect(fetcher).toHaveBeenCalledTimes(1);
    const init = getFetchInit(fetcher);
    expect(init.signal).toBe(controller.signal);
  });

  it("omits the signal field from the request init when no signal is configured", async () => {
    const fetcher = vi.fn(async () => okResponse([]));
    const reader = new HttpTerminalSnapshotReader({
      endpoint: "https://runtime.example.com/api/terminal-snapshots",
      fetcher,
    });

    await reader.listTerminalSnapshots();

    expect(fetcher).toHaveBeenCalledTimes(1);
    const init = getFetchInit(fetcher);
    expect(init).not.toHaveProperty("signal");
  });
});
