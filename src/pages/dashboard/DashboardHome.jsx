import React, { use, useCallback, useEffect, useMemo, useState } from 'react';
import { AuthContext } from '../../provider/AuthContext';
import { toast } from 'react-toastify';
import { getExpenses } from '../../utils/expenseApi';
import { getManagerGroupDetails } from '../../utils/groupApi';
import { getManagerPayments, getUserPayments } from '../../utils/paymentApi';

const DashboardHome = () => {
    const { isLight, userRole, user } = use(AuthContext);
    const normalizedRole = userRole ? userRole.toLowerCase() : null;
    const [isLoading, setIsLoading] = useState(false);
    const [expenses, setExpenses] = useState([]);
    const [payments, setPayments] = useState([]);
    const [memberCount, setMemberCount] = useState(1);

    const loadDashboardData = useCallback(async () => {
        if (!user) {
            return;
        }

        try {
            setIsLoading(true);
            const token = await user.getIdToken();

            const [expenseData, paymentData] = await Promise.all([
                getExpenses(token),
                normalizedRole === 'manager' ? getManagerPayments(token) : getUserPayments(token),
            ]);

            setExpenses(expenseData?.expenses || []);
            setPayments(paymentData?.payments || []);

            if (normalizedRole === 'manager') {
                const groupData = await getManagerGroupDetails(token);
                const users = groupData?.group?.userIDs || [];
                setMemberCount(users.length + 1);
            } else {
                setMemberCount(1);
            }
        } catch (error) {
            toast.error(error.message || 'Failed to load dashboard data');
        } finally {
            setIsLoading(false);
        }
    }, [user, normalizedRole]);

    useEffect(() => {
        loadDashboardData();
    }, [loadDashboardData]);

    const totalExpenseAmount = useMemo(
        () => expenses.reduce((sum, item) => sum + Number(item.amount || 0), 0),
        [expenses],
    );

    const completedPaymentItems = useMemo(
        () => payments.filter((item) => item.status === 'COMPLETED'),
        [payments],
    );

    const totalPaymentAmount = useMemo(
        () => completedPaymentItems.reduce((sum, item) => sum + Number(item.amount || 0), 0),
        [completedPaymentItems],
    );

    const pendingPayments = useMemo(
        () => payments.filter((item) => item.status === 'PENDING').length,
        [payments],
    );

    const completedPayments = useMemo(
        () => completedPaymentItems.length,
        [completedPaymentItems],
    );

    const pendingPaymentItems = useMemo(
        () => payments.filter((item) => item.status === 'PENDING').slice(0, 5),
        [payments],
    );

    const balance = totalPaymentAmount - totalExpenseAmount;

    const summary = [
        { label: 'Current Month Expenses', value: `৳ ${totalExpenseAmount.toLocaleString()}` },
        { label: 'Expense Entries', value: expenses.length.toString() },
        { label: 'Total Payments', value: `৳ ${totalPaymentAmount.toLocaleString()}` },
        { label: 'Members Active', value: memberCount.toString() },
    ];

    const activities = useMemo(() => {
        const expenseActivities = expenses.slice(0, 3).map((item) => ({
            title: 'Expense added',
            time: item.createdAt,
            info: `${item.title} • ৳ ${Number(item.amount || 0).toLocaleString()}`,
        }));

        const paymentActivities = payments.slice(0, 3).map((item) => ({
            title: `Payment ${item.status?.toLowerCase() || 'updated'}`,
            time: item.createdAt,
            info: `৳ ${Number(item.amount || 0).toLocaleString()} • ${item.paymentMethod}`,
        }));

        return [...expenseActivities, ...paymentActivities]
            .sort((a, b) => new Date(b.time) - new Date(a.time))
            .slice(0, 5);
    }, [expenses, payments]);

    return (
        <div className="space-y-4 sm:space-y-6">
            <div>
                <h1 className={`text-xl sm:text-3xl font-bold ${isLight ? 'text-gray-900' : 'text-white'}`}>
                    {userRole === 'manager' ? 'Manager Dashboard' : 'My Dashboard'}
                </h1>
                <p className={`${isLight ? 'text-gray-600' : 'text-gray-400'} text-sm sm:text-base mt-1`}>
                    Overview of expenses, payments and recent activity
                </p>
            </div>

            {isLoading && (
                <p className={`text-sm ${isLight ? 'text-gray-600' : 'text-gray-400'}`}>
                    Loading dashboard data...
                </p>
            )}

            {/* Summary Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
                {summary.map((item) => (
                    <div key={item.label} className={`rounded-xl p-3 sm:p-4 border ${isLight ? 'bg-white border-gray-200' : 'bg-gray-800 border-gray-700'}`}>
                        <p className={`text-xs sm:text-sm ${isLight ? 'text-gray-600' : 'text-gray-400'}`}>{item.label}</p>
                        <p className={`text-base sm:text-2xl font-bold mt-1 ${isLight ? 'text-gray-900' : 'text-white'}`}>{item.value}</p>
                    </div>
                ))}
            </div>

            {/* Payment Status */}
            <div className={`rounded-xl p-4 sm:p-5 border ${isLight ? 'bg-white border-gray-200' : 'bg-gray-800 border-gray-700'}`}>
                <h2 className={`text-base sm:text-xl font-semibold mb-4 ${isLight ? 'text-gray-900' : 'text-white'}`}>Payment Status</h2>
                <div className="grid grid-cols-2 gap-4">
                    <div className={`p-4 rounded-lg ${isLight ? 'bg-blue-50 border border-blue-200' : 'bg-blue-900/20 border border-blue-800'}`}>
                        <p className={`text-sm ${isLight ? 'text-blue-700' : 'text-blue-300'}`}>Pending Payments</p>
                        <p className="text-2xl font-bold mt-1">{pendingPayments}</p>
                    </div>
                    <div className={`p-4 rounded-lg ${isLight ? 'bg-gray-100' : 'bg-gray-700/40'}`}>
                        <p className={`text-sm ${isLight ? 'text-gray-700' : 'text-gray-300'}`}>Completed Payments</p>
                        <p className="text-2xl font-bold mt-1">{completedPayments}</p>
                    </div>
                </div>
                <div className="mt-3 p-3 bg-opacity-50 rounded-lg">
                    <p className={`text-sm ${isLight ? 'text-gray-600' : 'text-gray-400'}`}>
                        Current balance:{' '}
                        <span className={`font-semibold ${balance >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                            ৳ {balance.toLocaleString()}
                        </span>
                    </p>
                </div>
                <div className="mt-4 space-y-2">
                    <p className={`text-sm font-medium ${isLight ? 'text-gray-900' : 'text-white'}`}>Pending payment details</p>
                    {pendingPaymentItems.length === 0 ? (
                        <p className={`text-xs ${isLight ? 'text-gray-500' : 'text-gray-400'}`}>No pending payments right now.</p>
                    ) : (
                        pendingPaymentItems.map((item) => (
                            <div
                                key={item._id}
                                className={`flex flex-col gap-1 rounded-lg border px-3 py-2 text-sm ${isLight ? 'border-yellow-200 bg-yellow-50' : 'border-yellow-800 bg-yellow-900/20'}`}
                            >
                                <div className="flex flex-wrap items-center gap-2">
                                    <span className={`font-medium ${isLight ? 'text-gray-900' : 'text-white'}`}>
                                        ৳ {Number(item.amount || 0).toLocaleString()}
                                    </span>
                                    <span className="rounded-full bg-yellow-500/10 px-2 py-0.5 text-xs font-medium text-yellow-600">
                                        Pending
                                    </span>
                                    <span className={`font-mono text-xs ${isLight ? 'text-gray-700' : 'text-gray-300'}`}>
                                        {item.transactionID || 'N/A'}
                                    </span>
                                </div>
                                <p className={`text-xs ${isLight ? 'text-gray-600' : 'text-gray-400'}`}>
                                    Method: {item.paymentMethod || 'N/A'} • {new Date(item.createdAt).toLocaleString()}
                                </p>
                            </div>
                        ))
                    )}
                </div>
            </div>

            {/* Manager Only: Net Balance */}
            {userRole === 'manager' && (
                <div className={`rounded-xl p-4 sm:p-5 border ${isLight ? 'bg-green-50 border-green-200' : 'bg-green-900/20 border-green-800'}`}>
                    <h2 className={`text-base sm:text-xl font-semibold ${isLight ? 'text-green-900' : 'text-green-200'}`}>Net Balance (Managers Only)</h2>
                    <p className="text-3xl font-bold mt-2 text-green-600">৳ {balance.toLocaleString()}</p>
                    <p className={`text-sm mt-2 ${isLight ? 'text-green-700' : 'text-green-300'}`}>
                        Total payments minus total expenses
                    </p>
                </div>
            )}

            {/* Recent Activity */}
            <div className={`rounded-xl p-4 sm:p-5 border ${isLight ? 'bg-white border-gray-200' : 'bg-gray-800 border-gray-700'}`}>
                <h2 className={`text-base sm:text-xl font-semibold mb-3 ${isLight ? 'text-gray-900' : 'text-white'}`}>Recent Activity</h2>
                <div className="space-y-3">
                    {activities.length === 0 && (
                        <p className="text-sm">No recent activity found.</p>
                    )}
                    {activities.map((item, index) => (
                        <div key={`${item.title}-${item.time}-${index}`} className={`p-3 rounded-lg ${isLight ? 'bg-gray-50' : 'bg-gray-700/50'}`}>
                            <p className={`font-medium ${isLight ? 'text-gray-900' : 'text-white'}`}>{item.title}</p>
                            <p className={`text-xs sm:text-sm ${isLight ? 'text-gray-600' : 'text-gray-300'}`}>{item.info}</p>
                            <p className={`text-xs mt-1 ${isLight ? 'text-gray-500' : 'text-gray-400'}`}>{new Date(item.time).toLocaleString()}</p>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default DashboardHome;
