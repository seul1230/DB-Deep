import React, { lazy } from "react";
import { Route, Routes, Navigate } from "react-router-dom";
import Layout from "../widgets/Layout/Layout";

const LoginPage = lazy(() => import("../pages/LoginPage/LoginPage"));
const MainPage = lazy(() => import("../pages/MainPage/MainPage"));

const Router = () => {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/login" replace />} />
      <Route path="/login" element={<LoginPage />} />
      <Route element={<Layout />}>
        <Route path="/main" element={<MainPage />} />
      </Route>
    </Routes>
  );
};

export default Router;
