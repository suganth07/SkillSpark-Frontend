import React, { useState, useCallback, useEffect } from "react";
import { View, Text, FlatList, RefreshControl, Alert } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter, useFocusEffect } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import { getAllRoadmaps, deleteRoadmap, Roadmap } from "~/queries/roadmap-queries";
import RoadmapCard from "~/components/skills/RoadmapCard";
import SearchBar from "~/components/skills/SearchBar";
import { Button } from "~/components/ui/button";
import Icon from "~/lib/icons/Icon";
import { useColorScheme } from "~/lib/utils/useColorScheme";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSpring,
  withRepeat,
  withSequence,
  Easing,
} from "react-native-reanimated";

const AnimatedLinearGradient = Animated.createAnimatedComponent(LinearGradient);

export default function SkillsScreen() {
  const [roadmaps, setRoadmaps] = useState<Roadmap[]>([]);
  const [filteredRoadmaps, setFilteredRoadmaps] = useState<Roadmap[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [roadmapToDelete, setRoadmapToDelete] = useState<Roadmap | null>(null);
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [paginatedRoadmaps, setPaginatedRoadmaps] = useState<Roadmap[]>([]);
  const itemsPerPage = 5; // 5 roadmaps per page as requested
  
  const router = useRouter();
  const { isDarkColorScheme } = useColorScheme();

  const headerOpacity = useSharedValue(0);
  const headerTranslateY = useSharedValue(30);
  const pulseScale = useSharedValue(1);

  useEffect(() => {
    const timer = setTimeout(() => {
      headerOpacity.value = withTiming(1, { duration: 600 });
      headerTranslateY.value = withSpring(0, { damping: 15, stiffness: 100 });
    }, 100);

    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    pulseScale.value = withRepeat(
      withSequence(
        withTiming(1.02, { duration: 3000, easing: Easing.inOut(Easing.quad) }),
        withTiming(1, { duration: 3000, easing: Easing.inOut(Easing.quad) })
      ),
      -1,
      false
    );
  }, []);

  const pulseStyle = useAnimatedStyle(() => ({
    transform: [{ scale: pulseScale.value }],
  }));

  const gradientColors = isDarkColorScheme
    ? ([
        "rgba(99, 102, 241, 0.15)",
        "rgba(168, 85, 247, 0.12)",
        "rgba(236, 72, 153, 0.08)",
        "rgba(59, 130, 246, 0.05)",
        "transparent",
      ] as const)
    : ([
        "rgba(99, 102, 241, 0.03)",
        "rgba(168, 85, 247, 0.02)",
        "rgba(59, 130, 246, 0.02)",
        "rgba(236, 72, 153, 0.01)",
        "transparent",
      ] as const);

  useFocusEffect(
    useCallback(() => {
      loadRoadmaps();
    }, [])
  );

  const loadRoadmaps = async () => {
    try {
      setLoading(true);
      const allRoadmaps = await getAllRoadmaps();
      const sortedRoadmaps = allRoadmaps.sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
      setRoadmaps(sortedRoadmaps);
      setFilteredRoadmaps(sortedRoadmaps);
    } catch (error) {
      console.error("Error loading roadmaps:", error);
      Alert.alert("Error", "Failed to load your roadmaps");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!searchQuery.trim()) {
      setFilteredRoadmaps(roadmaps);
    } else {
      const query = searchQuery.toLowerCase().trim();
      const filtered = roadmaps.filter(
        (roadmap) =>
          roadmap.topic.toLowerCase().includes(query) ||
          roadmap.title.toLowerCase().includes(query) ||
          roadmap.description.toLowerCase().includes(query) ||
          roadmap.points.some(
            (point) =>
              point.title.toLowerCase().includes(query) ||
              point.description.toLowerCase().includes(query)
          )
      );
      setFilteredRoadmaps(filtered);
    }
  }, [searchQuery, roadmaps]);

  // Update pagination when filtered roadmaps change
  useEffect(() => {
    updatePagination();
  }, [filteredRoadmaps, currentPage]);

  const updatePagination = () => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const paginated = filteredRoadmaps.slice(startIndex, endIndex);
    setPaginatedRoadmaps(paginated);
  };

  const totalPages = Math.ceil(filteredRoadmaps.length / itemsPerPage);

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  const handlePreviousPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  // Reset to first page when search changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadRoadmaps();
    setRefreshing(false);
  }, []);

  const handleRoadmapPress = (roadmap: Roadmap) => {
    router.push({
      pathname: "/roadmap-detail",
      params: { roadmapId: roadmap.id },
    });
  };

  const handleQuizPress = (roadmapId: string) => {
    const roadmap = roadmaps.find(r => r.id === roadmapId);
    if (!roadmap) return;

    router.push({
      pathname: "/quiz",
      params: { 
        userRoadmapId: roadmap.id,
        topic: roadmap.topic
      },
    });
  };

  const handleDeleteRoadmap = async (roadmapId: string) => {
    const roadmapToDelete = roadmaps.find(r => r.id === roadmapId);
    if (!roadmapToDelete) return;

    Alert.alert(
      "Delete Roadmap?",
      `Are you sure you want to delete '${roadmapToDelete.topic}'? This action cannot be undone and will remove all your progress.`,
      [
        { text: "Cancel", style: "cancel" },
        { 
          text: "Delete", 
          style: "destructive",
          onPress: async () => {
            try {
              await deleteRoadmap(roadmapToDelete.id);
              
              // Remove from local state
              setRoadmaps(prevRoadmaps => prevRoadmaps.filter(r => r.id !== roadmapToDelete.id));
              setFilteredRoadmaps(prevFiltered => prevFiltered.filter(r => r.id !== roadmapToDelete.id));
              
              Alert.alert("Success!", "Roadmap deleted successfully!");
            } catch (error) {
              console.error("Error deleting roadmap:", error);
              Alert.alert("Error", "Failed to delete roadmap. Please try again.");
            }
          }
        }
      ]
    );
  };

  const headerStyle = useAnimatedStyle(() => ({
    opacity: headerOpacity.value,
    transform: [{ translateY: headerTranslateY.value }],
  }));

  const renderRoadmapCard = ({
    item,
    index,
  }: {
    item: Roadmap;
    index: number;
  }) => (
    <RoadmapCard
      roadmap={item}
      onPress={() => handleRoadmapPress(item)}
      onDelete={handleDeleteRoadmap}
      onQuizPress={handleQuizPress}
      delay={index * 100}
    />
  );

  const renderEmpty = () => {
    const isSearching = searchQuery.trim().length > 0;

    return (
      <View className="flex-1 items-center justify-center py-20">
        <View className="w-20 h-20 rounded-full bg-gray-100 dark:bg-gray-800 items-center justify-center mb-4">
          {isSearching ? (
            <Text className="text-2xl">🔍</Text>
          ) : (
            <Icon
              name="BookDashed"
              size={32}
              className="text-muted-foreground"
            />
          )}
        </View>
        <Text className="text-xl font-bold text-foreground mb-2">
          {isSearching ? "No Results Found" : "No Roadmaps Yet"}
        </Text>
        <Text className="text-base text-muted-foreground text-center px-8 mb-6">
          {isSearching
            ? `No roadmaps match "${searchQuery}". Try a different search term.`
            : "Start by generating your first learning roadmap from the Home tab"}
        </Text>
        {!isSearching && (
          <Button onPress={() => router.push("/(tabs)/")} className="mx-8">
            <Text className="text-primary-foreground font-semibold">
              Go to Home
            </Text>
          </Button>
        )}
      </View>
    );
  };

  const renderPaginationControls = () => {
    // Show pagination controls when there are more than 3 roadmaps (to see pagination with current data)
    // For production with 5 per page, you might want: if (filteredRoadmaps.length <= itemsPerPage) return null;
    if (filteredRoadmaps.length <= 3) return null;

    return (
      <View className="px-4 py-6 pb-12 border-t border-border/30 bg-background/95 backdrop-blur-sm mx-4 mb-8 rounded-lg shadow-sm">
        <View className="flex-row items-center justify-between mb-6">
          <Text className="text-sm text-muted-foreground font-medium">
            Showing {Math.min((currentPage - 1) * itemsPerPage + 1, filteredRoadmaps.length)}-{Math.min(currentPage * itemsPerPage, filteredRoadmaps.length)} of {filteredRoadmaps.length} roadmaps
          </Text>
          <Text className="text-sm text-muted-foreground font-medium">
            Page {currentPage} of {totalPages}
          </Text>
        </View>
        
        <View className="flex-row items-center justify-center">
          <Button
            variant="outline"
            size="sm"
            onPress={handlePreviousPage}
            disabled={currentPage === 1}
            className={`px-4 py-3 mr-3 ${currentPage === 1 ? 'opacity-50' : ''}`}
          >
            <View className="flex-row items-center">
              <Icon name="ChevronLeft" size={16} className="text-foreground" />
              <Text className="text-foreground text-sm ml-1 font-medium">Prev</Text>
            </View>
          </Button>

          <View className="flex-row items-center mx-4">
            {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
              let page: number;
              if (totalPages <= 5) {
                page = i + 1;
              } else {
                // Smart pagination for more than 5 pages
                if (currentPage <= 3) {
                  page = i + 1;
                } else if (currentPage >= totalPages - 2) {
                  page = totalPages - 4 + i;
                } else {
                  page = currentPage - 2 + i;
                }
              }
              
              return (
                <Button
                  key={page}
                  variant={page === currentPage ? "default" : "outline"}
                  size="sm"
                  onPress={() => handlePageChange(page)}
                  className={`w-12 h-12 mx-1 ${page === currentPage ? 'bg-primary border-primary' : 'bg-transparent border-border'}`}
                >
                  <Text className={`text-sm font-bold ${page === currentPage ? 'text-primary-foreground' : 'text-foreground'}`}>
                    {page}
                  </Text>
                </Button>
              );
            })}
          </View>

          <Button
            variant="outline"
            size="sm"
            onPress={handleNextPage}
            disabled={currentPage === totalPages}
            className={`px-4 py-3 ml-3 ${currentPage === totalPages ? 'opacity-50' : ''}`}
          >
            <View className="flex-row items-center">
              <Text className="text-foreground text-sm mr-1 font-medium">Next</Text>
              <Icon name="ChevronRight" size={16} className="text-foreground" />
            </View>
          </Button>
        </View>
      </View>
    );
  };

  return (
    <View className="flex-1">
      <AnimatedLinearGradient
        colors={gradientColors}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={[
          pulseStyle,
          {
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
          },
        ]}
      />

      <SafeAreaView className="flex-1 bg-transparent">
        <FlatList
          data={paginatedRoadmaps}
          renderItem={renderRoadmapCard}
          keyExtractor={(item) => item.id}
          showsVerticalScrollIndicator={false}
          contentInsetAdjustmentBehavior="automatic"
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor="#6366f1"
              colors={["#6366f1"]}
            />
          }
          ListHeaderComponent={
            <>
              <Animated.View style={headerStyle} className="p-3 pb-2">
                <Text className="text-3xl font-bold text-foreground pt-4 mb-2 ml-3">
                  My Roadmaps
                </Text>
                <Text className="text-base text-muted-foreground mb-2 ml-4">
                  {roadmaps.length > 0
                    ? `${roadmaps.length} learning path${roadmaps.length === 1 ? "" : "s"} created`
                    : "Your learning journey starts here"}
                </Text>
                {roadmaps.length > 0 && (
                  <View className="flex-row items-center ml-3 mb-2">
                    <View className="w-2 h-2 rounded-full bg-green-500 mr-2" />
                    <Text className="text-sm text-muted-foreground">
                      Tap any roadmap to continue learning
                    </Text>
                  </View>
                )}
              </Animated.View>

              {roadmaps.length > 0 && (
                <SearchBar
                  value={searchQuery}
                  onChangeText={setSearchQuery}
                  placeholder="Search your roadmaps..."
                />
              )}
            </>
          }
          ListEmptyComponent={!loading ? renderEmpty : null}
          ListFooterComponent={
            <>
              {renderPaginationControls()}
              <View className="h-32" />
            </>
          }
          contentContainerStyle={{ flexGrow: 1 }}
        />

        {loading && (
          <View className="flex-1 items-center justify-center">
            <Text className="text-lg text-muted-foreground">
              Loading roadmaps...
            </Text>
          </View>
        )}
      </SafeAreaView>
    </View>
  );
}
