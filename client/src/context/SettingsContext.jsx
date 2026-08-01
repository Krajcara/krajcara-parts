import { createContext, useContext, useEffect, useState } from "react";
import { api } from "../api";

const SettingsContext = createContext({});

export function SettingsProvider({ children }) {
  const [settings, setSettings] = useState({});
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    api
      .get("/settings")
      .then(setSettings)
      .catch(() => {})
      .finally(() => setLoaded(true));
  }, []);

  function refreshSettings() {
    return api.get("/settings").then(setSettings);
  }

  return (
    <SettingsContext.Provider value={{ settings, loaded, refreshSettings }}>
      {children}
    </SettingsContext.Provider>
  );
}

export function useSettings() {
  return useContext(SettingsContext);
}
