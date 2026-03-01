import React, { use, useState } from 'react';
import Logo from '../component/common/Logo';
import { Link } from 'react-router';
import { FcBarChart, FcCalendar, FcDebt } from 'react-icons/fc';
import { TbCoinTakaFilled } from 'react-icons/tb';
import { MdOutlineRestaurantMenu } from 'react-icons/md';
import { FaAmazonPay, FaCartPlus } from 'react-icons/fa';
import Avatar from '../component/Avatar';
import GroupChatIcon from '../component/GroupChatIcon';
import ThemeToggle from '../component/common/ThemeToggle';
import ButtonPrimary from '../component/common/ButtonPrimary';
import ButtonSecondary from '../component/common/ButtonSecondary';
import { AuthContext } from '../provider/AuthContext';

const DashboardLayout = () => {
    const { isLight, userRole, setUserRole } = use(AuthContext);
    const [showGroupModal, setShowGroupModal] = useState(false);
    const [showJoinForm, setShowJoinForm] = useState(false);
    const [groupCode, setGroupCode] = useState('');

    const handleCreateGroup = () => {
        setUserRole('manager');
        setShowGroupModal(false);
        setShowJoinForm(false);
    };

    const handleJoinGroup = (e) => {
        e.preventDefault();
        if (groupCode.trim()) {
            setUserRole('user');
            setShowGroupModal(false);
            setShowJoinForm(false);
            setGroupCode('');
        }
    };

    const handleOpenGroupModal = () => {
        setShowGroupModal(true);
        setShowJoinForm(false);
    };

    // Render different sidebar items based on role
    const renderSidebarItems = () => {
        if (userRole === 'manager') {
            return (
                <>
                    <li>
                        <Link to="/" className="is-drawer-close:tooltip is-drawer-close:tooltip-right" data-tip="Homepage">
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" strokeLinejoin="round" strokeLinecap="round" strokeWidth="2" fill="none" stroke="currentColor" className="my-1.5 inline-block size-6"><path d="M15 21v-8a1 1 0 0 0-1-1h-4a1 1 0 0 0-1 1v8"></path><path d="M3 10a2 2 0 0 1 .709-1.528l7-5.999a2 2 0 0 1 2.582 0l7 5.999A2 2 0 0 1 21 10v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path></svg>
                            <span className="is-drawer-close:hidden">Homepage</span>
                        </Link>
                    </li>
                    <li>
                        <Link className="is-drawer-close:tooltip is-drawer-close:tooltip-right" data-tip="Analytics">
                            <FcBarChart className="my-1.5 inline-block size-6" />
                            <span className="is-drawer-close:hidden">Analytics</span>
                        </Link>
                    </li>
                    <li>
                        <Link className="is-drawer-close:tooltip is-drawer-close:tooltip-right" data-tip="Manage Members">
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" className="my-1.5 inline-block size-6">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                            </svg>
                            <span className="is-drawer-close:hidden">Manage Members</span>
                        </Link>
                    </li>
                    <li>
                        <Link className="is-drawer-close:tooltip is-drawer-close:tooltip-right" data-tip="Meal Calendar">
                            <FcCalendar className="my-1.5 inline-block size-6" />
                            <span className="is-drawer-close:hidden">Meal Calendar</span>
                        </Link>
                    </li>
                    <li>
                        <Link className="is-drawer-close:tooltip is-drawer-close:tooltip-right" data-tip="Meal Expense">
                            <FcDebt className="my-1.5 inline-block size-6" />
                            <span className="is-drawer-close:hidden">Meal Expense</span>
                        </Link>
                    </li>
                    <li>
                        <Link className="is-drawer-close:tooltip is-drawer-close:tooltip-right" data-tip="Total Expense">
                            <TbCoinTakaFilled className="my-1.5 inline-block size-6" />
                            <span className="is-drawer-close:hidden">Total Expense</span>
                        </Link>
                    </li>
                    <li>
                        <Link className="is-drawer-close:tooltip is-drawer-close:tooltip-right" data-tip="Daily Menu">
                            <MdOutlineRestaurantMenu className="my-1.5 inline-block size-6" />
                            <span className="is-drawer-close:hidden">Daily Menu</span>
                        </Link>
                    </li>
                    <li>
                        <Link className="is-drawer-close:tooltip is-drawer-close:tooltip-right" data-tip="Bazar">
                            <FaCartPlus className="my-1.5 inline-block size-6" />
                            <span className="is-drawer-close:hidden">Bazar</span>
                        </Link>
                    </li>
                    <li>
                        <Link className="is-drawer-close:tooltip is-drawer-close:tooltip-right" data-tip="Payment & Receipt">
                            <FaAmazonPay className="my-1.5 inline-block size-6" />
                            <span className="is-drawer-close:hidden">Payment & Receipt</span>
                        </Link>
                    </li>
                </>
            );
        } else {
            // Regular user menu items
            return (
                <>
                    <li>
                        <Link to="/" className="is-drawer-close:tooltip is-drawer-close:tooltip-right" data-tip="Homepage">
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" strokeLinejoin="round" strokeLinecap="round" strokeWidth="2" fill="none" stroke="currentColor" className="my-1.5 inline-block size-6"><path d="M15 21v-8a1 1 0 0 0-1-1h-4a1 1 0 0 0-1 1v8"></path><path d="M3 10a2 2 0 0 1 .709-1.528l7-5.999a2 2 0 0 1 2.582 0l7 5.999A2 2 0 0 1 21 10v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path></svg>
                            <span className="is-drawer-close:hidden">Homepage</span>
                        </Link>
                    </li>
                    <li>
                        <Link className="is-drawer-close:tooltip is-drawer-close:tooltip-right" data-tip="My Dashboard">
                            <FcBarChart className="my-1.5 inline-block size-6" />
                            <span className="is-drawer-close:hidden">My Dashboard</span>
                        </Link>
                    </li>
                    <li>
                        <Link className="is-drawer-close:tooltip is-drawer-close:tooltip-right" data-tip="Meal Calendar">
                            <FcCalendar className="my-1.5 inline-block size-6" />
                            <span className="is-drawer-close:hidden">Meal Calendar</span>
                        </Link>
                    </li>
                    <li>
                        <Link className="is-drawer-close:tooltip is-drawer-close:tooltip-right" data-tip="My Expenses">
                            <FcDebt className="my-1.5 inline-block size-6" />
                            <span className="is-drawer-close:hidden">My Expenses</span>
                        </Link>
                    </li>
                    <li>
                        <Link className="is-drawer-close:tooltip is-drawer-close:tooltip-right" data-tip="Daily Menu">
                            <MdOutlineRestaurantMenu className="my-1.5 inline-block size-6" />
                            <span className="is-drawer-close:hidden">Daily Menu</span>
                        </Link>
                    </li>
                    <li>
                        <Link className="is-drawer-close:tooltip is-drawer-close:tooltip-right" data-tip="Make Payment">
                            <FaAmazonPay className="my-1.5 inline-block size-6" />
                            <span className="is-drawer-close:hidden">Make Payment</span>
                        </Link>
                    </li>
                </>
            );
        }
    };

    return (
        <div>
            <div className="drawer lg:drawer-open">
                <input id="my-drawer-4" type="checkbox" className="drawer-toggle" />
                <div className="drawer-content">
                    {/* Navbar */}
                    <nav className={`navbar w-full  ${isLight ? 'bg-[#eeeeee]' : 'bg-[#15191e]'}`}>
                        <label htmlFor="my-drawer-4" aria-label="open sidebar" className="btn btn-square btn-ghost">
                            {/* Sidebar toggle icon */}
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" strokeLinejoin="round" strokeLinecap="round" strokeWidth="2" fill="none" stroke="currentColor" className="my-1.5 inline-block size-6"><path d="M4 4m0 2a2 2 0 0 1 2 -2h12a2 2 0 0 1 2 2v12a2 2 0 0 1 -2 2h-12a2 2 0 0 1 -2 -2z"></path><path d="M9 4v16"></path><path d="M14 10l2 2l-2 2"></path></svg>
                        </label>
                        <div className='flex justify-between items-center w-full px-2'>
                            <div className="px-4 "> <Logo></Logo></div>

                            <div className='flex justify-center items-center gap-5'>
                                <ThemeToggle />
                                <GroupChatIcon />
                                <Avatar />
                            </div>

                        </div>
                    </nav>
                    {/* Page content here */}
                    <div className="p-2 sm:p-4">
                        {userRole === 'manager' ? (
                            <div>
                                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-0 mb-4">
                                    <h2 className={`text-xl sm:text-2xl font-bold ${isLight ? 'text-gray-800' : 'text-white'}`}>
                                        Manager Dashboard
                                    </h2>
                                    <button
                                        onClick={handleOpenGroupModal}
                                        className={`px-3 sm:px-4 py-2 text-sm sm:text-base rounded-lg ${isLight ? 'bg-gray-200 hover:bg-gray-300 text-gray-800' : 'bg-gray-700 hover:bg-gray-600 text-white'} transition-colors`}
                                    >
                                        Change Group
                                    </button>
                                </div>
                                <div className={`p-3 sm:p-4 rounded-lg ${isLight ? 'bg-blue-50 border-blue-200' : 'bg-blue-900 border-blue-700'} border`}>
                                    <p className={`text-sm sm:text-base ${isLight ? 'text-gray-700' : 'text-gray-200'}`}>
                                        Welcome, Manager! You have full control over group management, expenses, and all other features.
                                    </p>
                                </div>
                            </div>
                        ) : (
                            <div>
                                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-0 mb-4">
                                    <h2 className={`text-xl sm:text-2xl font-bold ${isLight ? 'text-gray-800' : 'text-white'}`}>
                                        User Dashboard
                                    </h2>
                                    <button
                                        onClick={handleOpenGroupModal}
                                        className={`px-3 sm:px-4 py-2 text-sm sm:text-base rounded-lg ${isLight ? 'bg-gray-200 hover:bg-gray-300 text-gray-800' : 'bg-gray-700 hover:bg-gray-600 text-white'} transition-colors`}
                                    >
                                        Change Group
                                    </button>
                                </div>
                                <div className={`p-3 sm:p-4 rounded-lg ${isLight ? 'bg-green-50 border-green-200' : 'bg-green-900 border-green-700'} border`}>
                                    <p className={`text-sm sm:text-base ${isLight ? 'text-gray-700' : 'text-gray-200'}`}>
                                        Welcome! You can view your expenses, meals, and make payments here.
                                    </p>
                                </div>
                            </div>
                        )}

                        {/* Group Management Modal */}
                        {showGroupModal && (
                            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-2 sm:p-4">
                                <div className={`${isLight ? 'bg-white' : 'bg-gray-800'} rounded-2xl w-full max-w-4xl max-h-[95vh] overflow-y-auto shadow-2xl`}>
                                    <div className="p-4 sm:p-6">
                                        <div className="flex justify-between items-center mb-6">
                                            <h2 className={`text-xl sm:text-3xl font-bold ${isLight ? 'text-gray-800' : 'text-white'}`}>
                                                Group Management
                                            </h2>
                                            <button
                                                onClick={() => {
                                                    setShowGroupModal(false);
                                                    setShowJoinForm(false);
                                                }}
                                                className={`${isLight ? 'text-gray-600 hover:text-gray-800' : 'text-gray-400 hover:text-gray-200'} text-2xl shrink-0 ml-2`}
                                            >
                                                ✕
                                            </button>
                                        </div>

                                        {!showJoinForm ? (
                                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                                                {/* Create Group Option */}
                                                <div className={`p-4 sm:p-8 rounded-xl border-2 ${isLight ? 'border-blue-200 bg-blue-50 hover:border-blue-400' : 'border-blue-700 bg-blue-900 hover:border-blue-500'} transition-all text-center`}>
                                                    <div className="mb-4 sm:mb-6">
                                                        <svg
                                                            className={`w-12 h-12 sm:w-20 sm:h-20 mx-auto ${isLight ? 'text-blue-600' : 'text-blue-400'}`}
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
                                                    <h3 className={`text-lg sm:text-2xl font-bold mb-3 sm:mb-4 ${isLight ? 'text-gray-800' : 'text-white'}`}>
                                                        Create a Group
                                                    </h3>
                                                    <p className={`mb-4 sm:mb-6 text-sm sm:text-base ${isLight ? 'text-gray-600' : 'text-gray-300'}`}>
                                                        Start as a manager and create a new group for your bachelor life management
                                                    </p>
                                                    <ButtonPrimary onClick={handleCreateGroup}>
                                                        Create Group as Manager
                                                    </ButtonPrimary>
                                                </div>

                                                {/* Join Group Option */}
                                                <div className={`p-4 sm:p-8 rounded-xl border-2 ${isLight ? 'border-green-200 bg-green-50 hover:border-green-400' : 'border-green-700 bg-green-900 hover:border-green-500'} transition-all text-center`}>
                                                    <div className="mb-4 sm:mb-6">
                                                        <svg
                                                            className={`w-12 h-12 sm:w-20 sm:h-20 mx-auto ${isLight ? 'text-green-600' : 'text-green-400'}`}
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
                                                    <h3 className={`text-lg sm:text-2xl font-bold mb-3 sm:mb-4 ${isLight ? 'text-gray-800' : 'text-white'}`}>
                                                        Join a Group
                                                    </h3>
                                                    <p className={`mb-4 sm:mb-6 text-sm sm:text-base ${isLight ? 'text-gray-600' : 'text-gray-300'}`}>
                                                        Join an existing group using a group code shared by your manager
                                                    </p>
                                                    <ButtonSecondary onClick={() => setShowJoinForm(true)}>
                                                        Join Group by Code
                                                    </ButtonSecondary>
                                                </div>
                                            </div>
                                        ) : (
                                            <div className="w-full max-w-md mx-auto px-2 sm:px-0">
                                                <button
                                                    onClick={() => setShowJoinForm(false)}
                                                    className={`mb-6 flex items-center text-sm sm:text-base ${isLight ? 'text-gray-600 hover:text-gray-800' : 'text-gray-400 hover:text-gray-200'}`}
                                                >
                                                    <svg
                                                        className="w-4 h-4 sm:w-5 sm:h-5 mr-2"
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

                                                <h3 className={`text-lg sm:text-2xl font-bold mb-6 text-center ${isLight ? 'text-gray-800' : 'text-white'}`}>
                                                    Join a Group
                                                </h3>

                                                <form onSubmit={handleJoinGroup}>
                                                    <div className="mb-6">
                                                        <label
                                                            htmlFor="groupCodeDashboard"
                                                            className={`block mb-2 text-sm font-medium ${isLight ? 'text-gray-700' : 'text-gray-300'}`}
                                                        >
                                                            Group Code
                                                        </label>
                                                        <input
                                                            type="text"
                                                            id="groupCodeDashboard"
                                                            value={groupCode}
                                                            onChange={(e) => setGroupCode(e.target.value)}
                                                            placeholder="Enter group code"
                                                            className={`w-full px-4 py-3 rounded-lg border ${isLight
                                                                ? 'border-gray-300 bg-white text-gray-900'
                                                                : 'border-gray-600 bg-gray-700 text-white'
                                                                } focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm sm:text-base`}
                                                            required
                                                            autoFocus
                                                        />
                                                    </div>

                                                    <ButtonPrimary type="submit" className="w-full">
                                                        Join Group
                                                    </ButtonPrimary>
                                                </form>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                <div className="drawer-side is-drawer-close:overflow-visible">
                    <label htmlFor="my-drawer-4" aria-label="close sidebar" className="drawer-overlay"></label>
                    <div className={`${isLight ? 'bg-[#e5e7eb]' : 'bg-[#191e24]'} flex min-h-full flex-col items-start is-drawer-close:w-16 is-drawer-open:w-64`}>
                        {/* Sidebar content here */}
                        <ul className="menu w-full grow">
                            {renderSidebarItems()}
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DashboardLayout;