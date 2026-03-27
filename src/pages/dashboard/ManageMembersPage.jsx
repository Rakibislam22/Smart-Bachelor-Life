import React, { use, useState } from 'react';
import { AuthContext } from '../../provider/AuthContext';

const ManageMembersPage = () => {
    const { isLight, userRole } = use(AuthContext);

    const [members, setMembers] = useState([
        { name: 'Nafis Ahmed', role: 'Manager', meals: 88, due: '৳ 0', status: 'Active' },
        { name: 'Rafi Islam', role: 'Member', meals: 76, due: '৳ 500', status: 'Active' },
        { name: 'Mim Sultana', role: 'Member', meals: 71, due: '৳ 0', status: 'Active' },
        { name: 'Tanvir Hasan', role: 'Member', meals: 69, due: '৳ 300', status: 'Pending' },
    ]);
    const [inviteEmail, setInviteEmail] = useState('');
    const [inviteCode] = useState('SBL-26A9');

    const handleInviteMember = (e) => {
        e.preventDefault();
        if (!inviteEmail.trim()) return;

        const newMemberName = inviteEmail.split('@')[0].replace('.', ' ');
        setMembers((prevMembers) => [
            ...prevMembers,
            {
                name: newMemberName.charAt(0).toUpperCase() + newMemberName.slice(1),
                role: 'Member',
                meals: 0,
                due: '৳ 0',
                status: 'Invited',
            },
        ]);
        setInviteEmail('');
    };

    const handleRoleSwitch = (memberName, newRole) => {
        setMembers((prevMembers) =>
            prevMembers.map((member) =>
                member.name === memberName ? { ...member, role: newRole } : member
            )
        );
    };

    return (
        <div className="space-y-4 sm:space-y-6">
            <div>
                <h1 className={`text-xl sm:text-3xl font-bold ${isLight ? 'text-gray-900' : 'text-white'}`}>Manage Members</h1>
                <p className={`${isLight ? 'text-gray-600' : 'text-gray-400'} mt-1 text-sm sm:text-base`}>Demo member list and status information</p>
            </div>

            {userRole === 'manager' && (
                <div className={`rounded-xl border p-4 sm:p-5 ${isLight ? 'bg-white border-gray-200' : 'bg-gray-800 border-gray-700'}`}>
                    <div className="flex flex-col gap-3 sm:gap-4">
                        <div>
                            <h2 className={`text-base sm:text-xl font-semibold ${isLight ? 'text-gray-900' : 'text-white'}`}>
                                Invite Member
                            </h2>
                            <p className={`text-xs sm:text-sm mt-1 ${isLight ? 'text-gray-600' : 'text-gray-400'}`}>
                                Share invite code {inviteCode} or send invitation by email
                            </p>
                        </div>

                        <form onSubmit={handleInviteMember} className="flex flex-col sm:flex-row gap-2 sm:gap-3">
                            <input
                                type="email"
                                value={inviteEmail}
                                onChange={(e) => setInviteEmail(e.target.value)}
                                placeholder="Enter member email"
                                className={`w-full rounded-lg border px-3 py-2 text-sm ${isLight
                                    ? 'bg-white border-gray-300 text-gray-900'
                                    : 'bg-gray-700 border-gray-600 text-white'
                                    } focus:outline-none focus:ring-2 focus:ring-violet-500`}
                                required
                            />
                            <button
                                type="submit"
                                className="rounded-lg px-4 py-2 text-sm font-medium bg-violet-600 hover:bg-violet-700 text-white transition-colors"
                            >
                                Send Invite
                            </button>
                        </form>
                    </div>
                </div>
            )}

            <div className={`rounded-xl border overflow-hidden ${isLight ? 'bg-white border-gray-200' : 'bg-gray-800 border-gray-700'}`}>
                <div className="overflow-x-auto">
                    <table className="w-full min-w-160">
                        <thead className={`${isLight ? 'bg-gray-50' : 'bg-gray-700/60'}`}>
                            <tr>
                                <th className="px-4 py-3 text-left text-sm">Name</th>
                                <th className="px-4 py-3 text-left text-sm">Role</th>
                                <th className="px-4 py-3 text-left text-sm">Meals</th>
                                <th className="px-4 py-3 text-left text-sm">Due</th>
                                <th className="px-4 py-3 text-left text-sm">Status</th>
                                {userRole === 'manager' && <th className="px-4 py-3 text-left text-sm">Role Switch</th>}
                            </tr>
                        </thead>
                        <tbody>
                            {members.map((member) => (
                                <tr key={member.name} className={`border-t ${isLight ? 'border-gray-200' : 'border-gray-700'}`}>
                                    <td className="px-4 py-3 text-sm">{member.name}</td>
                                    <td className="px-4 py-3 text-sm">{member.role}</td>
                                    <td className="px-4 py-3 text-sm">{member.meals}</td>
                                    <td className="px-4 py-3 text-sm">{member.due}</td>
                                    <td className="px-4 py-3 text-sm">{member.status}</td>
                                    {userRole === 'manager' && (
                                        <td className="px-4 py-3 text-sm">
                                            <select
                                                value={member.role}
                                                onChange={(e) => handleRoleSwitch(member.name, e.target.value)}
                                                className={`rounded-md border px-2 py-1 text-xs sm:text-sm ${isLight
                                                    ? 'bg-white border-gray-300 text-gray-900'
                                                    : 'bg-gray-700 border-gray-600 text-white'
                                                    }`}
                                            >
                                                <option value="Member">Member</option>
                                                <option value="Manager">Manager</option>
                                            </select>
                                        </td>
                                    )}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default ManageMembersPage;
