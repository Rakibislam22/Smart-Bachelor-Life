import React from 'react';
import {Link} from 'react-router'
import logoImg from '../assets/images/google.svg'

const Login = () => {
    return (
        <div className='text-subtle bg-card px-10 py-20 rounded-3xl broder-2 border-gray-100 shadow-md '>
            <h1 className='text-5xl font-semibold'>Welcome</h1>
            <p className='font-medium text-gray-500'>please enter your login credentials</p>
            <div className='mt-8'>
                <div>
                    <label className='text-lg font-medium'>Email</label>
                    <input className="w-full border-2 text-muted-foreground border-gray-100 rounded-xl p-4 mt-1 bg-transparent"type="Email" placeholder='Enter your email'required/>
                </div>
                <div>
                    <label className='text-lg font-medium'>Password</label>
                    <input className="w-full border-2 text-muted-foreground border-gray-100 rounded-xl p-4 mt-1 bg-transparent"type="password" placeholder='Enter your password' required/>
                </div>
                <div className='mt-8 flex justify-between items-center gap-4'>
                    <div>
                        <input type="checkbox" id='remember'/>
                        <label className='ml-2 font-medium text-base' for='remember'>Remember for 30 days</label>
                    </div>
                    <button className='font-medium text-base text-violet-500'>Forgot password</button>
                </div>
                <div className='mt-8 flex flex-col gap-y-4'>
                    <button className='active:scale-[.98] active:duration-75 hover:scale-[1.01] transition-all ease-in-out py-3  rounded-xl bg-violet-500 text-white text-lg font-bold'>Sign in</button>
                    <button className='flex items-center justify-center active:scale-[.98] active:duration-75 hover:scale-[1.01] transition-all ease-in-out'>
                        <img className='mr-2' src={logoImg} alt="google" width='24'/>
                        Sign in with google 
                    </button>
                    <Link to = {"/auth/signup"} className='flex items-center justify-center'>
                    <button className=' active:scale-[.98] active:duration-75 hover:scale-[1.01] transition-all ease-in-out'>
                        Create an account
                    </button>
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default Login;