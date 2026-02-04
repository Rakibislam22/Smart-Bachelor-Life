import React from 'react';
import Navbar from '../component/landingLayout/Navbar';
import { Outlet } from 'react-router';
import Footer from '../component/landingLayout/Footer';

const MainLayout = () => {
    return (
        <div>
            <div>
                <Navbar />
            </div>

            <Outlet />
            <Footer />
        </div>
    );
};

export default MainLayout;