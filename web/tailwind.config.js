/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: ["class"],
  content: [
    './pages/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './app/**/*.{ts,tsx}',
    './src/**/*.{ts,tsx}',
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
        
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        success: {
          DEFAULT: "hsl(var(--success))",
          foreground: "hsl(var(--success-foreground))",
          soft: "hsl(var(--success-soft))",
          "soft-foreground": "hsl(var(--success-soft-foreground))",
        },
        warning: {
          DEFAULT: "hsl(var(--warning))",
          foreground: "hsl(var(--warning-foreground))",
          soft: "hsl(var(--warning-soft))",
          "soft-foreground": "hsl(var(--warning-soft-foreground))",
        },
        danger: {
          DEFAULT: "hsl(var(--danger))",
          foreground: "hsl(var(--danger-foreground))",
          soft: "hsl(var(--danger-soft))",
          "soft-foreground": "hsl(var(--danger-soft-foreground))",
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      /* ── Elevation system ──
         Tier 1: resting surfaces (cards, inputs, small avatars)
         Tier 2: raised/hover (card hover, large avatars, buttons)
         Tier 3: floating (dropdowns, popovers, tooltips, autocompletes)
         Tier 4: modal (dialogs, takeovers, video control panels) */
      boxShadow: {
        'elevation-1': '0 1px 3px rgba(0,0,0,0.06), 0 1px 2px rgba(0,0,0,0.04)',
        'elevation-2': '0 4px 16px rgba(0,0,0,0.06), 0 1px 3px rgba(0,0,0,0.04)',
        'elevation-3': '0 16px 48px rgba(0,0,0,0.12), 0 4px 12px rgba(0,0,0,0.06)',
        'elevation-4': '0 32px 64px rgba(0,0,0,0.18), 0 8px 24px rgba(0,0,0,0.10)',
        'inset-pressed': 'inset 0 2px 4px rgba(0,0,0,0.10)',
        'inset-outline': 'inset 0 0 0 1px rgba(0,0,0,0.06)',
        'pill-active': '0 1px 3px rgba(0,0,0,0.30), inset 0 1px 0 rgba(255,255,255,0.12)',
        'pill-active-dark': '0 1px 3px rgba(0,0,0,0.50), inset 0 1px 0 rgba(255,255,255,0.80)',
        'glow-success': '0 0 12px rgba(16,185,129,0.40)',
        'glow-warning': '0 0 12px rgba(245,158,11,0.40)',
        'glow-info': '0 2px 8px rgba(49,46,129,0.40)',
        'glow-danger': '0 2px 8px rgba(244,63,94,0.25)',
      },
      /* ── Page-level spacing tokens ── */
      spacing: {
        'page-x-mobile': '1rem',       /* 16px — px-4 */
        'page-x-tablet': '1.5rem',     /* 24px — px-6 */
        'page-x-desktop': '2rem',      /* 32px — px-8 */
        'page-top': '2rem',            /* 32px — mt-8 */
        'section-gap': '2rem',         /* 32px — gap between page sections */
        'card-padding': '1.25rem',     /* 20px — p-5 */
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
        "shimmer": {
          "0%": { transform: "translateX(-100%)" },
          "100%": { transform: "translateX(100%)" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        "shimmer": "shimmer 2s infinite",
      },
    },
  },
  plugins: [
    require("tailwindcss-animate"),
    require("@tailwindcss/aspect-ratio"),
  ],
}