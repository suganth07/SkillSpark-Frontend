import React, { useEffect, useState } from "react";
import { View, Text, Pressable } from "react-native";
import { fetchUserTheme, setUserTheme } from "~/queries/user-queries-new";
import { useColorScheme } from "~/lib/utils/useColorScheme";
import Icon from "~/lib/icons/Icon";

export default function ThemeSetting() {
  const { colorScheme, setColorScheme } = useColorScheme();
  const [loading, setLoading] = useState(false);

  // Load theme from backend on mount
  useEffect(() => {
    const loadTheme = async () => {
      try {
        setLoading(true);
        const savedTheme = await fetchUserTheme();
        if (setColorScheme && savedTheme !== colorScheme) {
          setColorScheme(savedTheme);
        }
      } catch (error) {
        console.error("Error loading theme:", error);
      } finally {
        setLoading(false);
      }
    };

    loadTheme();
  }, []);

  const toggleTheme = async () => {
    if (!setColorScheme || loading) return;

    try {
      setLoading(true);
      const newTheme = colorScheme === "dark" ? "light" : "dark";
      
      // Update UI immediately
      setColorScheme(newTheme);
      
      // Save to backend
      await setUserTheme(newTheme);
    } catch (error) {
      console.error("Error updating theme:", error);
      // Revert UI change on error
      setColorScheme(colorScheme);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View className="mb-6">
      <Pressable
        onPress={toggleTheme}
        disabled={!setColorScheme || loading}
        className="flex-row justify-between items-center py-3"
      >
        <View className="flex-1">
          <Text className="text-base font-medium text-foreground">Theme</Text>
          <Text className="text-sm text-muted-foreground mt-1">
            {loading 
              ? "Updating..." 
              : (colorScheme === "dark" ? "Dark mode" : "Light mode")
            }
          </Text>
        </View>
        <Icon 
          name={colorScheme === "dark" ? "Moon" : "Sun"} 
          size={20} 
          className={loading ? "opacity-50" : ""} 
        />
      </Pressable>
    </View>
  );
}
