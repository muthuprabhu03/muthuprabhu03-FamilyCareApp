import React, { useState } from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { useRouter } from 'expo-router';
import { authService } from '@/services/authService';
import { AppIcon } from '@/components/ui/AppIcon';
import { Radius, Shadows, Spacing } from '@/constants/theme';
import { ThemedText } from '@/components/themed-text';

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const router = useRouter();

  const handleLogin = async () => {
    setErrorMsg('');

    if (!email || !password) {
      setErrorMsg('Please enter your email and password.');
      return;
    }

    setIsLoading(true);

    try {
      await authService.login({ email, password });
      // On success, navigate to dashboard
      router.replace('/(app)' as any);
    } catch (error) {
      if (error instanceof Error) {
        setErrorMsg(error.message);
      } else {
        setErrorMsg('An unexpected error occurred.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <View style={[styles.card, Shadows.strong]}>
        {/* Brand Icon Header */}
        <View style={styles.brandIconBox}>
          <AppIcon name="house.fill" tintColor="#ffffff" size={32} />
        </View>

        <Text style={styles.title}>FamilyCare</Text>

        <Text style={styles.subtitle}>Welcome back</Text>

        <Text style={styles.description}>
          Sign in to manage your family's health, tasks, and finances
        </Text>

        {errorMsg ? (
          <View style={styles.errorContainer}>
            <AppIcon name="exclamationmark.triangle.fill" tintColor="#dc2626" size={16} />
            <Text style={styles.errorText}>{errorMsg}</Text>
          </View>
        ) : null}

        {/* Email Field */}
        <View style={styles.inputContainer}>
          <Text style={styles.label}>Email Address</Text>
          <View style={styles.inputWrapper}>
            <View style={styles.inputIcon}>
              <AppIcon name="person.fill" tintColor="#94a3b8" size={18} />
            </View>
            <TextInput
              style={styles.input}
              placeholder="Enter your email"
              placeholderTextColor="#94a3b8"
              value={email}
              onChangeText={(text) => {
                setEmail(text);
                setErrorMsg('');
              }}
              keyboardType="email-address"
              autoCapitalize="none"
              editable={!isLoading}
            />
          </View>
        </View>

        {/* Password Field */}
        <View style={styles.inputContainer}>
          <Text style={styles.label}>Password</Text>
          <View style={styles.inputWrapper}>
            <View style={styles.inputIcon}>
              <AppIcon name="shield.fill" tintColor="#94a3b8" size={18} />
            </View>
            <TextInput
              style={styles.input}
              placeholder="Enter your password"
              placeholderTextColor="#94a3b8"
              value={password}
              onChangeText={(text) => {
                setPassword(text);
                setErrorMsg('');
              }}
              secureTextEntry={!showPassword}
              editable={!isLoading}
            />
            <TouchableOpacity
              onPress={() => setShowPassword(!showPassword)}
              style={styles.showHideButton}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <Text style={styles.showHideText}>{showPassword ? 'Hide' : 'Show'}</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Login CTA Button */}
        <TouchableOpacity
          style={[
            styles.loginButton,
            Shadows.glowPrimary,
            isLoading && styles.loginButtonDisabled,
          ]}
          onPress={handleLogin}
          disabled={isLoading}
          activeOpacity={0.85}
        >
          {isLoading ? (
            <ActivityIndicator color="#fff" size="small" />
          ) : (
            <Text style={styles.loginButtonText}>Sign In</Text>
          )}
        </TouchableOpacity>

        {/* Demo Tip */}
        <View style={styles.demoTip}>
          <Text style={styles.demoTipText}>
            Demo credentials: admin@familycare.local / Admin@123
          </Text>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0d111d',
    justifyContent: 'center',
    alignItems: 'center',
    padding: Spacing.four,
  },
  card: {
    width: '100%',
    maxWidth: 420,
    backgroundColor: '#151926',
    borderRadius: Radius.xl,
    padding: Spacing.five,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    alignItems: 'center',
  },
  brandIconBox: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#6366f1',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Spacing.three,
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    color: '#ffffff',
    textAlign: 'center',
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#e2e8f0',
    textAlign: 'center',
    marginTop: 4,
  },
  description: {
    fontSize: 13,
    color: '#94a3b8',
    textAlign: 'center',
    marginTop: 6,
    marginBottom: Spacing.four,
    lineHeight: 18,
    maxWidth: 300,
  },
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#7f1d1d33',
    padding: 12,
    borderRadius: Radius.md,
    marginBottom: Spacing.three,
    borderWidth: 1,
    borderColor: '#ef444466',
    width: '100%',
    gap: 8,
  },
  errorText: {
    color: '#f87171',
    fontSize: 13,
    fontWeight: '500',
    flex: 1,
  },
  inputContainer: {
    width: '100%',
    marginBottom: Spacing.three,
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
    color: '#cbd5e1',
    marginBottom: 6,
    letterSpacing: 0.2,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 50,
    borderWidth: 1,
    borderColor: '#272f45',
    borderRadius: Radius.md,
    backgroundColor: '#12151f',
    paddingHorizontal: Spacing.three,
  },
  inputIcon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    height: '100%',
    fontSize: 15,
    color: '#f8fafc',
    paddingVertical: 0,
  },
  showHideButton: {
    padding: 6,
  },
  showHideText: {
    color: '#818cf8',
    fontWeight: '700',
    fontSize: 13,
  },
  loginButton: {
    width: '100%',
    height: 50,
    backgroundColor: '#6366f1',
    borderRadius: Radius.md,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: Spacing.two,
  },
  loginButtonDisabled: {
    backgroundColor: '#4b5563',
    opacity: 0.7,
  },
  loginButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '800',
    letterSpacing: 0.3,
  },
  demoTip: {
    marginTop: Spacing.four,
    paddingTop: Spacing.three,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.06)',
    width: '100%',
    alignItems: 'center',
  },
  demoTipText: {
    color: '#64748b',
    fontSize: 11,
    textAlign: 'center',
  },
});
