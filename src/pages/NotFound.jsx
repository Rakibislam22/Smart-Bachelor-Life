import React, { use } from 'react';
import { useNavigate } from 'react-router';
import { motion } from 'framer-motion';
import { AuthContext } from '../provider/AuthContext';
import ThemeToggle from '../component/common/ThemeToggle';
import ButtonPrimary from '../component/common/ButtonPrimary';
import ButtonSecondary from '../component/common/ButtonSecondary';

const NotFound = () => {
    const { isLight, user } = use(AuthContext);
    const navigate = useNavigate();

    const handleGoHome = () => {
        navigate(user ? '/dashboard' : '/');
    };

    const handleGoBack = () => {
        navigate(-1);
    };

    return (
        <div
            style={{
                backgroundImage: isLight
                    ? 'radial-gradient(circle at top, rgba(59,130,246,0.18), transparent 32%), linear-gradient(180deg, #f8fafc 0%, #eef2ff 100%)'
                    : 'radial-gradient(circle at top, rgba(34,197,94,0.14), transparent 30%), radial-gradient(circle at bottom right, rgba(59,130,246,0.16), transparent 28%), linear-gradient(180deg, #020617 0%, #0f172a 100%)',
            }}
            className={`relative min-h-screen overflow-hidden ${isLight ? 'text-slate-900' : 'text-slate-50'}`}
        >
            <div
                className="absolute inset-0 opacity-40"
                style={{
                    backgroundImage:
                        'linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px)',
                    backgroundSize: '48px 48px',
                }}
            />
            <div className="absolute -left-24 top-24 size-72 rounded-full bg-primary/10 blur-3xl" />
            <div className="absolute -right-16 bottom-12 size-80 rounded-full bg-highlight/20 blur-3xl" />

            <div className="relative z-10 flex min-h-screen flex-col">
                <div className="flex items-center justify-end p-4 sm:p-6 lg:p-8">
                    <div className={`${isLight ? 'rounded-2xl bg-white/70 shadow-lg shadow-slate-200/60 backdrop-blur-xl' : 'rounded-2xl bg-slate-900/50 shadow-lg shadow-black/30 backdrop-blur-xl'} p-1`}>
                        <ThemeToggle />
                    </div>
                </div>

                <main className="flex flex-1 items-center justify-center px-4 py-10 sm:px-6 lg:px-8">
                    <motion.section
                        initial={{ opacity: 0, y: 18, scale: 0.98 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        transition={{ duration: 0.55, ease: 'easeOut' }}
                        className={`${isLight ? 'bg-white/75 border-white/60 shadow-slate-200/70' : 'bg-slate-950/55 border-white/10 shadow-black/30'} w-full max-w-3xl rounded-4xl border p-6 shadow-2xl backdrop-blur-2xl sm:p-8 lg:p-12`}
                    >
                        <div className="grid gap-10 lg:grid-cols-[1.15fr_0.85fr] lg:items-center">
                            <div>
                                <div className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium ${isLight ? 'bg-slate-900 text-white' : 'bg-white text-slate-900'}`}>
                                    <span className="size-2 rounded-full bg-emerald-400" />
                                    Page not found
                                </div>

                                <h1 className="mt-6 text-5xl font-black tracking-tight sm:text-6xl lg:text-7xl">
                                    404
                                </h1>

                                <p className={`mt-4 max-w-xl text-base leading-7 sm:text-lg ${isLight ? 'text-slate-600' : 'text-slate-300'}`}>
                                    The page you are looking for does not exist, may have moved, or the URL was typed incorrectly.
                                </p>

                                <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                                    <ButtonPrimary onClick={handleGoHome} className="w-full sm:w-auto">
                                        {user ? 'Go to Dashboard' : 'Go to Home'}
                                    </ButtonPrimary>
                                    <ButtonSecondary onClick={handleGoBack} className="w-full sm:w-auto">
                                        Go Back
                                    </ButtonSecondary>
                                </div>

                                <p className={`mt-6 text-sm ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
                                    If you think this is a mistake, try checking the URL or return to the previous page.
                                </p>
                            </div>

                            <div className="relative flex items-center justify-center">
                                <div className="absolute inset-0 mx-auto h-72 w-72 rounded-full bg-linear-to-tr from-primary/20 via-highlight/20 to-transparent blur-2xl" />
                                <div className={`${isLight ? 'bg-slate-950 text-white' : 'bg-white text-slate-950'} relative flex h-72 w-72 items-center justify-center rounded-4xl border border-white/10 p-6 shadow-2xl`}>
                                    <div className="text-center">
                                        <div className="text-8xl font-black tracking-tight sm:text-9xl">404</div>
                                        <div className={`mt-4 text-sm font-medium uppercase tracking-[0.35em] ${isLight ? 'text-slate-300' : 'text-slate-500'}`}>
                                            Lost in space
                                        </div>
                                    </div>

                                    <motion.span
                                        animate={{ y: [0, -8, 0] }}
                                        transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
                                        className="absolute left-8 top-8 size-5 rounded-full bg-primary shadow-[0_0_30px_rgba(59,130,246,0.8)]"
                                    />
                                    <motion.span
                                        animate={{ y: [0, 10, 0] }}
                                        transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}
                                        className="absolute right-10 top-14 size-3 rounded-full bg-highlight shadow-[0_0_24px_rgba(34,197,94,0.8)]"
                                    />
                                    <motion.span
                                        animate={{ x: [0, 8, 0] }}
                                        transition={{ duration: 4.5, repeat: Infinity, ease: 'easeInOut' }}
                                        className="absolute bottom-10 left-14 size-4 rounded-full bg-blue-400 shadow-[0_0_24px_rgba(96,165,250,0.8)]"
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

export default NotFound;