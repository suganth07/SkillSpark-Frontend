import React, { useState } from "react";
import { View, Text, TextInput, Alert } from "react-native";
import { Button } from "~/components/ui/button";
import { Card } from "~/components/ui/card";
import Icon from "~/lib/icons/Icon";
import { useColorScheme } from "~/lib/utils/useColorScheme";
import { useRoadmapData } from "~/lib/utils/RoadmapDataContext";
import { generateNewRoadmap } from "~/queries/roadmap-queries";
import { QuizAPI } from "~/lib/api";
import authService from "~/services/authService";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSpring,
  withRepeat,
  withSequence,
  Easing,
  runOnJS,
} from "react-native-reanimated";

interface RoadmapGeneratorProps {
  onRoadmapGenerated?: () => void;
  onShowSuccess?: (topic: string) => void;
}

export default function RoadmapGenerator({
  onRoadmapGenerated,
  onShowSuccess,
}: RoadmapGeneratorProps) {
  const [topic, setTopic] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedTopic, setGeneratedTopic] = useState("");
  const { isDarkColorScheme } = useColorScheme();
  const { setActiveRoadmap, refreshData } = useRoadmapData();

  const buttonScale = useSharedValue(1);
  const inputFocus = useSharedValue(0);
  const cardScale = useSharedValue(1);
  const loadingOpacity = useSharedValue(0);

  const startLoadingAnimation = () => {
    loadingOpacity.value = withRepeat(
      withSequence(
        withTiming(0.3, { duration: 800 }),
        withTiming(0.8, { duration: 800 })
      ),
      -1,
      false
    );
  };

  const stopLoadingAnimation = () => {
    loadingOpacity.value = withTiming(0, { duration: 300 });
  };

  const handleGenerate = async () => {
    if (!topic.trim()) {
      Alert.alert(
        "Missing Topic",
        "Please enter a topic to generate a roadmap."
      );
      return;
    }

    setIsGenerating(true);
    buttonScale.value = withSpring(0.95);
    startLoadingAnimation();

    try {
      const savedRoadmap = await generateNewRoadmap(topic.trim());

      // Generate quiz in background after roadmap creation using the correct database ID
      try {
        const user = await authService.getCurrentUser();
        if (user && savedRoadmap?.id) {
          console.log('🎯 Starting background quiz generation for roadmap:', savedRoadmap.id);
          QuizAPI.generateQuizInBackground(savedRoadmap.id, user.id)
            .then((result) => {
              if (result.success) {
                console.log('✅ Background quiz generation completed');
              } else {
                console.warn('⚠️ Background quiz generation failed:', result.error);
              }
            });
        }
      } catch (quizError) {
        console.warn('⚠️ Quiz generation failed, but roadmap created successfully:', quizError);
      }

      refreshData();

      cardScale.value = withTiming(1.05, { duration: 200 }, () => {
        cardScale.value = withTiming(1, { duration: 200 });
      });

      setGeneratedTopic(topic.trim());
      onShowSuccess?.(topic.trim());
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error occurred";
      Alert.alert(
        "Error",
        `Failed to generate roadmap: ${errorMessage}. Please try again.`
      );
      console.error("Error generating roadmap:", error);
    } finally {
      setIsGenerating(false);
      buttonScale.value = withSpring(1);
      stopLoadingAnimation();
    }
  };

  const buttonStyle = useAnimatedStyle(() => ({
    transform: [{ scale: buttonScale.value }],
  }));

  const inputStyle = useAnimatedStyle(() => {
    const focusedBorderColor = isDarkColorScheme ? "#6366f1" : "#4f46e5";
    const unfocusedBorderColor = isDarkColorScheme ? "#374151" : "#e5e7eb";

    return {
      borderWidth: withTiming(inputFocus.value > 0 ? 2 : 1, { duration: 200 }),
      borderColor: withTiming(
        inputFocus.value > 0 ? focusedBorderColor : unfocusedBorderColor,
        { duration: 200 }
      ),
    };
  });

  const cardStyle = useAnimatedStyle(() => ({
    transform: [{ scale: cardScale.value }],
  }));

  const loadingStyle = useAnimatedStyle(() => ({
    opacity: loadingOpacity.value,
  }));

  return (
    <Animated.View style={cardStyle}>
      <Card className="mx-6 mb-6 p-6 bg-card border border-border">
        <View className="flex-row items-center mb-4">
          <View className="w-10 h-10 bg-indigo-100 dark:bg-indigo-900 rounded-full items-center justify-center mr-3">      
            <Icon name="Plus" size={20} color="#6366f1" />
          </View>
          <View className="flex-1">
            <Text className="text-xl font-bold text-foreground">
              Generate Roadmap
            </Text>
            <Text className="text-sm text-muted-foreground">
              Enter any topic to create a personalized learning path
            </Text>
          </View>
        </View>

        <View className="space-y-4">
          <View className="mb-4">
            <Text className="text-sm font-medium text-foreground mb-2">
              Learning Topic
            </Text>
            <Animated.View
              style={[
                inputStyle,
                {
                  borderRadius: 12,
                  backgroundColor: isDarkColorScheme ? "#1f2937" : "#ffffff",
                },
              ]}
            >
              <TextInput
                value={topic}
                onChangeText={setTopic}
                placeholder="e.g., React Native, Python, Machine Learning..."
                placeholderTextColor={isDarkColorScheme ? "#9CA3AF" : "#6B7280"}
                style={{
                  paddingHorizontal: 16,
                  paddingVertical: 12,
                  fontSize: 16,
                  color: isDarkColorScheme ? "#f9fafb" : "#374151",
                  borderRadius: 12,
                }}
                onFocus={() => {
                  inputFocus.value = withTiming(1, { duration: 200 });
                }}
                onBlur={() => {
                  inputFocus.value = withTiming(0, { duration: 200 });
                }}
                editable={!isGenerating}
              />
            </Animated.View>
          </View>

          <Animated.View style={buttonStyle}>
            {isGenerating ? (
              <View
                style={{
                  backgroundColor: isDarkColorScheme ? "#4B5563" : "#E5E7EB",
                  paddingVertical: 16,
                  borderRadius: 12,
                  width: "100%",
                }}
                className="flex-row items-center justify-center"
              >
                <Text
                  style={{
                    color: isDarkColorScheme ? "#9CA3AF" : "#6B7280",
                    fontSize: 16,
                    fontWeight: "600",
                  }}
                >
                  Generating...
                </Text>
              </View>
            ) : (
              <Button
                onPress={handleGenerate}
                disabled={!topic.trim()}
                style={{
                  backgroundColor: topic.trim()
                    ? "#4F46E5"
                    : isDarkColorScheme
                      ? "#374151"
                      : "#D1D5DB",
                  paddingVertical: 16,
                  borderRadius: 12,
                  width: "100%",
                }}
              >
                <View className="flex-row items-center justify-center">
                  <Icon
                    name="Wand"
                    size={20}
                    color={
                      topic.trim()
                        ? "#ffffff"
                        : isDarkColorScheme
                          ? "#9CA3AF"
                          : "#6B7280"
                    }
                  />
                  <Text
                    style={{
                      color: topic.trim()
                        ? "#ffffff"
                        : isDarkColorScheme
                          ? "#9CA3AF"
                          : "#6B7280",
                      fontWeight: "600",
                      fontSize: 16,
                      marginLeft: 8,
                    }}
                  >
                    Generate Roadmap
                  </Text>
                </View>
              </Button>
            )}
          </Animated.View>
        </View>

        <View className="mt-4 pt-4 border-t border-border">
          <Text className="text-xs text-muted-foreground text-center">
            💡 Try topics like "React Native", "Data Science", "UI/UX Design"
          </Text>
        </View>
      </Card>
    </Animated.View>
  );
}
