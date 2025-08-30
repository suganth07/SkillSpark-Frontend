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
    
    const defaultHeaders = {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    };
    
    const config: RequestInit = {
      headers: {
        ...defaultHeaders,
        ...(options.headers || {}),
      },
      ...options,
    };

    console.log('🚀 Final request config:');
    console.log('📍 URL:', url);
    console.log('⚙️ Config:', config);
    console.log('🏷️ Final headers:', config.headers);

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
    return this.request(endpoint, { 
      method: 'GET', 
      headers: headers || {} 
    });
  }

  // POST request
  async post(endpoint: string, data?: any, headers?: Record<string, string>) {
    console.log('🔍 API Client POST Debug:');
    console.log('📍 Endpoint:', endpoint);
    console.log('📦 Data:', data);
    console.log('📝 Stringified:', data ? JSON.stringify(data) : undefined);
    console.log('🏷️ Headers:', headers);
    
    return this.request(endpoint, {
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined,
      headers: headers || {},
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

// Quiz Types
export interface QuizQuestion {
  id: string;
  topic: string;
  question: string;
  options: string[];
  correctAnswer: number;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  explanation: string;
}

export interface QuizData {
  metadata: {
    topic: string;
    generatedAt: string;
    totalQuestions: number;
    difficultyDistribution: {
      beginner: number;
      intermediate: number;
      advanced: number;
    };
  };
  questions: QuizQuestion[];
}

export interface Quiz {
  id: string;
  user_roadmap_id: string;
  quiz_data: QuizData;
  total_questions: number;
  difficulty_level: string;
  created_at: string;
  updated_at: string;
}

export interface QuizAnswer {
  questionId: string;
  selectedOption: number;
  isCorrect: boolean;
  timeSpent: number;
}

export interface QuizAttempt {
  id: string;
  user_quiz_id: string;
  user_id: string;
  score: number;
  total_questions: number;
  percentage: string;
  time_taken: number;
  completed_at: string;
  created_at: string;
}

export interface QuizResults {
  score: number;
  totalQuestions: number;
  percentage: number;
  timeInSeconds: number;
  passed: boolean;
}

export interface QuizAttemptResponse {
  attempt: QuizAttempt;
  results: QuizResults;
  quiz: QuizData;
  userAnswers: QuizAnswer[];
}

// API Response interfaces
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
}

// Quiz API Methods
export const QuizAPI = {
  // Generate quiz for a roadmap
  async generateQuiz(userRoadmapId: string, userId: string) {
    try {
      console.log('🎯 QuizAPI.generateQuiz called with:', { userRoadmapId, userId });
      
      const requestBody = { userId };
      const requestHeaders = {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      };
      
      console.log('📦 Request body:', requestBody);
      console.log('🏷️ Request headers:', requestHeaders);
      
      // Use fetch directly with explicit configuration
      const url = `${BACKEND_URL}/api/quizzes/generate/${userRoadmapId}`;
      console.log('📍 Request URL:', url);
      
      const response = await fetch(url, {
        method: 'POST',
        headers: requestHeaders,
        body: JSON.stringify(requestBody),
      });
      
      console.log('📡 Response status:', response.status);
      console.log('📡 Response headers:', Object.fromEntries(response.headers.entries()));
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ Response error:', errorText);
        throw new Error(`HTTP ${response.status}: ${errorText}`);
      }

      const result = await response.json();
      console.log('✅ Success result:', result);
      return result;
    } catch (error) {
      console.error('❌ Error generating quiz:', error);
      throw error;
    }
  },

  // Generate quiz in background after roadmap creation
  async generateQuizInBackground(userRoadmapId: string, userId: string) {
    try {
      console.log('🔄 Generating quiz in background for roadmap:', userRoadmapId);
      
      const requestBody = { userId };
      const requestHeaders = {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      };
      
      const url = `${BACKEND_URL}/api/quizzes/generate/${userRoadmapId}`;
      
      const response = await fetch(url, {
        method: 'POST',
        headers: requestHeaders,
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ Background quiz generation failed:', errorText);
        // Don't throw error to not break the main flow
        return { success: false, error: errorText };
      }

      const result = await response.json();
      console.log('✅ Background quiz generated successfully for roadmap:', userRoadmapId);
      return { success: true, data: result };
    } catch (error: any) {
      console.error('❌ Error generating quiz in background:', error);
      return { success: false, error: error?.message || 'Unknown error' };
    }
  },

  // Get existing quiz
  async getQuiz(userRoadmapId: string, userId: string) {
    try {
      const response = await apiClient.get(`/api/quizzes/${userRoadmapId}?userId=${userId}`);
      return response;
    } catch (error) {
      console.error('Error fetching quiz:', error);
      throw error;
    }
  },

  // Submit quiz attempt
  async submitQuizAttempt(quizId: string, userId: string, answers: Array<{selectedOption: number, timeSpent: number}>, timeInSeconds: number) {
    try {
      console.log('🎯 QuizAPI.submitQuizAttempt called with:', { quizId, userId, answers: answers.length, timeInSeconds });
      
      const requestBody = { userId, answers, timeInSeconds };
      const requestHeaders = {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      };
      
      console.log('📦 Request body:', requestBody);
      console.log('📋 Request headers:', requestHeaders);

      // Use fetch directly with explicit configuration
      const url = `${BACKEND_URL}/api/quizzes/${quizId}/attempt`;
      
      const response = await fetch(url, {
        method: 'POST',
        headers: requestHeaders,
        body: JSON.stringify(requestBody),
      });

      console.log('📡 Response status:', response.status);
      console.log('📡 Response headers:', Object.fromEntries(response.headers.entries()));

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error('❌ Response error:', errorData);
        throw new Error(`HTTP ${response.status}: ${JSON.stringify(errorData)}`);
      }

      const result = await response.json();
      console.log('✅ Quiz submission successful:', result);
      
      return { success: true, data: result };
    } catch (error) {
      console.error('❌ Error submitting quiz:', error);
      throw error;
    }
  },

  // Save quiz progress (individual answers)
  async saveQuizProgress(quizId: string, userId: string, questionIndex: number, selectedOption: number, timeSpent: number) {
    try {
      console.log('🎯 QuizAPI.saveQuizProgress called with:', { quizId, userId, questionIndex, selectedOption, timeSpent });
      
      const requestBody = { userId, questionIndex, selectedOption, timeSpent };
      const requestHeaders = {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      };
      
      console.log('📦 Request body:', requestBody);
      console.log('🏷️ Request headers:', requestHeaders);
      
      // Use fetch directly with explicit configuration
      const url = `${BACKEND_URL}/api/quizzes/${quizId}/progress`;
      console.log('📍 Request URL:', url);
      
      const response = await fetch(url, {
        method: 'POST',
        headers: requestHeaders,
        body: JSON.stringify(requestBody),
      });
      
      console.log('📡 Response status:', response.status);
      console.log('📡 Response headers:', Object.fromEntries(response.headers.entries()));
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ Response error:', errorText);
        throw new Error(`HTTP ${response.status}: ${errorText}`);
      }

      const result = await response.json();
      console.log('✅ Success result:', result);
      return result;
    } catch (error) {
      console.error('❌ Error saving quiz progress:', error);
      throw error;
    }
  },

  // Get quiz progress
  async getQuizProgress(quizId: string, userId: string) {
    try {
      console.log('🎯 QuizAPI.getQuizProgress called with:', { quizId, userId });
      
      const requestHeaders = {
        'Accept': 'application/json',
      };
      
      console.log('🏷️ Request headers:', requestHeaders);
      
      // Use fetch directly with explicit configuration
      const url = `${BACKEND_URL}/api/quizzes/${quizId}/progress?userId=${encodeURIComponent(userId)}`;
      console.log('📍 Request URL:', url);
      
      const response = await fetch(url, {
        method: 'GET',
        headers: requestHeaders,
      });
      
      console.log('📡 Response status:', response.status);
      console.log('📡 Response headers:', Object.fromEntries(response.headers.entries()));
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ Response error:', errorText);
        throw new Error(`HTTP ${response.status}: ${errorText}`);
      }

      const result = await response.json();
      console.log('✅ Success result:', result);
      return result;
    } catch (error) {
      console.error('❌ Error fetching quiz progress:', error);
      throw error;
    }
  },

  // Get quiz statistics
  async getQuizStatistics(userId: string) {
    try {
      const response = await apiClient.get(`/api/quizzes/statistics/${userId}`);
      return response;
    } catch (error) {
      console.error('Error fetching quiz statistics:', error);
      throw error;
    }
  },

  // Get quiz attempts
  async getQuizAttempts(quizId: string, userId: string) {
    try {
      const response = await apiClient.get(`/api/quizzes/${quizId}/attempts?userId=${userId}`);
      return response;
    } catch (error) {
      console.error('Error fetching quiz attempts:', error);
      throw error;
    }
  },

  // Regenerate quiz
  async regenerateQuiz(userRoadmapId: string, userId: string) {
    try {
      const response = await apiClient.post(`/api/quizzes/regenerate/${userRoadmapId}`, {
        userId
      });
      return response;
    } catch (error) {
      console.error('Error regenerating quiz:', error);
      throw error;
    }
  }
};

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
