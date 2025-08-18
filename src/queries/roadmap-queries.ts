import AsyncStorage from "@react-native-async-storage/async-storage";
import { fetchUser } from "./user-queries";
import authService from "../services/authService";

const ACTIVE_ROADMAP_KEY = "@SkillSpark_active_roadmap";

export interface UserPreferences {
  depth: "Fast" | "Balanced" | "Detailed";
  videoLength: "Short" | "Medium" | "Long";
}

export interface PlaylistItem {
  id: string;
  title: string;
  videoUrl: string;
  duration?: string;
  description?: string;
}

export interface RoadmapPoint {
  id: string;
  title: string;
  description: string;
  level: "beginner" | "intermediate" | "advanced";
  playlists: PlaylistItem[] | null;
  isCompleted?: boolean;
  order: number;
}

export interface Roadmap {
  id: string;
  topic: string;
  title: string;
  description: string;
  createdAt: string;
  updatedAt: string;
  points: RoadmapPoint[];
  progress?: {
    completedPoints: number;
    totalPoints: number;
    percentage: number;
  };
}

const BASE = process.env.EXPO_PUBLIC_BACKEND_URL!;
console.log("🔗 Backend URL:", BASE);

async function getUserPreferencesWithDefaults(): Promise<UserPreferences> {
  try {
    const user = await fetchUser();
    return (
      user?.preferences || {
        depth: "Balanced",
        videoLength: "Medium",
      }
    );
  } catch (error) {
    console.error("Error fetching user preferences:", error);
    return {
      depth: "Balanced",
      videoLength: "Medium",
    };
  }
}

export async function generateRoadmapFromBackend(
  topic: string
): Promise<Roadmap> {
  try {
    const preferences = await getUserPreferencesWithDefaults();

    const response = await fetch(`${BASE}/api/roadmaps/generate`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        topic,
        userPreferences: preferences,
      }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result = await response.json();

    if (!result.success) {
      throw new Error(result.error?.message || "Failed to generate roadmap");
    }

    return result.data;
  } catch (error) {
    console.error("Error generating roadmap from backend:", error);
    throw error;
  }
}

export async function saveRoadmap(roadmap: Roadmap): Promise<void> {
  try {
    const currentUser = await authService.getCurrentUser();
    if (!currentUser) {
      throw new Error("User not authenticated");
    }

    // Always save roadmap in backend - backend will handle create or update
    const response = await fetch(`${BASE}/api/users/roadmaps`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        userId: currentUser.id,
        topic: roadmap.topic,
        roadmapData: roadmap,
      }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result = await response.json();

    if (!result.success) {
      throw new Error(result.error?.message || "Failed to save roadmap");
    }

    console.log("Roadmap saved successfully for user:", currentUser.id);
  } catch (error) {
    console.error("Error saving roadmap:", error);
    throw error;
  }
}

