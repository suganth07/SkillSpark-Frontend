import React, { useEffect, useState } from "react";
import { View, Text, Pressable } from "react-native";
import { fetchUserName, setUserName } from "~/queries/user-queries-new";
import { Input } from "~/components/ui/input";
import BottomSheet from "~/components/ui/BottomSheet";
import Icon from "~/lib/icons/Icon";
import { useFocusEffect } from "expo-router";
import { useDataRefresh } from "~/lib/utils/DataRefreshContext";

export default function NameSetting() {
  const [name, setName] = useState("");
  const [tempName, setTempName] = useState("");
  const [showBottomSheet, setShowBottomSheet] = useState(false);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const { refreshTrigger } = useDataRefresh();

  const loadName = async () => {
    try {
      setLoading(true);
      const storedName = await fetchUserName();
      setName(storedName);
      setTempName(storedName);
    } catch (error) {
      console.error("Error loading name:", error);
    } finally {
      setLoading(false);
    }
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
    try {
      setSaving(true);
      setName(tempName);
      await setUserName(tempName);
      setShowBottomSheet(false);
    } catch (error) {
      console.error("Error saving name:", error);
      // Revert on error
      setTempName(name);
    } finally {
      setSaving(false);
    }
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
        disabled={loading}
      >
        <View className="flex-1">
          <Text className="text-base font-medium text-foreground mb-1">
            Full Name
          </Text>
          <Text className="text-sm text-muted-foreground">
            {loading ? "Loading..." : (name || "Enter your full name")}
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
            editable={!saving}
          />

          <View className="flex-row gap-3">
            <Pressable
              className="flex-1 bg-muted py-3 rounded-lg items-center"
              onPress={handleCancel}
              disabled={saving}
            >
              <Text className="text-foreground font-medium">Cancel</Text>
            </Pressable>

            <Pressable
              className={`flex-1 py-3 rounded-lg items-center ${
                saving ? "bg-muted" : "bg-primary"
              }`}
              onPress={handleSave}
              disabled={saving}
            >
              <Text className={`font-medium ${
                saving ? "text-muted-foreground" : "text-primary-foreground"
              }`}>
                {saving ? "Saving..." : "Save"}
              </Text>
            </Pressable>
          </View>
        </View>
      </BottomSheet>
    </View>
  );
}
