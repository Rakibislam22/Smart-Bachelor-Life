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

async function createBazar(payload, token) {
    const formData = new FormData();

    if (payload.groupID) formData.append("groupID", payload.groupID);
    // Backend currently validates this field before replacing it with uploaded URL.
    formData.append("documentURL", payload.documentURL || "placeholder");

    if (Array.isArray(payload.item)) {
        payload.item.forEach((value) => formData.append("item", value));
    } else if (payload.item) {
        formData.append("item", payload.item);
    }

    if (Array.isArray(payload.quantity)) {
        payload.quantity.forEach((value) => formData.append("quantity", value));
    } else if (payload.quantity !== undefined && payload.quantity !== null) {
        formData.append("quantity", String(payload.quantity));
    }

    if (Array.isArray(payload.price)) {
        payload.price.forEach((value) => formData.append("price", value));
    } else if (payload.price !== undefined && payload.price !== null) {
        formData.append("price", String(payload.price));
    }

    if (payload.file) {
        formData.append("file", payload.file);
    }

    const response = await fetch(`${API_BASE_URL}/api/bazar`, {
        method: "POST",
        headers: {
            Authorization: `Bearer ${token}`,
        },
        body: formData,
    });

    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
        throw new Error(data.message || "Failed to create bazar item");
    }

    return data;
}

async function getBazar(token, { groupID } = {}) {
    const params = new URLSearchParams();

    if (groupID) params.append("groupID", groupID);

    const query = params.toString() ? `?${params.toString()}` : "";

    return authorizedRequest(`/api/bazar${query}`, "GET", token);
}

async function updateBazar(bazarId, payload, token) {
    return authorizedRequest(`/api/bazar/${bazarId}`, "PATCH", token, payload);
}

async function deleteBazar(bazarId, token) {
    return authorizedRequest(`/api/bazar/${bazarId}`, "DELETE", token);
}

export {
    createBazar,
    getBazar,
    updateBazar,
    deleteBazar,
};
