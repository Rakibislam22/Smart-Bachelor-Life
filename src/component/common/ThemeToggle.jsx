import { use } from "react";
// eslint-disable-next-line no-unused-vars
import { motion } from "framer-motion";
import dark from "../../assets/icons/switch_mode_dark.png";
import light from "../../assets/icons/switch_mode_light.png";
import { AuthContext } from "../../provider/AuthContext";



export default function ThemeToggle() {
	const { isLight, setIsLight } = use(AuthContext);


	const toggleTheme = () => {
		setIsLight((prev) => !prev);
	};

	return (
		<motion.button
            whileHover={{ scale: 1.05, y: -2 }}
			whileTap={{ scale: 0.9, y: 1 }}
			transition={{ type: "spring", stiffness: 300, damping: 15 }}
			onClick={toggleTheme}
			className="flex items-cente  gap-2 px-4 py-2 text-sm font-medium transition-colors  text-secondary-foreground hover:opacity-90"
			aria-label="Toggle theme"
		>
			{isLight ? (
				<>
					<img className="w-9 h-9 p-1.5 border-2 backdrop-blur-[10px] border-primary/15 bg-highlight/90 rounded-md " src={light} alt="" />
				</>
			) : (
				<>
					<img className="w-9 h-9 p-1.5 border-2 backdrop-blur-[10px] border-primary/15 bg-highlight/10 rounded-md " src={dark} alt="" />
				</>
			)}
		</motion.button>
	);
}
