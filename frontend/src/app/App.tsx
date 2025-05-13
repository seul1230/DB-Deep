import { useThemeStore } from "@/shared/store/themeStore";
import { BrowserRouter } from "react-router-dom";
import { Suspense, useEffect } from "react";
import AppRoutes from "../app/Router";
import CustomToastContainer from "@/shared/ui/CustomToastContainer/CustomToastContainer";
import { connectSocket } from "@/shared/api/socketManager";

const App = () => {
  const theme = useThemeStore((state) => state.theme);

  // 테마 변경 시 body에 클래스 적용
  useEffect(() => {
    document.body.classList.remove("light", "dark");
    document.body.classList.add(theme);
  }, [theme]);

  useEffect(() => {
    const stored = localStorage.getItem("auth-storage");
    const token = stored ? JSON.parse(stored)?.state?.accessToken : null;

    if (!token) return;

    connectSocket().catch((err) => {
      console.warn("🔁 새로고침 시 소켓 자동 연결 실패", err);
    });
  }, []);

  return (
    <BrowserRouter>
      <Suspense fallback={<div>페이지 로딩 중...</div>}>
        <AppRoutes />
        <CustomToastContainer />
      </Suspense>
    </BrowserRouter>
  );
};

export default App;
