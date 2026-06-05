import { CssBaseline } from "@mui/material";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useState, useEffect, useCallback } from "react";

import LandingPage from "./LandingPage";
import Login from "./Login";
import Register from "./Register";
import Dashboard from "./Dashboard";
import Shopping from "./Shopping";
import Admin from "./Admin";
export default function App() {
  const [isAuth, setIsAuth] = useState(
    !!localStorage.getItem("accessToken")
  );

  useEffect(() => {
    function syncAuth() {
      setIsAuth(!!localStorage.getItem("accessToken"));
    }
    window.addEventListener("storage", syncAuth);
    return () => window.removeEventListener("storage", syncAuth);
  }, []);

  const handleLogin = useCallback(() => {
    setIsAuth(true);
  }, []);

  const handleLogout = useCallback(() => {
    localStorage.clear();
    setIsAuth(false);
  }, []);

  return (
    <>
      <CssBaseline />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<LandingPage />} />

          <Route
            path="/login"
            element={<Login onLogin={handleLogin} />}
          />

          <Route path="/register" element={<Register />} />

          <Route
            path="/dashboard"
            element={
              isAuth ? (
                <Dashboard onLogout={handleLogout} />
              ) : (
                <Navigate to="/login" replace />
              )
            }
          />
          <Route
            path="/shopping"
            element={
              isAuth ? (
                <Shopping onLogout={handleLogout} />
              ) : (
                <Navigate to="/login" replace />
              )
            }
          />
          <Route
            path="/admin"
            element={
              isAuth ? <Admin /> : <Navigate to="/login" replace />
            }
          />

        </Routes>
      </BrowserRouter>
    </>
  );
}
