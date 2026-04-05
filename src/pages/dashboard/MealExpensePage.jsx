import React, { use, useEffect, useMemo, useState } from 'react';
import { AuthContext } from '../../provider/AuthContext';
import { toast } from 'react-toastify';
import { getExpenses } from '../../utils/expenseApi';
import { getUserPayments } from '../../utils/paymentApi';

const MealExpensePage = () => {
    const { isLight, user, currentGroup } = use(AuthContext);
    const [expenses, setExpenses] = useState([]);
    const [myPayments, setMyPayments] = useState([]);
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        const loadData = async () => {
            if (!user) {
                return;
            }

            try {
                setIsLoading(true);
                const token = await user.getIdToken();
                const [expenseData, paymentData] = await Promise.all([
                    getExpenses(token),
                    getUserPayments(token),
                ]);
                setExpenses(expenseData?.expenses || []);
                setMyPayments(paymentData?.payments || []);
            } catch (error) {
                toast.error(error.message || 'Failed to load expense data');
            } finally {
                setIsLoading(false);
            }
        };

        loadData();
    }, [user]);

    const totalGroupExpense = useMemo(
        () => expenses.reduce((sum, item) => sum + Number(item.amount || 0), 0),
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

    const myIndividualExpense = useMemo(
        () => totalGroupExpense / memberCount,
        [totalGroupExpense, memberCount],
    );

    const myCompletedPaymentsTotal = useMemo(
        () => myPayments
            .filter((item) => item.status === 'COMPLETED')
            .reduce((sum, item) => sum + Number(item.amount || 0), 0),
        [myPayments],
    );

    const myDueOrAdvance = useMemo(
        () => myCompletedPaymentsTotal - myIndividualExpense,
        [myCompletedPaymentsTotal, myIndividualExpense],
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
                <p className={`${isLight ? 'text-gray-600' : 'text-gray-400'} mt-1 text-sm sm:text-base`}>Your individual share based on total group expense</p>
            </div>

            <div className={`rounded-xl border p-4 sm:p-5 ${isLight ? 'bg-white border-gray-200' : 'bg-gray-800 border-gray-700'}`}>
                <h2 className={`text-lg font-semibold mb-4 ${isLight ? 'text-gray-900' : 'text-white'}`}>My Expense Summary</h2>
                {isLoading && <p className="text-sm mb-3">Loading expense data...</p>}
                <div className="space-y-3">
                    <div className={`p-3 rounded-lg ${isLight ? 'bg-gray-50' : 'bg-gray-700/40'}`}>
                        <p className="text-sm">Total Group Expense</p>
                        <p className="font-semibold">৳ {totalGroupExpense.toLocaleString()}</p>
                    </div>
                    <div className={`p-3 rounded-lg ${isLight ? 'bg-gray-50' : 'bg-gray-700/40'}`}>
                        <p className="text-sm">Total Members</p>
                        <p className="font-semibold">{memberCount}</p>
                    </div>
                    <div className={`p-3 rounded-lg ${isLight ? 'bg-blue-50 border border-blue-200' : 'bg-blue-900/20 border border-blue-800'}`}>
                        <p className="text-sm">My Individual Expense</p>
                        <p className="font-bold text-lg">৳ {myIndividualExpense.toFixed(2)}</p>
                        <p className={`text-xs mt-1 ${isLight ? 'text-gray-600' : 'text-gray-400'}`}>
                            {totalGroupExpense.toLocaleString()} ÷ {memberCount} = {myIndividualExpense.toFixed(2)}
                        </p>
                    </div>
                    <div className={`p-3 rounded-lg ${isLight ? 'bg-gray-50' : 'bg-gray-700/40'}`}>
                        <p className="text-sm">My Total Payment (Completed)</p>
                        <p className="font-semibold">৳ {myCompletedPaymentsTotal.toFixed(2)}</p>
                    </div>
                    <div
                        className={`p-3 rounded-lg ${myDueOrAdvance >= 0
                            ? (isLight ? 'bg-green-50 border border-green-200' : 'bg-green-900/20 border-green-800')
                            : (isLight ? 'bg-red-50 border border-red-200' : 'bg-red-900/20 border-red-800')
                            }`}
                    >
                        <p className="text-sm">Net Status</p>
                        <p className={`font-bold text-lg ${myDueOrAdvance >= 0 ? 'text-green-600' : 'text-red-500'}`}>
                            {myDueOrAdvance >= 0
                                ? `Advance ৳ ${myDueOrAdvance.toFixed(2)}`
                                : `Due ৳ ${Math.abs(myDueOrAdvance).toFixed(2)}`}
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
