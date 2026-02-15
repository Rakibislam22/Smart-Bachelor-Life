import React, { use } from 'react';
import { AuthContext } from '../provider/AuthContext';
import { signOut } from 'firebase/auth';
import { auth } from '../firebase/firebase.init';
import { toast } from 'react-toastify';
import { Link } from 'react-router';


const Avatar = () => {
    const { user } = use(AuthContext);

    const handleLogOut = () => {
        signOut(auth).then(() => { toast.success('Logout successful!'); }).catch(err => { toast.error(err) });
    }
    return (
        <div className="dropdown dropdown-end ">
            <div tabIndex={0} role="button" className="btn btn-ghost btn-circle avatar">
                <div className="w-10 rounded-full">
                    <img
                        alt="Avatar"
                        src={user?.photoURL || "https://w7.pngwing.com/pngs/129/292/png-transparent-female-avatar-girl-face-woman-user-flat-classy-users-icon.png"}  />
                </div>
            </div>
            <ul
                tabIndex="-1"
                className="menu menu-sm dropdown-content bg-base-100 rounded-box z-\[9999\] mt-3 w-52 p-2 shadow">
                <li className='font-bold'><Link to={"/my-profile"}>Profile</Link></li>
                <li className='font-bold'><Link to={"/dashboard"}>Dashboard</Link></li>
                <li className='text-red-400 font-semibold' onClick={handleLogOut}><a>Logout</a></li>
            </ul>
        </div>
    );
};

export default Avatar;