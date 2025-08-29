// API Configuration for SkillSpark Backend
import AsyncStorage from '@react-native-async-storage/async-storage';

// Backend API URL
const BACKEND_URL = process.env.EXPO_PUBLIC_BACKEND_URL;

if (!BACKEND_URL) {
  throw new Error('EXPO_PUBLIC_BACKEND_URL is not defined. Please check your .env file.');
}

// API Client Configuration
class ApiClient {
  private baseURL: string;

  constructor(baseURL: string) {
    this.baseURL = baseURL.endsWith('/') ? baseURL.slice(0, -1) : baseURL;
  }

  // Generic request method
  private async request(endpoint: string, options: RequestInit = {}): Promise<any> {
    const url = `${this.baseURL}${endpoint}`;
    
    const config: RequestInit = {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    };

    try {
      const response = await fetch(url, config);
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `HTTP ${response.status}: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error(`API Request failed for ${endpoint}:`, error);
      throw error;
    }
  }

  // GET request
  async get(endpoint: string, headers?: Record<string, string>) {
    return this.request(endpoint, { method: 'GET', headers });
  }

  // POST request
  async post(endpoint: string, data?: any, headers?: Record<string, string>) {
    return this.request(endpoint, {
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined,
      headers,
    });
  }

  // PUT request
  async put(endpoint: string, data?: any, headers?: Record<string, string>) {
    return this.request(endpoint, {
      method: 'PUT',
      body: data ? JSON.stringify(data) : undefined,
      headers,
    });
  }

  // DELETE request
  async delete(endpoint: string, headers?: Record<string, string>) {
    return this.request(endpoint, { method: 'DELETE', headers });
  }
}

// Create and export API client instance
export const apiClient = new ApiClient(BACKEND_URL);

// Video Generation API Methods
export const VideoAPI = {
  // Generate videos for a single point
  async generatePointVideos(userRoadmapId: string, level: string, topic: string, pointId: string, page = 1) {
    try {
      const response = await apiClient.post('/api/playlist/generate', {
        userRoadmapId,
        level,
        topic,
        pointId,
        page
      });
      return response;
    } catch (error) {
      console.error('Error generating point videos:', error);
      throw error;
    }
  },

  // Generate videos for all points in a level (bulk generation)
  async generateBulkVideos(userRoadmapId: string, level: string, topic: string, points: any[], page = 1) {
    try {
      const response = await apiClient.post('/api/playlist/generate-bulk', {
        userRoadmapId,
        level,
        topic,
        points,
        page
      });
      return response;
    } catch (error) {
      console.error('Error generating bulk videos:', error);
      throw error;
    }
  },

  // Get videos for a specific point
  async getPointVideos(userRoadmapId: string, level: string, pointId: string, page = 1) {
    try {
      const response = await apiClient.get(`/api/playlist/user/${userRoadmapId}/${level}?page=${page}&pointId=${pointId}`);
      return response;
    } catch (error) {
      console.error('Error fetching point videos:', error);
      throw error;
    }
  },

  // Get all point videos for a level
  async getAllPointVideosForLevel(userRoadmapId: string, level: string, page = 1) {
    try {
      const response = await apiClient.get(`/api/playlist/point-videos/${userRoadmapId}/${level}?page=${page}`);
      return response;
    } catch (error) {
      console.error('Error fetching all point videos:', error);
      throw error;
    }
  },

  // Regenerate videos for a specific point
  async regeneratePointVideos(userRoadmapId: string, level: string, topic: string, pointId: string, page = 1) {
    try {
      const response = await apiClient.post('/api/playlist/regenerate', {
        userRoadmapId,
        level,
        topic,
        pointId,
        page
      });
      return response;
    } catch (error) {
      console.error('Error regenerating point videos:', error);
      throw error;
    }
  }
};

// User Storage Helper (replacing legacy auth storage with Neon-backed authentication)
export const UserStorage = {
  async getUser() {
    try {
      const userString = await AsyncStorage.getItem('user');
      return userString ? JSON.parse(userString) : null;
    } catch (error) {
      console.error('Error getting user from storage:', error);
      return null;
    }
  },

  async setUser(user: User) {
    try {
      await AsyncStorage.setItem('user', JSON.stringify(user));
    } catch (error) {
      console.error('Error saving user to storage:', error);
    }
  },

  async removeUser() {
    try {
      await AsyncStorage.removeItem('user');
    } catch (error) {
      console.error('Error removing user from storage:', error);
    }
  },

  async isAuthenticated(): Promise<boolean> {
    const user = await this.getUser();
    return user !== null;
  }
};

// Database types (keeping the same interface as before)
export interface User {
  id: string;
  username: string;
  created_at?: string;
}

export interface UserTopic {
  id: string;
  user_id: string;
  topic: string;
  created_at?: string;
}

export interface UserRoadmap {
  id: string;
  user_topic_id?: string;
  userId?: string;
  topic?: string;
  roadmapData: any; // JSON data
  created_at?: string;
  updated_at?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface UserVideo {
  id: string;
  user_roadmap_id: string;
  level: 'basic' | 'medium' | 'advanced' | 'beginner' | 'intermediate';
  video_data: any; // JSON data
  created_at?: string;
}

export interface UserSettings {
  id: string;
  user_id: string;
  full_name?: string;
  about_description?: string;
  theme: 'light' | 'dark';
  default_roadmap_depth: 'basic' | 'detailed' | 'comprehensive';
  default_video_length: 'short' | 'medium' | 'long';
  created_at?: string;
  updated_at?: string;
}

// API Response interfaces
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
}

// Export the backend URL for direct use if needed
export { BACKEND_URL };

// Legacy auth compatibility layer - all auth now handled by Neon backend
export const legacyAuth = {
  // Authentication methods for backward compatibility
  auth: {
    getUser: UserStorage.getUser,
    signOut: UserStorage.removeUser,
  }
};
