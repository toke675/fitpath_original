/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        // Tokens taken from Figma "Material Dashboard Shadcn" (stone palette, Geist).
        // Values live in CSS variables in src/index.css.
        ink: "rgb(var(--c-ink) / <alpha-value>)",                 // page background
        charcoal: "rgb(var(--c-charcoal) / <alpha-value>)",       // nav bars
        panel: "rgb(var(--c-panel) / <alpha-value>)",
        surface: "rgb(var(--c-surface) / <alpha-value>)",         // cards
        surfaceHover: "rgb(var(--c-surfaceHover) / <alpha-value>)",
        surfaceRaised: "rgb(var(--c-surfaceRaised) / <alpha-value>)",
        line: "rgb(var(--c-line) / <alpha-value>)",               // borders
        lineBright: "rgb(var(--c-lineBright) / <alpha-value>)",
        mist: "rgb(var(--c-mist) / <alpha-value>)",               // secondary text
        mistLight: "rgb(var(--c-mistLight) / <alpha-value>)",
        bone: "rgb(var(--c-bone) / <alpha-value>)",               // primary text
        accent: "rgb(var(--c-accent) / <alpha-value>)",
        accentHover: "rgb(var(--c-accentHover) / <alpha-value>)",
        accentDim: "rgb(var(--c-accentDim) / <alpha-value>)",
        accentGlow: "rgba(21, 128, 61, 0.14)",
        cyanAccent: "rgb(var(--c-cyan) / <alpha-value>)",
        amberAccent: "rgb(var(--c-amber) / <alpha-value>)",
        roseAccent: "rgb(var(--c-rose) / <alpha-value>)",
        violetAccent: "rgb(var(--c-violet) / <alpha-value>)",
        // Tailwind palette steps used across pages, re-pointed so they stay readable on light cards
        amber: {
          300: "rgb(var(--c-amber300) / <alpha-value>)",
          400: "rgb(var(--c-amber400) / <alpha-value>)",
          500: "#D97706",
        },
        rose: {
          300: "rgb(var(--c-rose300) / <alpha-value>)",
          400: "rgb(var(--c-rose400) / <alpha-value>)",
          500: "#E11D48",
        },
        cyan: { 500: "#0891B2" },
      },
      fontFamily: {
        display: ["'Geist'", "'Inter'", "-apple-system", "sans-serif"],
        sans: ["'Geist'", "'Inter'", "-apple-system", "BlinkMacSystemFont", "'Segoe UI'", "sans-serif"],
        mono: ["'Geist Mono'", "'JetBrains Mono'", "monospace"],
      },
      borderRadius: {
        lg: "0.5rem",     // 8px  (Figma rounded-lg: buttons, cards)
        xl: "0.75rem",
        "2xl": "1rem",    // 16px (Figma main panel)
      },
      boxShadow: {
        // Figma uses borders + very light shadows
        glow: "0 1px 2px rgba(28, 25, 23, 0.06)",
        "glow-sm": "0 1px 2px rgba(28, 25, 23, 0.05)",
        "glow-lg": "0 4px 12px -2px rgba(28, 25, 23, 0.12)",
        "glow-cyan": "0 1px 2px rgba(28, 25, 23, 0.05)",
        "glow-amber": "0 1px 2px rgba(28, 25, 23, 0.05)",
        card: "0 1px 2px rgba(28, 25, 23, 0.04)",
        "card-hover": "0 4px 12px -2px rgba(28, 25, 23, 0.10)",
        "3d": "inset 0 2px 0 rgba(255,255,255,0.35), inset 0 1px 0 rgba(255,255,255,0.25), 0 1px 2px rgba(0,0,0,0.05)",
      },
      backgroundImage: {
        "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
      },
      animation: {
        "pulse-slow": "pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite",
        float: "float 4s ease-in-out infinite",
        shimmer: "shimmer 2.5s linear infinite",
      },
      keyframes: {
        float: {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-4px)" },
        },
        shimmer: {
          "0%": { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" },
        },
      },
    },
  },
  plugins: [],
};
