/**
 * QDP Admin Panel Design System
 * Centralized design tokens and reusable styles for consistent UI across the admin panel
 */

// Brand Colors
export const colors = {
  // Primary Brand Colors (QDP)
  primary: {
    cream: '#D9D1BE',
    creamDark: '#C9C1AE',
    brown: '#8B7355',
    black: '#000000',
  },

  // Neutral Colors
  neutral: {
    gray50: '#F9FAFB',
    gray100: '#F3F4F6',
    gray200: '#E5E7EB',
    gray300: '#D1D5DB',
    gray400: '#9CA3AF',
    gray500: '#6B7280',
    gray600: '#4B5563',
    gray700: '#374151',
    gray800: '#1F2937',
    gray900: '#111827',
    white: '#FFFFFF',
  },

  // Semantic Colors
  success: {
    light: '#D1FAE5',
    main: '#10B981',
    dark: '#065F46',
  },
  error: {
    light: '#FEE2E2',
    main: '#EF4444',
    dark: '#DC2626',
  },
  warning: {
    light: '#FEF3C7',
    main: '#F59E0B',
    dark: '#92400E',
  },
  info: {
    light: '#DBEAFE',
    main: '#3B82F6',
    dark: '#1E40AF',
  },
};

// Typography
export const typography = {
  fontFamily: "'Tajawal', sans-serif",
  fontSize: {
    xs: '12px',
    sm: '13px',
    base: '14px',
    md: '16px',
    lg: '18px',
    xl: '20px',
    '2xl': '24px',
    '3xl': '32px',
  },
  fontWeight: {
    light: 300,
    normal: 400,
    medium: 500,
    semibold: 600,
    bold: 700,
    extrabold: 800,
  },
};

// Spacing
export const spacing = {
  xs: '4px',
  sm: '8px',
  md: '12px',
  lg: '16px',
  xl: '20px',
  '2xl': '24px',
  '3xl': '30px',
  '4xl': '40px',
};

// Border Radius
export const borderRadius = {
  sm: '8px',
  md: '12px',
  lg: '16px',
  xl: '20px',
  '2xl': '24px',
  full: '9999px',
};

// Shadows
export const shadows = {
  sm: '0 1px 2px rgba(0, 0, 0, 0.05)',
  base: '0 4px 6px rgba(0, 0, 0, 0.07)',
  md: '0 8px 16px rgba(0, 0, 0, 0.08)',
  lg: '0 8px 32px rgba(0, 0, 0, 0.06)',
  xl: '0 12px 40px rgba(0, 0, 0, 0.1)',
  '2xl': '0 20px 60px rgba(0, 0, 0, 0.08)',
};

// Glass Morphism Effect
export const glassEffect = {
  background: 'rgba(255, 255, 255, 0.8)',
  backdropFilter: 'blur(20px)',
  WebkitBackdropFilter: 'blur(20px)',
  border: '1px solid rgba(229, 231, 235, 0.5)',
  boxShadow: shadows.lg,
};

// Reusable Component Styles
export const components = {
  // Glass Card
  glassCard: {
    ...glassEffect,
    borderRadius: borderRadius.lg,
    padding: spacing['2xl'],
    transition: 'all 0.3s ease',
  },

  // Stat Card
  statCard: {
    ...glassEffect,
    borderRadius: borderRadius.lg,
    padding: spacing['2xl'],
    transition: 'all 0.3s ease',
    cursor: 'pointer',
    ':hover': {
      transform: 'translateY(-4px)',
      boxShadow: shadows.xl,
    },
  },

  // Icon Circle (Brand Gradient)
  iconCircle: {
    width: '60px',
    height: '60px',
    borderRadius: borderRadius.full,
    background: `linear-gradient(135deg, ${colors.primary.cream} 0%, ${colors.primary.creamDark} 100%)`,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: colors.primary.black,
    flexShrink: 0,
  },

  // Activity Item
  activityItem: {
    padding: spacing.md,
    background: colors.neutral.gray50,
    borderRadius: borderRadius.sm,
    borderRight: `3px solid ${colors.primary.cream}`,
  },

  // Button Primary
  buttonPrimary: {
    padding: `${spacing.md} ${spacing.xl}`,
    background: colors.primary.black,
    border: 'none',
    borderRadius: borderRadius.md,
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.bold,
    color: colors.neutral.white,
    cursor: 'pointer',
    transition: 'all 0.3s ease',
    boxShadow: '0 8px 24px rgba(0, 0, 0, 0.15)',
    ':hover': {
      background: '#1A1A1A',
      transform: 'translateY(-2px)',
      boxShadow: '0 12px 32px rgba(0, 0, 0, 0.2)',
    },
  },

  // Button Secondary (Cream)
  buttonSecondary: {
    padding: `${spacing.md} ${spacing.xl}`,
    background: `linear-gradient(135deg, ${colors.primary.cream} 0%, ${colors.primary.creamDark} 100%)`,
    border: 'none',
    borderRadius: borderRadius.md,
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.bold,
    color: colors.primary.black,
    cursor: 'pointer',
    transition: 'all 0.3s ease',
    ':hover': {
      transform: 'translateY(-2px)',
      boxShadow: shadows.md,
    },
  },

  // Input Field
  input: {
    width: '100%',
    padding: `${spacing.lg} ${spacing.xl}`,
    background: colors.neutral.gray50,
    border: `2px solid ${colors.neutral.gray200}`,
    borderRadius: borderRadius.md,
    fontSize: typography.fontSize.md,
    color: colors.neutral.gray900,
    outline: 'none',
    transition: 'all 0.3s ease',
    fontWeight: typography.fontWeight.medium,
    ':focus': {
      background: colors.neutral.white,
      border: `2px solid ${colors.primary.cream}`,
      boxShadow: `0 0 0 4px rgba(217, 209, 190, 0.15)`,
    },
  },

  // Badge Success
  badgeSuccess: {
    fontSize: typography.fontSize.xs,
    padding: `${spacing.xs} ${spacing.sm}`,
    background: colors.success.light,
    color: colors.success.dark,
    borderRadius: borderRadius.sm,
    fontWeight: typography.fontWeight.semibold,
  },

  // Badge Warning
  badgeWarning: {
    fontSize: typography.fontSize.xs,
    padding: `${spacing.xs} ${spacing.sm}`,
    background: colors.warning.light,
    color: colors.warning.dark,
    borderRadius: borderRadius.sm,
    fontWeight: typography.fontWeight.semibold,
  },

  // Badge Info
  badgeInfo: {
    fontSize: typography.fontSize.xs,
    padding: `${spacing.xs} ${spacing.sm}`,
    background: colors.info.light,
    color: colors.info.dark,
    borderRadius: borderRadius.sm,
    fontWeight: typography.fontWeight.semibold,
  },

  // Badge Error
  badgeError: {
    fontSize: typography.fontSize.xs,
    padding: `${spacing.xs} ${spacing.sm}`,
    background: colors.error.light,
    color: colors.error.dark,
    borderRadius: borderRadius.sm,
    fontWeight: typography.fontWeight.semibold,
  },
};

