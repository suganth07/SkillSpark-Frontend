import React, { useState } from "react";
import { View, Text, Pressable, Alert, Platform } from "react-native";
import { clearUserData } from "~/queries/user-queries";
import userSettingsService from "~/services/userSettingsService";
import BottomSheet from "~/components/ui/BottomSheet";
import Icon from "~/lib/icons/Icon";
import { useDataRefresh } from "~/lib/utils/DataRefreshContext";
import { useAuth } from "~/lib/utils/AuthContext";
import { router } from "expo-router";

export default function ClearDataSetting() {
  const [showClearBottomSheet, setShowClearBottomSheet] = useState(false);
  const [showDeleteBottomSheet, setShowDeleteBottomSheet] = useState(false);
  const [clearing, setClearing] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const { triggerRefresh } = useDataRefresh();
  const { user, logout } = useAuth(); // Use AuthContext instead of authService

  const handleClearAllData = async () => {
    try {
      setClearing(true);
      
      // Check if user is available from AuthContext
      if (user) {
        try {
          // Clear all data from backend including roadmaps, videos, etc.
          await userSettingsService.clearAllUserData(user.id);
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
      
      // Use user from AuthContext instead of calling authService
      console.log("Current user for deletion:", user); // Debug log
      
      if (!user) {
        console.warn("No current user found for account deletion");
        if (Platform.OS === 'web') {
          console.error("No user account found to delete. Please try logging in again.");
        } else {
          Alert.alert("Error", "No user account found to delete. Please try logging in again.");
        }
        setDeleting(false);
        return;
      }

      try {
        console.log("Attempting to delete account for user ID:", user.id);
        
        // Delete account completely from backend
        await userSettingsService.deleteUserAccount(user.id);
        console.log("Account deleted successfully from backend");
        
        // Clear local data and logout using AuthContext
        await clearUserData();
        console.log("Local data cleared");
        
        setShowDeleteBottomSheet(false);
        
        // Handle success feedback differently for web vs mobile
        if (Platform.OS === 'web') {
          console.log("Account deleted successfully - redirecting to login");
          // For web, logout and navigate directly
          await logout();
          router.replace('/auth/login');
        } else {
          // For mobile, show success alert then redirect
          Alert.alert(
            "Account Deleted", 
            "Your account and all associated data have been permanently deleted.",
            [
              {
                text: "OK",
                onPress: async () => {
                  console.log("Redirecting to login page");
                  await logout();
                  router.replace('/(tabs)/');
                  setTimeout(() => {
                    router.replace('/auth/login');
                  }, 100);
                }
              }
            ]
          );
        }
      } catch (error) {
        console.error("Error deleting account from backend:", error);
        if (Platform.OS === 'web') {
          console.error("Failed to delete account:", error);
        } else {
          Alert.alert(
            "Error", 
            "Failed to delete your account. Please check your connection and try again."
          );
        }
      }
    } catch (error) {
      console.error("Error in delete account flow:", error);
      if (Platform.OS === 'web') {
        console.error("Unexpected error during account deletion:", error);
      } else {
        Alert.alert("Error", "An unexpected error occurred while deleting your account.");
      }
    } finally {
      setDeleting(false);
    }
  };

  const showDeleteConfirmation = () => {
    console.log("Delete account button pressed"); // Debug log
    
    // For web, directly show the bottom sheet since Alert.alert doesn't work properly
    if (Platform.OS === 'web') {
      console.log("Web platform detected - showing delete bottom sheet directly");
      setShowDeleteBottomSheet(true);
      return;
    }
    
    // For mobile platforms, show the Alert first
    setShowDeleteBottomSheet(true);
    
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
        {/* Temporarily remove icons to prevent crash */}
        <Text className="text-muted-foreground">›</Text>
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
        {/* Temporarily remove icons to prevent crash */}
        <Text className="text-muted-foreground">›</Text>
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
            ⚠️ Delete Account
          </Text>
          <Text className="text-muted-foreground mb-2 leading-6">
            {Platform.OS === 'web' ? (
              'Are you absolutely sure you want to delete your account? This action cannot be undone and will permanently remove:'
            ) : (
              'This action is PERMANENT and cannot be undone. Your account and ALL associated data will be deleted forever.'
            )}
          </Text>
          <Text className="text-destructive mb-6 leading-6 font-medium">
            🔥 This will permanently delete:
            {"\n"}• Your entire account and profile
            {"\n"}• All roadmaps and learning progress
            {"\n"}• All saved videos and playlists
            {"\n"}• All settings and personal data
            {"\n"}• Everything associated with your account
            {Platform.OS === 'web' ? '\n\n⚠️ THIS ACTION CANNOT BE UNDONE!' : ''}
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
                {deleting ? "Deleting..." : "🗑️ Delete Account"}
              </Text>
            </Pressable>
          </View>
        </View>
      </BottomSheet>
    </View>
  );
}
