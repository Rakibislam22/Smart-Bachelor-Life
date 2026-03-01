import React, { use, useState } from 'react';
import { useForm } from 'react-hook-form';
import logoImg from '../assets/images/google.svg';
import { Link, useNavigate } from 'react-router';
import { FaEye, FaEyeSlash } from 'react-icons/fa';
import { AuthContext } from '../provider/AuthContext';
import { toast } from 'react-toastify';

const Signup = () => {

    const { createUser, setUser, google, forUpdateProfile } = use(AuthContext);

    const {
        register,
        handleSubmit,
        watch,
        formState: { errors }
    } = useForm();

    const password = watch("password");

    const [eye, setEye] = useState(false);
    const [cEye, setCeye] = useState(false);
    const [showTip, setShowTip] = useState(false);
    const navigate = useNavigate();

    const onSubmit = (data) => {

        const fullName = `${data.firstName} ${data.lastName}`;

        createUser(data.email, data.password)
            .then((result) => {
                const newUser = result.user;
                setUser(newUser);
                toast.success('Register successful!');

                // const userToDatabase = { name: data.name, email: data.email, photoURL: data?.photoUrl, role: "Student" };

                // axiosIn.post('/users', userToDatabase).then();

                forUpdateProfile(fullName, data?.photoUrl)
                    .then(() => {
                        navigate('/group-selection');
                    })
                    .catch((err) => toast.error(err.message));
            })
            .catch((error) => {
                toast.error(error.message);
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
        <div className='bg-card p-8 rounded-3xl shadow-md'>
            <h1 className='text-3xl font-semibold'>Sign up</h1>
            <p className='font-medium text-gray-500'>Please enter the required details</p>

            <form onSubmit={handleSubmit(onSubmit)} className='mt-6 space-y-2 relative'>
                <div className='flex justify-between items-center'>
                    <div className='mr-4'>
                        <label className='text-lg font-medium'>First Name</label>
                        <input
                            {...register("firstName", { required: true })}
                            className="w-full border text-muted-foreground border-gray-100 rounded-xl p-3 mt-1 bg-transparent"
                            type="text"
                            placeholder='Enter your first name'
                        />
                        {errors.firstName && (
                            <p className="text-sm text-red-500 mt-1">First name is required</p>
                        )}
                    </div>

                    <div>
                        <label className='text-lg font-medium'>Last Name</label>
                        <input
                            {...register("lastName", { required: true })}
                            className="w-full border text-muted-foreground border-gray-100 rounded-xl p-3 mt-1 bg-transparent"
                            type="text"
                            placeholder='Enter your last name'
                        />
                        {errors.lastName && (
                            <p className="text-sm text-red-500 mt-1">Last name is required</p>
                        )}
                    </div>
                </div>

                <div>
                    <label className='text-lg font-medium'>Email</label>
                    <input
                        {...register("email", { required: true })}
                        className="w-full border text-muted-foreground border-gray-100 rounded-xl p-3 mt-1 bg-transparent"
                        type="email"
                        placeholder='Enter your email'
                    />
                    {errors.email && (
                        <p className="text-sm text-red-500 mt-1">Email is required</p>
                    )}

                </div>

                {showTip && (
                    <div className="absolute top-4 z-20 mt-2 w-full bg-gray-900 text-white text-sm rounded-xl p-3 shadow-lg">
                        <p className="font-semibold mb-1">Password must contain:</p>
                        <ul className="list-disc list-inside space-y-1 text-gray-300">
                            <li>At least 6 characters</li>
                            <li>One uppercase letter (A-Z)</li>
                            <li>One lowercase letter (a-z)</li>
                            <li>One number (0-9)</li>
                            <li>One special character (!@#$%^&*)</li>
                        </ul>
                    </div>
                )}

                <div className='relative'>
                    <label className='text-lg font-medium'>Password</label>
                    <input
                        {...register("password", { required: true, pattern: /^(?=.*[A-Z])(?=.*[a-z])(?=.*\d)(?=.*[^a-zA-Z0-9]).{6,}$/ })}
                        className="w-full border text-muted-foreground border-gray-100 rounded-xl p-3 mt-1 bg-transparent"
                        type={eye ? "text" : "password"}
                        placeholder='Enter your password'
                        onFocus={() => setShowTip(true)}
                        onBlur={() => setShowTip(false)}
                    />
                    <span onClick={() => setEye(!eye)} className='absolute right-3 top-12 cursor-pointer z-10'>
                        {
                            eye ? <FaEye /> : <FaEyeSlash />
                        }
                    </span>



                    {errors.password?.type == "required" && (
                        <p className="text-sm text-red-500 mt-1">Password is required</p>
                    )}
                    {
                        errors.password?.type === "pattern" && <p className=" text-red-500 text-sm mt-1">Password must be at least 6 characters and include uppercase, lowercase, number, and special character.</p>
                    }
                </div>

                <div className='relative'>
                    <label className='text-lg font-medium'>Confirm Password</label>
                    <input
                        {...register("confirmPassword", {
                            required: true,
                            validate: value => value === password
                        })}
                        className="w-full border text-muted-foreground border-gray-100 rounded-xl p-3 mt-1 bg-transparent"
                        type={cEye ? "text" : "password"}
                        placeholder='Confirm password'
                    />
                    <span onClick={() => setCeye(!cEye)} className='absolute right-3 top-12 cursor-pointer z-10'>
                        {
                            cEye ? <FaEye /> : <FaEyeSlash />
                        }
                    </span>
                    {errors.confirmPassword?.type === "required" && (
                        <p className="text-sm text-red-500 mt-1">Confirm password is required</p>
                    )}
                    {errors.confirmPassword?.type === "validate" && (
                        <p className="text-sm text-red-500 mt-1">Confirm passwords and Password did not match</p>
                    )}
                </div>

                <div className='mt-8 flex flex-col gap-y-4'>
                    <button
                        type="submit"
                        className='active:scale-[.98] active:duration-75 hover:scale-[1.01] transition-all ease-in-out py-3 rounded-xl bg-primary text-white text-lg font-bold'
                    >
                        Sign Up
                    </button>

                    <button
                        type="button"
                        onClick={handleGoogle}
                        className='flex items-center justify-center active:scale-[.98] active:duration-75 hover:scale-[1.01] transition-all ease-in-out'
                    >
                        <img className='mr-2' src={logoImg} alt="google" width='24' />
                        Sign in with google
                    </button>

                    <Link to={"/auth/login"} className='flex items-center justify-center'>
                        Already have an account? <span className='hover:underline pl-2 text-primary'> Login</span>
                    </Link>
                </div>
            </form>
        </div>
    );
};

export default Signup;
