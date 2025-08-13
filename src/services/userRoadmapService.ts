import { AuthUser } from '../services/authService';

const BASE = process.env.EXPO_PUBLIC_BACKEND_URL!;

export interface UserRoadmap {
  id: string;
  userId: string;
  topic: string;
  roadmapData: any;
  createdAt: string;
  updatedAt: string;
}

export class UserRoadmapService {
  // Generate a new roadmap for the current user
  static async generateRoadmapForUser(
    user: AuthUser, 
    topic: string, 
    userPreferences: any
  ): Promise<any> {
    try {
      const response = await fetch(`${BASE}/api/roadmaps/generate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          topic,
          userPreferences,
          userId: user.id, // Include user ID
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();

      if (!result.success) {
        throw new Error(result.error?.message || 'Failed to generate roadmap');
      }

      // Store the roadmap for the user
      await this.storeRoadmapForUser(user.id, topic, result.data);

      return result.data;
    } catch (error) {
      console.error('Error generating roadmap for user:', error);
      throw error;
    }
  }

  // Store a roadmap for a specific user
  static async storeRoadmapForUser(
    userId: string, 
    topic: string, 
    roadmapData: any
  ): Promise<UserRoadmap> {
    try {
      const response = await fetch(`${BASE}/api/users/roadmaps`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId,
          topic,
          roadmapData,
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();

      if (!result.success) {
        throw new Error(result.error?.message || 'Failed to store roadmap');
      }

      return result.data;
    } catch (error) {
      console.error('Error storing roadmap for user:', error);
      throw error;
    }
  }

  // Get all roadmaps for a specific user
  static async getUserRoadmaps(userId: string): Promise<UserRoadmap[]> {
    try {
      console.log('Fetching roadmaps for user:', userId);
      const response = await fetch(`${BASE}/api/users/roadmaps/${userId}`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      console.log('getUserRoadmaps response:', result);

      if (!result.success) {
        throw new Error(result.error?.message || 'Failed to fetch user roadmaps');
      }

      console.log('Returning roadmaps:', result.data || []);
      return result.data || [];
    } catch (error) {
      console.error('Error fetching user roadmaps:', error);
      return [];
    }
  }

  // Generate playlists for a specific roadmap point
  static async generatePlaylistsForUser(
    userId: string,
    topic: string, 
    pointTitle: string, 
    userPreferences: any
  ): Promise<any[]> {
    try {
      const response = await fetch(`${BASE}/api/playlists/generate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          topic,
          pointTitle,
          userPreferences,
          userId,
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();

      if (!result.success) {
        throw new Error(result.error?.message || 'Failed to generate playlists');
      }

      return result.data || [];
    } catch (error) {
      console.error('Error generating playlists for user:', error);
      throw error;
    }
  }
}

export default UserRoadmapService;
