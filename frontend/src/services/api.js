// Thin REST client for the Django backend.
// Vite dev server proxies /api/* to http://localhost:8000 (see vite.config.js).
// Swap BASE_URL for your deployed Django host in production, e.g. via an env var.

const BASE_URL = import.meta.env.VITE_API_BASE_URL || "/api";

async function request(path, options = {}) {
  const res = await fetch(`${BASE_URL}${path}`, {
    headers: {
      "Content-Type": "application/json",
      ...(options.headers || {}),
    },
    credentials: "include", // send Django session cookie / CSRF cookie
    ...options,
  });

  if (!res.ok) {
    const body = await res.text().catch(() => "");
    throw new Error(`API ${res.status}: ${body || res.statusText}`);
  }

  const contentType = res.headers.get("content-type") || "";
  return contentType.includes("application/json") ? res.json() : res.text();
}

export const api = {
  // POST /api/auth/login/
  login(credentials) {
    return request("/auth/login/", {
      method: "POST",
      body: JSON.stringify(credentials),
    });
  },

  // POST /api/auth/signup/
  signup(payload) {
    return request("/auth/signup/", {
      method: "POST",
      body: JSON.stringify(payload),
    });
  },

  // GET /api/auth/me/
  getCurrentUser() {
    return request("/auth/me/");
  },

  // GET /api/conversations/  -> list of conversations for the inbox
  listConversations() {
    return request("/conversations/");
  },

  // GET /api/conversations/:id/messages/  -> message history for a room
  getMessages(conversationId) {
    return request(`/conversations/${conversationId}/messages/`);
  },

  // POST /api/conversations/:id/messages/  -> persist a message (in addition
  // to broadcasting it over the websocket)
  postMessage(conversationId, text) {
    return request(`/conversations/${conversationId}/messages/`, {
      method: "POST",
      body: JSON.stringify({ text }),
    });
  },

  // PATCH /api/conversations/:id/  -> e.g. close / snooze / assign
  updateConversation(conversationId, patch) {
    return request(`/conversations/${conversationId}/`, {
      method: "PATCH",
      body: JSON.stringify(patch),
    });
  },
};
