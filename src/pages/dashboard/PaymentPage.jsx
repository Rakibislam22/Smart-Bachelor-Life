import React, { use } from 'react';
import { AuthContext } from '../../provider/AuthContext';

const PaymentPage = () => {
    const { isLight } = use(AuthContext);

    const payments = [
        { member: 'Rafi Islam', amount: '৳ 2,500', date: '2026-03-01', method: 'Bkash' },
        { member: 'Sultan', amount: '৳ 2,500', date: '2026-03-02', method: 'Nagad' },
        { member: 'Tanvir Hasan', amount: '৳ 2,200', date: '2026-03-03', method: 'Cash' },
    ];

    return (
        <div className="space-y-4 sm:space-y-6">
            <div>
                <h1 className={`text-xl sm:text-3xl font-bold ${isLight ? 'text-gray-900' : 'text-white'}`}>Payment & Receipt</h1>
                <p className={`${isLight ? 'text-gray-600' : 'text-gray-400'} mt-1 text-sm sm:text-base`}>Recent payment records (demo data)</p>
            </div>

            <div className={`rounded-xl border overflow-hidden ${isLight ? 'bg-white border-gray-200' : 'bg-gray-800 border-gray-700'}`}>
                <div className="overflow-x-auto">
                    <table className="w-full min-w-155">
                        <thead className={`${isLight ? 'bg-gray-50' : 'bg-gray-700/60'}`}>
                            <tr>
                                <th className="px-4 py-3 text-left text-sm">Member</th>
                                <th className="px-4 py-3 text-left text-sm">Amount</th>
                                <th className="px-4 py-3 text-left text-sm">Date</th>
                                <th className="px-4 py-3 text-left text-sm">Method</th>
                            </tr>
                        </thead>
                        <tbody>
                            {payments.map((item) => (
                                <tr key={`${item.member}-${item.date}`} className={`border-t ${isLight ? 'border-gray-200' : 'border-gray-700'}`}>
                                    <td className="px-4 py-3 text-sm">{item.member}</td>
                                    <td className="px-4 py-3 text-sm">{item.amount}</td>
                                    <td className="px-4 py-3 text-sm">{item.date}</td>
                                    <td className="px-4 py-3 text-sm">{item.method}</td>
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
