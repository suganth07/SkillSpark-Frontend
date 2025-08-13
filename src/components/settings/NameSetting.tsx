import React, { useEffect, useState } from "react";
import { View, Text, Pressable } from "react-native";
import { fetchUserName, setUserName } from "~/queries/user-queries";
import { Input } from "~/components/ui/input";
import BottomSheet from "~/components/ui/BottomSheet";
import Icon from "~/lib/icons/Icon";
import { useFocusEffect } from "expo-router";
import { useDataRefresh } from "~/lib/utils/DataRefreshContext";

export default function NameSetting() {
  const [name, setName] = useState("");
  const [tempName, setTempName] = useState("");
  const [showBottomSheet, setShowBottomSheet] = useState(false);
  const { refreshTrigger } = useDataRefresh();

  const loadName = async () => {
    const storedName = await fetchUserName();
    setName(storedName);
    setTempName(storedName);
  };

  useEffect(() => {
    loadName();
  }, []);

  useFocusEffect(
    React.useCallback(() => {
      loadName();
    }, [])
  );

  useEffect(() => {
    loadName();
  }, [refreshTrigger]);

  const handleSave = async () => {
    setName(tempName);
    await setUserName(tempName);
    setShowBottomSheet(false);
  };

  const handleCancel = () => {
    setTempName(name);
    setShowBottomSheet(false);
  };

  return (
    <View className="mb-6">
      <Pressable
        className="flex-row justify-between items-center py-3"
        onPress={() => setShowBottomSheet(true)}
      >
        <View className="flex-1">
          <Text className="text-base font-medium text-foreground mb-1">
            Full Name
          </Text>
          <Text className="text-sm text-muted-foreground">
            {name || "Enter your full name"}
          </Text>
        </View>
        <Icon name="ChevronRight" size={16} />
      </Pressable>

      <BottomSheet isVisible={showBottomSheet} onClose={handleCancel}>
        <View className="p-4">
          <Text className="text-xl font-bold text-foreground mb-4">
            Full Name
          </Text>
          <Input
            value={tempName}
            onChangeText={setTempName}
            placeholder="Enter your full name"
            className="mb-6"
          />

          <View className="flex-row gap-3">
            <Pressable
              className="flex-1 bg-muted py-3 rounded-lg items-center"
              onPress={handleCancel}
            >
              <Text className="text-foreground font-medium">Cancel</Text>
            </Pressable>

            <Pressable
              className="flex-1 bg-primary py-3 rounded-lg items-center"
              onPress={handleSave}
            >
              <Text className="text-primary-foreground font-medium">Save</Text>
            </Pressable>
          </View>
        </View>
      </BottomSheet>
    </View>
  );
}
