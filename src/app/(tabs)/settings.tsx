import React, { useEffect } from "react";
import { View, ScrollView, Text, TouchableOpacity } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withSequence,
  withTiming,
  Easing,
} from "react-native-reanimated";
import NameSetting from "~/components/settings/NameSetting";
import DescriptionSetting from "~/components/settings/DescriptionSetting";
import ThemeSetting from "~/components/settings/ThemeSetting";
import PreferencesSetting from "~/components/settings/PreferencesSetting";
import ClearDataSetting from "~/components/settings/ClearDataSetting";
import SectionHeader from "~/components/ui/SectionHeader";
import Icon from "~/lib/icons/Icon";
import { DataRefreshProvider } from "~/lib/utils/DataRefreshContext";
import { useColorScheme } from "~/lib/utils/useColorScheme";
import { useAuth } from "~/lib/utils/AuthContext";

const AnimatedLinearGradient = Animated.createAnimatedComponent(LinearGradient);

export default function SettingsScreen() {
  const { isDarkColorScheme } = useColorScheme();
  const { logout, user } = useAuth();
  const router = useRouter();
  const pulseScale = useSharedValue(1);

  const handleLogout = async () => {
    try {
      await logout();
      router.replace("/(tabs)/");
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

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
        "rgba(99, 102, 241, 0.15)",
        "rgba(168, 85, 247, 0.12)",
        "rgba(236, 72, 153, 0.08)",
        "rgba(59, 130, 246, 0.05)",
        "transparent",
      ] as const);

  // If user is not logged in, show login prompt
  if (!user) {
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

        <SafeAreaView className="flex-1 bg-card">
          <View className="flex-1 justify-center items-center px-6">
            <Text className="text-2xl font-bold text-center mb-4 text-foreground">
              Settings
            </Text>
            <Text className="text-lg text-center mb-8 text-muted-foreground">
              Please login to access your account settings and preferences.
            </Text>
            <TouchableOpacity
              onPress={() => router.push("/auth/login")}
              className="bg-primary px-6 py-3 rounded-lg"
            >
              <Text className="text-primary-foreground font-semibold">Login / Sign Up</Text>
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      </View>
    );
  }

  return (
    <DataRefreshProvider>
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

        <SafeAreaView className="flex-1 bg-card">
          <ScrollView 
            className="flex-1"
            contentContainerStyle={{ paddingBottom: 100 }}
            showsVerticalScrollIndicator={false}
          >
            <View className="bg-card px-6 pt-8 py-4 border-b border-border">
              <View className="flex-row items-center justify-between">
                <View className="flex-1">
                  <Text className="text-4xl font-bold text-foreground mt-3">
                    Settings
                  </Text>
                  <Text className="text-base text-muted-foreground">
                    Manage your preferences and account settings
                  </Text>
                  {user && (
                    <Text className="text-sm text-muted-foreground mt-1">
                      Signed in as {user.username}
                    </Text>
                  )}
                </View>
                
                {user && (
                  <TouchableOpacity
                    onPress={handleLogout}
                    className="bg-destructive/10 border border-destructive/20 rounded-lg p-3"
                  >
                    <View className="flex-row items-center">
                      <Icon name="LogOut" size={18} color="#ef4444" />
                      <Text className="text-destructive font-medium ml-2">
                        Sign Out
                      </Text>
                    </View>
                  </TouchableOpacity>
                )}
              </View>
            </View>

            <View className="px-6 py-6">
              <SectionHeader
                title="Personal Information"
                subtitle="Tell us about yourself to personalize your experience"
              />
              <View className="px-3">
                <NameSetting />
                <View className="h-px bg-border mb-1" />
                <DescriptionSetting />
              </View>

              <View className="h-px bg-border mb-4" />
              <SectionHeader
                title="Appearance"
                subtitle="Customize how the app looks and feels"
              />
              <View className="mb-1 px-3">
                <ThemeSetting />
              </View>

              <View className="h-px bg-border mb-4" />

              <SectionHeader
                title="Learning Preferences"
                subtitle="Set your default learning options"
              />
              <View className="mb-1 px-3">
                <PreferencesSetting />
              </View>

              <View className="h-px bg-border mb-4" />

              <SectionHeader
                title="Data Management"
                subtitle="Manage your stored information"
              />
              <View className="mb-1 px-3">
                <ClearDataSetting />
              </View>
            </View>
          </ScrollView>
        </SafeAreaView>
      </View>
    </DataRefreshProvider>
  );
}
