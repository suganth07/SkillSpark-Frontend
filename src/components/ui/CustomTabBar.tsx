import React, { useEffect, useState } from "react";
import { View, Pressable, Text, Platform, Keyboard } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useColorScheme } from "~/lib/utils/useColorScheme";
import { Home, Rocket, Settings as SettingsIcon } from "lucide-react-native";

interface CustomTabBarProps {
  state: any;
  descriptors: any;
  navigation: any;
}

const tabItems = [
  { name: "index", label: "Home", icon: Home },
  { name: "skills", label: "Skills", icon: Rocket },
  { name: "settings", label: "Settings", icon: SettingsIcon },
];

export default function CustomTabBar({
  state,
  descriptors,
  navigation,
}: CustomTabBarProps) {
  const { isDarkColorScheme } = useColorScheme();
  const insets = useSafeAreaInsets();
  const [keyboardHeight, setKeyboardHeight] = useState(0);

  const bottomPadding = Math.max(
    insets.bottom,
    Platform.OS === "ios" ? 34 : 20
  );

  useEffect(() => {
    const keyboardWillShow = (e: any) => {
      if (Platform.OS === "android") {
        setKeyboardHeight(e.endCoordinates.height);
      }
    };

    const keyboardWillHide = () => {
      if (Platform.OS === "android") {
        setKeyboardHeight(0);
      }
    };

    const showSubscription = Keyboard.addListener(
      Platform.OS === "ios" ? "keyboardWillShow" : "keyboardDidShow",
      keyboardWillShow
    );
    const hideSubscription = Keyboard.addListener(
      Platform.OS === "ios" ? "keyboardWillHide" : "keyboardDidHide",
      keyboardWillHide
    );

    return () => {
      showSubscription.remove();
      hideSubscription.remove();
    };
  }, []);

  // Hide tab bar on Android when keyboard is visible
  if (Platform.OS === "android" && keyboardHeight > 0) {
    return null;
  }

  return (
    <View
      style={{
        position: "absolute",
        bottom: 0,
        left: 0,
        right: 0,
        flexDirection: "row",
        backgroundColor: isDarkColorScheme ? "#111111" : "#ffffff",
        borderTopLeftRadius: 32,
        borderTopRightRadius: 32,
        paddingHorizontal: 24,
        paddingTop: 20,
        paddingBottom: bottomPadding,
        shadowColor: "#000000",
        shadowOffset: {
          width: 0,
          height: -8,
        },
        shadowOpacity: isDarkColorScheme ? 0.6 : 0.15,
        shadowRadius: 24,
        elevation: 24,
        borderTopWidth: 1,
        borderTopColor: isDarkColorScheme ? "#2a2a2a" : "#e5e5e5",
        borderLeftWidth: 1,
        borderRightWidth: 1,
        borderLeftColor: isDarkColorScheme ? "#2a2a2a" : "#e5e5e5",
        borderRightColor: isDarkColorScheme ? "#2a2a2a" : "#e5e5e5",
      }}
    >
      {state.routes.map((route: any, index: number) => {
        const { options } = descriptors[route.key];
        const isFocused = state.index === index;
        const tabItem = tabItems.find((item) => item.name === route.name);

        if (!tabItem) return null;

        const onPress = () => {
          const event = navigation.emit({
            type: "tabPress",
            target: route.key,
            canPreventDefault: true,
          });

          if (!isFocused && !event.defaultPrevented) {
            navigation.navigate(route.name);
          }
        };

        const IconComponent = tabItem.icon;

        return (
          <Pressable
            key={route.key}
            onPress={onPress}
            style={{
              flex: 1,
              alignItems: "center",
              justifyContent: "center",
              paddingVertical: 14,
              marginHorizontal: 6,
              borderRadius: 20,
              backgroundColor: isFocused
                ? isDarkColorScheme
                  ? "#1e1e1e"
                  : "#f1f5f9"
                : "transparent",
              transform: [{ scale: isFocused ? 1.05 : 1 }],
            }}
            android_ripple={null}
            pressRetentionOffset={{ top: 0, left: 0, bottom: 0, right: 0 }}
            hitSlop={{ top: 0, left: 0, bottom: 0, right: 0 }}
          >
            <View
              style={{
                alignItems: "center",
                transform: [
                  { translateY: isFocused ? -2 : 0 },
                  { scale: isFocused ? 1.1 : 1 },
                ],
              }}
            >
              <IconComponent
                size={isFocused ? 26 : 22}
                color={
                  isFocused
                    ? isDarkColorScheme
                      ? "#ffffff"
                      : "#1e293b"
                    : isDarkColorScheme
                      ? "#888888"
                      : "#64748b"
                }
                strokeWidth={isFocused ? 2.5 : 2}
              />
              <Text
                style={{
                  fontSize: isFocused ? 12 : 11,
                  fontWeight: isFocused ? "700" : "600",
                  color: isFocused
                    ? isDarkColorScheme
                      ? "#ffffff"
                      : "#1e293b"
                    : isDarkColorScheme
                      ? "#888888"
                      : "#64748b",
                  marginTop: 6,
                  letterSpacing: 0.2,
                }}
              >
                {tabItem.label}
              </Text>
            </View>
          </Pressable>
        );
      })}
    </View>
  );
}
