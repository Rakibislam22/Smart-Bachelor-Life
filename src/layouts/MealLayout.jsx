import React, { useState } from 'react';
import MealCalendar from '../pages/MealCalendar';
import GroupMealView from '../pages/GroupMealView';

const MealLayout = () => {
    const [activeTab, setActiveTab] = useState('calendar');

    return (
        <div>
            {/* Tab Navigation - Mobile Only */}
            <div className="lg:hidden mt-6 flex border-b border-gray-200 dark:border-gray-700">
                <button
                    onClick={() => setActiveTab('calendar')}
                    className={`flex-1 py-3 px-4 text-center font-medium transition-colors border-b-2 ${activeTab === 'calendar'
                            ? 'border-violet-500 text-violet-600 dark:text-violet-400'
                            : 'border-transparent text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
                        }`}
                >
                    Meal Calendar
                </button>
                <button
                    onClick={() => setActiveTab('meals')}
                    className={`flex-1 py-3 px-4 text-center font-medium transition-colors border-b-2 ${activeTab === 'meals'
                            ? 'border-violet-500 text-violet-600 dark:text-violet-400'
                            : 'border-transparent text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
                        }`}
                >
                    Group Meals
                </button>
            </div>

            {/* Content - Grid on Desktop, Tabs on Mobile */}
            <div className="mt-6 grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6">
                {/* Meal Calendar Section */}
                <div
                    id="meal-calendar-section"
                    className={`lg:block ${activeTab === 'calendar' ? 'block' : 'hidden'}`}
                >
                    <MealCalendar embedded />
                </div>

                {/* Group Meal View Section */}
                <div
                    id="group-meals-section"
                    className={`lg:block ${activeTab === 'meals' ? 'block' : 'hidden'}`}
                >
                    <GroupMealView />
                </div>
            </div>
        </div>
    );
};

export default MealLayout;