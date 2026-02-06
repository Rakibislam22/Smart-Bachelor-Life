/** @type {import('tailwindcss').Config} */
export default {
	content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],

	plugins: [
		require("daisyui"), // ✅ components only
	],

	daisyui: {
		themes: false, // 🚫 disable DaisyUI themes
	},

	theme: {
		extend: {
			colors: {
				/* base */
				background: "var(--color-background)",
				foreground: "var(--color-foreground)",
				subtle: "var(--color-subtle)",

				/* surfaces */
				card: "var(--color-card)",
				surface: "var(--color-surface)",

				/* brand */
				primary: "var(--color-primary)",
				"primary-foreground": "var(--color-primary-foreground)",

				secondary: "var(--color-secondary)",
				"secondary-foreground": "var(--color-secondary-foreground)",

				/* ui */
				muted: "var(--color-muted)",
				"muted-foreground": "var(--color-muted-foreground)",

				border: "var(--color-border)",
				highlight: "var(--color-highlight)",
			},
			borderRadius: {
				DEFAULT: "var(--radius)",
			},
		},
	},
};
