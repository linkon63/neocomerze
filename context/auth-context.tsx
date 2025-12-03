import React, { createContext, useContext, useMemo, useState } from 'react';

type AuthContextType = {
  isAuthenticated: boolean;
  userPhone: string;
  login: (email: string, password: string) => Promise<boolean>;
  setAuthenticated: (value: boolean) => void;
  setUserPhone: (value: string) => void;
  logout: () => void;
};

const DEFAULT_EMAIL = 'admin@gmail.com';
const DEFAULT_PASSWORD = 'password';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userPhone, setUserPhone] = useState('');

  const login = async (email: string, password: string) => {
    const ok =
      email.trim().toLowerCase() === DEFAULT_EMAIL && password === DEFAULT_PASSWORD;
    setIsAuthenticated(ok);
    if (ok) {
      setUserPhone(email);
    }
    return ok;
  };

  const setAuthenticated = (value: boolean) => setIsAuthenticated(value);

  const logout = () => {
    setIsAuthenticated(false);
    setUserPhone('');
  };

  const value = useMemo(
    () => ({
      isAuthenticated,
      userPhone,
      login,
      setAuthenticated,
      setUserPhone,
      logout,
    }),
    [isAuthenticated, userPhone]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return ctx;
}
