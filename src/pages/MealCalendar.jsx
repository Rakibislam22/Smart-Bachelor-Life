import React, { useState, use, useEffect } from 'react';
import { AuthContext } from '../provider/AuthContext';
import { toast } from 'react-toastify';
import { createMeal, getMeals, updateMeal } from '../utils/mealApi';

const MealCalendar = () => {
    const { isLight, user, currentGroup } = use(AuthContext);
    const [currentMonth, setCurrentMonth] = useState(new Date());
    const [mealData, setMealData] = useState({});
    const [mealEntryIdByDate, setMealEntryIdByDate] = useState({});
    const [selectedDate, setSelectedDate] = useState(null);
    const [showMealModal, setShowMealModal] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [meals, setMeals] = useState({
        breakfast: 0,
        lunch: 0,
        dinner: 0,
    });

    // Format date as YYYY-MM-DD in local time (avoids UTC day shift).
    const formatDate = (date) => {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    };

    useEffect(() => {
        const loadMeals = async () => {
            if (!user || !currentGroup?.id) {
                return;
            }

            try {
                const token = await user.getIdToken();
                const data = await getMeals(token, { groupID: currentGroup.id });
                const entries = data?.data || [];

                const mapped = {};
                const entryMap = {};
                const authUserId = user?.uid;
                const authUserEmail = String(user?.email || '').toLowerCase();

                entries.forEach((entry) => {
                    const entryUser = entry?.userID || {};
                    const entryFirebaseUid = entryUser?.firebaseUid;
                    const entryEmail = String(entryUser?.email || '').toLowerCase();
                    const isSameUser =
                        (entryFirebaseUid && authUserId && entryFirebaseUid === authUserId) ||
                        (entryEmail && authUserEmail && entryEmail === authUserEmail);

                    if (!isSameUser) {
                        return;
                    }

                    const date = new Date(entry.date || entry.createdAt);
                    const dateKey = formatDate(date);
                    const breakfastValue = Number(entry.breakfast ?? 0);
                    const lunchValue = Number(entry.lunch ?? 0);
                    const dinnerValue = Number(entry.dinner ?? 0);

                    // Backward compatibility for old records that only have mealCount.
                    const fallbackBreakfast =
                        breakfastValue === 0 && lunchValue === 0 && dinnerValue === 0
                            ? Number(entry.mealCount || 0)
                            : 0;

                    if (!mapped[dateKey]) {
                        mapped[dateKey] = { breakfast: 0, lunch: 0, dinner: 0 };
                    }

                    // Keep latest entry per date for edit/update in personal calendar view.
                    mapped[dateKey] = {
                        breakfast: breakfastValue + fallbackBreakfast,
                        lunch: lunchValue,
                        dinner: dinnerValue,
                    };
                    entryMap[dateKey] = entry._id;
                });

                setMealData(mapped);
                setMealEntryIdByDate(entryMap);
            } catch (error) {
                toast.error('We could not load meal records right now. Please try again.');
            }
        };

        loadMeals();
    }, [user, currentGroup?.id]);

    // Get days in month
    const getDaysInMonth = (date) => {
        return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
    };

    // Get first day of month
    const getFirstDayOfMonth = (date) => {
        return new Date(date.getFullYear(), date.getMonth(), 1).getDay();
    };

    const isPastDate = (date) => {
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const compareDate = new Date(date);
        compareDate.setHours(0, 0, 0, 0);

        return compareDate < today;
    };

    // Get meal data for a specific date
    const getMealForDate = (date) => {
        const dateStr = formatDate(date);
        return mealData[dateStr] || { breakfast: 0, lunch: 0, dinner: 0 };
    };

    // Calculate total meals for a date
    const getTotalMeals = (date) => {
        const meal = getMealForDate(date);
        return meal.breakfast + meal.lunch + meal.dinner;
    };

    // Get intensity color based on meal count
    const getIntensityColor = (total) => {
        if (total === 0) {
            return isLight ? 'bg-gray-200' : 'bg-gray-700';
        } else if (total <= 1) {
            return isLight ? 'bg-green-100' : 'bg-green-900';
        } else if (total <= 2) {
            return isLight ? 'bg-green-300' : 'bg-green-700';
        } else if (total <= 3) {
            return isLight ? 'bg-green-500' : 'bg-green-600';
        } else {
            return isLight ? 'bg-green-700' : 'bg-green-500';
        }
    };

    // Handle meal input change
    const handleMealChange = (type, value) => {
        setMeals({
            ...meals,
            [type]: parseInt(value) || 0,
        });
    };

    // Save meal
    const saveMeal = async () => {
        if (!selectedDate) {
            return;
        }

        if (!user || !currentGroup?.id) {
            toast.error('Login and group selection are required');
            return;
        }

        const totalMealCount = meals.breakfast + meals.lunch + meals.dinner;
        const dateStr = formatDate(selectedDate);
        const mealEntryId = mealEntryIdByDate[dateStr];

        try {
            setIsSaving(true);
            const token = await user.getIdToken();

            const payload = {
                groupID: currentGroup.id,
                mealCount: totalMealCount,
                breakfast: meals.breakfast,
                lunch: meals.lunch,
                dinner: meals.dinner,
                date: dateStr,
            };

            if (mealEntryId) {
                await updateMeal(mealEntryId, payload, token);
            } else {
                const created = await createMeal(payload, token);
                const createdId = created?.data?._id;
                if (createdId) {
                    setMealEntryIdByDate((prev) => ({
                        ...prev,
                        [dateStr]: createdId,
                    }));
                }
            }

            setMealData((prev) => ({
                ...prev,
                [dateStr]: meals,
            }));

            setShowMealModal(false);
            setSelectedDate(null);
            setMeals({ breakfast: 0, lunch: 0, dinner: 0 });
            toast.success(mealEntryId ? 'Meal updated successfully' : 'Meal added successfully');
        } catch (error) {
            toast.error('We could not save meal right now. Please try again.');
        } finally {
            setIsSaving(false);
        }
    };

    // Open meal modal
    const openMealModal = (day) => {
        const date = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day);

        if (isPastDate(date)) {
            return;
        }

        setSelectedDate(date);
        const dateMeals = getMealForDate(date);
        setMeals(dateMeals);
        setShowMealModal(true);
    };

    // Generate calendar days
    const generateCalendarDays = () => {
        const daysInMonth = getDaysInMonth(currentMonth);
        const firstDay = getFirstDayOfMonth(currentMonth);
        const days = [];

        // Add empty cells for days before month starts
        for (let i = 0; i < firstDay; i++) {
            days.push(null);
        }

        // Add days of month
        for (let i = 1; i <= daysInMonth; i++) {
            days.push(i);
        }

        return days;
    };

    // Previous month
    const prevMonth = () => {
        setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1));
    };

    // Next month
    const nextMonth = () => {
        setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1));
    };

    const days = generateCalendarDays();
    const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

    return (
        <div>
            <div>
                {/* Header */}
                <div className="mb-4 sm:mb-8">
                    <h1 className={`text-lg sm:text-2xl font-bold mb-1 sm:mb-2 ${isLight ? 'text-gray-900' : 'text-white'}`}>
                        Meal Calendar
                    </h1>
                    <p className={`text-xs sm:text-sm ${isLight ? 'text-gray-600' : 'text-gray-400'}`}>
                        Track your daily meals (breakfast, lunch, dinner)
                    </p>
                </div>

                {/* Month Navigation */}
                <div className={`bg-transparent rounded-lg p-3 sm:p-4 shadow-lg mb-4 sm:mb-8`}>
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

                    {/* Calendar Grid */}
                    <div>
                        <div className="grid grid-cols-7 gap-1 sm:gap-2 mb-2">
                            {daysOfWeek.map((day) => (
                                <div
                                    key={day}
                                    className={`text-center font-semibold text-xs sm:text-sm py-1 sm:p-2 ${isLight ? 'text-gray-700' : 'text-gray-300'}`}
                                >
                                    {day}
                                </div>
                            ))}
                        </div>

                        <div className="grid grid-cols-7 gap-1 sm:gap-2">
                            {days.map((day, index) => (
                                <div key={index} className="w-full aspect-square">
                                    {day ? (
                                        (() => {
                                            const dateObj = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day);
                                            const isPast = isPastDate(dateObj);
                                            const totalMeals = getTotalMeals(dateObj);

                                            return (
                                                <button
                                                    onClick={() => openMealModal(day)}
                                                    disabled={isPast}
                                                    className={`w-full h-full rounded-md sm:rounded-lg font-semibold text-[10px] sm:text-sm flex flex-col items-center justify-center transition-all ${isPast ? 'opacity-40 cursor-not-allowed' : `cursor-pointer hover:ring-2 ${isLight ? 'hover:ring-green-400' : 'hover:ring-green-500'}`} ${getIntensityColor(totalMeals)} ${isLight ? 'text-gray-800' : 'text-white'}`}
                                                    title={isPast ? 'Past date is locked' : `${day} meals: ${totalMeals}`}
                                                >
                                                    <span className="text-xs sm:text-sm font-bold">{day}</span>
                                                    <span className="text-[8px] sm:text-xs opacity-80">
                                                        {totalMeals > 0
                                                            ? `${totalMeals} meals`
                                                            : ''}
                                                    </span>
                                                </button>
                                            );
                                        })()
                                    ) : (
                                        <div className="w-full h-full"></div>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Legend */}
                    <div className="mt-8 pt-6 border-t border-gray-300">
                        <p className={`text-sm font-semibold mb-3 ${isLight ? 'text-gray-700' : 'text-gray-300'}`}>
                            Meal Intensity:
                        </p>
                        <div className="flex flex-wrap gap-3 items-center">
                            <div className="flex items-center gap-2">
                                <div className={`w-4 h-4 rounded ${isLight ? 'bg-gray-200' : 'bg-gray-700'}`}></div>
                                <span className={`text-xs sm:text-sm ${isLight ? 'text-gray-600' : 'text-gray-400'}`}>0</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <div className={`w-4 h-4 rounded ${isLight ? 'bg-green-100' : 'bg-green-900'}`}></div>
                                <span className={`text-xs sm:text-sm ${isLight ? 'text-gray-600' : 'text-gray-400'}`}>1</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <div className={`w-4 h-4 rounded ${isLight ? 'bg-green-300' : 'bg-green-700'}`}></div>
                                <span className={`text-xs sm:text-sm ${isLight ? 'text-gray-600' : 'text-gray-400'}`}>2</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <div className={`w-4 h-4 rounded ${isLight ? 'bg-green-500' : 'bg-green-600'}`}></div>
                                <span className={`text-xs sm:text-sm ${isLight ? 'text-gray-600' : 'text-gray-400'}`}>3</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <div className={`w-4 h-4 rounded ${isLight ? 'bg-green-700' : 'bg-green-500'}`}></div>
                                <span className={`text-xs sm:text-sm ${isLight ? 'text-gray-600' : 'text-gray-400'}`}>4+</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Meal Input Modal */}
                {showMealModal && selectedDate && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                        <div className={`${isLight ? 'bg-white' : 'bg-gray-800'} rounded-2xl max-w-md w-full shadow-2xl p-6`}>
                            <div className="flex justify-between items-center mb-6">
                                <h3 className={`text-xl sm:text-2xl font-bold ${isLight ? 'text-gray-900' : 'text-white'}`}>
                                    Meals for {selectedDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                                </h3>
                                <button
                                    onClick={() => {
                                        setShowMealModal(false);
                                        setSelectedDate(null);
                                        setMeals({ breakfast: 0, lunch: 0, dinner: 0 });
                                    }}
                                    className={`text-2xl ${isLight ? 'text-gray-600 hover:text-gray-800' : 'text-gray-400 hover:text-gray-200'}`}
                                >
                                    ✕
                                </button>
                            </div>

                            {/* Meal Types */}
                            <div className="space-y-4">
                                {/* Breakfast */}
                                <div>
                                    <label className={`block text-sm font-semibold mb-2 ${isLight ? 'text-gray-700' : 'text-gray-300'}`}>
                                        🌅 Breakfast
                                    </label>
                                    <div className="flex items-center gap-2">
                                        <button
                                            onClick={() => handleMealChange('breakfast', Math.max(0, meals.breakfast - 1))}
                                            className={`px-3 py-2 rounded-lg ${isLight ? 'bg-gray-200 hover:bg-gray-300 text-gray-800' : 'bg-gray-700 hover:bg-gray-600 text-white'} transition-colors`}
                                        >
                                            −
                                        </button>
                                        <input
                                            type="number"
                                            min="0"
                                            max="10"
                                            value={meals.breakfast}
                                            onChange={(e) => handleMealChange('breakfast', e.target.value)}
                                            className={`flex-1 px-3 py-2 rounded-lg border text-center ${isLight ? 'border-gray-300 bg-white text-gray-900' : 'border-gray-600 bg-gray-700 text-white'} focus:outline-none focus:ring-2 focus:ring-blue-500`}
                                        />
                                        <button
                                            onClick={() => handleMealChange('breakfast', meals.breakfast + 1)}
                                            className={`px-3 py-2 rounded-lg ${isLight ? 'bg-gray-200 hover:bg-gray-300 text-gray-800' : 'bg-gray-700 hover:bg-gray-600 text-white'} transition-colors`}
                                        >
                                            +
                                        </button>
                                    </div>
                                </div>

                                {/* Lunch */}
                                <div>
                                    <label className={`block text-sm font-semibold mb-2 ${isLight ? 'text-gray-700' : 'text-gray-300'}`}>
                                        🍽️ Lunch
                                    </label>
                                    <div className="flex items-center gap-2">
                                        <button
                                            onClick={() => handleMealChange('lunch', Math.max(0, meals.lunch - 1))}
                                            className={`px-3 py-2 rounded-lg ${isLight ? 'bg-gray-200 hover:bg-gray-300 text-gray-800' : 'bg-gray-700 hover:bg-gray-600 text-white'} transition-colors`}
                                        >
                                            −
                                        </button>
                                        <input
                                            type="number"
                                            min="0"
                                            max="10"
                                            value={meals.lunch}
                                            onChange={(e) => handleMealChange('lunch', e.target.value)}
                                            className={`flex-1 px-3 py-2 rounded-lg border text-center ${isLight ? 'border-gray-300 bg-white text-gray-900' : 'border-gray-600 bg-gray-700 text-white'} focus:outline-none focus:ring-2 focus:ring-blue-500`}
                                        />
                                        <button
                                            onClick={() => handleMealChange('lunch', meals.lunch + 1)}
                                            className={`px-3 py-2 rounded-lg ${isLight ? 'bg-gray-200 hover:bg-gray-300 text-gray-800' : 'bg-gray-700 hover:bg-gray-600 text-white'} transition-colors`}
                                        >
                                            +
                                        </button>
                                    </div>
                                </div>

                                {/* Dinner */}
                                <div>
                                    <label className={`block text-sm font-semibold mb-2 ${isLight ? 'text-gray-700' : 'text-gray-300'}`}>
                                        🌙 Dinner
                                    </label>
                                    <div className="flex items-center gap-2">
                                        <button
                                            onClick={() => handleMealChange('dinner', Math.max(0, meals.dinner - 1))}
                                            className={`px-3 py-2 rounded-lg ${isLight ? 'bg-gray-200 hover:bg-gray-300 text-gray-800' : 'bg-gray-700 hover:bg-gray-600 text-white'} transition-colors`}
                                        >
                                            −
                                        </button>
                                        <input
                                            type="number"
                                            min="0"
                                            max="10"
                                            value={meals.dinner}
                                            onChange={(e) => handleMealChange('dinner', e.target.value)}
                                            className={`flex-1 px-3 py-2 rounded-lg border text-center ${isLight ? 'border-gray-300 bg-white text-gray-900' : 'border-gray-600 bg-gray-700 text-white'} focus:outline-none focus:ring-2 focus:ring-blue-500`}
                                        />
                                        <button
                                            onClick={() => handleMealChange('dinner', meals.dinner + 1)}
                                            className={`px-3 py-2 rounded-lg ${isLight ? 'bg-gray-200 hover:bg-gray-300 text-gray-800' : 'bg-gray-700 hover:bg-gray-600 text-white'} transition-colors`}
                                        >
                                            +
                                        </button>
                                    </div>
                                </div>

                                {/* Total */}
                                <div className={`p-4 rounded-lg ${isLight ? 'bg-blue-50 border-blue-200' : 'bg-blue-900 border-blue-700'} border`}>
                                    <p className={`text-sm font-semibold ${isLight ? 'text-blue-800' : 'text-blue-200'}`}>
                                        Total Meals: <span className="text-lg font-bold">{meals.breakfast + meals.lunch + meals.dinner}</span>
                                    </p>
                                </div>
                            </div>

                            {/* Actions */}
                            <div className="flex gap-3 mt-6">
                                <button
                                    onClick={() => {
                                        setShowMealModal(false);
                                        setSelectedDate(null);
                                        setMeals({ breakfast: 0, lunch: 0, dinner: 0 });
                                    }}
                                    className={`flex-1 px-4 py-3 rounded-lg font-semibold ${isLight ? 'bg-gray-200 hover:bg-gray-300 text-gray-800' : 'bg-gray-700 hover:bg-gray-600 text-white'} transition-colors`}
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={saveMeal}
                                    disabled={isSaving}
                                    className={`flex-1 px-4 py-3 rounded-lg font-semibold bg-blue-600 hover:bg-blue-700 text-white transition-colors`}
                                >
                                    {isSaving ? 'Saving...' : 'Save Meals'}
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default MealCalendar;
