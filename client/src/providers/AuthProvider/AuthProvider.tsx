import { createContext, useContext, useEffect, useState } from "react";
import { supabase } from "@/core/supabase";

export interface AppUser {
  id: string;
  email: string;
  full_name: string;
  role: "super_admin" | "hr_recruiter" | "job_seeker";
  status?: string;
  phone?: string;
  title?: string;
  bio?: string;
  location?: string;
  skills?: string[];
  experience_history?: any[];
  education_history?: any[];
  is_disabled?: boolean;
  disability_type?: string;
  references_list?: Array<{ name: string; company: string; phone: string; note?: string }>;
  document_url?: string;
  document_name?: string;
  user_photos?: string[];
  company_name?: string;
  company_sector?: string;
  company_size?: string;
  company_website?: string;
  company_address?: string;
  company_logo?: string;
  tax_office?: string;
  tax_number?: string;
  company_legal_type?: string;
  authorized_person?: string;
  hide_phone?: boolean;
}

type AuthContextProps = {
  isAuthenticated: boolean;
  user: AppUser | null;
  isSuperAdmin: boolean;
  isEmployer: boolean;
  isJobSeeker: boolean;
  login: (token: string, user: AppUser) => void;
  logout: () => void;
  updateCurrentUser: (updated: Partial<AppUser>) => void;
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

  const updateCurrentUser = (updated: Partial<AppUser>) => {
    if (!user) return;
    const merged = { ...user, ...updated };
    setUser(merged);
    localStorage.setItem("jobportal_user", JSON.stringify(merged));
  };

  useEffect(() => {
    const savedUser = localStorage.getItem("jobportal_user");
    const savedToken = localStorage.getItem("jobportal_token");
    if (savedUser && savedToken) {
      try {
        const parsed = JSON.parse(savedUser);
        setUser(parsed);
        setIsAuthenticated(true);

        if (parsed.id && parsed.id !== "super_admin_oxonom") {
          supabase
            .from("profiles")
            .select("*")
            .eq("id", parsed.id)
            .single()
            .then(({ data }) => {
              if (data) {
                const refreshed = { ...parsed, ...data };
                setUser(refreshed);
                localStorage.setItem("jobportal_user", JSON.stringify(refreshed));
              }
            });
        }
      } catch (e) {
        logout();
      }
    }
  }, []);

  const isSuperAdmin = user?.role === "super_admin";
  const isEmployer = user?.role === "hr_recruiter";
  const isJobSeeker = user?.role === "job_seeker";

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated,
        user,
        isSuperAdmin,
        isEmployer,
        isJobSeeker,
        login,
        logout,
        updateCurrentUser,
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
