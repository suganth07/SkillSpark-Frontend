import { createClient } from '@supabase/supabase-js';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

// Replace these with your actual Supabase project URL and anon key
const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY!;

// Custom storage implementation that works across platforms
const CustomStorageAdapter = {
  getItem: async (key: string) => {
    try {
      return await AsyncStorage.getItem(key);
    } catch (error) {
      console.error('Storage getItem error:', error);
      return null;
    }
  },
  setItem: async (key: string, value: string) => {
    try {
      await AsyncStorage.setItem(key, value);
    } catch (error) {
      console.error('Storage setItem error:', error);
    }
  },
  removeItem: async (key: string) => {
    try {
      await AsyncStorage.removeItem(key);
    } catch (error) {
      console.error('Storage removeItem error:', error);
    }
  },
};

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: CustomStorageAdapter,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: Platform.OS === 'web',
  },
});

// Database types
export interface User {
  id: string;
  username: string;
  password: string;
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
  user_topic_id: string;
  roadmap_data: any; // JSON data
  created_at?: string;
  updated_at?: string;
}

export interface UserVideo {
  id: string;
  user_roadmap_id: string;
  level: 'basic' | 'medium' | 'advanced';
  video_data: any; // JSON data
  created_at?: string;
}
