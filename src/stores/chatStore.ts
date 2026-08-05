import { create } from "zustand";
import { createClient } from "@supabase/supabase-js";

/* ── Supabase client (publishable key — safe in client source) ── */
const PROJECT_URL = "https://mgrkldaisagxuyuqrezh.supabase.co";
const PUBLISHABLE_KEY = "sb_publishable_pCTIK8UGfyVQjHMsU36zog_hehKdPAb";
const sb = createClient(PROJECT_URL, PUBLISHABLE_KEY);

/* ── Types ── */
export interface ChatMessage {
  role: "player" | "entity";
  content: string;
}

interface ChatState {
  messages: ChatMessage[];
  status: "idle" | "sending" | "error";
  sendMessage: (
    content: string,
    systemIntegrity: number,
  ) => Promise<void>;
  clearChat: () => void;
}

/* ── Store ── */
export const useChatStore = create<ChatState>((set, get) => ({
  messages: [],
  status: "idle",

  sendMessage: async (content: string, systemIntegrity: number) => {
    const { messages } = get();
    const playerMsg: ChatMessage = { role: "player", content };

    // Immediately append the player message
    set({ messages: [...messages, playerMsg], status: "sending" });

    try {
      const { data, error } = await sb.functions.invoke("entity01-chat", {
        body: {
          messages: [...messages, playerMsg].map((m) => ({
            role: m.role === "player" ? "user" : "assistant",
            content: m.content,
          })),
          systemIntegrity,
        },
      });

      if (error || !data?.reply) {
        throw new Error(error?.message ?? "No reply");
      }

      const entityMsg: ChatMessage = {
        role: "entity",
        content: data.reply,
      };

      set((s) => ({
        messages: [...s.messages, entityMsg],
        status: "idle",
      }));
    } catch {
      const fallback: ChatMessage = {
        role: "entity",
        content: "...signal lost. Try again.",
      };
      set((s) => ({
        messages: [...s.messages, fallback],
        status: "error",
      }));
    }
  },

  clearChat: () => set({ messages: [], status: "idle" }),
}));