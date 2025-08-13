import * as React from "react";
import { useEffect } from "react";
import { View, Image, StyleSheet } from "react-native";
import * as SplashScreen from "expo-splash-screen";
import { useColorScheme } from "~/lib/utils/useColorScheme";

SplashScreen.preventAutoHideAsync();

interface CustomSplashScreenProps {
  onFinish: () => void;
}

export default function CustomSplashScreen({
  onFinish,
}: CustomSplashScreenProps) {
  const { isDarkColorScheme } = useColorScheme();

  useEffect(() => {
    const timer = setTimeout(() => {
      SplashScreen.hideAsync();
      onFinish();
    }, 2000);

    return () => clearTimeout(timer);
  }, [onFinish]);

  return (
    <View
      style={[
        styles.container,
        { backgroundColor: isDarkColorScheme ? "#000000" : "#ffffff" },
      ]}
    >
      <Image
        source={require("../../../assets/splash-icon.png")}
        style={styles.logo}
        resizeMode="contain"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  logo: {
    width: 200,
    height: 200,
  },
});
