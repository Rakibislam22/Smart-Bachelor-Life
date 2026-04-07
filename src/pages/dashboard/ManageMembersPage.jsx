import React, { use, useCallback, useEffect, useState } from 'react';
import { AuthContext } from '../../provider/AuthContext';
import { toast } from 'react-toastify';
import {
    changeGroupUserRole,
    getManagerGroupDetails,
    removeGroupUser,
    revokeGroupInvite,
    sendJoinCodeInvites,
} from '../../utils/groupApi';

const ManageMembersPage = () => {
    const { isLight, userRole, user } = use(AuthContext);
    const normalizedRole = userRole ? userRole.toLowerCase() : null;

    const [members, setMembers] = useState([]);
    const [pendingInvites, setPendingInvites] = useState([]);
    const [inviteEmails, setInviteEmails] = useState('');
    const [inviteCode, setInviteCode] = useState('');
    const [lastInviteResult, setLastInviteResult] = useState({ sent: [], failed: [] });
    const [isLoading, setIsLoading] = useState(false);
    const [isInviting, setIsInviting] = useState(false);
    const [isRevoking, setIsRevoking] = useState('');

    const parseInviteEmails = (value) => {
        const uniqueEmails = new Set();

        String(value || '')
            .split(/[\n,]/)
            .map((email) => email.trim().toLowerCase())
            .filter(Boolean)
            .forEach((email) => {
                uniqueEmails.add(email);
            });

        return Array.from(uniqueEmails);
    };

    const loadGroupDetails = useCallback(async () => {
        if (!user || normalizedRole !== 'manager') {
            return;
        }

        try {
            setIsLoading(true);
            const token = await user.getIdToken();
            const data = await getManagerGroupDetails(token);
            const group = data?.group;

            setInviteCode(group?.joinCode || 'N/A');

            const mappedMembers = (group?.userIDs || []).map((member) => ({
                id: member._id,
                name: member.displayName || member.email,
                email: member.email,
                role: 'Member',
                status: 'Active',
            }));

            const memberEmails = new Set(
                mappedMembers
                    .map((member) => (typeof member.email === 'string' ? member.email.toLowerCase() : ''))
                    .filter(Boolean)
            );

            const pendingEmails = (group?.invitedEmails || [])
                .map((email) => (typeof email === 'string' ? email.trim() : ''))
                .filter((email) => email && !memberEmails.has(email.toLowerCase()));

            setMembers(mappedMembers);
            setPendingInvites(pendingEmails);
        } catch (error) {
            toast.error(error.message || 'Failed to load group members');
        } finally {
            setIsLoading(false);
        }
    }, [user, normalizedRole]);

    useEffect(() => {
        loadGroupDetails();
    }, [loadGroupDetails]);

    const handleInviteMember = async (e) => {
        e.preventDefault();
        const inviteList = parseInviteEmails(inviteEmails);

        if (inviteList.length === 0 || !user) {
            return;
        }

        try {
            setIsInviting(true);
            const token = await user.getIdToken();
            const data = await sendJoinCodeInvites(inviteList, token);
            setLastInviteResult({
                sent: data?.successfullyInvitedEmails || inviteList,
                failed: data?.invalidEmails || [],
            });
            toast.success('Invite sent successfully');
            setInviteEmails('');
        } catch (error) {
            toast.error(error.message || 'Failed to send invite');
        } finally {
            setIsInviting(false);
        }
    };

    const handleMakeManager = async (memberId) => {
        if (!user) {
            return;
        }

        try {
            const token = await user.getIdToken();
            await changeGroupUserRole(memberId, token);
            toast.success('Manager role transferred successfully');
            await loadGroupDetails();
        } catch (error) {
            toast.error(error.message || 'Failed to change role');
        }
    };

    const handleRemoveMember = async (email) => {
        if (!user) {
            return;
        }

        try {
            const token = await user.getIdToken();
            await removeGroupUser(email, token);
            toast.success('Member removed successfully');
            await loadGroupDetails();
        } catch (error) {
            toast.error(error.message || 'Failed to remove member');
        }
    };

    const handleRevokeInvite = async (email) => {
        if (!user || !email) {
            return;
        }

        try {
            setIsRevoking(email);
            const token = await user.getIdToken();
            await revokeGroupInvite(email, token);
            toast.success('Invite revoked successfully');
            await loadGroupDetails();
        } catch (error) {
            toast.error(error.message || 'Failed to revoke invite');
        } finally {
            setIsRevoking('');
        }
    };

    return (
        <div className="space-y-4 sm:space-y-6">
            <div>
                <h1 className={`text-xl sm:text-3xl font-bold ${isLight ? 'text-gray-900' : 'text-white'}`}>Manage Members</h1>
                <p className={`${isLight ? 'text-gray-600' : 'text-gray-400'} mt-1 text-sm sm:text-base`}>Group member list and status information</p>
            </div>

            {normalizedRole === 'manager' && (
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

                        <form onSubmit={handleInviteMember} className="flex flex-col lg:flex-row gap-3 lg:items-stretch">
                            <div className="flex-1 space-y-2">
                                <textarea
                                    value={inviteEmails}
                                    onChange={(e) => setInviteEmails(e.target.value)}
                                    placeholder="Enter one or more member emails separated by commas or new lines"
                                    rows={1}
                                    className={`w-full h-13 min-h-13 rounded-xl border px-4 py-3 text-sm leading-none resize-none shadow-sm transition-all duration-200 ${isLight
                                        ? 'bg-white border-gray-300 text-gray-900 placeholder:text-gray-400'
                                        : 'bg-gray-700 border-gray-600 text-white placeholder:text-gray-400'
                                        } focus:outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-500/30`}
                                    required
                                />
                                <p className={`text-xs ${isLight ? 'text-gray-500' : 'text-gray-400'}`}>
                                    Example: a@demo.com, b@demo.com or one email per line
                                </p>
                            </div>
                            <button
                                type="submit"
                                disabled={isInviting}
                                className="inline-flex w-full h-12 min-h-12 lg:w-auto items-center justify-center gap-2 rounded-xl bg-indigo-600 px-5 py-1 text-sm font-semibold text-white shadow-lg shadow-violet-600/20 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-xl hover:shadow-violet-600/30 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-70 disabled:hover:translate-y-0"
                            >
                                {isInviting ? 'Sending...' : 'Send Invite'}
                            </button>
                        </form>

                        {(lastInviteResult.sent.length > 0 || lastInviteResult.failed.length > 0) && (
                            <div className={`rounded-lg border px-3 py-2 text-sm space-y-1 ${isLight ? 'bg-green-50 border-green-200 text-green-800' : 'bg-green-900/20 border-green-800 text-green-200'}`}>
                                {lastInviteResult.sent.length > 0 && <p>Sent to: {lastInviteResult.sent.join(', ')}</p>}
                                {lastInviteResult.failed.length > 0 && <p className={isLight ? 'text-red-600' : 'text-red-300'}>Failed: {lastInviteResult.failed.join(', ')}</p>}
                            </div>
                        )}
                    </div>
                </div>
            )}

            <div className={`rounded-xl border overflow-hidden ${isLight ? 'bg-white border-gray-200' : 'bg-gray-800 border-gray-700'}`}>
                <div className="overflow-x-auto">
                    <table className="w-full min-w-160">
                        <thead className={`${isLight ? 'bg-gray-50' : 'bg-gray-700/60'}`}>
                            <tr>
                                <th className="px-4 py-3 text-left text-sm">Name</th>
                                <th className="px-4 py-3 text-left text-sm">Email</th>
                                <th className="px-4 py-3 text-left text-sm">Role</th>
                                <th className="px-4 py-3 text-left text-sm">Status</th>
                                {normalizedRole === 'manager' && <th className="px-4 py-3 text-left text-sm">Actions</th>}
                            </tr>
                        </thead>
                        <tbody>
                            {isLoading && (
                                <tr>
                                    <td colSpan={normalizedRole === 'manager' ? 5 : 4} className="px-4 py-4 text-sm">
                                        Loading members...
                                    </td>
                                </tr>
                            )}

                            {!isLoading && members.length === 0 && pendingInvites.length === 0 && (
                                <tr>
                                    <td colSpan={normalizedRole === 'manager' ? 5 : 4} className="px-4 py-4 text-sm">
                                        No members found.
                                    </td>
                                </tr>
                            )}

                            {members.map((member) => (
                                <tr key={member.id} className={`border-t ${isLight ? 'border-gray-200' : 'border-gray-700'}`}>
                                    <td className="px-4 py-3 text-sm">{member.name}</td>
                                    <td className="px-4 py-3 text-sm">{member.email}</td>
                                    <td className="px-4 py-3 text-sm">{member.role}</td>
                                    <td className="px-4 py-3 text-sm">{member.status}</td>
                                    {normalizedRole === 'manager' && (
                                        <td className="px-4 py-3 text-sm">
                                            <div className="flex gap-2">
                                                <button
                                                    type="button"
                                                    onClick={() => handleMakeManager(member.id)}
                                                    className="rounded-md bg-blue-600 px-2 py-1 text-xs text-white hover:bg-blue-700"
                                                >
                                                    Make Manager
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={() => handleRemoveMember(member.email)}
                                                    className="rounded-md bg-red-600 px-2 py-1 text-xs text-white hover:bg-red-700"
                                                >
                                                    Remove
                                                </button>
                                            </div>
                                        </td>
                                    )}
                                </tr>
                            ))}

                            {pendingInvites.map((email) => (
                                <tr key={`pending-${email}`} className={`border-t ${isLight ? 'border-gray-200' : 'border-gray-700'}`}>
                                    <td className="px-4 py-3 text-sm">Pending Invite</td>
                                    <td className="px-4 py-3 text-sm">{email}</td>
                                    <td className="px-4 py-3 text-sm">Invited</td>
                                    <td className="px-4 py-3 text-sm">Pending</td>
                                    {normalizedRole === 'manager' && (
                                        <td className="px-4 py-3 text-sm">
                                            <button
                                                type="button"
                                                onClick={() => handleRevokeInvite(email)}
                                                disabled={isRevoking === email}
                                                className="rounded-md bg-amber-600 px-2 py-1 text-xs text-white hover:bg-amber-700 disabled:opacity-60"
                                            >
                                                {isRevoking === email ? 'Revoking...' : 'Revoke Invite'}
                                            </button>
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
