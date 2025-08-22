/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./ui/**/*.{js,ts,jsx,tsx,html}",
    "./scripts/**/*.{js,ts}",
  ],
  theme: {
    extend: {
      // Shadcn/ui color palette with Figma design system
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
        // Keep Figma-specific colors for compatibility
        figma: {
          bg: '#ffffff',
          border: '#e5e5e5', 
          text: '#333333',
          textSecondary: '#666666',
          primary: '#0066cc',
          primaryHover: '#0052a3',
          success: '#18a0fb',
          successHover: '#0073e6',
          danger: '#e74c3c',
          dangerHover: '#c0392b',
          warning: '#f39c12',
          warningBg: '#fef9e7',
          errorBg: '#fdf2f2'
        }
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      fontSize: {
        'xs': '12px',
        'sm': '14px', 
        'base': '14px',
        'lg': '16px',
        'xl': '18px'
      },
      fontFamily: {
        'sans': ['Inter', 'sans-serif'],
      },
      spacing: {
        '1': '4px',
        '2': '8px', 
        '3': '12px',
        '4': '16px',
        '5': '20px',
        '6': '24px'
      }
    },
  },
  plugins: [require("tailwindcss-animate")],
}

