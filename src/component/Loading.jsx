import React from "react";

const Loading = () => {
    return (
        <div className="
            flex justify-center items-center h-screen
            bg-base-100/70 backdrop-blur-sm
        ">
            <div className="flex flex-col items-center gap-3">

                {/* Spinner */}
                <div className="
                    w-12 h-12
                    border-4 border-primary
                    border-t-transparent
                    rounded-full animate-spin
                "></div>

                {/* Text */}
                <p className="text-base-content text-lg font-semibold opacity-80">
                    Loading, please wait...
                </p>
            </div>
        </div>
    );
};

export default Loading;