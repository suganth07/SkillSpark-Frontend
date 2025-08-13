import React, { useState } from "react";
import { View, Text, TouchableOpacity, Alert } from "react-native";
import { useRouter } from "expo-router";
import Icon from "~/lib/icons/Icon";
import { useAuth } from "~/lib/utils/AuthContext";
import { useColorScheme } from "~/lib/utils/useColorScheme";

export default function LogoutSetting() {
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const { logout, user } = useAuth();
  const { isDarkColorScheme } = useColorScheme();
  const router = useRouter();

  const handleLogout = () => {
    Alert.alert(
      "Sign Out",
      "Are you sure you want to sign out? Your data will remain saved for when you return.",
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Sign Out",
          style: "destructive",
          onPress: performLogout,
        },
      ]
    );
  };

  const performLogout = async () => {
    try {
      setIsLoggingOut(true);
      await logout();
      router.replace("/(tabs)/");
    } catch (error) {
      Alert.alert("Error", "Failed to sign out. Please try again.");
    } finally {
      setIsLoggingOut(false);
    }
  };

  return (
    <View className="py-4">
      <View className="mb-4">
        <Text className="text-lg font-semibold text-foreground mb-1">
          Account
        </Text>
        <Text className="text-sm text-muted-foreground">
          Signed in as {user?.username}
        </Text>
      </View>

      <TouchableOpacity
        onPress={handleLogout}
        disabled={isLoggingOut}
        className="flex-row items-center justify-between py-4 px-4 bg-destructive/10 border border-destructive/20 rounded-lg"
      >
        <View className="flex-row items-center flex-1">
          <View className="w-10 h-10 bg-destructive/20 rounded-full items-center justify-center mr-3">
            <Icon name="LogOut" size={18} color="#ef4444" />
          </View>
          <View className="flex-1">
            <Text className="text-base font-medium text-destructive">
              {isLoggingOut ? "Signing Out..." : "Sign Out"}
            </Text>
            <Text className="text-sm text-destructive/70">
              Your progress will be saved
            </Text>
          </View>
        </View>
        
        {!isLoggingOut && (
          <Icon name="ChevronRight" size={16} color="#ef4444" />
        )}
      </TouchableOpacity>
    </View>
  );
}
