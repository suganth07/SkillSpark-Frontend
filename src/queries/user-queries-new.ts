import AsyncStorage from "@react-native-async-storage/async-storage";
import userSettingsService, { UserSettings, UpdateUserSettingsRequest } from "~/services/userSettingsService";
import authService from "~/services/authService";

const USER_KEY = "@SkillSpark_user";
const USER_SETTINGS_CACHE_KEY = "@SkillSpark_user_settings_cache";

// Legacy function for backward compatibility (local data)
export async function fetchUser() {
  try {
    const userData = await AsyncStorage.getItem(USER_KEY);
    return userData ? JSON.parse(userData) : null;
  } catch (error) {
    console.error("Error fetching user:", error);
    return null;
  }
}

// New functions that integrate with backend

// Get user settings with caching
export async function fetchUserSettings(): Promise<UserSettings | null> {
  try {
    const currentUser = await authService.getCurrentUser();
    if (!currentUser) {
      console.log("No authenticated user found");
      return null;
    }

    // Try to fetch from backend
    try {
      const settings = await userSettingsService.getUserSettings(currentUser.id);
      
      // Cache the settings locally
      await AsyncStorage.setItem(USER_SETTINGS_CACHE_KEY, JSON.stringify(settings));
      
      return settings;
    } catch (error) {
      console.error("Error fetching settings from backend, trying cache:", error);
      
      // Fallback to cached settings
      const cachedSettings = await AsyncStorage.getItem(USER_SETTINGS_CACHE_KEY);
      if (cachedSettings) {
        return JSON.parse(cachedSettings);
      }
      
      // If no cache, return default settings
      return null;
    }
  } catch (error) {
    console.error("Error fetching user settings:", error);
    return null;
  }
}

// Update user settings
export async function updateUserSettings(updates: UpdateUserSettingsRequest): Promise<UserSettings | null> {
  try {
    const currentUser = await authService.getCurrentUser();
    if (!currentUser) {
      throw new Error("No authenticated user found");
    }

    const updatedSettings = await userSettingsService.updateUserSettings(currentUser.id, updates);
    
    // Update cache
    await AsyncStorage.setItem(USER_SETTINGS_CACHE_KEY, JSON.stringify(updatedSettings));
    
    return updatedSettings;
  } catch (error) {
    console.error("Error updating user settings:", error);
    throw error;
  }
}

// Get user name from settings
export async function fetchUserName(): Promise<string> {
  const settings = await fetchUserSettings();
  return settings?.full_name || "";
}

// Set user name
export async function setUserName(name: string): Promise<void> {
  await updateUserSettings({ full_name: name });
}

// Get user description from settings
export async function fetchUserDescription(): Promise<string> {
  const settings = await fetchUserSettings();
  return settings?.about_description || "";
}

// Set user description
export async function setUserDescription(description: string): Promise<void> {
  await updateUserSettings({ about_description: description });
}

// Get user preferences from settings
export async function fetchUserPreferences(): Promise<{ depth: string; videoLength: string }> {
  const settings = await fetchUserSettings();
  
  if (!settings) {
    return { depth: "detailed", videoLength: "medium" };
  }

  // Map backend settings to frontend format
  const depthMapping: { [key: string]: string } = {
    'basic': 'Fast',
    'detailed': 'Balanced', 
    'comprehensive': 'Detailed'
  };

  const videoLengthMapping: { [key: string]: string } = {
    'short': 'Short',
    'medium': 'Medium',
    'long': 'Long'
  };

  return {
    depth: depthMapping[settings.default_roadmap_depth] || 'Balanced',
    videoLength: videoLengthMapping[settings.default_video_length] || 'Medium'
  };
}

// Set user preferences
export async function setUserPreferences(preferences: { depth: string; videoLength: string }): Promise<void> {
  // Map frontend format to backend format
  const depthMapping: { [key: string]: 'basic' | 'detailed' | 'comprehensive' } = {
    'Fast': 'basic',
    'Balanced': 'detailed',
    'Detailed': 'comprehensive'
  };

  const videoLengthMapping: { [key: string]: 'short' | 'medium' | 'long' } = {
    'Short': 'short',
    'Medium': 'medium',
    'Long': 'long'
  };

  await updateUserSettings({
    default_roadmap_depth: depthMapping[preferences.depth] || 'detailed',
    default_video_length: videoLengthMapping[preferences.videoLength] || 'medium'
  });
}

// Get theme from settings
export async function fetchUserTheme(): Promise<'light' | 'dark'> {
  const settings = await fetchUserSettings();
  return settings?.theme || 'light';
}

// Set theme
export async function setUserTheme(theme: 'light' | 'dark'): Promise<void> {
  await updateUserSettings({ theme });
}

// Legacy function for clearing user data
export async function clearUserData() {
  try {
    await AsyncStorage.clear();
  } catch (error) {
    console.error("Error clearing storage:", error);
  }
}

// Initialize user settings after login
export async function initializeUserSettings(): Promise<void> {
  try {
    const currentUser = await authService.getCurrentUser();
    if (!currentUser) {
      return;
    }

    // Try to fetch existing settings, or create default ones
    await fetchUserSettings();
  } catch (error) {
    console.error("Error initializing user settings:", error);
  }
}
