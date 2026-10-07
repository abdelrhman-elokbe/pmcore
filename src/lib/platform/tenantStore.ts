import { useCallback, useSyncExternalStore } from "react";

type Updater<T> = T | ((prev: T) => T);

/** Tiny per-tenant in-memory store so admin screens and the client preview share draft config. */
export function createTenantStore<T>(seed: (tenantId: string) => T) {
  const map = new Map<string, T>();
  const listeners = new Set<() => void>();
  const get = (tid: string) => {
    if (!map.has(tid)) map.set(tid, seed(tid));
    return map.get(tid)!;
  };
  const set = (tid: string, u: Updater<T>) => {
    map.set(tid, typeof u === "function" ? (u as (p: T) => T)(get(tid)) : u);
    listeners.forEach((l) => l());
  };
  const reset = (tid: string) => set(tid, seed(tid));
  const subscribe = (l: () => void) => {
    listeners.add(l);
    return () => {
      listeners.delete(l);
    };
  };
  function use(tid: string) {
    const value = useSyncExternalStore(
      subscribe,
      () => get(tid),
      () => get(tid),
    );
    const setValue = useCallback((u: Updater<T>) => set(tid, u), [tid]);
    return [value, setValue] as const;
  }
  return { get, set, reset, subscribe, use };
}
