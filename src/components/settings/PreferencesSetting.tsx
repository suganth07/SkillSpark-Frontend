import React, { useEffect, useState } from "react";
import { View, Text, Pressable } from "react-native";
import { fetchUserPreferences, setUserPreferences } from "~/queries/user-queries-new";
import { useColorScheme } from "~/lib/utils/useColorScheme";
import BottomSheet from "~/components/ui/BottomSheet";
import Icon from "~/lib/icons/Icon";
import { useDataRefresh } from "~/lib/utils/DataRefreshContext";

export default function PreferencesSetting() {
  const [depth, setDepth] = useState("Balanced");
  const [videoLength, setVideoLength] = useState("Medium");
  const [showDepthSheet, setShowDepthSheet] = useState(false);
  const [showVideoLengthSheet, setShowVideoLengthSheet] = useState(false);
  const [loading, setLoading] = useState(false);
  const { isDarkColorScheme } = useColorScheme();
  const { refreshTrigger } = useDataRefresh();

  const loadPreferences = async () => {
    try {
      setLoading(true);
      const preferences = await fetchUserPreferences();
      setDepth(preferences.depth);
      setVideoLength(preferences.videoLength);
    } catch (error) {
      console.error("Error loading preferences:", error);
      // Set defaults if loading fails
      setDepth("Balanced");
      setVideoLength("Medium");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPreferences();
  }, []);

  useEffect(() => {
    loadPreferences();
  }, [refreshTrigger]);

  const updatePreferences = async (key: string, value: string) => {
    try {
      setLoading(true);
      const newPreferences = { depth, videoLength, [key]: value };
      if (key === "depth") setDepth(value);
      if (key === "videoLength") setVideoLength(value);
      await setUserPreferences(newPreferences);
    } catch (error) {
      console.error("Error updating preferences:", error);
      // Revert the change on error
      if (key === "depth") setDepth(depth);
      if (key === "videoLength") setVideoLength(videoLength);
    } finally {
      setLoading(false);
    }
  };

  const depthOptions = [
    {
      label: "Fast & Short",
      value: "Fast",
      description: "Quick overview with minimal details (3 topics per level)",
    },
    {
      label: "Balanced",
      value: "Balanced", 
      description: "Good mix of depth and brevity (4 topics per level)",
    },
    {
      label: "Detailed & Deep",
      value: "Detailed",
      description: "Comprehensive coverage with examples (6 topics per level)",
    },
  ];

  const videoLengthOptions = [
    { label: "Short", value: "Short", description: "8-15 minutes per video" },
    { label: "Medium", value: "Medium", description: "15-30 minutes per video" },
    { label: "Long", value: "Long", description: "30+ minutes per video" },
  ];

  if (loading && (!depth && !videoLength)) {
    return (
      <View className="mb-6">
        <Text className="text-muted-foreground">Loading preferences...</Text>
      </View>
    );
  }

  return (
    <View className="mb-6">
      <View className="mb-4">
        <Text className="text-base font-medium mb-2 text-foreground">
          Default Roadmap Depth
        </Text>
        <Text className="text-sm text-muted-foreground mb-2">
          Choose how detailed you want your learning roadmaps
        </Text>
        <Pressable
          className="flex-row justify-between items-center py-3"
          onPress={() => setShowDepthSheet(true)}
          disabled={loading}
        >
          <Text className="text-foreground">{depth}</Text>
          <Icon name="ChevronRight" size={16} />
        </Pressable>
      </View>

      <View className="h-px bg-border mb-4" />

      <View className="mb-4">
        <Text className="text-base font-medium mb-2 text-foreground">
          Default Video Length
        </Text>
        <Text className="text-sm text-muted-foreground mb-2">
          Set your preferred video duration for learning content
        </Text>
        <Pressable
          className="flex-row justify-between items-center py-3"
          onPress={() => setShowVideoLengthSheet(true)}
          disabled={loading}
        >
          <Text className="text-foreground">{videoLength}</Text>
          <Icon name="ChevronRight" size={16} />
        </Pressable>
      </View>

      <BottomSheet
        isVisible={showDepthSheet}
        onClose={() => setShowDepthSheet(false)}
      >
        <View className="p-4">
          <Text className="text-xl font-bold text-foreground mb-4">
            Select Roadmap Depth
          </Text>
          {depthOptions.map((option) => (
            <Pressable
              key={option.value}
              className={`p-4 rounded-lg mb-2 ${
                depth === option.value ? "bg-muted" : ""
              }`}
              onPress={() => {
                updatePreferences("depth", option.value);
                setShowDepthSheet(false);
              }}
              disabled={loading}
            >
              <Text className="text-foreground font-medium mb-1">
                {option.label}
              </Text>
              <Text className="text-muted-foreground text-sm">
                {option.description}
              </Text>
            </Pressable>
          ))}
        </View>
      </BottomSheet>

      <BottomSheet
        isVisible={showVideoLengthSheet}
        onClose={() => setShowVideoLengthSheet(false)}
      >
        <View className="p-4">
          <Text className="text-xl font-bold text-foreground mb-4">
            Select Video Length
          </Text>
          {videoLengthOptions.map((option) => (
            <Pressable
              key={option.value}
              className={`p-4 rounded-lg mb-2 ${
                videoLength === option.value ? "bg-muted" : ""
              }`}
              onPress={() => {
                updatePreferences("videoLength", option.value);
                setShowVideoLengthSheet(false);
              }}
              disabled={loading}
            >
              <Text className="text-foreground font-medium mb-1">
                {option.label}
              </Text>
              <Text className="text-muted-foreground text-sm">
                {option.description}
              </Text>
            </Pressable>
          ))}
        </View>
      </BottomSheet>
    </View>
  );
}
