import React, { use, useEffect, useMemo, useState } from 'react';
import { AuthContext } from '../../provider/AuthContext';
import { toast } from 'react-toastify';
import { getBazar } from '../../utils/bazarApi';

const BazarPage = () => {
    const { isLight, user, currentGroup } = use(AuthContext);
    const [items, setItems] = useState([]);
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        const loadBazarItems = async () => {
            if (!user || !currentGroup?.id) {
                return;
            }

            try {
                setIsLoading(true);
                const token = await user.getIdToken();
                const data = await getBazar(token, { groupID: currentGroup.id });
                setItems(data?.data || []);
            } catch (error) {
                toast.error(error.message || 'Failed to load bazar entries');
            } finally {
                setIsLoading(false);
            }
        };

        loadBazarItems();
    }, [user, currentGroup?.id]);

    const totalCost = useMemo(
        () => items.reduce((sum, item) => {
            const itemTotal = Array.isArray(item?.price)
                ? item.price.reduce((acc, value) => acc + Number(value || 0), 0)
                : Number(item?.price || 0);
            return sum + itemTotal;
        }, 0),
        [items],
    );

    return (
        <div className="space-y-4 sm:space-y-6">
            <div>
                <h1 className={`text-xl sm:text-3xl font-bold ${isLight ? 'text-gray-900' : 'text-white'}`}>Bazar</h1>
                <p className={`${isLight ? 'text-gray-600' : 'text-gray-400'} mt-1 text-sm sm:text-base`}>Latest bazar entries from your group</p>
            </div>

            <div className={`rounded-xl border p-4 sm:p-5 ${isLight ? 'bg-white border-gray-200' : 'bg-gray-800 border-gray-700'}`}>
                <div className="space-y-3">
                    {isLoading && <p className="text-sm">Loading entries...</p>}

                    {!isLoading && items.length === 0 && (
                        <p className="text-sm">No bazar entries found for this group.</p>
                    )}

                    {!isLoading && items.map((item) => (
                        <div key={item._id} className={`grid grid-cols-1 sm:grid-cols-3 gap-2 p-3 rounded-lg ${isLight ? 'bg-gray-50' : 'bg-gray-700/40'}`}>
                            <div>
                                <p className="text-sm font-medium">
                                    {Array.isArray(item.item) && item.item.length > 0
                                        ? item.item.join(', ')
                                        : 'Bazar item'}
                                </p>
                                <p className={`text-xs ${isLight ? 'text-gray-600' : 'text-gray-400'}`}>
                                    {Array.isArray(item.quantity) && item.quantity.length > 0
                                        ? `Qty: ${item.quantity.join(', ')}`
                                        : 'No quantity info'}
                                </p>
                            </div>
                            <p className="text-sm">{new Date(item.date || item.createdAt).toLocaleDateString()}</p>
                            <p className="text-sm font-semibold sm:text-right">
                                ৳ {(
                                    Array.isArray(item.price)
                                        ? item.price.reduce((acc, value) => acc + Number(value || 0), 0)
                                        : Number(item.price || 0)
                                ).toLocaleString()}
                            </p>
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
