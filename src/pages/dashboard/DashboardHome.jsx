import React, { use, useCallback, useEffect, useMemo, useState } from 'react';
import { AuthContext } from '../../provider/AuthContext';
import { toast } from 'react-toastify';
import { getExpenses } from '../../utils/expenseApi';
import { getManagerGroupDetails } from '../../utils/groupApi';
import { getMeals } from '../../utils/mealApi';
import { getBazar } from '../../utils/bazarApi';
import { getManagerPayments, getUserPayments } from '../../utils/paymentApi';

const getCurrentMonthValue = () => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
};

const getMonthRange = (monthValue) => {
    const [year, month] = String(monthValue || '').split('-').map(Number);
    if (!year || !month) {
        return { dateFrom: null, dateTo: null };
    }

    const dateFrom = new Date(year, month - 1, 1);
    const dateTo = new Date(year, month, 0);

    return {
        dateFrom: dateFrom.toISOString().slice(0, 10),
        dateTo: dateTo.toISOString().slice(0, 10),
    };
};

const isWithinSelectedMonth = (dateValue, selectedMonth) => {
    if (!dateValue || !selectedMonth) {
        return false;
    }

    const date = new Date(dateValue);
    if (Number.isNaN(date.getTime())) {
        return false;
    }

    const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
    return monthKey === selectedMonth;
};

