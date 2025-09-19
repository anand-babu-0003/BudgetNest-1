import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ViewStyle } from 'react-native';
import { useTheme } from '@/contexts/ThemeContext';
import { layout } from '@/constants/designSystem';

interface ModernCardProps {
  children: React.ReactNode;
  style?: ViewStyle;
  onPress?: () => void;
  padding?: number;
  margin?: number;
  variant?: 'default' | 'elevated' | 'outlined' | 'filled';
  borderRadius?: 'sm' | 'md' | 'lg' | 'xl';
  shadow?: boolean;
}

export const ModernCard: React.FC<ModernCardProps> = ({
  children,
  style,
  onPress,
  padding = layout.screenPadding,
  margin = 0,
  variant = 'default',
  borderRadius = 'lg',
  shadow = false,
}) => {
  const { colors, shadows, borderRadius: br } = useTheme();

  const CardComponent = onPress ? TouchableOpacity : View;

  const getCardStyle = () => {
    const baseStyle: ViewStyle = {
      backgroundColor: '#ffffff', // Pure white background
      padding,
      margin,
      borderRadius: br[borderRadius],
    };

    let cardStyle: ViewStyle = baseStyle;

    switch (variant) {
      case 'elevated':
        cardStyle = {
          ...baseStyle,
          shadowColor: '#000000',
          shadowOffset: { width: 0, height: 8 },
          shadowOpacity: 0.12,
          shadowRadius: 16,
          elevation: 8,
        };
        break;
      case 'outlined':
        cardStyle = {
          ...baseStyle,
          borderWidth: 1,
          borderColor: '#e2e8f0', // Light border
          shadowColor: '#000000',
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.05,
          shadowRadius: 4,
          elevation: 2,
        };
        break;
      case 'filled':
        cardStyle = {
          ...baseStyle,
          backgroundColor: '#f8fafc', // Light gray fill
          shadowColor: '#000000',
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.05,
          shadowRadius: 4,
          elevation: 2,
        };
        break;
      default:
        cardStyle = {
          ...baseStyle,
          shadowColor: '#000000',
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.08,
          shadowRadius: 8,
          elevation: 3,
        };
    }

    // Apply shadow if explicitly requested
    if (shadow) {
      cardStyle = {
        ...cardStyle,
        shadowColor: '#000000',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.12,
        shadowRadius: 16,
        elevation: 8,
      };
    }

    return cardStyle;
  };

  return (
    <CardComponent
      style={[getCardStyle(), style]}
      onPress={onPress}
      activeOpacity={onPress ? 0.95 : 1}
    >
      {children}
    </CardComponent>
  );
};

interface CardHeaderProps {
  title: string;
  subtitle?: string;
  action?: React.ReactNode;
  style?: ViewStyle;
}

export const CardHeader: React.FC<CardHeaderProps> = ({
  title,
  subtitle,
  action,
  style,
}) => {
  const { colors, typography, spacing } = useTheme();

  return (
    <View style={[styles.header, style]}>
      <View style={styles.headerContent}>
        <Text style={{
          fontSize: typography.sizes.lg,
          fontWeight: '700', // Bold for professional look
          color: '#0f172a', // Professional dark text
          marginBottom: subtitle ? spacing[1] : 0,
        }}>
          {title}
        </Text>
        {subtitle && (
          <Text style={{
            fontSize: typography.sizes.sm,
            color: '#64748b', // Professional gray
            lineHeight: typography.lineHeights.normal * typography.sizes.sm,
            fontWeight: '500',
          }}>
            {subtitle}
          </Text>
        )}
      </View>
      {action && <View style={styles.action}>{action}</View>}
    </View>
  );
};

interface CardContentProps {
  children: React.ReactNode;
  style?: ViewStyle;
}

export const CardContent: React.FC<CardContentProps> = ({ children, style }) => {
  const { spacing } = useTheme();
  
  return (
    <View style={[{ marginTop: spacing[4] }, style]}>
      {children}
    </View>
  );
};

interface CardFooterProps {
  children: React.ReactNode;
  style?: ViewStyle;
}

export const CardFooter: React.FC<CardFooterProps> = ({ children, style }) => {
  const { colors, spacing } = useTheme();

  return (
    <View style={[
      {
        marginTop: spacing[4],
        paddingTop: spacing[4],
        borderTopWidth: 1,
        borderTopColor: '#e2e8f0', // Light border
      },
      style
    ]}>
      {children}
    </View>
  );
};

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  headerContent: {
    flex: 1,
  },
  action: {
    marginLeft: 12,
  },
});


