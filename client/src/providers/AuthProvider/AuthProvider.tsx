import { createContext, useContext, useEffect, useState } from "react";

export interface AppUser {
  id: string;
  email: string;
  full_name: string;
  role: "super_admin" | "hr_recruiter" | "job_seeker";
  status?: string;
  phone?: string;
}

type AuthContextProps = {
  isAuthenticated: boolean;
  user: AppUser | null;
  isSuperAdmin: boolean;
  login: (token: string, user: AppUser) => void;
  logout: () => void;
};

const AuthContext = createContext<AuthContextProps | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<AppUser | null>(null);

  const login = (token: string, userData: AppUser) => {
    localStorage.setItem("jobportal_token", token);
    localStorage.setItem("jobportal_user", JSON.stringify(userData));
    setUser(userData);
    setIsAuthenticated(true);
  };

  const logout = () => {
    localStorage.removeItem("jobportal_token");
    localStorage.removeItem("jobportal_user");
    setUser(null);
    setIsAuthenticated(false);
  };

  useEffect(() => {
    const savedUser = localStorage.getItem("jobportal_user");
    const savedToken = localStorage.getItem("jobportal_token");
    if (savedUser && savedToken) {
      try {
        const parsed = JSON.parse(savedUser);
        setUser(parsed);
        setIsAuthenticated(true);
      } catch (e) {
        logout();
      }
    }
  }, []);

  const isSuperAdmin = user?.role === "super_admin";

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated,
        user,
        isSuperAdmin,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextProps => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