// Layout Styles
export const layout = {
  // Page Background
  pageBackground: {
    minHeight: '100vh',
    background: 'linear-gradient(135deg, #F9FAFB 0%, #FFFFFF 50%, #F9FAFB 100%)',
    position: 'relative' as const,
    direction: 'rtl' as const,
  },

  // Page Container
  container: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: spacing['3xl'],
  },

  // Grid 2 Columns
  grid2: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: spacing['2xl'],
  },

  // Grid 4 Columns
  grid4: {
    display: 'grid',
    gridTemplateColumns: 'repeat(4, 1fr)',
    gap: spacing['2xl'],
  },

  // Page Header
  pageHeader: {
    marginBottom: spacing.sm,
    direction: 'rtl' as const,
    textAlign: 'right' as const,
  },

  // Page Title
  pageTitle: {
    fontSize: typography.fontSize['3xl'],
    fontWeight: typography.fontWeight.extrabold,
    color: colors.neutral.gray900,
    margin: `0 0 ${spacing.sm} 0`,
    letterSpacing: '-0.5px',
  },

  // Page Subtitle
  pageSubtitle: {
    fontSize: typography.fontSize.md,
    color: colors.neutral.gray500,
    margin: 0,
    fontWeight: typography.fontWeight.medium,
  },
};

// RTL Utilities
export const rtl = {
  textAlign: 'right' as const,
  direction: 'rtl' as const,
  marginRight: (value: string) => ({ marginRight: value }),
  marginLeft: (value: string) => ({ marginLeft: value }),
  paddingRight: (value: string) => ({ paddingRight: value }),
  paddingLeft: (value: string) => ({ paddingLeft: value }),
  borderRight: (value: string) => ({ borderRight: value }),
  borderLeft: (value: string) => ({ borderLeft: value }),
};

// Animation Keyframes (for use in styled-jsx or CSS)
export const animations = {
  fadeInUp: `
    @keyframes fadeInUp {
      from { opacity: 0; transform: translateY(30px); }
      to { opacity: 1; transform: translateY(0); }
    }
  `,
  float: `
    @keyframes float {
      0%, 100% { transform: translateY(0px); }
      50% { transform: translateY(-15px); }
    }
  `,
  spin: `
    @keyframes spin {
      from { transform: rotate(0deg); }
      to { transform: rotate(360deg); }
    }
  `,
  heartbeat: `
    @keyframes heartbeat {
      0%, 100% { transform: scale(1); }
      10%, 30% { transform: scale(1.1); }
      20%, 40% { transform: scale(1); }
    }
  `,
  shine: `
    @keyframes shine {
      0% { background-position: -200% center; }
      100% { background-position: 200% center; }
    }
  `,
};

// Helper function to merge styles
export const mergeStyles = (...styles: any[]) => {
  return Object.assign({}, ...styles);
};

// Export default object with all design tokens
export default {
  colors,
  typography,
  spacing,
  borderRadius,
  shadows,
  glassEffect,
  components,
  layout,
  rtl,
  animations,
  mergeStyles,
};
