"use client";

import StoreProvider from "@/state/redux";
import { AuthProvider } from "@/contexts/AuthContext";

const Providers = ({ children }: { children: React.ReactNode }) => {
  return (
    <AuthProvider>
      <StoreProvider>{children}</StoreProvider>
    </AuthProvider>
  );
};

export default Providers;
