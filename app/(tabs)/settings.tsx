import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { useAuth } from '@/contexts/AuthContext';
import { 
  User, 
  DollarSign, 
  Moon, 
  Download, 
  Upload, 
  LogOut,
  ChevronRight 
} from 'lucide-react-native';
import { router } from 'expo-router';

export default function SettingsScreen() {
  const { user, logout } = useAuth();

  const handleLogout = () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Logout', 
          style: 'destructive', 
          onPress: async () => {
            try {
              await logout();
              router.replace('/(auth)/signin');
            } catch (error) {
              Alert.alert('Error', 'Failed to logout');
            }
          }
        }
      ]
    );
  };

  const SettingsItem = ({ 
    icon, 
    title, 
    subtitle, 
    onPress, 
    showChevron = true 
  }: {
    icon: React.ReactNode;
    title: string;
    subtitle?: string;
    onPress: () => void;
    showChevron?: boolean;
  }) => (
    <TouchableOpacity style={styles.settingsItem} onPress={onPress}>
      <View style={styles.settingsIcon}>
        {icon}
      </View>
      <View style={styles.settingsContent}>
        <Text style={styles.settingsTitle}>{title}</Text>
        {subtitle && (
          <Text style={styles.settingsSubtitle}>{subtitle}</Text>
        )}
      </View>
      {showChevron && (
        <ChevronRight size={20} color="#9ca3af" />
      )}
    </TouchableOpacity>
  );

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Settings</Text>
      </View>

      <View style={styles.profileSection}>
        <View style={styles.profileCard}>
          <View style={styles.avatar}>
            <User size={32} color="#6b7280" />
          </View>
          <View style={styles.profileInfo}>
            <Text style={styles.userName}>{user?.name}</Text>
            <Text style={styles.userEmail}>{user?.email}</Text>
          </View>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Account</Text>
        <View style={styles.sectionContent}>
          <SettingsItem
            icon={<User size={20} color="#6b7280" />}
            title="Profile"
            subtitle="Edit your personal information"
            onPress={() => {}}
          />
          <SettingsItem
            icon={<DollarSign size={20} color="#6b7280" />}
            title="Currency"
            subtitle={user?.currency || 'USD'}
            onPress={() => {}}
          />
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Preferences</Text>
        <View style={styles.sectionContent}>
          <SettingsItem
            icon={<Moon size={20} color="#6b7280" />}
            title="Dark Mode"
            subtitle="Switch to dark theme"
            onPress={() => {}}
          />
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Data</Text>
        <View style={styles.sectionContent}>
          <SettingsItem
            icon={<Download size={20} color="#6b7280" />}
            title="Export Data"
            subtitle="Download your financial data"
            onPress={() => Alert.alert('Export', 'Export functionality coming soon!')}
          />
          <SettingsItem
            icon={<Upload size={20} color="#6b7280" />}
            title="Import Data"
            subtitle="Import from other apps"
            onPress={() => Alert.alert('Import', 'Import functionality coming soon!')}
          />
        </View>
      </View>

      <View style={styles.section}>
        <View style={styles.sectionContent}>
          <SettingsItem
            icon={<LogOut size={20} color="#ef4444" />}
            title="Logout"
            onPress={handleLogout}
            showChevron={false}
          />
        </View>
      </View>

      <View style={styles.footer}>
        <Text style={styles.footerText}>FinanceMate v1.0.0</Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },
  header: {
    padding: 20,
    paddingTop: 60,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1f2937',
  },
  profileSection: {
    padding: 20,
  },
  profileCard: {
    backgroundColor: 'white',
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  avatar: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#f3f4f6',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  profileInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 4,
  },
  userEmail: {
    fontSize: 16,
    color: '#6b7280',
  },
  section: {
    marginBottom: 24,
    paddingHorizontal: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 12,
  },
  sectionContent: {
    backgroundColor: 'white',
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  settingsItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  settingsIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f9fafb',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  settingsContent: {
    flex: 1,
  },
  settingsTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: '#1f2937',
    marginBottom: 2,
  },
  settingsSubtitle: {
    fontSize: 14,
    color: '#6b7280',
  },
  footer: {
    alignItems: 'center',
    padding: 20,
    marginTop: 20,
  },
  footerText: {
    fontSize: 14,
    color: '#9ca3af',
  },
});