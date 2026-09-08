/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        brand: {
          50: "#F0F9FF",
          100: "#E0F2FE",
          200: "#BAE6FD",
          300: "#7DD3FC",
          400: "#38BDF8",
          500: "#0EA5E9",
          600: "#2563EB",
          700: "#1D4ED8",
          800: "#1E40AF",
          900: "#1E3A8A",
          950: "#172554",
        },
        purple: {
          50: "#FAF5FF",
          100: "#F3E8FF",
          200: "#E9D5FF",
          300: "#D8B4FE",
          400: "#C084FC",
          500: "#8B5CF6",
          600: "#7C3AED",
          700: "#6D28D9",
          800: "#5B21B6",
          900: "#4C1D95",
          950: "#2E1065",
          neon: "#7C3AED",
          electric: "#8B5CF6",
        },
        iris: {
          50: "#EEF2FF",
          100: "#E0E7FF",
          200: "#C7D2FE",
          300: "#A5B4FC",
          400: "#818CF8",
          500: "#6366F1",
          600: "#4F46E5",
          700: "#4338CA",
          800: "#3730A3",
          900: "#312E81",
        },
        navy: {
          DEFAULT: "#0F172A", // Deep Slate Charcoal (Google / Linear / Notion style)
          dark: "#020617",
          light: "#1E293B",
          muted: "#334155",
          card: "#FFFFFF",
          border: "#E2E8F0",
        },
        slate: {
          text: "#334155",
          muted: "#64748B",
          subtle: "#94A3B8",
        },
        gold: {
          DEFAULT: "#D97706",
          light: "#FEF3C7",
          dark: "#B45309",
          amber: "#F59E0B",
          warm: "#FBBF24",
        },
        surface: {
          DEFAULT: "#EFF6FF", // Premium soft light-blue page background
          muted: "#DBEAFE",
          subtle: "#BFDBFE",
        },
        card: "#FFFFFF",
        line: {
          DEFAULT: "#E2E8F0", // Hairline 1px neutral border
          subtle: "#F1F5F9",
          dark: "#CBD5E1",
        },
        risk: {
          low: "#10B981",
          medium: "#F59E0B",
          high: "#EF4444",
          critical: "#DC2626",
        },
      },
      fontFamily: {
        display: ["'Plus Jakarta Sans'", "'Inter'", "-apple-system", "BlinkMacSystemFont", "sans-serif"],
        body: ["'Plus Jakarta Sans'", "'Inter'", "-apple-system", "BlinkMacSystemFont", "sans-serif"],
        mono: ["'JetBrains Mono'", "'SF Mono'", "monospace"],
      },
      boxShadow: {
        xs: "0 1px 2px 0 rgba(15, 23, 42, 0.04)",
        sm: "0 1px 3px 0 rgba(15, 23, 42, 0.05), 0 1px 2px -1px rgba(15, 23, 42, 0.03)",
        card: "0 1px 2px 0 rgba(15, 23, 42, 0.03)",
        cardHover: "0 4px 12px -2px rgba(15, 23, 42, 0.06), 0 2px 4px -2px rgba(15, 23, 42, 0.03)",
        panel: "0 4px 20px -4px rgba(15, 23, 42, 0.06)",
        dropdown: "0 10px 25px -4px rgba(15, 23, 42, 0.08), 0 4px 10px -4px rgba(15, 23, 42, 0.04)",
        glowPurple: "0 2px 8px 0 rgba(124, 58, 237, 0.12)",
        glowIris: "0 2px 8px 0 rgba(99, 102, 241, 0.10)",
        glowNeon: "0 2px 8px 0 rgba(124, 58, 237, 0.12)",
      },
      borderRadius: {
        xl2: "1rem",
        xl3: "1.25rem",
      },
      animation: {
        'pulse-subtle': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'float': 'float 4s ease-in-out infinite',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-4px)' },
        },
      },
    },
  },
  plugins: [],
};
