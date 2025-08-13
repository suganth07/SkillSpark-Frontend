import React, { useEffect } from "react";
import { View } from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  Easing,
} from "react-native-reanimated";
import Icon from "~/lib/icons/Icon";

interface SpinnerProps {
  size?: number;
  color?: string;
}

export const Spinner = ({ size = 36, color = "#4f46e5" }: SpinnerProps) => {
  const rotation = useSharedValue(0);

  useEffect(() => {
    rotation.value = 0;
    rotation.value = withRepeat(
      withTiming(1, {
        duration: 1000,
        easing: Easing.linear,
      }),
      -1,
      false
    );
  }, []);

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [
        {
          rotate: `${rotation.value * 360}deg`,
        },
      ],
    };
  });

  return (
    <View className="items-center justify-center">
      <Animated.View style={animatedStyle}>
        <Icon name="Loader" size={size} color={color} />
      </Animated.View>
    </View>
  );
};
