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
const EmployerPage = lazy(() => import("@/pages/EmployerPage"));

function App() {
  const { isAuthenticated, isSuperAdmin, isEmployer } = useAuth();

  return (
    <BrowserRouter>
      {isAuthenticated ? (
        <Routes>
          <Route path="/" element={<AppWrapper />}>
            {/* If Employer, home redirects to /employer */}
            <Route index element={isEmployer ? <EmployerPage /> : <HomePage />} />
            <Route path="/employer" element={<EmployerPage />} />
            <Route path="/admin" element={isSuperAdmin ? <AdminPage /> : <Navigate to="/" />} />
            <Route path="/my-jobs" element={isEmployer ? <Navigate to="/employer" /> : <MyJobsPage />} />
            <Route path="/saved-jobs" element={isEmployer ? <Navigate to="/employer" /> : <SavedJobsPage />} />
            <Route path="/messages" element={<MessagesPage />} />
            <Route path="/profile" element={<ProfilePage />} />
            <Route path="/login" element={<Navigate to={isSuperAdmin ? "/admin" : isEmployer ? "/employer" : "/"} />} />
            <Route path="/register" element={<Navigate to={isSuperAdmin ? "/admin" : isEmployer ? "/employer" : "/"} />} />
            <Route path="/forgot-password" element={<Navigate to="/" />} />
            <Route path="*" element={<Navigate to="/" />} />
          </Route>
        </Routes>
      ) : (
        <Routes>
          <Route path="/" element={<AppWrapper />}>
            <Route index element={<HomePage />} />
            <Route path="/admin" element={<Navigate to="/login" />} />
            <Route path="/employer" element={<Navigate to="/login" />} />
            <Route path="/my-jobs" element={<Navigate to="/login" />} />
            <Route path="/saved-jobs" element={<Navigate to="/login" />} />
            <Route path="/profile" element={<Navigate to="/login" />} />
            <Route path="/messages" element={<Navigate to="/login" />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/forgot-password" element={<ForgotPasswordPage />} />
            <Route path="*" element={<Navigate to="/" />} />
          </Route>
        </Routes>
      )}
    </BrowserRouter>
  );
}

export default App;