const DashboardHome = () => {
    const { isLight, userRole, user, currentGroup } = use(AuthContext);
    const normalizedRole = userRole ? userRole.toLowerCase() : null;
    const groupId = currentGroup?.id || currentGroup?._id || null;
    const isManager = normalizedRole === 'manager';
    const [isLoading, setIsLoading] = useState(false);
    const [expenses, setExpenses] = useState([]);
    const [payments, setPayments] = useState([]);
    const [meals, setMeals] = useState([]);
    const [bazarItems, setBazarItems] = useState([]);
    const [memberCount, setMemberCount] = useState(1);
    const [selectedMonth, setSelectedMonth] = useState(getCurrentMonthValue());

    const loadDashboardData = useCallback(async () => {
        if (!user || !groupId) {
            return;
        }

        try {
            setIsLoading(true);
            const token = await user.getIdToken();
            const { dateFrom, dateTo } = getMonthRange(selectedMonth);

            const [expenseData, paymentData, mealData, bazarData] = await Promise.all([
                getExpenses(token, { dateFrom, dateTo }),
                isManager ? getManagerPayments(token, { fromDate: dateFrom, toDate: dateTo }) : getUserPayments(token),
                getMeals(token, { groupID: groupId }),
                getBazar(token, { groupID: groupId }),
            ]);

            setExpenses(expenseData?.expenses || []);
            setPayments(paymentData?.payments || []);
            setMeals(mealData?.data || []);
            setBazarItems(bazarData?.data || []);

            if (isManager) {
                const groupData = await getManagerGroupDetails(token);
                const users = groupData?.group?.userIDs || [];
                setMemberCount(users.length + 1);
            } else {
                setMemberCount(1);
            }
        } catch (error) {
            toast.error('We could not load dashboard data right now. Please try again.');
        } finally {
            setIsLoading(false);
        }
    }, [user, groupId, isManager, selectedMonth]);

    useEffect(() => {
        loadDashboardData();
    }, [loadDashboardData]);

    const totalExpenseAmount = useMemo(
        () => expenses.reduce((sum, item) => sum + Number(item.amount || 0), 0),
        [expenses],
    );

    const selectedMeals = useMemo(
        () => meals.filter((item) => isWithinSelectedMonth(item.date || item.createdAt, selectedMonth)),
        [meals, selectedMonth],
    );

    const selectedBazarItems = useMemo(
        () => bazarItems.filter((item) => isWithinSelectedMonth(item.date || item.createdAt, selectedMonth)),
        [bazarItems, selectedMonth],
    );

    const derivedMemberCount = useMemo(() => {
        const parsed = Number(currentGroup?.memberCount);
        if (Number.isFinite(parsed) && parsed > 0) {
            return parsed;
        }

        if (Array.isArray(currentGroup?.userIDs)) {
            return currentGroup.userIDs.length + 1;
        }

        return 1;
    }, [currentGroup?.memberCount, currentGroup?.userIDs]);

    const totalBazarCost = useMemo(
        () => selectedBazarItems.reduce((sum, item) => {
            const itemTotal = Array.isArray(item?.price)
                ? item.price.reduce((acc, value) => acc + Number(value || 0), 0)
                : Number(item?.price || 0);
            return sum + itemTotal;
        }, 0),
        [selectedBazarItems],
    );

    const totalMealCount = useMemo(
        () => selectedMeals.reduce((sum, item) => sum + Number(item?.mealCount || 0), 0),
        [selectedMeals],
    );

    const mealRate = useMemo(
        () => (totalMealCount > 0 ? totalBazarCost / totalMealCount : 0),
        [totalBazarCost, totalMealCount],
    );

    const myMealCount = useMemo(
        () => selectedMeals
            .filter((item) => item?.userID?.email && user?.email && item.userID.email.toLowerCase() === user.email.toLowerCase())
            .reduce((sum, item) => sum + Number(item?.mealCount || 0), 0),
        [selectedMeals, user?.email],
    );

    const myMealExpense = useMemo(
        () => myMealCount * mealRate,
        [myMealCount, mealRate],
    );

    const myCompletedPaymentsTotal = useMemo(
        () => payments
            .filter((item) => item.status === 'COMPLETED')
            .filter((item) => isWithinSelectedMonth(item.createdAt, selectedMonth))
            .reduce((sum, item) => sum + Number(item.amount || 0), 0),
        [payments, selectedMonth],
    );

    const otherGroupExpense = useMemo(
        () => expenses
            .filter((item) => String(item.category || '').toLowerCase() !== 'bazar')
            .reduce((sum, item) => sum + Number(item.amount || 0), 0),
        [expenses],
    );

    const mySharedExpense = useMemo(
        () => otherGroupExpense / derivedMemberCount,
        [otherGroupExpense, derivedMemberCount],
    );

    const myTotalExpense = useMemo(
        () => myMealExpense + mySharedExpense,
        [myMealExpense, mySharedExpense],
    );

    const currentExpensesTotal = useMemo(
        () => expenses.reduce((sum, item) => sum + Number(item.amount || 0), 0),
        [expenses],
    );

    const currentBalance = useMemo(
        () => myCompletedPaymentsTotal - myTotalExpense,
        [myCompletedPaymentsTotal, myTotalExpense],
    );

    const managerBalance = useMemo(
        () => myCompletedPaymentsTotal - (currentExpensesTotal + totalBazarCost),
        [myCompletedPaymentsTotal, currentExpensesTotal, totalBazarCost],
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

    const myPaymentItems = useMemo(() => {
        if (!user?.email) {
            return [];
        }

        return payments.filter((item) => {
            const payerEmail = String(item?.userID?.email || item?.userEmail || '').toLowerCase();
            return payerEmail && payerEmail === user.email.toLowerCase();
        });
    }, [payments, user?.email]);

    const myPaymentCount = useMemo(
        () => (isManager ? myPaymentItems.length : payments.length),
        [isManager, myPaymentItems.length, payments.length],
    );

    const myPendingPayments = useMemo(
        () => (isManager ? myPaymentItems : payments).filter((item) => item.status === 'PENDING').length,
        [isManager, myPaymentItems, payments],
    );

    const myCompletedPayments = useMemo(
        () => (isManager ? myPaymentItems : payments).filter((item) => item.status === 'COMPLETED').length,
        [isManager, myPaymentItems, payments],
    );

    const myRecentPaymentItems = useMemo(
        () => (isManager ? myPaymentItems : payments).slice(0, 5),
        [isManager, myPaymentItems, payments],
    );

    const balance = totalPaymentAmount - totalExpenseAmount;

    const chartItems = isManager
        ? [
            { label: 'Bazar Cost', value: totalBazarCost, color: 'bg-violet-500' },
            { label: 'Expense', value: currentExpensesTotal, color: 'bg-blue-500' },
            { label: 'Payments', value: totalPaymentAmount, color: 'bg-green-500' },
            { label: 'Meal Rate', value: mealRate, color: 'bg-amber-500' },
        ]
        : [
            { label: 'Meal Rate', value: mealRate, color: 'bg-violet-500' },
            { label: 'My Meal', value: myMealCount, color: 'bg-blue-500' },
            { label: 'Shared Expense', value: mySharedExpense, color: 'bg-green-500' },
            { label: 'My Deposit', value: myCompletedPaymentsTotal, color: 'bg-amber-500' },
        ];

    const chartMax = Math.max(...chartItems.map((item) => item.value), 1);

    const summary = isManager
        ? [
            { label: 'Current Month Expenses', value: `৳ ${currentExpensesTotal.toLocaleString()}` },
            { label: 'Bazar Cost', value: `৳ ${totalBazarCost.toLocaleString()}` },
            { label: 'Total Payments', value: `৳ ${totalPaymentAmount.toLocaleString()}` },
            { label: 'Members Active', value: memberCount.toString() },
        ]
        : [
            { label: 'Meal Rate', value: `৳ ${mealRate.toFixed(2)}` },
            { label: 'My Meal Count', value: myMealCount.toFixed(2) },
            { label: 'My Deposit', value: `৳ ${myCompletedPaymentsTotal.toFixed(2)}` },
            { label: 'My Balance', value: `৳ ${currentBalance.toFixed(2)}` },
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
                    {isManager
                        ? 'Overview of expenses, payments and recent activity'
                        : 'Your meal rate, meals, deposit and balance overview'}
                </p>
            </div>

            <div className={`rounded-xl p-4 sm:p-5 border ${isLight ? 'bg-white border-gray-200' : 'bg-gray-800 border-gray-700'}`}>
                <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
                    <div>
                        <h2 className={`text-base sm:text-xl font-semibold ${isLight ? 'text-gray-900' : 'text-white'}`}>
                            {isManager ? 'Analytics Timeline' : 'My Timeline'}
                        </h2>
                        <p className={`text-xs sm:text-sm ${isLight ? 'text-gray-500' : 'text-gray-400'}`}>
                            Visual summary for the selected month
                        </p>
                    </div>
                    <input
                        type="month"
                        value={selectedMonth}
                        onChange={(event) => setSelectedMonth(event.target.value)}
                        className={`rounded-lg border px-3 py-2 text-sm ${isLight ? 'bg-white border-gray-300 text-gray-900' : 'bg-gray-700 border-gray-600 text-white'}`}
                    />
                </div>

                <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                    {chartItems.map((item) => {
                        const percent = (item.value / chartMax) * 100;

                        return (
                            <div key={item.label} className={`rounded-xl border p-3 ${isLight ? 'bg-gray-50 border-gray-200' : 'bg-gray-700/40 border-gray-700'}`}>
                                <div className="flex items-center justify-between gap-2">
                                    <p className={`text-xs uppercase tracking-wide ${isLight ? 'text-gray-500' : 'text-gray-400'}`}>{item.label}</p>
                                    <p className={`text-sm font-semibold ${isLight ? 'text-gray-900' : 'text-white'}`}>
                                        {item.label === 'Meal Rate' ? `৳ ${item.value.toFixed(2)}` : item.value.toLocaleString()}
                                    </p>
                                </div>
                                <div className={`mt-3 h-2 rounded-full ${isLight ? 'bg-gray-200' : 'bg-gray-800'}`}>
                                    <div className={`h-2 rounded-full ${item.color}`} style={{ width: `${Math.max(percent, 8)}%` }} />
                                </div>
                            </div>
                        );
                    })}
                </div>

                <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                    {isManager ? (
                        <>
                            <div className={`rounded-xl p-3 ${isLight ? 'bg-blue-50 border border-blue-200' : 'bg-blue-900/20 border border-blue-800'}`}>
                                <p className="text-xs uppercase tracking-wide opacity-70">Total Bazar</p>
                                <p className="font-semibold">৳ {totalBazarCost.toFixed(2)}</p>
                            </div>
                            <div className={`rounded-xl p-3 ${isLight ? 'bg-gray-50 border border-gray-200' : 'bg-gray-700/40 border border-gray-700'}`}>
                                <p className="text-xs uppercase tracking-wide opacity-70">Total Meal Count</p>
                                <p className="font-semibold">{totalMealCount.toFixed(2)}</p>
                            </div>
                            <div className={`rounded-xl p-3 ${isLight ? 'bg-green-50 border border-green-200' : 'bg-green-900/20 border border-green-800'}`}>
                                <p className="text-xs uppercase tracking-wide opacity-70">Manager Balance</p>
                                <p className={`font-semibold ${managerBalance >= 0 ? 'text-green-600' : 'text-red-500'}`}>
                                    {managerBalance >= 0 ? `Advance ৳ ${managerBalance.toFixed(2)}` : `Due ৳ ${Math.abs(managerBalance).toFixed(2)}`}
                                </p>
                            </div>
                            <div className={`rounded-xl p-3 ${isLight ? 'bg-amber-50 border border-amber-200' : 'bg-amber-900/20 border border-amber-800'}`}>
                                <p className="text-xs uppercase tracking-wide opacity-70">Members Active</p>
                                <p className="font-semibold">{memberCount}</p>
                            </div>
                        </>
                    ) : (
                        <>
                            <div className={`rounded-xl p-3 ${isLight ? 'bg-blue-50 border border-blue-200' : 'bg-blue-900/20 border border-blue-800'}`}>
                                <p className="text-xs uppercase tracking-wide opacity-70">My Meal Count</p>
                                <p className="font-semibold">{myMealCount.toFixed(2)}</p>
                            </div>
                            <div className={`rounded-xl p-3 ${isLight ? 'bg-gray-50 border border-gray-200' : 'bg-gray-700/40 border border-gray-700'}`}>
                                <p className="text-xs uppercase tracking-wide opacity-70">Shared Expense</p>
                                <p className="font-semibold">৳ {mySharedExpense.toFixed(2)}</p>
                            </div>
                            <div className={`rounded-xl p-3 ${isLight ? 'bg-green-50 border border-green-200' : 'bg-green-900/20 border border-green-800'}`}>
                                <p className="text-xs uppercase tracking-wide opacity-70">My Balance</p>
                                <p className={`font-semibold ${currentBalance >= 0 ? 'text-green-600' : 'text-red-500'}`}>
                                    {currentBalance >= 0 ? `Advance ৳ ${currentBalance.toFixed(2)}` : `Due ৳ ${Math.abs(currentBalance).toFixed(2)}`}
                                </p>
                            </div>
                            <div className={`rounded-xl p-3 ${isLight ? 'bg-amber-50 border border-amber-200' : 'bg-amber-900/20 border border-amber-800'}`}>
                                <p className="text-xs uppercase tracking-wide opacity-70">Meal Rate</p>
                                <p className="font-semibold">৳ {mealRate.toFixed(2)}</p>
                            </div>
                        </>
                    )}
                </div>
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
                    {isManager ? (
                        <>
                            <div className={`p-4 rounded-lg ${isLight ? 'bg-blue-50 border border-blue-200' : 'bg-blue-900/20 border border-blue-800'}`}>
                                <p className={`text-sm ${isLight ? 'text-blue-700' : 'text-blue-300'}`}>All Payments Count</p>
                                <p className="text-2xl font-bold mt-1">{payments.length}</p>
                                <p className={`text-xs mt-1 ${isLight ? 'text-blue-700/80' : 'text-blue-300/80'}`}>
                                    Pending {pendingPayments} • Completed {completedPayments}
                                </p>
                            </div>
                            <div className={`p-4 rounded-lg ${isLight ? 'bg-gray-100' : 'bg-gray-700/40'}`}>
                                <p className={`text-sm ${isLight ? 'text-gray-700' : 'text-gray-300'}`}>My Payments Count</p>
                                <p className="text-2xl font-bold mt-1">{myPaymentCount}</p>
                                <p className={`text-xs mt-1 ${isLight ? 'text-gray-600' : 'text-gray-400'}`}>
                                    Pending {myPendingPayments} • Completed {myCompletedPayments}
                                </p>
                            </div>
                        </>
                    ) : (
                        <>
                            <div className={`p-4 rounded-lg ${isLight ? 'bg-blue-50 border border-blue-200' : 'bg-blue-900/20 border border-blue-800'}`}>
                                <p className={`text-sm ${isLight ? 'text-blue-700' : 'text-blue-300'}`}>My Pending Payments</p>
                                <p className="text-2xl font-bold mt-1">{myPendingPayments}</p>
                            </div>
                            <div className={`p-4 rounded-lg ${isLight ? 'bg-gray-100' : 'bg-gray-700/40'}`}>
                                <p className={`text-sm ${isLight ? 'text-gray-700' : 'text-gray-300'}`}>My Completed Payments</p>
                                <p className="text-2xl font-bold mt-1">{myCompletedPayments}</p>
                            </div>
                        </>
                    )}
                </div>
                {isManager && (
                    <div className="mt-3 p-3 bg-opacity-50 rounded-lg">
                        <p className={`text-sm ${isLight ? 'text-gray-600' : 'text-gray-400'}`}>
                            Net balance:{' '}
                            <span className={`font-semibold ${balance >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                                ৳ {balance.toLocaleString()}
                            </span>
                        </p>
                    </div>
                )}                
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
