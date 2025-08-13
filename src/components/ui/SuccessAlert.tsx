import React, { useEffect } from "react";
import { View, Text, Modal, TouchableWithoutFeedback } from "react-native";
import { Card } from "~/components/ui/card";
import { Button } from "~/components/ui/button";
import Icon from "~/lib/icons/Icon";
import { useColorScheme } from "~/lib/utils/useColorScheme";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSpring,
  withSequence,
  Easing,
  runOnJS,
} from "react-native-reanimated";

interface SuccessAlertProps {
  visible: boolean;
  title: string;
  message: string;
  onDismiss: () => void;
  buttonText?: string;
}

export default function SuccessAlert({
  visible,
  title,
  message,
  onDismiss,
  buttonText = "OK",
}: SuccessAlertProps) {
  const { isDarkColorScheme } = useColorScheme();

  const overlayOpacity = useSharedValue(0);
  const modalScale = useSharedValue(0.8);
  const modalOpacity = useSharedValue(0);
  const checkScale = useSharedValue(0);
  const checkRotation = useSharedValue(-90);

  useEffect(() => {
    if (visible) {
      overlayOpacity.value = withTiming(1, { duration: 200 });
      modalScale.value = withSpring(1, { damping: 15, stiffness: 200 });
      modalOpacity.value = withTiming(1, { duration: 200 });

      setTimeout(() => {
        checkScale.value = withSequence(
          withSpring(1.2, { damping: 10, stiffness: 300 }),
          withSpring(1, { damping: 15, stiffness: 200 })
        );
        checkRotation.value = withSpring(0, { damping: 15, stiffness: 200 });
      }, 100);
    } else {
      overlayOpacity.value = withTiming(0, { duration: 150 });
      modalScale.value = withTiming(0.8, { duration: 150 });
      modalOpacity.value = withTiming(0, { duration: 150 });
      checkScale.value = withTiming(0, { duration: 150 });
    }
  }, [visible]);

  const overlayStyle = useAnimatedStyle(() => ({
    opacity: overlayOpacity.value,
  }));

  const modalStyle = useAnimatedStyle(() => ({
    transform: [{ scale: modalScale.value }],
    opacity: modalOpacity.value,
  }));

  const checkStyle = useAnimatedStyle(() => ({
    transform: [
      { scale: checkScale.value },
      { rotate: `${checkRotation.value}deg` },
    ],
  }));

  if (!visible) return null;

  return (
    <Modal
      transparent
      visible={visible}
      animationType="none"
      onRequestClose={onDismiss}
    >
      <TouchableWithoutFeedback onPress={onDismiss}>
        <Animated.View
          style={[
            {
              flex: 1,
              backgroundColor: "rgba(0, 0, 0, 0.6)",
              justifyContent: "center",
              alignItems: "center",
              paddingHorizontal: 24,
            },
            overlayStyle,
          ]}
        >
          <TouchableWithoutFeedback>
            <Animated.View
              style={[modalStyle, { width: "100%", maxWidth: 320 }]}
            >
              <Card className="p-6 bg-card border border-border">
                <View className="items-center">
                  <Animated.View
                    style={[
                      checkStyle,
                      {
                        width: 64,
                        height: 64,
                        borderRadius: 32,
                        backgroundColor: "#22c55e",
                        justifyContent: "center",
                        alignItems: "center",
                        marginBottom: 16,
                      },
                    ]}
                  >
                    <Icon name="Check" size={32} color="#ffffff" />
                  </Animated.View>

                  <Text className="text-xl font-bold text-foreground mb-2 text-center">
                    {title}
                  </Text>

                  <Text className="text-sm text-muted-foreground text-center leading-5 mb-6">
                    {message}
                  </Text>

                  <Button
                    onPress={onDismiss}
                    className="w-full"
                    style={{
                      backgroundColor: "#22c55e",
                      paddingVertical: 12,
                    }}
                  >
                    <Text className="text-white font-semibold text-base">
                      {buttonText}
                    </Text>
                  </Button>
                </View>
              </Card>
            </Animated.View>
          </TouchableWithoutFeedback>
        </Animated.View>
      </TouchableWithoutFeedback>
    </Modal>
  );
}
