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

async function createMenu(payload, token) {
    return authorizedRequest("/api/menus", "POST", token, payload);
}

async function getMenus(token, { groupID } = {}) {
    const params = new URLSearchParams();

    if (groupID) params.append("groupID", groupID);

    const query = params.toString() ? `?${params.toString()}` : "";

    return authorizedRequest(`/api/menus${query}`, "GET", token);
}

async function updateMenu(menuId, payload, token) {
    return authorizedRequest(`/api/menus/${menuId}`, "PATCH", token, payload);
}

async function deleteMenu(menuId, token) {
    return authorizedRequest(`/api/menus/${menuId}`, "DELETE", token);
}

export {
    createMenu,
    getMenus,
    updateMenu,
    deleteMenu,
};
