/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: ["class"],
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      colors: {
        "theme-blue": "#070E3D",
        icon: "#18181B",
        subtle: "#fafafa",
        border: "#e2e8f0",
        input: "#e2e8f0",
        ring: "#94a3b8",
        background: "#ffffff",
        foreground: "#0f172a",
        interactive: "#2563EB",
        primary: {
          DEFAULT: "#60a7d6",
          foreground: "#f8fafc",
          subtle: "#eff6ff",
          hover: "#1e3a8ae6",
        },
        gradient: {
          light: {
            start: "#E3DEFF",
            end: "#E8F3FF",
          },
          dark: {
            start: "#200F8A",
            end: "#4F9BED",
          },
        },
        sidebar: {
          active: "#e9e8fc33",
        },
        secondary: {
          DEFAULT: "#F4F4F5",
          foreground: "#0f172a",
          hover: "#e4e4e7",
          active: "#f4f4f5",
        },
        destructive: {
          DEFAULT: "#ff0000",
          foreground: "#f8fafc",
        },
        muted: {
          DEFAULT: "#f1f5f9",
          foreground: "#64748b",
        },
        accent: {
          DEFAULT: "#f1f5f9",
          foreground: "#0f172a",
        },
        popover: {
          DEFAULT: "#ffffff",
          foreground: "#0f172a",
        },
        card: {
          DEFAULT: "#ffffff",
          foreground: "#0f172a",
        },
        dark: {
          background: "#030711",
          foreground: "#e1e7ef",
          card: "#030711",
          cardForeground: "#e1e7ef",
          popover: "#030711",
          popoverForeground: "#94a3b8",
          primary: "#f8fafc",
          primaryForeground: "#020617",
          secondary: "#0f172a",
          secondaryForeground: "#f8fafc",
          muted: "#131627",
          mutedForeground: "#7f8ea3",
          accent: "#1e293b",
          accentForeground: "#f8fafc",
          destructive: "#7f1d1d",
          destructiveForeground: "#f8fafc",
          border: "#1e293b",
          input: "#1e293b",
          ring: "#1e293b",
        },
        text: {
          DEFAULT: "#09090b",
          muted: "#71717a",
          gray: {
            400: "#9ca3af",
            500: "#6b7280",
            600: "#4b5563",
            700: "#374151",
            900: "#1f2937",
          },
        },
        brand: {
          purple: {
            DEFAULT: "#c026d3",
            hover: "#bd05dd",
            light: "#fae8ff",
            dark: "#8a03d3",
            darkest: "#111a53",
            background: "#8a03d31a",
            gradient: {
              start: "#111a53",
              end: "#bd05dd",
            },
          },
          blue: {
            DEFAULT: "#1E3A8A",
            hover: "#235ad3",
            light: "#eff6ff",
            dark: "#172554",
            background: "#2563eb1a",
            gradient: {
              dark: "#111a53",
            },
          },
          green: {
            DEFAULT: "#047857",
            light: "#f0fdf4",
            background: "#0478571a",
          },
          amber: {
            DEFAULT: "#ca8a04",
            light: "#fef9c3",
            background: "#ca8a041a",
          },
          violet: {
            DEFAULT: "#7c3aed",
            light: "#f4f1fe",
            background: "#7c3aed1a",
          },
          red: {
            DEFAULT: "#dc2626",
            light: "#fef2f2",
            background: "#dc26261a",
          },
        },
        ui: {
          border: {
            DEFAULT: "#e2e8f0",
            muted: "#cbd5e1",
            subtle: "#e5e7eb",
          },
          icon: {
            DEFAULT: "#94a3b8",
            purple: "#6941c6",
            muted: "#a1a1aa",
            gray: "#9ca3af",
          },
          background: {
            purple: "#f4f1fe",
            gray: "#f9fafb",
            subtle: "#fcfcfc",
          },
          status: {
            success: {
              DEFAULT: "#027a48",
              light: "#ecfdf3",
            },
            warning: {
              DEFAULT: "#c11574",
              light: "#fdf2fa",
            },
          },
        },
        chart: {
          blue: "#2563eb",
          green: "#10b981",
          amber: "#f59e0b",
          indigo: "#6366f1",
          pink: "#ec4899",
          violet: "#8b5cf6",
          red: "#ef4444",
          teal: "#14b8a6",
        },
        logo: {
          purple: {
            DEFAULT: "#bd05dd",
            dark: "#8f03a0",
          },
          teal: "#6ef1bb",
        },
      },
      borderRadius: {
        lg: "0.5rem",
        md: "0.375rem",
        sm: "0.25rem",
      },
      margin: {
        4.5: "1.125rem",
      },
      keyframes: {
        "accordion-down": {
          from: { height: 0 },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: 0 },
        },
        "slide-in-right": {
          from: { transform: "translateX(100%)", opacity: 0 },
          to: { transform: "translateX(0)", opacity: 1 },
        },
        "slide-in-left": {
          from: { transform: "translateX(-100%)", opacity: 0 },
          to: { transform: "translateX(0)", opacity: 1 },
        },
        "slide-in-top": {
          from: { transform: "translateY(-100%)", opacity: 0 },
          to: { transform: "translateY(0)", opacity: 1 },
        },
        "slide-in-bottom": {
          from: { transform: "translateY(100%)", opacity: 0 },
          to: { transform: "translateY(0)", opacity: 1 },
        },
        "fade-out": {
          from: { opacity: 1 },
          to: { opacity: 0 },
        },
        "draw-line": {
          from: { strokeDashoffset: 1000 },
          to: { strokeDashoffset: 0 },
        },
        "fade-in-point": {
          from: { opacity: 0, transform: "scale(0)" },
          to: { opacity: 1, transform: "scale(1)" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        "slide-in-right": "slide-in-right 0.3s ease-out",
        "slide-in-left": "slide-in-left 0.3s ease-out",
        "slide-in-top": "slide-in-top 0.3s ease-out",
        "in-bottom": "slide-in-bottom 0.3s ease-out forwards",
        out: "fade-out 0.3s ease-in forwards",
        "draw-line": "draw-line 1.5s ease-in-out forwards",
        "fade-in-delayed": "fade-in-point 0.5s ease-out forwards var(--delay, 0.8s)",
      },
      backgroundImage: {
        "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
        "gradient-conic": "conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))",
        "gradient-brand": "linear-gradient(to right, #200F8A, #4F9BED)",
      },
      borderImage: {
        "gradient-blue": "linear-gradient(to right, #200F8A, #4F9BED)",
      },
      transitionProperty: {
        theme: "background-color, border-color, color",
      },
      transitionDuration: {
        400: "400ms",
        500: "500ms",
      },
      spacing: {
        4.5: "1.125rem", // 18px
        5.5: "1.375rem", // 22px
        13.5: "3.375rem", // 54px
        15: "3.75rem", // 60px
        22: "22rem", // 352px
        30: "7.5rem", // 120px
        32: "32rem", // 512px
        46: "11.5rem", // 184px
        60: "15rem", // 240px
        132: "33rem", // 530px
        142: "35.5rem", // 567px
        150: "37.5rem", // 600px
      },
      width: {
        13.5: "3.375rem", // 54px
        15: "3.75rem", // 60px
        22: "22rem", // 352px
        32: "32rem", // 512px
        46: "11.5rem", // 184px
        60: "15rem", // 240px
        132: "33rem", // 530px
        142: "35.5rem", // 567px
        150: "37.5rem", // 600px
      },
      height: {
        4.5: "1.125rem", // 18px
        13.5: "3.375rem", // 54px
      },
      minWidth: {
        46: "11.5rem", // 184px
      },
      minHeight: {
        30: "7.5rem", // 120px
      },
      translate: {
        5.5: "1.375rem", // 22px
      },
    },
  },
  plugins: [
    require("tailwindcss-animate"),
    require("@tailwindcss/typography"),
    ({ addBase }) => {
      addBase({
        ":root": {
          // Light mode
          "--background": "0 0% 100%", // #ffffff
          "--foreground": "222.2 47.4% 11.2%", // #0f172a
          "--card": "0 0% 100%", // #ffffff
          "--card-foreground": "222.2 47.4% 11.2%", // #0f172a
          "--popover": "0 0% 100%", // #ffffff
          "--popover-foreground": "222.2 47.4% 11.2%", // #0f172a
          "--primary": "222.2 47.4% 11.2%", // #0f172a
          "--primary-foreground": "210 40% 98%", // #f8fafc
          "--secondary": "210 40% 96.1%", // #f1f5f9
          "--secondary-foreground": "222.2 47.4% 11.2%", // #0f172a
          "--muted": "210 40% 96.1%", // #f1f5f9
          "--muted-foreground": "215.4 16.3% 46.9%", // #64748b
          "--accent": "210 40% 96.1%", // #f1f5f9
          "--accent-foreground": "222.2 47.4% 11.2%", // #0f172a
          "--destructive": "0 100% 50%", // #ff0000
          "--destructive-foreground": "210 40% 98%", // #f8fafc
          "--border": "214.3 31.8% 91.4%", // #e2e8f0
          "--input": "214.3 31.8% 91.4%", // #e2e8f0
          "--ring": "215 20.2% 65.1%", // #94a3b8
          "--radius": "0.5rem",
        },
        ".dark": {
          // Dark mode
          "--background": "224 71% 4%", // #030711
          "--foreground": "213 31% 91%", // #e1e7ef
          "--card": "224 71% 4%", // #030711
          "--card-foreground": "213 31% 91%", // #e1e7ef
          "--popover": "224 71% 4%", // #030711
          "--popover-foreground": "215 20.2% 65.1%", // #94a3b8
          "--primary": "210 40% 98%", // #f8fafc
          "--primary-foreground": "222.2 47.4% 1.2%", // #020617
          "--secondary": "222.2 47.4% 11.2%", // #0f172a
          "--secondary-foreground": "210 40% 98%", // #f8fafc
          "--muted": "223 47% 11%", // #131627
          "--muted-foreground": "215.4 16.3% 56.9%", // #7f8ea3
          "--accent": "216 34% 17%", // #1e293b
          "--accent-foreground": "210 40% 98%", // #f8fafc
          "--destructive": "0 63% 31%", // #7f1d1d
          "--destructive-foreground": "210 40% 98%", // #f8fafc
          "--border": "216 34% 17%", // #1e293b
          "--input": "216 34% 17%", // #1e293b
          "--ring": "216 34% 17%", // #1e293b
        },
      });
    },
    ({ addUtilities }) => {
      addUtilities({
        ".border-gradient-blue": {
          border: "1px solid transparent",
          backgroundImage:
            "linear-gradient(white, white), linear-gradient(to right, #200F8A, #4F9BED)",
          backgroundOrigin: "border-box",
          backgroundClip: "padding-box, border-box",
        },
        ".hide-scrollbar": {
          "scrollbar-width": "none",
          "-ms-overflow-style": "none",
        },
        ".hide-scrollbar::-webkit-scrollbar": {
          display: "none",
        },
        ".theme-base-transition": {
          transition: "background-color 0.5s ease, color 0.5s ease",
          transform: "translateZ(0)",
          "-webkit-font-smoothing": "antialiased",
          "-moz-osx-font-smoothing": "grayscale",
          "font-feature-settings": '"rlig", "calt"',
        },
        ".theme-ui-transition": {
          transition: "background-color 0.5s ease, border-color 0.5s ease, color 0.5s ease",
          transform: "translateZ(0)",
          "backface-visibility": "hidden",
        },
        ".theme-no-transition": {
          transition: "none !important",
        },
        ".theme-input-transition": {
          "transition-property": "background-color, border-color, box-shadow",
          "transition-duration": "0.5s",
          "transition-timing-function": "ease",
        },
        ".slide-in-from-right": {
          transform: "translateX(100%)",
        },
        ".slide-in-from-left": {
          transform: "translateX(-100%)",
        },
        ".slide-in-from-top": {
          transform: "translateY(-100%)",
        },
        ".slide-in-from-bottom": {
          transform: "translateY(100%)",
        },
        ".fade-in": {
          opacity: "0",
        },
        ".cursor-grabbing": {
          cursor: "grabbing",
        },
        ".cursor-grab": {
          cursor: "grab",
        },
        ".bg-brand-gradient": {
          background: "linear-gradient(to right, #200F8A, #4F9BED)",
        },
        ".text-brand-gradient": {
          background: "linear-gradient(to right, #200F8A, #4F9BED)",
          "-webkit-background-clip": "text",
          "background-clip": "text",
          "-webkit-text-fill-color": "transparent",
          color: "transparent",
        },
      });
    },
  ],
};
