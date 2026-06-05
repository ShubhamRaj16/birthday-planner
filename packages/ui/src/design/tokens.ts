export const colors = {
  // Brand
  primary: '#7c3aed',
  primaryHover: '#6d28d9',
  primaryLight: '#ede9fe',
  primaryLighter: '#f3f0ff',
  primaryLightest: '#faf5ff',
  primaryBorder: '#e9d5ff',

  // Neutrals
  text: '#1f2937',
  textMuted: '#374151',
  textSubtle: '#6b7280',
  textDisabled: '#9ca3af',
  border: '#d1d5db',
  borderLight: '#e5e7eb',
  bgLight: '#f3f4f6',
  bgLightest: '#f9fafb',
  white: '#ffffff',

  // Status
  success: '#065f46',
  successBg: '#d1fae5',
  warning: '#92400e',
  warningBg: '#fef3c7',
  error: '#b91c1c',
  errorBg: '#fee2e2',
  info: '#0ea5e9',
  badge: '#f43f5e',
} as const;

export const spacing = {
  xs: '0.25rem',
  sm: '0.5rem',
  md: '0.75rem',
  lg: '1rem',
  xl: '1.5rem',
  '2xl': '2rem',
} as const;

export const radius = {
  sm: '6px',
  md: '8px',
  lg: '10px',
  xl: '12px',
  full: '999px',
} as const;

export const fontSize = {
  xs: '0.75rem',
  sm: '0.875rem',
  base: '1rem',
  lg: '1.125rem',
  xl: '1.25rem',
} as const;

export const fontWeight = {
  normal: 400,
  medium: 500,
  semibold: 600,
  bold: 700,
} as const;

export const shadow = {
  card: '0 1px 3px rgba(0,0,0,0.08)',
  focus: `0 0 0 3px ${colors.primaryLight}`,
  sm: '0 1px 2px rgba(0,0,0,0.05)',
} as const;
