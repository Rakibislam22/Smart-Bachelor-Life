const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

const AUTH_REGISTER_ENDPOINT = `${API_BASE_URL}/api/auth/register`;
const AUTH_LOGIN_ENDPOINT = `${API_BASE_URL}/api/auth/login`;

function shouldRetryWithFreshToken(response, data) {
    if (response.status !== 401) {
        return false;
    }

    const message = (data?.message || '').toLowerCase();
    return message.includes('expired') || message.includes('invalid') || message.includes('unauthorized');
}

async function doAuthRequest(url, method, token, payload) {
    const headers = {
        "Content-Type": "application/json",
    };

    if (token) {
        headers.Authorization = `Bearer ${token}`;
    }

    const response = await fetch(url, {
        method,
        headers,
        body: payload ? JSON.stringify(payload) : undefined,
    });

    const data = await response.json().catch(() => ({}));
    return { response, data };
}

async function registerUserInBackend(user, tokenOverride) {
    const payload = {
        firebaseUid: user.uid,
        email: user.email,
        displayName: user.displayName || "",
        photoURL: user.photoURL || "",
        provider: user.providerData?.[0]?.providerId || "PASSWORD",
        lastLoginAt: user.metadata?.lastSignInTime || new Date().toISOString(),
    };

    let token = tokenOverride || await user?.getIdToken?.();
    let { response, data } = await doAuthRequest(
        AUTH_REGISTER_ENDPOINT,
        "POST",
        token,
        payload,
    );

    if (shouldRetryWithFreshToken(response, data) && user?.getIdToken) {
        token = await user.getIdToken(true);
        ({ response, data } = await doAuthRequest(
            AUTH_REGISTER_ENDPOINT,
            "POST",
            token,
            payload,
        ));
    }

    if (response.ok) {
        return data;
    }

    // Treat duplicate-user response as non-fatal for repeat social logins.
    if (response.status === 422) {
        return {
            success: true,
            alreadyExists: true,
            ...data,
        };
    }

    throw new Error(data.message || "Failed to register user in backend");
}

async function syncUserSession(token, user) {
    let currentToken = token;
    let { response, data } = await doAuthRequest(
        AUTH_LOGIN_ENDPOINT,
        "POST",
        currentToken,
    );

    if (shouldRetryWithFreshToken(response, data) && user?.getIdToken) {
        currentToken = await user.getIdToken(true);
        ({ response, data } = await doAuthRequest(
            AUTH_LOGIN_ENDPOINT,
            "POST",
            currentToken,
        ));
    }

    if (!response.ok) {
        throw new Error(data.message || "Failed to sync user session");
    }

    return data;
}

export { registerUserInBackend, syncUserSession };
