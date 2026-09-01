export const Colors = {
  dark: {
    background: '#0B0F19',
    surfaceBase: '#111827',
    surfaceRaised: '#1F2937',
    surfaceOverlay: '#374151',
    surfaceElevated: '#1E293B',

    borderSubtle: '#1E293B',
    borderDefault: '#374151',
    borderFocus: '#0284C7',

    primary: '#0284C7',
    primaryActive: '#0369A1',
    primaryLight: '#38BDF8',

    textPrimary: '#F9FAFB',
    textSecondary: '#9CA3AF',
    textMuted: '#6B7280',
    textInverse: '#0B0F19',

    statusAvailable: '#10B981',
    statusUnstable: '#F59E0B',
    statusUnavailable: '#EF4444',
    statusUnknown: '#6B7280',

    overlay: 'rgba(0, 0, 0, 0.75)',
  },
  light: {
    background: '#F8FAFC',
    surfaceBase: '#FFFFFF',
    surfaceRaised: '#F1F5F9',
    surfaceOverlay: '#E2E8F0',
    surfaceElevated: '#FFFFFF',

    borderSubtle: '#F1F5F9',
    borderDefault: '#E2E8F0',
    borderFocus: '#0284C7',

    primary: '#0284C7',
    primaryActive: '#0369A1',
    primaryLight: '#38BDF8',

    textPrimary: '#0F172A',
    textSecondary: '#475569',
    textMuted: '#94A3B8',
    textInverse: '#F9FAFB',

    statusAvailable: '#059669',
    statusUnstable: '#D97706',
    statusUnavailable: '#DC2626',
    statusUnknown: '#94A3B8',

    overlay: 'rgba(15, 23, 42, 0.5)',
  },
};

export const Typography = {
  display: {
    fontSize: 28,
    lineHeight: 34,
    fontWeight: '700' as const,
  },
  titleLarge: {
    fontSize: 22,
    lineHeight: 28,
    fontWeight: '700' as const,
  },
  titleMedium: {
    fontSize: 18,
    lineHeight: 24,
    fontWeight: '600' as const,
  },
  titleSmall: {
    fontSize: 16,
    lineHeight: 22,
    fontWeight: '600' as const,
  },
  bodyLarge: {
    fontSize: 16,
    lineHeight: 22,
    fontWeight: '400' as const,
  },
  bodyMedium: {
    fontSize: 14,
    lineHeight: 20,
    fontWeight: '400' as const,
  },
  bodySmall: {
    fontSize: 13,
    lineHeight: 18,
    fontWeight: '400' as const,
  },
  caption: {
    fontSize: 12,
    lineHeight: 16,
    fontWeight: '500' as const,
  },
  badge: {
    fontSize: 11,
    lineHeight: 14,
    fontWeight: '700' as const,
    letterSpacing: 0.5,
  },
};

export const Spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  '2xl': 32,
  '3xl': 48,
};

export const BorderRadius = {
  none: 0,
  sm: 4,
  md: 8,
  lg: 12,
  xl: 16,
  full: 9999,
};

export const IconSizes = {
  xs: 14,
  sm: 18,
  md: 22,
  lg: 28,
  xl: 36,
};

export const MaxContentWidth = 900;
