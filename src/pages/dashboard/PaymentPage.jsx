import React, { use, useCallback, useEffect, useState } from 'react';
import { AuthContext } from '../../provider/AuthContext';
import { toast } from 'react-toastify';
import { confirmPayment, createPayment, getManagerPayments, getUserPayments } from '../../utils/paymentApi';

const PaymentPage = () => {
    const { isLight, user, userRole } = use(AuthContext);
    const normalizedRole = userRole ? userRole.toLowerCase() : null;
    const [payments, setPayments] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [formData, setFormData] = useState({
        amount: '',
        paymentMethod: 'Bkash',
        transactionID: '',
    });

    const loadPayments = useCallback(async () => {
        if (!user) {
            return;
        }

        try {
            setIsLoading(true);
            const token = await user.getIdToken();
            const data = normalizedRole === 'manager'
                ? await getManagerPayments(token)
                : await getUserPayments(token);

            setPayments(data?.payments || []);
        } catch (error) {
            toast.error(error.message || 'Failed to load payments');
        } finally {
            setIsLoading(false);
        }
    }, [user, normalizedRole]);

    useEffect(() => {
        loadPayments();
    }, [loadPayments]);

    const handleInputChange = (event) => {
        const { name, value } = event.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleCreatePayment = async (event) => {
        event.preventDefault();
        if (!user) {
            return;
        }

        try {
            const token = await user.getIdToken();
            await createPayment(
                {
                    amount: Number(formData.amount),
                    paymentMethod: formData.paymentMethod,
                    transactionID: formData.transactionID,
                },
                token,
            );

            toast.success('Payment created successfully');
            setFormData({ amount: '', paymentMethod: 'Bkash', transactionID: '' });
            await loadPayments();
        } catch (error) {
            toast.error(error.message || 'Failed to create payment');
        }
    };

    const handleConfirmPayment = async (paymentID, transactionID) => {
        if (!user) {
            return;
        }

        try {
            const token = await user.getIdToken();
            await confirmPayment(paymentID, transactionID, token);
            toast.success('Payment confirmed successfully');
            await loadPayments();
        } catch (error) {
            toast.error(error.message || 'Failed to confirm payment');
        }
    };

    return (
        <div className="space-y-4 sm:space-y-6">
            <div>
                <h1 className={`text-xl sm:text-3xl font-bold ${isLight ? 'text-gray-900' : 'text-white'}`}>Payment & Receipt</h1>
                <p className={`${isLight ? 'text-gray-600' : 'text-gray-400'} mt-1 text-sm sm:text-base`}>Payment records and confirmation</p>
            </div>

            <form onSubmit={handleCreatePayment} className={`rounded-xl border p-4 sm:p-5 ${isLight ? 'bg-white border-gray-200' : 'bg-gray-800 border-gray-700'} grid grid-cols-1 sm:grid-cols-3 gap-3`}>
                <input
                    name="amount"
                    type="number"
                    min="0"
                    step="0.01"
                    value={formData.amount}
                    onChange={handleInputChange}
                    placeholder="Amount"
                    className={`rounded-lg border px-3 py-2 text-sm ${isLight ? 'bg-white border-gray-300 text-gray-900' : 'bg-gray-700 border-gray-600 text-white'}`}
                    required
                />
                <select
                    name="paymentMethod"
                    value={formData.paymentMethod}
                    onChange={handleInputChange}
                    className={`rounded-lg border px-3 py-2 text-sm ${isLight ? 'bg-white border-gray-300 text-gray-900' : 'bg-gray-700 border-gray-600 text-white'}`}
                >
                    <option value="Bkash">Bkash</option>
                    <option value="Nagad">Nagad</option>
                    <option value="Cash">Cash</option>
                    <option value="Bank">Bank</option>
                </select>
                <input
                    name="transactionID"
                    value={formData.transactionID}
                    onChange={handleInputChange}
                    placeholder="Transaction ID"
                    className={`rounded-lg border px-3 py-2 text-sm ${isLight ? 'bg-white border-gray-300 text-gray-900' : 'bg-gray-700 border-gray-600 text-white'}`}
                    required
                />
                <div className="sm:col-span-3">
                    <button type="submit" className="rounded-lg bg-violet-600 hover:bg-violet-700 px-4 py-2 text-sm font-medium text-white">
                        Submit Payment
                    </button>
                </div>
            </form>

            <div className={`rounded-xl border overflow-hidden ${isLight ? 'bg-white border-gray-200' : 'bg-gray-800 border-gray-700'}`}>
                <div className="overflow-x-auto">
                    <table className="w-full min-w-155">
                        <thead className={`${isLight ? 'bg-gray-50' : 'bg-gray-700/60'}`}>
                            <tr>
                                <th className="px-4 py-3 text-left text-sm">Member</th>
                                <th className="px-4 py-3 text-left text-sm">Amount</th>
                                <th className="px-4 py-3 text-left text-sm">Date</th>
                                <th className="px-4 py-3 text-left text-sm">Method</th>
                                <th className="px-4 py-3 text-left text-sm">Status</th>
                                {normalizedRole === 'manager' && <th className="px-4 py-3 text-left text-sm">Action</th>}
                            </tr>
                        </thead>
                        <tbody>
                            {isLoading && (
                                <tr>
                                    <td colSpan={normalizedRole === 'manager' ? 6 : 5} className="px-4 py-4 text-sm">Loading payments...</td>
                                </tr>
                            )}

                            {!isLoading && payments.length === 0 && (
                                <tr>
                                    <td colSpan={normalizedRole === 'manager' ? 6 : 5} className="px-4 py-4 text-sm">No payments found.</td>
                                </tr>
                            )}

                            {payments.map((item) => (
                                <tr key={item._id} className={`border-t ${isLight ? 'border-gray-200' : 'border-gray-700'}`}>
                                    <td className="px-4 py-3 text-sm">{item?.userID?.displayName || item?.userID?.email || 'You'}</td>
                                    <td className="px-4 py-3 text-sm">৳ {Number(item.amount || 0).toLocaleString()}</td>
                                    <td className="px-4 py-3 text-sm">{new Date(item.createdAt).toLocaleDateString()}</td>
                                    <td className="px-4 py-3 text-sm">{item.paymentMethod}</td>
                                    <td className="px-4 py-3 text-sm">{item.status}</td>
                                    {normalizedRole === 'manager' && (
                                        <td className="px-4 py-3 text-sm">
                                            {item.status === 'PENDING' ? (
                                                <button
                                                    type="button"
                                                    onClick={() => handleConfirmPayment(item._id, item.transactionID)}
                                                    className="rounded-md bg-green-600 px-2 py-1 text-xs text-white hover:bg-green-700"
                                                >
                                                    Confirm
                                                </button>
                                            ) : (
                                                <span className="text-xs text-gray-500">Confirmed</span>
                                            )}
                                        </td>
                                    )}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default PaymentPage;
