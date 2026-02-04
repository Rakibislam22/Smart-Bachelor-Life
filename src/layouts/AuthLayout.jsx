import React from 'react';
import { Outlet } from 'react-router';

const AuthLayout = () => {
    return (
        <div>
            <Outlet></Outlet> {/*  its delivered login page when you go to /auth/login and signup page when /auth/signup */}
            {/* Ismail add here your 3rd component */}
        </div>
    );
};

export default AuthLayout;