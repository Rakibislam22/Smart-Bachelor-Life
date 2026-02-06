import React, { useState } from "react";
import Button from "../common/ButtonPrimary.jsx";
// eslint-disable-next-line no-unused-vars
import { motion } from "framer-motion";
import ThemeToggle from "../common/ThemeToggle.jsx";
import Logo from "../common/Logo.jsx";
import { Menu, X } from "lucide-react";
import { Link, NavLink } from "react-router";

const navLinks = [
	{ href: "/", lable: "Home" },
	{ href: "/benefits", lable: "Benefits" },
	{ href: "/about", lable: "About Us" },
	{ href: "/contact", lable: "Contact" },
];

const Navbar = () => {
	const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

	return (
		<div className="h-16">

			<header className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-md pt-3 font-urbanist">
				<nav className=" flex items-center justify-between mx-auto sm:block sm:px-10 lg:p-0 max-w-7xl ">
					<motion.div
						initial={{ opacity: 0, y: -10 }}
						animate={{ opacity: 1, y: 0 }}
						transition={{ duration: 1, ease: "easeIn" }}
					>
						<div className="flex justify-between text-center px-10 sm:px-0">
							<div className="flex justify-items-center">
								<Logo />
							</div>

							<div className="hidden sm:flex gap-2.5 justify-items-center ">
								<div className="flex gap-10 p-2.5 justify-items-center">
									{navLinks.map((link, index) => (

										<motion.span
											whileHover={{ scale: 1.05, y: -2 }}
											whileTap={{ scale: 0.9, y: 1 }}
											transition={{
												type: "spring",
												stiffness: 300,
												damping: 15,
											}}
											className="p-1 text-[15px] text-subtle items-center hover:text-highlight "
											key={index}
										>
											<NavLink to={link.href}>{link.lable}</NavLink>
										</motion.span>

									))}
								</div>
								<div className="flex gap-6.25">
									<ThemeToggle />
									<Link to="/auth/login"><Button>Get Started</Button></Link>
								</div>
							</div>
						</div>
					</motion.div>
					<motion.button
						initial={{ opacity: 0, y: -10 }}
						animate={{ opacity: 1, y: 0 }}
						transition={{ duration: 1, ease: "easeIn" }}
						className="pt-5 px-10 cursor-pointer md:hidden text-foreground"
						onClick={() => setIsMobileMenuOpen((prev) => !prev)}
					>
						{isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
					</motion.button>
				</nav>

				{isMobileMenuOpen && (
					<motion.div
						initial={{
							opacity: 0,
							y: 20,
							filter: "blur(10px)",
						}}
						animate={{
							opacity: 1,
							y: 0,
							filter: "blur(0px)",
						}}
						transition={{
							duration: 0.5,
							ease: "easeOut",
						}}
						className=" absolute top-full left-0 flex flex-col sm:hidden px-9 pb-5 w-full bg-background gap-2.5 justify-items-center rounded-2xl "
					>
						<div className="flex flex-col gap-10 p-2.5 justify-items-center">
							{navLinks.map((link, index) => (

								<motion.span
									whileHover={{ scale: 1.05, y: -2 }}
									whileTap={{ scale: 0.9, y: 1 }}
									transition={{
										type: "spring",
										stiffness: 200,
										damping: 15,
									}}
									className="p-1 text-[15px] text-subtle items-center hover:text-highlight "
									key={index}
								>
									<NavLink to={link.href}>{link.lable} </NavLink>
								</motion.span>

							))}
						</div>
						<div className="flex flex-col gap-6.25">
							<ThemeToggle />
							<Link to="/auth/login"><Button className="w-full">Get Started</Button></Link>
						</div>
					</motion.div>
				)}
			</header>

		</div>
	);
};

export default Navbar;
