import React, { createContext, useContext, useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { colors, componentThemes, typography, spacing, shadows, borderRadius } from '@/constants/designSystem';

export type Theme = 'light' | 'dark';

interface ThemeColors {
  primary: string;
  secondary: string;
  accent: string;
  background: {
    primary: string;
    secondary: string;
    card: string;
  };
  text: {
    primary: string;
    secondary: string;
    tertiary: string;
    inverse: string;
  };
  border: string;
  shadow: string;
  status: {
    success: string;
    warning: string;
    error: string;
    info: string;
  };
  financial: {
    income: string;
    expense: string;
    savings: string;
    investment: string;
    budget: string;
  };
}

interface ThemeContextType {
  theme: Theme;
  toggleTheme: () => void;
  isDark: boolean;
  colors: ThemeColors;
  typography: typeof typography;
  spacing: typeof spacing;
  shadows: typeof shadows;
  borderRadius: typeof borderRadius;
}

const ThemeContext = createContext<ThemeContextType | null>(null);

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

const getThemeColors = (theme: Theme): ThemeColors => {
  // Professional white theme - always use light, clean colors
  return {
    primary: '#2563eb', // Professional blue
    secondary: '#64748b', // Elegant slate
    accent: '#6366f1', // Modern indigo
    background: {
      primary: '#ffffff', // Pure white
      secondary: '#f8fafc', // Subtle off-white
      card: '#ffffff', // White cards
    },
    text: {
      primary: '#0f172a', // Deep slate for readability
      secondary: '#475569', // Medium slate
      tertiary: '#64748b', // Light slate
      inverse: '#ffffff', // White text for dark backgrounds
    },
    border: '#e2e8f0', // Light border
    shadow: '#000000', // Black shadow for contrast
    status: {
      success: '#059669', // Professional green
      warning: '#d97706', // Professional amber
      error: '#dc2626', // Professional red
      info: '#2563eb', // Professional blue
    },
    financial: {
      income: '#059669', // Success green
      expense: '#dc2626', // Error red
      savings: '#7c3aed', // Purple
      investment: '#0891b2', // Cyan
      budget: '#d97706', // Amber
    },
  };
};

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [theme, setTheme] = useState<Theme>('light'); // Always light for professional white theme

  useEffect(() => {
    loadTheme();
  }, []);

  const loadTheme = async () => {
    try {
      const savedTheme = await AsyncStorage.getItem('theme');
      if (savedTheme && (savedTheme === 'light' || savedTheme === 'dark')) {
        setTheme(savedTheme);
      }
    } catch (error) {
      console.error('Error loading theme:', error);
    }
  };

  const toggleTheme = async () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    try {
      await AsyncStorage.setItem('theme', newTheme);
    } catch (error) {
      console.error('Error saving theme:', error);
    }
  };

  const themeColors = getThemeColors(theme);

  return (
    <ThemeContext.Provider value={{ 
      theme, 
      toggleTheme, 
      isDark: theme === 'dark',
      colors: themeColors,
      typography,
      spacing,
      shadows,
      borderRadius,
    }}>
      {children}
    </ThemeContext.Provider>
  );
};


