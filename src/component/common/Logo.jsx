import React from "react";
// eslint-disable-next-line no-unused-vars
import { motion } from "framer-motion";
import { Link } from "react-router";



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
		<>
			<Link to="/">

				<motion.span
					initial="hidden"
					whileHover="visible"
					// StaggerChildren makes "mart", "achelor", "ife" open one after another slightly
					// Remove 'viewport' if you want it to reset every time
					className="flex items-center overflow-hidden text-2xl font-medium tracking-tight cursor-pointer text-foreground whitespace-nowrap font-unbounded"
				>
					{/* Block 1: S -> Smart */}
					<div className="flex">
						<span>S</span>
						<motion.span
							variants={expand}
							className="inline-block overflow-hidden origin-left"
						>
							mart
						</motion.span>
					</div>

					{/* Block 2: B -> Bachelor (Highlighted) */}
					<div className="flex transition-colors duration-300 text-primary hover:text-highlight">
						<span>B</span>
						<motion.span
							variants={expand}
							className="inline-block overflow-hidden origin-left"
						>
							achelor
						</motion.span>
					</div>

					{/* Block 3: L -> Life */}
					<div className="flex">
						<span>L</span>
						<motion.span
							variants={expand}
							className="inline-block overflow-hidden origin-left"
						>
							ife
						</motion.span>
					</div>
				</motion.span>

			</Link>

		</>
	);
};

export default Logo;
