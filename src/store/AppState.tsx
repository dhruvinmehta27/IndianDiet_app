import { createContext, useContext, type ReactNode } from "react";
import { useMacroPlanner, type MacroPlanner } from "@/hooks/useMacroPlanner";
import { useMealLog, type MealLog } from "@/hooks/useMealLog";
import { useTheme, type Theme } from "@/hooks/useTheme";

/**
 * The single application store. Instantiated once at the root and shared with
 * every view through context, so the macro planner (targets), the meal log
 * (intake + history) and the theme stay perfectly in sync across the
 * Calculator, AI Scanner and History screens.
 */
export interface AppStore {
  planner: MacroPlanner;
  mealLog: MealLog;
  theme: Theme;
  toggleTheme: () => void;
}

const AppStateContext = createContext<AppStore | null>(null);

export function AppStateProvider({ children }: { children: ReactNode }) {
  const planner = useMacroPlanner();
  const mealLog = useMealLog();
  const { theme, toggleTheme } = useTheme();

  return (
    <AppStateContext.Provider value={{ planner, mealLog, theme, toggleTheme }}>
      {children}
    </AppStateContext.Provider>
  );
}

export function useAppState(): AppStore {
  const ctx = useContext(AppStateContext);
  if (!ctx) throw new Error("useAppState must be used within an AppStateProvider");
  return ctx;
}
