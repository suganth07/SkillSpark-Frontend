import React, { useEffect, useState } from "react";
import { View, Text, Pressable } from "react-native";
import {
  fetchUserDescription,
  setUserDescription,
} from "~/queries/user-queries";
import { Input } from "~/components/ui/input";
import BottomSheet from "~/components/ui/BottomSheet";
import Icon from "~/lib/icons/Icon";
import { useFocusEffect } from "expo-router";
import { useDataRefresh } from "~/lib/utils/DataRefreshContext";

export default function DescriptionSetting() {
  const [description, setDescription] = useState("");
  const [tempDescription, setTempDescription] = useState("");
  const [showBottomSheet, setShowBottomSheet] = useState(false);
  const { refreshTrigger } = useDataRefresh();

  const loadDescription = async () => {
    const storedDescription = await fetchUserDescription();
    setDescription(storedDescription);
    setTempDescription(storedDescription);
  };

  useEffect(() => {
    loadDescription();
  }, []);

  useFocusEffect(
    React.useCallback(() => {
      loadDescription();
    }, [])
  );

  useEffect(() => {
    loadDescription();
  }, [refreshTrigger]);

  const handleSave = async () => {
    setDescription(tempDescription);
    await setUserDescription(tempDescription);
    setShowBottomSheet(false);
  };

  const handleCancel = () => {
    setTempDescription(description);
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
            About You
          </Text>
          <Text className="text-sm text-muted-foreground">
            {description ||
              "Tell us about yourself (e.g., student, professional, etc.)"}
          </Text>
        </View>
        <Icon name="ChevronRight" size={16} />
      </Pressable>

      <BottomSheet isVisible={showBottomSheet} onClose={handleCancel}>
        <View className="p-4">
          <Text className="text-xl font-bold text-foreground mb-2">
            About You
          </Text>
          <Text className="text-sm text-muted-foreground mb-4">
            Tell us a bit about yourself
          </Text>
          <Input
            value={tempDescription}
            onChangeText={setTempDescription}
            placeholder="e.g., Computer Science student, Software Engineer, etc."
            multiline={true}
            numberOfLines={4}
            textAlignVertical="top"
            className="mb-6 min-h-24"
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
