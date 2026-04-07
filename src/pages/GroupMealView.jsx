import React, { useState, use, useEffect, useMemo } from 'react';
import { AuthContext } from '../provider/AuthContext';
import { toast } from 'react-toastify';
import { getMeals } from '../utils/mealApi';

const GroupMealView = () => {
    const { isLight, user, currentGroup } = use(AuthContext);
    const [currentMonth, setCurrentMonth] = useState(new Date());
    const [mealEntries, setMealEntries] = useState([]);
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        const loadMeals = async () => {
            if (!user || !currentGroup?.id) {
                return;
            }

            try {
                setIsLoading(true);
                const token = await user.getIdToken();
                const data = await getMeals(token, { groupID: currentGroup.id });
                setMealEntries(data?.data || []);
            } catch {
                toast.error('We could not load group meals right now. Please try again.');
            } finally {
                setIsLoading(false);
            }
        };

        loadMeals();
    }, [user, currentGroup?.id]);

    // Get days in month
    const getDaysInMonth = (date) => {
        return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
    };

    // Format date as YYYY-MM-DD
    const formatDate = (year, month, day) => {
        return `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    };

    const getMealBreakdownForDate = (memberData, dateStr) => {
        const value = memberData[dateStr] || { breakfast: 0, lunch: 0, dinner: 0 };
        return {
            breakfast: Number(value.breakfast || 0),
            lunch: Number(value.lunch || 0),
            dinner: Number(value.dinner || 0),
        };
    };

    const getTotalMealsForMonth = (memberData) => {
        return Object.values(memberData).reduce((sum, value) => {
            const breakfast = Number(value?.breakfast || 0);
            const lunch = Number(value?.lunch || 0);
            const dinner = Number(value?.dinner || 0);
            return sum + breakfast + lunch + dinner;
        }, 0);
    };

    const groupMembers = useMemo(() => {
        const memberMap = new Map();

        mealEntries.forEach((entry) => {
            const userData = entry.userID || {};
            const memberId = userData._id || userData.id || entry.userID || entry._id;
            const date = new Date(entry.date || entry.createdAt);
            const dateStr = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
            const breakfastValue = Number(entry.breakfast ?? 0);
            const lunchValue = Number(entry.lunch ?? 0);
            const dinnerValue = Number(entry.dinner ?? 0);
            const fallbackBreakfast =
                breakfastValue === 0 && lunchValue === 0 && dinnerValue === 0
                    ? Number(entry.mealCount || 0)
                    : 0;

            if (!memberMap.has(memberId)) {
                memberMap.set(memberId, {
                    id: memberId,
                    name: userData.displayName || userData.email || 'Unknown Member',
                    avatar: 'https://w7.pngwing.com/pngs/129/292/png-transparent-female-avatar-girl-face-woman-user-flat-classy-users-icon.png',
                    mealData: {},
                });
            }

            const member = memberMap.get(memberId);
            if (!member.mealData[dateStr]) {
                member.mealData[dateStr] = { breakfast: 0, lunch: 0, dinner: 0 };
            }

            member.mealData[dateStr].breakfast += breakfastValue + fallbackBreakfast;
            member.mealData[dateStr].lunch += lunchValue;
            member.mealData[dateStr].dinner += dinnerValue;
        });

        return Array.from(memberMap.values());
    }, [mealEntries]);

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

                    {isLoading && <p className="text-sm mb-4">Loading group meals...</p>}

                    {!isLoading && groupMembers.length === 0 && (
                        <p className="text-sm mb-4">No meal records found for this group.</p>
                    )}

                    {/* Desktop View - Table */}
                    {!isLoading && groupMembers.length > 0 && <div className="overflow-x-auto">
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

                                                <span className="font-semibold whitespace-nowrap">
                                                    {member.name}
                                                </span>
                                            </div>
                                        </td>
                                        {days.map(day => {
                                            const dateStr = formatDate(currentMonth.getFullYear(), currentMonth.getMonth(), day);
                                            const breakdown = getMealBreakdownForDate(member.mealData, dateStr);
                                            const totalMeals = breakdown.breakfast + breakdown.lunch + breakdown.dinner;
                                            return (
                                                <td
                                                    key={day}
                                                    className={`px-2 py-3 text-center text-xs border-r ${isLight ? 'border-gray-200' : 'border-gray-700'} ${totalMeals > 0
                                                        ? isLight ? 'bg-green-50 text-green-800 font-semibold' : 'bg-green-900/30 text-green-300 font-semibold'
                                                        : isLight ? 'text-gray-400' : 'text-gray-500'
                                                        }`}
                                                    title={`Breakfast/Lunch/Dinner: ${breakdown.breakfast}/${breakdown.lunch}/${breakdown.dinner}`}
                                                >
                                                    {totalMeals > 0
                                                        ? `${breakdown.breakfast}/${breakdown.lunch}/${breakdown.dinner}`
                                                        : '-'}
                                                </td>
                                            );
                                        })}
                                        <td className={`px-4 py-3 text-center font-bold text-lg ${isLight ? 'bg-blue-50 text-blue-800' : 'bg-blue-900/30 text-blue-300'}`}>
                                            {getTotalMealsForMonth(member.mealData)}
                                        </td>
                                    </tr>
                                ))}

                                <tr className={`${isLight ? 'bg-amber-50 border-t border-amber-200' : 'bg-amber-900/20 border-t border-amber-700'}`}>
                                    <td className={`sticky left-0 z-10 px-4 py-3 border-r font-bold ${isLight ? 'bg-amber-50 border-amber-200 text-amber-900' : 'bg-amber-900/20 border-amber-700 text-amber-100'}`}>
                                        Group Total
                                    </td>
                                    {days.map((day) => {
                                        const dateStr = formatDate(currentMonth.getFullYear(), currentMonth.getMonth(), day);

                                        const totals = groupMembers.reduce(
                                            (acc, member) => {
                                                const breakdown = getMealBreakdownForDate(member.mealData, dateStr);
                                                acc.breakfast += breakdown.breakfast;
                                                acc.lunch += breakdown.lunch;
                                                acc.dinner += breakdown.dinner;
                                                return acc;
                                            },
                                            { breakfast: 0, lunch: 0, dinner: 0 },
                                        );

                                        const dayTotal = totals.breakfast + totals.lunch + totals.dinner;

                                        return (
                                            <td
                                                key={`group-total-${day}`}
                                                className={`px-2 py-3 text-center text-xs border-r font-bold ${isLight ? 'border-amber-200 text-amber-900' : 'border-amber-700 text-amber-100'}`}
                                                title={`Group Total (B/L/D): ${totals.breakfast}/${totals.lunch}/${totals.dinner}`}
                                            >
                                                {dayTotal > 0
                                                    ? `${totals.breakfast}/${totals.lunch}/${totals.dinner}`
                                                    : '-'}
                                            </td>
                                        );
                                    })}
                                    <td className={`px-4 py-3 text-center font-bold text-lg ${isLight ? 'bg-amber-100 text-amber-900' : 'bg-amber-900/40 text-amber-100'}`}>
                                        {groupMembers.reduce((sum, member) => sum + getTotalMealsForMonth(member.mealData), 0)}
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    </div>}

                    {/* Legend */}
                    <div className="mt-6 pt-6 border-t border-gray-300">
                        <p className={`text-sm font-semibold mb-2 ${isLight ? 'text-gray-700' : 'text-gray-300'}`}>
                            Meal Format: Breakfast/Lunch/Dinner
                        </p>
                        <p className={`text-xs ${isLight ? 'text-gray-600' : 'text-gray-400'}`}>
                            Example: 1/2/1 means breakfast 1, lunch 2, dinner 1.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default GroupMealView;
