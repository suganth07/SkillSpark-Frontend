import React, { useState, useEffect } from "react";
import { View, Text, TextInput, TouchableOpacity } from "react-native";
import { Card } from "~/components/ui/card";
import Icon from "~/lib/icons/Icon";
import { useColorScheme } from "~/lib/utils/useColorScheme";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSpring,
} from "react-native-reanimated";

interface SearchBarProps {
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
}

export default function SearchBar({
  value,
  onChangeText,
  placeholder = "Search learning topics...",
}: SearchBarProps) {
  const { isDarkColorScheme } = useColorScheme();
  const [isFocused, setIsFocused] = useState(false);

  const focusScale = useSharedValue(1);
  const focusBorder = useSharedValue(0);
  const containerScale = useSharedValue(0.95);
  const opacity = useSharedValue(0);

  useEffect(() => {
    const timer = setTimeout(() => {
      containerScale.value = withSpring(1, { damping: 15, stiffness: 150 });
      opacity.value = withTiming(1, { duration: 500 });
    }, 100);

    return () => clearTimeout(timer);
  }, []);

  const handleFocus = () => {
    setIsFocused(true);
    focusScale.value = withSpring(1.02);
    focusBorder.value = withTiming(1, { duration: 200 });
  };

  const handleBlur = () => {
    setIsFocused(false);
    focusScale.value = withSpring(1);
    focusBorder.value = withTiming(0, { duration: 200 });
  };

  const containerStyle = useAnimatedStyle(() => ({
    transform: [{ scale: containerScale.value * focusScale.value }],
    opacity: opacity.value,
  }));

  const inputStyle = useAnimatedStyle(() => {
    const focusedBorderColor = isDarkColorScheme ? "#6366f1" : "#4f46e5";
    const unfocusedBorderColor = isDarkColorScheme ? "#374151" : "#e5e7eb";

    return {
      borderWidth: withTiming(focusBorder.value > 0 ? 2 : 1, { duration: 200 }),
      borderColor: withTiming(
        focusBorder.value > 0 ? focusedBorderColor : unfocusedBorderColor,
        { duration: 200 }
      ),
    };
  });

  return (
    <Animated.View style={containerStyle} className="mx-3 mb-6">
      <Card className="bg-card border-0 m-4">
        <Animated.View
          style={[
            inputStyle,
            {
              borderRadius: 12,
              backgroundColor: isDarkColorScheme ? "#1f2937" : "#ffffff",
            },
          ]}
        >
          <View className="flex-row items-center px-4 py-3">
            <Icon
              name="Search"
              size={20}
              color={isFocused ? "#6366f1" : "#9ca3af"}
            />
            <TextInput
              value={value}
              onChangeText={onChangeText}
              placeholder={placeholder}
              placeholderTextColor={isDarkColorScheme ? "#9CA3AF" : "#6B7280"}
              onFocus={handleFocus}
              onBlur={handleBlur}
              style={{
                flex: 1,
                marginLeft: 12,
                fontSize: 16,
                color: isDarkColorScheme ? "#f9fafb" : "#374151",
              }}
            />
            {value.length > 0 && (
              <TouchableOpacity onPress={() => onChangeText("")}>
                <Icon name="X" size={16} color="#9ca3af" />
              </TouchableOpacity>
            )}
          </View>
        </Animated.View>
      </Card>
    </Animated.View>
  );
}
