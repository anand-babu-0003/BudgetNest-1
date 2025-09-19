import React from 'react';
import { TouchableOpacity, Text, StyleSheet, ViewStyle, TextStyle, ActivityIndicator } from 'react-native';
import { useTheme } from '@/contexts/ThemeContext';

interface ModernButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
  size?: 'small' | 'medium' | 'large';
  disabled?: boolean;
  loading?: boolean;
  icon?: React.ReactNode;
  style?: ViewStyle;
  textStyle?: TextStyle;
  fullWidth?: boolean;
}

export const ModernButton: React.FC<ModernButtonProps> = ({
  title,
  onPress,
  variant = 'primary',
  size = 'medium',
  disabled = false,
  loading = false,
  icon,
  style,
  textStyle,
  fullWidth = false,
}) => {
  const { isDark } = useTheme();

  const getButtonStyle = (): any[] => {
    const baseStyle: any[] = [styles.button, styles[`${size}Button` as keyof typeof styles]];
    
    if (disabled || loading) {
      baseStyle.push(styles.disabled);
    } else {
      baseStyle.push(styles[`${variant}Button` as keyof typeof styles]);
      if (isDark && styles[`${variant}ButtonDark` as keyof typeof styles]) {
        baseStyle.push(styles[`${variant}ButtonDark` as keyof typeof styles]);
      }
    }
    
    if (fullWidth) {
      baseStyle.push(styles.fullWidth);
    }
    
    return baseStyle;
  };

  const getTextStyle = (): any[] => {
    const baseStyle: any[] = [styles.text, styles[`${size}Text` as keyof typeof styles]];
    
    if (disabled || loading) {
      baseStyle.push(styles.disabledText);
    } else {
      baseStyle.push(styles[`${variant}Text` as keyof typeof styles]);
      if (isDark && styles[`${variant}TextDark` as keyof typeof styles]) {
        baseStyle.push(styles[`${variant}TextDark` as keyof typeof styles]);
      }
    }
    
    return baseStyle;
  };

  return (
    <TouchableOpacity
      style={[...getButtonStyle(), style]}
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.7}
    >
      {loading ? (
        <ActivityIndicator 
          size="small" 
          color={variant === 'primary' ? '#ffffff' : '#3b82f6'} 
        />
      ) : (
        <>
          {icon && <>{icon}</>}
          <Text style={[...getTextStyle(), textStyle]}>{title}</Text>
        </>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 12,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  
  // Sizes
  smallButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    minHeight: 36,
  },
  mediumButton: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    minHeight: 48,
  },
  largeButton: {
    paddingHorizontal: 32,
    paddingVertical: 16,
    minHeight: 56,
  },
  
  // Variants - Professional white theme
  primaryButton: {
    backgroundColor: '#2563eb', // Professional blue
  },
  primaryButtonDark: {
    backgroundColor: '#2563eb', // Same for professional theme
  },
  secondaryButton: {
    backgroundColor: '#64748b', // Professional slate
  },
  secondaryButtonDark: {
    backgroundColor: '#64748b', // Same for professional theme
  },
  outlineButton: {
    backgroundColor: '#ffffff',
    borderWidth: 2,
    borderColor: '#2563eb',
    shadowOpacity: 0.05,
  },
  outlineButtonDark: {
    borderColor: '#2563eb', // Same for professional theme
    backgroundColor: '#ffffff',
  },
  ghostButton: {
    backgroundColor: 'transparent',
    shadowOpacity: 0,
    elevation: 0,
  },
  dangerButton: {
    backgroundColor: '#dc2626', // Professional red
  },
  dangerButtonDark: {
    backgroundColor: '#dc2626', // Same for professional theme
  },
  
  // States
  disabled: {
    backgroundColor: '#f1f5f9', // Light gray
    shadowOpacity: 0,
    elevation: 0,
    borderColor: '#e2e8f0',
  },
  fullWidth: {
    width: '100%',
  },
  
  // Text styles
  text: {
    fontWeight: '700', // Bold for professional look
    textAlign: 'center',
  },
  smallText: {
    fontSize: 14,
  },
  mediumText: {
    fontSize: 16,
  },
  largeText: {
    fontSize: 18,
  },
  
  // Text variants - Professional colors
  primaryText: {
    color: '#ffffff',
  },
  primaryTextDark: {
    color: '#ffffff',
  },
  secondaryText: {
    color: '#ffffff',
  },
  secondaryTextDark: {
    color: '#ffffff',
  },
  outlineText: {
    color: '#2563eb', // Professional blue
  },
  outlineTextDark: {
    color: '#2563eb', // Same for professional theme
  },
  ghostText: {
    color: '#2563eb', // Professional blue
  },
  ghostTextDark: {
    color: '#2563eb', // Same for professional theme
  },
  dangerText: {
    color: '#ffffff',
  },
  dangerTextDark: {
    color: '#ffffff',
  },
  disabledText: {
    color: '#94a3b8', // Light gray
  },
});


