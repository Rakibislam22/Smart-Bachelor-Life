import React from 'react';
import { BsChatDotsFill } from 'react-icons/bs';

const GroupChatIcon = () => {
    return (
        <div>
            <div tabIndex={0} role="button" className="btn btn-ghost btn-circle">
                <div className="indicator">
                    <BsChatDotsFill className="h-6 w-6" />
                    <span className="badge badge-sm px-1 indicator-item bg-red-500 rounded-3xl text-white">9+</span>
                </div>
            </div>
        </div>
    );
};

export default GroupChatIcon;