export async function getAllRoadmaps(): Promise<Roadmap[]> {
  try {
    const currentUser = await authService.getCurrentUser();
    if (!currentUser) {
      console.log("User not authenticated, returning empty roadmaps");
      return [];
    }

    console.log("Fetching roadmaps for user ID:", currentUser.id);

    const response = await fetch(`${BASE}/api/users/roadmaps/${currentUser.id}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result = await response.json();

    if (!result.success) {
      throw new Error(result.error?.message || "Failed to fetch roadmaps");
    }

    console.log("Backend response for user roadmaps:", result.data);

    // Transform backend response to frontend format
    // Progress is now already included from the backend
    const transformedRoadmaps = (result.data || []).map((item: any) => ({
      id: item.id,
      topic: item.topic,
      title: item.roadmapData?.title || `${item.topic} Development Roadmap`,
      description: item.roadmapData?.description || `Complete learning path for ${item.topic} development`,
      createdAt: item.createdAt,
      updatedAt: item.updatedAt,
      points: item.roadmapData?.points || [],
      progress: item.roadmapData?.progress || {
        completedPoints: 0,
        totalPoints: item.roadmapData?.points?.length || 0,
        percentage: 0,
      },
    }));

    console.log("Transformed roadmaps for user:", transformedRoadmaps);
    
    return transformedRoadmaps;
  } catch (error) {
    console.error("Error fetching roadmaps:", error);
    return [];
  }
}

export async function getRoadmapById(id: string): Promise<Roadmap | null> {
  try {
    const roadmaps = await getAllRoadmaps();
    const roadmap = roadmaps.find((roadmap) => roadmap.id === id) || null;
    
    // Progress is already loaded from getAllRoadmaps, no need to load again
    return roadmap;
  } catch (error) {
    console.error("Error fetching roadmap by ID:", error);
    return null;
  }
}

export async function deleteRoadmap(id: string): Promise<void> {
  try {
    // Note: Backend API for delete roadmap not implemented yet
    // For now, we'll just remove from local active roadmap if it matches
    const activeRoadmap = await getActiveRoadmap();
    if (activeRoadmap?.id === id) {
      await clearActiveRoadmap();
    }
    
    // TODO: Implement backend DELETE endpoint for roadmaps
    console.warn("Delete roadmap API not implemented yet");
  } catch (error) {
    console.error("Error deleting roadmap:", error);
    throw error;
  }
}

export async function setActiveRoadmap(roadmap: Roadmap): Promise<void> {
  try {
    await AsyncStorage.setItem(ACTIVE_ROADMAP_KEY, JSON.stringify(roadmap));
    // Note: Roadmap will be saved to backend when saveRoadmap is called explicitly
  } catch (error) {
    console.error("Error setting active roadmap:", error);
    throw error;
  }
}

export async function getActiveRoadmap(): Promise<Roadmap | null> {
  try {
    const activeRoadmapData = await AsyncStorage.getItem(ACTIVE_ROADMAP_KEY);
    return activeRoadmapData ? JSON.parse(activeRoadmapData) : null;
  } catch (error) {
    console.error("Error fetching active roadmap:", error);
    return null;
  }
}

export async function clearActiveRoadmap(): Promise<void> {
  try {
    await AsyncStorage.removeItem(ACTIVE_ROADMAP_KEY);
  } catch (error) {
    console.error("Error clearing active roadmap:", error);
    throw error;
  }
}

export async function updateRoadmapProgress(
  roadmapId: string,
  pointId: string,
  isCompleted: boolean
): Promise<void> {
  try {
    const currentUser = await authService.getCurrentUser();
    if (!currentUser) {
      throw new Error("User not authenticated");
    }

    // Update progress in backend
    const response = await fetch(`${BASE}/api/users/roadmaps/${roadmapId}/progress/${pointId}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        userId: currentUser.id,
        isCompleted: isCompleted,
      }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result = await response.json();

    if (!result.success) {
      throw new Error(result.error?.message || "Failed to update progress");
    }

    // Update local roadmap as well for immediate UI feedback
    const roadmap = await getRoadmapById(roadmapId);
    if (!roadmap) {
      throw new Error("Roadmap not found");
    }

    const pointIndex = roadmap.points.findIndex(
      (point) => point.id === pointId
    );
    if (pointIndex !== -1) {
      roadmap.points[pointIndex].isCompleted = isCompleted;
    }

    const completedPoints = roadmap.points.filter(
      (point) => point.isCompleted
    ).length;
    const totalPoints = roadmap.points.length;
    const percentage =
      totalPoints > 0 ? Math.round((completedPoints / totalPoints) * 100) : 0;

    roadmap.progress = {
      completedPoints,
      totalPoints,
      percentage,
    };

    roadmap.updatedAt = new Date().toISOString();

    // Update active roadmap if it's the same one
    const activeRoadmap = await getActiveRoadmap();
    if (activeRoadmap?.id === roadmapId) {
      await setActiveRoadmap(roadmap);
    }

    console.log("Progress updated successfully for roadmap:", roadmapId, "point:", pointId, "completed:", isCompleted);
  } catch (error) {
    console.error("Error updating roadmap progress:", error);
    throw error;
  }
}

