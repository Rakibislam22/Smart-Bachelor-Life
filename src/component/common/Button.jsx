import React from "react";
// eslint-disable-next-line no-unused-vars
import { motion } from "framer-motion";

const Button = ({ className = "", size = "default", children, ...props }) => {
	const baseClasses =
		"w-[144px] h-[50px] relative overflow-hidden rounded-lg font-medium bg-primary text-primary-foreground hover:bg-highlight hover:text-secondary-foreground   hover:border-primary hover:border-1  shadow-lg shadow-highlight/25";

	const sizeClasses = {
		sm: "px-4 py-2 text-sm",
		default: "px-6 py-3 text-base",
		lg: "px-8 py-4 text-lg",
	};

	const classes = `${baseClasses} ${sizeClasses[size]} ${className}`;

	return (
		<motion.button
			whileHover={{ scale: 1.05, y: -2 }}
			whileTap={{ scale: 0.9, y: 1 }}
			transition={{ type: "spring", stiffness: 300, damping: 15 }}
			className={classes}
			{...props}
		>
			<span className="relative flex items-center justify-center gap-2 ">
				{children}
			</span>
		</motion.button>
	);
};

export default Button;
