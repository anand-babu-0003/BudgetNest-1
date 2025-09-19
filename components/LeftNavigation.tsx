import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, SafeAreaView } from 'react-native';
import { useTheme } from '@/contexts/ThemeContext';
import { useAuth } from '@/contexts/AuthContext';
import { 
  Home, 
  CreditCard, 
  DollarSign, 
  Target, 
  BarChart3, 
  Settings, 
  Tag,
  Plus,
  User,
  LogOut,
  Menu,
  X
} from 'lucide-react-native';
import { router } from 'expo-router';

interface NavigationItem {
  id: string;
  title: string;
  icon: React.ReactNode;
  route: string;
  badge?: number;
}

interface LeftNavigationProps {
  isVisible: boolean;
  onClose: () => void;
  currentRoute: string;
}

export const LeftNavigation: React.FC<LeftNavigationProps> = ({ 
  isVisible, 
  onClose, 
  currentRoute 
}) => {
  const { isDark } = useTheme();
  const { user, logout } = useAuth();

  const navigationItems: NavigationItem[] = [
    { id: 'dashboard', title: 'Dashboard', icon: <Home size={24} color="#64748b" />, route: '/(tabs)' },
    { id: 'transactions', title: 'Transactions', icon: <DollarSign size={24} color="#64748b" />, route: '/(tabs)/transactions' },
    { id: 'accounts', title: 'Accounts', icon: <CreditCard size={24} color="#64748b" />, route: '/(tabs)/accounts' },
    { id: 'categories', title: 'Categories', icon: <Tag size={24} color="#64748b" />, route: '/(tabs)/categories' },
    { id: 'budgets', title: 'Budgets', icon: <Target size={24} color="#64748b" />, route: '/(tabs)/budgets' },
    { id: 'goals', title: 'Goals', icon: <Target size={24} color="#64748b" />, route: '/(tabs)/goals' },
    { id: 'reports', title: 'Reports', icon: <BarChart3 size={24} color="#64748b" />, route: '/(tabs)/reports' },
    { id: 'settings', title: 'Settings', icon: <Settings size={24} color="#64748b" />, route: '/(tabs)/settings' },
  ];

  const handleNavigation = (route: string) => {
    router.push(route as any);
    onClose();
  };

  const handleLogout = () => {
    logout();
    onClose();
  };

  if (!isVisible) return null;

  return (
    <View style={[styles.overlay, isDark && styles.overlayDark]}>
      <View style={[styles.container, isDark && styles.containerDark]}>
        <SafeAreaView style={styles.safeArea}>
          {/* Header */}
          <View style={[styles.header, isDark && styles.headerDark]}>
            <View style={styles.headerContent}>
              <View style={styles.logoContainer}>
                <View style={[styles.logo, isDark && styles.logoDark]}>
                  <DollarSign size={28} color="#ffffff" />
                </View>
                <Text style={[styles.logoText, isDark && styles.logoTextDark]}>BudgetNest</Text>
              </View>
              <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                <X size={24} color="#64748b" />
              </TouchableOpacity>
            </View>
          </View>

          {/* User Profile Section */}
          <View style={[styles.userSection, isDark && styles.userSectionDark]}>
            <View style={[styles.avatar, isDark && styles.avatarDark]}>
              <User size={24} color="#ffffff" />
            </View>
            <View style={styles.userInfo}>
              <Text style={[styles.userName, isDark && styles.userNameDark]}>{user?.name}</Text>
              <Text style={[styles.userEmail, isDark && styles.userEmailDark]}>{user?.email}</Text>
            </View>
          </View>

          {/* Quick Add Button */}
          <TouchableOpacity 
            style={[styles.quickAddButton, isDark && styles.quickAddButtonDark]}
            onPress={() => handleNavigation('/add-transaction')}
          >
            <Plus size={20} color="#ffffff" />
            <Text style={styles.quickAddText}>Add Transaction</Text>
          </TouchableOpacity>

          {/* Navigation Items */}
          <ScrollView style={styles.navigationContainer} showsVerticalScrollIndicator={false}>
            {navigationItems.map((item) => (
              <TouchableOpacity
                key={item.id}
                style={[
                  styles.navItem,
                  isDark && styles.navItemDark,
                  currentRoute === item.route && styles.navItemActive,
                  currentRoute === item.route && isDark && styles.navItemActiveDark
                ]}
                onPress={() => handleNavigation(item.route)}
              >
                <View style={styles.navItemContent}>
                  <View style={[
                    styles.navIcon,
                    isDark && styles.navIconDark,
                    currentRoute === item.route && styles.navIconActive,
                    currentRoute === item.route && isDark && styles.navIconActiveDark
                  ]}>
                    {item.icon}
                  </View>
                  <Text style={[
                    styles.navText,
                    isDark && styles.navTextDark,
                    currentRoute === item.route && styles.navTextActive,
                    currentRoute === item.route && isDark && styles.navTextActiveDark
                  ]}>
                    {item.title}
                  </Text>
                  {item.badge && (
                    <View style={[styles.badge, isDark && styles.badgeDark]}>
                      <Text style={[styles.badgeText, isDark && styles.badgeTextDark]}>
                        {item.badge}
                      </Text>
                    </View>
                  )}
                </View>
              </TouchableOpacity>
            ))}
          </ScrollView>

          {/* Footer */}
          <View style={[styles.footer, isDark && styles.footerDark]}>
            <TouchableOpacity 
              style={[styles.logoutButton, isDark && styles.logoutButtonDark]}
              onPress={handleLogout}
            >
              <LogOut size={20} color={isDark ? '#ef4444' : '#ef4444'} />
              <Text style={[styles.logoutText, isDark && styles.logoutTextDark]}>Logout</Text>
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.4)', // Professional overlay
    zIndex: 1000,
  },
  overlayDark: {
    backgroundColor: 'rgba(0, 0, 0, 0.4)', // Same for professional theme
  },
  container: {
    width: '85%',
    height: '100%',
    backgroundColor: '#ffffff', // Pure white
    shadowColor: '#000000',
    shadowOffset: { width: 4, height: 0 },
    shadowOpacity: 0.15,
    shadowRadius: 20,
    elevation: 15,
  },
  containerDark: {
    backgroundColor: '#ffffff', // Always white for professional theme
  },
  safeArea: {
    flex: 1,
  },
  header: {
    padding: 20,
    paddingTop: 60,
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0', // Light border
    backgroundColor: '#ffffff',
  },
  headerDark: {
    borderBottomColor: '#e2e8f0', // Same for professional theme
    backgroundColor: '#ffffff',
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  logoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  logo: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#2563eb', // Professional blue
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
    shadowColor: '#2563eb',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  logoDark: {
    backgroundColor: '#2563eb', // Same for professional theme
  },
  logoText: {
    fontSize: 20,
    fontWeight: '700', // Bold for professional look
    color: '#0f172a', // Professional dark text
  },
  logoTextDark: {
    color: '#0f172a', // Always dark for readability
  },
  closeButton: {
    padding: 8,
    borderRadius: 20,
    backgroundColor: '#f1f5f9', // Light background
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  userSection: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#f8fafc', // Light background
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  userSectionDark: {
    backgroundColor: '#f8fafc', // Same for professional theme
    borderBottomColor: '#e2e8f0',
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#2563eb', // Professional blue
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
    shadowColor: '#2563eb',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  avatarDark: {
    backgroundColor: '#2563eb', // Same for professional theme
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 16,
    fontWeight: '700', // Bold for emphasis
    color: '#0f172a', // Professional dark text
    marginBottom: 2,
  },
  userNameDark: {
    color: '#0f172a', // Always dark for readability
  },
  userEmail: {
    fontSize: 14,
    color: '#64748b', // Professional gray
    fontWeight: '500',
  },
  userEmailDark: {
    color: '#64748b', // Same for professional theme
  },
  quickAddButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    margin: 20,
    padding: 16,
    backgroundColor: '#2563eb', // Professional blue
    borderRadius: 12,
    shadowColor: '#2563eb',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 8,
  },
  quickAddButtonDark: {
    backgroundColor: '#2563eb', // Same for professional theme
  },
  quickAddText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '700', // Bold for emphasis
    marginLeft: 8,
  },
  navigationContainer: {
    flex: 1,
    paddingHorizontal: 20,
  },
  navItem: {
    marginBottom: 4,
    borderRadius: 12,
    overflow: 'hidden',
  },
  navItemDark: {
    backgroundColor: 'transparent',
  },
  navItemActive: {
    backgroundColor: '#eff6ff', // Light blue background
  },
  navItemActiveDark: {
    backgroundColor: '#eff6ff', // Same for professional theme
  },
  navItemContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  navIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f1f5f9', // Light background
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  navIconDark: {
    backgroundColor: '#f1f5f9', // Same for professional theme
  },
  navIconActive: {
    backgroundColor: '#dbeafe', // Light blue background
  },
  navIconActiveDark: {
    backgroundColor: '#dbeafe', // Same for professional theme
  },
  navText: {
    flex: 1,
    fontSize: 16,
    fontWeight: '600', // Bold for professional look
    color: '#374151', // Professional gray
  },
  navTextDark: {
    color: '#374151', // Same for professional theme
  },
  navTextActive: {
    color: '#1e40af', // Professional blue
    fontWeight: '700', // Extra bold for active state
  },
  navTextActiveDark: {
    color: '#1e40af', // Same for professional theme
  },
  badge: {
    backgroundColor: '#dc2626', // Professional red
    borderRadius: 10,
    paddingHorizontal: 8,
    paddingVertical: 2,
    minWidth: 20,
    alignItems: 'center',
  },
  badgeDark: {
    backgroundColor: '#dc2626', // Same for professional theme
  },
  badgeText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '700', // Bold for emphasis
  },
  badgeTextDark: {
    color: '#ffffff',
  },
  footer: {
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: '#e2e8f0', // Light border
  },
  footerDark: {
    borderTopColor: '#e2e8f0', // Same for professional theme
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    backgroundColor: '#fef2f2', // Light red background
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#fecaca', // Light red border
  },
  logoutButtonDark: {
    backgroundColor: '#fef2f2', // Same for professional theme
    borderColor: '#fecaca',
  },
  logoutText: {
    color: '#dc2626', // Professional red
    fontSize: 16,
    fontWeight: '700', // Bold for emphasis
    marginLeft: 8,
  },
  logoutTextDark: {
    color: '#dc2626', // Same for professional theme
  },
});


