import React, { use, useEffect, useRef, useState } from 'react';
import Logo from '../component/common/Logo';
import { Link, Outlet, useLocation, useNavigate } from 'react-router';
import { TbCoinTakaFilled } from 'react-icons/tb';
import { MdOutlineRestaurantMenu } from 'react-icons/md';
import { FaAmazonPay, FaCartPlus } from 'react-icons/fa';
import { FiCheck } from 'react-icons/fi';
import Avatar from '../component/Avatar';
import GroupChatIcon from '../component/GroupChatIcon';
import ThemeToggle from '../component/common/ThemeToggle';
import ButtonPrimary from '../component/common/ButtonPrimary';
import ButtonSecondary from '../component/common/ButtonSecondary';
import { AuthContext } from '../provider/AuthContext';
import { toast } from 'react-toastify';
import { ensureManagerGroupExists, joinAsMember, leaveGroup, registerAsManager, updateGroupTitle } from '../utils/groupApi';
import { registerUserInBackend, syncUserSession } from '../utils/authApi';

const getActionErrorMessage = (error, fallbackMessage) => {
    if (error?.message && typeof error.message === 'string' && error.message.trim()) {
        return error.message;
    }

    return fallbackMessage;
};

const DashboardLayout = () => {
    const { isLight, user, loading, userRole, setUserRole, isRoleSelectionCompleted, setIsRoleSelectionCompleted, currentGroup, setCurrentGroup } = use(AuthContext);
    const [showGroupModal, setShowGroupModal] = useState(false);
    const [showJoinForm, setShowJoinForm] = useState(false);
    const [groupCode, setGroupCode] = useState('');
    const [groupTitleInput, setGroupTitleInput] = useState('');
    const [isManagerSubmitting, setIsManagerSubmitting] = useState(false);
    const [isJoinSubmitting, setIsJoinSubmitting] = useState(false);
    const [isSavingGroupTitle, setIsSavingGroupTitle] = useState(false);
    const [isLeavingGroup, setIsLeavingGroup] = useState(false);
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [isSidebarHovered, setIsSidebarHovered] = useState(false);
    const [isNavbarVisible, setIsNavbarVisible] = useState(true);
    const sidebarHoverOpenTimer = useRef(null);
    const sidebarHoverCloseTimer = useRef(null);
    const lastScrollY = useRef(0);
    const location = useLocation();
    const navigate = useNavigate();
    const normalizedRole = userRole ? userRole.toLowerCase() : null;

    useEffect(() => {
        setGroupTitleInput(currentGroup?.title || '');
    }, [currentGroup?.title]);

    const isLargeScreen = () => {
        return typeof window !== 'undefined' && window.matchMedia('(min-width: 1024px)').matches;
    };

    useEffect(() => {
        return () => {
            clearSidebarHoverTimers();
        };
    }, []);

    useEffect(() => {
        const handleScroll = () => {
            const currentScrollY = window.scrollY;

            if (currentScrollY <= 16) {
                setIsNavbarVisible(true);
                lastScrollY.current = currentScrollY;
                return;
            }

            if (currentScrollY > lastScrollY.current + 4) {
                setIsNavbarVisible(false);
            } else if (currentScrollY < lastScrollY.current - 4) {
                setIsNavbarVisible(true);
            }

            lastScrollY.current = currentScrollY;
        };

        window.addEventListener('scroll', handleScroll, { passive: true });

        return () => {
            window.removeEventListener('scroll', handleScroll);
        };
    }, []);

    useEffect(() => {
        if (loading || !user?.uid) {
            return;
        }

        if (isRoleSelectionCompleted || normalizedRole) {
            setShowGroupModal(false);
            return;
        }

        if (!normalizedRole) {
            setShowGroupModal(true);
            setShowJoinForm(false);
        }
    }, [loading, user?.uid, normalizedRole, isRoleSelectionCompleted]);

    const clearSidebarHoverTimers = () => {
        if (sidebarHoverOpenTimer.current) {
            clearTimeout(sidebarHoverOpenTimer.current);
            sidebarHoverOpenTimer.current = null;
        }

        if (sidebarHoverCloseTimer.current) {
            clearTimeout(sidebarHoverCloseTimer.current);
            sidebarHoverCloseTimer.current = null;
        }
    };

    const handleSidebarMouseEnter = () => {
        if (!isLargeScreen()) {
            return;
        }

        if (sidebarHoverCloseTimer.current) {
            clearTimeout(sidebarHoverCloseTimer.current);
            sidebarHoverCloseTimer.current = null;
        }

        if (isSidebarHovered) {
            return;
        }

        sidebarHoverOpenTimer.current = setTimeout(() => {
            setIsSidebarHovered(true);
            sidebarHoverOpenTimer.current = null;
        }, 120);
    };

    const handleSidebarMouseLeave = () => {
        if (!isLargeScreen()) {
            return;
        }

        if (sidebarHoverOpenTimer.current) {
            clearTimeout(sidebarHoverOpenTimer.current);
            sidebarHoverOpenTimer.current = null;
        }

        sidebarHoverCloseTimer.current = setTimeout(() => {
            setIsSidebarHovered(false);
            sidebarHoverCloseTimer.current = null;
        }, 240);
    };

    const handleCreateGroup = async () => {
        if (!user) {
            toast.error('Please login first');
            return;
        }

        try {
            setIsManagerSubmitting(true);
            await registerUserInBackend(user);
            const token = await user.getIdToken();
            await registerAsManager(user.email, token);
            const groupResponse = await ensureManagerGroupExists(
                {
                    title: `${user.displayName || 'Manager'} Group`,
                    address: 'Address not set',
                },
                token,
            );

            const session = await syncUserSession(token, user);
            const backendRole = session?.user?.role ? session.user.role.toLowerCase() : 'manager';

            setUserRole(backendRole);
            setCurrentGroup(groupResponse?.group || groupResponse?.currentGroup || null);
            setIsRoleSelectionCompleted(true);
            setShowGroupModal(false);
            setShowJoinForm(false);
            toast.success('Manager setup completed successfully');
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
            return;
        }

        try {
            setIsJoinSubmitting(true);
            await registerUserInBackend(user);
            const token = await user.getIdToken();
            const joinResponse = await joinAsMember(groupCode.trim(), token);

            const session = await syncUserSession(token, user);
            const backendRole = session?.user?.role ? session.user.role.toLowerCase() : 'user';

            setUserRole(backendRole);
            setCurrentGroup(joinResponse?.group || session?.currentGroup || null);
            setIsRoleSelectionCompleted(true);
            setShowGroupModal(false);
            setShowJoinForm(false);
            setGroupCode('');
            toast.success('Joined group successfully');
        } catch (error) {
            toast.error(getActionErrorMessage(error, 'We could not join group right now. Please try again.'));
        } finally {
            setIsJoinSubmitting(false);
        }
    };

    const handleOpenGroupModal = () => {
        setShowGroupModal(true);
        setShowJoinForm(false);
    };

    const handleSaveGroupTitle = async () => {
        if (!user || normalizedRole !== 'manager') {
            return;
        }

        if (!groupTitleInput.trim()) {
            toast.error('Please enter a group name');
            return;
        }

        try {
            setIsSavingGroupTitle(true);
            const token = await user.getIdToken();
            const data = await updateGroupTitle(groupTitleInput.trim(), token);
            setCurrentGroup(data?.group || currentGroup);
            toast.success('Group name updated successfully');
        } catch (error) {
            toast.error(getActionErrorMessage(error, 'We could not update group name right now. Please try again.'));
        } finally {
            setIsSavingGroupTitle(false);
        }
    };

    const handleLeaveGroup = async () => {
        if (!user || !currentGroup) {
            return;
        }

        try {
            setIsLeavingGroup(true);
            const token = await user.getIdToken();
            await leaveGroup(token);
            setCurrentGroup(null);
            setUserRole(null);
            setIsRoleSelectionCompleted(false);
            setShowGroupModal(false);
            toast.success('You left the group successfully');
            navigate('/group-selection');
        } catch (error) {
            toast.error(getActionErrorMessage(error, 'We could not leave the group right now. Please try again.'));
        } finally {
            setIsLeavingGroup(false);
        }
    };

    // Render different sidebar items based on role
    const renderSidebarItems = () => {
        if (userRole === 'manager') {
            return (
                <>
                    <li>
                        <Link to="/dashboard" className="">
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" strokeLinejoin="round" strokeLinecap="round" strokeWidth="2" fill="none" stroke="currentColor" className="my-1.5 inline-block size-6"><path d="M3 3v18h18"></path><path d="M18 17V9"></path><path d="M13 17V5"></path><path d="M8 17v-3"></path></svg>
                            <span className="inline-block whitespace-nowrap transition-opacity duration-150 ease-linear is-drawer-open:opacity-100 is-drawer-close:opacity-0">Analytics</span>
                        </Link>
                    </li>
                    <li>
                        <Link to="/dashboard/members" className="">
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" className="my-1.5 inline-block size-6">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                            </svg>
                            <span className="inline-block whitespace-nowrap transition-opacity duration-150 ease-linear is-drawer-open:opacity-100 is-drawer-close:opacity-0">Manage Members</span>
                        </Link>
                    </li>
                    <li>
                        <Link to="/dashboard/meal" className="">
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" strokeLinejoin="round" strokeLinecap="round" strokeWidth="2" fill="none" stroke="currentColor" className="my-1.5 inline-block size-6"><path d="M8 2v4"></path><path d="M16 2v4"></path><path d="M3 10h18"></path><path d="M19 4H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2z"></path></svg>
                            <span className="inline-block whitespace-nowrap transition-opacity duration-150 ease-linear is-drawer-open:opacity-100 is-drawer-close:opacity-0">Meal Calendar</span>
                        </Link>
                    </li>
                    <li>
                        <Link to="/dashboard/meal-expense" className="">
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" strokeLinejoin="round" strokeLinecap="round" strokeWidth="2" fill="none" stroke="currentColor" className="my-1.5 inline-block size-6"><path d="M16 8V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v3"></path><path d="M12 11v10"></path><path d="M8 11h8a2 2 0 0 1 2 2v7a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2z"></path></svg>
                            <span className="inline-block whitespace-nowrap transition-opacity duration-150 ease-linear is-drawer-open:opacity-100 is-drawer-close:opacity-0">My Expense</span>
                        </Link>
                    </li>
                    <li>
                        <Link to="/dashboard/total-expense" className="">
                            <TbCoinTakaFilled className="my-1.5 inline-block size-6" />
                            <span className="inline-block whitespace-nowrap transition-opacity duration-150 ease-linear is-drawer-open:opacity-100 is-drawer-close:opacity-0">Total Expense</span>
                        </Link>
                    </li>
                    <li>
                        <Link to="/dashboard/menu" className="">
                            <MdOutlineRestaurantMenu className="my-1.5 inline-block size-6" />
                            <span className="inline-block whitespace-nowrap transition-opacity duration-150 ease-linear is-drawer-open:opacity-100 is-drawer-close:opacity-0">Daily Menu</span>
                        </Link>
                    </li>
                    <li>
                        <Link to="/dashboard/bazar" className="">
                            <FaCartPlus className="my-1.5 inline-block size-6" />
                            <span className="inline-block whitespace-nowrap transition-opacity duration-150 ease-linear is-drawer-open:opacity-100 is-drawer-close:opacity-0">Bazar</span>
                        </Link>
                    </li>
                    <li>
                        <Link to="/dashboard/payment" className="">
                            <FaAmazonPay className="my-1.5 inline-block size-6" />
                            <span className="inline-block whitespace-nowrap transition-opacity duration-150 ease-linear is-drawer-open:opacity-100 is-drawer-close:opacity-0">Payment & Receipt</span>
                        </Link>
                    </li>
                    <li>
                        <Link to="/dashboard/iot" className="">
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="my-1.5 inline-block size-6">
                                <path d="M4 14h16" />
                                <path d="M6 18h12" />
                                <path d="M8 10h8" />
                                <path d="M12 3v7" />
                                <path d="M10 21h4" />
                                <path d="M7 5h10a2 2 0 0 1 2 2v11a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2z" />
                            </svg>
                            <span className="inline-block whitespace-nowrap transition-opacity duration-150 ease-linear is-drawer-open:opacity-100 is-drawer-close:opacity-0">IoT Dashboard</span>
                        </Link>
                    </li>
                    <li>
                        <button onClick={handleOpenGroupModal} className={` min-w-18 h-full px-2 ${isLight ? 'text-gray-600' : 'text-gray-400'}`}>
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" strokeLinejoin="round" strokeLinecap="round" strokeWidth="2" fill="none" stroke="currentColor" className="size-6"><path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"></path><circle cx="12" cy="12" r="3"></circle></svg>
                            <span className="inline-block whitespace-nowrap transition-opacity duration-150 ease-linear is-drawer-open:opacity-100 is-drawer-close:opacity-0">Settings</span>
                        </button>
                    </li>
                </>
            );
        } else {
            // Regular user menu items
            return (
                <>
                    <li>
                        <Link to="/dashboard" className="">
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" strokeLinejoin="round" strokeLinecap="round" strokeWidth="2" fill="none" stroke="currentColor" className="my-1.5 inline-block size-6"><path d="M3 3v18h18"></path><path d="M18 17V9"></path><path d="M13 17V5"></path><path d="M8 17v-3"></path></svg>
                            <span className="inline-block whitespace-nowrap transition-opacity duration-150 ease-linear is-drawer-open:opacity-100 is-drawer-close:opacity-0">My Dashboard</span>
                        </Link>
                    </li>
                    <li>
                        <Link to="/dashboard/meal" className="">
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" strokeLinejoin="round" strokeLinecap="round" strokeWidth="2" fill="none" stroke="currentColor" className="my-1.5 inline-block size-6"><path d="M8 2v4"></path><path d="M16 2v4"></path><path d="M3 10h18"></path><path d="M19 4H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2z"></path></svg>
                            <span className="inline-block whitespace-nowrap transition-opacity duration-150 ease-linear is-drawer-open:opacity-100 is-drawer-close:opacity-0">Meal Calendar</span>
                        </Link>
                    </li>
                    <li>
                        <Link to="/dashboard/meal-expense" className="">
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" strokeLinejoin="round" strokeLinecap="round" strokeWidth="2" fill="none" stroke="currentColor" className="my-1.5 inline-block size-6"><path d="M16 8V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v3"></path><path d="M12 11v10"></path><path d="M8 11h8a2 2 0 0 1 2 2v7a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2z"></path></svg>
                            <span className="inline-block whitespace-nowrap transition-opacity duration-150 ease-linear is-drawer-open:opacity-100 is-drawer-close:opacity-0">My Expenses</span>
                        </Link>
                    </li>
                    <li>
                        <Link to="/dashboard/menu" className="">
                            <MdOutlineRestaurantMenu className="my-1.5 inline-block size-6" />
                            <span className="inline-block whitespace-nowrap transition-opacity duration-150 ease-linear is-drawer-open:opacity-100 is-drawer-close:opacity-0">Daily Menu</span>
                        </Link>
                    </li>
                    <li>
                        <Link to="/dashboard/bazar" className="">
                            <FaCartPlus className="my-1.5 inline-block size-6" />
                            <span className="inline-block whitespace-nowrap transition-opacity duration-150 ease-linear is-drawer-open:opacity-100 is-drawer-close:opacity-0">Bazar</span>
                        </Link>
                    </li>
                    <li>
                        <Link to="/dashboard/payment" className="">
                            <FaAmazonPay className="my-1.5 inline-block size-6" />
                            <span className="inline-block whitespace-nowrap transition-opacity duration-150 ease-linear is-drawer-open:opacity-100 is-drawer-close:opacity-0">Make Payment</span>
                        </Link>
                    </li>
                    <li>
                        <Link to="/dashboard/iot" className="">
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="my-1.5 inline-block size-6">
                                <path d="M4 14h16" />
                                <path d="M6 18h12" />
                                <path d="M8 10h8" />
                                <path d="M12 3v7" />
                                <path d="M10 21h4" />
                                <path d="M7 5h10a2 2 0 0 1 2 2v11a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2z" />
                            </svg>
                            <span className="inline-block whitespace-nowrap transition-opacity duration-150 ease-linear is-drawer-open:opacity-100 is-drawer-close:opacity-0">IoT Dashboard</span>
                        </Link>
                    </li>
                    <li>
                        <button onClick={handleOpenGroupModal} className={` min-w-18 h-full px-2 ${isLight ? 'text-gray-600' : 'text-gray-400'}`}>
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" strokeLinejoin="round" strokeLinecap="round" strokeWidth="2" fill="none" stroke="currentColor" className="size-6"><path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"></path><circle cx="12" cy="12" r="3"></circle></svg>
                            <span className="inline-block whitespace-nowrap transition-opacity duration-150 ease-linear is-drawer-open:opacity-100 is-drawer-close:opacity-0">Settings</span>
                        </button>
                    </li>
                </>
            );
        }
    };

    return (
        <div>
            <div className="drawer lg:drawer-open">
                <input
                    id="my-drawer-4"
                    type="checkbox"
                    className="drawer-toggle"
                    checked={isSidebarOpen || isSidebarHovered}
                    onChange={(e) => setIsSidebarOpen(e.target.checked)}
                />
                <div className="drawer-content relative">
                    {/* Navbar */}
                    <nav className={`sticky top-0 z-40 navbar w-full transition-transform duration-300 ${isNavbarVisible ? 'translate-y-0' : '-translate-y-full'} ${isLight ? 'bg-[#eeeeee]' : 'bg-[#15191e]'}`}>
                        <label htmlFor="my-drawer-4" aria-label="open sidebar" className="hidden md:inline-flex lg:hidden btn btn-square btn-ghost">
                            {/* Sidebar toggle icon */}
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" strokeLinejoin="round" strokeLinecap="round" strokeWidth="2" fill="none" stroke="currentColor" className="my-1.5 inline-block size-6"><path d="M4 4m0 2a2 2 0 0 1 2 -2h12a2 2 0 0 1 2 2v12a2 2 0 0 1 -2 2h-12a2 2 0 0 1 -2 -2z"></path><path d="M9 4v16"></path><path d="M14 10l2 2l-2 2"></path></svg>
                        </label>
                        <div className='flex justify-between items-center w-full px-2'>
                            <div className=" "> <Logo></Logo></div>

                            <div className='flex justify-center items-center gap-5'>
                                <ThemeToggle />
                                <GroupChatIcon />
                                <Avatar />
                            </div>

                        </div>
                    </nav>
                    {/* Page content here */}
                    <div className="p-2 sm:p-4 pb-20 lg:pb-4">{/* Extra bottom padding for mobile nav */}
                        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-0 mb-4">

                        </div>

                        {currentGroup && (
                            <div className={`mb-4 rounded-2xl border px-4 py-3 sm:px-5 sm:py-4 ${isLight ? 'bg-white border-gray-200' : 'bg-gray-800 border-gray-700'}`}>
                                <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
                                    <div>
                                        <p className={`text-xs uppercase tracking-wide ${isLight ? 'text-gray-500' : 'text-gray-400'}`}>Current Group</p>
                                        <h3 className={`text-lg sm:text-xl font-semibold ${isLight ? 'text-gray-900' : 'text-white'}`}>{currentGroup.title}</h3>
                                        <p className={`text-sm ${isLight ? 'text-gray-600' : 'text-gray-300'}`}>{currentGroup.address || 'No address set'}</p>
                                    </div>
                                    <div className={`text-sm ${isLight ? 'text-gray-600' : 'text-gray-300'}`}>
                                        <p>Members: <span className="font-semibold">{currentGroup.memberCount ?? 0}</span></p>
                                        {currentGroup.joinCode && <p>Join code: <span className="font-semibold">{currentGroup.joinCode}</span></p>}
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Meal Sections - Stacked on Mobile, Side by Side on PC */}

                        <div>
                            <Outlet></Outlet>
                        </div>

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
                                                X
                                            </button>
                                        </div>

                                        {currentGroup && (
                                            <div className={`mb-6 rounded-xl border p-4 ${isLight ? 'bg-gray-50 border-gray-200' : 'bg-gray-900/40 border-gray-700'}`}>
                                                <div className="flex flex-col gap-1">
                                                    <p className={`text-xs uppercase tracking-wide ${isLight ? 'text-gray-500' : 'text-gray-400'}`}>Current Group</p>
                                                    <h3 className={`text-lg font-semibold ${isLight ? 'text-gray-900' : 'text-white'}`}>{currentGroup.title}</h3>
                                                    <p className={`text-sm ${isLight ? 'text-gray-600' : 'text-gray-300'}`}>{currentGroup.address || 'No address set'}</p>
                                                    {currentGroup.joinCode && (
                                                        <p className={`text-sm mt-1 ${isLight ? 'text-gray-600' : 'text-gray-300'}`}>
                                                            Join code: <span className="font-semibold">{currentGroup.joinCode}</span>
                                                        </p>
                                                    )}
                                                </div>
                                            </div>
                                        )}

                                        {currentGroup && normalizedRole === 'manager' && (
                                            <div className={`mb-6 rounded-xl border p-4 ${isLight ? 'bg-white border-gray-200' : 'bg-gray-900/40 border-gray-700'}`}>
                                                <h3 className={`text-base font-semibold mb-3 ${isLight ? 'text-gray-900' : 'text-white'}`}>Edit Group Name</h3>
                                                <div className="flex flex-col sm:flex-row gap-2">
                                                    <input
                                                        type="text"
                                                        value={groupTitleInput}
                                                        onChange={(e) => setGroupTitleInput(e.target.value)}
                                                        className={`w-full rounded-lg border px-3 py-2 text-sm ${isLight ? 'bg-white border-gray-300 text-gray-900' : 'bg-gray-800 border-gray-600 text-white'}`}
                                                        placeholder="Enter group name"
                                                    />
                                                    <ButtonPrimary onClick={handleSaveGroupTitle} loading={isSavingGroupTitle} loadingText="Saving...">
                                                        <FiCheck className="h-4 w-4" />
                                                        <span className="sr-only">Save</span>
                                                    </ButtonPrimary>
                                                </div>
                                                <p className={`mt-2 text-xs ${isLight ? 'text-gray-600' : 'text-gray-400'}`}>
                                                    Manager can edit the group name from here.
                                                </p>
                                            </div>
                                        )}

                                        {currentGroup && (
                                            <div className={`mb-6 rounded-xl border p-4 ${isLight ? 'bg-white border-gray-200' : 'bg-gray-900/40 border-gray-700'}`}>
                                                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                                                    <div>
                                                        <h3 className={`text-base font-semibold ${isLight ? 'text-gray-900' : 'text-white'}`}>Leave Group</h3>
                                                        <p className={`text-xs sm:text-sm ${isLight ? 'text-gray-600' : 'text-gray-400'}`}>
                                                            {normalizedRole === 'manager'
                                                                ? 'Manager can leave only after transferring the manager role.'
                                                                : 'Leave the group from your account settings.'}
                                                        </p>
                                                    </div>
                                                    <ButtonSecondary onClick={handleLeaveGroup} loading={isLeavingGroup} loadingText="Leaving...">
                                                        Leave Group
                                                    </ButtonSecondary>
                                                </div>
                                            </div>
                                        )}

                                        {!currentGroup && (!showJoinForm ? (
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
                                                    <ButtonPrimary onClick={handleCreateGroup} loading={isManagerSubmitting} loadingText="Creating...">
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

                                                    <ButtonPrimary type="submit" className="w-full" loading={isJoinSubmitting} loadingText="Joining...">
                                                        Join Group
                                                    </ButtonPrimary>
                                                </form>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Bottom Navigation Bar - Mobile Only */}
                    <nav className={`lg:hidden fixed bottom-0 left-0 right-0 z-50 border-t ${isLight ? 'bg-white border-gray-200' : 'bg-gray-900 border-gray-700'} shadow-lg`}>
                        <div className="relative h-16">
                            {/* Left Scroll Indicator */}
                            <div className={`absolute left-0 top-0 bottom-0 w-8 flex items-center justify-center pointer-events-none z-10 ${isLight ? 'bg-linear-to-r from-white to-transparent' : 'bg-linear-to-r from-gray-900 to-transparent'}`}>
                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" className={`size-4 ${isLight ? 'text-gray-400' : 'text-gray-500'}`}>
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                                </svg>
                            </div>

                            {/* Scrollable Navigation Items */}
                            <div className="flex items-center h-full overflow-x-auto scrollbar-hide px-2 gap-1">
                                {userRole === 'manager' ? (
                                    <>
                                        <Link to="/dashboard" className={`flex flex-col items-center justify-center min-w-17.5 h-full px-2 ${location.pathname === '/dashboard' ? (isLight ? 'text-violet-600' : 'text-violet-400') : (isLight ? 'text-gray-600' : 'text-gray-400')}`}>
                                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" strokeLinejoin="round" strokeLinecap="round" strokeWidth="2" fill="none" stroke="currentColor" className="size-5"><path d="M3 3v18h18"></path><path d="M18 17V9"></path><path d="M13 17V5"></path><path d="M8 17v-3"></path></svg>
                                            <span className="text-[10px] mt-0.5 truncate w-full text-center">Analytics</span>
                                        </Link>
                                        <Link to="/dashboard/members" className={`flex flex-col items-center justify-center min-w-17.5 h-full px-2 ${location.pathname === '/dashboard/members' ? (isLight ? 'text-violet-600' : 'text-violet-400') : (isLight ? 'text-gray-600' : 'text-gray-400')}`}>
                                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" className="size-5">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                                            </svg>
                                            <span className="text-[10px] mt-0.5 truncate w-full text-center">Members</span>
                                        </Link>
                                        <Link to="/dashboard/meal" className={`flex flex-col items-center justify-center min-w-17.5 h-full px-2 ${location.pathname === '/dashboard/meal' ? (isLight ? 'text-violet-600' : 'text-violet-400') : (isLight ? 'text-gray-600' : 'text-gray-400')}`}>
                                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" strokeLinejoin="round" strokeLinecap="round" strokeWidth="2" fill="none" stroke="currentColor" className="size-5"><path d="M8 2v4"></path><path d="M16 2v4"></path><path d="M3 10h18"></path><path d="M19 4H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2z"></path></svg>
                                            <span className="text-[10px] mt-0.5 truncate w-full text-center">Meals</span>
                                        </Link>
                                        <Link to="/dashboard/meal-expense" className={`flex flex-col items-center justify-center min-w-17.5 h-full px-2 ${location.pathname === '/dashboard/meal-expense' ? (isLight ? 'text-violet-600' : 'text-violet-400') : (isLight ? 'text-gray-600' : 'text-gray-400')}`}>
                                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" strokeLinejoin="round" strokeLinecap="round" strokeWidth="2" fill="none" stroke="currentColor" className="size-5"><path d="M16 8V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v3"></path><path d="M12 11v10"></path><path d="M8 11h8a2 2 0 0 1 2 2v7a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2z"></path></svg>
                                            <span className="text-[10px] mt-0.5 truncate w-full text-center">My Exp.</span>
                                        </Link>
                                        <Link to="/dashboard/total-expense" className={`flex flex-col items-center justify-center min-w-17.5 h-full px-2 ${location.pathname === '/dashboard/total-expense' ? (isLight ? 'text-violet-600' : 'text-violet-400') : (isLight ? 'text-gray-600' : 'text-gray-400')}`}>
                                            <TbCoinTakaFilled className="size-5" />
                                            <span className="text-[10px] mt-0.5 truncate w-full text-center">T.Expense</span>
                                        </Link>
                                        <Link to="/dashboard/menu" className={`flex flex-col items-center justify-center min-w-17.5 h-full px-2 ${location.pathname === '/dashboard/menu' ? (isLight ? 'text-violet-600' : 'text-violet-400') : (isLight ? 'text-gray-600' : 'text-gray-400')}`}>
                                            <MdOutlineRestaurantMenu className="size-5" />
                                            <span className="text-[10px] mt-0.5 truncate w-full text-center">Menu</span>
                                        </Link>
                                        <Link to="/dashboard/bazar" className={`flex flex-col items-center justify-center min-w-17.5 h-full px-2 ${location.pathname === '/dashboard/bazar' ? (isLight ? 'text-violet-600' : 'text-violet-400') : (isLight ? 'text-gray-600' : 'text-gray-400')}`}>
                                            <FaCartPlus className="size-5" />
                                            <span className="text-[10px] mt-0.5 truncate w-full text-center">Bazar</span>
                                        </Link>
                                        <Link to="/dashboard/payment" className={`flex flex-col items-center justify-center min-w-17.5 h-full px-2 ${location.pathname === '/dashboard/payment' ? (isLight ? 'text-violet-600' : 'text-violet-400') : (isLight ? 'text-gray-600' : 'text-gray-400')}`}>
                                            <FaAmazonPay className="size-5" />
                                            <span className="text-[10px] mt-0.5 truncate w-full text-center">Payment</span>
                                        </Link>
                                        <button onClick={handleOpenGroupModal} className={`flex flex-col items-center justify-center min-w-17.5 h-full px-2 ${isLight ? 'text-gray-600' : 'text-gray-400'}`}>
                                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" strokeLinejoin="round" strokeLinecap="round" strokeWidth="2" fill="none" stroke="currentColor" className="size-5"><path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"></path><circle cx="12" cy="12" r="3"></circle></svg>
                                            <span className="text-[10px] mt-0.5 truncate w-full text-center">Settings</span>
                                        </button>
                                    </>
                                ) : (
                                    <>
                                        <Link to="/dashboard" className={`flex flex-col items-center justify-center min-w-17.5 h-full px-2 ${location.pathname === '/dashboard' ? (isLight ? 'text-violet-600' : 'text-violet-400') : (isLight ? 'text-gray-600' : 'text-gray-400')}`}>
                                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" strokeLinejoin="round" strokeLinecap="round" strokeWidth="2" fill="none" stroke="currentColor" className="size-5"><path d="M3 3v18h18"></path><path d="M18 17V9"></path><path d="M13 17V5"></path><path d="M8 17v-3"></path></svg>
                                            <span className="text-[10px] mt-0.5 truncate w-full text-center">Dashboard</span>
                                        </Link>
                                        <Link to="/dashboard/meal" className={`flex flex-col items-center justify-center min-w-17.5 h-full px-2 ${location.pathname === '/dashboard/meal' ? (isLight ? 'text-violet-600' : 'text-violet-400') : (isLight ? 'text-gray-600' : 'text-gray-400')}`}>
                                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" strokeLinejoin="round" strokeLinecap="round" strokeWidth="2" fill="none" stroke="currentColor" className="size-5"><path d="M8 2v4"></path><path d="M16 2v4"></path><path d="M3 10h18"></path><path d="M19 4H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2z"></path></svg>
                                            <span className="text-[10px] mt-0.5 truncate w-full text-center">Calendar</span>
                                        </Link>
                                        <Link to="/dashboard/meal-expense" className={`flex flex-col items-center justify-center min-w-17.5 h-full px-2 ${location.pathname === '/dashboard/meal-expense' ? (isLight ? 'text-violet-600' : 'text-violet-400') : (isLight ? 'text-gray-600' : 'text-gray-400')}`}>
                                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" strokeLinejoin="round" strokeLinecap="round" strokeWidth="2" fill="none" stroke="currentColor" className="size-5"><path d="M16 8V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v3"></path><path d="M12 11v10"></path><path d="M8 11h8a2 2 0 0 1 2 2v7a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2z"></path></svg>
                                            <span className="text-[10px] mt-0.5 truncate w-full text-center">Expenses</span>
                                        </Link>
                                        <Link to="/dashboard/menu" className={`flex flex-col items-center justify-center min-w-17.5 h-full px-2 ${location.pathname === '/dashboard/menu' ? (isLight ? 'text-violet-600' : 'text-violet-400') : (isLight ? 'text-gray-600' : 'text-gray-400')}`}>
                                            <MdOutlineRestaurantMenu className="size-5" />
                                            <span className="text-[10px] mt-0.5 truncate w-full text-center">Menu</span>
                                        </Link>
                                        <Link to="/dashboard/bazar" className={`flex flex-col items-center justify-center min-w-17.5 h-full px-2 ${location.pathname === '/dashboard/bazar' ? (isLight ? 'text-violet-600' : 'text-violet-400') : (isLight ? 'text-gray-600' : 'text-gray-400')}`}>
                                            <FaCartPlus className="size-5" />
                                            <span className="text-[10px] mt-0.5 truncate w-full text-center">Bazar</span>
                                        </Link>
                                        <Link to="/dashboard/payment" className={`flex flex-col items-center justify-center min-w-17.5 h-full px-2 ${location.pathname === '/dashboard/payment' ? (isLight ? 'text-violet-600' : 'text-violet-400') : (isLight ? 'text-gray-600' : 'text-gray-400')}`}>
                                            <FaAmazonPay className="size-5" />
                                            <span className="text-[10px] mt-0.5 truncate w-full text-center">Payment</span>
                                        </Link>
                                        <button onClick={handleOpenGroupModal} className={`flex flex-col items-center justify-center min-w-17.5 h-full px-2 ${isLight ? 'text-gray-600' : 'text-gray-400'}`}>
                                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" strokeLinejoin="round" strokeLinecap="round" strokeWidth="2" fill="none" stroke="currentColor" className="size-5"><path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"></path><circle cx="12" cy="12" r="3"></circle></svg>
                                            <span className="text-[10px] mt-0.5 truncate w-full text-center">Settings</span>
                                        </button>
                                    </>
                                )}
                            </div>

                            {/* Right Scroll Indicator */}
                            <div className={`absolute right-0 top-0 bottom-0 w-8 flex items-center justify-center pointer-events-none z-10 ${isLight ? 'bg-linear-to-l from-white to-transparent' : 'bg-linear-to-l from-gray-900 to-transparent'}`}>
                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" className={`size-4 ${isLight ? 'text-gray-400' : 'text-gray-500'}`}>
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                </svg>
                            </div>
                        </div>
                    </nav>
                </div>

                <div
                    className="drawer-side is-drawer-close:overflow-visible hidden lg:block"
                    onMouseEnter={handleSidebarMouseEnter}
                    onMouseLeave={handleSidebarMouseLeave}
                >
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



