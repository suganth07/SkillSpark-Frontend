import React from "react";
import { View, Text } from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  Easing,
} from "react-native-reanimated";
import { useEffect } from "react";
import { useAuth } from "~/lib/utils/AuthContext";

export default function HeroSection() {
  const { user } = useAuth();
  const opacity = useSharedValue(0);
  const translateY = useSharedValue(30);
  const scale = useSharedValue(0.95);

  useEffect(() => {
    opacity.value = withTiming(1, {
      duration: 800,
      easing: Easing.out(Easing.quad),
    });
    translateY.value = withTiming(0, {
      duration: 800,
      easing: Easing.out(Easing.quad),
    });
    scale.value = withTiming(1, {
      duration: 800,
      easing: Easing.out(Easing.quad),
    });
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ translateY: translateY.value }, { scale: scale.value }],
  }));

  const getUserName = () => {
    if (user?.username) return user.username;
    return 'there';
  };

  return (
    <Animated.View style={animatedStyle} className="px-3 pt-8 pb-6">
      <View className="m-4">
        <Text className="text-5xl font-bold text-foreground mt-5 mb-3">
          Hello {getUserName()},{"\n"}
          welcome to <Text className="text-indigo-500 font-bold">SkillSpark</Text>
        </Text>

        <Text className="text-lg text-muted-foreground leading-relaxed mb-6">
          Your personalized learning companion. Generate custom roadmaps, track
          your progress, and master any skill with curated content.
        </Text>
      </View>
    </Animated.View>
  );
}
