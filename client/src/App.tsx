import { lazy } from "react";
import HomePage from "@/pages/HomePage";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import AppWrapper from "./AppWrapper";
import { useAuth } from "./providers";

const LoginPage = lazy(() => import("@/pages/AuthPages/LoginPage"));
const RegisterPage = lazy(() => import("@/pages/AuthPages/RegisterPage"));
const ForgotPasswordPage = lazy(
  () => import("@/pages/AuthPages/ForgotPasswordPage")
);
const MyJobsPage = lazy(() => import("@/pages/MyJobsPage"));
const SavedJobsPage = lazy(() => import("@/pages/SavedJobsPage"));
const MessagesPage = lazy(() => import("@/pages/MessagesPage"));
const ProfilePage = lazy(() => import("@/pages/ProfilePage"));
const AdminPage = lazy(() => import("@/pages/AdminPage"));

function App() {
  const { isAuthenticated, isSuperAdmin } = useAuth();

  return (
    <BrowserRouter>
      {isAuthenticated ? (
        <Routes>
          <Route path="/" element={<AppWrapper />}>
            <Route index element={<HomePage />} />
            <Route path="/admin" element={<AdminPage />} />
            <Route path="/my-jobs" element={<MyJobsPage />} />
            <Route path="/saved-jobs" element={<SavedJobsPage />} />
            <Route path="/messages" element={<MessagesPage />} />
            <Route path="/profile" element={<ProfilePage />} />
            <Route path="/login" element={<Navigate to={isSuperAdmin ? "/admin" : "/"} />} />
            <Route path="/register" element={<Navigate to={isSuperAdmin ? "/admin" : "/"} />} />
            <Route path="/forgot-password" element={<Navigate to="/" />} />
            <Route path="*" element={<Navigate to="/" />} />
          </Route>
        </Routes>
      ) : (
        <Routes>
          <Route path="/" element={<AppWrapper />}>
            <Route index element={<HomePage />} />
            <Route path="/admin" element={<Navigate to="/login" />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/forgot-password" element={<ForgotPasswordPage />} />
            <Route path="*" element={<Navigate to="/login" />} />
          </Route>
        </Routes>
      )}
    </BrowserRouter>
  );
}

export default App;
