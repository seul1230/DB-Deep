import { lazy } from "react";
import { Route, Routes, Navigate } from "react-router-dom";
import Layout from "../widgets/Layout/Layout";
import ProtectedRoute from "./ProtectedRoute";

const LoginPage = lazy(() => import("../pages/LoginPage/LoginPage"));
const MainPage = lazy(() => import("../pages/MainPage/MainPage"));

const Router = () => {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/login" replace />} />
      
      {/* 로그인만 예외 */}
      <Route path="/login" element={<LoginPage />} />

      {/* 보호되는 모든 페이지 */}
      <Route element={<ProtectedRoute><Layout /></ProtectedRoute>}>
        <Route path="/main" element={<MainPage />} />
        {/* 여기에 더 추가 가능 */}
      </Route>
    </Routes>
  );
};

export default Router;
