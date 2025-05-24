import React from "react";
import ReactDOM from "react-dom/client";
import App from "@/app/App";  // 📌 경로 주의: app/App.tsx
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import "./styles/global.css"; // 📌 글로벌 스타일

const queryClient = new QueryClient();

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <App />
    </QueryClientProvider>
  </React.StrictMode>
);
