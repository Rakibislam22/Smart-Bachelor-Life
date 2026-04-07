import React, { use, useState } from 'react';
import { useForm, useWatch } from 'react-hook-form';
import logoImg from '../assets/images/google.svg';
import { Link, useNavigate } from 'react-router';
import { FaEye, FaEyeSlash } from 'react-icons/fa';
import { AuthContext } from '../provider/AuthContext';
import { toast } from 'react-toastify';
import ButtonPrimary from '../component/common/ButtonPrimary';
import { registerUserInBackend } from '../utils/authApi';

const getSignupErrorMessage = (error) => {
    if (error?.code === 'auth/email-already-in-use') {
        return 'This email is already in use. Please login instead.';
    }

    return 'Something went wrong. Please try again.';
};

const Signup = () => {

    const { createUser, setUser, google, forUpdateProfile } = use(AuthContext);

    const {
        register,
        handleSubmit,
        control,
        formState: { errors }
    } = useForm();

    const password = useWatch({ control, name: 'password' });

    const [eye, setEye] = useState(false);
    const [cEye, setCeye] = useState(false);
    const [showTip, setShowTip] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const navigate = useNavigate();

    const onSubmit = (data) => {
        setIsSubmitting(true);

        const fullName = `${data.firstName} ${data.lastName}`;

        createUser(data.email, data.password)
            .then(async (result) => {
                const newUser = result.user;
                setUser(newUser);

                const updatedFirebaseUser = await forUpdateProfile(fullName, data?.photoUrl);
                await registerUserInBackend(updatedFirebaseUser || newUser);
                toast.success('Register successful!');
                navigate('/group-selection');
            })
            .catch((error) => {
                toast.error(getSignupErrorMessage(error));
            })
            .finally(() => {
                setIsSubmitting(false);
            });

    };


    const handleGoogle = () => {
        setIsSubmitting(true);
        google().then(async result => {
            toast.success('Login successful!');
            setUser(result.user);
            navigate("/group-selection");

        }).catch(() => {
            toast.error('Something went wrong. Please try again.');
        }).finally(() => {
            setIsSubmitting(false);
        });
    }

    return (
        <div className='bg-card p-4 sm:p-6 md:p-8 rounded-2xl sm:rounded-3xl shadow-md w-full max-w-md'>
            <h1 className='text-2xl sm:text-3xl md:text-4xl font-semibold'>Sign up</h1>
            <p className='font-medium text-xs sm:text-sm text-gray-500'>Please enter the required details</p>

            <form onSubmit={handleSubmit(onSubmit)} className='mt-4 sm:mt-6 space-y-3 sm:space-y-4 relative'>
                <div className='flex flex-col sm:flex-row sm:justify-between sm:items-start gap-3 sm:gap-4'>
                    <div className='w-full sm:flex-1'>
                        <label className='text-sm sm:text-base font-medium'>First Name</label>
                        <input
                            {...register("firstName", { required: true })}
                            className="w-full border text-muted-foreground border-gray-100 rounded-lg sm:rounded-xl p-2.5 sm:p-3 mt-1 bg-transparent text-sm sm:text-base focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                            type="text"
                            placeholder='Enter your first name'
                        />
                        {errors.firstName && (
                            <p className="text-xs sm:text-sm text-red-500 mt-1">First name is required</p>
                        )}
                    </div>

                    <div className='w-full sm:flex-1'>
                        <label className='text-sm sm:text-base font-medium'>Last Name</label>
                        <input
                            {...register("lastName", { required: true })}
                            className="w-full border text-muted-foreground border-gray-100 rounded-lg sm:rounded-xl p-2.5 sm:p-3 mt-1 bg-transparent text-sm sm:text-base focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                            type="text"
                            placeholder='Enter your last name'
                        />
                        {errors.lastName && (
                            <p className="text-xs sm:text-sm text-red-500 mt-1">Last name is required</p>
                        )}
                    </div>
                </div>

                <div>
                    <label className='text-sm sm:text-base font-medium'>Email</label>
                    <input
                        {...register("email", { required: true })}
                        className="w-full border text-muted-foreground border-gray-100 rounded-lg sm:rounded-xl p-2.5 sm:p-3 mt-1 bg-transparent text-sm sm:text-base focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                        type="email"
                        placeholder='Enter your email'
                    />
                    {errors.email && (
                        <p className="text-xs sm:text-sm text-red-500 mt-1">Email is required</p>
                    )}

                </div>

                {showTip && (
                    <div className="absolute left-0 right-0 top-4 z-20 mt-2 mx-2 sm:mx-0 bg-gray-900 text-white text-xs sm:text-sm rounded-lg sm:rounded-xl p-3 sm:p-4 shadow-xl">
                        <p className="font-semibold mb-1.5 sm:mb-2">Password must contain:</p>
                        <ul className="list-disc list-inside space-y-0.5 sm:space-y-1 text-gray-300">
                            <li>At least 6 characters</li>
                            <li>One uppercase letter (A-Z)</li>
                            <li>One lowercase letter (a-z)</li>
                            <li>One number (0-9)</li>
                            <li>One special character (!@#$%^&*)</li>
                        </ul>
                    </div>
                )}

                <div className='relative'>
                    <label className='text-sm sm:text-base font-medium'>Password</label>
                    <input
                        {...register("password", { required: true, pattern: /^(?=.*[A-Z])(?=.*[a-z])(?=.*\d)(?=.*[^a-zA-Z0-9]).{6,}$/ })}
                        className="w-full border text-muted-foreground border-gray-100 rounded-lg sm:rounded-xl p-2.5 sm:p-3 mt-1 bg-transparent text-sm sm:text-base focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                        type={eye ? "text" : "password"}
                        placeholder='Enter your password'
                        onFocus={() => setShowTip(true)}
                        onBlur={() => setShowTip(false)}
                    />
                    <span onClick={() => setEye(!eye)} className='absolute right-3 top-9 sm:top-10 cursor-pointer z-10 text-gray-500 hover:text-gray-700 p-1'>
                        {
                            eye ? <FaEye className='w-4 h-4 sm:w-5 sm:h-5' /> : <FaEyeSlash className='w-4 h-4 sm:w-5 sm:h-5' />
                        }
                    </span>



                    {errors.password?.type == "required" && (
                        <p className="text-xs sm:text-sm text-red-500 mt-1">Password is required</p>
                    )}
                    {
                        errors.password?.type === "pattern" && <p className="text-red-500 text-xs sm:text-sm mt-1">Password must be at least 6 characters and include uppercase, lowercase, number, and special character.</p>
                    }
                </div>

                <div className='relative'>
                    <label className='text-sm sm:text-base font-medium'>Confirm Password</label>
                    <input
                        {...register("confirmPassword", {
                            required: true,
                            validate: value => value === password
                        })}
                        className="w-full border text-muted-foreground border-gray-100 rounded-lg sm:rounded-xl p-2.5 sm:p-3 mt-1 bg-transparent text-sm sm:text-base focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                        type={cEye ? "text" : "password"}
                        placeholder='Confirm password'
                    />
                    <span onClick={() => setCeye(!cEye)} className='absolute right-3 top-9 sm:top-10 cursor-pointer z-10 text-gray-500 hover:text-gray-700 p-1'>
                        {
                            cEye ? <FaEye className='w-4 h-4 sm:w-5 sm:h-5' /> : <FaEyeSlash className='w-4 h-4 sm:w-5 sm:h-5' />
                        }
                    </span>
                    {errors.confirmPassword?.type === "required" && (
                        <p className="text-xs sm:text-sm text-red-500 mt-1">Confirm password is required</p>
                    )}
                    {errors.confirmPassword?.type === "validate" && (
                        <p className="text-xs sm:text-sm text-red-500 mt-1">Passwords do not match</p>
                    )}
                </div>

                <div className='mt-6 sm:mt-8 flex flex-col gap-y-3 sm:gap-y-4'>
                    <ButtonPrimary
                        type="submit"
                        className="w-full"
                        loading={isSubmitting}
                        loadingText="Creating account..."
                    >
                        Sign Up
                    </ButtonPrimary>

                    <button
                        type="button"
                        onClick={handleGoogle}
                        disabled={isSubmitting}
                        className='flex items-center justify-center active:scale-[.98] active:duration-75 hover:scale-[1.01] transition-all ease-in-out py-2.5 sm:py-3 border border-gray-300 dark:border-gray-700 rounded-lg sm:rounded-xl bg-white dark:bg-transparent hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-200 text-sm sm:text-base font-medium'
                    >
                        <img className='mr-2 w-5 h-5 sm:w-6 sm:h-6' src={logoImg} alt="google" />
                        Sign in with Google
                    </button>

                    <Link to={"/auth/login"} className='flex items-center justify-center text-xs sm:text-sm font-medium mt-2'>
                        Already have an account? <span className='hover:underline pl-1 sm:pl-2 text-primary'> Login</span>
                    </Link>
                </div>
            </form>
        </div>
    );
};

export default Signup;
