import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  ReactNode,
} from "react";
import { Roadmap } from "~/queries/roadmap-queries";

interface RoadmapStats {
  totalRoadmaps: number;
  completedPoints: number;
  totalPoints: number;
  activeRoadmapProgress: number;
}

interface RoadmapDataContextType {
  activeRoadmap: Roadmap | null;
  stats: RoadmapStats;
  refreshTrigger: number;
  setActiveRoadmap: (roadmap: Roadmap | null) => void;
  setStats: (stats: RoadmapStats) => void;
  refreshData: () => void;
}

const defaultStats: RoadmapStats = {
  totalRoadmaps: 0,
  completedPoints: 0,
  totalPoints: 0,
  activeRoadmapProgress: 0,
};

const RoadmapDataContext = createContext<RoadmapDataContextType>({
  activeRoadmap: null,
  stats: defaultStats,
  refreshTrigger: 0,
  setActiveRoadmap: () => {},
  setStats: () => {},
  refreshData: () => {},
});

export const RoadmapDataProvider = ({ children }: { children: ReactNode }) => {
  const [activeRoadmap, setActiveRoadmap] = useState<Roadmap | null>(null);
  const [stats, setStats] = useState<RoadmapStats>(defaultStats);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const refreshData = useCallback(() => {
    setRefreshTrigger((prev) => prev + 1);
  }, []);

  const updateActiveRoadmap = useCallback((roadmap: Roadmap | null) => {
    setActiveRoadmap(roadmap);
  }, []);

  return (
    <RoadmapDataContext.Provider
      value={{
        activeRoadmap,
        stats,
        refreshTrigger,
        setActiveRoadmap: updateActiveRoadmap,
        setStats,
        refreshData,
      }}
    >
      {children}
    </RoadmapDataContext.Provider>
  );
};

export const useRoadmapData = () => useContext(RoadmapDataContext);
