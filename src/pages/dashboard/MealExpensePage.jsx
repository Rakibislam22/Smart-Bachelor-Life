import React, { use, useEffect, useMemo, useState } from 'react';
import { AuthContext } from '../../provider/AuthContext';
import { toast } from 'react-toastify';
import { getExpenses } from '../../utils/expenseApi';
import { getUserPayments } from '../../utils/paymentApi';
import { getMeals } from '../../utils/mealApi';
import { getBazar } from '../../utils/bazarApi';

const getCurrentMonthValue = () => {
    const now = new Date();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    return `${now.getFullYear()}-${month}`;
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

const MealExpensePage = () => {
    const { isLight, user, currentGroup } = use(AuthContext);
    const groupId = currentGroup?.id || currentGroup?._id || null;
    const [selectedMonth, setSelectedMonth] = useState(getCurrentMonthValue());
    const [expenses, setExpenses] = useState([]);
    const [meals, setMeals] = useState([]);
    const [bazarItems, setBazarItems] = useState([]);
    const [myPayments, setMyPayments] = useState([]);
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        const loadData = async () => {
            if (!user || !groupId) {
                return;
            }

            try {
                setIsLoading(true);
                const token = await user.getIdToken();
                const { dateFrom, dateTo } = getMonthRange(selectedMonth);
                const [expenseData, paymentData, mealData, bazarData] = await Promise.all([
                    getExpenses(token, { dateFrom, dateTo }),
                    getUserPayments(token),
                    getMeals(token, { groupID: groupId }),
                    getBazar(token, { groupID: groupId }),
                ]);
                setExpenses(expenseData?.expenses || []);
                setMyPayments(paymentData?.payments || []);
                setMeals(mealData?.data || []);
                setBazarItems(bazarData?.data || []);
            } catch (error) {
                toast.error(error.message || 'Failed to load expense data');
            } finally {
                setIsLoading(false);
            }
        };

        loadData();
    }, [user, groupId, selectedMonth]);

    const selectedMeals = useMemo(
        () => meals.filter((item) => isWithinSelectedMonth(item.date || item.createdAt, selectedMonth)),
        [meals, selectedMonth],
    );

    const selectedBazarItems = useMemo(
        () => bazarItems.filter((item) => isWithinSelectedMonth(item.date || item.createdAt, selectedMonth)),
        [bazarItems, selectedMonth],
    );

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

    const otherGroupExpense = useMemo(
        () => expenses
            .filter((item) => String(item.category || '').toLowerCase() !== 'bazar')
            .reduce((sum, item) => sum + Number(item.amount || 0), 0),
        [expenses],
    );

    const latestExpenses = useMemo(
        () => expenses.slice(0, 6),
        [expenses],
    );

    const memberCount = useMemo(() => {
        const parsed = Number(currentGroup?.memberCount);
        if (Number.isFinite(parsed) && parsed > 0) {
            return parsed;
        }

        if (Array.isArray(currentGroup?.userIDs)) {
            return currentGroup.userIDs.length + 1;
        }

        return 1;
    }, [currentGroup?.memberCount, currentGroup?.userIDs]);

    const myOtherSharedExpense = useMemo(
        () => otherGroupExpense / memberCount,
        [otherGroupExpense, memberCount],
    );

    const myTotalExpense = useMemo(
        () => myMealExpense + myOtherSharedExpense,
        [myMealExpense, myOtherSharedExpense],
    );

    const myCompletedPaymentsTotal = useMemo(
        () => myPayments
            .filter((item) => isWithinSelectedMonth(item.createdAt, selectedMonth))
            .filter((item) => item.status === 'COMPLETED')
            .reduce((sum, item) => sum + Number(item.amount || 0), 0),
        [myPayments, selectedMonth],
    );

    const myBalance = useMemo(
        () => myCompletedPaymentsTotal - myTotalExpense,
        [myCompletedPaymentsTotal, myTotalExpense],
    );

    const categorySummary = useMemo(() => {
        return expenses.reduce((acc, item) => {
            const key = item.category || 'other';
            acc[key] = (acc[key] || 0) + Number(item.amount || 0);
            return acc;
        }, {});
    }, [expenses]);

    return (
        <div className="space-y-4 sm:space-y-6">
            <div>
                <h1 className={`text-xl sm:text-3xl font-bold ${isLight ? 'text-gray-900' : 'text-white'}`}>My Expense</h1>
                <p className={`${isLight ? 'text-gray-600' : 'text-gray-400'} mt-1 text-sm sm:text-base`}>Timeline meal rate, your meal expense, and final due or advance</p>
            </div>

            <div className={`rounded-xl border p-4 sm:p-5 ${isLight ? 'bg-white border-gray-200' : 'bg-gray-800 border-gray-700'}`}>
                <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
                    <div>
                        <h2 className={`text-lg font-semibold ${isLight ? 'text-gray-900' : 'text-white'}`}>Expense Timeline</h2>
                        <p className={`text-xs sm:text-sm ${isLight ? 'text-gray-500' : 'text-gray-400'}`}>Select month to calculate meal rate and expense summary</p>
                    </div>
                    <input
                        type="month"
                        value={selectedMonth}
                        onChange={(event) => setSelectedMonth(event.target.value)}
                        className={`rounded-lg border px-3 py-2 text-sm ${isLight ? 'bg-white border-gray-300 text-gray-900' : 'bg-gray-700 border-gray-600 text-white'}`}
                    />
                </div>

                <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                    <div className={`p-3 rounded-lg ${isLight ? 'bg-gray-50' : 'bg-gray-700/40'}`}>
                        <p className="text-xs uppercase tracking-wide opacity-70">Total Bazar Cost</p>
                        <p className="font-semibold">৳ {totalBazarCost.toFixed(2)}</p>
                    </div>
                    <div className={`p-3 rounded-lg ${isLight ? 'bg-gray-50' : 'bg-gray-700/40'}`}>
                        <p className="text-xs uppercase tracking-wide opacity-70">Total Meal Count</p>
                        <p className="font-semibold">{totalMealCount.toFixed(2)}</p>
                    </div>
                    <div className={`p-3 rounded-lg ${isLight ? 'bg-blue-50 border border-blue-200' : 'bg-blue-900/20 border border-blue-800'}`}>
                        <p className="text-xs uppercase tracking-wide opacity-70">Meal Rate</p>
                        <p className="font-bold">৳ {mealRate.toFixed(2)}</p>
                    </div>
                    <div className={`p-3 rounded-lg ${isLight ? 'bg-violet-50 border border-violet-200' : 'bg-violet-900/20 border border-violet-800'}`}>
                        <p className="text-xs uppercase tracking-wide opacity-70">My Meal Count</p>
                        <p className="font-bold">{myMealCount.toFixed(2)}</p>
                    </div>
                </div>
            </div>

            <div className={`rounded-xl border p-4 sm:p-5 ${isLight ? 'bg-white border-gray-200' : 'bg-gray-800 border-gray-700'}`}>
                <h2 className={`text-lg font-semibold mb-4 ${isLight ? 'text-gray-900' : 'text-white'}`}>My Expense Summary</h2>
                {isLoading && <p className="text-sm mb-3">Loading expense data...</p>}
                <div className="space-y-3">
                    <div className={`p-3 rounded-lg ${isLight ? 'bg-gray-50' : 'bg-gray-700/40'}`}>
                        <p className="text-sm">My Meal Expense</p>
                        <p className="font-semibold">৳ {myMealExpense.toFixed(2)}</p>
                    </div>
                    <div className={`p-3 rounded-lg ${isLight ? 'bg-gray-50' : 'bg-gray-700/40'}`}>
                        <p className="text-sm">Other Shared Expense</p>
                        <p className="font-semibold">৳ {myOtherSharedExpense.toFixed(2)}</p>
                    </div>
                    <div className={`p-3 rounded-lg ${isLight ? 'bg-blue-50 border border-blue-200' : 'bg-blue-900/20 border border-blue-800'}`}>
                        <p className="text-sm">My Total Expense</p>
                        <p className="font-bold text-lg">৳ {myTotalExpense.toFixed(2)}</p>
                        <p className={`text-xs mt-1 ${isLight ? 'text-gray-600' : 'text-gray-400'}`}>
                            Meal {myMealExpense.toFixed(2)} + Shared {myOtherSharedExpense.toFixed(2)}
                        </p>
                    </div>
                    <div className={`p-3 rounded-lg ${isLight ? 'bg-gray-50' : 'bg-gray-700/40'}`}>
                        <p className="text-sm">My Deposit (Completed)</p>
                        <p className="font-semibold">৳ {myCompletedPaymentsTotal.toFixed(2)}</p>
                    </div>
                    <div
                        className={`p-3 rounded-lg ${myBalance >= 0
                            ? (isLight ? 'bg-green-50 border border-green-200' : 'bg-green-900/20 border-green-800')
                            : (isLight ? 'bg-red-50 border border-red-200' : 'bg-red-900/20 border-red-800')
                            }`}
                    >
                        <p className="text-sm">My Balance</p>
                        <p className={`font-bold text-lg ${myBalance >= 0 ? 'text-green-600' : 'text-red-500'}`}>
                            {myBalance >= 0
                                ? `Advance ৳ ${myBalance.toFixed(2)}`
                                : `Due ৳ ${Math.abs(myBalance).toFixed(2)}`}
                        </p>
                    </div>
                </div>
            </div>

            <div className={`rounded-xl border p-4 sm:p-5 ${isLight ? 'bg-white border-gray-200' : 'bg-gray-800 border-gray-700'}`}>
                <h2 className={`text-lg font-semibold mb-4 ${isLight ? 'text-gray-900' : 'text-white'}`}>Recent Expense Entries</h2>
                <div className="space-y-2">
                    {latestExpenses.length === 0 && (
                        <p className="text-sm">No expense entries found.</p>
                    )}
                    {latestExpenses.map((expense) => (
                        <div key={expense._id} className={`flex items-center justify-between p-3 rounded-lg ${isLight ? 'bg-gray-50' : 'bg-gray-700/40'}`}>
                            <div>
                                <p className="text-sm font-medium">{expense.title}</p>
                                <p className="text-xs opacity-70">{expense.category} • {new Date(expense.createdAt).toLocaleDateString()}</p>
                            </div>
                            <p className="text-sm font-semibold">৳ {Number(expense.amount || 0).toLocaleString()}</p>
                        </div>
                    ))}
                </div>
            </div>

            <div className={`rounded-xl border p-4 sm:p-5 ${isLight ? 'bg-white border-gray-200' : 'bg-gray-800 border-gray-700'}`}>
                <h2 className={`text-lg font-semibold mb-4 ${isLight ? 'text-gray-900' : 'text-white'}`}>Expense by Category</h2>
                <div className="space-y-2">
                    {Object.keys(categorySummary).length === 0 && <p className="text-sm">No category data found.</p>}
                    {Object.entries(categorySummary).map(([category, amount]) => (
                        <div key={category} className={`flex items-center justify-between p-3 rounded-lg ${isLight ? 'bg-gray-50' : 'bg-gray-700/40'}`}>
                            <p className="text-sm capitalize">{category}</p>
                            <p className="font-semibold">৳ {Number(amount).toLocaleString()}</p>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default MealExpensePage;
