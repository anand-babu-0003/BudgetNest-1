import React from 'react';
import { View, Text, TouchableOpacity, StatusBar, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/contexts/ThemeContext';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { BlurView } from 'expo-blur';

interface ModernHeaderProps {
  title: string;
  subtitle?: string;
  leftIcon?: keyof typeof Ionicons.glyphMap;
  rightIcon?: keyof typeof Ionicons.glyphMap;
  onLeftPress?: () => void;
  onRightPress?: () => void;
  transparent?: boolean;
  showBackButton?: boolean;
  children?: React.ReactNode;
  onMenuPress?: () => void;
  onNotificationPress?: () => void;
  onSearchPress?: () => void;
  showNotifications?: boolean;
  showSearch?: boolean;
  showMenu?: boolean;
}

export const ModernHeader: React.FC<ModernHeaderProps> = ({
  title,
  subtitle,
  leftIcon,
  rightIcon,
  onLeftPress,
  onRightPress,
  transparent = false,
  showBackButton = false,
  children,
  onMenuPress,
  onNotificationPress,
  onSearchPress,
  showNotifications,
  showSearch,
  showMenu = false,
}) => {
  const { colors, typography, spacing, shadows } = useTheme();
  const insets = useSafeAreaInsets();

  const headerHeight = 60 + insets.top;

  const headerStyle = {
    height: headerHeight,
    paddingTop: insets.top,
    paddingHorizontal: spacing[5],
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    justifyContent: 'space-between' as const,
    zIndex: 10,
  };

  const backgroundStyle = transparent
    ? { backgroundColor: 'transparent' }
    : {
        backgroundColor: '#ffffff', // Pure white background
        borderBottomWidth: 1,
        borderBottomColor: '#e2e8f0',
        shadowColor: '#000000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.08,
        shadowRadius: 8,
        elevation: 3,
      };

  const HeaderContent = () => (
    <View style={[headerStyle, backgroundStyle]}>
      {/* Left side */}
      <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1 }}>
        {showMenu && (
          <TouchableOpacity
            onPress={onMenuPress}
            style={{
              padding: spacing[2],
              marginRight: spacing[3],
              borderRadius: 8,
              backgroundColor: '#f8fafc',
              borderWidth: 1,
              borderColor: '#e2e8f0',
            }}
          >
            <Ionicons
              name="menu"
              size={20}
              color={'#475569'}
            />
          </TouchableOpacity>
        )}
        
        {(leftIcon || showBackButton) && (
          <TouchableOpacity
            onPress={onLeftPress}
            style={{
              padding: spacing[2],
              marginRight: spacing[3],
              borderRadius: 8,
              backgroundColor: '#f8fafc', // Light background
              borderWidth: 1,
              borderColor: '#e2e8f0',
            }}
          >
            <Ionicons
              name={leftIcon || 'arrow-back'}
              size={20}
              color={'#475569'} // Professional gray
            />
          </TouchableOpacity>
        )}
        
        <View style={{ flex: 1 }}>
          <Text
            style={{
              fontSize: typography.sizes.xl,
              fontWeight: '700', // Bold for professional look
              color: '#0f172a', // Professional dark text
              lineHeight: typography.lineHeights.tight * typography.sizes.xl,
            }}
            numberOfLines={1}
          >
            {title}
          </Text>
          {subtitle && (
            <Text
              style={{
                fontSize: typography.sizes.sm,
                color: '#64748b', // Professional gray
                lineHeight: typography.lineHeights.normal * typography.sizes.sm,
                marginTop: 2,
                fontWeight: '500',
              }}
              numberOfLines={1}
            >
              {subtitle}
            </Text>
          )}
        </View>
      </View>

      {/* Right side */}
      <View style={{ flexDirection: 'row', alignItems: 'center' }}>
        {showSearch && (
          <TouchableOpacity
            onPress={onSearchPress}
            style={{
              padding: spacing[2],
              borderRadius: 8,
              backgroundColor: '#f1f5f9', // Light blue-gray
              marginRight: spacing[2],
              borderWidth: 1,
              borderColor: '#e2e8f0',
            }}
          >
            <Ionicons
              name="search"
              size={20}
              color={'#2563eb'} // Professional blue
            />
          </TouchableOpacity>
        )}
        
        {showNotifications && (
          <TouchableOpacity
            onPress={onNotificationPress}
            style={{
              padding: spacing[2],
              borderRadius: 8,
              backgroundColor: '#fef3c7', // Light amber
              marginRight: spacing[2],
              borderWidth: 1,
              borderColor: '#fbbf24',
            }}
          >
            <Ionicons
              name="notifications"
              size={20}
              color={'#d97706'} // Professional amber
            />
          </TouchableOpacity>
        )}
        
        {rightIcon && (
          <TouchableOpacity
            onPress={onRightPress}
            style={{
              padding: spacing[2],
              borderRadius: 8,
              backgroundColor: '#f8fafc', // Light background
              borderWidth: 1,
              borderColor: '#e2e8f0',
            }}
          >
            <Ionicons
              name={rightIcon}
              size={20}
              color={'#475569'} // Professional gray
            />
          </TouchableOpacity>
        )}
      </View>
      
      {children}
    </View>
  );

  if (transparent && Platform.OS === 'ios') {
    return (
      <View style={{ position: 'absolute', top: 0, left: 0, right: 0, zIndex: 10 }}>
        <BlurView
          tint="light"
          intensity={80}
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            bottom: 0,
            right: 0,
          }}
        />
        <HeaderContent />
      </View>
    );
  }

  return <HeaderContent />;
};

// Floating Action Button component for common actions
interface FABProps {
  icon: keyof typeof Ionicons.glyphMap;
  onPress: () => void;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'primary' | 'secondary' | 'accent';
}

export const FloatingActionButton: React.FC<FABProps> = ({
  icon,
  onPress,
  size = 'md',
  variant = 'primary',
}) => {
  const { colors, shadows, spacing } = useTheme();
  const insets = useSafeAreaInsets();

  const sizeConfig = {
    sm: { size: 48, iconSize: 20 },
    md: { size: 56, iconSize: 24 },
    lg: { size: 64, iconSize: 28 },
  };

  const variantConfig = {
    primary: colors.primary,
    secondary: colors.secondary,
    accent: colors.accent,
  };

  const config = sizeConfig[size];

  return (
    <TouchableOpacity
      onPress={onPress}
      style={{
        position: 'absolute',
        bottom: insets.bottom + 95, // Above tab bar
        right: spacing[5],
        width: config.size,
        height: config.size,
        borderRadius: config.size / 2,
        backgroundColor: variantConfig[variant],
        justifyContent: 'center',
        alignItems: 'center',
        ...shadows.lg,
      }}
      activeOpacity={0.8}
    >
      <Ionicons
        name={icon}
        size={config.iconSize}
        color={colors.text.inverse}
      />
    </TouchableOpacity>
  );
};