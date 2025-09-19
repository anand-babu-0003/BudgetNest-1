/**
 * Modern Design System for BudgetNest
 * Comprehensive design tokens for colors, typography, spacing, and shadows
 */

// Color Palette - Modern and accessible
export const colors = {
  // Primary colors - Modern blues and purples
  primary: {
    50: '#eff6ff',
    100: '#dbeafe',
    200: '#bfdbfe',
    300: '#93c5fd',
    400: '#60a5fa',
    500: '#3b82f6', // Main primary
    600: '#2563eb',
    700: '#1d4ed8',
    800: '#1e40af',
    900: '#1e3a8a',
  },
  
  // Secondary colors - Modern greens
  secondary: {
    50: '#ecfdf5',
    100: '#d1fae5',
    200: '#a7f3d0',
    300: '#6ee7b7',
    400: '#34d399',
    500: '#10b981', // Main secondary
    600: '#059669',
    700: '#047857',
    800: '#065f46',
    900: '#064e3b',
  },
  
  // Accent colors
  accent: {
    purple: '#8b5cf6',
    pink: '#ec4899',
    orange: '#f59e0b',
    red: '#ef4444',
    cyan: '#06b6d4',
  },
  
  // Neutral colors - Modern grays
  neutral: {
    0: '#ffffff',
    50: '#f9fafb',
    100: '#f3f4f6',
    200: '#e5e7eb',
    300: '#d1d5db',
    400: '#9ca3af',
    500: '#6b7280',
    600: '#4b5563',
    700: '#374151',
    800: '#1f2937',
    900: '#111827',
    950: '#0a0a0a',
  },
  
  // Status colors
  status: {
    success: '#10b981',
    warning: '#f59e0b',
    error: '#ef4444',
    info: '#3b82f6',
  },
  
  // Financial colors
  financial: {
    income: '#10b981',
    expense: '#ef4444',
    savings: '#8b5cf6',
    investment: '#06b6d4',
    budget: '#f59e0b',
  },
};

// Typography scale
export const typography = {
  fonts: {
    heading: 'Inter-Bold',
    body: 'Inter-Regular',
    mono: 'SF Mono',
  },
  
  sizes: {
    xs: 12,
    sm: 14,
    base: 16,
    lg: 18,
    xl: 20,
    '2xl': 24,
    '3xl': 30,
    '4xl': 36,
    '5xl': 48,
    '6xl': 60,
  },
  
  lineHeights: {
    tight: 1.2,
    normal: 1.5,
    relaxed: 1.75,
  },
  
  fontWeights: {
    normal: '400',
    medium: '500',
    semibold: '600',
    bold: '700',
    extrabold: '800',
  },
};

// Spacing scale
export const spacing = {
  0: 0,
  1: 4,
  2: 8,
  3: 12,
  4: 16,
  5: 20,
  6: 24,
  8: 32,
  10: 40,
  12: 48,
  16: 64,
  20: 80,
  24: 96,
  32: 128,
};

// Border radius
export const borderRadius = {
  none: 0,
  sm: 4,
  base: 8,
  md: 12,
  lg: 16,
  xl: 20,
  '2xl': 24,
  '3xl': 32,
  full: 9999,
};

// Shadows
export const shadows = {
  none: {
    shadowColor: 'transparent',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0,
    shadowRadius: 0,
    elevation: 0,
  },
  
  sm: {
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  
  base: {
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  
  md: {
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 6,
  },
  
  lg: {
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 16,
    elevation: 10,
  },
  
  xl: {
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.25,
    shadowRadius: 24,
    elevation: 15,
  },
};

// Animation values
export const animation = {
  duration: {
    fast: 150,
    normal: 250,
    slow: 500,
  },
  
  easing: {
    ease: 'ease',
    easeIn: 'ease-in',
    easeOut: 'ease-out',
    easeInOut: 'ease-in-out',
  },
};

// Component sizes
export const sizes = {
  button: {
    sm: { height: 32, paddingHorizontal: 12 },
    md: { height: 40, paddingHorizontal: 16 },
    lg: { height: 48, paddingHorizontal: 20 },
    xl: { height: 56, paddingHorizontal: 24 },
  },
  
  input: {
    sm: { height: 32, paddingHorizontal: 12 },
    md: { height: 40, paddingHorizontal: 16 },
    lg: { height: 48, paddingHorizontal: 20 },
  },
  
  card: {
    padding: 20,
    borderRadius: borderRadius.lg,
  },
};

// Component themes
export const componentThemes = {
  card: {
    light: {
      backgroundColor: colors.neutral[0],
      borderColor: colors.neutral[200],
      shadowColor: colors.neutral[900],
    },
    dark: {
      backgroundColor: colors.neutral[800],
      borderColor: colors.neutral[700],
      shadowColor: colors.neutral[950],
    },
  },
  
  background: {
    light: {
      primary: colors.neutral[50],
      secondary: colors.neutral[100],
    },
    dark: {
      primary: colors.neutral[900],
      secondary: colors.neutral[800],
    },
  },
  
  text: {
    light: {
      primary: colors.neutral[900],
      secondary: colors.neutral[600],
      tertiary: colors.neutral[500],
      inverse: colors.neutral[0],
    },
    dark: {
      primary: colors.neutral[0],
      secondary: colors.neutral[300],
      tertiary: colors.neutral[400],
      inverse: colors.neutral[900],
    },
  },
};

// Layout constants
export const layout = {
  headerHeight: 60,
  tabBarHeight: 60,
  screenPadding: 20,
  cardGap: 16,
  sectionGap: 24,
};

// Breakpoints for responsive design
export const breakpoints = {
  sm: 640,
  md: 768,
  lg: 1024,
  xl: 1280,
};

export default {
  colors,
  typography,
  spacing,
  borderRadius,
  shadows,
  animation,
  sizes,
  componentThemes,
  layout,
  breakpoints,
};