const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:3000";

async function getExpenses(token, { dateFrom, dateTo } = {}) {
    const params = new URLSearchParams();
    if (dateFrom) params.append("dateFrom", dateFrom);
    if (dateTo) params.append("dateTo", dateTo);

    const query = params.toString() ? `?${params.toString()}` : "";

    const response = await fetch(`${API_BASE_URL}/api/expenses${query}`, {
        method: "GET",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
        },
    });

    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
        throw new Error(data.message || "Failed to fetch expenses");
    }

    return data;
}

async function createExpense(payload, token) {
    const formData = new FormData();
    formData.append("title", payload.title);
    formData.append("amount", String(payload.amount));
    formData.append("category", payload.category);
    formData.append("file", payload.file);

    const response = await fetch(`${API_BASE_URL}/api/expenses`, {
        method: "POST",
        headers: {
            Authorization: `Bearer ${token}`,
        },
        body: formData,
    });

    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
        throw new Error(data.message || "Failed to create expense");
    }

    return data;
}

export { getExpenses, createExpense };
