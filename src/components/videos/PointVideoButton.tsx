import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import Icon from '~/lib/icons/Icon';
import { useColorScheme } from '~/lib/utils/useColorScheme';
import { useVideoGeneration } from '~/hooks/useVideoGeneration';

interface PointVideoButtonProps {
  userRoadmapId: string;
  level: string;
  topic: string;
  pointId: string;
  pointTitle: string;
  page?: number;
  onVideoGenerated?: (videos: any[]) => void;
}

/**
 * A button component that shows video status for a roadmap point
 * and allows generating/viewing videos for that point
 */
export const PointVideoButton: React.FC<PointVideoButtonProps> = ({
  userRoadmapId,
  level,
  topic,
  pointId,
  pointTitle,
  page = 1,
  onVideoGenerated
}) => {
  const { isDarkColorScheme } = useColorScheme();
  const [videos, setVideos] = useState<any[]>([]);
  const [hasVideos, setHasVideos] = useState(false);
  const [loadingStatus, setLoadingStatus] = useState(true);
  
  const {
    isGenerating,
    generatePointVideos,
    getPointVideos,
    regeneratePointVideos,
    error,
    clearError
  } = useVideoGeneration();

  useEffect(() => {
    loadVideoStatus();
  }, [userRoadmapId, level, pointId, page]);

  const loadVideoStatus = async () => {
    setLoadingStatus(true);
    try {
      const pointVideos = await getPointVideos(userRoadmapId, level, pointId, page);
      setVideos(pointVideos);
      setHasVideos(pointVideos.length > 0);
    } catch (error) {
      console.error('Error loading video status:', error);
      setHasVideos(false);
    } finally {
      setLoadingStatus(false);
    }
  };

  const handleGenerateVideos = async () => {
    try {
      clearError();
      console.log(`🎬 Generating videos for point: ${pointTitle}`);
      
      const result = await generatePointVideos(userRoadmapId, level, topic, pointId, page);
      
      if (result.success) {
        await loadVideoStatus(); // Refresh status
        Alert.alert('Success!', `Generated ${result.videoCount} videos for "${pointTitle}"`);
        onVideoGenerated?.(videos);
      } else {
        Alert.alert('Error', result.error || 'Failed to generate videos');
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to generate videos. Please try again.');
    }
  };

  const handleRegenerateVideos = async () => {
    Alert.alert(
      'Regenerate Videos',
      `This will generate new videos for "${pointTitle}". Continue?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Regenerate',
          style: 'destructive',
          onPress: async () => {
            try {
              clearError();
              console.log(`🔄 Regenerating videos for point: ${pointTitle}`);
              
              const result = await regeneratePointVideos(userRoadmapId, level, topic, pointId, page);
              
              if (result.success) {
                await loadVideoStatus(); // Refresh status
                Alert.alert('Success!', `Regenerated ${result.videoCount} videos for "${pointTitle}"`);
                onVideoGenerated?.(videos);
              } else {
                Alert.alert('Error', result.error || 'Failed to regenerate videos');
              }
            } catch (error) {
              Alert.alert('Error', 'Failed to regenerate videos. Please try again.');
            }
          }
        }
      ]
    );
  };

  if (loadingStatus) {
    return (
      <TouchableOpacity 
        disabled
        className={`flex-row items-center px-3 py-2 rounded-lg border ${
          isDarkColorScheme ? 'border-gray-600 bg-gray-800' : 'border-gray-300 bg-gray-100'
        }`}
      >
        <ActivityIndicator size="small" color={isDarkColorScheme ? '#9CA3AF' : '#6B7280'} />
        <Text className={`ml-2 text-sm ${isDarkColorScheme ? 'text-gray-400' : 'text-gray-500'}`}>
          Checking...
        </Text>
      </TouchableOpacity>
    );
  }

  if (hasVideos) {
    return (
      <TouchableOpacity 
        onPress={handleRegenerateVideos}
        disabled={isGenerating}
        className={`flex-row items-center px-3 py-2 rounded-lg border ${
          isDarkColorScheme ? 'border-green-600 bg-green-900/30' : 'border-green-300 bg-green-50'
        }`}
      >
        {isGenerating ? (
          <ActivityIndicator size="small" color="#10B981" />
        ) : (
          <Icon name="Check" size={16} color="#10B981" />
        )}
        <Text className="text-green-500 text-sm ml-2 font-medium">
          {videos.length} Videos
        </Text>
        <Icon name="RefreshCw" size={14} color="#10B981" className="ml-1" />
      </TouchableOpacity>
    );
  }

  return (
    <TouchableOpacity 
      onPress={handleGenerateVideos}
      disabled={isGenerating}
      className={`flex-row items-center px-3 py-2 rounded-lg border ${
        isGenerating 
          ? isDarkColorScheme ? 'border-blue-600 bg-blue-900/30' : 'border-blue-300 bg-blue-50'
          : isDarkColorScheme ? 'border-gray-600 bg-gray-800' : 'border-gray-300 bg-white'
      }`}
    >
      {isGenerating ? (
        <>
          <ActivityIndicator size="small" color="#3B82F6" />
          <Text className="text-blue-500 text-sm ml-2 font-medium">
            Generating...
          </Text>
        </>
      ) : (
        <>
          <Icon name="Play" size={16} color={isDarkColorScheme ? '#9CA3AF' : '#6B7280'} />
          <Text className={`text-sm ml-2 font-medium ${
            isDarkColorScheme ? 'text-gray-300' : 'text-gray-700'
          }`}>
            Get Videos
          </Text>
        </>
      )}
    </TouchableOpacity>
  );
};

interface QuickVideoStatsProps {
  userRoadmapId: string;
  level: string;
  points: Array<{ id: string; title: string }>;
  page?: number;
}

/**
 * Component that shows a quick overview of video generation status for a level
 */
export const QuickVideoStats: React.FC<QuickVideoStatsProps> = ({
  userRoadmapId,
  level,
  points,
  page = 1
}) => {
  const { isDarkColorScheme } = useColorScheme();
  const [stats, setStats] = useState({ withVideos: 0, total: points.length });
  const [loading, setLoading] = useState(true);
  
  const { getAllPointVideosForLevel } = useVideoGeneration();

  useEffect(() => {
    loadStats();
  }, [userRoadmapId, level, points, page]);

  const loadStats = async () => {
    setLoading(true);
    try {
      const existingVideos = await getAllPointVideosForLevel(userRoadmapId, level, page);
      const withVideosCount = Object.keys(existingVideos).length;
      
      setStats({
        withVideos: withVideosCount,
        total: points.length
      });
    } catch (error) {
      console.error('Error loading video stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const percentage = stats.total > 0 ? Math.round((stats.withVideos / stats.total) * 100) : 0;
  const isComplete = stats.withVideos === stats.total && stats.total > 0;
  
  if (loading) {
    return (
      <View className={`flex-row items-center p-2 rounded-lg ${
        isDarkColorScheme ? 'bg-gray-800' : 'bg-gray-100'
      }`}>
        <ActivityIndicator size="small" color={isDarkColorScheme ? '#9CA3AF' : '#6B7280'} />
        <Text className={`ml-2 text-sm ${isDarkColorScheme ? 'text-gray-400' : 'text-gray-600'}`}>
          Loading video stats...
        </Text>
      </View>
    );
  }

  return (
    <View className={`flex-row items-center justify-between p-3 rounded-lg border ${
      isComplete 
        ? isDarkColorScheme ? 'border-green-600 bg-green-900/20' : 'border-green-300 bg-green-50'
        : isDarkColorScheme ? 'border-yellow-600 bg-yellow-900/20' : 'border-yellow-300 bg-yellow-50'
    }`}>
      <View className="flex-row items-center">
        <Icon 
          name={isComplete ? "Check" : "Clock"} 
          size={18} 
          color={isComplete ? "#10B981" : "#F59E0B"} 
        />
        <Text className={`ml-2 text-sm font-medium ${
          isComplete ? 'text-green-600' : 'text-yellow-600'
        }`}>
          Videos: {stats.withVideos}/{stats.total}
        </Text>
      </View>
      
      <View className="flex-row items-center">
        <Text className={`text-sm font-bold ${
          isComplete ? 'text-green-600' : 'text-yellow-600'
        }`}>
          {percentage}%
        </Text>
        <View className={`ml-2 w-12 h-2 rounded-full ${
          isDarkColorScheme ? 'bg-gray-700' : 'bg-gray-200'
        }`}>
          <View 
            className={`h-full rounded-full ${
              isComplete ? 'bg-green-500' : 'bg-yellow-500'
            }`}
            style={{ width: `${percentage}%` }}
          />
        </View>
      </View>
    </View>
  );
};

export default PointVideoButton;
