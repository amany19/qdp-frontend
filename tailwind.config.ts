import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './screens/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './admin/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // QDP Brand Colors from Figma screens
        qdp: {
          cream: '#D9D1BE',      // Logo & brand color (Exact from Figma)
          'cream-dark': '#C9C1AE', // Hover state
          'cream-light': '#E6E6E6', // Sign up button background
        },
        primary: {
          50: '#F9FAFB',         // Page backgrounds
          100: '#F5F5F5',        // Card backgrounds
          500: '#000000',        // Primary buttons, text
          600: '#1A1A1A',        // Hover states
          900: '#111827',        // Dark text
        },
        success: {
          500: '#10B981',        // Green checkmarks (Popup-success-order.png)
          600: '#059669',        // Hover
        },
        warning: {
          500: '#F59E0B',        // Amber warnings (Popup-disable-the-contract.png)
          600: '#D97706',        // Hover
        },
        error: {
          500: '#EF4444',        // Red alerts (Home.png banner)
          600: '#DC2626',        // Hover
        },
        gray: {
          50: '#F9F9F9',         // Input backgrounds (Login.png, Signup.png)
          100: '#F5F5F5',        // Circle buttons (Home.png maintenance circles)
          200: '#E5E7EB',        // Borders (Add Adv-1.png)
          400: '#9CA3AF',        // Placeholders
          600: '#6B7280',        // Secondary text
          900: '#111827',        // Primary text
        },
      },
      fontFamily: {
        // Default font (Tajawal for Arabic app)
        sans: ['var(--font-tajawal)', 'Tajawal', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'sans-serif'],
        // Arabic (same as default)
        arabic: ['var(--font-tajawal)', 'Tajawal', 'sans-serif'],
      },
      borderRadius: {
        'qdp': '8px',
        'qdp-lg': '12px',
        'qdp-xl': '16px',
      },
      spacing: {
        // Custom spacing from Figma
        'qdp-xs': '4px',
        'qdp-sm': '8px',
        'qdp-md': '16px',
        'qdp-lg': '24px',
        'qdp-xl': '32px',
      },
      boxShadow: {
        'qdp': '0 2px 8px rgba(0, 0, 0, 0.1)',
        'qdp-lg': '0 4px 16px rgba(0, 0, 0, 0.1)',
      },
    },
  },
  plugins: [],
}

export default config
