import React, { useState } from "react";
import { setToken } from "./api";
import AuthForm from "./components/AuthForm";
import Dashboard from "./components/Dashboard";

export default function App() {
  const [token, setTokenState] = useState(localStorage.getItem("token") || null);

  const onLogin = (t) => {
    setToken(t);
    setTokenState(t);
    localStorage.setItem("token", t);
  };

  const onLogout = () => {
    setTokenState(null);
    localStorage.removeItem("token");
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center">
      <h1 className="text-3xl font-bold mb-4">ChipSprint</h1>
      {!token ? (
        <AuthForm onLogin={onLogin} />
      ) : (
        <Dashboard token={token} onLogout={onLogout} />
      )}
    </div>
  );
}