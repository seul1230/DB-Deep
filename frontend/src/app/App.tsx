import { BrowserRouter } from "react-router-dom";
import { Suspense } from "react";
import AppRoutes from "../app/Router";

const App = () => {
  return (
    <BrowserRouter>
      <Suspense fallback={<div>페이지 로딩 중...</div>}>
        <AppRoutes />
      </Suspense>
    </BrowserRouter>
  );
};

export default App;
