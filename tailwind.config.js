/** @type {import('tailwindcss').Config} */
export default {
  darkMode: "class",
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        /* Brand Colors */
        primary: {
          50: "rgb(var(--accent-primary) / 0.1)",
          500: "rgb(var(--accent-primary))",
          600: "rgb(var(--accent-hover))",
        },

        /* Semantic Background Colors */
        "app-bg": "rgb(var(--bg-primary))",
        "app-surface": "rgb(var(--surface-primary))",
        "app-surface-secondary": "rgb(var(--surface-hover))",
        
        /* Semantic Text Colors */
        "app-text": "rgb(var(--text-primary))",
        "app-text-secondary": "rgb(var(--text-secondary))",
        "app-text-tertiary": "rgb(var(--text-tertiary))",

        /* Semantic Border Colors */
        "app-border": "rgb(var(--border-primary))",
        "app-border-secondary": "rgb(var(--border-secondary))",
      },
      backgroundColor: {
        primary: "rgb(var(--bg-primary))",
        secondary: "rgb(var(--bg-secondary))",
        surface: "rgb(var(--surface-primary))",
      },
      textColor: {
        primary: "rgb(var(--text-primary))",
        secondary: "rgb(var(--text-secondary))",
      },
      borderColor: {
        primary: "rgb(var(--border-primary))",
        secondary: "rgb(var(--border-secondary))",
      },
    },
  },
  plugins: [],
};
