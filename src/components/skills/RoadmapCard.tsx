import React, { useEffect } from "react";
import { View, Text, TouchableOpacity, Pressable } from "react-native";
import { Card } from "~/components/ui/card";
import Icon from "~/lib/icons/Icon";
import { Roadmap } from "~/queries/roadmap-queries";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSpring,
  withDelay,
  Easing,
} from "react-native-reanimated";

interface RoadmapCardProps {
  roadmap: Roadmap;
  onPress: () => void;
  delay?: number;
}

export default function RoadmapCard({
  roadmap,
  onPress,
  delay = 0,
}: RoadmapCardProps) {
  const scale = useSharedValue(0.8);
  const opacity = useSharedValue(0);
  const translateY = useSharedValue(30);
  const pressScale = useSharedValue(1);

  useEffect(() => {
    const timer = setTimeout(() => {
      scale.value = withDelay(
        delay,
        withSpring(1, { damping: 15, stiffness: 150 })
      );
      opacity.value = withDelay(delay, withTiming(1, { duration: 500 }));
      translateY.value = withDelay(
        delay,
        withSpring(0, { damping: 15, stiffness: 100 })
      );
    }, 50);

    return () => clearTimeout(timer);
  }, [delay, scale, opacity, translateY]);

  const cardStyle = useAnimatedStyle(() => ({
    transform: [
      { scale: scale.value * pressScale.value },
      { translateY: translateY.value },
    ],
    opacity: opacity.value,
  }));

  const handlePressIn = () => {
    pressScale.value = withSpring(0.95);
  };

  const handlePressOut = () => {
    pressScale.value = withSpring(1);
  };

  const getTopicIcon = (topic: string) => {
    const topicLower = topic.toLowerCase();
    if (topicLower.includes("javascript") || topicLower.includes("js"))
      return "Code";
    if (topicLower.includes("react")) return "Layers";
    if (topicLower.includes("python")) return "Terminal";
    if (topicLower.includes("java")) return "Coffee";
    if (
      topicLower.includes("mobile") ||
      topicLower.includes("android") ||
      topicLower.includes("ios")
    )
      return "Smartphone";
    if (topicLower.includes("web")) return "Globe";
    if (
      topicLower.includes("data") ||
      topicLower.includes("ml") ||
      topicLower.includes("ai")
    )
      return "BarChart";
    if (topicLower.includes("design")) return "Palette";
    if (topicLower.includes("cloud") || topicLower.includes("aws"))
      return "Cloud";
    if (topicLower.includes("security")) return "Shield";
    return "BookOpen";
  };

  const getTopicColor = (topic: string) => {
    const topicLower = topic.toLowerCase();
    if (topicLower.includes("javascript") || topicLower.includes("js"))
      return "#f7df1e";
    if (topicLower.includes("react")) return "#61dafb";
    if (topicLower.includes("python")) return "#3776ab";
    if (topicLower.includes("java")) return "#ed8b00";
    if (topicLower.includes("mobile")) return "#6366f1";
    if (topicLower.includes("web")) return "#22c55e";
    if (topicLower.includes("data") || topicLower.includes("ml"))
      return "#8b5cf6";
    if (topicLower.includes("design")) return "#f59e0b";
    if (topicLower.includes("cloud")) return "#06b6d4";
    if (topicLower.includes("security")) return "#ef4444";
    return "#6366f1";
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const completedPoints =
    roadmap.points?.filter((point) => point.isCompleted).length || 0;
  const totalPoints = roadmap.points?.length || 0;
  const progressPercentage =
    totalPoints > 0 ? Math.round((completedPoints / totalPoints) * 100) : 0;

  return (
    <Animated.View style={cardStyle}>
      <Pressable
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
      >
        <Card
          className="mx-4 mb-4 bg-card border border-border"
          style={{ height: 140 }}
        >
          <View className="p-4 flex-1">
            <View className="flex-row items-start justify-between mb-3">
              <View className="flex-row items-start flex-1 mr-3">
                <View
                  className="w-10 h-10 rounded-full items-center justify-center mr-3 mt-1"
                  style={{
                    backgroundColor: `${getTopicColor(roadmap.topic)}20`,
                  }}
                >
                  <Icon
                    name={getTopicIcon(roadmap.topic) as any}
                    size={20}
                    color={getTopicColor(roadmap.topic)}
                  />
                </View>

                <View className="flex-1">
                  <Text
                    className="text-lg font-bold text-foreground mb-1"
                    numberOfLines={2}
                    ellipsizeMode="tail"
                  >
                    {roadmap.topic}
                  </Text>
                  <Text className="text-sm text-muted-foreground">
                    {formatDate(roadmap.createdAt)}
                  </Text>
                </View>
              </View>

              <View className="items-end">
                <View className="flex-row items-center mb-1">
                  <Icon name="Target" size={14} color="#6b7280" />
                  <Text className="text-xs text-muted-foreground ml-1">
                    {totalPoints} topics
                  </Text>
                </View>
                <Text className="text-xs font-medium text-primary">
                  {progressPercentage}% complete
                </Text>
              </View>
            </View>

            <View className="flex-1 justify-end">
              <View className="flex-row items-center justify-between">
                <View className="flex-row items-center">
                  <View className="w-2 h-2 rounded-full bg-green-500 mr-2" />
                  <Text className="text-xs text-muted-foreground">
                    {completedPoints}/{totalPoints} completed
                  </Text>
                </View>

                <View className="flex-row items-center">
                  <Text className="text-sm font-medium text-primary mr-2">
                    View Details
                  </Text>
                  <Icon name="ArrowRight" size={16} color="#6366f1" />
                </View>
              </View>
            </View>
          </View>
        </Card>
      </Pressable>
    </Animated.View>
  );
}
