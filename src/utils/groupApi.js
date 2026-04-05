const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:3000";

async function authorizedPost(endpoint, payload, token) {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
    });

    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
        throw new Error(data.message || "Request failed");
    }

    return data;
}

async function registerAsManager(email, token) {
    return authorizedPost("/api/auth/manager-register", { email }, token);
}

async function joinAsMember(joinCode, token) {
    return authorizedPost("/api/group/join", { joinCode }, token);
}

export { registerAsManager, joinAsMember };
