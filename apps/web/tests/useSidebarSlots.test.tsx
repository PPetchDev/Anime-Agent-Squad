import { act, render } from "@testing-library/react";
import type { ReactNode } from "react";
import { describe, expect, it } from "vitest";

import type { PrimaryNavIndex } from "../src/app/constants";
import { type UseSidebarSlotsResult, useSidebarSlots } from "../src/app/hooks/useSidebarSlots";

const HookProbe = ({ capture }: { capture: (result: UseSidebarSlotsResult) => void }) => {
  const result = useSidebarSlots();
  capture(result);
  return null;
};

const renderHook = () => {
  let latest: UseSidebarSlotsResult | null = null;
  render(
    <HookProbe
      capture={(result) => {
        latest = result;
      }}
    />,
  );
  if (!latest) {
    throw new Error("useSidebarSlots did not render");
  }
  return () => latest as UseSidebarSlotsResult;
};

const renderNode = (node: ReactNode): string => {
  const container = document.createElement("div");
  const { unmount } = render(node as ReactNode, { container, baseElement: document.body });
  const text = container.textContent ?? "";
  unmount();
  container.remove();
  return text;
};

describe("useSidebarSlots", () => {
  it("starts with every slot set to null", () => {
    const get = renderHook();
    const initial = get();
    expect(initial.deckSidebarContent).toBeNull();
    expect(initial.conversationsSidebarContent).toBeNull();
    expect(initial.conversationsActionPanel).toBeNull();
    expect(initial.promptsSidebarContent).toBeNull();
  });

  it("publishes setters that update the corresponding slot", () => {
    const get = renderHook();

    act(() => {
      get().setDeckSidebarContent(<span>deck-body</span>);
      get().setConversationsSidebarContent(<span>convos-body</span>);
      get().setConversationsActionPanel(<span>convos-action</span>);
      get().setPromptsSidebarContent(<span>prompts-body</span>);
    });

    expect(renderNode(get().deckSidebarContent)).toBe("deck-body");
    expect(renderNode(get().conversationsSidebarContent)).toBe("convos-body");
    expect(renderNode(get().conversationsActionPanel)).toBe("convos-action");
    expect(renderNode(get().promptsSidebarContent)).toBe("prompts-body");
  });

  it.each<[PrimaryNavIndex, "deck" | "convos" | "prompts" | null]>([
    [2, "deck"],
    [6, "convos"],
    [7, "prompts"],
    [1, null],
    [3, null],
    [4, null],
    [5, null],
    [8, null],
  ])("resolveSidebarBody(%i) returns the %s slot", (nav, expected) => {
    const get = renderHook();
    act(() => {
      get().setDeckSidebarContent(<span>deck</span>);
      get().setConversationsSidebarContent(<span>convos</span>);
      get().setPromptsSidebarContent(<span>prompts</span>);
    });

    const body = get().resolveSidebarBody(nav);
    if (expected === null) {
      expect(body).toBeUndefined();
    } else {
      expect(renderNode(body)).toBe(expected);
    }
  });

  it("collapses null content to undefined for the active nav so consumers can fall through", () => {
    const get = renderHook();
    expect(get().resolveSidebarBody(2)).toBeUndefined();
    expect(get().resolveSidebarBody(6)).toBeUndefined();
    expect(get().resolveSidebarBody(7)).toBeUndefined();
  });
});
