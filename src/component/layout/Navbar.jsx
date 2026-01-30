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
	{ href: "#", lable: "About Us" },
	{ href: "#", lable: "Contact" },
];

const Navbar = () => {
	return (
		<header className="fixed top-0 left-0 right-0 bg-transparent py-5">
			<nav className="container mx-auto px-6 items-center">
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
								<Logo/>
							</a>
						</div>

						<div className="flex gap-2.5 justify-items-center ">
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
								<ThemeToggle/>
								<Button size="sm">Get Started</Button>
							</div>
						</div>
					</div>
				</motion.div>
			</nav>
		</header>
	);
};

export default Navbar;
