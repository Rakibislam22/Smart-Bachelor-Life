import React, { use } from 'react';
import { AuthContext } from '../../provider/AuthContext';

const DashboardHome = () => {
    const { isLight, userRole } = use(AuthContext);

    // Meal and expense data
    const currentMealRate = 64.13;
    const previousMealRate = 58.50;
    const currentTotalMeals = 286;
    const netBalance = 6300; // For managers

    const summary = [
        { label: 'Current Total Meals', value: currentTotalMeals.toString() },
        { label: 'Current Meal Rate', value: `৳ ${currentMealRate.toFixed(2)}` },
        { label: 'Previous Meal Rate', value: `৳ ${previousMealRate.toFixed(2)}` },
        { label: 'Members Active', value: userRole === 'manager' ? '9' : '1' },
    ];

    const activities = [
        { title: 'Breakfast added', time: 'Today, 8:15 AM', info: '2 meals logged' },
        { title: 'Daily menu updated', time: 'Today, 7:30 AM', info: 'Chicken curry + dal' },
        { title: 'Bazar entry created', time: 'Yesterday', info: '৳ 2,450 total' },
        { title: 'Payment received', time: 'Yesterday', info: 'From 3 members' },
    ];

    // Weekly meal trend data for chart
    const weeklyData = [
        { day: 'Mon', meals: 40, expense: 2570 },
        { day: 'Tue', meals: 42, expense: 2695 },
        { day: 'Wed', meals: 38, expense: 2437 },
        { day: 'Thu', meals: 44, expense: 2822 },
        { day: 'Fri', meals: 41, expense: 2632 },
        { day: 'Sat', meals: 39, expense: 2502 },
        { day: 'Sun', meals: 42, expense: 2696 },
    ];

    const maxMeals = Math.max(...weeklyData.map(d => d.meals));

    return (
        <div className="space-y-4 sm:space-y-6">
            <div>
                <h1 className={`text-xl sm:text-3xl font-bold ${isLight ? 'text-gray-900' : 'text-white'}`}>
                    {userRole === 'manager' ? 'Manager Dashboard' : 'My Dashboard'}
                </h1>
                <p className={`${isLight ? 'text-gray-600' : 'text-gray-400'} text-sm sm:text-base mt-1`}>
                    Overview of meals, expenses and recent activity
                </p>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
                {summary.map((item) => (
                    <div key={item.label} className={`rounded-xl p-3 sm:p-4 border ${isLight ? 'bg-white border-gray-200' : 'bg-gray-800 border-gray-700'}`}>
                        <p className={`text-xs sm:text-sm ${isLight ? 'text-gray-600' : 'text-gray-400'}`}>{item.label}</p>
                        <p className={`text-base sm:text-2xl font-bold mt-1 ${isLight ? 'text-gray-900' : 'text-white'}`}>{item.value}</p>
                    </div>
                ))}
            </div>

            {/* Meal Rate Comparison */}
            <div className={`rounded-xl p-4 sm:p-5 border ${isLight ? 'bg-white border-gray-200' : 'bg-gray-800 border-gray-700'}`}>
                <h2 className={`text-base sm:text-xl font-semibold mb-4 ${isLight ? 'text-gray-900' : 'text-white'}`}>Meal Rate Trend</h2>
                <div className="grid grid-cols-2 gap-4">
                    <div className={`p-4 rounded-lg ${isLight ? 'bg-blue-50 border border-blue-200' : 'bg-blue-900/20 border border-blue-800'}`}>
                        <p className={`text-sm ${isLight ? 'text-blue-700' : 'text-blue-300'}`}>Current Rate</p>
                        <p className="text-2xl font-bold mt-1">৳ {currentMealRate.toFixed(2)}</p>
                    </div>
                    <div className={`p-4 rounded-lg ${isLight ? 'bg-gray-100' : 'bg-gray-700/40'}`}>
                        <p className={`text-sm ${isLight ? 'text-gray-700' : 'text-gray-300'}`}>Previous Rate</p>
                        <p className="text-2xl font-bold mt-1">৳ {previousMealRate.toFixed(2)}</p>
                    </div>
                </div>
                <div className="mt-3 p-3 bg-opacity-50 rounded-lg">
                    <p className={`text-sm ${isLight ? 'text-gray-600' : 'text-gray-400'}`}>
                        Rate change: <span className="font-semibold text-red-500">+{(currentMealRate - previousMealRate).toFixed(2)} টাকা (↑{(((currentMealRate - previousMealRate) / previousMealRate) * 100).toFixed(1)}%)</span>
                    </p>
                </div>
            </div>

            {/* Weekly Meal Trend Chart */}
            <div className={`rounded-xl p-4 sm:p-5 border ${isLight ? 'bg-white border-gray-200' : 'bg-gray-800 border-gray-700'}`}>
                <h2 className={`text-base sm:text-xl font-semibold mb-4 ${isLight ? 'text-gray-900' : 'text-white'}`}>Weekly Meal Trend</h2>
                <div className="space-y-3">
                    {weeklyData.map((data) => (
                        <div key={data.day}>
                            <div className="flex items-center justify-between mb-1">
                                <p className="text-sm font-medium">{data.day}</p>
                                <p className={`text-sm ${isLight ? 'text-gray-600' : 'text-gray-400'}`}>{data.meals} meals • ৳ {data.expense}</p>
                            </div>
                            <div className={`h-6 rounded-full overflow-hidden ${isLight ? 'bg-gray-100' : 'bg-gray-700/40'}`}>
                                <div
                                    className="h-full bg-linear-to-r from-violet-500 to-violet-400"
                                    style={{ width: `${(data.meals / maxMeals) * 100}%` }}
                                ></div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Manager Only: Net Balance */}
            {userRole === 'manager' && (
                <div className={`rounded-xl p-4 sm:p-5 border ${isLight ? 'bg-green-50 border-green-200' : 'bg-green-900/20 border-green-800'}`}>
                    <h2 className={`text-base sm:text-xl font-semibold ${isLight ? 'text-green-900' : 'text-green-200'}`}>Net Balance (Managers Only)</h2>
                    <p className="text-3xl font-bold mt-2 text-green-600">৳ {netBalance.toLocaleString()}</p>
                    <p className={`text-sm mt-2 ${isLight ? 'text-green-700' : 'text-green-300'}`}>
                        Total collected from members after all expenses
                    </p>
                </div>
            )}

            {/* Recent Activity */}
            <div className={`rounded-xl p-4 sm:p-5 border ${isLight ? 'bg-white border-gray-200' : 'bg-gray-800 border-gray-700'}`}>
                <h2 className={`text-base sm:text-xl font-semibold mb-3 ${isLight ? 'text-gray-900' : 'text-white'}`}>Recent Activity</h2>
                <div className="space-y-3">
                    {activities.map((item) => (
                        <div key={item.title} className={`p-3 rounded-lg ${isLight ? 'bg-gray-50' : 'bg-gray-700/50'}`}>
                            <p className={`font-medium ${isLight ? 'text-gray-900' : 'text-white'}`}>{item.title}</p>
                            <p className={`text-xs sm:text-sm ${isLight ? 'text-gray-600' : 'text-gray-300'}`}>{item.info}</p>
                            <p className={`text-xs mt-1 ${isLight ? 'text-gray-500' : 'text-gray-400'}`}>{item.time}</p>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default DashboardHome;
