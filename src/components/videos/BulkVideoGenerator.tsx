import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  ScrollView, 
  TouchableOpacity, 
  Alert, 
  ActivityIndicator,
  Modal
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Card } from '~/components/ui/card';
import Icon from '~/lib/icons/Icon';
import { useColorScheme } from '~/lib/utils/useColorScheme';
import { useVideoGeneration } from '~/hooks/useVideoGeneration';

interface RoadmapPoint {
  id: string;
  title: string;
  content: string;
  completed: boolean;
}

interface BulkVideoGeneratorProps {
  userRoadmapId: string;
  level: string;
  topic: string;
  points: RoadmapPoint[];
  onComplete?: (results: any) => void;
}

/**
 * Component for generating videos for all points in a roadmap level
 */
export const BulkVideoGenerator: React.FC<BulkVideoGeneratorProps> = ({
  userRoadmapId,
  level,
  topic,
  points,
  onComplete
}) => {
  const { isDarkColorScheme } = useColorScheme();
  const [showModal, setShowModal] = useState(false);
  const [generationResults, setGenerationResults] = useState<any>(null);
  
  const {
    isGenerating,
    error,
    progress,
    generateVideosForLevel,
    getAllPointVideosForLevel,
    getPointsNeedingVideos,
    clearError
  } = useVideoGeneration();

  const [pointsNeedingVideos, setPointsNeedingVideos] = useState<RoadmapPoint[]>([]);
  const [existingVideos, setExistingVideos] = useState<{ [pointId: string]: any }>({});

  // Load existing videos and check which points need videos
  useEffect(() => {
    loadVideoStatus();
  }, [userRoadmapId, level, points]);

  const loadVideoStatus = async () => {
    try {
      // Get all existing videos for this level
      const existingPointVideos = await getAllPointVideosForLevel(userRoadmapId, level);
      setExistingVideos(existingPointVideos);
      
      // Find points that need videos
      const needingVideos = await getPointsNeedingVideos(userRoadmapId, level, points);
      setPointsNeedingVideos(needingVideos);
    } catch (error) {
      console.error('Error loading video status:', error);
    }
  };

  const handleGenerateAllVideos = async () => {
    try {
      clearError();
      setShowModal(true);
      
      console.log(`🎬 Starting bulk video generation for ${pointsNeedingVideos.length} points`);
      
      const result = await generateVideosForLevel(
        userRoadmapId,
        level,
        topic,
        pointsNeedingVideos
      );
      
      setGenerationResults(result);
      
      if (result.success && result.summary.successful > 0) {
        Alert.alert(
          'Success!',
          `Generated videos for ${result.summary.successful} out of ${result.summary.total} points`,
          [{ text: 'OK', onPress: () => {
            loadVideoStatus(); // Refresh status
            onComplete?.(result);
          }}]
        );
      } else if (result.summary.failed > 0) {
        Alert.alert(
          'Partial Success',
          `${result.summary.successful} successful, ${result.summary.failed} failed. See details below.`,
          [{ text: 'OK' }]
        );
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to generate videos. Please try again.');
      console.error('Bulk generation error:', error);
    }
  };

  const renderProgressModal = () => (
    <Modal
      visible={showModal}
      transparent
      animationType="fade"
      onRequestClose={() => !isGenerating && setShowModal(false)}
    >
      <View className="flex-1 justify-center items-center bg-black/50">
        <Card className="w-80 p-6">
          <View className="items-center">
            <Text className={`text-lg font-semibold mb-4 ${isDarkColorScheme ? 'text-white' : 'text-black'}`}>
              Generating Videos
            </Text>
            
            {progress && (
              <>
                <View className="w-full bg-gray-200 rounded-full h-2 mb-4">
                  <LinearGradient
                    colors={['#3B82F6', '#1D4ED8']}
                    className="h-full rounded-full"
                    style={{ width: `${progress.percentage}%` }}
                  />
                </View>
                
                <Text className={`text-sm mb-2 ${isDarkColorScheme ? 'text-gray-300' : 'text-gray-600'}`}>
                  Processing point {progress.current} of {progress.total}
                </Text>
                
                <Text className={`text-lg font-bold ${isDarkColorScheme ? 'text-blue-400' : 'text-blue-600'}`}>
                  {progress.percentage}%
                </Text>
              </>
            )}
            
            {isGenerating && (
              <ActivityIndicator size="large" color={isDarkColorScheme ? '#60A5FA' : '#3B82F6'} />
            )}
            
            {error && (
              <Text className="text-red-500 text-sm mt-2 text-center">
                {error}
              </Text>
            )}
            
            {generationResults && !isGenerating && (
              <View className="mt-4 w-full">
                <Text className={`text-sm font-medium mb-2 ${isDarkColorScheme ? 'text-white' : 'text-black'}`}>
                  Results:
                </Text>
                <Text className="text-green-500 text-sm">
                  ✅ {generationResults.summary.successful} successful
                </Text>
                {generationResults.summary.failed > 0 && (
                  <Text className="text-red-500 text-sm">
                    ❌ {generationResults.summary.failed} failed
                  </Text>
                )}
              </View>
            )}
            
            {!isGenerating && (
              <TouchableOpacity
                onPress={() => setShowModal(false)}
                className="mt-4 bg-blue-500 px-4 py-2 rounded-lg"
              >
                <Text className="text-white font-medium">Close</Text>
              </TouchableOpacity>
            )}
          </View>
        </Card>
      </View>
    </Modal>
  );

  const renderPointStatus = (point: RoadmapPoint) => {
    const hasVideos = existingVideos[point.id];
    const needsVideos = pointsNeedingVideos.some(p => p.id === point.id);
    
    return (
      <Card key={point.id} className="mb-3 p-4">
        <View className="flex-row items-center justify-between">
          <View className="flex-1">
            <Text className={`font-medium ${isDarkColorScheme ? 'text-white' : 'text-black'}`}>
              {point.title}
            </Text>
            <Text className={`text-sm ${isDarkColorScheme ? 'text-gray-300' : 'text-gray-600'}`}>
              {point.content.substring(0, 100)}...
            </Text>
          </View>
          
          <View className="ml-4">
            {hasVideos ? (
              <View className="flex-row items-center">
                <Icon name="Check" size={20} color="#10B981" />
                <Text className="text-green-500 text-sm ml-1">
                  {hasVideos.video_data?.length || 0} videos
                </Text>
              </View>
            ) : needsVideos ? (
              <View className="flex-row items-center">
                <Icon name="Clock" size={20} color="#F59E0B" />
                <Text className="text-yellow-500 text-sm ml-1">Pending</Text>
              </View>
            ) : (
              <View className="flex-row items-center">
                <Icon name="X" size={20} color="#EF4444" />
                <Text className="text-red-500 text-sm ml-1">None</Text>
              </View>
            )}
          </View>
        </View>
      </Card>
    );
  };

  return (
    <SafeAreaView className="flex-1">
      <ScrollView className="flex-1 p-4">
        {/* Header */}
        <Card className="mb-6 p-4">
          <Text className={`text-xl font-bold mb-2 ${isDarkColorScheme ? 'text-white' : 'text-black'}`}>
            Video Generation for {level} Level
          </Text>
          <Text className={`text-sm ${isDarkColorScheme ? 'text-gray-300' : 'text-gray-600'}`}>
            Topic: {topic}
          </Text>
          
          <View className="mt-4 flex-row items-center justify-between">
            <View className="flex-row space-x-4">
              <View className="items-center">
                <Text className={`text-lg font-bold ${isDarkColorScheme ? 'text-green-400' : 'text-green-600'}`}>
                  {Object.keys(existingVideos).length}
                </Text>
                <Text className={`text-xs ${isDarkColorScheme ? 'text-gray-400' : 'text-gray-500'}`}>
                  With Videos
                </Text>
              </View>
              
              <View className="items-center">
                <Text className={`text-lg font-bold ${isDarkColorScheme ? 'text-yellow-400' : 'text-yellow-600'}`}>
                  {pointsNeedingVideos.length}
                </Text>
                <Text className={`text-xs ${isDarkColorScheme ? 'text-gray-400' : 'text-gray-500'}`}>
                  Need Videos
                </Text>
              </View>
              
              <View className="items-center">
                <Text className={`text-lg font-bold ${isDarkColorScheme ? 'text-blue-400' : 'text-blue-600'}`}>
                  {points.length}
                </Text>
                <Text className={`text-xs ${isDarkColorScheme ? 'text-gray-400' : 'text-gray-500'}`}>
                  Total Points
                </Text>
              </View>
            </View>
            
            <TouchableOpacity
              onPress={handleGenerateAllVideos}
              disabled={isGenerating || pointsNeedingVideos.length === 0}
              className={`px-4 py-2 rounded-lg ${
                isGenerating || pointsNeedingVideos.length === 0 
                  ? 'bg-gray-400' 
                  : 'bg-blue-500'
              }`}
            >
              {isGenerating ? (
                <ActivityIndicator size="small" color="white" />
              ) : (
                <Text className="text-white font-medium">
                  Generate All ({pointsNeedingVideos.length})
                </Text>
              )}
            </TouchableOpacity>
          </View>
        </Card>

        {/* Points List */}
        <Text className={`text-lg font-semibold mb-4 ${isDarkColorScheme ? 'text-white' : 'text-black'}`}>
          Learning Points
        </Text>
        
        {points.map(renderPointStatus)}
      </ScrollView>
      
      {renderProgressModal()}
    </SafeAreaView>
  );
};

export default BulkVideoGenerator;
