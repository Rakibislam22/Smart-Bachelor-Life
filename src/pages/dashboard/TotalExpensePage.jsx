import React, { use } from 'react';
import { AuthContext } from '../../provider/AuthContext';

const TotalExpensePage = () => {
    const { isLight } = use(AuthContext);

    const categories = [
        { name: 'Groceries', amount: '৳ 12,200' },
        { name: 'Gas & Utilities', amount: '৳ 3,500' },
        { name: 'Cook Salary', amount: '৳ 5,000' },
        { name: 'Miscellaneous', amount: '৳ 1,800' },
    ];

    return (
        <div className="space-y-4 sm:space-y-6">
            <div>
                <h1 className={`text-xl sm:text-3xl font-bold ${isLight ? 'text-gray-900' : 'text-white'}`}>Total Expense</h1>
                <p className={`${isLight ? 'text-gray-600' : 'text-gray-400'} mt-1 text-sm sm:text-base`}>Monthly expense breakdown</p>
            </div>

            <div className={`rounded-xl border p-4 sm:p-5 ${isLight ? 'bg-white border-gray-200' : 'bg-gray-800 border-gray-700'}`}>
                <div className="space-y-3">
                    {categories.map((item) => (
                        <div key={item.name} className="flex items-center justify-between">
                            <p className="text-sm sm:text-base">{item.name}</p>
                            <p className="font-semibold">{item.amount}</p>
                        </div>
                    ))}
                </div>
                <div className={`mt-4 pt-4 border-t ${isLight ? 'border-gray-200' : 'border-gray-700'} flex items-center justify-between`}>
                    <p className="font-semibold">Grand Total</p>
                    <p className="font-bold text-lg">৳ 22,500</p>
                </div>
            </div>
        </div>
    );
};

export default TotalExpensePage;
