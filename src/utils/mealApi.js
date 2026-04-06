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

async function createMeal(payload, token) {
    return authorizedRequest("/api/meals", "POST", token, payload);
}

async function getMeals(token, { groupID, date } = {}) {
    const params = new URLSearchParams();

    if (groupID) params.append("groupID", groupID);
    if (date) params.append("date", date);

    const query = params.toString() ? `?${params.toString()}` : "";

    return authorizedRequest(`/api/meals${query}`, "GET", token);
}

async function updateMeal(mealId, payload, token) {
    return authorizedRequest(`/api/meals/${mealId}`, "PATCH", token, payload);
}

async function deleteMeal(mealId, token) {
    return authorizedRequest(`/api/meals/${mealId}`, "DELETE", token);
}

export {
    createMeal,
    getMeals,
    updateMeal,
    deleteMeal,
};
