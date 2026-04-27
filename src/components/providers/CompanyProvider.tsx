"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { CompanyConfig, defaultCompanyConfig } from "@/types/company";
import { getCompanyConfig } from "@/lib/firestore";
import { useAuth } from "./AuthProvider";

interface CompanyContextType {
  config: CompanyConfig;
  loading: boolean;
  refreshConfig: () => Promise<void>;
}

const CompanyContext = createContext<CompanyContextType>({
  config: defaultCompanyConfig,
  loading: true,
  refreshConfig: async () => {},
});

export const useCompany = () => useContext(CompanyContext);

export const CompanyProvider = ({ children }: { children: React.ReactNode }) => {
  const [config, setConfig] = useState<CompanyConfig>(defaultCompanyConfig);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth(); // Depend on auth to fetch securely if needed

  const refreshConfig = async (force = false) => {
    if (config.name && !force && !loading) return; // Already have it
    setLoading(true);
    try {
      const fetchedConfig = await getCompanyConfig();
      setConfig(fetchedConfig);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refreshConfig();
  }, []); // Only fetch on mount, or rely on manual refresh

  // Inject CSS variables for primary color based on config
  useEffect(() => {
    if (config.primaryColor) {
      document.documentElement.style.setProperty("--color-primary", config.primaryColor);
    }
  }, [config.primaryColor]);

  return (
    <CompanyContext.Provider value={{ config, loading, refreshConfig }}>
      {children}
    </CompanyContext.Provider>
  );
};
