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

async function getManagerPayments(token, { fromDate, toDate, userID } = {}) {
    const params = new URLSearchParams();

    if (fromDate) params.append("fromDate", fromDate);
    if (toDate) params.append("toDate", toDate);
    if (userID) params.append("userID", userID);

    const query = params.toString() ? `?${params.toString()}` : "";

    return authorizedRequest(`/api/payment${query}`, "GET", token);
}

async function getUserPayments(token) {
    return authorizedRequest("/api/payment/user", "GET", token);
}

async function createPayment(payload, token) {
    return authorizedRequest("/api/payment", "POST", token, payload);
}

async function confirmPayment(paymentID, transactionID, token) {
    return authorizedRequest(`/api/payment/confirm/${paymentID}`, "POST", token, {
        transactionID,
    });
}

async function rejectPayment(paymentID, transactionID, token) {
    return authorizedRequest(`/api/payment/reject/${paymentID}`, "POST", token, {
        transactionID,
    });
}

async function createStripeCheckoutSession(amount, token) {
    return authorizedRequest("/api/payment/stripe/checkout-session", "POST", token, {
        amount,
    });
}

async function confirmStripeSession(sessionId, token) {
    return authorizedRequest("/api/payment/stripe/confirm-session", "POST", token, {
        sessionId,
    });
}

export {
    getManagerPayments,
    getUserPayments,
    createPayment,
    confirmPayment,
    rejectPayment,
    createStripeCheckoutSession,
    confirmStripeSession,
};
