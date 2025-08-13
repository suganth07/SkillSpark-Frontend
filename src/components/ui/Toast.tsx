import React, { useEffect } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSpring,
  runOnJS,
} from 'react-native-reanimated';
import Icon from '~/lib/icons/Icon';
import { useColorScheme } from '~/lib/utils/useColorScheme';

interface ToastProps {
  visible: boolean;
  message: string;
  type?: 'success' | 'error' | 'info';
  duration?: number;
  onHide: () => void;
}

const Toast: React.FC<ToastProps> = ({
  visible,
  message,
  type = 'success',
  duration = 3000,
  onHide,
}) => {
  const { isDarkColorScheme } = useColorScheme();
  const translateY = useSharedValue(-100);
  const opacity = useSharedValue(0);

  useEffect(() => {
    if (visible) {
      // Show toast
      translateY.value = withSpring(0, { damping: 15, stiffness: 150 });
      opacity.value = withTiming(1, { duration: 300 });

      // Auto hide after duration
      const timer = setTimeout(() => {
        hideToast();
      }, duration);

      return () => clearTimeout(timer);
    } else {
      hideToast();
    }
  }, [visible]);

  const hideToast = () => {
    translateY.value = withTiming(-100, { duration: 300 });
    opacity.value = withTiming(0, { duration: 300 }, () => {
      runOnJS(onHide)();
    });
  };

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
    opacity: opacity.value,
  }));

  const getToastColors = () => {
    switch (type) {
      case 'success':
        return {
          bg: isDarkColorScheme ? '#065f46' : '#d1fae5',
          border: isDarkColorScheme ? '#059669' : '#10b981',
          text: isDarkColorScheme ? '#d1fae5' : '#065f46',
          icon: isDarkColorScheme ? '#34d399' : '#059669',
        };
      case 'error':
        return {
          bg: isDarkColorScheme ? '#7f1d1d' : '#fee2e2',
          border: isDarkColorScheme ? '#dc2626' : '#ef4444',
          text: isDarkColorScheme ? '#fecaca' : '#7f1d1d',
          icon: isDarkColorScheme ? '#f87171' : '#dc2626',
        };
      case 'info':
        return {
          bg: isDarkColorScheme ? '#1e3a8a' : '#dbeafe',
          border: isDarkColorScheme ? '#2563eb' : '#3b82f6',
          text: isDarkColorScheme ? '#bfdbfe' : '#1e3a8a',
          icon: isDarkColorScheme ? '#60a5fa' : '#2563eb',
        };
      default:
        return {
          bg: isDarkColorScheme ? '#065f46' : '#d1fae5',
          border: isDarkColorScheme ? '#059669' : '#10b981',
          text: isDarkColorScheme ? '#d1fae5' : '#065f46',
          icon: isDarkColorScheme ? '#34d399' : '#059669',
        };
    }
  };

  const getIconName = () => {
    switch (type) {
      case 'success':
        return 'Check';
      case 'error':
        return 'X';
      case 'info':
        return 'Info';
      default:
        return 'Check';
    }
  };

  const colors = getToastColors();

  if (!visible) return null;

  return (
    <View style={{
      position: 'absolute',
      top: 60,
      left: 16,
      right: 16,
      zIndex: 1000,
    }}>
      <Animated.View
        style={[
          animatedStyle,
          {
            backgroundColor: colors.bg,
            borderLeftWidth: 4,
            borderLeftColor: colors.border,
            borderRadius: 12,
            padding: 16,
            shadowColor: '#000',
            shadowOffset: {
              width: 0,
              height: 2,
            },
            shadowOpacity: 0.25,
            shadowRadius: 3.84,
            elevation: 5,
          },
        ]}
      >
        <View style={{
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}>
          <View style={{
            flexDirection: 'row',
            alignItems: 'center',
            flex: 1,
          }}>
            <Icon
              name={getIconName() as any}
              size={20}
              color={colors.icon}
            />
            <Text
              style={{
                color: colors.text,
                fontSize: 16,
                fontWeight: '500',
                marginLeft: 12,
                flex: 1,
              }}
              numberOfLines={2}
            >
              {message}
            </Text>
          </View>
          
          <TouchableOpacity
            onPress={hideToast}
            style={{
              marginLeft: 12,
              padding: 4,
            }}
          >
            <Icon
              name="X"
              size={16}
              color={colors.text}
            />
          </TouchableOpacity>
        </View>
      </Animated.View>
    </View>
  );
};

export default Toast;
