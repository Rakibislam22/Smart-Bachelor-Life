import React, { use, useCallback, useEffect, useRef, useState } from 'react';
import { AuthContext } from '../../provider/AuthContext';
import { toast } from 'react-toastify';
import { updateGroupPaymentNotice } from '../../utils/groupApi';
import {
    confirmPayment,
    createPayment,
    createStripeCheckoutSession,
    confirmStripeSession,
    getManagerPayments,
    getUserPayments,
    rejectPayment,
} from '../../utils/paymentApi';

const PaymentPage = () => {
    const { isLight, user, userRole, currentGroup, setCurrentGroup } = use(AuthContext);
    const normalizedRole = userRole ? userRole.toLowerCase() : null;
    const [payments, setPayments] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [isSavingNotice, setIsSavingNotice] = useState(false);
    const [isStripeRedirecting, setIsStripeRedirecting] = useState(false);
    const [paymentNoticeInput, setPaymentNoticeInput] = useState('');
    const handledStripeSessionRef = useRef('');
    const shownStripeFeedbackRef = useRef('');
    const [stripeFeedbackModal, setStripeFeedbackModal] = useState({
        isOpen: false,
        type: 'success',
        message: '',
    });
    const [formData, setFormData] = useState({
        amount: '',
        paymentMethod: 'Bkash',
        senderNumber: '',
        transactionID: '',
    });

    const isStripeMethod = formData.paymentMethod === 'Stripe';
    const isSenderNumberRequired = formData.paymentMethod === 'Bkash' || formData.paymentMethod === 'Nagad';
    const hasPendingStripeSession =
        typeof window !== 'undefined' &&
        new URLSearchParams(window.location.search).get('stripe') === 'success' &&
        Boolean(new URLSearchParams(window.location.search).get('session_id'));

    useEffect(() => {
        setPaymentNoticeInput(currentGroup?.paymentNotice || 'Bkash number is 01233');
    }, [currentGroup?.paymentNotice]);

    const openStripeFeedbackModal = useCallback((type, message) => {
        setStripeFeedbackModal({
            isOpen: true,
            type,
            message,
        });
    }, []);

    const closeStripeFeedbackModal = () => {
        setStripeFeedbackModal((prev) => ({ ...prev, isOpen: false }));
    };

    const loadPayments = useCallback(async ({ silent = false } = {}) => {
        if (!user) {
            return false;
        }

        try {
            setIsLoading(true);
            const token = await user.getIdToken();
            const data = normalizedRole === 'manager'
                ? await getManagerPayments(token)
                : await getUserPayments(token);

            setPayments(data?.payments || []);
            return true;
        } catch (error) {
            if (!silent) {
                toast.error('We could not load payments right now. Please try again.');
            }
            return false;
        } finally {
            setIsLoading(false);
        }
    }, [user, normalizedRole]);

    useEffect(() => {
        if (hasPendingStripeSession) {
            return;
        }

        loadPayments();
    }, [loadPayments, hasPendingStripeSession]);

    useEffect(() => {
        const syncStripePayment = async () => {
            if (!user) {
                return;
            }

            const params = new URLSearchParams(window.location.search);
            const stripeStatus = params.get('stripe');
            const sessionId = params.get('session_id');

            if (stripeStatus !== 'success' || !sessionId) {
                if (stripeStatus === 'cancelled') {
                    if (shownStripeFeedbackRef.current !== 'cancelled') {
                        openStripeFeedbackModal('failed', 'Stripe payment was cancelled.');
                        shownStripeFeedbackRef.current = 'cancelled';
                    }
                    window.history.replaceState({}, '', window.location.pathname);
                }
                return;
            }

            if (handledStripeSessionRef.current === sessionId) {
                return;
            }

            handledStripeSessionRef.current = sessionId;

            const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

            try {
                const token = await user.getIdToken();

                let confirmed = false;
                let lastConfirmError = null;
                let confirmedResponse = null;
                for (let attempt = 0; attempt < 3; attempt += 1) {
                    try {
                        confirmedResponse = await confirmStripeSession(sessionId, token);
                        confirmed = true;
                        break;
                    } catch (error) {
                        lastConfirmError = error;
                        if (attempt < 2) {
                            await delay(900);
                        }
                    }
                }

                if (!confirmed) {
                    throw lastConfirmError || new Error('Failed to confirm Stripe payment');
                }

                if (shownStripeFeedbackRef.current !== `success-${sessionId}`) {
                    openStripeFeedbackModal('success', 'Stripe payment completed successfully.');
                    shownStripeFeedbackRef.current = `success-${sessionId}`;
                }

                if (confirmedResponse?.payment) {
                    const stripePayment = confirmedResponse.payment;
                    setPayments((prev) => {
                        const exists = prev.some((item) => item._id === stripePayment._id);
                        if (exists) {
                            return prev.map((item) => (item._id === stripePayment._id ? { ...item, ...stripePayment } : item));
                        }
                        return [stripePayment, ...prev];
                    });
                }

                let loaded = false;
                for (let attempt = 0; attempt < 3; attempt += 1) {
                    loaded = await loadPayments({ silent: true });
                    if (loaded) {
                        break;
                    }
                    if (attempt < 2) {
                        await delay(700);
                    }
                }

                if (!loaded && shownStripeFeedbackRef.current !== `load-failed-${sessionId}`) {
                    openStripeFeedbackModal('failed', 'Payment completed but history refresh failed. Please reload once.');
                    shownStripeFeedbackRef.current = `load-failed-${sessionId}`;
                }
            } catch (error) {
                if (shownStripeFeedbackRef.current !== `error-${sessionId}`) {
                    openStripeFeedbackModal('failed', error.message || 'Failed to confirm Stripe checkout session');
                    shownStripeFeedbackRef.current = `error-${sessionId}`;
                }
            } finally {
                window.history.replaceState({}, '', window.location.pathname);
            }
        };

        syncStripePayment();
    }, [user, loadPayments, openStripeFeedbackModal]);

    const handleInputChange = (event) => {
        const { name, value } = event.target;
        setFormData((prev) => {
            if (name === 'paymentMethod') {
                return {
                    ...prev,
                    paymentMethod: value,
                    senderNumber: (value === 'Stripe' || (value !== 'Bkash' && value !== 'Nagad')) ? '' : prev.senderNumber,
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
            toast.error('We could not update payment notice right now. Please try again.');
        } finally {
            setIsSavingNotice(false);
        }
    };

    const handleCreatePayment = async (event) => {
        event.preventDefault();
        if (!user) {
            return;
        }

        if (!formData.amount || Number(formData.amount) <= 0) {
            toast.error('Please enter a valid amount');
            return;
        }

        if (!isStripeMethod && !formData.transactionID.trim()) {
            toast.error('Transaction ID is required');
            return;
        }

        if (isSenderNumberRequired && !formData.senderNumber.trim()) {
            toast.error('Sender Number is required for Bkash/Nagad');
            return;
        }

        try {
            const token = await user.getIdToken();

            if (isStripeMethod) {
                setIsStripeRedirecting(true);
                const checkout = await createStripeCheckoutSession(Number(formData.amount), token);

                if (!checkout?.url) {
                    throw new Error('Stripe checkout URL not found');
                }

                window.location.assign(checkout.url);
                return;
            }

            const response = await createPayment(
                {
                    amount: Number(formData.amount),
                    paymentMethod: formData.paymentMethod,
                    senderNumber: isSenderNumberRequired ? formData.senderNumber : '',
                    transactionID: formData.transactionID,
                },
                token,
            );

            if (response?.payment) {
                const createdPayment = response.payment;
                setPayments((prev) => [createdPayment, ...prev]);
            }

            toast.success('Payment created successfully');
            setFormData({ amount: '', paymentMethod: 'Bkash', senderNumber: '', transactionID: '' });
        } catch (error) {
            toast.error('We could not create payment right now. Please try again.');
        } finally {
            setIsStripeRedirecting(false);
        }
    };

    const handleConfirmPayment = async (paymentID, transactionID) => {
        if (!user) {
            return;
        }

        try {
            const token = await user.getIdToken();
            await confirmPayment(paymentID, transactionID, token);
            setPayments((prev) => prev.map((item) => (
                item._id === paymentID ? { ...item, status: 'COMPLETED' } : item
            )));
            toast.success('Payment confirmed successfully');
        } catch (error) {
            toast.error('We could not confirm payment right now. Please try again.');
        }
    };

    const handleRejectPayment = async (paymentID, transactionID) => {
        if (!user) {
            return;
        }

        try {
            const token = await user.getIdToken();
            await rejectPayment(paymentID, transactionID, token);
            setPayments((prev) => prev.map((item) => (
                item._id === paymentID ? { ...item, status: 'FAILED' } : item
            )));
            toast.success('Payment rejected successfully');
        } catch (error) {
            toast.error('We could not reject payment right now. Please try again.');
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
                {!isStripeMethod && isSenderNumberRequired && (
                    <input
                        name="senderNumber"
                        type="number"
                        min="0"
                        step="1"
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
                    <button
                        type="submit"
                        disabled={isStripeMethod && isStripeRedirecting}
                        className="rounded-lg bg-violet-600 hover:bg-violet-700 px-4 py-2 text-sm font-medium text-white disabled:opacity-60"
                    >
                        {isStripeMethod
                            ? (isStripeRedirecting ? 'Redirecting to Stripe...' : 'Pay with Stripe')
                            : 'Submit Payment'}
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
                                    <td className="px-4 py-3 text-sm">
                                        <p className="font-mono">{item.transactionID || 'N/A'}</p>
                                        {normalizedRole === 'manager' && item.paymentMethod !== 'Stripe' && (
                                            <p className={`mt-1 text-xs ${isLight ? 'text-gray-600' : 'text-gray-400'}`}>
                                                Sender: {item.senderNumber || 'N/A'}
                                            </p>
                                        )}
                                    </td>
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

            {stripeFeedbackModal.isOpen && (
                <div className="fixed inset-0 z-100 flex items-center justify-center bg-black/40 px-4">
                    <div className={`w-full max-w-md rounded-2xl border p-5 shadow-xl ${isLight ? 'bg-white border-gray-200' : 'bg-gray-900 border-gray-700'}`}>
                        <div className="flex items-start justify-between gap-3">
                            <h3 className={`text-lg font-semibold ${stripeFeedbackModal.type === 'success' ? 'text-green-600' : 'text-red-500'}`}>
                                {stripeFeedbackModal.type === 'success' ? 'Payment Successful' : 'Payment Failed'}
                            </h3>
                            <button
                                type="button"
                                onClick={closeStripeFeedbackModal}
                                className={`rounded-md px-2 py-1 text-sm ${isLight ? 'bg-gray-100 text-gray-700' : 'bg-gray-800 text-gray-200'}`}
                            >
                                Close
                            </button>
                        </div>
                        <p className={`mt-3 text-sm ${isLight ? 'text-gray-700' : 'text-gray-300'}`}>
                            {stripeFeedbackModal.message}
                        </p>
                        <div className="mt-4 flex justify-end">
                            <button
                                type="button"
                                onClick={closeStripeFeedbackModal}
                                className={`rounded-lg px-4 py-2 text-sm font-medium text-white ${stripeFeedbackModal.type === 'success' ? 'bg-green-600 hover:bg-green-700' : 'bg-red-600 hover:bg-red-700'}`}
                            >
                                OK
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default PaymentPage;
