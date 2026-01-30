import React from "react";
// eslint-disable-next-line no-unused-vars
import { motion } from "framer-motion";



const Logo = () => {
	// Animation variants for the hidden text
	const expand = {
		hidden: {
			width: 0,
			opacity: 0,
			x: -10, // Starts slightly to the left for a slide effect
		},
		visible: {
			width: "auto",
			opacity: 1,
			x: 0,
			transition: {
				type: "spring",
				stiffness: 300,
				damping: 20,
				mass: 1.8,
			},
		},
	};

	return (
		<motion.a
			href="#"
			initial="hidden"
			whileHover="visible"
			// StaggerChildren makes "mart", "achelor", "ife" open one after another slightly
			// Remove 'viewport' if you want it to reset every time
			className="flex items-center text-2xl font-bold tracking-tight text-foreground cursor-pointer overflow-hidden whitespace-nowrap"
		>
			{/* Block 1: S -> Smart */}
			<div className="flex">
				<span>S</span>
				<motion.span
					variants={expand}
					className="overflow-hidden inline-block origin-left"
				>
					mart
				</motion.span>
			</div>

			{/* Block 2: B -> Bachelor (Highlighted) */}
			<div className="flex text-highlight hover:text-primary transition-colors duration-300">
				<span>B</span>
				<motion.span
					variants={expand}
					className="overflow-hidden inline-block origin-left"
				>
					achelor
				</motion.span>
			</div>

			{/* Block 3: L -> Life */}
			<div className="flex">
				<span>L</span>
				<motion.span
					variants={expand}
					className="overflow-hidden inline-block origin-left"
				>
					ife
				</motion.span>
			</div>
		</motion.a>
	);
};

export default Logo;
