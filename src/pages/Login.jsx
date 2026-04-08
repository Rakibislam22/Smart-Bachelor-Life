import React, { use, useState } from 'react';
import { Link, useNavigate } from 'react-router';
import { useForm } from 'react-hook-form';
import logoImg from '../assets/images/google.svg';
import { FaEye, FaEyeSlash } from 'react-icons/fa';
import { AuthContext } from '../provider/AuthContext';
import { toast } from 'react-toastify';
import ButtonPrimary from '../component/common/ButtonPrimary';
import { registerUserInBackend, syncUserSession } from '../utils/authApi';

const getLoginErrorMessage = (error) => {
    const code = error?.code;

    if (code === 'auth/invalid-credential' || code === 'auth/wrong-password' || code === 'auth/user-not-found' || code === 'auth/invalid-email') {
        return 'Invalid email or password.';
    }

    if (code === 'auth/too-many-requests') {
        return 'Too many failed attempts. Please try again later.';
    }

    return 'Something went wrong. Please try again.';
};

const getGoogleLoginErrorMessage = (error) => {
    if (error?.code === 'auth/popup-closed-by-user') {
        return 'Google sign-in was cancelled.';
    }

    if (error?.code === 'auth/popup-blocked') {
        return 'Popup was blocked by browser. Please allow popups and try again.';
    }

    return 'Google sign-in failed. Please try again.';
};

const Login = () => {
    const { google, userLogin, setUser, isLight, user } = use(AuthContext);
    const [eye, setEye] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const navigate = useNavigate();

    if (user) {
        navigate("/dashboard");
    }


    const getPostLoginPath = async (firebaseUser) => {
        const token = await firebaseUser.getIdToken();
        const session = await syncUserSession(token, firebaseUser);
        const roleSelectionCompleted = Boolean(session?.user?.roleSelectionCompleted);

        return roleSelectionCompleted ? "/dashboard" : "/group-selection";
    };

    const {
        register,
        handleSubmit,
        formState: { errors }
    } = useForm();

    const onSubmit = (data) => {
        setIsSubmitting(true);
        userLogin(data.email, data.password).then(async result => {
            setUser(result.user);
            await registerUserInBackend(result.user);
            const postLoginPath = await getPostLoginPath(result.user);
            toast.success('Login successful!');
            navigate(postLoginPath);
        }).catch((error) => {
            toast.error(getLoginErrorMessage(error));
        }).finally(() => {
            setIsSubmitting(false);
        });
    };

    const handleGoogle = () => {
        setIsSubmitting(true);
        google().then(async result => {
            toast.success('Login successful!');
            setUser(result.user);
            await registerUserInBackend(result.user);
            const postLoginPath = await getPostLoginPath(result.user);
            navigate(postLoginPath);

        }).catch((error) => {
            toast.error(getGoogleLoginErrorMessage(error));
        }).finally(() => {
            setIsSubmitting(false);
        });
    }

    return (
        <div className='text-subtle bg-card p-4 sm:p-6 md:p-8 rounded-2xl sm:rounded-3xl border-gray-100 shadow-md w-full max-w-md'>
            <h1 className='text-2xl sm:text-3xl md:text-4xl font-semibold'>Welcome</h1>
            <p className='mt-1 text-xs sm:text-sm md:text-base font-medium text-gray-500'>
                please enter your login credentials
            </p>

            <form onSubmit={handleSubmit(onSubmit)} className='mt-4 sm:mt-5'>
                <div className='pb-3 sm:pb-4'>
                    <label className='font-medium text-sm sm:text-base'>Email</label>
                    <input
                        {...register("email", { required: true })}
                        className="w-full border text-muted-foreground border-gray-100 rounded-lg sm:rounded-xl p-2.5 sm:p-3 mt-1 bg-transparent text-sm sm:text-base focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent transition-all"
                        type="email"
                        placeholder='Enter your email'
                    />
                    {errors.email && (
                        <p className="text-sm text-red-500 mt-1">Email is required</p>
                    )}
                </div>

                <div className='relative'>
                    <label className='font-medium text-sm sm:text-base'>Password</label>
                    <input
                        {...register("password", { required: true })}
                        className="w-full border text-muted-foreground border-gray-100 rounded-lg sm:rounded-xl p-2.5 sm:p-3 mt-1 bg-transparent text-sm sm:text-base focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent transition-all"
                        type={eye ? "text" : "password"}
                        placeholder='Enter your password'
                    />
                    {errors.password && (
                        <p className="text-xs sm:text-sm text-red-500 mt-1">Password is required</p>
                    )}
                    <span onClick={() => setEye(!eye)} className='absolute right-3 top-9 sm:top-10 cursor-pointer z-10 text-gray-500 hover:text-gray-700 p-1'>
                        {
                            eye ? <FaEye className='w-4 h-4 sm:w-5 sm:h-5' /> : <FaEyeSlash className='w-4 h-4 sm:w-5 sm:h-5' />
                        }
                    </span>
                </div>

                <div className='my-3 sm:my-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 sm:gap-4'>
                    <div className='flex items-center'>
                        <input
                            {...register("remember")}
                            type="checkbox"
                            id='remember'
                            className='w-4 h-4 sm:w-5 sm:h-5 cursor-pointer'
                        />
                        <label className='ml-2 font-medium text-xs sm:text-sm cursor-pointer' htmlFor='remember'>
                            Remember me
                        </label>
                    </div>
                    <button type="button" className='font-medium text-xs sm:text-sm text-violet-500 hover:text-violet-600 hover:underline transition-colors'>
                        Forgot password?
                    </button>
                </div>

                <div className='mt-6 sm:mt-8 flex flex-col gap-y-3 sm:gap-y-4'>
                    <ButtonPrimary
                        type="submit"
                        className="w-full"
                        loading={isSubmitting}
                        loadingText="Signing in..."
                    >
                        Sign in
                    </ButtonPrimary>

                    <button
                        type="button"
                        onClick={handleGoogle}
                        disabled={isSubmitting}
                        className={`flex items-center justify-center active:scale-[.98] active:duration-75 hover:scale-[1.01] transition-all ease-in-out py-2.5 sm:py-3 border rounded-lg sm:rounded-xl text-sm sm:text-base font-medium border-gray-300 ${isLight
                            ? ' bg-white hover:bg-base text-gray-700'
                            : 'border-gray-700 bg-transparent hover:bg-prim text-gray-200'
                            }`}
                    >
                        <img className='mr-2 w-5 h-5 sm:w-6 sm:h-6' src={logoImg} alt="google" />
                        Sign in with Google
                    </button>

                    <Link
                        to="/auth/signup"
                        className='flex items-center justify-center hover:underline text-primary text-sm sm:text-base font-medium mt-2'
                    >
                        Create an account
                    </Link>
                </div>
            </form>
        </div>
    );
};

export default Login;
