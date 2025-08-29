import { VideoAPI } from '../lib/api';
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface VideoGenerationResult {
  success: boolean;
  pointId: string;
  title: string;
  videoCount: number;
  status: 'generated' | 'existing' | 'failed';
  error?: string;
}

export interface BulkGenerationResult {
  success: boolean;
  summary: {
    total: number;
    successful: number;
    failed: number;
  };
  results: VideoGenerationResult[];
  errors?: Array<{ pointId: string; title: string; error: string }>;
}

export interface PointVideo {
  pointId: string;
  video_data: any[];
  generation_number: number;
  created_at: string;
  updated_at: string;
}

/**
 * Service for managing video generation for roadmap points
 */
export class VideoGenerationService {
  private static readonly CACHE_KEY_PREFIX = 'point_videos_';
  private static readonly CACHE_EXPIRY_HOURS = 24;

  /**
   * Generate videos for all points in a roadmap level
   */
  static async generateVideosForLevel(
    userRoadmapId: string,
    level: string,
    topic: string,
    points: any[],
    page = 1
  ): Promise<BulkGenerationResult> {
    try {
      console.log(`🎬 Starting bulk video generation for ${points.length} points in ${level} level`);
      
      const response = await VideoAPI.generateBulkVideos(userRoadmapId, level, topic, points, page);
      
      if (response.success || response.data) {
        // Clear cache for this level since we have new videos
        await this.clearLevelCache(userRoadmapId, level, page);
        
        console.log(`✅ Bulk generation completed: ${response.summary?.successful || 0} successful`);
        return {
          success: true,
          summary: response.summary || response.data?.summary || { total: 0, successful: 0, failed: 0 },
          results: response.results || response.data?.results || [],
          errors: response.errors || response.data?.errors
        };
      }
      
      throw new Error(response.error || 'Unknown error in bulk generation');
    } catch (error) {
      console.error('❌ Error in bulk video generation:', error);
      throw error;
    }
  }

