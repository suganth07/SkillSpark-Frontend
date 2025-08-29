import { useState, useCallback } from 'react';
import { VideoGenerationService, VideoGenerationResult, BulkGenerationResult, PointVideo } from '../services/videoGenerationService';

export interface UseVideoGenerationReturn {
  // State
  isGenerating: boolean;
  isLoading: boolean;
  error: string | null;
  progress: {
    current: number;
    total: number;
    percentage: number;
  } | null;

  // Single point operations
  generatePointVideos: (
    userRoadmapId: string,
    level: string,
    topic: string,
    pointId: string,
    page?: number
  ) => Promise<VideoGenerationResult>;
  
  getPointVideos: (
    userRoadmapId: string,
    level: string,
    pointId: string,
    page?: number
  ) => Promise<any[]>;
  
  regeneratePointVideos: (
    userRoadmapId: string,
    level: string,
    topic: string,
    pointId: string,
    page?: number
  ) => Promise<VideoGenerationResult>;

  // Bulk operations
  generateVideosForLevel: (
    userRoadmapId: string,
    level: string,
    topic: string,
    points: any[],
    page?: number
  ) => Promise<BulkGenerationResult>;
  
  getAllPointVideosForLevel: (
    userRoadmapId: string,
    level: string,
    page?: number
  ) => Promise<{ [pointId: string]: PointVideo }>;

  // Utility functions
  hasPointVideos: (
    userRoadmapId: string,
    level: string,
    pointId: string,
    page?: number
  ) => Promise<boolean>;
  
  getPointsNeedingVideos: (
    userRoadmapId: string,
    level: string,
    allPoints: any[],
    page?: number
  ) => Promise<any[]>;
  
  clearError: () => void;
  clearCache: () => Promise<void>;
}

/**
 * Hook for managing video generation operations
 */
