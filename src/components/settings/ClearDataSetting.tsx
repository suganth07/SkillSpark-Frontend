import React, { useState } from "react";
import { View, Text, Pressable, Alert } from "react-native";
import { clearUserData } from "~/queries/user-queries";
import BottomSheet from "~/components/ui/BottomSheet";
import Icon from "~/lib/icons/Icon";
import { useDataRefresh } from "~/lib/utils/DataRefreshContext";

export default function ClearDataSetting() {
  const [showBottomSheet, setShowBottomSheet] = useState(false);
  const { triggerRefresh } = useDataRefresh();

  const handleClearData = async () => {
    await clearUserData();
    setShowBottomSheet(false);
    triggerRefresh();
    Alert.alert("Success", "All data has been cleared successfully.");
  };

  return (
    <View className="mb-6">
      <Pressable
        className="flex-row justify-between items-center py-3"
        onPress={() => setShowBottomSheet(true)}
      >
        <View className="flex-1">
          <Text className="text-base font-medium text-foreground mb-1">
            Clear All Data
          </Text>
          <Text className="text-sm text-muted-foreground">
            Remove all saved preferences and personal information
          </Text>
        </View>
        <Icon name="ChevronRight" size={16} />
      </Pressable>

      <BottomSheet
        isVisible={showBottomSheet}
        onClose={() => setShowBottomSheet(false)}
      >
        <View className="p-4">
          <Text className="text-xl font-bold text-foreground mb-2">
            Clear All Data
          </Text>
          <Text className="text-muted-foreground mb-6 leading-6">
            Are you sure you want to clear all your saved data? This action
            cannot be undone and will remove:
            {"\n"}• Your name and description
            {"\n"}• All preferences and settings
            {"\n"}• Any stored user data
          </Text>

          <View className="flex-row gap-3">
            <Pressable
              className="flex-1 bg-muted py-3 rounded-lg items-center"
              onPress={() => setShowBottomSheet(false)}
            >
              <Text className="text-foreground font-medium">Cancel</Text>
            </Pressable>

            <Pressable
              className="flex-1 bg-destructive py-3 rounded-lg items-center"
              onPress={handleClearData}
            >
              <Text className="text-destructive-foreground font-medium">
                Clear Data
              </Text>
            </Pressable>
          </View>
        </View>
      </BottomSheet>
    </View>
  );
}
