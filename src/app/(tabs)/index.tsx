import React, { useState, useCallback, useEffect } from "react";
import {
  View,
  ScrollView,
  RefreshControl,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useFocusEffect } from "@react-navigation/native";
import { LinearGradient } from "expo-linear-gradient";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withSequence,
  withTiming,
  Easing,
} from "react-native-reanimated";

import HeroSection from "~/components/home/HeroSection";
import RoadmapGenerator from "~/components/home/RoadmapGenerator";
import ActiveRoadmapDisplay from "~/components/home/ActiveRoadmapDisplay";
import LearningStats from "~/components/home/LearningStats";
import { useColorScheme } from "~/lib/utils/useColorScheme";

const AnimatedLinearGradient = Animated.createAnimatedComponent(LinearGradient);

export default function HomeScreen() {
  const [refreshing, setRefreshing] = useState(false);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const { isDarkColorScheme } = useColorScheme();

  const pulseScale = useSharedValue(1);

  useEffect(() => {
    pulseScale.value = withRepeat(
      withSequence(
        withTiming(1.02, { duration: 3000, easing: Easing.inOut(Easing.quad) }),
        withTiming(1, { duration: 3000, easing: Easing.inOut(Easing.quad) })
      ),
      -1,
      false
    );
  }, []);

  const pulseStyle = useAnimatedStyle(() => ({
    transform: [{ scale: pulseScale.value }],
  }));

  const gradientColors = isDarkColorScheme
    ? ([
        "rgba(99, 102, 241, 0.15)",
        "rgba(168, 85, 247, 0.12)",
        "rgba(236, 72, 153, 0.08)",
        "rgba(59, 130, 246, 0.05)",
        "transparent",
      ] as const)
    : ([
        "rgba(99, 102, 241, 0.03)",
        "rgba(168, 85, 247, 0.02)",
        "rgba(59, 130, 246, 0.02)",
        "rgba(236, 72, 153, 0.01)",
        "transparent",
      ] as const);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    setRefreshTrigger((prev) => prev + 1);

    setTimeout(() => {
      setRefreshing(false);
    }, 1000);
  }, []);

  const handleRoadmapGenerated = () => {
    setRefreshTrigger((prev) => prev + 1);
  };

  const handleProgressUpdate = () => {
    setRefreshTrigger((prev) => prev + 1);
  };

  useFocusEffect(
    useCallback(() => {
      setRefreshTrigger((prev) => prev + 1);
    }, [])
  );

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 20}
    >
      <View className="flex-1">
        <AnimatedLinearGradient
          colors={gradientColors}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={[
            pulseStyle,
            {
              position: "absolute",
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
            },
          ]}
        />

        <SafeAreaView className="flex-1 bg-transparent">
          <ScrollView
            className="flex-1"
            showsVerticalScrollIndicator={false}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={onRefresh}
                tintColor="#6366f1"
                colors={["#6366f1"]}
              />
            }
            keyboardShouldPersistTaps="handled"
            contentContainerStyle={{ paddingBottom: 120 }}
          >
            <HeroSection />

            <RoadmapGenerator onRoadmapGenerated={handleRoadmapGenerated} />

            <LearningStats key={refreshTrigger} />

            <ActiveRoadmapDisplay
              refreshTrigger={refreshTrigger}
              onProgressUpdate={handleProgressUpdate}
            />
          </ScrollView>
        </SafeAreaView>
      </View>
    </KeyboardAvoidingView>
  );
}
