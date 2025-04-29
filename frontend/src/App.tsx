import React, { Suspense, lazy } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";

// @ 대신 상대경로로 수정
const LoginPage = lazy(() => import("./pages/LoginPage"));

function App() {
  return (
    <BrowserRouter>
      <Suspense fallback={<div>로딩 중...</div>}>
        <Routes>
          {/* 루트 경로에 로그인 페이지 연결 */}
          <Route path="/" element={<LoginPage />} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
}

export default App;
