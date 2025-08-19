const BACKEND_URL = process.env.EXPO_PUBLIC_BACKEND_URL || 'http://localhost:8001';

export interface UserSettings {
  id?: string;
  user_id: string;
  full_name?: string;
  about_description?: string;
  theme: 'light' | 'dark';
  default_roadmap_depth: 'basic' | 'detailed' | 'comprehensive';
  default_video_length: 'short' | 'medium' | 'long';
  created_at?: string;
  updated_at?: string;
}

export interface UpdateUserSettingsRequest {
  full_name?: string;
  about_description?: string;
  theme?: 'light' | 'dark';
  default_roadmap_depth?: 'basic' | 'detailed' | 'comprehensive';
  default_video_length?: 'short' | 'medium' | 'long';
}

class UserSettingsService {
  // Get user settings
  async getUserSettings(userId: string): Promise<UserSettings> {
    try {
      const response = await fetch(`${BACKEND_URL}/api/users/settings/${userId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error?.message || 'Failed to fetch user settings');
      }

      return data.data;
    } catch (error) {
      console.error('Get user settings error:', error);
      throw error;
    }
  }

  // Update user settings
  async updateUserSettings(userId: string, settings: UpdateUserSettingsRequest): Promise<UserSettings> {
    try {
      const response = await fetch(`${BACKEND_URL}/api/users/settings/${userId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(settings),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error?.message || 'Failed to update user settings');
      }

      return data.data.settings;
    } catch (error) {
      console.error('Update user settings error:', error);
      throw error;
    }
  }

  // Create user settings (for initialization)
  async createUserSettings(userId: string, settings: UpdateUserSettingsRequest = {}): Promise<UserSettings> {
    try {
      const response = await fetch(`${BACKEND_URL}/api/users/settings/${userId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(settings),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error?.message || 'Failed to create user settings');
      }

      return data.data.settings;
    } catch (error) {
      console.error('Create user settings error:', error);
      throw error;
    }
  }

  // Delete user settings
  async deleteUserSettings(userId: string): Promise<void> {
    try {
      const response = await fetch(`${BACKEND_URL}/api/users/settings/${userId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error?.message || 'Failed to delete user settings');
      }
    } catch (error) {
      console.error('Delete user settings error:', error);
      throw error;
    }
  }

  // Helper method to get default settings
  getDefaultSettings(): UpdateUserSettingsRequest {
    return {
      theme: 'light',
      default_roadmap_depth: 'detailed',
      default_video_length: 'medium',
    };
  }

  // Helper method to apply theme to app
  applyTheme(theme: 'light' | 'dark') {
    // This would typically be handled by a theme provider
    // For now, we'll just log the theme change
    console.log(`Applying theme: ${theme}`);
  }

  // Clear all user data
  async clearAllUserData(userId: string): Promise<void> {
    try {
      const response = await fetch(`${BACKEND_URL}/api/users/clear-data/${userId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error?.message || 'Failed to clear user data');
      }
    } catch (error) {
      console.error('Clear user data error:', error);
      throw error;
    }
  }

  // Delete user account completely
  async deleteUserAccount(userId: string): Promise<void> {
    try {
      const response = await fetch(`${BACKEND_URL}/api/users/account/${userId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error?.message || 'Failed to delete user account');
      }
    } catch (error) {
      console.error('Delete user account error:', error);
      throw error;
    }
  }
}

export default new UserSettingsService();
