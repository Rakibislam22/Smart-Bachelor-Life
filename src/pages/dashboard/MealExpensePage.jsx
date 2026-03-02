import React, { use } from 'react';
import { AuthContext } from '../../provider/AuthContext';

const MealExpensePage = () => {
    const { isLight } = use(AuthContext);

    // Demo data: Group members' meals
    const mealLog = [
        { member: 'You', meals: 20 },
        { member: 'Ahmed', meals: 22 },
        { member: 'Karim', meals: 18 },
        { member: 'Rashed', meals: 20 },
    ];

    // Other group expenses
    const otherExpenses = [
        { name: 'Rent', amount: 8000 },
        { name: 'Utilities (Gas, Water, Electric)', amount: 2500 },
        { name: 'Cook Bill', amount: 3000 },
        { name: 'Miscellaneous', amount: 1500 },
    ];

    // Total bazar cost from shopping
    const totalBazarCost = 5130; // ৳ 1900 + 1760 + 850 + 620

    // Calculate total group meals
    const totalGroupMeals = mealLog.reduce((sum, item) => sum + item.meals, 0);

    // Calculate meal rate
    const mealRate = totalBazarCost / totalGroupMeals;

    // Calculate total other expenses
    const totalOtherExpenses = otherExpenses.reduce((sum, exp) => sum + exp.amount, 0);

    // Number of members
    const totalMembers = mealLog.length;

    // Per member share of other expenses
    const perMemberOtherExpenses = totalOtherExpenses / totalMembers;

    // Your meal cost (assuming "You" is the first member)
    const yourMeals = mealLog[0].meals;
    const yourMealCost = yourMeals * mealRate;
    const yourTotalCost = yourMealCost + perMemberOtherExpenses;

    return (
        <div className="space-y-4 sm:space-y-6">
            <div>
                <h1 className={`text-xl sm:text-3xl font-bold ${isLight ? 'text-gray-900' : 'text-white'}`}>Meal Expense</h1>
                <p className={`${isLight ? 'text-gray-600' : 'text-gray-400'} mt-1 text-sm sm:text-base`}>Meal cost calculation based on group bazaar</p>
            </div>

            {/* Meal Rate Calculation */}
            <div className={`rounded-xl border p-4 sm:p-5 ${isLight ? 'bg-white border-gray-200' : 'bg-gray-800 border-gray-700'}`}>
                <h2 className={`text-lg font-semibold mb-4 ${isLight ? 'text-gray-900' : 'text-white'}`}>Meal Rate Calculation</h2>
                <div className="space-y-3">
                    <div className={`p-3 rounded-lg ${isLight ? 'bg-gray-50' : 'bg-gray-700/40'}`}>
                        <p className="text-sm">Total Bazaar Cost</p>
                        <p className="font-semibold">৳ {totalBazarCost.toLocaleString()}</p>
                    </div>
                    <div className={`p-3 rounded-lg ${isLight ? 'bg-gray-50' : 'bg-gray-700/40'}`}>
                        <p className="text-sm">Total Group Meals</p>
                        <p className="font-semibold">{totalGroupMeals} meals</p>
                    </div>
                    <div className={`p-3 rounded-lg ${isLight ? 'bg-blue-50 border border-blue-200' : 'bg-blue-900/20 border border-blue-800'}`}>
                        <p className="text-sm">Meal Rate</p>
                        <p className="font-bold text-lg">৳ {mealRate.toFixed(2)} <span className="text-sm font-normal">per meal</span></p>
                        <p className={`text-xs mt-1 ${isLight ? 'text-gray-600' : 'text-gray-400'}`}>
                            {totalBazarCost.toLocaleString()} ÷ {totalGroupMeals} = {mealRate.toFixed(2)}
                        </p>
                    </div>
                </div>
            </div>

            {/* Other Group Expenses */}
            <div className={`rounded-xl border p-4 sm:p-5 ${isLight ? 'bg-white border-gray-200' : 'bg-gray-800 border-gray-700'}`}>
                <h2 className={`text-lg font-semibold mb-4 ${isLight ? 'text-gray-900' : 'text-white'}`}>Other Group Expenses</h2>
                <div className="space-y-2">
                    {otherExpenses.map((expense) => (
                        <div key={expense.name} className={`flex items-center justify-between p-3 rounded-lg ${isLight ? 'bg-gray-50' : 'bg-gray-700/40'}`}>
                            <p className="text-sm">{expense.name}</p>
                            <p className="font-semibold">৳ {expense.amount.toLocaleString()}</p>
                        </div>
                    ))}
                </div>
                <div className={`mt-4 pt-4 border-t ${isLight ? 'border-gray-200' : 'border-gray-700'} flex items-center justify-between`}>
                    <p className="font-semibold">Total Other Expenses</p>
                    <p className="font-bold text-lg">৳ {totalOtherExpenses.toLocaleString()}</p>
                </div>
                <div className={`mt-3 p-3 rounded-lg ${isLight ? 'bg-orange-50 border border-orange-200' : 'bg-orange-900/20 border border-orange-800'}`}>
                    <p className="text-sm">Per Member Share</p>
                    <p className="font-bold">৳ {perMemberOtherExpenses.toFixed(2)}</p>
                    <p className={`text-xs mt-1 ${isLight ? 'text-gray-600' : 'text-gray-400'}`}>
                        {totalOtherExpenses.toLocaleString()} ÷ {totalMembers} members = {perMemberOtherExpenses.toFixed(2)}
                    </p>
                </div>
            </div>

            {/* Your Total Expense */}
            <div className={`rounded-xl border p-4 sm:p-5 ${isLight ? 'bg-white border-gray-200' : 'bg-gray-800 border-gray-700'}`}>
                <h2 className={`text-lg font-semibold mb-4 ${isLight ? 'text-gray-900' : 'text-white'}`}>Your Total Expense</h2>
                <div className="space-y-3">
                    <div className={`p-3 rounded-lg ${isLight ? 'bg-gray-50' : 'bg-gray-700/40'}`}>
                        <p className="text-sm">Meal Cost</p>
                        <p className="font-semibold">{yourMeals} meals × ৳ {mealRate.toFixed(2)} = ৳ {yourMealCost.toFixed(2)}</p>
                    </div>
                    <div className={`p-3 rounded-lg ${isLight ? 'bg-gray-50' : 'bg-gray-700/40'}`}>
                        <p className="text-sm">Other Expense Share</p>
                        <p className="font-semibold">৳ {perMemberOtherExpenses.toFixed(2)}</p>
                    </div>
                    <div className={`p-3 rounded-lg ${isLight ? 'bg-green-50 border border-green-200' : 'bg-green-900/20 border border-green-800'}`}>
                        <p className="text-sm">Total Amount</p>
                        <p className="font-bold text-lg">৳ {yourTotalCost.toFixed(2)}</p>
                        <p className={`text-xs mt-1 ${isLight ? 'text-gray-600' : 'text-gray-400'}`}>
                            {yourMealCost.toFixed(2)} + {perMemberOtherExpenses.toFixed(2)} = {yourTotalCost.toFixed(2)}
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default MealExpensePage;
