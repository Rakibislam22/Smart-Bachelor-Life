import React, { useEffect, useState } from 'react';
import { AuthContext } from './AuthContext';

const AuthProvider = ({ children }) => {

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


    const authData = {
        isLight, 
        setIsLight
    }

    return (<AuthContext value={authData}>
            {children}
        </AuthContext>
    );
};

export default AuthProvider;