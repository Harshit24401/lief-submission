
// providers/AuthProvider.tsx
"use client";

import { useUser } from "@auth0/nextjs-auth0";
import { useEffect, useState } from "react";
import { Spin } from "antd";
import { gqlFetch } from "../lib/graphqlfetch";

export default function AuthProvider({ children }: { children: React.ReactNode }) {
  const { user, isLoading } = useUser();
  const [dbUser, setDbUser] = useState<any>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  // Fetch role from GraphQL
  useEffect(() => {
    if (user) {
      gqlFetch(`query { me { id email role } }`)
        .then((d) => setDbUser(d.me))
        .catch((err) => console.error(err));
    }
  }, [user]);

  if (!mounted || isLoading || (user && !dbUser)) {
    return (
      <div
        style={{
          height: "100vh",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <Spin size="large" />
      </div>
    );
  }

  if (!user) {
    if (typeof window !== "undefined") {
      window.location.href = "/auth/login";
    }
    return null;
  }

  // ✅ Role-based redirects
  if (typeof window !== "undefined" && dbUser?.role) {
    if (dbUser.role === "Manager" && !window.location.pathname.startsWith("/dashboard/manager")) {
      window.location.href = "/dashboard/manager";
      return null;
    }
    if (dbUser.role === "CareWorker" && window.location.pathname.startsWith("/dashboard/manager")) {
      window.location.href = "/dashboard";
      return null;
    }
  }

  return <>{children}</>;
}
