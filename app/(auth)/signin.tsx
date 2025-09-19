import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert, StatusBar, KeyboardAvoidingView, Platform, ScrollView, Dimensions } from 'react-native';
import { useAuth } from '@/contexts/AuthContext';
import { useTheme } from '@/contexts/ThemeContext';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';

const { width, height } = Dimensions.get('window');

export default function SignInScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const { signIn } = useAuth();
  const { colors, typography, spacing, shadows } = useTheme();
  const insets = useSafeAreaInsets();

  const handleSignIn = async () => {
    if (!email || !password) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    setLoading(true);
    try {
      await signIn(email, password);
      router.replace('/(tabs)');
    } catch (error: any) {
      console.error('Error in signIn:', error);
      let errorMessage = 'Sign in failed. Please try again.';
      
      if (error.code === 'auth/invalid-credential') {
        errorMessage = 'Invalid email or password. Please check your credentials.';
      } else if (error.code === 'auth/user-not-found') {
        errorMessage = 'No account found with this email. Please sign up first.';
      } else if (error.code === 'auth/wrong-password') {
        errorMessage = 'Incorrect password. Please try again.';
      } else if (error.code === 'auth/too-many-requests') {
        errorMessage = 'Too many failed attempts. Please try again later.';
      }
      
      Alert.alert('Sign In Error', errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleDemoAccount = () => {
    setEmail('demo@budgetnest.com');
    setPassword('demo123');
  };

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
              paddingTop: insets.top + 60,
              paddingBottom: insets.bottom + 20,
              paddingHorizontal: spacing[6],
            }}
            showsVerticalScrollIndicator={false}
          >
            {/* Header Section */}
            <View style={{ alignItems: 'center', marginBottom: spacing[12] }}>
              <View style={{
                width: 80,
                height: 80,
                borderRadius: 40,
                backgroundColor: 'rgba(255, 255, 255, 0.2)',
                justifyContent: 'center',
                alignItems: 'center',
                marginBottom: spacing[6],
              }}>
                <Ionicons name="wallet" size={40} color={colors.text.inverse} />
              </View>
              
              <Text style={{
                fontSize: typography.sizes['4xl'],
                fontWeight: typography.fontWeights.bold as any,
                color: colors.text.inverse,
                marginBottom: spacing[2],
                textAlign: 'center',
              }}>
                Welcome Back
              </Text>
              
              <Text style={{
                fontSize: typography.sizes.lg,
                color: colors.text.inverse,
                opacity: 0.9,
                textAlign: 'center',
                lineHeight: typography.lineHeights.relaxed * typography.sizes.lg,
              }}>
                Sign in to continue managing your finances
              </Text>
            </View>

            {/* Form Card */}
            <View style={{
              backgroundColor: colors.background.card,
              borderRadius: 24,
              padding: spacing[6],
              ...shadows.xl,
            }}>
              {/* Email Input */}
              <View style={{ marginBottom: spacing[5] }}>
                <Text style={{
                  fontSize: typography.sizes.sm,
                  fontWeight: typography.fontWeights.medium as any,
                  color: colors.text.secondary,
                  marginBottom: spacing[2],
                }}>
                  Email Address
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
                  <Ionicons name="mail-outline" size={20} color={colors.text.tertiary} />
                  <TextInput
                    style={{
                      flex: 1,
                      paddingVertical: spacing[4],
                      paddingLeft: spacing[3],
                      fontSize: typography.sizes.base,
                      color: colors.text.primary,
                    }}
                    placeholder="Enter your email"
                    placeholderTextColor={colors.text.tertiary}
                    value={email}
                    onChangeText={setEmail}
                    keyboardType="email-address"
                    autoCapitalize="none"
                    autoComplete="email"
                  />
                </View>
              </View>

              {/* Password Input */}
              <View style={{ marginBottom: spacing[6] }}>
                <Text style={{
                  fontSize: typography.sizes.sm,
                  fontWeight: typography.fontWeights.medium as any,
                  color: colors.text.secondary,
                  marginBottom: spacing[2],
                }}>
                  Password
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
                  <Ionicons name="lock-closed-outline" size={20} color={colors.text.tertiary} />
                  <TextInput
                    style={{
                      flex: 1,
                      paddingVertical: spacing[4],
                      paddingLeft: spacing[3],
                      fontSize: typography.sizes.base,
                      color: colors.text.primary,
                    }}
                    placeholder="Enter your password"
                    placeholderTextColor={colors.text.tertiary}
                    value={password}
                    onChangeText={setPassword}
                    secureTextEntry={!showPassword}
                    autoComplete="password"
                  />
                  <TouchableOpacity
                    onPress={() => setShowPassword(!showPassword)}
                    style={{ padding: spacing[1] }}
                  >
                    <Ionicons 
                      name={showPassword ? 'eye-off-outline' : 'eye-outline'} 
                      size={20} 
                      color={colors.text.tertiary} 
                    />
                  </TouchableOpacity>
                </View>
              </View>

              {/* Sign In Button */}
              <TouchableOpacity
                style={{
                  backgroundColor: loading ? colors.text.tertiary : colors.primary,
                  borderRadius: 12,
                  paddingVertical: spacing[4],
                  marginBottom: spacing[4],
                  ...shadows.md,
                }}
                onPress={handleSignIn}
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
                    {loading ? 'Signing In...' : 'Sign In'}
                  </Text>
                </View>
              </TouchableOpacity>

              {/* Demo Account Section */}
              <View style={{
                backgroundColor: colors.background.secondary,
                borderRadius: 12,
                padding: spacing[4],
                marginBottom: spacing[4],
              }}>
                <View style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: spacing[3],
                }}>
                  <Ionicons name="information-circle-outline" size={20} color={colors.text.secondary} />
                  <Text style={{
                    fontSize: typography.sizes.sm,
                    color: colors.text.secondary,
                    marginLeft: spacing[2],
                    fontWeight: typography.fontWeights.medium as any,
                  }}>
                    Demo Account Available
                  </Text>
                </View>
                <TouchableOpacity
                  style={{
                    backgroundColor: colors.background.card,
                    borderRadius: 8,
                    paddingVertical: spacing[3],
                    borderWidth: 1,
                    borderColor: colors.border,
                  }}
                  onPress={handleDemoAccount}
                  activeOpacity={0.7}
                >
                  <Text style={{
                    color: colors.text.primary,
                    fontSize: typography.sizes.sm,
                    fontWeight: typography.fontWeights.medium as any,
                    textAlign: 'center',
                  }}>
                    Use Demo Credentials
                  </Text>
                </TouchableOpacity>
              </View>

              {/* Sign Up Link */}
              <TouchableOpacity
                onPress={() => router.push('/(auth)/signup')}
                style={{ alignItems: 'center' }}
              >
                <Text style={{
                  fontSize: typography.sizes.base,
                  color: colors.text.secondary,
                }}>
                  Don't have an account?{' '}
                  <Text style={{
                    color: colors.primary,
                    fontWeight: typography.fontWeights.semibold as any,
                  }}>
                    Sign Up
                  </Text>
                </Text>
              </TouchableOpacity>
            </View>

            {/* Footer */}
            <View style={{
              alignItems: 'center',
              marginTop: spacing[8],
            }}>
              <Text style={{
                fontSize: typography.sizes.xs,
                color: colors.text.inverse,
                opacity: 0.7,
                textAlign: 'center',
                lineHeight: typography.lineHeights.relaxed * typography.sizes.xs,
              }}>
                By signing in, you agree to our Terms of Service and Privacy Policy
              </Text>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </LinearGradient>
    </>
  );
}
