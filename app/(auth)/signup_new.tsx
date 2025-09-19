import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert, ScrollView, KeyboardAvoidingView, Platform, StatusBar } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { useAuth } from '@/contexts/AuthContext';
import { useTheme } from '@/contexts/ThemeContext';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';

export default function SignUpScreen() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [currency, setCurrency] = useState('USD');
  const [monthlyIncome, setMonthlyIncome] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const { signUp } = useAuth();
  const { colors, typography, spacing, shadows } = useTheme();
  const insets = useSafeAreaInsets();

  const handleSignUp = async () => {
    if (!name || !email || !password || !confirmPassword || !phone) {
      Alert.alert('Error', 'Please fill in all required fields');
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert('Error', 'Passwords do not match');
      return;
    }

    if (password.length < 6) {
      Alert.alert('Error', 'Password must be at least 6 characters');
      return;
    }

    // Basic phone validation
    const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/;
    if (!phoneRegex.test(phone.replace(/\s/g, ''))) {
      Alert.alert('Error', 'Please enter a valid phone number');
      return;
    }

    setLoading(true);
    try {
      const userData = {
        name,
        email,
        phone,
        currency,
        monthlyIncome: monthlyIncome ? parseFloat(monthlyIncome) : 0,
        createdAt: new Date(),
      };
      
      await signUp(email, password, userData);
      router.replace('/(tabs)');
    } catch (error: any) {
      Alert.alert('Error', error.message);
    } finally {
      setLoading(false);
    }
  };

  const currencies = [
    { label: 'USD - US Dollar', value: 'USD' },
    { label: 'EUR - Euro', value: 'EUR' },
    { label: 'GBP - British Pound', value: 'GBP' },
    { label: 'INR - Indian Rupee', value: 'INR' },
    { label: 'CAD - Canadian Dollar', value: 'CAD' },
    { label: 'AUD - Australian Dollar', value: 'AUD' },
    { label: 'JPY - Japanese Yen', value: 'JPY' },
  ];

  const InputField = ({ 
    label, 
    value, 
    onChangeText, 
    placeholder, 
    icon, 
    isPassword = false, 
    showPassword: showPwd = false, 
    onTogglePassword,
    keyboardType = 'default',
    autoCapitalize = 'sentences'
  }: any) => (
    <View style={{ marginBottom: spacing[5] }}>
      <Text style={{
        fontSize: typography.sizes.sm,
        fontWeight: typography.fontWeights.medium as any,
        color: colors.text.secondary,
        marginBottom: spacing[2],
      }}>
        {label}
      </Text>
      <View style={{
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: colors.background.secondary,
        borderRadius: 12,
        borderWidth: 2,
        borderColor: 'transparent',
        paddingHorizontal: spacing[4],
      }}>
        <Ionicons name={icon} size={20} color={colors.text.tertiary} />
        <TextInput
          style={{
            flex: 1,
            paddingVertical: spacing[4],
            paddingLeft: spacing[3],
            fontSize: typography.sizes.base,
            color: colors.text.primary,
          }}
          placeholder={placeholder}
          placeholderTextColor={colors.text.tertiary}
          value={value}
          onChangeText={onChangeText}
          secureTextEntry={isPassword && !showPwd}
          keyboardType={keyboardType}
          autoCapitalize={autoCapitalize}
          autoComplete={isPassword ? 'password' : 'off'}
        />
        {isPassword && (
          <TouchableOpacity
            onPress={onTogglePassword}
            style={{ padding: spacing[1] }}
          >
            <Ionicons 
              name={showPwd ? 'eye-off-outline' : 'eye-outline'} 
              size={20} 
              color={colors.text.tertiary} 
            />
          </TouchableOpacity>
        )}
      </View>
    </View>
  );

  return (
    <>
      <StatusBar barStyle="light-content" />
      <LinearGradient
        colors={[colors.primary, colors.secondary]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={{ flex: 1 }}
      >
        <KeyboardAvoidingView 
          style={{ flex: 1 }}
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
          <ScrollView 
            contentContainerStyle={{ 
              flexGrow: 1,
              paddingTop: insets.top + 40,
              paddingBottom: insets.bottom + 20,
              paddingHorizontal: spacing[6],
            }}
            showsVerticalScrollIndicator={false}
          >
            {/* Header Section */}
            <View style={{ alignItems: 'center', marginBottom: spacing[8] }}>
              <TouchableOpacity
                onPress={() => router.back()}
                style={{
                  position: 'absolute',
                  left: 0,
                  top: 0,
                  padding: spacing[2],
                  backgroundColor: 'rgba(255, 255, 255, 0.2)',
                  borderRadius: 8,
                }}
              >
                <Ionicons name="arrow-back" size={24} color={colors.text.inverse} />
              </TouchableOpacity>
              
              <View style={{
                width: 60,
                height: 60,
                borderRadius: 30,
                backgroundColor: 'rgba(255, 255, 255, 0.2)',
                justifyContent: 'center',
                alignItems: 'center',
                marginBottom: spacing[4],
              }}>
                <Ionicons name="person-add" size={30} color={colors.text.inverse} />
              </View>
              
              <Text style={{
                fontSize: typography.sizes['3xl'],
                fontWeight: typography.fontWeights.bold as any,
                color: colors.text.inverse,
                marginBottom: spacing[2],
                textAlign: 'center',
              }}>
                Create Account
              </Text>
              
              <Text style={{
                fontSize: typography.sizes.base,
                color: colors.text.inverse,
                opacity: 0.9,
                textAlign: 'center',
                lineHeight: typography.lineHeights.relaxed * typography.sizes.base,
              }}>
                Join BudgetNest and take control of your finances
              </Text>
            </View>

            {/* Form Card */}
            <View style={{
              backgroundColor: colors.background.card,
              borderRadius: 24,
              padding: spacing[6],
              ...shadows.xl,
            }}>
              {/* Personal Information Section */}
              <View style={{ marginBottom: spacing[6] }}>
                <Text style={{
                  fontSize: typography.sizes.lg,
                  fontWeight: typography.fontWeights.semibold as any,
                  color: colors.text.primary,
                  marginBottom: spacing[4],
                }}>
                  Personal Information
                </Text>

                <InputField
                  label="Full Name *"
                  value={name}
                  onChangeText={setName}
                  placeholder="Enter your full name"
                  icon="person-outline"
                />

                <InputField
                  label="Email Address *"
                  value={email}
                  onChangeText={setEmail}
                  placeholder="Enter your email"
                  icon="mail-outline"
                  keyboardType="email-address"
                  autoCapitalize="none"
                />

                <InputField
                  label="Phone Number *"
                  value={phone}
                  onChangeText={setPhone}
                  placeholder="Enter your phone number"
                  icon="call-outline"
                  keyboardType="phone-pad"
                />
              </View>

              {/* Financial Preferences Section */}
              <View style={{ marginBottom: spacing[6] }}>
                <Text style={{
                  fontSize: typography.sizes.lg,
                  fontWeight: typography.fontWeights.semibold as any,
                  color: colors.text.primary,
                  marginBottom: spacing[4],
                }}>
                  Financial Preferences
                </Text>

                <View style={{ marginBottom: spacing[5] }}>
                  <Text style={{
                    fontSize: typography.sizes.sm,
                    fontWeight: typography.fontWeights.medium as any,
                    color: colors.text.secondary,
                    marginBottom: spacing[2],
                  }}>
                    Currency
                  </Text>
                  <View style={{
                    backgroundColor: colors.background.secondary,
                    borderRadius: 12,
                    borderWidth: 2,
                    borderColor: 'transparent',
                    paddingHorizontal: spacing[4],
                  }}>
                    <Picker
                      selectedValue={currency}
                      onValueChange={setCurrency}
                      style={{
                        color: colors.text.primary,
                        backgroundColor: 'transparent',
                      }}
                    >
                      {currencies.map((curr) => (
                        <Picker.Item key={curr.value} label={curr.label} value={curr.value} />
                      ))}
                    </Picker>
                  </View>
                </View>

                <InputField
                  label="Monthly Income (Optional)"
                  value={monthlyIncome}
                  onChangeText={setMonthlyIncome}
                  placeholder="Enter your monthly income"
                  icon="cash-outline"
                  keyboardType="numeric"
                />
              </View>

              {/* Security Section */}
              <View style={{ marginBottom: spacing[6] }}>
                <Text style={{
                  fontSize: typography.sizes.lg,
                  fontWeight: typography.fontWeights.semibold as any,
                  color: colors.text.primary,
                  marginBottom: spacing[4],
                }}>
                  Account Security
                </Text>

                <InputField
                  label="Password *"
                  value={password}
                  onChangeText={setPassword}
                  placeholder="Create a strong password"
                  icon="lock-closed-outline"
                  isPassword={true}
                  showPassword={showPassword}
                  onTogglePassword={() => setShowPassword(!showPassword)}
                />

                <InputField
                  label="Confirm Password *"
                  value={confirmPassword}
                  onChangeText={setConfirmPassword}
                  placeholder="Confirm your password"
                  icon="lock-closed-outline"
                  isPassword={true}
                  showPassword={showConfirmPassword}
                  onTogglePassword={() => setShowConfirmPassword(!showConfirmPassword)}
                />
              </View>

              {/* Password Requirements */}
              <View style={{
                backgroundColor: colors.background.secondary,
                borderRadius: 12,
                padding: spacing[4],
                marginBottom: spacing[6],
              }}>
                <Text style={{
                  fontSize: typography.sizes.sm,
                  fontWeight: typography.fontWeights.medium as any,
                  color: colors.text.secondary,
                  marginBottom: spacing[2],
                }}>
                  Password Requirements:
                </Text>
                <Text style={{
                  fontSize: typography.sizes.xs,
                  color: colors.text.tertiary,
                  lineHeight: typography.lineHeights.relaxed * typography.sizes.xs,
                }}>
                  • At least 6 characters long{'\n'}
                  • Include uppercase and lowercase letters{'\n'}
                  • Include numbers and special characters
                </Text>
              </View>

              {/* Create Account Button */}
              <TouchableOpacity
                style={{
                  backgroundColor: loading ? colors.text.tertiary : colors.primary,
                  borderRadius: 12,
                  paddingVertical: spacing[4],
                  marginBottom: spacing[4],
                  ...shadows.md,
                }}
                onPress={handleSignUp}
                disabled={loading}
                activeOpacity={0.8}
              >
                <View style={{
                  flexDirection: 'row',
                  justifyContent: 'center',
                  alignItems: 'center',
                }}>
                  {loading && (
                    <View style={{
                      width: 20,
                      height: 20,
                      borderRadius: 10,
                      borderWidth: 2,
                      borderColor: colors.text.inverse,
                      borderTopColor: 'transparent',
                      marginRight: spacing[2],
                    }} />
                  )}
                  <Text style={{
                    color: colors.text.inverse,
                    fontSize: typography.sizes.lg,
                    fontWeight: typography.fontWeights.semibold as any,
                  }}>
                    {loading ? 'Creating Account...' : 'Create Account'}
                  </Text>
                </View>
              </TouchableOpacity>

              {/* Sign In Link */}
              <TouchableOpacity
                onPress={() => router.push('/(auth)/signin')}
                style={{ alignItems: 'center' }}
              >
                <Text style={{
                  fontSize: typography.sizes.base,
                  color: colors.text.secondary,
                }}>
                  Already have an account?{' '}
                  <Text style={{
                    color: colors.primary,
                    fontWeight: typography.fontWeights.semibold as any,
                  }}>
                    Sign In
                  </Text>
                </Text>
              </TouchableOpacity>
            </View>

            {/* Footer */}
            <View style={{
              alignItems: 'center',
              marginTop: spacing[6],
            }}>
              <Text style={{
                fontSize: typography.sizes.xs,
                color: colors.text.inverse,
                opacity: 0.7,
                textAlign: 'center',
                lineHeight: typography.lineHeights.relaxed * typography.sizes.xs,
              }}>
                By creating an account, you agree to our{'\n'}
                Terms of Service and Privacy Policy
              </Text>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </LinearGradient>
    </>
  );
}