import React, { use, useEffect, useMemo, useState } from 'react';
import { AuthContext } from '../../provider/AuthContext';
import { toast } from 'react-toastify';
import { createMenu, deleteMenu, getMenus, updateMenu } from '../../utils/menuApi';

const DailyMenuPage = () => {
    const { isLight, user, userRole, currentGroup } = use(AuthContext);
    const normalizedRole = userRole ? userRole.toLowerCase() : null;
    const groupId = currentGroup?.id || currentGroup?._id || null;
    const [menus, setMenus] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
    const [menuForm, setMenuForm] = useState({
        date: '',
        breakfast: '',
        lunch: '',
        dinner: '',
    });

    useEffect(() => {
        const loadMenus = async () => {
            if (!user || !groupId) {
                return;
            }

            try {
                setIsLoading(true);
                const token = await user.getIdToken();
                const data = await getMenus(token, { groupID: groupId });
                setMenus(data?.data || []);
            } catch (error) {
                toast.error(error.message || 'Failed to load menu entries');
            } finally {
                setIsLoading(false);
            }
        };

        loadMenus();
    }, [user, groupId]);

    const latestMenu = useMemo(() => {
        if (!menus.length) {
            return null;
        }

        return [...menus].sort((a, b) => new Date(b.date) - new Date(a.date))[0];
    }, [menus]);

    useEffect(() => {
        if (!latestMenu) {
            setMenuForm((prev) => ({
                ...prev,
                breakfast: '',
                lunch: '',
                dinner: '',
            }));
            return;
        }

        const menuDate = new Date(latestMenu.date || latestMenu.createdAt);
        const normalizedDate = Number.isNaN(menuDate.getTime())
            ? ''
            : `${menuDate.getFullYear()}-${String(menuDate.getMonth() + 1).padStart(2, '0')}-${String(menuDate.getDate()).padStart(2, '0')}`;

        setMenuForm({
            date: normalizedDate,
            breakfast: latestMenu.breakfast || '',
            lunch: latestMenu.lunch || '',
            dinner: latestMenu.dinner || '',
        });
    }, [latestMenu]);

    const handleFormChange = (event) => {
        const { name, value } = event.target;
        setMenuForm((prev) => ({ ...prev, [name]: value }));
    };

    const loadMenus = async () => {
        if (!user || !groupId) {
            return;
        }

        const token = await user.getIdToken();
        const data = await getMenus(token, { groupID: groupId });
        setMenus(data?.data || []);
    };

    const handleSaveMenu = async (event) => {
        event.preventDefault();

        if (!user || normalizedRole !== 'manager' || !groupId) {
            return;
        }

        if (!menuForm.breakfast.trim() && !menuForm.lunch.trim() && !menuForm.dinner.trim()) {
            toast.error('Please add at least one meal item');
            return;
        }

        try {
            setIsSaving(true);
            const token = await user.getIdToken();
            const payload = {
                groupID: groupId,
                date: menuForm.date || undefined,
                breakfast: menuForm.breakfast,
                lunch: menuForm.lunch,
                dinner: menuForm.dinner,
            };

            if (latestMenu?._id) {
                await updateMenu(latestMenu._id, payload, token);
                toast.success('Menu updated successfully');
            } else {
                await createMenu(payload, token);
                toast.success('Menu created successfully');
            }

            await loadMenus();
        } catch (error) {
            toast.error(error.message || 'Failed to save menu');
        } finally {
            setIsSaving(false);
        }
    };

    const handleDeleteMenu = async () => {
        if (!user || normalizedRole !== 'manager' || !latestMenu?._id) {
            return;
        }

        try {
            setIsDeleting(true);
            const token = await user.getIdToken();
            await deleteMenu(latestMenu._id, token);
            toast.success('Menu deleted successfully');
            await loadMenus();
        } catch (error) {
            toast.error(error.message || 'Failed to delete menu');
        } finally {
            setIsDeleting(false);
        }
    };

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
                    {normalizedRole === 'manager'
                        ? 'Manager can create, update, or delete menu. Members can view only.'
                        : 'Latest menu from your group'}
                </p>
            </div>

            {normalizedRole === 'manager' && (
                <form
                    onSubmit={handleSaveMenu}
                    className={`rounded-xl border p-4 sm:p-5 ${isLight ? 'bg-white border-gray-200' : 'bg-gray-800 border-gray-700'} grid grid-cols-1 sm:grid-cols-2 gap-3`}
                >
                    <div className="sm:col-span-2">
                        <h2 className={`text-lg font-semibold ${isLight ? 'text-gray-900' : 'text-white'}`}>
                            {latestMenu ? 'Update Latest Menu' : 'Create Menu'}
                        </h2>
                    </div>

                    <input
                        type="date"
                        name="date"
                        value={menuForm.date}
                        onChange={handleFormChange}
                        className={`rounded-lg border px-3 py-2 text-sm ${isLight ? 'bg-white border-gray-300 text-gray-900' : 'bg-gray-700 border-gray-600 text-white'}`}
                    />
                    <div className="hidden sm:block" />

                    <textarea
                        name="breakfast"
                        value={menuForm.breakfast}
                        onChange={handleFormChange}
                        placeholder="Breakfast menu"
                        rows={3}
                        className={`rounded-lg border px-3 py-2 text-sm resize-none ${isLight ? 'bg-white border-gray-300 text-gray-900' : 'bg-gray-700 border-gray-600 text-white'}`}
                    />
                    <textarea
                        name="lunch"
                        value={menuForm.lunch}
                        onChange={handleFormChange}
                        placeholder="Lunch menu"
                        rows={3}
                        className={`rounded-lg border px-3 py-2 text-sm resize-none ${isLight ? 'bg-white border-gray-300 text-gray-900' : 'bg-gray-700 border-gray-600 text-white'}`}
                    />
                    <textarea
                        name="dinner"
                        value={menuForm.dinner}
                        onChange={handleFormChange}
                        placeholder="Dinner menu"
                        rows={3}
                        className={`sm:col-span-2 rounded-lg border px-3 py-2 text-sm resize-none ${isLight ? 'bg-white border-gray-300 text-gray-900' : 'bg-gray-700 border-gray-600 text-white'}`}
                    />

                    <div className="sm:col-span-2 flex items-center gap-2">
                        <button
                            type="submit"
                            disabled={isSaving}
                            className="rounded-lg bg-violet-600 hover:bg-violet-700 px-4 py-2 text-sm font-medium text-white disabled:opacity-60"
                        >
                            {isSaving ? 'Saving...' : latestMenu ? 'Update Menu' : 'Create Menu'}
                        </button>

                        {latestMenu && (
                            <button
                                type="button"
                                onClick={handleDeleteMenu}
                                disabled={isDeleting}
                                className="rounded-lg bg-red-600 hover:bg-red-700 px-4 py-2 text-sm font-medium text-white disabled:opacity-60"
                            >
                                {isDeleting ? 'Deleting...' : 'Delete Menu'}
                            </button>
                        )}
                    </div>
                </form>
            )}

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
