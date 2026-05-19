import { type ReactNode, useCallback, useState } from "react";

import type { PrimaryNavIndex } from "../constants";

export type UseSidebarSlotsResult = {
  deckSidebarContent: ReactNode;
  conversationsSidebarContent: ReactNode;
  conversationsActionPanel: ReactNode;
  promptsSidebarContent: ReactNode;
  setDeckSidebarContent: (content: ReactNode) => void;
  setConversationsSidebarContent: (content: ReactNode) => void;
  setConversationsActionPanel: (content: ReactNode) => void;
  setPromptsSidebarContent: (content: ReactNode) => void;
  resolveSidebarBody: (activePrimaryNav: PrimaryNavIndex) => ReactNode | undefined;
};

/**
 * Owns the `ReactNode` slot pattern for primary-view sidebars. Each top-level
 * view publishes its sidebar body (and optionally an action panel) up through
 * a setter prop; this hook holds the state and resolves the right body for the
 * current primary nav so `App.tsx` can stay focused on orchestration.
 */
export const useSidebarSlots = (): UseSidebarSlotsResult => {
  const [deckSidebarContent, setDeckSidebarContent] = useState<ReactNode>(null);
  const [conversationsSidebarContent, setConversationsSidebarContent] = useState<ReactNode>(null);
  const [conversationsActionPanel, setConversationsActionPanel] = useState<ReactNode>(null);
  const [promptsSidebarContent, setPromptsSidebarContent] = useState<ReactNode>(null);

  const resolveSidebarBody = useCallback(
    (activePrimaryNav: PrimaryNavIndex): ReactNode | undefined => {
      if (activePrimaryNav === 2) {
        return deckSidebarContent ?? undefined;
      }
      if (activePrimaryNav === 6) {
        return conversationsSidebarContent ?? undefined;
      }
      if (activePrimaryNav === 7) {
        return promptsSidebarContent ?? undefined;
      }
      return undefined;
    },
    [conversationsSidebarContent, deckSidebarContent, promptsSidebarContent],
  );

  return {
    deckSidebarContent,
    conversationsSidebarContent,
    conversationsActionPanel,
    promptsSidebarContent,
    setDeckSidebarContent,
    setConversationsSidebarContent,
    setConversationsActionPanel,
    setPromptsSidebarContent,
    resolveSidebarBody,
  };
};
