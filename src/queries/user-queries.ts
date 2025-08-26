import AsyncStorage from "@react-native-async-storage/async-storage";

const USER_KEY = "@SkillSpark_user";

export async function fetchUser() {
  try {
    const userData = await AsyncStorage.getItem(USER_KEY);
    return userData ? JSON.parse(userData) : null;
  } catch (error) {
    console.error("Error fetching user:", error);
    return null;
  }
}

export async function fetchUserName() {
  const user = await fetchUser();
  return user?.name || "";
}

export async function setUserName(name: string) {
  try {
    const user = (await fetchUser()) || {};
    user.name = name;
    await AsyncStorage.setItem(USER_KEY, JSON.stringify(user));
  } catch (error) {
    console.error("Error setting user name:", error);
  }
}

export async function setUserPreferences(preferences: any) {
  try {
    const user = (await fetchUser()) || {};
    user.preferences = preferences;
    await AsyncStorage.setItem(USER_KEY, JSON.stringify(user));
  } catch (error) {
    console.error("Error setting preferences:", error);
  }
}

export async function clearUserData() {
  try {
    // Clear only user data keys, preserving authentication session
    const keysToRemove = [
      "@SkillSpark_user",                    // Legacy user data
      "@SkillSpark_user_settings_cache",    // User settings cache
      "@SkillSpark_active_roadmap",         // Active roadmap
      // Note: We're NOT removing @SkillSpark_user_session to keep user authenticated
    ];
    
    // Remove specific keys instead of clearing everything
    await Promise.all(keysToRemove.map(key => AsyncStorage.removeItem(key)));
    
    // Also get all keys and remove any other SkillSpark data keys except user session
    const allKeys = await AsyncStorage.getAllKeys();
    const otherSkillSparkKeys = allKeys.filter(key => 
      key.startsWith('@SkillSpark_') && 
      key !== '@SkillSpark_user_session' // Preserve authentication
    );
    
    if (otherSkillSparkKeys.length > 0) {
      await Promise.all(otherSkillSparkKeys.map(key => AsyncStorage.removeItem(key)));
    }
    
  } catch (error) {
    console.error("Error clearing storage:", error);
  }
}

export async function fetchUserDescription() {
  const user = await fetchUser();
  return user?.description || "";
}

export async function setUserDescription(description: string) {
  try {
    const user = (await fetchUser()) || {};
    user.description = description;
    await AsyncStorage.setItem(USER_KEY, JSON.stringify(user));
  } catch (error) {
    console.error("Error setting user description:", error);
  }
}
