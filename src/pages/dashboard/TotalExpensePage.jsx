import React, { use, useEffect, useMemo, useState } from 'react';
import { AuthContext } from '../../provider/AuthContext';
import { toast } from 'react-toastify';
import { createExpense, getExpenses } from '../../utils/expenseApi';

const TotalExpensePage = () => {
    const { isLight, user, userRole } = use(AuthContext);
    const normalizedRole = userRole ? userRole.toLowerCase() : null;
    const [expenses, setExpenses] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [isCreatingExpense, setIsCreatingExpense] = useState(false);
    const [expenseForm, setExpenseForm] = useState({
        title: '',
        amount: '',
        category: 'bazar',
        file: null,
    });

    useEffect(() => {
        const loadExpenses = async () => {
            if (!user) return;

            try {
                setIsLoading(true);
                const token = await user.getIdToken();
                const data = await getExpenses(token);
                setExpenses(data?.expenses || []);
            } catch (error) {
                toast.error(error.message || 'Failed to load expenses');
            } finally {
                setIsLoading(false);
            }
        };

        loadExpenses();
    }, [user]);

    const totalExpense = useMemo(
        () => expenses.reduce((sum, item) => sum + Number(item.amount || 0), 0),
        [expenses],
    );

    const categorySummary = useMemo(() => {
        return expenses.reduce((acc, item) => {
            const key = item.category || 'other';
            acc[key] = (acc[key] || 0) + Number(item.amount || 0);
            return acc;
        }, {});
    }, [expenses]);

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

            setExpenseForm({ title: '', amount: '', category: 'bazar', file: null });
            toast.success('Expense added successfully');
        } catch (error) {
            toast.error(error.message || 'Failed to add expense');
        } finally {
            setIsCreatingExpense(false);
        }
    };

    return (
        <div className="space-y-4 sm:space-y-6">
            <div>
                <h1 className={`text-xl sm:text-3xl font-bold ${isLight ? 'text-gray-900' : 'text-white'}`}>Total Expense</h1>
                <p className={`${isLight ? 'text-gray-600' : 'text-gray-400'} mt-1 text-sm sm:text-base`}>Monthly expense breakdown</p>
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
                        <option value="bazar">Bazar</option>
                        <option value="rent">Rent</option>
                        <option value="utilities">Utilities</option>
                        <option value="cook">Cook</option>
                        <option value="misc">Misc</option>
                    </select>
                    <input
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
                    <p className="font-bold text-lg">৳ {totalExpense.toLocaleString()}</p>
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
