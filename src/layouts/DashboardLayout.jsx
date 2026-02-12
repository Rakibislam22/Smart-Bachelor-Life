import React from 'react';
import Logo from '../component/common/Logo';
import { Link } from 'react-router';
import { FcBarChart, FcCalendar, FcDebt } from 'react-icons/fc';
import { TbCoinTakaFilled } from 'react-icons/tb';
import { MdOutlineRestaurantMenu } from 'react-icons/md';
import { FaAmazonPay, FaCartPlus } from 'react-icons/fa';
import Avatar from '../component/Avatar';
import GroupChatIcon from '../component/GroupChatIcon';

const DashboardLayout = () => {
    return (
        <div>
            <div className="drawer lg:drawer-open">
                <input id="my-drawer-4" type="checkbox" className="drawer-toggle" />
                <div className="drawer-content">
                    {/* Navbar */}
                    <nav className="navbar w-full bg-base-300">
                        <label htmlFor="my-drawer-4" aria-label="open sidebar" className="btn btn-square btn-ghost">
                            {/* Sidebar toggle icon */}
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" strokeLinejoin="round" strokeLinecap="round" strokeWidth="2" fill="none" stroke="currentColor" className="my-1.5 inline-block size-6"><path d="M4 4m0 2a2 2 0 0 1 2 -2h12a2 2 0 0 1 2 2v12a2 2 0 0 1 -2 2h-12a2 2 0 0 1 -2 -2z"></path><path d="M9 4v16"></path><path d="M14 10l2 2l-2 2"></path></svg>
                        </label>
                        <div className='flex justify-between items-center w-full px-2'>
                            <div className="px-4 "> <Logo></Logo></div>

                            <div className='flex justify-center items-center gap-5'>
                                <GroupChatIcon />
                                <Avatar />
                            </div>

                        </div>
                    </nav>
                    {/* Page content here */}
                    <div className="p-4">Page Content</div>
                </div>

                <div className="drawer-side is-drawer-close:overflow-visible">
                    <label htmlFor="my-drawer-4" aria-label="close sidebar" className="drawer-overlay"></label>
                    <div className="flex min-h-full flex-col items-start bg-base-200 is-drawer-close:w-16 is-drawer-open:w-64">
                        {/* Sidebar content here */}
                        <ul className="menu w-full grow">
                            {/* List item */}
                            <li>
                                <Link to="/" className="is-drawer-close:tooltip is-drawer-close:tooltip-right" data-tip="Homepage">
                                    {/* Home icon */}
                                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" strokeLinejoin="round" strokeLinecap="round" strokeWidth="2" fill="none" stroke="currentColor" className="my-1.5 inline-block size-6"><path d="M15 21v-8a1 1 0 0 0-1-1h-4a1 1 0 0 0-1 1v8"></path><path d="M3 10a2 2 0 0 1 .709-1.528l7-5.999a2 2 0 0 1 2.582 0l7 5.999A2 2 0 0 1 21 10v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path></svg>
                                    <span className="is-drawer-close:hidden">Homepage</span>
                                </Link>
                            </li>

                            {/* List item */}
                            <li>
                                <Link className="is-drawer-close:tooltip is-drawer-close:tooltip-right" data-tip="Analytics">
                                    {/* Analytics icon */}
                                    <FcBarChart className="my-1.5 inline-block size-6" />
                                    <span className="is-drawer-close:hidden">Analytics</span>
                                </Link>
                            </li>
                            <li>
                                <Link className="is-drawer-close:tooltip is-drawer-close:tooltip-right" data-tip="Meal Calendar">
                                    {/* Meal Calendar icon */}
                                    <FcCalendar className="my-1.5 inline-block size-6" />
                                    <span className="is-drawer-close:hidden">Meal Calendar</span>
                                </Link>
                            </li>
                            <li>
                                <Link className="is-drawer-close:tooltip is-drawer-close:tooltip-right" data-tip="Meal Expense">
                                    {/* Meal Expense icon */}
                                    <FcDebt className="my-1.5 inline-block size-6" />
                                    <span className="is-drawer-close:hidden">Meal Expense</span>
                                </Link>
                            </li>
                            <li>
                                <Link className="is-drawer-close:tooltip is-drawer-close:tooltip-right" data-tip="Total Expense">
                                    {/* Total Expense icon */}
                                    <TbCoinTakaFilled className="my-1.5 inline-block size-6" />
                                    <span className="is-drawer-close:hidden">Total Expense</span>
                                </Link>
                            </li>
                            <li>
                                <Link className="is-drawer-close:tooltip is-drawer-close:tooltip-right" data-tip="Daily Menu">
                                    {/* Daily Menu icon */}
                                    <MdOutlineRestaurantMenu className="my-1.5 inline-block size-6" />
                                    <span className="is-drawer-close:hidden">Daily Menu</span>
                                </Link>
                            </li>
                            <li>
                                <Link className="is-drawer-close:tooltip is-drawer-close:tooltip-right" data-tip="Bazar">
                                    {/* Bazar icon */}
                                    <FaCartPlus className="my-1.5 inline-block size-6" />
                                    <span className="is-drawer-close:hidden">Bazar</span>
                                </Link>
                            </li>
                            <li>
                                <Link className="is-drawer-close:tooltip is-drawer-close:tooltip-right" data-tip="Payment & Receipt">
                                    {/* Payment & Receipt icon */}
                                    <FaAmazonPay className="my-1.5 inline-block size-6" />
                                    <span className="is-drawer-close:hidden">Payment & Receipt</span>
                                </Link>
                            </li>
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DashboardLayout;