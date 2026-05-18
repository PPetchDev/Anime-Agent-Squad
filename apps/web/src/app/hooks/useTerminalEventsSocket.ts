import { type TerminalSnapshot, isAgentRuntimeState } from "@octogent/core";
import { type Dispatch, type SetStateAction, useEffect, useRef } from "react";

import { buildTerminalEventsSocketUrl } from "../../runtime/runtimeEndpoints";
import {
  type TerminalRuntimeStateStore,
  getTerminalRuntimeStateInfo,
  stripTerminalRuntimeState,
} from "../terminalRuntimeStateStore";
import type { TerminalView } from "../types";

type UseTerminalEventsSocketOptions = {
  runtimeStateStore: TerminalRuntimeStateStore;
  refreshColumns: () => Promise<TerminalView>;
  setTerminals: Dispatch<SetStateAction<TerminalView>>;
  setRecentlyCreatedTerminal: Dispatch<SetStateAction<TerminalView[number] | null>>;
};

const REFRESH_DEBOUNCE_MS = 100;

const sortTerminalSnapshots = (snapshots: TerminalView): TerminalView =>
  [...snapshots].sort((left, right) => {
    return new Date(left.createdAt).getTime() - new Date(right.createdAt).getTime();
  });

/**
 * Subscribes to the terminal-events WebSocket and merges server-pushed deltas
 * into the App-level `terminals` state. Server-side bulk changes
 * (`terminal-list-changed`) trigger a debounced `refreshColumns()` call so we
 * never refetch faster than `REFRESH_DEBOUNCE_MS`.
 */
export const useTerminalEventsSocket = ({
  runtimeStateStore,
  refreshColumns,
  setTerminals,
  setRecentlyCreatedTerminal,
}: UseTerminalEventsSocketOptions): void => {
  const refreshTimerRef = useRef<number | null>(null);

  useEffect(() => {
    return () => {
      if (refreshTimerRef.current !== null) {
        window.clearTimeout(refreshTimerRef.current);
        refreshTimerRef.current = null;
      }
    };
  }, []);

  useEffect(() => {
    const socket = new WebSocket(buildTerminalEventsSocketUrl());

    socket.addEventListener("message", (event) => {
      if (typeof event.data !== "string") {
        return;
      }

      try {
        const payload = JSON.parse(event.data) as
          | {
              type?: unknown;
              snapshot?: TerminalSnapshot;
              terminalId?: string;
              agentRuntimeState?: string;
              toolName?: string;
            }
          | undefined;
        if (!payload || typeof payload.type !== "string") {
          return;
        }

        if (payload.type === "terminal-created" || payload.type === "terminal-updated") {
          if (!payload.snapshot) {
            return;
          }
          const runtimeState = getTerminalRuntimeStateInfo(payload.snapshot);
          runtimeStateStore.setRuntimeState(payload.snapshot.terminalId, runtimeState);
          const structuralSnapshot = stripTerminalRuntimeState(payload.snapshot);
          if (payload.type === "terminal-created") {
            setRecentlyCreatedTerminal(structuralSnapshot as TerminalView[number]);
          }
          setTerminals((current) =>
            sortTerminalSnapshots([
              ...current.filter(
                (terminal) => terminal.terminalId !== structuralSnapshot.terminalId,
              ),
              structuralSnapshot,
            ]),
          );
          return;
        }

        if (payload.type === "terminal-state-changed") {
          if (!payload.terminalId || !isAgentRuntimeState(payload.agentRuntimeState)) {
            return;
          }
          runtimeStateStore.setRuntimeState(payload.terminalId, {
            state: payload.agentRuntimeState,
            ...(payload.toolName ? { toolName: payload.toolName } : {}),
          });
          return;
        }

        if (payload.type === "terminal-deleted") {
          if (!payload.terminalId) {
            return;
          }
          runtimeStateStore.removeTerminal(payload.terminalId);
          setTerminals((current) =>
            current.filter((terminal) => terminal.terminalId !== payload.terminalId),
          );
          return;
        }

        if (payload.type !== "terminal-list-changed") {
          return;
        }
      } catch {
        return;
      }

      if (refreshTimerRef.current !== null) {
        window.clearTimeout(refreshTimerRef.current);
      }
      refreshTimerRef.current = window.setTimeout(() => {
        refreshTimerRef.current = null;
        void refreshColumns();
      }, REFRESH_DEBOUNCE_MS);
    });

    return () => {
      if (refreshTimerRef.current !== null) {
        window.clearTimeout(refreshTimerRef.current);
        refreshTimerRef.current = null;
      }
      socket.close();
    };
  }, [refreshColumns, runtimeStateStore, setRecentlyCreatedTerminal, setTerminals]);
};
