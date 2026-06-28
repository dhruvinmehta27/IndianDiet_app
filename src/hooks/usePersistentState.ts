import { useCallback, useEffect, useRef, useState } from "react";

/**
 * useState that transparently persists to localStorage. Safe on first paint
 * (lazy init) and resilient to malformed stored JSON.
 */
export function usePersistentState<T>(
  key: string,
  initial: T,
): [T, (value: T | ((prev: T) => T)) => void] {
  const [state, setState] = useState<T>(() => {
    if (typeof window === "undefined") return initial;
    try {
      const raw = window.localStorage.getItem(key);
      return raw ? (JSON.parse(raw) as T) : initial;
    } catch {
      return initial;
    }
  });

  // Avoid writing on the very first render (value just read from storage).
  const hydrated = useRef(false);
  useEffect(() => {
    if (!hydrated.current) {
      hydrated.current = true;
      return;
    }
    try {
      window.localStorage.setItem(key, JSON.stringify(state));
    } catch {
      /* quota exceeded or unavailable — fail silently */
    }
  }, [key, state]);

  const set = useCallback((value: T | ((prev: T) => T)) => setState(value), []);
  return [state, set];
}
