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
    await AsyncStorage.clear();
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
