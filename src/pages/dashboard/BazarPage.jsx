import React, { use, useEffect, useMemo, useState } from 'react';
import { AuthContext } from '../../provider/AuthContext';
import { toast } from 'react-toastify';
import { getExpenses } from '../../utils/expenseApi';

const BazarPage = () => {
    const { isLight, user } = use(AuthContext);
    const [items, setItems] = useState([]);
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        const loadExpenses = async () => {
            if (!user) {
                return;
            }

            try {
                setIsLoading(true);
                const token = await user.getIdToken();
                const data = await getExpenses(token);
                setItems(data?.expenses || []);
            } catch (error) {
                toast.error(error.message || 'Failed to load bazar entries');
            } finally {
                setIsLoading(false);
            }
        };

        loadExpenses();
    }, [user]);

    const totalCost = useMemo(
        () => items.reduce((sum, item) => sum + Number(item.amount || 0), 0),
        [items],
    );

    return (
        <div className="space-y-4 sm:space-y-6">
            <div>
                <h1 className={`text-xl sm:text-3xl font-bold ${isLight ? 'text-gray-900' : 'text-white'}`}>Bazar</h1>
                <p className={`${isLight ? 'text-gray-600' : 'text-gray-400'} mt-1 text-sm sm:text-base`}>Latest bazar and expense entries</p>
            </div>

            <div className={`rounded-xl border p-4 sm:p-5 ${isLight ? 'bg-white border-gray-200' : 'bg-gray-800 border-gray-700'}`}>
                <div className="space-y-3">
                    {isLoading && <p className="text-sm">Loading entries...</p>}

                    {!isLoading && items.length === 0 && (
                        <p className="text-sm">No expense entries found for this month.</p>
                    )}

                    {!isLoading && items.map((item) => (
                        <div key={item._id} className={`grid grid-cols-1 sm:grid-cols-3 gap-2 p-3 rounded-lg ${isLight ? 'bg-gray-50' : 'bg-gray-700/40'}`}>
                            <div>
                                <p className="text-sm font-medium">{item.title}</p>
                                <p className={`text-xs ${isLight ? 'text-gray-600' : 'text-gray-400'}`}>{item.category}</p>
                            </div>
                            <p className="text-sm">{new Date(item.createdAt).toLocaleDateString()}</p>
                            <p className="text-sm font-semibold sm:text-right">৳ {Number(item.amount || 0).toLocaleString()}</p>
                        </div>
                    ))}
                </div>

                <div className={`mt-4 pt-4 border-t ${isLight ? 'border-gray-200' : 'border-gray-700'} flex items-center justify-between`}>
                    <p className="font-semibold">Total Cost</p>
                    <p className="font-bold">৳ {totalCost.toLocaleString()}</p>
                </div>
            </div>
        </div>
    );
};

export default BazarPage;
