import { Tabs } from 'expo-router';
import { Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/contexts/ThemeContext';
import { BlurView } from 'expo-blur';

interface TabIconProps {
  name: keyof typeof Ionicons.glyphMap;
  color: string;
  size?: number;
}

function TabIcon({ name, color, size = 24 }: TabIconProps) {
  return <Ionicons name={name} size={size} color={color} />;
}

export default function TabLayout() {
  const { colors, typography } = useTheme();

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          backgroundColor: Platform.OS === 'ios' ? 'transparent' : '#ffffff', // Pure white
          borderTopWidth: 1,
          borderTopColor: '#e2e8f0', // Light border
          elevation: 0,
          height: 85,
          paddingBottom: Platform.OS === 'ios' ? 25 : 10,
          paddingTop: 10,
          shadowColor: '#000000',
          shadowOffset: { width: 0, height: -2 },
          shadowOpacity: 0.08,
          shadowRadius: 8,
        },
        tabBarBackground: Platform.OS === 'ios' ? () => (
          <BlurView
            tint="light"
            intensity={100}
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              bottom: 0,
              right: 0,
              backgroundColor: '#ffffff' + '95', // White with opacity
            }}
          />
        ) : undefined,
        tabBarActiveTintColor: '#2563eb', // Professional blue
        tabBarInactiveTintColor: '#94a3b8', // Light gray
        tabBarLabelStyle: {
          fontSize: typography.sizes.xs,
          fontWeight: '600', // Bold for professional look
          marginTop: 4,
        },
        tabBarItemStyle: {
          paddingVertical: 5,
        },
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Dashboard',
          tabBarIcon: ({ color, size }) => (
            <TabIcon name="home" color={color} size={size} />
          ),
        }}
      />
      <Tabs.Screen
        name="transactions"
        options={{
          title: 'Transactions',
          tabBarIcon: ({ color, size }) => (
            <TabIcon name="swap-horizontal" color={color} size={size} />
          ),
        }}
      />
      <Tabs.Screen
        name="accounts"
        options={{
          title: 'Accounts',
          tabBarIcon: ({ color, size }) => (
            <TabIcon name="wallet" color={color} size={size} />
          ),
        }}
      />
      <Tabs.Screen
        name="budgets"
        options={{
          title: 'Budget',
          tabBarIcon: ({ color, size }) => (
            <TabIcon name="pie-chart" color={color} size={size} />
          ),
        }}
      />
      <Tabs.Screen
        name="reports"
        options={{
          title: 'Reports',
          tabBarIcon: ({ color, size }) => (
            <TabIcon name="analytics" color={color} size={size} />
          ),
        }}
      />
      
      {/* Hidden screens that shouldn't show in tabs */}
      <Tabs.Screen
        name="goals"
        options={{
          href: null, // Hide from tab bar
        }}
      />
      <Tabs.Screen
        name="categories"
        options={{
          href: null, // Hide from tab bar
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          href: null, // Hide from tab bar
        }}
      />
      <Tabs.Screen
        name="add-transaction"
        options={{
          href: null, // Hide from tab bar
        }}
      />
    </Tabs>
  );
}