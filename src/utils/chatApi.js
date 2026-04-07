const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:3000";

async function authorizedRequest(endpoint, method, token, payload) {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        method,
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
        },
        body: payload ? JSON.stringify(payload) : undefined,
    });

    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
        throw new Error(data.message || "Request failed");
    }

    return data;
}

async function getChatMessages(token, { groupID, limit = 80 } = {}) {
    const params = new URLSearchParams();

    if (groupID) params.append("groupID", groupID);
    if (limit) params.append("limit", String(limit));

    const query = params.toString() ? `?${params.toString()}` : "";

    return authorizedRequest(`/api/chat/messages${query}`, "GET", token);
}

async function sendChatMessage(payload, token) {
    return authorizedRequest("/api/chat/messages", "POST", token, payload);
}

async function markChatMessagesRead(payload, token) {
    return authorizedRequest("/api/chat/messages/read", "PATCH", token, payload);
}

async function setChatTypingStatus(payload, token) {
    return authorizedRequest("/api/chat/typing", "PATCH", token, payload);
}

async function getChatTypingStatus(token, { groupID } = {}) {
    const params = new URLSearchParams();
    if (groupID) params.append("groupID", groupID);

    const query = params.toString() ? `?${params.toString()}` : "";

    return authorizedRequest(`/api/chat/typing${query}`, "GET", token);
}

export {
    getChatMessages,
    sendChatMessage,
    markChatMessagesRead,
    setChatTypingStatus,
    getChatTypingStatus,
};
