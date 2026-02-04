import { Link, NavLink } from "react-router";
import { motion } from "framer-motion";
import Logo from "../common/Logo.jsx";

const footerLinks = [
    { href: "/", label: "Home" },
    { href: "/about", label: "About Us" },
    { href: "/benefits", label: "Benefits" },
    { href: "/contact", label: "Contact" },
];

export default function Footer() {
    return (
        <footer className="border-t border-border bg-background">
            <div className="mx-auto max-w-7xl px-6 py-10">

                {/* Top Row */}
                <div className="flex flex-col gap-8 md:flex-row md:items-center md:justify-between">

                    {/* Logo (same as Navbar) */}
                    <div className="flex items-center">
                        <Logo />
                    </div>

                    {/* Navigation */}
                    <nav className="flex flex-wrap justify-center gap-6 text-sm">
                        {footerLinks.map((link, index) => (

                            <motion.span
                                whileHover={{ scale: 1.05, y: -2 }}
                                whileTap={{ scale: 0.95, y: 1 }}
                                transition={{
                                    type: "spring",
                                    stiffness: 300,
                                    damping: 15,
                                }}
                                key={index}
                                className="p-1 text-subtle hover:text-highlight transition-colors"
                            >
                                <NavLink to={link.href}> {link.label}</NavLink>
                            </motion.span>

                        ))}
                    </nav>

                    {/* Social Links */}
                    <div className="flex justify-center gap-6 text-sm">
                        {["LinkedIn", "Instagram", "X"].map((item) => (
                            <motion.a
                                key={item}
                                href="#"
                                target="_blank"
                                whileHover={{ scale: 1.05, y: -2 }}
                                whileTap={{ scale: 0.95, y: 1 }}
                                transition={{
                                    type: "spring",
                                    stiffness: 300,
                                    damping: 15,
                                }}
                                className="text-subtle hover:text-highlight transition-colors"
                            >
                                {item}
                            </motion.a>
                        ))}
                    </div>
                </div>

                {/* Bottom Row */}
                <div className="mt-10 flex flex-col gap-4 border-t border-border pt-6 text-sm text-subtle md:flex-row md:items-center md:justify-between">
                    <p>© {new Date().getFullYear()} SBL. All rights reserved</p>

                    <div className="flex gap-6">
                        <motion.a
                            whileHover={{ y: -1 }}
                            className="hover:text-highlight transition"
                            href="#"
                        >
                            Privacy Policy
                        </motion.a>
                        <motion.a
                            whileHover={{ y: -1 }}
                            className="hover:text-highlight transition"
                            href="#"
                        >
                            Terms of Service
                        </motion.a>
                    </div>
                </div>
            </div>
        </footer>
    );
}
