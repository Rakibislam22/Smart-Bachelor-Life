const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

const AUTH_REGISTER_ENDPOINT = `${API_BASE_URL}/api/auth/register`;
const AUTH_LOGIN_ENDPOINT = `${API_BASE_URL}/api/auth/login`;

async function registerUserInBackend(user, tokenOverride) {
    const payload = {
        firebaseUid: user.uid,
        email: user.email,
        displayName: user.displayName || "",
        photoURL: user.photoURL || "",
        provider: user.providerData?.[0]?.providerId || "PASSWORD",
        lastLoginAt: user.metadata?.lastSignInTime || new Date().toISOString(),
    };

    const token = tokenOverride || await user?.getIdToken?.();

    const headers = {
        "Content-Type": "application/json",
    };

    if (token) {
        headers.Authorization = `Bearer ${token}`;
    }

    const response = await fetch(AUTH_REGISTER_ENDPOINT, {
        method: "POST",
        headers,
        body: JSON.stringify(payload),
    });

    const data = await response.json().catch(() => ({}));

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

async function syncUserSession(token) {
    const response = await fetch(AUTH_LOGIN_ENDPOINT, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
        },
    });

    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
        throw new Error(data.message || "Failed to sync user session");
    }

    return data;
}

export { registerUserInBackend, syncUserSession };
