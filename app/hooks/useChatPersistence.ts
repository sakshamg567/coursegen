const CHAT_STORAGE_KEY = "ai-course-chat-messages";
const CHAT_VERSION = "1"; // Increment this if message structure changes

interface StoredChat {
  version: string;
  messages: any[];
  timestamp: number;
}

export function loadMessagesFromStorage(): any[] {
  if (typeof window === "undefined") return [];

  try {
    const stored = localStorage.getItem(CHAT_STORAGE_KEY);
    if (!stored) return [];

    const parsed: StoredChat = JSON.parse(stored);

    // Check version compatibility
    if (parsed.version !== CHAT_VERSION) {
      console.log("Chat version mismatch, clearing old messages");
      localStorage.removeItem(CHAT_STORAGE_KEY);
      return [];
    }

    // Check if messages are less than 24 hours old
    const hoursSinceLastMessage =
      (Date.now() - parsed.timestamp) / (1000 * 60 * 60);
    if (hoursSinceLastMessage > 24) {
      console.log("Chat messages expired (>24h), clearing");
      localStorage.removeItem(CHAT_STORAGE_KEY);
      return [];
    }

    console.log("Loaded", parsed.messages.length, "messages from localStorage");
    return parsed.messages || [];
  } catch (error) {
    console.error("Failed to load chat messages:", error);
    return [];
  }
}

export function clearChatHistory() {
  localStorage.removeItem(CHAT_STORAGE_KEY);
}
