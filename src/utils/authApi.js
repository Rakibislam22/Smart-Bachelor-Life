const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:3000";

const AUTH_REGISTER_ENDPOINT = `${API_BASE_URL}/api/auth/register`;

async function registerUserInBackend(user) {
    const payload = {
        firebaseUid: user.uid,
        email: user.email,
        displayName: user.displayName || "",
        photoURL: user.photoURL || "",
        provider: user.providerData?.[0]?.providerId || "PASSWORD",
        lastLoginAt: user.metadata?.lastSignInTime || new Date().toISOString(),
    };

    const response = await fetch(AUTH_REGISTER_ENDPOINT, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
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

export { registerUserInBackend };
