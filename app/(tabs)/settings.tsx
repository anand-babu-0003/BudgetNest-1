import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Alert, Share, Modal, TextInput } from 'react-native';
import { useAuth } from '@/contexts/AuthContext';
import { useTheme } from '@/contexts/ThemeContext';
import { exportUserData, generateCSV, generateJSON } from '@/utils/dataExport';
import { db } from '../../firebase.config';
import { doc, updateDoc } from 'firebase/firestore';
import { 
  User, 
  DollarSign, 
  Moon, 
  Download, 
  Upload, 
  LogOut,
  ChevronRight,
  Edit3,
  Phone,
  Mail,
  Settings as SettingsIcon,
  Bell,
  Shield,
  HelpCircle,
  CreditCard,
  Target,
  BarChart3
} from 'lucide-react-native';
import { router } from 'expo-router';
import { ModernHeader } from '@/components/ModernHeader';
import { ModernCard, CardHeader, CardContent } from '@/components/ModernCard';
import { ModernButton } from '@/components/ModernButton';

export default function SettingsScreen() {
  const { user, logout } = useAuth();
  const { isDark, toggleTheme } = useTheme();
  const [exporting, setExporting] = useState(false);
  const [profileModalVisible, setProfileModalVisible] = useState(false);
  const [editingProfile, setEditingProfile] = useState(false);
  const [profileData, setProfileData] = useState({
    name: user?.name || '',
    phone: user?.phone || '',
    monthlyIncome: user?.monthlyIncome?.toString() || '',
  });

  const handleUpdateProfile = async () => {
    if (!user) return;

    try {
      const updateData: any = {};
      if (profileData.name !== user.name) updateData.name = profileData.name;
      if (profileData.phone !== user.phone) updateData.phone = profileData.phone;
      if (profileData.monthlyIncome !== user.monthlyIncome?.toString()) {
        updateData.monthlyIncome = parseFloat(profileData.monthlyIncome) || 0;
      }

      if (Object.keys(updateData).length > 0) {
        await updateDoc(doc(db, 'users', user.id), updateData);
        Alert.alert('Success', 'Profile updated successfully');
        setEditingProfile(false);
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to update profile');
    }
  };

  const handleExport = async (format: 'csv' | 'json') => {
    if (!user) return;

    setExporting(true);
    try {
      const data = await exportUserData(user.id);
      const content = format === 'csv' ? generateCSV(data) : generateJSON(data);
      const filename = `budgetnest-export-${new Date().toISOString().split('T')[0]}.${format}`;

      await Share.share({
        message: content,
        title: `BudgetNest Export - ${format.toUpperCase()}`,
        url: `data:text/${format};charset=utf-8,${encodeURIComponent(content)}`
      });
    } catch (error) {
      Alert.alert('Error', 'Failed to export data');
    } finally {
      setExporting(false);
    }
  };

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

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: user?.currency || 'USD',
    }).format(amount);
  };

  const settingsSections = [
    {
      title: 'Account',
      items: [
        {
          icon: <User size={20} color="#3b82f6" />,
          title: 'Profile',
          subtitle: 'Manage your personal information',
          onPress: () => setProfileModalVisible(true),
        },
        {
          icon: <Shield size={20} color="#10b981" />,
          title: 'Privacy & Security',
          subtitle: 'Manage your privacy settings',
          onPress: () => Alert.alert('Coming Soon', 'Privacy settings will be available soon'),
        },
      ]
    },
    {
      title: 'Appearance',
      items: [
        {
          icon: <Moon size={20} color="#8b5cf6" />,
          title: 'Dark Mode',
          subtitle: isDark ? 'Enabled' : 'Disabled',
          onPress: toggleTheme,
          rightElement: (
            <View style={[styles.toggle, isDark && styles.toggleActive]}>
              <View style={[styles.toggleThumb, isDark && styles.toggleThumbActive]} />
            </View>
          ),
        },
      ]
    },
    {
      title: 'Data',
      items: [
        {
          icon: <Download size={20} color="#f59e0b" />,
          title: 'Export Data',
          subtitle: 'Download your financial data',
          onPress: () => {
            Alert.alert(
              'Export Data',
              'Choose export format',
              [
                { text: 'Cancel', style: 'cancel' },
                { text: 'CSV', onPress: () => handleExport('csv') },
                { text: 'JSON', onPress: () => handleExport('json') }
              ]
            );
          },
        },
        {
          icon: <Upload size={20} color="#06b6d4" />,
          title: 'Import Data',
          subtitle: 'Import from other apps',
          onPress: () => Alert.alert('Coming Soon', 'Import functionality will be available soon'),
        },
      ]
    },
    {
      title: 'Support',
      items: [
        {
          icon: <HelpCircle size={20} color="#6366f1" />,
          title: 'Help & Support',
          subtitle: 'Get help and contact support',
          onPress: () => Alert.alert('Support', 'Contact us at support@budgetnest.com'),
        },
        {
          icon: <Bell size={20} color="#ec4899" />,
          title: 'Notifications',
          subtitle: 'Manage notification preferences',
          onPress: () => Alert.alert('Coming Soon', 'Notification settings will be available soon'),
        },
      ]
    },
  ];

  const quickActions = [
    {
      icon: <CreditCard size={24} color="#3b82f6" />,
      title: 'Accounts',
      onPress: () => router.push('/(tabs)/accounts'),
    },
    {
      icon: <Target size={24} color="#10b981" />,
      title: 'Budgets',
      onPress: () => router.push('/(tabs)/budgets'),
    },
    {
      icon: <BarChart3 size={24} color="#f59e0b" />,
      title: 'Reports',
      onPress: () => router.push('/(tabs)/reports'),
    },
  ];

  const SettingsItem = ({ 
    icon, 
    title, 
    subtitle, 
    onPress, 
    rightElement 
  }: {
    icon: React.ReactNode;
    title: string;
    subtitle?: string;
    onPress: () => void;
    rightElement?: React.ReactNode;
  }) => (
    <TouchableOpacity style={[styles.settingsItem, isDark && styles.settingsItemDark]} onPress={onPress}>
      <View style={[styles.settingsIcon, isDark && styles.settingsIconDark]}>
        {icon}
      </View>
      <View style={styles.settingsContent}>
        <Text style={[styles.settingsTitle, isDark && styles.settingsTitleDark]}>{title}</Text>
        {subtitle && (
          <Text style={[styles.settingsSubtitle, isDark && styles.settingsSubtitleDark]}>{subtitle}</Text>
        )}
      </View>
      {rightElement || <ChevronRight size={20} color="#9ca3af" />}
    </TouchableOpacity>
  );

  return (
    <View style={[styles.container, isDark && styles.containerDark]}>
      <ModernHeader
        title="Settings"
        subtitle="Manage your account and preferences"
        onMenuPress={() => {}}
        onNotificationPress={() => {}}
        showNotifications={false}
        showSearch={false}
      />

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* User Profile Card */}
        <ModernCard style={styles.profileCard}>
          <View style={styles.profileContent}>
            <View style={[styles.avatar, isDark && styles.avatarDark]}>
              <User size={32} color={isDark ? '#1f2937' : '#ffffff'} />
            </View>
            <View style={styles.profileInfo}>
              <Text style={[styles.userName, isDark && styles.userNameDark]}>{user?.name}</Text>
              <Text style={[styles.userEmail, isDark && styles.userEmailDark]}>{user?.email}</Text>
              {user?.phone && (
                <Text style={[styles.userPhone, isDark && styles.userPhoneDark]}>{user.phone}</Text>
              )}
              {user?.monthlyIncome && user.monthlyIncome > 0 && (
                <Text style={[styles.userIncome, isDark && styles.userIncomeDark]}>
                  Monthly Income: {formatCurrency(user.monthlyIncome)}
                </Text>
              )}
            </View>
            <TouchableOpacity 
              style={[styles.editButton, isDark && styles.editButtonDark]}
              onPress={() => setProfileModalVisible(true)}
            >
              <Edit3 size={20} color="#3b82f6" />
            </TouchableOpacity>
          </View>
        </ModernCard>

        {/* Quick Actions */}
        <ModernCard style={styles.quickActionsCard}>
          <CardHeader title="Quick Actions" />
          <CardContent>
            <View style={styles.quickActionsGrid}>
              {quickActions.map((action, index) => (
                <TouchableOpacity
                  key={index}
                  style={[styles.quickAction, isDark && styles.quickActionDark]}
                  onPress={action.onPress}
                >
                  <View style={[styles.quickActionIcon, isDark && styles.quickActionIconDark]}>
                    {action.icon}
                  </View>
                  <Text style={[styles.quickActionText, isDark && styles.quickActionTextDark]}>
                    {action.title}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </CardContent>
        </ModernCard>

        {/* Settings Sections */}
        {settingsSections.map((section, sectionIndex) => (
          <ModernCard key={sectionIndex} style={styles.sectionCard}>
            <CardHeader title={section.title} />
            <CardContent>
              {section.items.map((item, itemIndex) => (
                <SettingsItem
                  key={itemIndex}
                  icon={item.icon}
                  title={item.title}
                  subtitle={item.subtitle}
                  onPress={item.onPress}
                  rightElement={(item as any).rightElement}
                />
              ))}
            </CardContent>
          </ModernCard>
        ))}

        {/* Logout Button */}
        <ModernCard style={styles.logoutCard}>
          <CardContent>
            <TouchableOpacity 
              style={[styles.logoutButton, isDark && styles.logoutButtonDark]}
              onPress={handleLogout}
            >
              <LogOut size={20} color="#ef4444" />
              <Text style={[styles.logoutText, isDark && styles.logoutTextDark]}>Logout</Text>
            </TouchableOpacity>
          </CardContent>
        </ModernCard>

        {/* App Version */}
        <View style={styles.versionContainer}>
          <Text style={[styles.versionText, isDark && styles.versionTextDark]}>
            BudgetNest v1.0.0
          </Text>
        </View>

        {/* Profile Editing Modal */}
        <Modal
          visible={profileModalVisible}
          animationType="slide"
          presentationStyle="pageSheet"
        >
          <View style={[styles.modalContainer, isDark && styles.modalContainerDark]}>
            <View style={[styles.modalHeader, isDark && styles.modalHeaderDark]}>
              <TouchableOpacity onPress={() => setProfileModalVisible(false)}>
                <Text style={[styles.modalCancel, isDark && styles.modalCancelDark]}>Cancel</Text>
              </TouchableOpacity>
              <Text style={[styles.modalTitle, isDark && styles.modalTitleDark]}>Edit Profile</Text>
              <TouchableOpacity onPress={handleUpdateProfile}>
                <Text style={[styles.modalSave, isDark && styles.modalSaveDark]}>Save</Text>
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalContent}>
              <View style={styles.inputGroup}>
                <Text style={[styles.inputLabel, isDark && styles.inputLabelDark]}>Full Name</Text>
                <TextInput
                  style={[styles.modalInput, isDark && styles.modalInputDark]}
                  value={profileData.name}
                  onChangeText={(text) => setProfileData({...profileData, name: text})}
                  placeholder="Enter your full name"
                  placeholderTextColor="#9ca3af"
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={[styles.inputLabel, isDark && styles.inputLabelDark]}>Phone Number</Text>
                <TextInput
                  style={[styles.modalInput, isDark && styles.modalInputDark]}
                  value={profileData.phone}
                  onChangeText={(text) => setProfileData({...profileData, phone: text})}
                  placeholder="Enter your phone number"
                  placeholderTextColor="#9ca3af"
                  keyboardType="phone-pad"
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={[styles.inputLabel, isDark && styles.inputLabelDark]}>Monthly Income</Text>
                <TextInput
                  style={[styles.modalInput, isDark && styles.modalInputDark]}
                  value={profileData.monthlyIncome}
                  onChangeText={(text) => setProfileData({...profileData, monthlyIncome: text})}
                  placeholder="Enter your monthly income"
                  placeholderTextColor="#9ca3af"
                  keyboardType="numeric"
                />
              </View>
            </ScrollView>
          </View>
        </Modal>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },
  containerDark: {
    backgroundColor: '#111827',
  },
  content: {
    flex: 1,
    padding: 20,
  },
  profileCard: {
    marginBottom: 20,
  },
  profileContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#3b82f6',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  avatarDark: {
    backgroundColor: '#60a5fa',
  },
  profileInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 4,
  },
  userNameDark: {
    color: '#ffffff',
  },
  userEmail: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 2,
  },
  userEmailDark: {
    color: '#9ca3af',
  },
  userPhone: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 2,
  },
  userPhoneDark: {
    color: '#9ca3af',
  },
  userIncome: {
    fontSize: 14,
    color: '#059669',
    fontWeight: '500',
  },
  userIncomeDark: {
    color: '#10b981',
  },
  editButton: {
    padding: 12,
    borderRadius: 20,
    backgroundColor: '#f3f4f6',
  },
  editButtonDark: {
    backgroundColor: '#374151',
  },
  quickActionsCard: {
    marginBottom: 20,
  },
  quickActionsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  quickAction: {
    flex: 1,
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#f9fafb',
    borderRadius: 12,
    marginHorizontal: 4,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  quickActionDark: {
    backgroundColor: '#374151',
    borderColor: '#4b5563',
  },
  quickActionIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f3f4f6',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  quickActionIconDark: {
    backgroundColor: '#4b5563',
  },
  quickActionText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#374151',
    textAlign: 'center',
  },
  quickActionTextDark: {
    color: '#d1d5db',
  },
  sectionCard: {
    marginBottom: 20,
  },
  settingsItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  settingsItemDark: {
    borderBottomColor: '#374151',
  },
  settingsIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f3f4f6',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  settingsIconDark: {
    backgroundColor: '#374151',
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
  settingsTitleDark: {
    color: '#ffffff',
  },
  settingsSubtitle: {
    fontSize: 14,
    color: '#6b7280',
  },
  settingsSubtitleDark: {
    color: '#9ca3af',
  },
  toggle: {
    width: 44,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#e5e7eb',
    justifyContent: 'center',
    paddingHorizontal: 2,
  },
  toggleActive: {
    backgroundColor: '#3b82f6',
  },
  toggleThumb: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#ffffff',
    alignSelf: 'flex-start',
  },
  toggleThumbActive: {
    alignSelf: 'flex-end',
  },
  logoutCard: {
    marginBottom: 20,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    backgroundColor: '#fef2f2',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#fecaca',
  },
  logoutButtonDark: {
    backgroundColor: '#7f1d1d',
    borderColor: '#991b1b',
  },
  logoutText: {
    color: '#ef4444',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  logoutTextDark: {
    color: '#fca5a5',
  },
  versionContainer: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  versionText: {
    fontSize: 14,
    color: '#9ca3af',
  },
  versionTextDark: {
    color: '#6b7280',
  },
  modalContainer: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },
  modalContainerDark: {
    backgroundColor: '#111827',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    paddingTop: 60,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  modalHeaderDark: {
    backgroundColor: '#1f2937',
    borderBottomColor: '#374151',
  },
  modalCancel: {
    fontSize: 16,
    color: '#6b7280',
  },
  modalCancelDark: {
    color: '#9ca3af',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1f2937',
  },
  modalTitleDark: {
    color: '#ffffff',
  },
  modalSave: {
    fontSize: 16,
    color: '#3b82f6',
    fontWeight: '600',
  },
  modalSaveDark: {
    color: '#60a5fa',
  },
  modalContent: {
    flex: 1,
    padding: 20,
  },
  inputGroup: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: '500',
    color: '#374151',
    marginBottom: 8,
  },
  inputLabelDark: {
    color: '#d1d5db',
  },
  modalInput: {
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    backgroundColor: '#ffffff',
  },
  modalInputDark: {
    borderColor: '#4b5563',
    backgroundColor: '#374151',
    color: '#ffffff',
  },
});