import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { lazy, Suspense, useEffect } from "react";
import LoginPage from "@/pages/LoginPage/LoginPage";
import { useThemeStore } from "@/shared/store/themeStore";

// MainPage는 Lazy 로딩
const MainPage = lazy(() => import("@/pages/MainPage/MainPage"));

const App = () => {
  const theme = useThemeStore((state) => state.theme);

  // 테마 변경 시 body에 클래스 적용
  useEffect(() => {
    document.body.classList.remove("light", "dark");
    document.body.classList.add(theme);
  }, [theme]);

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
