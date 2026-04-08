import React, { use } from 'react';
import { AuthContext } from '../provider/AuthContext';
import { signOut } from 'firebase/auth';
import { auth } from '../firebase/firebase.init';
import { toast } from 'react-toastify';
import { Link } from 'react-router';

const getLogoutErrorMessage = (error) => {
    if (error?.code === 'auth/network-request-failed') {
        return 'Network issue while logging out. Please check your internet connection.';
    }

    return 'Could not log you out right now. Please try again.';
};


const Avatar = () => {
    const { user, isLight } = use(AuthContext);

    const handleLogOut = () => {
        signOut(auth).then(() => { toast.success('You have logged out successfully.'); }).catch((error) => { toast.error(getLogoutErrorMessage(error)); });
    }
    return (
        <div className="dropdown dropdown-end ">
            <div tabIndex={0} role="button" className="btn btn-ghost btn-circle avatar">
                <div className="w-10 rounded-full">
                    <img
                        alt="Avatar"
                        src={user?.photoURL || "https://w7.pngwing.com/pngs/129/292/png-transparent-female-avatar-girl-face-woman-user-flat-classy-users-icon.png"} />
                </div>
            </div>
            <ul
                tabIndex="-1"
                className={`menu menu-sm dropdown-content rounded-xl z-50 mt-3 w-52 p-2 border shadow-lg ${isLight ? 'bg-white border-gray-200 text-gray-900' : 'bg-gray-800 border-gray-700 text-gray-100'}`}>
                <li className='font-bold'><Link to={"/dashboard"}>Dashboard</Link></li>
                <li className='text-red-400 font-semibold' onClick={handleLogOut}><a>Logout</a></li>
            </ul>
        </div>
    );
};

export default Avatar;