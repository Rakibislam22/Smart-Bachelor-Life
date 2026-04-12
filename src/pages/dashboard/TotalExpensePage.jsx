import React, { use, useEffect, useMemo, useRef, useState } from 'react';
import { AuthContext } from '../../provider/AuthContext';
import Loading from '../../component/Loading';
import { toast } from 'react-toastify';
import { createExpense, getExpenses } from '../../utils/expenseApi';
import { getMeals } from '../../utils/mealApi';
import { getBazar } from '../../utils/bazarApi';
import { getManagerPayments } from '../../utils/paymentApi';
import { getManagerGroupDetails } from '../../utils/groupApi';

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

const getMealCountTotal = (mealCount) => {
    if (Array.isArray(mealCount)) {
        return mealCount.reduce((sum, value) => sum + Number(value || 0), 0);
    }

    const parsed = Number(mealCount || 0);
    return Number.isFinite(parsed) ? parsed : 0;
};

const getMealDateKey = (item) => {
    const date = new Date(item?.date || item?.createdAt);
    if (Number.isNaN(date.getTime())) {
        return '';
    }

    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
};

const getMealUserKey = (item) => {
    return String(item?.userID?.email || item?.userID?._id || item?.userID || item?._id || '').toLowerCase();
};

const dedupeMealsByLatestEntry = (items) => {
    const latestByKey = new Map();

    items.forEach((item) => {
        const key = `${getMealUserKey(item)}|${getMealDateKey(item)}`;
        const sortTime = new Date(item?.updatedAt || item?.createdAt || item?.date).getTime() || 0;
        const existing = latestByKey.get(key);

        if (!existing || sortTime >= existing.sortTime) {
            latestByKey.set(key, { item, sortTime });
        }
    });

    return Array.from(latestByKey.values()).map((value) => value.item);
};

