import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { Card, CardContent } from '~/components/ui/card';
import { Button } from '~/components/ui/button';
import Icon from '~/lib/icons/Icon';
import Toast from '~/components/ui/Toast';
import { useColorScheme } from '~/lib/utils/useColorScheme';
import { useAuth } from '~/lib/utils/AuthContext';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSpring,
  withSequence,
  Easing,
} from 'react-native-reanimated';

const AnimatedLinearGradient = Animated.createAnimatedComponent(LinearGradient);

export default function LoginScreen() {
  const [isLogin, setIsLogin] = useState(true);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [toastType, setToastType] = useState<'success' | 'error' | 'info'>('success');
  
  const { login, register } = useAuth();
  const { isDarkColorScheme } = useColorScheme();
  const router = useRouter();

  const fadeIn = useSharedValue(0);
  const slideY = useSharedValue(50);
  const cardScale = useSharedValue(0.9);

  React.useEffect(() => {
    fadeIn.value = withTiming(1, {
      duration: 800,
      easing: Easing.out(Easing.quad),
    });
    slideY.value = withTiming(0, {
      duration: 800,
      easing: Easing.out(Easing.quad),
    });
    cardScale.value = withSpring(1, { damping: 15, stiffness: 200 });
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: fadeIn.value,
    transform: [
      { translateY: slideY.value },
      { scale: cardScale.value },
    ],
  }));

  const gradientColors = isDarkColorScheme
    ? ([
        'rgba(99, 102, 241, 0.15)',
        'rgba(168, 85, 247, 0.12)',
        'rgba(236, 72, 153, 0.08)',
        'rgba(59, 130, 246, 0.05)',
        'transparent',
      ] as const)
    : ([
        'rgba(99, 102, 241, 0.03)',
        'rgba(168, 85, 247, 0.02)',
        'rgba(59, 130, 246, 0.02)',
        'rgba(236, 72, 153, 0.01)',
        'transparent',
      ] as const);

  const showToastMessage = (message: string, type: 'success' | 'error' | 'info' = 'success') => {
    setToastMessage(message);
    setToastType(type);
    setShowToast(true);
  };

  const handleSubmit = async () => {
    if (!username.trim() || !password.trim()) {
      showToastMessage('Please fill in all fields', 'error');
      return;
    }

    if (!isLogin && password !== confirmPassword) {
      showToastMessage('Passwords do not match', 'error');
      return;
    }

    setLoading(true);

    try {
      if (isLogin) {
        await login({ username: username.trim(), password });
        showToastMessage(`Welcome back, ${username}!`, 'success');
        // Navigate to home after successful login
        setTimeout(() => {
          router.replace('/(tabs)/');
        }, 1000); // Small delay to show the success message
      } else {
        await register({ username: username.trim(), password });
        showToastMessage(`Account created successfully! Welcome, ${username}!`, 'success');
        // Navigate to home after successful registration
        setTimeout(() => {
          router.replace('/(tabs)/');
        }, 1000); // Small delay to show the success message
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'An error occurred';
      showToastMessage(errorMessage, 'error');
    } finally {
      setLoading(false);
    }
  };

  const toggleMode = () => {
    setIsLogin(!isLogin);
    setUsername('');
    setPassword('');
    setConfirmPassword('');
    
    cardScale.value = withSequence(
      withTiming(0.95, { duration: 100 }),
      withTiming(1, { duration: 100 })
    );
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <View className="flex-1">
        <AnimatedLinearGradient
          colors={gradientColors}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
          }}
        />

        <SafeAreaView className="flex-1 bg-transparent">
          <ScrollView
            className="flex-1"
            contentContainerStyle={{ flexGrow: 1, justifyContent: 'center' }}
            keyboardShouldPersistTaps="handled"
          >
            <View className="px-6 py-8">
              {/* Header */}
              <Animated.View style={animatedStyle} className="items-center mb-8">
                <View className="w-20 h-20 bg-indigo-100 dark:bg-indigo-900 rounded-full items-center justify-center mb-4">
                  <Icon name="User" size={32} color="#6366f1" />
                </View>
                <Text className="text-3xl font-bold text-foreground mb-2">
                  Welcome to SkillSpark
                </Text>
                <Text className="text-lg text-muted-foreground text-center">
                  {isLogin ? 'Sign in to continue your learning journey' : 'Create an account to get started'}
                </Text>
              </Animated.View>

              {/* Form */}
              <Animated.View style={animatedStyle}>
                <Card className="bg-card border border-border">
                  <CardContent className="p-6">
                    <View className="mb-6">
                      <Text className="text-2xl font-bold text-foreground text-center mb-2">
                        {isLogin ? 'Sign In' : 'Create Account'}
                      </Text>
                      <Text className="text-sm text-muted-foreground text-center">
                        {isLogin 
                          ? 'Enter your credentials to access your account' 
                          : 'Fill in your details to create a new account'
                        }
                      </Text>
                    </View>

                    <View className="space-y-4">
                      {/* Username Input */}
                      <View>
                        <Text className="text-sm font-medium text-foreground mb-2">
                          Username
                        </Text>
                        <View 
                          className="flex-row items-center border rounded-xl px-4 py-3"
                          style={{
                            borderColor: isDarkColorScheme ? '#4B5563' : '#D1D5DB',
                            backgroundColor: isDarkColorScheme ? '#1F2937' : '#FFFFFF',
                          }}
                        >
                          <Icon name="User" size={18} color={isDarkColorScheme ? '#9CA3AF' : '#6B7280'} />
                          <TextInput
                            value={username}
                            onChangeText={setUsername}
                            placeholder="Enter your username"
                            placeholderTextColor={isDarkColorScheme ? '#6B7280' : '#9CA3AF'}
                            style={{
                              flex: 1,
                              marginLeft: 12,
                              fontSize: 16,
                              color: isDarkColorScheme ? '#F9FAFB' : '#111827',
                              fontWeight: '500',
                            }}
                            autoCapitalize="none"
                            autoCorrect={false}
                          />
                        </View>
                      </View>

                      {/* Password Input */}
                      <View>
                        <Text className="text-sm font-medium text-foreground mb-2">
                          Password
                        </Text>
                        <View 
                          className="flex-row items-center border rounded-xl px-4 py-3"
                          style={{
                            borderColor: isDarkColorScheme ? '#4B5563' : '#D1D5DB',
                            backgroundColor: isDarkColorScheme ? '#1F2937' : '#FFFFFF',
                          }}
                        >
                          <Icon name="Lock" size={18} color={isDarkColorScheme ? '#9CA3AF' : '#6B7280'} />
                          <TextInput
                            value={password}
                            onChangeText={setPassword}
                            placeholder="Enter your password"
                            placeholderTextColor={isDarkColorScheme ? '#6B7280' : '#9CA3AF'}
                            style={{
                              flex: 1,
                              marginLeft: 12,
                              fontSize: 16,
                              color: isDarkColorScheme ? '#F9FAFB' : '#111827',
                              fontWeight: '500',
                            }}
                            secureTextEntry={!showPassword}
                            autoCapitalize="none"
                            autoCorrect={false}
                          />
                          <TouchableOpacity
                            onPress={() => setShowPassword(!showPassword)}
                            className="ml-2"
                          >
                            <Icon 
                              name={showPassword ? "EyeOff" : "Eye"} 
                              size={18} 
                              color={isDarkColorScheme ? '#9CA3AF' : '#6B7280'} 
                            />
                          </TouchableOpacity>
                        </View>
                      </View>

                      {/* Confirm Password Input (Register only) */}
                      {!isLogin && (
                        <View>
                          <Text className="text-sm font-medium text-foreground mb-2">
                            Confirm Password
                          </Text>
                          <View 
                            className="flex-row items-center border rounded-xl px-4 py-3"
                            style={{
                              borderColor: isDarkColorScheme ? '#4B5563' : '#D1D5DB',
                              backgroundColor: isDarkColorScheme ? '#1F2937' : '#FFFFFF',
                            }}
                          >
                            <Icon name="Lock" size={18} color={isDarkColorScheme ? '#9CA3AF' : '#6B7280'} />
                            <TextInput
                              value={confirmPassword}
                              onChangeText={setConfirmPassword}
                              placeholder="Confirm your password"
                              placeholderTextColor={isDarkColorScheme ? '#6B7280' : '#9CA3AF'}
                              style={{
                                flex: 1,
                                marginLeft: 12,
                                fontSize: 16,
                                color: isDarkColorScheme ? '#F9FAFB' : '#111827',
                                fontWeight: '500',
                              }}
                              secureTextEntry={!showPassword}
                              autoCapitalize="none"
                              autoCorrect={false}
                            />
                          </View>
                        </View>
                      )}
                    </View>

                    {/* Submit Button */}
                    <View className="mt-6">
                      <Button
                        onPress={handleSubmit}
                        disabled={loading}
                        style={{
                          backgroundColor: loading ? '#9CA3AF' : '#4F46E5',
                          paddingVertical: 16,
                          borderRadius: 12,
                        }}
                      >
                        <View className="flex-row items-center justify-center">
                          {loading ? (
                            <Text className="text-white font-semibold text-lg">
                              {isLogin ? 'Signing In...' : 'Creating Account...'}
                            </Text>
                          ) : (
                            <>
                              <Icon name={isLogin ? "LogIn" : "UserPlus"} size={20} color="#ffffff" />
                              <Text className="text-white font-semibold text-lg ml-2">
                                {isLogin ? 'Sign In' : 'Create Account'}
                              </Text>
                            </>
                          )}
                        </View>
                      </Button>
                    </View>

                    {/* Toggle Mode */}
                    <View className="mt-6 pt-4 border-t border-border">
                      <TouchableOpacity
                        onPress={toggleMode}
                        disabled={loading}
                        className="flex-row items-center justify-center"
                      >
                        <Text className="text-muted-foreground">
                          {isLogin ? "Don't have an account? " : "Already have an account? "}
                        </Text>
                        <Text className="text-primary font-semibold">
                          {isLogin ? 'Sign Up' : 'Sign In'}
                        </Text>
                      </TouchableOpacity>
                    </View>
                  </CardContent>
                </Card>
              </Animated.View>
            </View>
          </ScrollView>
        </SafeAreaView>
        
        <Toast
          visible={showToast}
          message={toastMessage}
          type={toastType}
          onHide={() => setShowToast(false)}
        />
      </View>
    </KeyboardAvoidingView>
  );
}
