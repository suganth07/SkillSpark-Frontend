import React from "react";
import { Tabs } from "expo-router";
import { Platform } from "react-native";
import { useColorScheme } from "~/lib/utils/useColorScheme";
import CustomTabBar from "~/components/ui/CustomTabBar";

export default function TabLayout() {
  const { isDarkColorScheme } = useColorScheme();

  return (
    <Tabs
      tabBar={(props) => <CustomTabBar {...props} />}
      screenOptions={{
        headerShown: false,
        tabBarHideOnKeyboard: Platform.OS === "ios" ? false : true,
        tabBarStyle: {
          position: "absolute",
          bottom: 0,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Home",
          headerShown: false,
        }}
      />
      <Tabs.Screen
        name="skills"
        options={{
          title: "Skills",
          headerShown: false,
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: "Settings",
          headerShown: false,
        }}
      />
    </Tabs>
  );
}
