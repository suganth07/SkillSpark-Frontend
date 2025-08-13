import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Alert,
  Platform,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useLocalSearchParams, useRouter } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import { Card, CardContent } from "~/components/ui/card";
import Icon from "~/lib/icons/Icon";
import { YouTubeIcon } from "~/lib/icons/YouTube";
import { Spinner } from "~/components/ui/spinner";
import { useColorScheme } from "~/lib/utils/useColorScheme";
import {
  getRoadmapById,
  updateRoadmapProgress,
  loadPlaylistsForPoint,
  regeneratePlaylistsForPoint,
  arePlaylistsLoadedForPoint,
  RoadmapPoint,
  PlaylistItem,
} from "~/queries/roadmap-queries";
import * as Linking from "expo-linking";
import { openExternalLink } from "~/lib/utils/linkHandler";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSpring,
  withDelay,
  withRepeat,
  withSequence,
  Easing,
} from "react-native-reanimated";

const AnimatedLinearGradient = Animated.createAnimatedComponent(LinearGradient);

export default function RoadmapPointScreen() {
  const { roadmapId, pointId } = useLocalSearchParams<{
    roadmapId: string;
    pointId: string;
  }>();
  const router = useRouter();
  const { isDarkColorScheme } = useColorScheme();

  const [point, setPoint] = useState<RoadmapPoint | null>(null);
  const [playlists, setPlaylists] = useState<PlaylistItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingPlaylists, setLoadingPlaylists] = useState(false);
  const [regeneratingPlaylists, setRegeneratingPlaylists] = useState(false);
  const [roadmapTopic, setRoadmapTopic] = useState("");
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

  const fadeIn = useSharedValue(0);
  const slideY = useSharedValue(50);
  const headerScale = useSharedValue(0.9);

  useEffect(() => {
    loadPointData();
  }, []);

  useEffect(() => {
    if (point) {
      fadeIn.value = withTiming(1, {
        duration: 600,
        easing: Easing.out(Easing.quad),
      });
      slideY.value = withTiming(0, {
        duration: 600,
        easing: Easing.out(Easing.quad),
      });
      headerScale.value = withSpring(1, { damping: 15, stiffness: 200 });
    }
  }, [point]);

  const loadPointData = async () => {
    if (!roadmapId || !pointId) return;

    try {
      setLoading(true);
      const roadmap = await getRoadmapById(roadmapId);
      if (!roadmap) {
        Alert.alert("Error", "Roadmap not found");
        router.back();
        return;
      }

      const foundPoint = roadmap.points.find((p) => p.id === pointId);
      if (!foundPoint) {
        Alert.alert("Error", "Roadmap point not found");
        router.back();
        return;
      }

      setPoint(foundPoint);
      setRoadmapTopic(roadmap.topic);
      await loadPlaylists(foundPoint, roadmap.topic);
    } catch (error) {
      console.error("Error loading point data:", error);
      Alert.alert("Error", "Failed to load roadmap point");
    } finally {
      setLoading(false);
    }
  };

  const loadPlaylists = async (pointData: RoadmapPoint, topic: string) => {
    if (!roadmapId || !pointId) return;

    try {
      setLoadingPlaylists(true);
      const areLoaded = await arePlaylistsLoadedForPoint(roadmapId, pointId);

      if (areLoaded && pointData.playlists) {
        setPlaylists(pointData.playlists);
      } else {
        const loadedPlaylists = await loadPlaylistsForPoint(
          roadmapId,
          pointId,
          topic,
          pointData.title
        );
        setPlaylists(loadedPlaylists);
      }
    } catch (error) {
      console.error("Error loading playlists:", error);
      Alert.alert("Error", "Failed to load playlists");
    } finally {
      setLoadingPlaylists(false);
    }
  };

  const handleRegeneratePlaylists = async () => {
    if (!point || !roadmapId || !pointId) return;

    Alert.alert(
      "Regenerate Videos",
      "This will generate new learning videos for this topic. Continue?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Regenerate",
          style: "default",
          onPress: async () => {
            try {
              setRegeneratingPlaylists(true);
              const newPlaylists = await regeneratePlaylistsForPoint(
                roadmapId,
                pointId,
                roadmapTopic,
                point.title
              );
              setPlaylists(newPlaylists);
              headerScale.value = withSpring(
                1.05,
                { damping: 15, stiffness: 200 },
                () => {
                  headerScale.value = withSpring(1, {
                    damping: 15,
                    stiffness: 200,
                  });
                }
              );
            } catch (error) {
              console.error("Error regenerating playlists:", error);
              Alert.alert(
                "Error",
                "Failed to regenerate videos. Please try again."
              );
            } finally {
              setRegeneratingPlaylists(false);
            }
          },
        },
      ]
    );
  };

  const handleToggleCompletion = async () => {
    if (!point || !roadmapId) return;

    try {
      const newStatus = !point.isCompleted;
      await updateRoadmapProgress(roadmapId, pointId, newStatus);
      setPoint((prev) => (prev ? { ...prev, isCompleted: newStatus } : null));
      headerScale.value = withSpring(
        1.05,
        { damping: 15, stiffness: 200 },
        () => {
          headerScale.value = withSpring(1, { damping: 15, stiffness: 200 });
        }
      );
    } catch (error) {
      console.error("Error updating progress:", error);
      Alert.alert("Error", "Failed to update progress");
    }
  };

  const getLevelColor = (level: string) => {
    switch (level) {
      case "beginner":
        return "#22c55e";
      case "intermediate":
        return "#f59e0b";
      case "advanced":
        return "#ef4444";
      default:
        return "#6b7280";
    }
  };

  const getLevelBgColor = (level: string) => {
    switch (level) {
      case "beginner":
        return "#dcfce7";
      case "intermediate":
        return "#fef3c7";
      case "advanced":
        return "#fee2e2";
      default:
        return "#f1f5f9";
    }
  };

  const containerStyle = useAnimatedStyle(() => ({
    opacity: fadeIn.value,
    transform: [{ translateY: slideY.value }],
  }));

  const headerStyle = useAnimatedStyle(() => ({
    transform: [{ scale: headerScale.value }],
  }));

  if (loading) {
    return (
      <SafeAreaView className="flex-1" style={{ backgroundColor: isDarkColorScheme ? "#000000" : "#ffffff" }}>
        <View className="px-6 py-4 border-b border-border bg-background">
          <View className="flex-row items-center justify-between mb-4">
            <TouchableOpacity
              onPress={() => router.back()}
              className="p-2 -ml-2"
            >
              <Icon name="ArrowLeft" size={24} />
            </TouchableOpacity>
            <Text className="text-lg font-semibold text-foreground">
              Learning Point
            </Text>
            <View className="w-8" />
          </View>
        </View>

        <View className="flex-1 items-center justify-center px-6">
          <Spinner size={48} />
          <Text className="text-lg font-medium text-foreground mt-6 mb-2">
            Loading content...
          </Text>
          <Text className="text-sm text-muted-foreground text-center max-w-xs">
            We're getting the learning point details for you
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!point) {
    return (
      <SafeAreaView className="flex-1" style={{ backgroundColor: isDarkColorScheme ? "#000000" : "#ffffff" }}>
        <View className="flex-1 items-center justify-center">
          <Text className="text-xl font-bold text-foreground">
            Point not found
          </Text>
          <TouchableOpacity
            onPress={() => router.back()}
            className="flex-row items-center px-4 py-3 bg-primary rounded-lg mt-4"
          >
            <Text className="text-primary-foreground font-medium ml-2">
              Go Back
            </Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
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

      <SafeAreaView className="flex-1" style={{ backgroundColor: isDarkColorScheme ? "#000000" : "#ffffff" }}>
        <Animated.View style={[containerStyle, { flex: 1 }]}>
          <View className="px-6 py-4 border-b border-border bg-background">
            <View className="flex-row items-center justify-between mb-4">
              <TouchableOpacity
                onPress={() => router.back()}
                className="p-2 -ml-2"
              >
                <Icon name="ArrowLeft" size={24} />
              </TouchableOpacity>
              <Text className="text-lg font-semibold text-foreground">
                Learning Point
              </Text>
              <View className="w-8" />
            </View>

            <Animated.View style={headerStyle}>
              <Card>
                <CardContent className="p-4">
                  <View className="mb-3">
                    <View className="flex-row items-center mb-2">
                      <View
                        className="px-2 py-1 rounded-full mr-2"
                        style={{
                          backgroundColor: getLevelBgColor(point.level),
                        }}
                      >
                        <Text
                          className="text-xs font-semibold"
                          style={{ color: getLevelColor(point.level) }}
                        >
                          {point.level.toUpperCase()}
                        </Text>
                      </View>
                      <Text className="text-xs text-muted-foreground">
                        Step {point.order}
                      </Text>
                    </View>
                    <Text className="text-xl font-bold text-foreground mb-2">
                      {point.title}
                    </Text>
                    <Text className="text-sm text-muted-foreground leading-5">
                      {point.description}
                    </Text>
                  </View>

                  <TouchableOpacity
                    onPress={handleToggleCompletion}
                    className="w-full flex-row items-center justify-center py-3 rounded-lg mt-4"
                    style={{
                      backgroundColor: point.isCompleted
                        ? "#16a34a"
                        : "#4f46e5",
                    }}
                  >
                    <Icon
                      name={point.isCompleted ? "Check" : "Plus"}
                      size={20}
                      color="#ffffff"
                    />
                    <Text className="text-white font-semibold ml-2">
                      {point.isCompleted
                        ? "Mark as Incomplete"
                        : "Mark as Complete"}
                    </Text>
                  </TouchableOpacity>
                </CardContent>
              </Card>
            </Animated.View>
          </View>

          <ScrollView className="flex-1">
            <View className="flex-1 px-6 py-4">
              <View className="flex-row items-center justify-between mb-4">
                <Text className="text-lg font-semibold text-foreground">
                  Learning Videos
                </Text>

                {playlists.length > 0 && !loadingPlaylists && (
                  <TouchableOpacity
                    onPress={handleRegeneratePlaylists}
                    disabled={regeneratingPlaylists}
                    className="flex-row items-center px-3 py-2 bg-muted rounded-lg"
                  >
                    {regeneratingPlaylists ? (
                      <>
                        <Spinner size={16} />
                        <Text className="text-primary font-medium text-xs ml-2">
                          Generating...
                        </Text>
                      </>
                    ) : (
                      <>
                        <Icon name="RotateCcw" size={16} color="#4f46e5" />
                        <Text className="text-primary font-medium text-xs ml-2">
                          Regenerate
                        </Text>
                      </>
                    )}
                  </TouchableOpacity>
                )}
              </View>

              {loadingPlaylists ? (
                <View className="items-center py-10">
                  <Spinner size={40} />
                  <Text className="text-lg font-medium text-foreground mt-6 mb-2">
                    Generating videos...
                  </Text>
                  <Text className="text-sm text-muted-foreground text-center max-w-xs">
                    We're finding the best learning videos for this topic
                  </Text>
                </View>
              ) : playlists.length > 0 ? (
                <View>
                  {playlists.map((playlist, index) => (
                    <View key={playlist.id} className="mb-3">
                      <PlaylistCard playlist={playlist} index={index} />
                    </View>
                  ))}
                </View>
              ) : (
                <Card>
                  <CardContent className="p-6 items-center">
                    <View className="w-16 h-16 bg-muted rounded-full items-center justify-center mb-4">
                      <Icon name="Video" size={24} />
                    </View>
                    <Text className="text-lg font-semibold text-foreground mb-2">
                      No Videos Available
                    </Text>
                    <Text className="text-sm text-muted-foreground text-center mb-4">
                      Learning videos for this topic haven't been loaded yet.
                    </Text>
                    <TouchableOpacity
                      onPress={() => loadPlaylists(point, roadmapTopic)}
                      className="flex-row items-center px-4 py-3 bg-primary rounded-lg"
                    >
                      <Icon name="Download" size={16} color="#ffffff" />
                      <Text className="text-primary-foreground font-medium ml-2">
                        Load Videos
                      </Text>
                    </TouchableOpacity>
                  </CardContent>
                </Card>
              )}
            </View>
          </ScrollView>
        </Animated.View>
      </SafeAreaView>
    </View>
  );
}

interface PlaylistCardProps {
  playlist: PlaylistItem;
  index: number;
}

function PlaylistCard({ playlist, index }: PlaylistCardProps) {
  const scale = useSharedValue(0.9);
  const opacity = useSharedValue(0);
  const [isPressed, setIsPressed] = useState(false);

  useEffect(() => {
    scale.value = withDelay(
      index * 100,
      withSpring(1, { damping: 15, stiffness: 200 })
    );
    opacity.value = withDelay(index * 100, withTiming(1, { duration: 400 }));
  }, [index]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value * (isPressed ? 0.98 : 1) }],
    opacity: opacity.value,
  }));

  const handlePress = async () => {
    try {
      if (playlist.videoUrl) {
        await openExternalLink(playlist.videoUrl);
      } else {
        Alert.alert("No Link", "Video link not available");
      }
    } catch (error) {
      console.error("Error opening video:", error);
      Alert.alert(
        "Error",
        "Failed to open video link. Please try again or copy the link manually.",
        [{ text: "OK", style: "default" }]
      );
    }
  };

  return (
    <Animated.View style={animatedStyle}>
      <TouchableOpacity
        onPress={handlePress}
        onPressIn={() => setIsPressed(true)}
        onPressOut={() => setIsPressed(false)}
        activeOpacity={0.95}
      >
        <Card>
          <CardContent className="p-4">
            <View className="flex-row items-center">
              <View className="w-14 h-14 bg-red-50 dark:bg-red-950 rounded-2xl items-center justify-center mr-4">
                <YouTubeIcon size={28} color="#ff0000" />
              </View>

              <View className="flex-1">
                <Text className="text-base font-semibold text-foreground leading-5">
                  {playlist.title}
                </Text>
              </View>
            </View>
          </CardContent>
        </Card>
      </TouchableOpacity>
    </Animated.View>
  );
}
