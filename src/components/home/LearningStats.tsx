import React, { useState, useEffect } from "react";
import { View, Text } from "react-native";
import { Card } from "~/components/ui/card";
import Icon from "~/lib/icons/Icon";
import { useAuth } from "~/lib/utils/AuthContext";
import UserRoadmapService from "~/services/userRoadmapService";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withDelay,
  Easing,
} from "react-native-reanimated";

interface StatsCardProps {
  icon: string;
  title: string;
  value: string | number;
  subtitle: string;
  color: string;
  delay: number;
}

function StatsCard({
  icon,
  title,
  value,
  subtitle,
  color,
  delay,
}: StatsCardProps) {
  const scale = useSharedValue(0.8);
  const opacity = useSharedValue(0);

  useEffect(() => {
    const timer = setTimeout(() => {
      scale.value = withDelay(
        delay,
        withTiming(1, { duration: 500, easing: Easing.out(Easing.back(1.2)) })
      );
      opacity.value = withDelay(delay, withTiming(1, { duration: 500 }));
    }, 50);

    return () => clearTimeout(timer);
  }, [delay, scale, opacity]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: opacity.value,
  }));

  return (
    <Animated.View style={[animatedStyle, { flex: 1, marginHorizontal: 4 }]}>
      <Card className="px-4 py-5 bg-card border border-border">
        <View className="items-center justify-center">
          <View
            className="w-12 h-12 rounded-full items-center justify-center mb-3"
            style={{ backgroundColor: `${color}20` }}
          >
            <Icon name={icon as any} size={20} color={color} />
          </View>

          <Text className="text-2xl font-bold text-foreground mb-1">
            {value}
          </Text>

          <Text className="text-sm font-medium text-foreground mb-1">
            {title}
          </Text>

          <Text className="text-xs text-muted-foreground text-center">
            {subtitle}
          </Text>
        </View>
      </Card>
    </Animated.View>
  );
}

export default function LearningStats() {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    totalRoadmaps: 0,
    completedPoints: 0,
    totalPoints: 0,
    activeRoadmapProgress: 0,
  });

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStats();
  }, [user]);

  const loadStats = async () => {
    if (!user) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      console.log('Loading stats for user:', user.id);
      
      // Get user roadmaps from backend
      const userRoadmaps = await UserRoadmapService.getUserRoadmaps(user.id);
      console.log('User roadmaps for stats:', userRoadmaps);

      let totalCompletedPoints = 0;
      let totalPoints = 0;

      if (Array.isArray(userRoadmaps)) {
        userRoadmaps.forEach((roadmap) => {
          if (roadmap?.roadmapData?.points && Array.isArray(roadmap.roadmapData.points)) {
            roadmap.roadmapData.points.forEach((point: any) => {
              totalPoints++;
              if (point && point.isCompleted) {
                totalCompletedPoints++;
              }
            });
          }
        });
      }

      // Get the most recent roadmap progress
      let activeRoadmapProgress = 0;
      if (userRoadmaps.length > 0) {
        const latestRoadmap = userRoadmaps.sort((a, b) => 
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        )[0];
        
        if (latestRoadmap?.roadmapData?.points) {
          const points = latestRoadmap.roadmapData.points;
          const completed = points.filter((p: any) => p.isCompleted).length;
          activeRoadmapProgress = points.length > 0 ? Math.round((completed / points.length) * 100) : 0;
        }
      }

      setStats({
        totalRoadmaps: userRoadmaps.length,
        completedPoints: totalCompletedPoints,
        totalPoints: totalPoints,
        activeRoadmapProgress: activeRoadmapProgress,
      });
      
      console.log('Updated stats:', {
        totalRoadmaps: userRoadmaps.length,
        completedPoints: totalCompletedPoints,
        totalPoints: totalPoints,
        activeRoadmapProgress: activeRoadmapProgress,
      });
    } catch (error) {
      console.error("Error loading stats:", error);
      setStats({
        totalRoadmaps: 0,
        completedPoints: 0,
        totalPoints: 0,
        activeRoadmapProgress: 0,
      });
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <View className="mx-6 mb-6">
        <Text className="text-lg font-semibold text-foreground mb-4 px-2">
          Your Learning Progress
        </Text>
        <View className="flex-row" style={{ marginHorizontal: -4 }}>
          {[1, 2].map((i) => (
            <View key={i} style={{ flex: 1, marginHorizontal: 4 }}>
              <Card className="p-4 bg-card border border-border">
                <View className="items-center py-6">
                  <View className="w-12 h-12 bg-gray-200 dark:bg-gray-700 rounded-full mb-3" />
                  <View className="w-16 h-4 bg-gray-200 dark:bg-gray-700 rounded mb-2" />
                  <View className="w-12 h-3 bg-gray-200 dark:bg-gray-700 rounded" />
                </View>
              </Card>
            </View>
          ))}
        </View>
      </View>
    );
  }

  return (
    <View className="mx-6 mb-6">
      <Text className="text-lg font-semibold text-foreground mb-4">
        Your Learning Progress
      </Text>

      <View className="flex-row" style={{ marginHorizontal: -4 }}>
        <View style={{ flex: 1, marginHorizontal: 4 }}>
          <StatsCard
            icon="BookOpen"
            title="Roadmaps"
            value={stats.totalRoadmaps}
            subtitle="Learning paths created"
            color="#6366f1"
            delay={0}
          />
        </View>

        <View style={{ flex: 1, marginHorizontal: 4 }}>
          <StatsCard
            icon="Target"
            title="Progress"
            value={`${stats.completedPoints}/${stats.totalPoints}`}
            subtitle="Points completed"
            color="#22c55e"
            delay={100}
          />
        </View>
      </View>
    </View>
  );
}