export const useVideoGeneration = (): UseVideoGenerationReturn => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [progress, setProgress] = useState<{
    current: number;
    total: number;
    percentage: number;
  } | null>(null);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const clearCache = useCallback(async () => {
    try {
      await VideoGenerationService.clearAllCache();
    } catch (err) {
      console.error('Error clearing cache:', err);
    }
  }, []);

  const generatePointVideos = useCallback(async (
    userRoadmapId: string,
    level: string,
    topic: string,
    pointId: string,
    page = 1
  ): Promise<VideoGenerationResult> => {
    setIsGenerating(true);
    setError(null);
    setProgress({ current: 1, total: 1, percentage: 0 });

    try {
      const result = await VideoGenerationService.generateVideosForPoint(
        userRoadmapId,
        level,
        topic,
        pointId,
        page
      );

      setProgress({ current: 1, total: 1, percentage: 100 });
      
      if (!result.success) {
        setError(result.error || 'Failed to generate videos');
      }

      return result;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
      setError(errorMessage);
      return {
        success: false,
        pointId,
        title: 'Failed',
        videoCount: 0,
        status: 'failed',
        error: errorMessage
      };
    } finally {
      setIsGenerating(false);
      setProgress(null);
    }
  }, []);

  const getPointVideos = useCallback(async (
    userRoadmapId: string,
    level: string,
    pointId: string,
    page = 1
  ): Promise<any[]> => {
    setIsLoading(true);
    setError(null);

    try {
      const videos = await VideoGenerationService.getPointVideos(
        userRoadmapId,
        level,
        pointId,
        page
      );
      return videos;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch videos';
      setError(errorMessage);
      return [];
    } finally {
      setIsLoading(false);
    }
  }, []);

  const regeneratePointVideos = useCallback(async (
    userRoadmapId: string,
    level: string,
    topic: string,
    pointId: string,
    page = 1
  ): Promise<VideoGenerationResult> => {
    setIsGenerating(true);
    setError(null);
    setProgress({ current: 1, total: 1, percentage: 0 });

    try {
      const result = await VideoGenerationService.regeneratePointVideos(
        userRoadmapId,
        level,
        topic,
        pointId,
        page
      );

      setProgress({ current: 1, total: 1, percentage: 100 });
      
      if (!result.success) {
        setError(result.error || 'Failed to regenerate videos');
      }

      return result;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
      setError(errorMessage);
      return {
        success: false,
        pointId,
        title: 'Failed',
        videoCount: 0,
        status: 'failed',
        error: errorMessage
      };
    } finally {
      setIsGenerating(false);
      setProgress(null);
    }
  }, []);

  const generateVideosForLevel = useCallback(async (
    userRoadmapId: string,
    level: string,
    topic: string,
    points: any[],
    page = 1
  ): Promise<BulkGenerationResult> => {
    setIsGenerating(true);
    setError(null);
    setProgress({ current: 0, total: points.length, percentage: 0 });

    try {
      // Simulate progress updates during bulk generation
      const progressInterval = setInterval(() => {
        setProgress(prev => {
          if (!prev) return null;
          const newCurrent = Math.min(prev.current + 1, prev.total);
          return {
            current: newCurrent,
            total: prev.total,
            percentage: Math.round((newCurrent / prev.total) * 100)
          };
        });
      }, 1000); // Update progress every second

      const result = await VideoGenerationService.generateVideosForLevel(
        userRoadmapId,
        level,
        topic,
        points,
        page
      );

      clearInterval(progressInterval);
      setProgress({ current: points.length, total: points.length, percentage: 100 });
      
      if (!result.success) {
        setError('Some videos failed to generate. Check results for details.');
      }

      return result;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Bulk generation failed';
      setError(errorMessage);
      return {
        success: false,
        summary: { total: points.length, successful: 0, failed: points.length },
        results: [],
        errors: [{ pointId: 'all', title: 'Bulk operation', error: errorMessage }]
      };
    } finally {
      setIsGenerating(false);
      setTimeout(() => setProgress(null), 2000); // Clear progress after 2 seconds
    }
  }, []);

  const getAllPointVideosForLevel = useCallback(async (
    userRoadmapId: string,
    level: string,
    page = 1
  ): Promise<{ [pointId: string]: PointVideo }> => {
    setIsLoading(true);
    setError(null);

    try {
      const pointVideos = await VideoGenerationService.getAllPointVideosForLevel(
        userRoadmapId,
        level,
        page
      );
      return pointVideos;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch level videos';
      setError(errorMessage);
      return {};
    } finally {
      setIsLoading(false);
    }
  }, []);

  const hasPointVideos = useCallback(async (
    userRoadmapId: string,
    level: string,
    pointId: string,
    page = 1
  ): Promise<boolean> => {
    try {
      return await VideoGenerationService.hasPointVideos(
        userRoadmapId,
        level,
        pointId,
        page
      );
    } catch (err) {
      console.error('Error checking point videos:', err);
      return false;
    }
  }, []);

  const getPointsNeedingVideos = useCallback(async (
    userRoadmapId: string,
    level: string,
    allPoints: any[],
    page = 1
  ): Promise<any[]> => {
    setIsLoading(true);
    setError(null);

    try {
      const pointsNeeding = await VideoGenerationService.getPointsNeedingVideos(
        userRoadmapId,
        level,
        allPoints,
        page
      );
      return pointsNeeding;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to check points';
      setError(errorMessage);
      return allPoints; // Return all points if check fails
    } finally {
      setIsLoading(false);
    }
  }, []);

  return {
    // State
    isGenerating,
    isLoading,
    error,
    progress,

    // Single point operations
    generatePointVideos,
    getPointVideos,
    regeneratePointVideos,

    // Bulk operations
    generateVideosForLevel,
    getAllPointVideosForLevel,

    // Utility functions
    hasPointVideos,
    getPointsNeedingVideos,
    clearError,
    clearCache
  };
};
