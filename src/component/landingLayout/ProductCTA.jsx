import React, { useEffect, useState } from "react";
// eslint-disable-next-line no-unused-vars
import { motion } from "framer-motion";
import ButtonPrimary from "../common/ButtonPrimary";

import lightPreview from "../../assets/images/product_light.png";
import darkPreview from "../../assets/images/product_dark.png";
import ButtonSecondary from "../common/ButtonSecondary";
import { Link } from "react-router";


export default function ProductCTA() {
	const [isDark, setIsDark] = useState(true);

	useEffect(() => {
		const updateTheme = () => {
			const html = document.documentElement;

			// if html has "light" → light mode
			// otherwise → dark mode
			setIsDark(!html.classList.contains("light"));
		};

		updateTheme();

		// watch when theme toggles
		const observer = new MutationObserver(updateTheme);
		observer.observe(document.documentElement, {
			attributes: true,
			attributeFilter: ["class"],
		});

		return () => observer.disconnect();
	}, []);

	return (
		<section className="relative w-full flex flex-col items-center justify-center min-h-svh py-24 md:py-32 px-5 md:px-8 overflow-hidden bg-background">
			{/* ================= PHONE MOCKUP ================= */}
			<div className="relative flex justify-center items-center top-10 sm:top-20">
				{/* soft floor shadow */}
				<div className="absolute top-100 left-1 w-[320px] h-22.5 bg-card blur-[60px] " />

				{/* floating tilted phone */}
				<motion.div
					initial={{ opacity: 0, y: 120, rotate: -16, scale: 0.8 }}
					whileInView={{ opacity: 1, y: 0, rotate: -5, scale: 1 }}
					viewport={{ once: true }}
					transition={{ duration: 0.9, ease: "easeOut" }}
					className="relative"
					style={{
						transformStyle: "preserve-3d",
					}}
				>
					<motion.img
						key={isDark ? "dark" : "light"}
						src={isDark ? darkPreview : lightPreview}
						alt="SmartBachelorLife App"
						initial={{ opacity: 0, x: 40 }}
						animate={{ opacity: 1, x: 0 }}
						exit={{ opacity: 0, x: -40 }}
						transition={{ duration: 0.45, ease: "easeInOut" }}
						className="w-67.5sm:w-[340px] md:w-95 lg:w-110 drop-shadow-[0_50px_70px_rgba(0,0,0,0.35)]"
					/>
				</motion.div>
			</div>

			{/* ================= TEXT ================= */}
			<div className="relative text-center flex flex-col items-center gap-6 max-w-7xl">
				<h2
					className="text-3xl sm:text-4xl lg:text-[48px] leading-tight sm:leading-[1.2] font-urbanist text-foreground max-w-80 sm:max-w-210 font-medium tracking-tight">
					Ready to Take <span className="text-primary">Control</span>{" "}
					of Your Mess Life?
				</h2>

				<p
					className="text-subtle leading-relaxed max-w-78 sm:max-w-2xl text-sm sm:text-[15px] font-light font-unbounded"
				>
					Join your roommates in managing meals, expenses, and monthly
					bills the smart way. No confusion, no manual calculation,
					and no money arguments.
				</p>

				{/* buttons */}
				<div className="flex flex-col sm:flex-row items-center justify-center gap-6 pt-10 w-80 sm:w-full">
					<Link to="/auth/login" className="w-full sm:w-auto cour">
						<ButtonPrimary className="w-full sm:w-auto px-8 py-3">
							Get Started
						</ButtonPrimary>
					</Link>

					<ButtonSecondary className="w-full sm:w-auto px-8 py-3">
						Watch Demo
					</ButtonSecondary>
				</div>

				{/* brand */}
				<div className="tracking-wide font-unbounded font-medium pt-20 text-muted-foreground text-2xl md:text-5xl">
					SmartBachelorLife
				</div>
			</div>
		</section>
	);
}
