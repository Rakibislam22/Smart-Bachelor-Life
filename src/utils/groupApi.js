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

async function authorizedGet(endpoint, token) {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        method: "GET",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
        },
    });

    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
        throw new Error(data.message || "Request failed");
    }

    return data;
}

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

async function registerAsManager(email, token) {
    return authorizedPost("/api/auth/manager-register", { email }, token);
}

async function createManagerGroup(payload, token) {
    return authorizedPost("/api/group", payload, token);
}

async function updateGroupTitle(title, token) {
    return authorizedRequest("/api/group/title", "PATCH", token, { title });
}

async function updateGroupPaymentNotice(paymentNotice, token) {
    return authorizedRequest("/api/group/notice", "PATCH", token, { paymentNotice });
}

async function joinAsMember(joinCode, token) {
    return authorizedPost("/api/group/join", { joinCode }, token);
}

async function leaveGroup(token) {
    return authorizedPost("/api/group/leave", {}, token);
}

async function getManagerGroupDetails(token) {
    return authorizedGet("/api/group/details", token);
}

async function ensureManagerGroupExists({ title, address }, token) {
    try {
        return await getManagerGroupDetails(token);
    } catch (error) {
        if (error.message?.includes("Group not found for the manager")) {
            return createManagerGroup({ title, address }, token);
        }

        throw error;
    }
}

async function sendJoinCodeInvites(userList, token) {
    return authorizedPost("/api/group/send-join-code", { userList }, token);
}

async function removeGroupUser(email, token) {
    return authorizedPost("/api/group/remove-user", { email }, token);
}

async function revokeGroupInvite(email, token) {
    return authorizedPost("/api/group/revoke-invite", { email }, token);
}

async function changeGroupUserRole(userId, token) {
    return authorizedPost("/api/group/change-role", { userId }, token);
}

export {
    registerAsManager,
    createManagerGroup,
    updateGroupTitle,
    updateGroupPaymentNotice,
    ensureManagerGroupExists,
    joinAsMember,
    leaveGroup,
    getManagerGroupDetails,
    sendJoinCodeInvites,
    removeGroupUser,
    revokeGroupInvite,
    changeGroupUserRole,
};
