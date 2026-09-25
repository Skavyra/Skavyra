import type { Config } from "tailwindcss";
import animate from "tailwindcss-animate";

/**
 * Skavyra brand tokens, taken from the logo system board.
 * Gold 100 #F2C75C · Gold 300 #DDAA2F · Gold 500 #B98A24 · Gold 700 #8E6718
 * Ink #0D0D0D · Charcoal #1C1C1E · Ivory #F4EFE3
 * Syne 700 for the logo, headings and course titles. Manrope for everything else.
 */
const config: Config = {
  darkMode: ["class"],
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    container: {
      center: true,
      padding: { DEFAULT: "1.25rem", sm: "1.5rem", lg: "2.5rem" },
      screens: { "2xl": "1320px" },
    },
    screens: { sm: "640px", md: "768px", lg: "1024px", xl: "1280px", "2xl": "1440px" },
    extend: {
      colors: {
        gold: { 100: "#F2C75C", 300: "#DDAA2F", 500: "#B98A24", 700: "#8E6718" },
        ink: "#0D0D0D",
        charcoal: "#1C1C1E",
        ivory: "#F4EFE3",
        paper: "#FBF9F4",
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: { DEFAULT: "hsl(var(--primary))", foreground: "hsl(var(--primary-foreground))" },
        secondary: { DEFAULT: "hsl(var(--secondary))", foreground: "hsl(var(--secondary-foreground))" },
        destructive: { DEFAULT: "hsl(var(--destructive))", foreground: "hsl(var(--destructive-foreground))" },
        muted: { DEFAULT: "hsl(var(--muted))", foreground: "hsl(var(--muted-foreground))" },
        accent: { DEFAULT: "hsl(var(--accent))", foreground: "hsl(var(--accent-foreground))" },
        popover: { DEFAULT: "hsl(var(--popover))", foreground: "hsl(var(--popover-foreground))" },
        card: { DEFAULT: "hsl(var(--card))", foreground: "hsl(var(--card-foreground))" },
        success: "hsl(var(--success))",
        warning: "hsl(var(--warning))",
      },
      fontFamily: {
        display: ["var(--font-syne)", "system-ui", "sans-serif"],
        sans: ["var(--font-manrope)", "system-ui", "sans-serif"],
      },
      fontSize: {
        // fluid scale: grows with the viewport between 360px and 1440px
        "fluid-xs": ["clamp(0.75rem, 0.72rem + 0.15vw, 0.8125rem)", { lineHeight: "1.5" }],
        "fluid-sm": ["clamp(0.8125rem, 0.78rem + 0.17vw, 0.9375rem)", { lineHeight: "1.55" }],
        "fluid-base": ["clamp(0.9375rem, 0.9rem + 0.2vw, 1.0625rem)", { lineHeight: "1.6" }],
        "fluid-lg": ["clamp(1.0625rem, 1rem + 0.3vw, 1.25rem)", { lineHeight: "1.4" }],
        "fluid-xl": ["clamp(1.25rem, 1.13rem + 0.55vw, 1.625rem)", { lineHeight: "1.3" }],
        "fluid-2xl": ["clamp(1.5rem, 1.3rem + 0.9vw, 2.125rem)", { lineHeight: "1.2" }],
        "fluid-3xl": ["clamp(1.875rem, 1.5rem + 1.6vw, 3rem)", { lineHeight: "1.1" }],
        "fluid-hero": ["clamp(2.25rem, 1.4rem + 4.2vw, 5rem)", { lineHeight: "1.02" }],
      },
      spacing: {
        "fluid-sm": "clamp(1.5rem, 1.1rem + 1.8vw, 2.5rem)",
        "fluid-md": "clamp(3rem, 2.2rem + 3.5vw, 5.5rem)",
        "fluid-lg": "clamp(4rem, 2.8rem + 5vw, 7.5rem)",
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      keyframes: {
        "accordion-down": { from: { height: "0" }, to: { height: "var(--radix-accordion-content-height)" } },
        "accordion-up": { from: { height: "var(--radix-accordion-content-height)" }, to: { height: "0" } },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
      },
    },
  },
  plugins: [animate],
};

export default config;
