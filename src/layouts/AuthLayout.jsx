import React from 'react';
import { Outlet } from 'react-router';
import Navbar from '../component/layout/Navbar';

const AuthLayout = () => {
    return (
        <div>
            <div>
                <Navbar />
            </div>
            <div>
                <Outlet></Outlet> {/*  its delivered login page when you go to /auth/login and signup page when go to /auth/signup */}
                
                {/* Ismail add here your 3rd component */}

            </div>

            
        </div>
    );
};

export default AuthLayout;