export async function getRoadmapProgress(roadmapId: string): Promise<{
  completedPoints: number;
  totalPoints: number;
  percentage: number;
} | null> {
  try {
    const roadmap = await getRoadmapById(roadmapId);
    if (!roadmap) {
      return null;
    }

    const completedPoints = roadmap.points.filter(
      (point) => point.isCompleted
    ).length;
    const totalPoints = roadmap.points.length;
    const percentage =
      totalPoints > 0 ? Math.round((completedPoints / totalPoints) * 100) : 0;

    return {
      completedPoints,
      totalPoints,
      percentage,
    };
  } catch (error) {
    console.error("Error fetching roadmap progress:", error);
    return null;
  }
}

export async function updatePlaylistItem(
  roadmapId: string,
  pointId: string,
  playlistItem: PlaylistItem
): Promise<void> {
  try {
    const roadmap = await getRoadmapById(roadmapId);
    if (!roadmap) {
      throw new Error("Roadmap not found");
    }

    const pointIndex = roadmap.points.findIndex(
      (point) => point.id === pointId
    );
    if (pointIndex === -1) {
      throw new Error("Roadmap point not found");
    }

    if (!roadmap.points[pointIndex].playlists) {
      roadmap.points[pointIndex].playlists = [];
    }

    const playlists = roadmap.points[pointIndex].playlists!;
    const playlistIndex = playlists.findIndex(
      (item) => item.id === playlistItem.id
    );

    if (playlistIndex !== -1) {
      playlists[playlistIndex] = playlistItem;
    } else {
      playlists.push(playlistItem);
    }

    roadmap.updatedAt = new Date().toISOString();
    
    // Save updated roadmap to backend
    await saveRoadmap(roadmap);

    // Update active roadmap if it's the same one
    const activeRoadmap = await getActiveRoadmap();
    if (activeRoadmap?.id === roadmapId) {
      await setActiveRoadmap(roadmap);
    }
  } catch (error) {
    console.error("Error updating playlist item:", error);
    throw error;
  }
}

export async function getPlaylistsForPoint(
  roadmapId: string,
  pointId: string
): Promise<PlaylistItem[]> {
  try {
    const roadmap = await getRoadmapById(roadmapId);
    if (!roadmap) {
      return [];
    }

    const point = roadmap.points.find((point) => point.id === pointId);
    return point?.playlists || [];
  } catch (error) {
    console.error("Error fetching playlists for point:", error);
    return [];
  }
}

export async function initializePlaylistsForPoint(
  roadmapId: string,
  pointId: string,
  playlists: PlaylistItem[]
): Promise<void> {
  try {
    const roadmap = await getRoadmapById(roadmapId);
    if (!roadmap) {
      throw new Error("Roadmap not found");
    }

    const pointIndex = roadmap.points.findIndex(
      (point) => point.id === pointId
    );
    if (pointIndex === -1) {
      throw new Error("Roadmap point not found");
    }

    roadmap.points[pointIndex].playlists = playlists;
    roadmap.updatedAt = new Date().toISOString();

    // Save updated roadmap to backend
    await saveRoadmap(roadmap);

    // Update active roadmap if it's the same one
    const activeRoadmap = await getActiveRoadmap();
    if (activeRoadmap?.id === roadmapId) {
      await setActiveRoadmap(roadmap);
    }
  } catch (error) {
    console.error("Error initializing playlists for point:", error);
    throw error;
  }
}

export async function arePlaylistsLoadedForPoint(
  roadmapId: string,
  pointId: string
): Promise<boolean> {
  try {
    const roadmap = await getRoadmapById(roadmapId);
    if (!roadmap) {
      return false;
    }

    const point = roadmap.points.find((point) => point.id === pointId);
    return point?.playlists !== null && point?.playlists !== undefined;
  } catch (error) {
    console.error("Error checking if playlists are loaded:", error);
    return false;
  }
}

