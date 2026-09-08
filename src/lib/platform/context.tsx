import { createContext, useContext, useMemo, useState, type ReactNode } from "react";
import { getTenant, tenants, type Tenant } from "./data";

export type AdminRole = "host" | "tenant";

type PlatformState = {
  role: AdminRole;
  setRole: (r: AdminRole) => void;
  tenantId: string;
  setTenantId: (id: string) => void;
  tenant: Tenant;
  tenants: Tenant[];
  isHost: boolean;
  draftChanges: number;
};

const PlatformContext = createContext<PlatformState | null>(null);

export function PlatformProvider({ children }: { children: ReactNode }) {
  const [role, setRole] = useState<AdminRole>("host");
  const [tenantId, setTenantId] = useState<string>(tenants[0]!.id);

  const value = useMemo<PlatformState>(
    () => ({
      role,
      setRole,
      tenantId,
      setTenantId,
      tenant: getTenant(tenantId),
      tenants,
      isHost: role === "host",
      draftChanges: 7,
    }),
    [role, tenantId],
  );

  return <PlatformContext.Provider value={value}>{children}</PlatformContext.Provider>;
}

export function usePlatform() {
  const ctx = useContext(PlatformContext);
  if (!ctx) throw new Error("usePlatform must be used inside PlatformProvider");
  return ctx;
}
