import { lazy, useEffect } from "react";
import { Route, Routes, Navigate, useNavigate } from "react-router-dom";
import { useAuth } from "@/features/auth/useAuth";
import Layout from "../widgets/Layout/Layout";
import ProtectedRoute from "./ProtectedRoute";
import SearchPage from "@/pages/SearchPage/SearchPage";
import ArchivePage from "@/pages/ArchivePage/ArchivePage";

const LoginPage = lazy(() => import("../pages/LoginPage/LoginPage"));
const MainPage = lazy(() => import("../pages/MainPage/MainPage"));
const ChangePasswordPage = lazy(() => import("../pages/ChangePasswordPage/ChangePasswordPage"))
const ChatDetailPage = lazy(() => import("../pages/ChatDetailPage/ChatDetailPage"))
const ProjectDetailPage = lazy(()=>import("../pages/ProjectDetailPage/ProjectDetailPage"))
const ArchiveDetailPage = lazy(()=>import("../pages/ArchiveDetailPage/ArchiveDetailPage"))

const Router = () => {
  const isLoggedOut = useAuth((state) => state.isLoggedOut);
  const navigate = useNavigate();

  useEffect(() => {
    if (isLoggedOut) {
      navigate("/login");
    }
  }, [isLoggedOut, navigate]);

  return (
    <Routes>
      <Route path="/" element={<Navigate to="/login" replace />} />
      
      {/* 로그인만 예외 */}
      <Route path="/login" element={<LoginPage />} />

      {/* 보호되는 모든 페이지 */}
      <Route element={<ProtectedRoute><Layout /></ProtectedRoute>}>
        <Route path="/main" element={<MainPage />} />
        <Route path="/change-password" element={<ChangePasswordPage />} />
        <Route path="/chat/:chatId" element={<ChatDetailPage />} />
        <Route path="/search" element={<SearchPage />} />
        <Route path="/archive" element={<ArchivePage />} />
        <Route path="/project/:projectId" element={<ProjectDetailPage />} />
        <Route path="/archiveDetail" element={<ArchiveDetailPage />} />
        {/* 여기에 더 추가 가능 */}
      </Route>
    </Routes>
  );
};

export default Router;
