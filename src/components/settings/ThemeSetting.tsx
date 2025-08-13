import React from "react";
import { View, Text, Pressable } from "react-native";
import { useColorScheme } from "~/lib/utils/useColorScheme";
import Icon from "~/lib/icons/Icon";

export default function ThemeSetting() {
  const { colorScheme, setColorScheme } = useColorScheme();

  const toggleTheme = () => {
    setColorScheme && setColorScheme(colorScheme === "dark" ? "light" : "dark");
  };

  return (
    <View className="mb-6">
      <Pressable
        onPress={toggleTheme}
        disabled={!setColorScheme}
        className="flex-row justify-between items-center py-3"
      >
        <View className="flex-1">
          <Text className="text-base font-medium text-foreground">Theme</Text>
          <Text className="text-sm text-muted-foreground mt-1">
            {colorScheme === "dark" ? "Dark mode" : "Light mode"}
          </Text>
        </View>
        <Icon name={colorScheme === "dark" ? "Moon" : "Sun"} size={20} />
      </Pressable>
    </View>
  );
}
