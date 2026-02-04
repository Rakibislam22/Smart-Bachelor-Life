import React from 'react';
import { Outlet } from 'react-router';
import Navbar from '../component/landingLayout/Navbar';
import Footer from '../component/landingLayout/Footer';

const AuthLayout = () => {
    return (
        <div>
            <div>
                <Navbar />
            </div>
            <div className='flex justify-center max-w-7xl mx-auto bg-background-100 w-full h-screen gap-4'>

                <div className="w-full flex items-center justify-center">
                    <Outlet></Outlet> {/*  its delivered login page when you go to /auth/login and signup page when go to /auth/signup */}

                </div>
                {/* <div className="hidden relative lg:flex-1 h-[90vh] w-1/3 rounded-2xl items-center justify-center bg-gradient-to-b from-lime-100 to-lime-300"> 
                    <div  className="active:scale-[.98] active:animate-ping active:duration-75  hover:scale-[1.1] transition-all ease-in-out w-60 h-60 bg-gradient-to-tr from-violet-500 to-pink-500 rounded-full animate-spin"></div>
                    <div className="w-full h-1/2 absolute bottom-0 rounded-2xl bg-white/10 backdrop-blur-lg"></div>
                </div> */}
            </div>

            <div>
                <Footer />
            </div>


        </div>
    );
};

export default AuthLayout;