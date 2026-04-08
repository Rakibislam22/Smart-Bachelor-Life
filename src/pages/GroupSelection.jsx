import React, { useState, use } from 'react';
import { useNavigate } from 'react-router';
import { AuthContext } from '../provider/AuthContext';
import Card from '../component/common/Card';
import ButtonPrimary from '../component/common/ButtonPrimary';
import ButtonSecondary from '../component/common/ButtonSecondary';
import Logo from '../component/common/Logo';
import ThemeToggle from '../component/common/ThemeToggle';
import { toast } from 'react-toastify';
import { ensureManagerGroupExists, joinAsMember, registerAsManager } from '../utils/groupApi';
import { registerUserInBackend, syncUserSession } from '../utils/authApi';

const getActionErrorMessage = (error, fallbackMessage) => {
    if (error?.message && typeof error.message === 'string' && error.message.trim()) {
        return error.message;
    }

    return fallbackMessage;
};

const GroupSelection = () => {
    const { isLight, user, setUserRole, setIsRoleSelectionCompleted } = use(AuthContext);
    const navigate = useNavigate();
    const [showJoinForm, setShowJoinForm] = useState(false);
    const [groupCode, setGroupCode] = useState('');
    const [isManagerSubmitting, setIsManagerSubmitting] = useState(false);
    const [isJoinSubmitting, setIsJoinSubmitting] = useState(false);

    const handleCreateGroup = async () => {
        if (!user) {
            toast.error('Please login first');
            navigate('/auth/login');
            return;
        }

        try {
            setIsManagerSubmitting(true);
            await registerUserInBackend(user);
            const token = await user.getIdToken();
            await registerAsManager(user.email, token);
            await ensureManagerGroupExists(
                {
                    title: `${user.displayName || 'Manager'} Group`,
                    address: 'Address not set',
                },
                token,
            );

            const session = await syncUserSession(token, user);
            const backendRole = session?.user?.role ? session.user.role.toLowerCase() : 'manager';

            setUserRole(backendRole);
            setIsRoleSelectionCompleted(true);
            toast.success('You are now registered as manager');
            navigate('/dashboard');
        } catch (error) {
            toast.error(getActionErrorMessage(error, 'We could not register as manager right now. Please try again.'));
        } finally {
            setIsManagerSubmitting(false);
        }
    };

    const handleJoinGroup = async (e) => {
        e.preventDefault();

        if (!groupCode.trim()) {
            toast.error('Please enter a group code');
            return;
        }

        if (!user) {
            toast.error('Please login first');
            navigate('/auth/login');
            return;
        }

        try {
            setIsJoinSubmitting(true);
            await registerUserInBackend(user);
            const token = await user.getIdToken();
            await joinAsMember(groupCode.trim(), token);

            const session = await syncUserSession(token, user);
            const backendRole = session?.user?.role ? session.user.role.toLowerCase() : 'user';

            setUserRole(backendRole);
            setIsRoleSelectionCompleted(true);
            toast.success('Joined group successfully');
            navigate('/dashboard');
        } catch (error) {
            toast.error(getActionErrorMessage(error, 'We could not join group right now. Please try again.'));
        } finally {
            setIsJoinSubmitting(false);
        }
    };

    return (
        <div className={`min-h-screen ${isLight ? 'bg-gray-100' : 'bg-gray-900'}`}>
            {/* Header */}
            <nav className={`navbar ${isLight ? 'bg-white shadow-md' : 'bg-gray-800'} px-6`}>
                <div className="flex justify-between items-center w-full">
                    <Logo />
                    <ThemeToggle />
                </div>
            </nav>

            {/* Main Content */}
            <div className="flex items-center justify-center min-h-[calc(100vh-80px)] p-4">
                <div className="w-full max-w-4xl">
                    <div className="text-center mb-8">
                        <h1 className={`text-4xl font-bold mb-4 ${isLight ? 'text-gray-800' : 'text-white'}`}>
                            Welcome to Smart Bachelor Life
                        </h1>
                        <p className={`text-lg ${isLight ? 'text-gray-600' : 'text-gray-300'}`}>
                            Choose how you want to get started
                        </p>
                    </div>

                    {!showJoinForm ? (
                        <div className="grid md:grid-cols-2 gap-6">
                            {/* Create Group Card */}
                            <Card>
                                <div className="p-8 text-center">
                                    <div className="mb-6">
                                        <svg
                                            className={`w-20 h-20 mx-auto ${isLight ? 'text-blue-600' : 'text-blue-400'}`}
                                            fill="none"
                                            stroke="currentColor"
                                            viewBox="0 0 24 24"
                                        >
                                            <path
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                strokeWidth={2}
                                                d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                                            />
                                        </svg>
                                    </div>
                                    <h2 className={`text-2xl font-bold mb-4 ${isLight ? 'text-gray-800' : 'text-white'}`}>
                                        Create a Group
                                    </h2>
                                    <p className={`mb-6 ${isLight ? 'text-gray-600' : 'text-gray-400'}`}>
                                        Start as a manager and create a new group for your bachelor life management
                                    </p>
                                    <ButtonPrimary onClick={handleCreateGroup} loading={isManagerSubmitting} loadingText="Creating...">
                                        Create Group as Manager
                                    </ButtonPrimary>
                                </div>
                            </Card>

                            {/* Join Group Card */}
                            <Card>
                                <div className="p-8 text-center">
                                    <div className="mb-6">
                                        <svg
                                            className={`w-20 h-20 mx-auto ${isLight ? 'text-green-600' : 'text-green-400'}`}
                                            fill="none"
                                            stroke="currentColor"
                                            viewBox="0 0 24 24"
                                        >
                                            <path
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                strokeWidth={2}
                                                d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z"
                                            />
                                        </svg>
                                    </div>
                                    <h2 className={`text-2xl font-bold mb-4 ${isLight ? 'text-gray-800' : 'text-white'}`}>
                                        Join a Group
                                    </h2>
                                    <p className={`mb-6 ${isLight ? 'text-gray-600' : 'text-gray-400'}`}>
                                        Join an existing group using a group code shared by your manager
                                    </p>
                                    <ButtonSecondary onClick={() => setShowJoinForm(true)} loading={isJoinSubmitting || isManagerSubmitting} loadingText="Opening...">
                                        Join Group by Code
                                    </ButtonSecondary>
                                </div>
                            </Card>
                        </div>
                    ) : (
                        <Card>
                            <div className="p-8 max-w-md mx-auto">
                                <button
                                    onClick={() => setShowJoinForm(false)}
                                    className={`mb-4 flex items-center ${isLight ? 'text-gray-600 hover:text-gray-800' : 'text-gray-400 hover:text-gray-200'}`}
                                >
                                    <svg
                                        className="w-5 h-5 mr-2"
                                        fill="none"
                                        stroke="currentColor"
                                        viewBox="0 0 24 24"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth={2}
                                            d="M15 19l-7-7 7-7"
                                        />
                                    </svg>
                                    Back
                                </button>

                                <h2 className={`text-2xl font-bold mb-6 text-center ${isLight ? 'text-gray-800' : 'text-white'}`}>
                                    Join a Group
                                </h2>

                                <form onSubmit={handleJoinGroup}>
                                    <div className="mb-6">
                                        <label
                                            htmlFor="groupCode"
                                            className={`block mb-2 text-sm font-medium ${isLight ? 'text-gray-700' : 'text-gray-300'}`}
                                        >
                                            Group Code
                                        </label>
                                        <input
                                            type="text"
                                            id="groupCode"
                                            value={groupCode}
                                            onChange={(e) => setGroupCode(e.target.value)}
                                            placeholder="Enter group code"
                                            className={`w-full px-4 py-3 rounded-lg border ${isLight
                                                ? 'border-gray-300 bg-white text-gray-900'
                                                : 'border-gray-600 bg-gray-700 text-white'
                                                } focus:outline-none focus:ring-2 focus:ring-blue-500`}
                                            required
                                        />
                                    </div>

                                    <ButtonPrimary type="submit" className="w-full" loading={isJoinSubmitting} loadingText="Joining...">
                                        Join Group
                                    </ButtonPrimary>
                                </form>
                            </div>
                        </Card>
                    )}
                </div>
            </div>
        </div>
    );
};

export default GroupSelection;