const TotalExpensePage = () => {
    const { isLight, user, userRole, currentGroup } = use(AuthContext);
    const normalizedRole = userRole ? userRole.toLowerCase() : null;
    const groupId = currentGroup?.id || currentGroup?._id || null;
    const [selectedMonth, setSelectedMonth] = useState(getCurrentMonthValue());
    const [expenses, setExpenses] = useState([]);
    const [meals, setMeals] = useState([]);
    const [bazarItems, setBazarItems] = useState([]);
    const [payments, setPayments] = useState([]);
    const [groupMembers, setGroupMembers] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [isCreatingExpense, setIsCreatingExpense] = useState(false);
    const expenseFileInputRef = useRef(null);
    const [expenseForm, setExpenseForm] = useState({
        title: '',
        amount: '',
        category: 'Rent',
        file: null,
    });

    useEffect(() => {
        const loadExpenses = async () => {
            if (!user || !groupId) return;

            try {
                setIsLoading(true);
                const token = await user.getIdToken();
                const { dateFrom, dateTo } = getMonthRange(selectedMonth);
                const [expenseData, mealData, bazarData, paymentData, groupData] = await Promise.all([
                    getExpenses(token, { dateFrom, dateTo }),
                    getMeals(token, { groupID: groupId }),
                    getBazar(token, { groupID: groupId }),
                    getManagerPayments(token, { fromDate: dateFrom, toDate: dateTo }),
                    getManagerGroupDetails(token),
                ]);

                setExpenses(expenseData?.expenses || []);
                setMeals(mealData?.data || []);
                setBazarItems(bazarData?.data || []);
                setPayments(paymentData?.payments || []);

                const group = groupData?.group;
                const members = Array.isArray(group?.userIDs) ? group.userIDs : [];
                const managerRecord = {
                    _id: 'manager-self',
                    email: user.email || '',
                    displayName: user.displayName || user.email || 'Manager',
                };
                const merged = [managerRecord, ...members];

                const deduped = [];
                const seen = new Set();
                merged.forEach((member) => {
                    const key = String(member?.email || member?._id || '').toLowerCase();
                    if (!key || seen.has(key)) {
                        return;
                    }

                    seen.add(key);
                    deduped.push(member);
                });

                setGroupMembers(deduped);
            } catch {
                toast.error('We could not load expenses right now. Please try again.');
            } finally {
                setIsLoading(false);
            }
        };

        loadExpenses();
    }, [user, groupId, selectedMonth]);

    const selectedMeals = useMemo(() => {
        const monthMeals = meals.filter((item) => isWithinSelectedMonth(item.date || item.createdAt, selectedMonth));
        return dedupeMealsByLatestEntry(monthMeals);
    }, [meals, selectedMonth]);

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
        () => selectedMeals.reduce((sum, item) => sum + getMealCountTotal(item?.mealCount), 0),
        [selectedMeals],
    );

    const mealRate = useMemo(
        () => (totalMealCount > 0 ? totalBazarCost / totalMealCount : 0),
        [totalBazarCost, totalMealCount],
    );

    const otherExpenseTotal = useMemo(
        () => expenses
            .filter((item) => String(item.category || '').toLowerCase() !== 'bazar')
            .reduce((sum, item) => sum + Number(item.amount || 0), 0),
        [expenses],
    );

    const memberCount = useMemo(
        () => Math.max(groupMembers.length, 1),
        [groupMembers.length],
    );

    const perMemberOtherShare = useMemo(
        () => otherExpenseTotal / memberCount,
        [otherExpenseTotal, memberCount],
    );

    const memberLedger = useMemo(() => {
        const normalizedMeals = selectedMeals.map((item) => ({
            ...item,
            email: String(item?.userID?.email || '').toLowerCase(),
            mealCount: getMealCountTotal(item?.mealCount),
        }));

        const normalizedPayments = payments
            .filter((item) => item.status === 'COMPLETED')
            .map((item) => ({
                ...item,
                email: String(item?.userID?.email || '').toLowerCase(),
                amount: Number(item?.amount || 0),
            }));

        return groupMembers.map((member) => {
            const email = String(member?.email || '').toLowerCase();
            const name = member?.displayName || member?.email || 'Member';

            const mealCount = normalizedMeals
                .filter((meal) => meal.email && meal.email === email)
                .reduce((sum, meal) => sum + meal.mealCount, 0);

            const mealExpense = mealCount * mealRate;

            const depositAmount = normalizedPayments
                .filter((payment) => payment.email && payment.email === email)
                .reduce((sum, payment) => sum + payment.amount, 0);

            const payable = mealExpense + perMemberOtherShare;
            const balance = depositAmount - payable;

            return {
                email,
                name,
                mealCount,
                mealExpense,
                otherShare: perMemberOtherShare,
                totalPayable: payable,
                depositAmount,
                balance,
            };
        });
    }, [selectedMeals, payments, groupMembers, mealRate, perMemberOtherShare]);

    const totalExpense = useMemo(
        () => totalBazarCost + otherExpenseTotal,
        [totalBazarCost, otherExpenseTotal],
    );

    const totalDeposit = useMemo(
        () => memberLedger.reduce((sum, row) => sum + row.depositAmount, 0),
        [memberLedger],
    );

    const groupTotalBalance = useMemo(
        () => totalDeposit - totalExpense,
        [totalDeposit, totalExpense],
    );

    const categorySummary = useMemo(() => {
        return expenses.reduce((acc, item) => {
            const key = item.category || 'other';
            acc[key] = (acc[key] || 0) + Number(item.amount || 0);
            return acc;
        }, {});
    }, [expenses]);

    if (isLoading && expenses.length === 0 && meals.length === 0 && bazarItems.length === 0 && payments.length === 0) {
        return <Loading />;
    }

    const handleInputChange = (event) => {
        const { name, value } = event.target;
        setExpenseForm((prev) => ({ ...prev, [name]: value }));
    };

    const handleFileChange = (event) => {
        const file = event.target.files?.[0] || null;
        setExpenseForm((prev) => ({ ...prev, file }));
    };

    const handleCreateExpense = async (event) => {
        event.preventDefault();

        if (!user || normalizedRole !== 'manager') return;

        if (!expenseForm.title.trim() || !expenseForm.amount || !expenseForm.category || !expenseForm.file) {
            toast.error('Please fill all fields and upload receipt file');
            return;
        }

        try {
            setIsCreatingExpense(true);
            const token = await user.getIdToken();
            const response = await createExpense(
                {
                    title: expenseForm.title.trim(),
                    amount: Number(expenseForm.amount),
                    category: expenseForm.category,
                    file: expenseForm.file,
                },
                token,
            );

            const created = response?.expense;
            if (created) {
                setExpenses((prev) => [created, ...prev]);
            }

            setExpenseForm({ title: '', amount: '', category: 'Rent', file: null });
            if (expenseFileInputRef.current) {
                expenseFileInputRef.current.value = '';
            }
            toast.success('Expense added successfully');
        } catch {
            toast.error('We could not add expense right now. Please try again.');
        } finally {
            setIsCreatingExpense(false);
        }
    };

    return (
        <div className="space-y-4 sm:space-y-6">
            <div>
                <h1 className={`text-xl sm:text-3xl font-bold ${isLight ? 'text-gray-900' : 'text-white'}`}>Total Expense</h1>
                <p className={`${isLight ? 'text-gray-600' : 'text-gray-400'} mt-1 text-sm sm:text-base`}>Manager expense board with member deposits and due or advance status</p>
            </div>

            <div className={`rounded-xl border p-4 sm:p-5 ${isLight ? 'bg-white border-gray-200' : 'bg-gray-800 border-gray-700'}`}>
                <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
                    <div>
                        <h2 className={`text-lg font-semibold ${isLight ? 'text-gray-900' : 'text-white'}`}>Monthly Timeline</h2>
                        <p className={`text-xs sm:text-sm ${isLight ? 'text-gray-500' : 'text-gray-400'}`}>
                            Meal rate, expense sum, deposit, and group balance can be viewed from the timeline.
                        </p>
                    </div>
                    <input
                        type="month"
                        value={selectedMonth}
                        onChange={(event) => setSelectedMonth(event.target.value)}
                        className={`rounded-lg border px-3 py-2 text-sm ${isLight ? 'bg-white border-gray-300 text-gray-900' : 'bg-gray-700 border-gray-600 text-white'}`}
                    />
                </div>

                <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
                    <div className={`p-3 rounded-lg ${isLight ? 'bg-gray-50' : 'bg-gray-700/40'}`}>
                        <p className="text-xs uppercase tracking-wide opacity-70">Total Bazar</p>
                        <p className="font-semibold">৳ {totalBazarCost.toFixed(2)}</p>
                    </div>
                    <div className={`p-3 rounded-lg ${isLight ? 'bg-gray-50' : 'bg-gray-700/40'}`}>
                        <p className="text-xs uppercase tracking-wide opacity-70">Total Meal</p>
                        <p className="font-semibold">{totalMealCount.toFixed(2)}</p>
                    </div>
                    <div className={`p-3 rounded-lg ${isLight ? 'bg-blue-50 border border-blue-200' : 'bg-blue-900/20 border border-blue-800'}`}>
                        <p className="text-xs uppercase tracking-wide opacity-70">Meal Rate</p>
                        <p className="font-bold">৳ {mealRate.toFixed(2)}</p>
                    </div>
                    <div className={`p-3 rounded-lg ${isLight ? 'bg-violet-50 border border-violet-200' : 'bg-violet-900/20 border border-violet-800'}`}>
                        <p className="text-xs uppercase tracking-wide opacity-70">All Expense</p>
                        <p className="font-bold">৳ {totalExpense.toFixed(2)}</p>
                    </div>
                    <div className={`p-3 rounded-lg ${groupTotalBalance >= 0
                        ? (isLight ? 'bg-green-50 border border-green-200' : 'bg-green-900/20 border border-green-800')
                        : (isLight ? 'bg-red-50 border border-red-200' : 'bg-red-900/20 border border-red-800')
                        }`}>
                        <p className="text-xs uppercase tracking-wide opacity-70">Group Total Balance</p>
                        <p className={`font-bold ${groupTotalBalance >= 0 ? 'text-green-600' : 'text-red-500'}`}>
                            {groupTotalBalance >= 0
                                ? `Advance ৳ ${groupTotalBalance.toFixed(2)}`
                                : `Due ৳ ${Math.abs(groupTotalBalance).toFixed(2)}`}
                        </p>
                    </div>
                </div>
            </div>

            {normalizedRole === 'manager' && (
                <form
                    onSubmit={handleCreateExpense}
                    className={`rounded-xl border p-4 sm:p-5 ${isLight ? 'bg-white border-gray-200' : 'bg-gray-800 border-gray-700'} grid grid-cols-1 sm:grid-cols-2 gap-3`}
                >
                    <div className="sm:col-span-2">
                        <h2 className={`text-lg font-semibold ${isLight ? 'text-gray-900' : 'text-white'}`}>Add Expense (Manager Only)</h2>
                    </div>
                    <input
                        name="title"
                        value={expenseForm.title}
                        onChange={handleInputChange}
                        placeholder="Expense title"
                        className={`rounded-lg border px-3 py-2 text-sm ${isLight ? 'bg-white border-gray-300 text-gray-900' : 'bg-gray-700 border-gray-600 text-white'}`}
                        required
                    />
                    <input
                        name="amount"
                        type="number"
                        min="0"
                        step="0.01"
                        value={expenseForm.amount}
                        onChange={handleInputChange}
                        placeholder="Amount"
                        className={`rounded-lg border px-3 py-2 text-sm ${isLight ? 'bg-white border-gray-300 text-gray-900' : 'bg-gray-700 border-gray-600 text-white'}`}
                        required
                    />
                    <select
                        name="category"
                        value={expenseForm.category}
                        onChange={handleInputChange}
                        className={`rounded-lg border px-3 py-2 text-sm ${isLight ? 'bg-white border-gray-300 text-gray-900' : 'bg-gray-700 border-gray-600 text-white'}`}
                    >
                        <option value="rent">Rent</option>
                        <option value="utilities">Utilities</option>
                        <option value="cook">Cook</option>
                        <option value="misc">Misc</option>
                    </select>
                    <input
                        ref={expenseFileInputRef}
                        type="file"
                        accept="image/*,.pdf"
                        onChange={handleFileChange}
                        className={`rounded-lg border px-3 py-2 text-sm ${isLight ? 'bg-white border-gray-300 text-gray-900' : 'bg-gray-700 border-gray-600 text-white'}`}
                        required
                    />
                    <div className="sm:col-span-2">
                        <button
                            type="submit"
                            disabled={isCreatingExpense}
                            className="rounded-lg bg-violet-600 hover:bg-violet-700 px-4 py-2 text-sm font-medium text-white disabled:opacity-60"
                        >
                            {isCreatingExpense ? 'Saving...' : 'Add Expense'}
                        </button>
                    </div>
                </form>
            )}

            <div className={`rounded-xl border p-4 sm:p-5 ${isLight ? 'bg-white border-gray-200' : 'bg-gray-800 border-gray-700'}`}>
                {isLoading && <p className="text-sm mb-3">Loading expenses...</p>}
                <div className="space-y-3">
                    {Object.keys(categorySummary).length === 0 && !isLoading && (
                        <p className="text-sm">No expense data found.</p>
                    )}
                    {Object.entries(categorySummary).map(([name, amount]) => (
                        <div key={name} className="flex items-center justify-between">
                            <p className="text-sm sm:text-base capitalize">{name}</p>
                            <p className="font-semibold">৳ {Number(amount).toLocaleString()}</p>
                        </div>
                    ))}
                </div>
                <div className={`mt-4 pt-4 border-t ${isLight ? 'border-gray-200' : 'border-gray-700'} flex items-center justify-between`}>
                    <p className="font-semibold">Grand Total</p>
                    <p className="font-bold text-lg">৳ {otherExpenseTotal.toLocaleString()}</p>
                </div>
            </div>

            <div className={`rounded-xl border overflow-hidden ${isLight ? 'bg-white border-gray-200' : 'bg-gray-800 border-gray-700'}`}>
                <div className={`px-4 sm:px-5 py-3 border-b ${isLight ? 'bg-gray-50 border-gray-200' : 'bg-gray-700/60 border-gray-700'}`}>
                    <h2 className={`text-lg font-semibold ${isLight ? 'text-gray-900' : 'text-white'}`}>Member Deposit and Due Table</h2>
                    <p className={`text-xs sm:text-sm ${isLight ? 'text-gray-500' : 'text-gray-400'}`}>Individual deposit amount, meal expense, total payable, due or advance</p>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full min-w-190">
                        <thead className={`${isLight ? 'bg-gray-50' : 'bg-gray-700/40'}`}>
                            <tr>
                                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide">Member</th>
                                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide">Meal Count</th>
                                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide">Meal Expense</th>
                                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide">Other Share</th>
                                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide">Total Payable</th>
                                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide">Deposit</th>
                                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide">Due or Advance</th>
                            </tr>
                        </thead>
                        <tbody>
                            {memberLedger.map((row) => (
                                <tr key={row.email || row.name} className={`border-t ${isLight ? 'border-gray-200' : 'border-gray-700'}`}>
                                    <td className="px-4 py-3 text-sm">
                                        <div>
                                            <p className="font-medium">{row.name}</p>
                                            <p className={`text-xs ${isLight ? 'text-gray-500' : 'text-gray-400'}`}>{row.email || 'No email'}</p>
                                        </div>
                                    </td>
                                    <td className="px-4 py-3 text-sm">{row.mealCount.toFixed(2)}</td>
                                    <td className="px-4 py-3 text-sm">৳ {row.mealExpense.toFixed(2)}</td>
                                    <td className="px-4 py-3 text-sm">৳ {row.otherShare.toFixed(2)}</td>
                                    <td className="px-4 py-3 text-sm font-semibold">৳ {row.totalPayable.toFixed(2)}</td>
                                    <td className="px-4 py-3 text-sm">৳ {row.depositAmount.toFixed(2)}</td>
                                    <td className="px-4 py-3 text-sm">
                                        <span className={`font-semibold ${row.balance >= 0 ? 'text-green-600' : 'text-red-500'}`}>
                                            {row.balance >= 0
                                                ? `Advance ৳ ${row.balance.toFixed(2)}`
                                                : `Due ৳ ${Math.abs(row.balance).toFixed(2)}`}
                                        </span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                <div className={`px-4 sm:px-5 py-3 border-t ${isLight ? 'border-gray-200 bg-gray-50' : 'border-gray-700 bg-gray-700/30'} flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2`}>
                    <p className="text-sm">Total Deposit: <span className="font-semibold">৳ {totalDeposit.toFixed(2)}</span></p>
                    <p className="text-sm">Total Expense: <span className="font-semibold">৳ {totalExpense.toFixed(2)}</span></p>
                    <p className={`text-sm font-bold ${groupTotalBalance >= 0 ? 'text-green-600' : 'text-red-500'}`}>
                        Group Balance: {groupTotalBalance >= 0
                            ? `Advance ৳ ${groupTotalBalance.toFixed(2)}`
                            : `Due ৳ ${Math.abs(groupTotalBalance).toFixed(2)}`}
                    </p>
                </div>
            </div>

            <div className={`rounded-xl border p-4 sm:p-5 ${isLight ? 'bg-white border-gray-200' : 'bg-gray-800 border-gray-700'}`}>
                <h2 className={`text-lg font-semibold mb-3 ${isLight ? 'text-gray-900' : 'text-white'}`}>Recent Expense Entries</h2>
                <div className="space-y-2">
                    {expenses.length === 0 && <p className="text-sm">No expense entries found.</p>}
                    {expenses.slice(0, 10).map((item) => (
                        <div key={item._id} className={`flex items-center justify-between p-3 rounded-lg ${isLight ? 'bg-gray-50' : 'bg-gray-700/40'}`}>
                            <div>
                                <p className="text-sm font-medium">{item.title}</p>
                                <p className="text-xs opacity-70 capitalize">
                                    {item.category} • {new Date(item.createdAt).toLocaleDateString()}
                                </p>
                            </div>
                            <p className="font-semibold">৳ {Number(item.amount || 0).toLocaleString()}</p>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default TotalExpensePage;
