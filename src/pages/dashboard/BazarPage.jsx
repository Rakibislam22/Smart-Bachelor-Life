import React, { use, useEffect, useMemo, useState } from 'react';
import { AuthContext } from '../../provider/AuthContext';
import Loading from '../../component/Loading';
import { toast } from 'react-toastify';
import { createBazar, getBazar } from '../../utils/bazarApi';

const BazarPage = () => {
    const { isLight, user, userRole, currentGroup } = use(AuthContext);
    const normalizedRole = userRole ? userRole.toLowerCase() : null;
    const groupId = currentGroup?.id || currentGroup?._id || null;
    const [items, setItems] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [isSheetOpen, setIsSheetOpen] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [bazarForm, setBazarForm] = useState({
        item: '',
        quantity: '',
        price: '',
        file: null,
    });

    const parseSheetValues = (value) => {
        return String(value || '')
            .split(/[\n,]/)
            .map((entry) => entry.trim())
            .filter(Boolean);
    };

    useEffect(() => {
        const loadBazarItems = async () => {
            if (!user || !groupId) {
                return;
            }

            try {
                setIsLoading(true);
                const token = await user.getIdToken();
                const data = await getBazar(token, { groupID: groupId });
                setItems(data?.data || []);
            } catch {
                toast.error('We could not load bazar entries right now. Please try again.');
            } finally {
                setIsLoading(false);
            }
        };

        loadBazarItems();
    }, [user, groupId]);

    const handleCreateBazar = async (e) => {
        e.preventDefault();

        if (!user || normalizedRole !== 'manager' || !groupId) {
            return;
        }

        const itemList = parseSheetValues(bazarForm.item);
        const quantityList = parseSheetValues(bazarForm.quantity);
        const priceList = parseSheetValues(bazarForm.price);

        if (!itemList.length || !quantityList.length || !priceList.length) {
            toast.error('Please add item, quantity, and price details');
            return;
        }

        if (itemList.length !== quantityList.length || itemList.length !== priceList.length) {
            toast.error('Item, quantity, and price count must match');
            return;
        }

        if (!bazarForm.file) {
            toast.error('Please upload a receipt or document');
            return;
        }

        try {
            setIsSaving(true);
            const token = await user.getIdToken();
            const response = await createBazar({
                groupID: groupId,
                item: itemList,
                quantity: quantityList,
                price: priceList,
                file: bazarForm.file,
            }, token);

            const createdBazar = response?.bazar || response?.data || response?.item || response;
            if (createdBazar) {
                setItems((prev) => [createdBazar, ...prev]);
            }

            toast.success('Bazar detail added successfully');
            setIsSheetOpen(false);
            setBazarForm({
                item: '',
                quantity: '',
                price: '',
                file: null,
            });
        } catch {
            toast.error('We could not add bazar detail right now. Please try again.');
        } finally {
            setIsSaving(false);
        }
    };

    const totalCost = useMemo(
        () => items.reduce((sum, item) => {
            const itemTotal = Array.isArray(item?.price)
                ? item.price.reduce((acc, value) => acc + Number(value || 0), 0)
                : Number(item?.price || 0);
            return sum + itemTotal;
        }, 0),
        [items],
    );

    const getAddedByName = (item) => {
        const author = item?.userID;

        if (author && typeof author === 'object') {
            return author.displayName || author.email || 'Unknown';
        }

        return 'Unknown';
    };

    if (isLoading && items.length === 0) {
        return <Loading />;
    }

    return (
        <div className="space-y-4 sm:space-y-6">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
                <div>
                    <h1 className={`text-xl sm:text-3xl font-bold ${isLight ? 'text-gray-900' : 'text-white'}`}>Bazar</h1>
                    <p className={`${isLight ? 'text-gray-600' : 'text-gray-400'} mt-1 text-sm sm:text-base`}>Latest bazar entries from your group</p>
                </div>

                {normalizedRole === 'manager' && (
                    <button
                        type="button"
                        onClick={() => setIsSheetOpen(true)}
                        className="inline-flex items-center justify-center rounded-xl bg-linear-to-r from-violet-600 via-fuchsia-600 to-indigo-600 px-4 py-3 text-sm font-semibold text-white shadow-lg shadow-violet-600/20 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-xl hover:shadow-violet-600/30 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:ring-offset-2"
                    >
                        Add Bazar Detail
                    </button>
                )}
            </div>

            <div className={`rounded-2xl border overflow-hidden shadow-sm ${isLight ? 'bg-white border-gray-200' : 'bg-gray-800 border-gray-700'}`}>
                <div className={`flex items-center justify-between px-4 sm:px-5 py-3 border-b ${isLight ? 'bg-gray-50 border-gray-200' : 'bg-gray-700/60 border-gray-700'}`}>
                    <div>
                        <p className={`text-sm font-semibold ${isLight ? 'text-gray-900' : 'text-white'}`}>Bazar Sheet</p>
                        <p className={`text-xs ${isLight ? 'text-gray-500' : 'text-gray-400'}`}>Visible to all group members</p>
                    </div>
                    <p className={`text-sm font-semibold ${isLight ? 'text-gray-700' : 'text-gray-200'}`}>Total: ৳ {totalCost.toLocaleString()}</p>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full min-w-190 border-collapse">
                        <thead className={`${isLight ? 'bg-gray-50' : 'bg-gray-700/50'}`}>
                            <tr>
                                <th className={`px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide ${isLight ? 'text-gray-600' : 'text-gray-300'}`}>Date</th>
                                <th className={`px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide ${isLight ? 'text-gray-600' : 'text-gray-300'}`}>Item Details</th>
                                <th className={`px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide ${isLight ? 'text-gray-600' : 'text-gray-300'}`}>Quantity</th>
                                <th className={`px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide ${isLight ? 'text-gray-600' : 'text-gray-300'}`}>Price</th>
                                <th className={`px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide ${isLight ? 'text-gray-600' : 'text-gray-300'}`}>Added By</th>
                                <th className={`px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide ${isLight ? 'text-gray-600' : 'text-gray-300'}`}>Document</th>
                            </tr>
                        </thead>
                        <tbody>
                            {isLoading && (
                                <tr>
                                    <td colSpan={6} className="px-4 py-6 text-sm">
                                        Loading entries...
                                    </td>
                                </tr>
                            )}

                            {!isLoading && items.length === 0 && (
                                <tr>
                                    <td colSpan={6} className="px-4 py-6 text-sm">
                                        No bazar entries found for this group.
                                    </td>
                                </tr>
                            )}

                            {!isLoading && items.map((item) => {
                                const itemTotal = Array.isArray(item.price)
                                    ? item.price.reduce((acc, value) => acc + Number(value || 0), 0)
                                    : Number(item.price || 0);

                                return (
                                    <tr key={item._id} className={`border-t ${isLight ? 'border-gray-200' : 'border-gray-700'}`}>
                                        <td className="px-4 py-4 text-sm whitespace-nowrap">
                                            {new Date(item.date || item.createdAt).toLocaleDateString()}
                                        </td>
                                        <td className="px-4 py-4 text-sm">
                                            <div className="space-y-1">
                                                <p className="font-medium">
                                                    {Array.isArray(item.item) && item.item.length > 0 ? item.item.join(', ') : 'Bazar item'}
                                                </p>
                                                <p className={`text-xs ${isLight ? 'text-gray-500' : 'text-gray-400'}`}>
                                                    {Array.isArray(item.item) ? `${item.item.length} entries` : 'No item details'}
                                                </p>
                                            </div>
                                        </td>
                                        <td className="px-4 py-4 text-sm">
                                            {Array.isArray(item.quantity) && item.quantity.length > 0
                                                ? item.quantity.join(', ')
                                                : 'No quantity info'}
                                        </td>
                                        <td className="px-4 py-4 text-sm font-semibold whitespace-nowrap">
                                            ৳ {itemTotal.toLocaleString()}
                                        </td>
                                        <td className="px-4 py-4 text-sm whitespace-nowrap">
                                            {getAddedByName(item)}
                                        </td>
                                        <td className="px-4 py-4 text-sm">
                                            {item.documentURL ? (
                                                <a
                                                    href={item.documentURL}
                                                    target="_blank"
                                                    rel="noreferrer"
                                                    className="text-violet-600 hover:underline"
                                                >
                                                    View sheet
                                                </a>
                                            ) : (
                                                <span className={isLight ? 'text-gray-500' : 'text-gray-400'}>N/A</span>
                                            )}
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            </div>

            {isSheetOpen && normalizedRole === 'manager' && (
                <div className="fixed inset-0 z-80 flex items-end justify-center bg-black/50 px-0 pb-16 pt-0 sm:px-6 sm:pb-6 sm:pt-6">
                    <div className={`mx-2 flex w-[calc(100%-1rem)] max-w-3xl max-h-[90vh] flex-col rounded-t-3xl border shadow-2xl sm:mx-0 sm:w-full sm:max-h-[92vh] ${isLight ? 'bg-white border-gray-200' : 'bg-gray-900 border-gray-700'}`}>
                        <div className={`flex items-center justify-between px-4 sm:px-6 py-4 border-b ${isLight ? 'border-gray-200' : 'border-gray-700'}`}>
                            <div>
                                <h2 className={`text-lg sm:text-xl font-semibold ${isLight ? 'text-gray-900' : 'text-white'}`}>Add Bazar Detail</h2>
                                <p className={`text-xs sm:text-sm ${isLight ? 'text-gray-500' : 'text-gray-400'}`}>Manager can add a new sheet entry for the whole group</p>
                            </div>
                            <button
                                type="button"
                                onClick={() => setIsSheetOpen(false)}
                                className={`h-10 w-10 rounded-full text-lg font-semibold transition-colors ${isLight ? 'bg-gray-100 text-gray-700 hover:bg-gray-200' : 'bg-gray-800 text-gray-200 hover:bg-gray-700'}`}
                                aria-label="Close bazar sheet"
                            >
                                ×
                            </button>
                        </div>

                        <form onSubmit={handleCreateBazar} className="flex-1 overflow-y-auto">
                            <div className="space-y-5 px-4 sm:px-6 py-5">
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    <label className="space-y-2">
                                        <span className={`text-sm font-medium ${isLight ? 'text-gray-700' : 'text-gray-200'}`}>Item details</span>
                                        <textarea
                                            value={bazarForm.item}
                                            onChange={(e) => setBazarForm((prev) => ({ ...prev, item: e.target.value }))}
                                            placeholder="Rice, oil, vegetables..."
                                            rows={4}
                                            className={`w-full rounded-xl border px-4 py-3 text-sm shadow-sm resize-none transition-all duration-200 ${isLight ? 'bg-white border-gray-300 text-gray-900 placeholder:text-gray-400' : 'bg-gray-800 border-gray-700 text-white placeholder:text-gray-500'} focus:outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-500/30`}
                                            required
                                        />
                                    </label>

                                    <label className="space-y-2">
                                        <span className={`text-sm font-medium ${isLight ? 'text-gray-700' : 'text-gray-200'}`}>Quantity</span>
                                        <textarea
                                            value={bazarForm.quantity}
                                            onChange={(e) => setBazarForm((prev) => ({ ...prev, quantity: e.target.value }))}
                                            placeholder="2, 4, 1..."
                                            rows={4}
                                            className={`w-full rounded-xl border px-4 py-3 text-sm shadow-sm resize-none transition-all duration-200 ${isLight ? 'bg-white border-gray-300 text-gray-900 placeholder:text-gray-400' : 'bg-gray-800 border-gray-700 text-white placeholder:text-gray-500'} focus:outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-500/30`}
                                            required
                                        />
                                    </label>

                                    <label className="space-y-2">
                                        <span className={`text-sm font-medium ${isLight ? 'text-gray-700' : 'text-gray-200'}`}>Price</span>
                                        <textarea
                                            value={bazarForm.price}
                                            onChange={(e) => setBazarForm((prev) => ({ ...prev, price: e.target.value }))}
                                            placeholder="120, 450, 80..."
                                            rows={4}
                                            className={`w-full rounded-xl border px-4 py-3 text-sm shadow-sm resize-none transition-all duration-200 ${isLight ? 'bg-white border-gray-300 text-gray-900 placeholder:text-gray-400' : 'bg-gray-800 border-gray-700 text-white placeholder:text-gray-500'} focus:outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-500/30`}
                                            required
                                        />
                                    </label>
                                </div>

                                <div className="grid grid-cols-1 gap-4 items-end">
                                    <label className="space-y-2">
                                        <span className={`text-sm font-medium ${isLight ? 'text-gray-700' : 'text-gray-200'}`}>Sheet document</span>
                                        <input
                                            type="file"
                                            onChange={(e) => setBazarForm((prev) => ({ ...prev, file: e.target.files?.[0] || null }))}
                                            className={`block w-full rounded-xl border px-4 py-3 text-sm shadow-sm ${isLight ? 'bg-white border-gray-300 text-gray-900 file:mr-4 file:rounded-lg file:border-0 file:bg-violet-600 file:px-4 file:py-2 file:text-white' : 'bg-gray-800 border-gray-700 text-white file:mr-4 file:rounded-lg file:border-0 file:bg-violet-600 file:px-4 file:py-2 file:text-white'} focus:outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-500/30`}
                                            required
                                        />
                                    </label>
                                </div>
                            </div>

                            <div className={`sticky bottom-0 border-t px-4 sm:px-6 pt-3 sm:pt-4 pb-[calc(env(safe-area-inset-bottom)+0.75rem)] ${isLight ? 'border-gray-200 bg-white' : 'border-gray-700 bg-gray-900'}`}>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                    <button
                                        type="button"
                                        onClick={() => setIsSheetOpen(false)}
                                        className={`inline-flex h-12 items-center justify-center rounded-xl border px-6 text-sm font-semibold transition-colors ${isLight ? 'border-gray-300 text-gray-800 hover:bg-gray-100' : 'border-gray-600 text-gray-200 hover:bg-gray-800'}`}
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={isSaving}
                                        className="inline-flex h-12 items-center justify-center rounded-xl bg-linear-to-r from-violet-600 via-fuchsia-600 to-indigo-600 px-6 text-sm font-semibold text-white shadow-lg shadow-violet-600/20 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-xl hover:shadow-violet-600/30 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-70 disabled:hover:translate-y-0"
                                    >
                                        {isSaving ? 'Saving...' : 'Save Bazar Detail'}
                                    </button>
                                </div>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default BazarPage;
