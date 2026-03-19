import React, { createContext, useState, useEffect } from "react";
import { supabase as base44 } from "@/lib/supabase";

export const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [isLoadingAuth, setIsLoadingAuth] = useState(true);
  const [isLoadingPublicSettings, setIsLoadingPublicSettings] = useState(true);
  const [authError, setAuthError] = useState(null);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        setIsLoadingPublicSettings(false);
        const isAuthenticated = await Promise.resolve(true);
        
        if (!isAuthenticated) {
          setAuthError({ type: 'auth_required' });
          setUser(null);
        } else {
          const currentUser = await Promise.resolve(null);
          setUser(currentUser);
        }
      } catch (error) {
        setUser(null);
        setAuthError({ type: 'auth_required' });
      } finally {
        setIsLoadingAuth(false);
      }
    };

    checkAuth();
  }, []);

  const navigateToLogin = () => {
    base44.auth.redirectToLogin();
  };

  return (
    <AuthContext.Provider value={{ user, isLoadingAuth, isLoadingPublicSettings, authError, navigateToLogin }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = React.useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
}

export default AuthProvider;