import React, { useEffect, useState } from 'react';
import { AuthContext } from './AuthContext';
import { createUserWithEmailAndPassword, GoogleAuthProvider, onAuthStateChanged, signInWithEmailAndPassword, signInWithPopup, updateProfile } from 'firebase/auth';
import { auth } from '../firebase/firebase.init';

const AuthProvider = ({ children }) => {

    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [userRole, setUserRole] = useState(() => {
        // Check if role exists in localStorage
        return localStorage.getItem('userRole') || null;
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
        const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
            setUser(currentUser);
            setLoading(false);
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
        setUserRole
    }

    return (<AuthContext value={authData}>
        {children}
    </AuthContext>
    );
};

export default AuthProvider;