export async function generatePlaylistsFromBackend(
  topic: string,
  pointTitle: string,
  roadmapId?: string,
  level?: string
): Promise<PlaylistItem[]> {
  try {
    const preferences = await getUserPreferencesWithDefaults();
    const currentUser = await authService.getCurrentUser();

    // If roadmapId and level are provided, first check if videos exist in Supabase
    if (roadmapId && level && currentUser) {
      try {
        const existingVideosResponse = await loadVideosFromSupabase(roadmapId, level);
        if (existingVideosResponse && existingVideosResponse.videos.length > 0) {
          console.log(`✅ Found existing videos in Supabase for ${topic} (${level}):`, existingVideosResponse.videos.length);
          return existingVideosResponse.videos;
        }
      } catch (error) {
        console.log(`📹 No existing videos found in Supabase, generating new ones...`);
      }
    }

    const requestBody: any = {
      topic,
      pointTitle,
      userPreferences: preferences,
    };

    // Add video storage parameters if available
    if (roadmapId && level && currentUser) {
      requestBody.userRoadmapId = roadmapId;
      requestBody.level = level;
    }

    const response = await fetch(`${BASE}/api/playlists/generate`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result = await response.json();

    if (!result.success) {
      throw new Error(result.error?.message || "Failed to generate playlists");
    }

    return result.data;
  } catch (error) {
    console.error("Error generating playlists from backend:", error);
    throw error;
  }
}

// Add new function to load videos from Supabase with pagination support
export async function loadVideosFromSupabase(roadmapId: string, level: string, page: number = 1): Promise<{videos: PlaylistItem[], hasMore: boolean}> {
  try {
    const currentUser = await authService.getCurrentUser();
    if (!currentUser) {
      throw new Error('User not authenticated');
    }

    console.log(`📹 Loading videos from Supabase for roadmap: ${roadmapId}, level: ${level}, page: ${page}`);
    
    const response = await fetch(`${BASE}/api/users/videos/${roadmapId}?level=${level}&userId=${currentUser.id}&page=${page}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to load videos: ${response.statusText}`);
    }

    const result = await response.json();
    
    if (!result.success) {
      throw new Error(result.error?.message || "Failed to load videos");
    }
    
    console.log(`✅ Loaded videos from Supabase:`, result.data?.videos?.length || 0, 'videos, hasMore:', result.data?.hasMore);
    
    return {
      videos: result.data?.videos || [],
      hasMore: result.data?.hasMore || false
    };
  } catch (error) {
    console.error('❌ Error loading videos from Supabase:', error);
    throw error;
  }
}

