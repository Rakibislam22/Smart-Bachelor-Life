import React, { useEffect, useState } from 'react';
import { AuthContext } from './AuthContext';
import { createUserWithEmailAndPassword, GoogleAuthProvider, onAuthStateChanged, signInWithEmailAndPassword, signInWithPopup, updateProfile } from 'firebase/auth';
import { auth } from '../firebase/firebase.init';
import { registerUserInBackend, syncUserSession } from '../utils/authApi';
import { toast } from 'react-toastify';

const AuthProvider = ({ children }) => {

    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [userRole, setUserRole] = useState(() => {
        // Check if role exists in localStorage
        return localStorage.getItem('userRole') || null;
    });
    const [isRoleSelectionCompleted, setIsRoleSelectionCompleted] = useState(false);
    const [currentGroup, setCurrentGroup] = useState(() => {
        if (typeof window !== 'undefined') {
            const storedGroup = localStorage.getItem('currentGroup');
            return storedGroup ? JSON.parse(storedGroup) : null;
        }

        return null;
    });
    const provider = new GoogleAuthProvider();

    // for theme toggle
    const [isLight, setIsLight] = useState(() => {
        if (typeof window !== "undefined") {
            return localStorage.getItem("theme") === "light";
        }
        return false; // Default to dark
    });

    // 2. Sync DOM and Storage whenever state changes
    useEffect(() => {
        if (isLight) {
            document.documentElement.classList.add("light");
            localStorage.setItem("theme", "light");
        } else {
            document.documentElement.classList.remove("light");
            localStorage.setItem("theme", "dark");
        }
    }, [isLight]); // <--- Dependency ensures this runs when isLight changes

    // Sync userRole with localStorage
    useEffect(() => {
        if (userRole) {
            localStorage.setItem('userRole', userRole);
        } else {
            localStorage.removeItem('userRole');
        }
    }, [userRole]);

    useEffect(() => {
        if (currentGroup) {
            localStorage.setItem('currentGroup', JSON.stringify(currentGroup));
        } else {
            localStorage.removeItem('currentGroup');
        }
    }, [currentGroup]);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
            setUser(currentUser);

            if (!currentUser) {
                setUserRole(null);
                setIsRoleSelectionCompleted(false);
                setLoading(false);
                return;
            }

            try {
                await registerUserInBackend(currentUser);
                const token = await currentUser.getIdToken();
                const session = await syncUserSession(token);

                const backendRole = session?.user?.role ? session.user.role.toLowerCase() : null;
                const hasCurrentGroup = Boolean(session?.currentGroup);
                setUserRole(hasCurrentGroup ? backendRole : null);
                setIsRoleSelectionCompleted(Boolean(session?.user?.roleSelectionCompleted));
                setCurrentGroup(session?.currentGroup || null);
            } catch (error) {
                // Avoid stale local role to prevent unauthorized role-only API calls.
                setUserRole(null);
                setIsRoleSelectionCompleted(false);
                setCurrentGroup(null);
                console.error('Auth sync failed:', error);
                toast.error(error?.message || 'Failed to sync account with server');
            } finally {
                setLoading(false);
            }
        })

        return () => {
            unsubscribe();
        }
    }, [])

    const createUser = (email, password) => {
        return createUserWithEmailAndPassword(auth, email, password);
    }

    const userLogin = (email, password) => {
        return signInWithEmailAndPassword(auth, email, password);
    }

    const google = () => {
        return signInWithPopup(auth, provider);
    }

    const forUpdateProfile = (Dname, photo) => {
        return updateProfile(auth.currentUser, {
            displayName: Dname, photoURL: photo
        }).then(() => {
            setUser({ ...auth.currentUser });
        });
    }


    const authData = {
        isLight,
        setIsLight,
        user,
        setUser,
        createUser,
        userLogin,
        google,
        forUpdateProfile,
        loading,
        setLoading,
        userRole,
        setUserRole,
        isRoleSelectionCompleted,
        setIsRoleSelectionCompleted,
        currentGroup,
        setCurrentGroup,
    }

    return (<AuthContext value={authData}>
        {children}
    </AuthContext>
    );
};

export default AuthProvider;