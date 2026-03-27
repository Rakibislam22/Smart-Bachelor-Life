import React, { use } from 'react';
import { AuthContext } from '../../provider/AuthContext';

const DailyMenuPage = () => {
    const { isLight } = use(AuthContext);

    const menu = [
        { meal: 'Breakfast', items: 'Paratha, Egg, Tea' },
        { meal: 'Lunch', items: 'Rice, Chicken Curry, Dal, Salad' },
        { meal: 'Dinner', items: 'Khichuri, Fried Eggplant, Pickle' },
    ];

    return (
        <div className="space-y-4 sm:space-y-6">
            <div>
                <h1 className={`text-xl sm:text-3xl font-bold ${isLight ? 'text-gray-900' : 'text-white'}`}>Daily Menu</h1>
                <p className={`${isLight ? 'text-gray-600' : 'text-gray-400'} mt-1 text-sm sm:text-base`}>Today\'s planned menu (demo)</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {menu.map((item) => (
                    <div key={item.meal} className={`rounded-xl border p-4 ${isLight ? 'bg-white border-gray-200' : 'bg-gray-800 border-gray-700'}`}>
                        <h2 className="font-semibold text-lg">{item.meal}</h2>
                        <p className={`mt-2 text-sm ${isLight ? 'text-gray-600' : 'text-gray-300'}`}>{item.items}</p>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default DailyMenuPage;
