import React, { useState } from "react";
import { View, Text, Pressable, Alert } from "react-native";
import { clearUserData } from "~/queries/user-queries";
import userSettingsService from "~/services/userSettingsService";
import authService from "~/services/authService";
import BottomSheet from "~/components/ui/BottomSheet";
import Icon from "~/lib/icons/Icon";
import { useDataRefresh } from "~/lib/utils/DataRefreshContext";
import { router } from "expo-router";

export default function ClearDataSetting() {
  const [showClearBottomSheet, setShowClearBottomSheet] = useState(false);
  const [showDeleteBottomSheet, setShowDeleteBottomSheet] = useState(false);
  const [clearing, setClearing] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const { triggerRefresh } = useDataRefresh();

  const handleClearAllData = async () => {
    try {
      setClearing(true);
      
      // Get current user before clearing
      const currentUser = await authService.getCurrentUser();
      
      if (currentUser) {
        try {
          // Clear all data from backend including roadmaps, videos, etc.
          await userSettingsService.clearAllUserData(currentUser.id);
        } catch (error) {
          console.error("Error clearing backend data:", error);
          Alert.alert(
            "Error", 
            "Failed to clear data from server. Please try again."
          );
          return;
        }
      }
      
      // Clear local data
      await clearUserData();
      
      setShowClearBottomSheet(false);
      triggerRefresh();
      
      Alert.alert("Success", "All your data including roadmaps, videos, and settings have been cleared successfully.");
    } catch (error) {
      console.error("Error clearing data:", error);
      Alert.alert(
        "Error", 
        "There was an issue clearing your data. Please try again."
      );
    } finally {
      setClearing(false);
    }
  };

  const handleDeleteAccount = async () => {
    try {
      setDeleting(true);
      
      // Get current user before deletion
      const currentUser = await authService.getCurrentUser();
      
      if (!currentUser) {
        Alert.alert("Error", "No user account found to delete.");
        return;
      }

      try {
        // Delete account completely from backend
        await userSettingsService.deleteUserAccount(currentUser.id);
        
        // Clear local data
        await clearUserData();
        
        setShowDeleteBottomSheet(false);
        
        Alert.alert(
          "Account Deleted", 
          "Your account and all associated data have been permanently deleted.",
          [
            {
              text: "OK",
              onPress: () => {
                // Navigate to login/welcome screen
                router.replace('/auth/login');
              }
            }
          ]
        );
      } catch (error) {
        console.error("Error deleting account:", error);
        Alert.alert(
          "Error", 
          "Failed to delete your account. Please try again or contact support."
        );
      }
    } catch (error) {
      console.error("Error in delete account flow:", error);
      Alert.alert("Error", "An unexpected error occurred.");
    } finally {
      setDeleting(false);
    }
  };

  const showDeleteConfirmation = () => {
    console.log("Delete account button pressed"); // Debug log
    
    Alert.alert(
      "Delete Account",
      "Are you absolutely sure you want to delete your account? This action cannot be undone and will permanently remove:\n\n• Your account and profile\n• All roadmaps and progress\n• All saved videos and playlists\n• All settings and preferences\n• Everything associated with your account",
      [
        {
          text: "Cancel",
          style: "cancel",
          onPress: () => console.log("Delete cancelled")
        },
        {
          text: "Delete Account",
          style: "destructive",
          onPress: () => {
            console.log("Delete confirmed, showing bottom sheet");
            setShowDeleteBottomSheet(true);
          }
        }
      ]
    );
  };

  return (
    <View className="mb-6">
      {/* Clear All Data Button */}
      <Pressable
        className="flex-row justify-between items-center py-3 mb-4"
        onPress={() => setShowClearBottomSheet(true)}
        disabled={clearing || deleting}
      >
        <View className="flex-1">
          <Text className="text-base font-medium text-foreground mb-1">
            Clear All Data
          </Text>
          <Text className="text-sm text-muted-foreground">
            {clearing 
              ? "Clearing data..." 
              : "Remove all roadmaps, videos, and settings"
            }
          </Text>
        </View>
        <Icon name="ChevronRight" size={16} />
      </Pressable>

      {/* Delete Account Button */}
      <Pressable
        className="flex-row justify-between items-center py-3"
        onPress={() => {
          console.log("Delete Account button pressed");
          showDeleteConfirmation();
        }}
        disabled={clearing || deleting}
      >
        <View className="flex-1">
          <Text className="text-base font-medium text-destructive mb-1">
            Delete Account
          </Text>
          <Text className="text-sm text-muted-foreground">
            {deleting 
              ? "Deleting account..." 
              : "Permanently delete your account and all data"
            }
          </Text>
        </View>
        <Icon name="ChevronRight" size={16} />
      </Pressable>

      {/* Clear Data Bottom Sheet */}
      <BottomSheet
        isVisible={showClearBottomSheet}
        onClose={() => setShowClearBottomSheet(false)}
      >
        <View className="p-4">
          <Text className="text-xl font-bold text-foreground mb-2">
            Clear All Data
          </Text>
          <Text className="text-muted-foreground mb-6 leading-6">
            Are you sure you want to clear all your data? This will remove:
            {"\n"}• All roadmaps and learning progress
            {"\n"}• All saved videos and playlists
            {"\n"}• Your name and description
            {"\n"}• All preferences and settings
            {"\n"}{"\n"}Your account will remain active but all content will be cleared.
          </Text>

          <View className="flex-row gap-3">
            <Pressable
              className="flex-1 bg-muted py-3 rounded-lg items-center"
              onPress={() => setShowClearBottomSheet(false)}
              disabled={clearing}
            >
              <Text className="text-foreground font-medium">Cancel</Text>
            </Pressable>

            <Pressable
              className={`flex-1 py-3 rounded-lg items-center ${
                clearing ? "bg-muted" : "bg-destructive"
              }`}
              onPress={handleClearAllData}
              disabled={clearing}
            >
              <Text className={`font-medium ${
                clearing ? "text-muted-foreground" : "text-destructive-foreground"
              }`}>
                {clearing ? "Clearing..." : "Clear All Data"}
              </Text>
            </Pressable>
          </View>
        </View>
      </BottomSheet>

      {/* Delete Account Bottom Sheet */}
      <BottomSheet
        isVisible={showDeleteBottomSheet}
        onClose={() => setShowDeleteBottomSheet(false)}
      >
        <View className="p-4">
          <Text className="text-xl font-bold text-destructive mb-2">
            Delete Account
          </Text>
          <Text className="text-muted-foreground mb-4 leading-6">
            This action is PERMANENT and cannot be undone. Your account and ALL associated data will be deleted forever.
          </Text>
          <Text className="text-destructive mb-6 leading-6 font-medium">
            ⚠️ This will permanently delete:
            {"\n"}• Your entire account
            {"\n"}• All roadmaps and progress
            {"\n"}• All videos and playlists
            {"\n"}• All settings and personal data
            {"\n"}• Everything associated with your account
          </Text>

          <View className="flex-row gap-3">
            <Pressable
              className="flex-1 bg-muted py-3 rounded-lg items-center"
              onPress={() => setShowDeleteBottomSheet(false)}
              disabled={deleting}
            >
              <Text className="text-foreground font-medium">Cancel</Text>
            </Pressable>

            <Pressable
              className={`flex-1 py-3 rounded-lg items-center ${
                deleting ? "bg-muted" : "bg-destructive"
              }`}
              onPress={handleDeleteAccount}
              disabled={deleting}
            >
              <Text className={`font-medium ${
                deleting ? "text-muted-foreground" : "text-destructive-foreground"
              }`}>
                {deleting ? "Deleting..." : "Delete Account"}
              </Text>
            </Pressable>
          </View>
        </View>
      </BottomSheet>
    </View>
  );
}
