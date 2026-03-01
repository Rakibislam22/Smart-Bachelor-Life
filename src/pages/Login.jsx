import React, { use, useState } from 'react';
import { Link, useNavigate } from 'react-router';
import { useForm } from 'react-hook-form';
import logoImg from '../assets/images/google.svg';
import { FaEye, FaEyeSlash } from 'react-icons/fa';
import { AuthContext } from '../provider/AuthContext';
import { toast } from 'react-toastify';

const Login = () => {
    const { google, userLogin, setUser } = use(AuthContext);
    const [eye, setEye] = useState(false);
    const navigate = useNavigate();

    const {
        register,
        handleSubmit,
        formState: { errors }
    } = useForm();

    const onSubmit = (data) => {
        userLogin(data.email, data.password).then(result => {
            setUser(result.user);
            toast.success('Login successful!');
            navigate("/group-selection");
        }).catch(error => {
            const errorMessage = error.message;
            toast.error(errorMessage);

        })
    };

    const handleGoogle = () => {
        google().then(result => {
            toast.success('Login successful!');
            setUser(result.user);
            navigate("/group-selection");
            // const newUser = result.user;

            // const userToDatabase = { name: newUser.displayName, email: newUser.email, photoURL: newUser.photoUrl, role: "Student" };
            // axiosIn.post('/users', userToDatabase).then();

        }).catch(error => {
            const errorMessage = error.message;
            toast.error(errorMessage);
        });
    }

    return (
        <div className='text-subtle bg-card p-8 rounded-3xl border-gray-100 shadow-md '>
            <h1 className='text-4xl font-semibold'>Welcome</h1>
            <p className='mt-1 text-sm md:text-base font-medium text-gray-500'>
                please enter your login credentials
            </p>

            <form onSubmit={handleSubmit(onSubmit)} className='mt-3'>
                <div className='pb-3'>
                    <label className='font-medium'>Email</label>
                    <input
                        {...register("email", { required: true })}
                        className="w-full border text-muted-foreground border-gray-100 rounded-xl p-2 mt-1 bg-transparent"
                        type="email"
                        placeholder='Enter your email'
                    />
                    {errors.email && (
                        <p className="text-sm text-red-500 mt-1">Email is required</p>
                    )}
                </div>

                <div className='relative'>
                    <label className='font-medium'>Password</label>
                    <input
                        {...register("password", { required: true })}
                        className="w-full border text-muted-foreground border-gray-100 rounded-xl p-2 mt-1 bg-transparent"
                        type={eye ? "text" : "password"}
                        placeholder='Enter your password'
                    />
                    {errors.password && (
                        <p className="text-sm text-red-500 mt-1">Password is required</p>
                    )}
                    <span onClick={() => setEye(!eye)} className='absolute right-3 top-10 cursor-pointer z-10'>
                        {
                            eye ? <FaEye /> : <FaEyeSlash />
                        }
                    </span>
                </div>

                <div className='my-4 flex justify-between items-center gap-15'>
                    <div className='ml-2'>
                        <input
                            {...register("remember")}
                            type="checkbox"
                            id='remember'
                        />
                        <label className='ml-2 font-medium' htmlFor='remember'>
                            Remember me
                        </label>
                    </div>
                    <button type="button" className='font-medium text-base text-violet-500'>
                        Forgot password
                    </button>
                </div>

                <div className='mt-8 flex flex-col gap-y-4'>
                    <button
                        type="submit"
                        className='active:scale-[.98] active:duration-75 hover:scale-[1.01] transition-all ease-in-out py-3 rounded-xl bg-violet-500 text-white font-bold'
                    >
                        Sign in
                    </button>

                    <button
                        type="button"
                        onClick={handleGoogle}
                        className='flex items-center justify-center active:scale-[.98] active:duration-75 hover:scale-[1.01] transition-all ease-in-out'
                    >
                        <img className='mr-2' src={logoImg} alt="google" width='24' />
                        Sign in with google
                    </button>

                    <Link
                        to="/auth/signup"
                        className='flex items-center justify-center hover:underline text-primary'
                    >
                        Create an account
                    </Link>
                </div>
            </form>
        </div>
    );
};

export default Login;
