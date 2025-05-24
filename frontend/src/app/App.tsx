import { useThemeStore } from "@/shared/store/themeStore";
import { HashRouter } from "react-router-dom";
import { Suspense, useEffect } from "react";
import AppRoutes from "../app/Router";
import CustomToastContainer from "@/shared/ui/CustomToastContainer/CustomToastContainer";

const App = () => {
  const theme = useThemeStore((state) => state.theme);

  // 테마 변경 시 body에 클래스 적용
  useEffect(() => {
    document.body.classList.remove("light", "dark");
    document.body.classList.add(theme);
  }, [theme]);

  return (
    <HashRouter>
      <Suspense fallback={null}>
        <AppRoutes />
        <CustomToastContainer />
      </Suspense>
    </HashRouter>
  );
};

export default App;
