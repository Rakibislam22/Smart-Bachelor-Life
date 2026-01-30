<<<<<<< HEAD
import React, { useState } from "react";
import Button from "../common/Button.jsx";
// eslint-disable-next-line no-unused-vars
import { motion } from "framer-motion";
import "../../index.css";
import ThemeToggle from "../common/ThemeToggle.jsx";
import Logo from "../common/Logo.jsx";
import { Menu, X } from "lucide-react";

const navLinks = [
	{ href: "#", lable: "Home" },
	{ href: "#", lable: "Benefits" },
=======
import React from "react";
import Button from "../common/Button.jsx";
// eslint-disable-next-line no-unused-vars
import { motion } from "framer-motion";
import '../../index.css'
import ThemeToggle from "../common/ThemeToggle.jsx";
import Logo from "../common/Logo.jsx";


const navLinks = [
	{ href: "#", lable: "Home" },
	{ href: "#", lable: "Banefits" },
>>>>>>> 73e530e (make navbar)
	{ href: "#", lable: "About Us" },
	{ href: "#", lable: "Contact" },
];

const Navbar = () => {
<<<<<<< HEAD
	const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

	return (
		<header className="fixed top-0 left-0 right-0 bg-transparent py-5">
			<nav className="flex sm:block container mx-auto px-6 justify-between items-center">
=======
	return (
		<header className="fixed top-0 left-0 right-0 bg-transparent py-5">
			<nav className="container mx-auto px-6 items-center">
>>>>>>> 73e530e (make navbar)
				<motion.div
					initial={{ opacity: 0, y: -10 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ duration: 1, ease: "easeIn" }}
				>
					<div className="flex justify-between p-5 text-center ">
						<div className="flex justify-items-center">
							<a
								href="#"
								className="text-xl font-bold tracking-tight text-center py-3 "
							>
<<<<<<< HEAD
								<Logo />
							</a>
						</div>

						<div className="hidden sm:flex gap-2.5 justify-items-center ">
=======
								<Logo/>
							</a>
						</div>

						<div className="flex gap-2.5 justify-items-center ">
>>>>>>> 73e530e (make navbar)
							<div className="flex gap-10 p-2.5 justify-items-center">
								{navLinks.map((link, index) => (
									<motion.a
										whileHover={{ scale: 1.05, y: -2 }}
										whileTap={{ scale: 0.9, y: 1 }}
										transition={{
											type: "spring",
											stiffness: 300,
											damping: 15,
										}}
										className="p-1 text-[15px] text-subtle items-center hover:text-highlight "
										href={link.href}
										key={index}
									>
										{link.lable}
									</motion.a>
								))}
							</div>
							<div className="flex gap-6.25">
<<<<<<< HEAD
								<ThemeToggle />
=======
								<ThemeToggle/>
>>>>>>> 73e530e (make navbar)
								<Button size="sm">Get Started</Button>
							</div>
						</div>
					</div>
				</motion.div>
<<<<<<< HEAD
				<motion.button
					initial={{ opacity: 0, y: -10 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ duration: 1, ease: "easeIn" }}
					className="md:hidden p-2 text-foreground cursor-pointer"
					onClick={() => setIsMobileMenuOpen((prev) => !prev)}
				>
					{isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
				</motion.button>
			</nav>

			{isMobileMenuOpen && (
				<div className="flex flex-col sm:hidden px-9 pb-5 w-full bg-background gap-2.5 justify-items-center rounded-2xl ">
					<div className="flex flex-col gap-10 p-2.5 justify-items-center">
						{navLinks.map((link, index) => (
							<motion.a
								whileHover={{ scale: 1.05, y: -2 }}
								whileTap={{ scale: 0.9, y: 1 }}
								transition={{
									type: "spring",
									stiffness: 200,
									damping: 15,
								}}
								className="p-1 text-[15px] text-subtle items-center hover:text-highlight "
								href={link.href}
								key={index}
							>
								{link.lable}
							</motion.a>
						))}
					</div>
					<div className="flex flex-col gap-6.25">
						<ThemeToggle />
						<Button className="w-full">Get Started</Button>
					</div>
				</div>
			)}
=======
			</nav>
>>>>>>> 73e530e (make navbar)
		</header>
	);
};

export default Navbar;
