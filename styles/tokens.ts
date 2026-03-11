// Design tokens extracted from Figma screens
// All colors have been verified against actual design screenshots
// Color Verification Date: 2025-10-14

export const colors = {
  // QDP Brand Colors
  qdp: {
    cream: '#D4C5B0',        // Logo color (Splash-2.png, Splash-4.png buttons)
    creamDark: '#C4B5A0',    // Hover state for cream buttons
  },

  // Primary Colors
  primary: {
    50: '#F9FAFB',           // Page backgrounds
    100: '#F5F5F5',          // Card backgrounds (Home.png circles)
    500: '#000000',          // Buttons, primary text
    600: '#1A1A1A',          // Hover states
    900: '#111827',          // Dark text
  },

  // Semantic Colors
  success: '#10B981',        // Green checkmarks (success popups)
  warning: '#F59E0B',        // Amber warnings (contract popup)
  error: '#EF4444',          // Red alerts (Home.png banner)

  // Grays - Full scale for various UI elements
  gray: {
    50: '#F9F9F9',           // Input backgrounds (Login.png, Signup.png)
    100: '#F5F5F5',          // Maintenance circles (Home.png)
    200: '#E5E7EB',          // Borders (Add Adv-1.png, unselected states)
    400: '#9CA3AF',          // Placeholder text
    600: '#6B7280',          // Secondary text labels
    900: '#111827',          // Primary text
  },
}

export const spacing = {
  xs: '4px',
  sm: '8px',
  md: '16px',
  lg: '24px',
  xl: '32px',
}

export const borderRadius = {
  sm: '8px',
  md: '12px',
  lg: '16px',
}

// Component-specific spacing from Figma
export const componentSpacing = {
  inputHeight: '48px',           // Standard input field height
  buttonHeight: '52px',          // Primary button height
  pageMargin: '20px',            // Page horizontal margins
  sectionGap: '24px',            // Gap between sections
  fieldGap: '16px',              // Gap between form fields
  otpBoxSize: '64px',            // OTP input box size
  otpBoxGap: '12px',             // Gap between OTP boxes
}

// Typography
export const typography = {
  fontFamily: {
    english: 'Inter, system-ui, sans-serif',
    arabic: 'Cairo, Tajawal, sans-serif',
  },
  fontSize: {
    title: '24px',               // Page titles
    body: '16px',                // Body text
    label: '14px',               // Input labels
    small: '12px',               // Small text
  },
}
