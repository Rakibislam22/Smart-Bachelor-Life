import React from "react";
// eslint-disable-next-line no-unused-vars
import { motion } from "framer-motion";

const Loading = () => {
    return (
        <div className="
            flex justify-center items-center h-screen
            bg-base-100/70 backdrop-blur-sm
        ">
            <div className="flex flex-col items-center gap-3">
                <motion.div
                    initial={{ scale: 0.55, opacity: 0.95, filter: "blur(0px)" }}
                    animate={{
                        scale: [0.55, 0.85, 1.15],
                        opacity: [0.95, 0.55, 0],
                        filter: ["blur(0px)", "blur(0.2px)", "blur(1px)"],
                    }}
                    transition={{
                        duration: 1.35,
                        ease: "easeOut",
                        repeat: Infinity,
                        repeatDelay: 0.1,
                    }}
                    className="select-none"
                >
                    <div className="flex items-center text-3xl sm:text-4xl font-medium tracking-tight whitespace-nowrap font-unbounded text-foreground">
                        <span>S</span>
                        <span className="text-primary">B</span>
                        <span>L</span>
                    </div>
                </motion.div>

                <p className="text-base-content text-sm font-semibold opacity-75">
                    Loading...
                </p>
            </div>
        </div>
    );
};

export default Loading;