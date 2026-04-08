import React, { use } from 'react';
import { useNavigate } from 'react-router';
import { motion } from 'framer-motion';
import { AuthContext } from '../provider/AuthContext';
import ThemeToggle from '../component/common/ThemeToggle';
import ButtonPrimary from '../component/common/ButtonPrimary';
import ButtonSecondary from '../component/common/ButtonSecondary';

const UnauthorizedAccess = () => {
    const { isLight, user } = use(AuthContext);
    const navigate = useNavigate();

    const handleGoHome = () => {
        navigate(user ? '/dashboard' : '/auth/login');
    };

    const handleGoBack = () => {
        navigate(-1);
    };

    return (
        <div className='overflow-hidden relative'>
            <div
                className="absolute inset-0 opacity-35"
                style={{
                    backgroundImage:
                        'linear-gradient(rgba(255,255,255,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.04) 1px, transparent 1px)',
                    backgroundSize: '56px 56px',
                }}
            />
            <div className="absolute -left-24 top-20 size-72 rounded-full bg-amber-400/15 blur-3xl" />
            <div className="absolute -right-10 bottom-6 size-80 rounded-full bg-red-500/15 blur-3xl" />

            <div className="relative z-10 flex flex-col">

                <main className="flex flex-1 items-center justify-center px-4 py-10 sm:px-6 lg:px-8">
                    <motion.section
                        initial={{ opacity: 0, y: 18, scale: 0.98 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        transition={{ duration: 0.55, ease: 'easeOut' }}
                        className={`${isLight ? 'bg-white/80 border-white/70 shadow-amber-100/60' : 'bg-slate-950/60 border-white/10 shadow-black/30'} w-full max-w-4xl rounded-4xl border p-6 shadow-2xl backdrop-blur-2xl sm:p-8 lg:p-12`}
                    >
                        <div className="grid gap-10 lg:grid-cols-[1.05fr_0.95fr] lg:items-center">
                            <div>
                                <div className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium ${isLight ? 'bg-amber-500 text-white' : 'bg-red-500 text-white'}`}>
                                    <span className="size-2 rounded-full bg-white" />
                                    Unauthorized access
                                </div>

                                <h1 className="mt-6 text-4xl font-black tracking-tight sm:text-5xl lg:text-6xl">
                                    403
                                </h1>

                                <p className={`mt-4 max-w-xl text-base leading-7 sm:text-lg ${isLight ? 'text-slate-600' : 'text-slate-300'}`}>
                                    You do not have permission to manage members. This area is reserved for manager roles only.
                                </p>

                                <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                                    <ButtonPrimary onClick={handleGoHome} className="w-full sm:w-auto">
                                        {user ? 'Go to Dashboard' : 'Go to Login'}
                                    </ButtonPrimary>
                                    <ButtonSecondary onClick={handleGoBack} className="w-full sm:w-auto">
                                        Go Back
                                    </ButtonSecondary>
                                </div>

                                <p className={`mt-6 text-sm ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
                                    If you believe this is a mistake, ask your manager to grant access or switch to the manager account.
                                </p>
                            </div>

                            <div className="relative flex items-center justify-center max-sm:hidden">
                                <div className="absolute inset-0 mx-auto h-72 w-72 rounded-full bg-linear-to-tr from-amber-400/25 via-red-400/20 to-transparent blur-2xl" />
                                <div className={`${isLight ? 'bg-slate-950 text-white' : 'bg-white text-slate-950'} relative flex h-72 w-72 items-center justify-center rounded-4xl border border-white/10 p-6 shadow-2xl`}>
                                    <div className="text-center">
                                        <div className="text-7xl font-black tracking-tight sm:text-8xl">403</div>
                                        <div className={`mt-4 text-sm font-medium uppercase tracking-[0.35em] ${isLight ? 'text-slate-300' : 'text-slate-500'}`}>
                                            Access denied
                                        </div>
                                    </div>

                                    <motion.span
                                        animate={{ y: [0, -8, 0] }}
                                        transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
                                        className="absolute left-8 top-8 size-5 rounded-full bg-amber-400 shadow-[0_0_30px_rgba(245,158,11,0.8)]"
                                    />
                                    <motion.span
                                        animate={{ y: [0, 10, 0] }}
                                        transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}
                                        className="absolute right-10 top-14 size-3 rounded-full bg-red-400 shadow-[0_0_24px_rgba(248,113,113,0.8)]"
                                    />
                                    <motion.span
                                        animate={{ x: [0, 8, 0] }}
                                        transition={{ duration: 4.5, repeat: Infinity, ease: 'easeInOut' }}
                                        className="absolute bottom-10 left-14 size-4 rounded-full bg-orange-400 shadow-[0_0_24px_rgba(251,146,60,0.8)]"
                                    />
                                </div>
                            </div>
                        </div>
                    </motion.section>
                </main>
            </div>
        </div>
    );
};

export default UnauthorizedAccess;