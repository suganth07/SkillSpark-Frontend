import React, { createContext, useContext, useState } from "react";

interface DataRefreshContextType {
  refreshTrigger: number;
  triggerRefresh: () => void;
}

const DataRefreshContext = createContext<DataRefreshContextType | undefined>(
  undefined
);

export function DataRefreshProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const triggerRefresh = () => {
    setRefreshTrigger((prev) => prev + 1);
  };

  return (
    <DataRefreshContext.Provider value={{ refreshTrigger, triggerRefresh }}>
      {children}
    </DataRefreshContext.Provider>
  );
}

export function useDataRefresh() {
  const context = useContext(DataRefreshContext);
  if (context === undefined) {
    throw new Error("useDataRefresh must be used within a DataRefreshProvider");
  }
  return context;
}
