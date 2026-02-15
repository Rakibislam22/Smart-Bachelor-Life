import React from 'react';
import logoImg from '../assets/images/google.svg';

const Signup = () => {
    return (
        <div className='bg-card p-8 rounded-3xl shadow-md'>
            <h1 className='text-3xl font-semibold'>Sign up</h1>
            <p className='font-medium text-gray-500'>Please enter the required details</p>
            <div className='mt-6 space-y-2'>
                <div className='flex justify-between items-center'>
                    <div className='mr-4'>
                        <label className='text-lg font-medium'>First Name</label>
                        <input className="w-full border text-muted-foreground border-gray-100 rounded-xl p-3 mt-1 bg-transparent" type="text" placeholder='Enter your first name' required />
                    </div>
                    <div>
                        <label className='text-lg font-medium'>Last Name</label>
                        <input className="w-full border text-muted-foreground border-gray-100 rounded-xl p-3 mt-1 bg-transparent" type="text" placeholder='Enter your last name' required />
                    </div>
                </div>

                <div>
                    <label className='text-lg font-medium'>Email</label>
                    <input className="w-full border text-muted-foreground border-gray-100 rounded-xl p-3 mt-1 bg-transparent" type="Email" placeholder='Enter your email' required />
                </div>
                <div>
                    <label className='text-lg font-medium'>Password</label>
                    <input className="w-full border text-muted-foreground border-gray-100 rounded-xl p-3 mt-1 bg-transparent" type="password" placeholder='Enter your password' required />
                </div>
                <div>
                    <label className='text-lg font-medium'>Confirm Password</label>
                    <input className="w-full border text-muted-foreground border-gray-100 rounded-xl p-3 mt-1 bg-transparent" type="password" placeholder='Confirm password' required />
                </div>

                <div className='mt-8 flex flex-col gap-y-4'>
                    <button className='active:scale-[.98] active:duration-75 hover:scale-[1.01] transition-all ease-in-out py-3  rounded-xl bg-primary text-white text-lg font-bold'>Sign Up</button>
                    <button className='flex items-center justify-center active:scale-[.98] active:duration-75 hover:scale-[1.01] transition-all ease-in-out'>
                        <img className='mr-2' src={logoImg} alt="google" width='24' />
                        Sign in with google
                    </button>

                </div>
            </div>
        </div>
    );
};

export default Signup;