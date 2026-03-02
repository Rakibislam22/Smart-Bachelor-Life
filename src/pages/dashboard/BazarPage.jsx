import React, { use } from 'react';
import { AuthContext } from '../../provider/AuthContext';

const BazarPage = () => {
    const { isLight } = use(AuthContext);

    const items = [
        { name: 'Rice 25kg', qty: '1 bag', cost: '৳ 1,900' },
        { name: 'Chicken', qty: '8 kg', cost: '৳ 1,760' },
        { name: 'Oil', qty: '5 L', cost: '৳ 850' },
        { name: 'Vegetables', qty: 'Mixed', cost: '৳ 620' },
    ];

    return (
        <div className="space-y-4 sm:space-y-6">
            <div>
                <h1 className={`text-xl sm:text-3xl font-bold ${isLight ? 'text-gray-900' : 'text-white'}`}>Bazar</h1>
                <p className={`${isLight ? 'text-gray-600' : 'text-gray-400'} mt-1 text-sm sm:text-base`}>Latest shopping entries (demo)</p>
            </div>

            <div className={`rounded-xl border p-4 sm:p-5 ${isLight ? 'bg-white border-gray-200' : 'bg-gray-800 border-gray-700'}`}>
                <div className="space-y-3">
                    {items.map((item) => (
                        <div key={item.name} className={`grid grid-cols-3 gap-2 p-3 rounded-lg ${isLight ? 'bg-gray-50' : 'bg-gray-700/40'}`}>
                            <p className="text-sm font-medium">{item.name}</p>
                            <p className="text-sm">{item.qty}</p>
                            <p className="text-sm font-semibold text-right">{item.cost}</p>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default BazarPage;
