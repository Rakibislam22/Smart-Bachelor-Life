import React, { use, useCallback, useEffect, useState } from 'react';
import { AuthContext } from '../../provider/AuthContext';
import { toast } from 'react-toastify';
import { updateGroupPaymentNotice } from '../../utils/groupApi';
import { confirmPayment, createPayment, getManagerPayments, getUserPayments, rejectPayment } from '../../utils/paymentApi';

const PaymentPage = () => {
    const { isLight, user, userRole, currentGroup, setCurrentGroup } = use(AuthContext);
    const normalizedRole = userRole ? userRole.toLowerCase() : null;
    const [payments, setPayments] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [isSavingNotice, setIsSavingNotice] = useState(false);
    const [paymentNoticeInput, setPaymentNoticeInput] = useState('');
    const [formData, setFormData] = useState({
        amount: '',
        paymentMethod: 'Bkash',
        senderNumber: '',
        transactionID: '',
    });

    const isStripeMethod = formData.paymentMethod === 'Stripe';

    useEffect(() => {
        setPaymentNoticeInput(currentGroup?.paymentNotice || 'Bkash number is 01233');
    }, [currentGroup?.paymentNotice]);

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
        setFormData((prev) => {
            if (name === 'paymentMethod') {
                return {
                    ...prev,
                    paymentMethod: value,
                    senderNumber: value === 'Stripe' ? '' : prev.senderNumber,
                    transactionID: value === 'Stripe' ? '' : prev.transactionID,
                };
            }

            return { ...prev, [name]: value };
        });
    };

    const handleSavePaymentNotice = async () => {
        if (!user || normalizedRole !== 'manager') {
            return;
        }

        try {
            setIsSavingNotice(true);
            const token = await user.getIdToken();
            const response = await updateGroupPaymentNotice(paymentNoticeInput, token);
            setCurrentGroup(response?.group || currentGroup);
            toast.success('Payment notice updated successfully');
        } catch (error) {
            toast.error(error.message || 'Failed to update payment notice');
        } finally {
            setIsSavingNotice(false);
        }
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
                    senderNumber: isStripeMethod ? '' : formData.senderNumber,
                    transactionID: isStripeMethod
                        ? `STRIPE-${Date.now()}`
                        : formData.transactionID,
                },
                token,
            );

            toast.success('Payment created successfully');
            setFormData({ amount: '', paymentMethod: 'Bkash', senderNumber: '', transactionID: '' });
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

    const handleRejectPayment = async (paymentID, transactionID) => {
        if (!user) {
            return;
        }

        try {
            const token = await user.getIdToken();
            await rejectPayment(paymentID, transactionID, token);
            toast.success('Payment rejected successfully');
            await loadPayments();
        } catch (error) {
            toast.error(error.message || 'Failed to reject payment');
        }
    };

    return (
        <div className="space-y-4 sm:space-y-6">
            <div>
                <h1 className={`text-xl sm:text-3xl font-bold ${isLight ? 'text-gray-900' : 'text-white'}`}>Payment & Receipt</h1>
                <p className={`${isLight ? 'text-gray-600' : 'text-gray-400'} mt-1 text-sm sm:text-base`}>Payment records and confirmation</p>
            </div>

            <div className={`rounded-xl border p-4 sm:p-5 ${isLight ? 'bg-white border-gray-200' : 'bg-gray-800 border-gray-700'}`}>
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                    <div className="space-y-1">
                        <p className={`text-sm font-semibold ${isLight ? 'text-gray-900' : 'text-white'}`}>Payment Notice</p>
                        {normalizedRole === 'manager' ? (
                            <p className={`text-xs ${isLight ? 'text-gray-600' : 'text-gray-400'}`}>
                                This notice is visible to all members and only the manager can edit it.
                            </p>
                        ) : null}
                    </div>
                    {normalizedRole === 'manager' ? (
                        <button
                            type="button"
                            onClick={handleSavePaymentNotice}
                            disabled={isSavingNotice}
                            className="rounded-lg bg-violet-600 px-4 py-2 text-sm font-medium text-white hover:bg-violet-700 disabled:opacity-60"
                        >
                            {isSavingNotice ? 'Saving...' : 'Save Notice'}
                        </button>
                    ) : null}
                </div>

                {normalizedRole === 'manager' ? (
                    <textarea
                        value={paymentNoticeInput}
                        onChange={(e) => setPaymentNoticeInput(e.target.value)}
                        placeholder="Example: Bkash number is 01233"
                        rows={3}
                        className={`mt-3 w-full rounded-lg border px-3 py-2 text-sm ${isLight ? 'bg-white border-gray-300 text-gray-900' : 'bg-gray-700 border-gray-600 text-white'}`}
                    />
                ) : (
                    <div className={`mt-3 rounded-lg border px-3 py-2 text-sm ${isLight ? 'border-blue-200 bg-blue-50 text-blue-900' : 'border-blue-800 bg-blue-900/20 text-blue-100'}`}>
                        {currentGroup?.paymentNotice || 'Bkash number is 01233'}
                    </div>
                )}
            </div>

            <form onSubmit={handleCreatePayment} className={`rounded-xl border p-4 sm:p-5 ${isLight ? 'bg-white border-gray-200' : 'bg-gray-800 border-gray-700'} grid grid-cols-1 sm:grid-cols-2 gap-3`}>
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
                    <option value="Stripe">Stripe</option>
                </select>
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
                {!isStripeMethod && (
                    <input
                        name="senderNumber"
                        value={formData.senderNumber}
                        onChange={handleInputChange}
                        placeholder="Sender Number"
                        className={`rounded-lg border px-3 py-2 text-sm ${isLight ? 'bg-white border-gray-300 text-gray-900' : 'bg-gray-700 border-gray-600 text-white'}`}
                        required
                    />
                )}
                {!isStripeMethod && (
                    <input
                        name="transactionID"
                        value={formData.transactionID}
                        onChange={handleInputChange}
                        placeholder="Transaction ID"
                        className={`rounded-lg border px-3 py-2 text-sm ${isLight ? 'bg-white border-gray-300 text-gray-900' : 'bg-gray-700 border-gray-600 text-white'}`}
                        required
                    />
                )}
                <div className="sm:col-span-2">
                    <button type="submit" className="rounded-lg bg-violet-600 hover:bg-violet-700 px-4 py-2 text-sm font-medium text-white">
                        {isStripeMethod ? 'Pay' : 'Submit Payment'}
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
                                <th className="px-4 py-3 text-left text-sm">Transaction ID</th>
                                <th className="px-4 py-3 text-left text-sm">Status</th>
                                {normalizedRole === 'manager' && <th className="px-4 py-3 text-left text-sm">Action</th>}
                            </tr>
                        </thead>
                        <tbody>
                            {isLoading && (
                                <tr>
                                    <td colSpan={normalizedRole === 'manager' ? 7 : 6} className="px-4 py-4 text-sm">Loading payments...</td>
                                </tr>
                            )}

                            {!isLoading && payments.length === 0 && (
                                <tr>
                                    <td colSpan={normalizedRole === 'manager' ? 7 : 6} className="px-4 py-4 text-sm">No payments found.</td>
                                </tr>
                            )}

                            {payments.map((item) => (
                                <tr key={item._id} className={`border-t ${isLight ? 'border-gray-200' : 'border-gray-700'}`}>
                                    <td className="px-4 py-3 text-sm">{item?.userID?.displayName || item?.userID?.email || 'You'}</td>
                                    <td className="px-4 py-3 text-sm">৳ {Number(item.amount || 0).toLocaleString()}</td>
                                    <td className="px-4 py-3 text-sm">{new Date(item.createdAt).toLocaleDateString()}</td>
                                    <td className="px-4 py-3 text-sm">{item.paymentMethod}</td>
                                    <td className="px-4 py-3 text-sm font-mono">{item.transactionID || 'N/A'}</td>
                                    <td className="px-4 py-3 text-sm">{item.status}</td>
                                    {normalizedRole === 'manager' && (
                                        <td className="px-4 py-3 text-sm">
                                            {item.status === 'PENDING' ? (
                                                <div className="flex flex-wrap gap-2">
                                                    <button
                                                        type="button"
                                                        onClick={() => handleConfirmPayment(item._id, item.transactionID)}
                                                        className="rounded-md bg-green-600 px-2 py-1 text-xs text-white hover:bg-green-700"
                                                    >
                                                        Confirm
                                                    </button>
                                                    <button
                                                        type="button"
                                                        onClick={() => handleRejectPayment(item._id, item.transactionID)}
                                                        className="rounded-md bg-red-600 px-2 py-1 text-xs text-white hover:bg-red-700"
                                                    >
                                                        Reject
                                                    </button>
                                                </div>
                                            ) : (
                                                <span className="text-xs text-gray-500">
                                                    {item.status === 'FAILED' ? 'Rejected' : 'Confirmed'}
                                                </span>
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
