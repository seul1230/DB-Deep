import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { lazy, Suspense } from "react";
import LoginPage from "@/pages/LoginPage/LoginPage";

// MainPage는 Lazy 로딩
const MainPage = lazy(() => import("@/pages/MainPage/MainPage"));

const App = () => {
  return (
    <BrowserRouter>
    <Suspense fallback={<div>페이지 로딩 중...</div>}>
      <Routes>
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/main" element={<MainPage />} />
      </Routes>
      </Suspense>
    </BrowserRouter>
  );
};

export default App;
