import React, { useState, use } from 'react';
import { AuthContext } from '../provider/AuthContext';

const GroupMealView = () => {
    const { isLight } = use(AuthContext);
    const [currentMonth, setCurrentMonth] = useState(new Date());

    // Mock group members data - Replace with actual API call
    const [groupMembers] = useState([
        {
            id: 1,
            name: 'John Doe',
            avatar: 'https://w7.pngwing.com/pngs/129/292/png-transparent-female-avatar-girl-face-woman-user-flat-classy-users-icon.png',
            mealData: {
                '2026-03-01': { breakfast: 1, lunch: 1, dinner: 1 },
                '2026-03-02': { breakfast: 1, lunch: 1, dinner: 0 },
                '2026-03-03': { breakfast: 1, lunch: 1, dinner: 1 },
                '2026-03-04': { breakfast: 1, lunch: 0, dinner: 1 },
                '2026-03-05': { breakfast: 1, lunch: 1, dinner: 1 },
            }
        },
        {
            id: 2,
            name: 'Jane Smith',
            avatar: 'https://w7.pngwing.com/pngs/129/292/png-transparent-female-avatar-girl-face-woman-user-flat-classy-users-icon.png',
            mealData: {
                '2026-03-01': { breakfast: 1, lunch: 1, dinner: 1 },
                '2026-03-02': { breakfast: 1, lunch: 1, dinner: 1 },
                '2026-03-03': { breakfast: 1, lunch: 1, dinner: 1 },
                '2026-03-04': { breakfast: 1, lunch: 1, dinner: 1 },
                '2026-03-05': { breakfast: 0, lunch: 1, dinner: 1 },
            }
        },
        {
            id: 2,
            name: 'Jane Smith',
            avatar: 'https://w7.pngwing.com/pngs/129/292/png-transparent-female-avatar-girl-face-woman-user-flat-classy-users-icon.png',
            mealData: {
                '2026-03-01': { breakfast: 1, lunch: 1, dinner: 1 },
                '2026-03-02': { breakfast: 1, lunch: 1, dinner: 1 },
                '2026-03-03': { breakfast: 1, lunch: 1, dinner: 1 },
                '2026-03-04': { breakfast: 1, lunch: 1, dinner: 1 },
                '2026-03-05': { breakfast: 0, lunch: 1, dinner: 1 },
            }
        },
        {
            id: 2,
            name: 'Jane Smith',
            avatar: 'https://w7.pngwing.com/pngs/129/292/png-transparent-female-avatar-girl-face-woman-user-flat-classy-users-icon.png',
            mealData: {
                '2026-03-01': { breakfast: 1, lunch: 1, dinner: 1 },
                '2026-03-02': { breakfast: 1, lunch: 1, dinner: 1 },
                '2026-03-03': { breakfast: 1, lunch: 1, dinner: 1 },
                '2026-03-04': { breakfast: 1, lunch: 1, dinner: 1 },
                '2026-03-05': { breakfast: 0, lunch: 1, dinner: 1 },
            }
        },
        {
            id: 2,
            name: 'Jane Smith',
            avatar: 'https://w7.pngwing.com/pngs/129/292/png-transparent-female-avatar-girl-face-woman-user-flat-classy-users-icon.png',
            mealData: {
                '2026-03-01': { breakfast: 1, lunch: 1, dinner: 1 },
                '2026-03-02': { breakfast: 1, lunch: 1, dinner: 1 },
                '2026-03-03': { breakfast: 1, lunch: 1, dinner: 1 },
                '2026-03-04': { breakfast: 1, lunch: 1, dinner: 1 },
                '2026-03-05': { breakfast: 0, lunch: 1, dinner: 1 },
            }
        },
        {
            id: 2,
            name: 'Jane Smith',
            avatar: 'https://w7.pngwing.com/pngs/129/292/png-transparent-female-avatar-girl-face-woman-user-flat-classy-users-icon.png',
            mealData: {
                '2026-03-01': { breakfast: 1, lunch: 1, dinner: 1 },
                '2026-03-02': { breakfast: 1, lunch: 1, dinner: 1 },
                '2026-03-03': { breakfast: 1, lunch: 1, dinner: 1 },
                '2026-03-04': { breakfast: 1, lunch: 1, dinner: 1 },
                '2026-03-05': { breakfast: 0, lunch: 1, dinner: 1 },
            }
        },
        {
            id: 2,
            name: 'Jane Smith',
            avatar: 'https://w7.pngwing.com/pngs/129/292/png-transparent-female-avatar-girl-face-woman-user-flat-classy-users-icon.png',
            mealData: {
                '2026-03-01': { breakfast: 1, lunch: 1, dinner: 1 },
                '2026-03-02': { breakfast: 1, lunch: 1, dinner: 1 },
                '2026-03-03': { breakfast: 1, lunch: 1, dinner: 1 },
                '2026-03-04': { breakfast: 1, lunch: 1, dinner: 1 },
                '2026-03-05': { breakfast: 0, lunch: 1, dinner: 1 },
            }
        },
        {
            id: 2,
            name: 'Jane Smith',
            avatar: 'https://w7.pngwing.com/pngs/129/292/png-transparent-female-avatar-girl-face-woman-user-flat-classy-users-icon.png',
            mealData: {
                '2026-03-01': { breakfast: 1, lunch: 1, dinner: 1 },
                '2026-03-02': { breakfast: 1, lunch: 1, dinner: 1 },
                '2026-03-03': { breakfast: 1, lunch: 1, dinner: 1 },
                '2026-03-04': { breakfast: 1, lunch: 1, dinner: 1 },
                '2026-03-05': { breakfast: 0, lunch: 1, dinner: 1 },
            }
        },
        {
            id: 2,
            name: 'Jane Smith',
            avatar: 'https://w7.pngwing.com/pngs/129/292/png-transparent-female-avatar-girl-face-woman-user-flat-classy-users-icon.png',
            mealData: {
                '2026-03-01': { breakfast: 1, lunch: 1, dinner: 1 },
                '2026-03-02': { breakfast: 1, lunch: 1, dinner: 1 },
                '2026-03-03': { breakfast: 1, lunch: 1, dinner: 1 },
                '2026-03-04': { breakfast: 1, lunch: 1, dinner: 1 },
                '2026-03-05': { breakfast: 0, lunch: 1, dinner: 1 },
            }
        },
        {
            id: 3,
            name: 'Mike Johnson',
            avatar: 'https://w7.pngwing.com/pngs/129/292/png-transparent-female-avatar-girl-face-woman-user-flat-classy-users-icon.png',
            mealData: {
                '2026-03-01': { breakfast: 1, lunch: 1, dinner: 0 },
                '2026-03-02': { breakfast: 1, lunch: 0, dinner: 1 },
                '2026-03-03': { breakfast: 1, lunch: 1, dinner: 1 },
                '2026-03-04': { breakfast: 1, lunch: 1, dinner: 0 },
                '2026-03-05': { breakfast: 1, lunch: 1, dinner: 1 },
            }
        },
    ]);

    // Get days in month
    const getDaysInMonth = (date) => {
        return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
    };

    // Format date as YYYY-MM-DD
    const formatDate = (year, month, day) => {
        return `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    };

    // Calculate total meals for a member on a specific date
    const getTotalMealsForDate = (memberData, dateStr) => {
        const meals = memberData[dateStr] || { breakfast: 0, lunch: 0, dinner: 0 };
        return meals.breakfast + meals.lunch + meals.dinner;
    };

    // Calculate total meals for a member in the month
    const getTotalMealsForMonth = (memberData) => {
        let total = 0;
        Object.values(memberData).forEach(meals => {
            total += meals.breakfast + meals.lunch + meals.dinner;
        });
        return total;
    };

    // Get meal breakdown (B/L/D) for a date
    const getMealBreakdown = (memberData, dateStr) => {
        const meals = memberData[dateStr] || { breakfast: 0, lunch: 0, dinner: 0 };
        if (meals.breakfast === 0 && meals.lunch === 0 && meals.dinner === 0) {
            return '-';
        }
        return `${meals.breakfast}/${meals.lunch}/${meals.dinner}`;
    };

    // Previous month
    const prevMonth = () => {
        setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1));
    };

    // Next month
    const nextMonth = () => {
        setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1));
    };

    const daysInMonth = getDaysInMonth(currentMonth);
    const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);

    return (
        <div>
            <div>
                {/* Header */}
                <div className="mb-4 sm:mb-6">
                    <h1 className={`text-lg sm:text-2xl font-bold mb-1 sm:mb-2 ${isLight ? 'text-gray-900' : 'text-white'}`}>
                        Group Members Meal Tracker
                    </h1>
                    <p className={`text-xs sm:text-sm ${isLight ? 'text-gray-600' : 'text-gray-400'}`}>
                        View all group members' meal records
                    </p>
                </div>

                {/* Month Navigation */}
                <div className={`backdrop-blur-sm rounded-lg p-3 shadow-xl mb-4 sm:mb-6`}>
                    <div className="flex items-center justify-between gap-2 sm:gap-3 mb-4 sm:mb-6">
                        <button
                            onClick={prevMonth}
                            className={`px-2 py-1 sm:px-3 sm:py-1.5 rounded-lg text-xs sm:text-sm ${isLight ? 'bg-gray-200 hover:bg-gray-300 text-gray-800' : 'bg-gray-700 hover:bg-gray-600 text-white'} transition-colors`}
                        >
                            ← Prev
                        </button>
                        <h2 className={`text-base sm:text-xl font-bold text-center flex-1 ${isLight ? 'text-gray-900' : 'text-white'}`}>
                            {currentMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                        </h2>
                        <button
                            onClick={nextMonth}
                            className={`px-2 py-1 sm:px-3 sm:py-1.5 rounded-lg text-xs sm:text-sm ${isLight ? 'bg-gray-200 hover:bg-gray-300 text-gray-800' : 'bg-gray-700 hover:bg-gray-600 text-white'} transition-colors`}
                        >
                            Next →
                        </button>
                    </div>

                    {/* Desktop View - Table */}
                    <div className="overflow-x-auto">
                        <table className={`w-full ${isLight ? 'text-gray-900' : 'text-white'}`}>
                            <thead>
                                <tr className={`${isLight ? 'bg-gray-100' : 'bg-gray-700'}`}>
                                    <th className="sticky left-0 z-10 px-4 py-3 text-left font-bold border-r bg-inherit">
                                        Member
                                    </th>
                                    {days.map(day => (
                                        <th
                                            key={day}
                                            className={`px-2 py-3 text-center text-xs font-semibold border-r ${isLight ? 'border-gray-300' : 'border-gray-600'}`}
                                        >
                                            {day}
                                        </th>
                                    ))}
                                    <th className="px-4 py-3 text-center font-bold">
                                        Total
                                    </th>
                                </tr>
                            </thead>
                            <tbody>
                                {groupMembers.map(member => (
                                    <tr
                                        key={member.id}
                                        className={`${isLight ? 'border-b border-gray-200 hover:bg-gray-50' : 'border-b border-gray-700 hover:bg-gray-750'} transition-colors`}
                                    >
                                        <td className={`sticky left-0 z-10 px-4 py-3 border-r ${isLight ? 'bg-white border-gray-300' : 'bg-gray-800 border-gray-600'}`}>
                                            <div className="flex items-center gap-3 pr-5">
                                                <img
                                                    src={member.avatar}
                                                    alt={member.name}
                                                    className="w-6 h-6 rounded-full"
                                                />
                                                <span className="font-semibold whitespace-nowrap">
                                                    {member.name}
                                                </span>
                                            </div>
                                        </td>
                                        {days.map(day => {
                                            const dateStr = formatDate(currentMonth.getFullYear(), currentMonth.getMonth(), day);
                                            const breakdown = getMealBreakdown(member.mealData, dateStr);
                                            const totalMeals = getTotalMealsForDate(member.mealData, dateStr);
                                            return (
                                                <td
                                                    key={day}
                                                    className={`px-2 py-3 text-center text-xs border-r ${isLight ? 'border-gray-200' : 'border-gray-700'} ${totalMeals > 0
                                                        ? isLight ? 'bg-green-50 text-green-800 font-semibold' : 'bg-green-900/30 text-green-300 font-semibold'
                                                        : isLight ? 'text-gray-400' : 'text-gray-500'
                                                        }`}
                                                    title={`Breakfast/Lunch/Dinner: ${breakdown}`}
                                                >
                                                    {breakdown}
                                                </td>
                                            );
                                        })}
                                        <td className={`px-4 py-3 text-center font-bold text-lg ${isLight ? 'bg-blue-50 text-blue-800' : 'bg-blue-900/30 text-blue-300'}`}>
                                            {getTotalMealsForMonth(member.mealData)}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {/* Legend */}
                    <div className="mt-6 pt-6 border-t border-gray-300">
                        <p className={`text-sm font-semibold mb-2 ${isLight ? 'text-gray-700' : 'text-gray-300'}`}>
                            Meal Format: Breakfast / Lunch / Dinner
                        </p>
                        <p className={`text-xs ${isLight ? 'text-gray-600' : 'text-gray-400'}`}>
                            Example: "1/1/0" means 1 breakfast, 1 lunch, 0 dinner
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default GroupMealView;