  /**
   * Generate videos for a specific point
   */
  static async generateVideosForPoint(
    userRoadmapId: string,
    level: string,
    topic: string,
    pointId: string,
    page = 1
  ): Promise<VideoGenerationResult> {
    try {
      console.log(`🎯 Generating videos for point: ${pointId}`);
      
      const response = await VideoAPI.generatePointVideos(userRoadmapId, level, topic, pointId, page);
      
      if (response.success || response.data) {
        // Clear cache for this specific point
        await this.clearPointCache(userRoadmapId, level, pointId, page);
        
        return {
          success: true,
          pointId,
          title: 'Generated',
          videoCount: response.data?.videos?.length || 10,
          status: 'generated'
        };
      }
      
      throw new Error(response.error || 'Failed to generate videos');
    } catch (error) {
      console.error(`❌ Error generating videos for point ${pointId}:`, error);
      return {
        success: false,
        pointId,
        title: 'Failed',
        videoCount: 0,
        status: 'failed',
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * Get videos for a specific point with caching
   */
  static async getPointVideos(
    userRoadmapId: string,
    level: string,
    pointId: string,
    page = 1
  ): Promise<any[]> {
    try {
      const cacheKey = `${this.CACHE_KEY_PREFIX}${userRoadmapId}_${level}_${pointId}_${page}`;
      
      // Try to get from cache first
      const cachedData = await this.getCachedData(cacheKey);
      if (cachedData) {
        console.log(`📱 Using cached videos for point ${pointId}`);
        return cachedData;
      }
      
      console.log(`🔍 Fetching videos for point: ${pointId}`);
      const response = await VideoAPI.getPointVideos(userRoadmapId, level, pointId, page);
      
      if (response.success && response.data?.length > 0) {
        const videos = response.data[0]?.video_data || [];
        
        // Cache the videos
        await this.setCachedData(cacheKey, videos);
        
        return videos;
      }
      
      return [];
    } catch (error) {
      console.error(`❌ Error fetching videos for point ${pointId}:`, error);
      return [];
    }
  }

  /**
   * Get all point videos for a level
   */
  static async getAllPointVideosForLevel(
    userRoadmapId: string,
    level: string,
    page = 1
  ): Promise<{ [pointId: string]: PointVideo }> {
    try {
      console.log(`📋 Fetching all point videos for level: ${level}`);
      
      const response = await VideoAPI.getAllPointVideosForLevel(userRoadmapId, level, page);
      
      if (response.success && response.data) {
        return response.data;
      }
      
      return {};
    } catch (error) {
      console.error(`❌ Error fetching all point videos for level ${level}:`, error);
      return {};
    }
  }

  /**
   * Regenerate videos for a specific point
   */
  static async regeneratePointVideos(
    userRoadmapId: string,
    level: string,
    topic: string,
    pointId: string,
    page = 1
  ): Promise<VideoGenerationResult> {
    try {
      console.log(`🔄 Regenerating videos for point: ${pointId}`);
      
      const response = await VideoAPI.regeneratePointVideos(userRoadmapId, level, topic, pointId, page);
      
      if (response.success || response.data) {
        // Clear cache for this specific point
        await this.clearPointCache(userRoadmapId, level, pointId, page);
        
        return {
          success: true,
          pointId,
          title: 'Regenerated',
          videoCount: response.data?.videos?.length || 10,
          status: 'generated'
        };
      }
      
      throw new Error(response.error || 'Failed to regenerate videos');
    } catch (error) {
      console.error(`❌ Error regenerating videos for point ${pointId}:`, error);
      return {
        success: false,
        pointId,
        title: 'Failed',
        videoCount: 0,
        status: 'failed',
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * Check if a point has videos
   */
  static async hasPointVideos(
    userRoadmapId: string,
    level: string,
    pointId: string,
    page = 1
  ): Promise<boolean> {
    try {
      const videos = await this.getPointVideos(userRoadmapId, level, pointId, page);
      return videos.length > 0;
    } catch (error) {
      console.error(`❌ Error checking if point ${pointId} has videos:`, error);
      return false;
    }
  }

  /**
   * Get points that need video generation in a level
   */
  static async getPointsNeedingVideos(
    userRoadmapId: string,
    level: string,
    allPoints: any[],
    page = 1
  ): Promise<any[]> {
    try {
      const pointsNeedingVideos = [];
      
      for (const point of allPoints) {
        const hasVideos = await this.hasPointVideos(userRoadmapId, level, point.id, page);
        if (!hasVideos) {
          pointsNeedingVideos.push(point);
        }
      }
      
      console.log(`📝 Found ${pointsNeedingVideos.length} points needing videos out of ${allPoints.length} total`);
      return pointsNeedingVideos;
    } catch (error) {
      console.error('❌ Error finding points needing videos:', error);
      return allPoints; // If error, assume all need videos
    }
  }

  // Cache management methods
  private static async getCachedData(key: string): Promise<any | null> {
    try {
      const cached = await AsyncStorage.getItem(key);
      if (!cached) return null;
      
      const { data, timestamp } = JSON.parse(cached);
      const now = Date.now();
      const expiryTime = timestamp + (this.CACHE_EXPIRY_HOURS * 60 * 60 * 1000);
      
      if (now > expiryTime) {
        await AsyncStorage.removeItem(key);
        return null;
      }
      
      return data;
    } catch (error) {
      console.error('Error getting cached data:', error);
      return null;
    }
  }

  private static async setCachedData(key: string, data: any): Promise<void> {
    try {
      const cacheData = {
        data,
        timestamp: Date.now()
      };
      await AsyncStorage.setItem(key, JSON.stringify(cacheData));
    } catch (error) {
      console.error('Error setting cached data:', error);
    }
  }

  private static async clearPointCache(
    userRoadmapId: string,
    level: string,
    pointId: string,
    page: number
  ): Promise<void> {
    try {
      const cacheKey = `${this.CACHE_KEY_PREFIX}${userRoadmapId}_${level}_${pointId}_${page}`;
      await AsyncStorage.removeItem(cacheKey);
    } catch (error) {
      console.error('Error clearing point cache:', error);
    }
  }

  private static async clearLevelCache(
    userRoadmapId: string,
    level: string,
    page: number
  ): Promise<void> {
    try {
      // Clear all point caches for this level
      const allKeys = await AsyncStorage.getAllKeys();
      const keysToRemove = allKeys.filter(key => 
        key.startsWith(`${this.CACHE_KEY_PREFIX}${userRoadmapId}_${level}_`) &&
        key.endsWith(`_${page}`)
      );
      
      if (keysToRemove.length > 0) {
        await AsyncStorage.multiRemove(keysToRemove);
        console.log(`🗑️ Cleared ${keysToRemove.length} cached point videos for ${level} level`);
      }
    } catch (error) {
      console.error('Error clearing level cache:', error);
    }
  }

  /**
   * Clear all video caches
   */
  static async clearAllCache(): Promise<void> {
    try {
      const allKeys = await AsyncStorage.getAllKeys();
      const keysToRemove = allKeys.filter(key => key.startsWith(this.CACHE_KEY_PREFIX));
      
      if (keysToRemove.length > 0) {
        await AsyncStorage.multiRemove(keysToRemove);
        console.log(`🗑️ Cleared ${keysToRemove.length} cached video entries`);
      }
    } catch (error) {
      console.error('Error clearing all video caches:', error);
    }
  }
}