// Add new function to regenerate videos
export async function regenerateVideos(roadmapId: string, level: string, topic: string, pointTitle: string): Promise<PlaylistItem[]> {
  try {
    console.log("🔄 regenerateVideos called with:", { roadmapId, level, topic, pointTitle });
    
    const currentUser = await authService.getCurrentUser();
    if (!currentUser) {
      console.log("❌ User not authenticated");
      throw new Error('User not authenticated');
    }
    console.log("✅ User authenticated:", currentUser.id);

    const preferences = await getUserPreferencesWithDefaults();
    console.log("✅ Got user preferences:", preferences);

    console.log(`🔄 Regenerating videos for roadmap: ${roadmapId}, level: ${level}`);
    
    const requestBody = {
      topic,
      pointTitle,
      userPreferences: preferences,
      userRoadmapId: roadmapId,
      level: level
    };
    console.log("📤 Request body:", requestBody);
    
    const response = await fetch(`${BASE}/api/playlists/regenerate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody),
    });

    console.log("📥 Response status:", response.status, response.statusText);

    if (!response.ok) {
      throw new Error(`Failed to regenerate videos: ${response.statusText}`);
    }

    const result = await response.json();
    
    if (!result.success) {
      throw new Error(result.error?.message || "Failed to regenerate videos");
    }

    console.log(`✅ Regenerated videos for ${topic} (${level}):`, result.data?.length || 0, 'videos');
    
    return result.data || [];
  } catch (error) {
    console.error('❌ Error regenerating videos:', error);
    throw error;
  }
}

export async function loadPlaylistsForPoint(
  roadmapId: string,
  pointId: string,
  topic: string,
  pointTitle: string,
  level?: string
): Promise<PlaylistItem[]> {
  try {
    const areLoaded = await arePlaylistsLoadedForPoint(roadmapId, pointId);
    if (areLoaded) {
      return await getPlaylistsForPoint(roadmapId, pointId);
    }

    const playlists = await generatePlaylistsFromBackend(topic, pointTitle, roadmapId, level);

    await initializePlaylistsForPoint(roadmapId, pointId, playlists);

    return playlists;
  } catch (error) {
    console.error("Error loading playlists for point:", error);
    throw error;
  }
}

export async function regeneratePlaylistsForPoint(
  roadmapId: string,
  pointId: string,
  topic: string,
  pointTitle: string,
  level?: string
): Promise<PlaylistItem[]> {
  try {
    const playlists = await regenerateVideos(roadmapId, level || 'beginner', topic, pointTitle);

    await initializePlaylistsForPoint(roadmapId, pointId, playlists);

    return playlists;
  } catch (error) {
    console.error("Error regenerating playlists for point:", error);
    throw error;
  }
}

export async function generateNewRoadmap(topic: string): Promise<Roadmap> {
  try {
    console.log("🚀 Generating new roadmap for topic:", topic);
    
    // Generate roadmap from backend API
    const roadmap = await generateRoadmapFromBackend(topic);
    console.log("✅ Roadmap generated:", roadmap);
    
    // Save the generated roadmap to user's collection
    console.log("💾 Saving roadmap to backend...");
    await saveRoadmap(roadmap);
    
    // Set as active roadmap for navigation
    console.log("🎯 Setting as active roadmap...");
    await setActiveRoadmap(roadmap);
    
    console.log("🎉 Roadmap generation complete!");
    return roadmap;
  } catch (error) {
    console.error("❌ Error generating new roadmap:", error);
    throw error;
  }
}

export async function searchRoadmaps(query: string): Promise<Roadmap[]> {
  try {
    const roadmaps = await getAllRoadmaps();
    const lowercaseQuery = query.toLowerCase();

    return roadmaps.filter(
      (roadmap) =>
        roadmap.topic.toLowerCase().includes(lowercaseQuery) ||
        roadmap.title.toLowerCase().includes(lowercaseQuery) ||
        roadmap.description.toLowerCase().includes(lowercaseQuery)
    );
  } catch (error) {
    console.error("Error searching roadmaps:", error);
    return [];
  }
}

export async function getRoadmapsByLevel(
  level: "beginner" | "intermediate" | "advanced"
): Promise<RoadmapPoint[]> {
  try {
    const activeRoadmap = await getActiveRoadmap();
    if (!activeRoadmap) {
      return [];
    }

    return activeRoadmap.points.filter((point) => point.level === level);
  } catch (error) {
    console.error("Error fetching roadmap points by level:", error);
    return [];
  }
}

// New function to fetch videos with pagination support
export async function fetchVideosWithPagination(
  roadmapId: string, 
  level: string, 
  page: number = 1
): Promise<{videos: PlaylistItem[], hasMore: boolean}> {
  try {
    const currentUser = await authService.getCurrentUser();
    if (!currentUser) {
      throw new Error('User not authenticated');
    }

    console.log(`📹 Fetching videos with pagination for roadmap: ${roadmapId}, level: ${level}, page: ${page}`);
    
    const response = await loadVideosFromSupabase(roadmapId, level, page);
    return response;
  } catch (error) {
    console.error('❌ Error fetching videos with pagination:', error);
    throw error;
  }
}

export async function clearAllRoadmaps(): Promise<void> {
  try {
    // Clear only local active roadmap since roadmaps are now stored in backend
    await AsyncStorage.removeItem(ACTIVE_ROADMAP_KEY);
    
    // TODO: Implement backend API for clearing all user roadmaps if needed
    console.warn("Clear all roadmaps API not implemented yet");
  } catch (error) {
    console.error("Error clearing all roadmaps:", error);
    throw error;
  }
}
