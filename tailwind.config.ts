import type { Config } from "tailwindcss";

export default {
	darkMode: ["class"],
	content: [
	"./pages/**/*.{js,ts,jsx,tsx,mdx}",
	"./components/**/*.{js,ts,jsx,tsx,mdx}",
	"./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
	extend: {
		fontFamily: {
			giest: ['var(--font-geist)', 'sans-serif'],
			space_grotesk: ['var(--font-space-grotesk)', 'sans-serif'],
			cinzel: ['var(--font-cinzel)', 'serif'],
		},
		colors: {
			background: 'hsla(var(--background) / <alpha-value>)',
			foreground: 'hsla(var(--foreground) / <alpha-value>)',
			card: {
				DEFAULT: 'hsla(var(--card) / <alpha-value>)',
				foreground: 'hsla(var(--card-foreground) / <alpha-value>)'
			},
			popover: {
				DEFAULT: 'hsla(var(--popover) / <alpha-value>)',
				foreground: 'hsla(var(--popover-foreground) / <alpha-value>)'
			},
			primary: {
				DEFAULT: 'hsla(var(--primary) / <alpha-value>)',
				foreground: 'hsla(var(--primary-foreground) / <alpha-value>)'
			},
			secondary: {
				DEFAULT: 'hsla(var(--secondary) / <alpha-value>)',
				foreground: 'hsla(var(--secondary-foreground) / <alpha-value>)'
			},
			muted: {
				DEFAULT: 'hsla(var(--muted) / <alpha-value>)',
				foreground: 'hsla(var(--muted-foreground) / <alpha-value>)'
			},
			accent: {
				DEFAULT: 'hsla(var(--accent) / <alpha-value>)',
				foreground: 'hsla(var(--accent-foreground) / <alpha-value>)'
			},
			destructive: {
				DEFAULT: 'hsla(var(--destructive) / <alpha-value>)',
				foreground: 'hsla(var(--destructive-foreground) / <alpha-value>)'
			},
			border: 'hsla(var(--border) / <alpha-value>)',
			input: 'hsla(var(--input) / <alpha-value>)',
			ring: 'hsla(var(--ring) / <alpha-value>)',
			chart: {
				'1': 'hsla(var(--chart-1) / <alpha-value>)',
				'2': 'hsla(var(--chart-2) / <alpha-value>)',
				'3': 'hsla(var(--chart-3) / <alpha-value>)',
				'4': 'hsla(var(--chart-4) / <alpha-value>)',
				'5': 'hsla(var(--chart-5) / <alpha-value>)'
			}
		},
		borderRadius: {
			lg: 'var(--radius)',
			md: 'calc(var(--radius) - 2px)',
			sm: 'calc(var(--radius) - 4px)'
		}
	}
  },
  plugins: [require("tailwindcss-animate")],
} satisfies Config;
