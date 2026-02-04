import React from 'react';
import Navbar from '../component/layout/Navbar';
import { Outlet } from 'react-router';

const MainLayout = () => {
    return (
        <div>
            <div>
               <Navbar/> 
            </div>
            
            <Outlet/>
            {/* footer here... */}
        </div>
    );
};

export default MainLayout;