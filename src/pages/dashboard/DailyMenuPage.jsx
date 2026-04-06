import React, { use, useEffect, useMemo, useState } from 'react';
import { AuthContext } from '../../provider/AuthContext';
import { toast } from 'react-toastify';
import { getMenus } from '../../utils/menuApi';

const DailyMenuPage = () => {
    const { isLight, user, currentGroup } = use(AuthContext);
    const [menus, setMenus] = useState([]);
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        const loadMenus = async () => {
            if (!user || !currentGroup?.id) {
                return;
            }

            try {
                setIsLoading(true);
                const token = await user.getIdToken();
                const data = await getMenus(token, { groupID: currentGroup.id });
                setMenus(data?.data || []);
            } catch (error) {
                toast.error(error.message || 'Failed to load menu entries');
            } finally {
                setIsLoading(false);
            }
        };

        loadMenus();
    }, [user, currentGroup?.id]);

    const latestMenu = useMemo(() => {
        if (!menus.length) {
            return null;
        }

        return [...menus].sort((a, b) => new Date(b.date) - new Date(a.date))[0];
    }, [menus]);

    const menu = latestMenu
        ? [
            { meal: 'Breakfast', items: latestMenu.breakfast || 'Not set' },
            { meal: 'Lunch', items: latestMenu.lunch || 'Not set' },
            { meal: 'Dinner', items: latestMenu.dinner || 'Not set' },
        ]
        : [];

    return (
        <div className="space-y-4 sm:space-y-6">
            <div>
                <h1 className={`text-xl sm:text-3xl font-bold ${isLight ? 'text-gray-900' : 'text-white'}`}>Daily Menu</h1>
                <p className={`${isLight ? 'text-gray-600' : 'text-gray-400'} mt-1 text-sm sm:text-base`}>
                    Latest menu from your group
                </p>
            </div>

            {isLoading && <p className="text-sm">Loading menu...</p>}

            {!isLoading && !latestMenu && (
                <p className="text-sm">No menu found for your group yet.</p>
            )}

            {!isLoading && latestMenu && (
                <p className={`text-xs ${isLight ? 'text-gray-500' : 'text-gray-400'}`}>
                    Menu Date: {new Date(latestMenu.date || latestMenu.createdAt).toLocaleDateString()}
                </p>
            )}

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
