import React from "react";
import { View, Text } from "react-native";

interface SectionHeaderProps {
  title: string;
  subtitle?: string;
}

export default function SectionHeader({ title, subtitle }: SectionHeaderProps) {
  return (
    <View className="mb-6 mt-8 first:mt-0">
      <Text className="text-2xl font-bold text-foreground mb-2">{title}</Text>
      {subtitle && (
        <Text className="text-base text-muted-foreground leading-relaxed">
          {subtitle}
        </Text>
      )}
    </View>
  );
}
