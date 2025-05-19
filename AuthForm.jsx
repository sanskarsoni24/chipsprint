import React, { useState } from "react";
import { login, register } from "../api";

export default function AuthForm({ onLogin }) {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [msg, setMsg] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (isLogin) {
        const { data } = await login(email, password);
        onLogin(data.access_token);
      } else {
        await register(email, password);
        setMsg("Registration successful! You can now log in.");
        setIsLogin(true);
      }
    } catch (err) {
      setMsg(err.response?.data?.detail || "Error");
    }
  };

  return (
    <div className="bg-white p-6 rounded shadow w-80">
      <form onSubmit={handleSubmit}>
        <h2 className="text-xl font-bold mb-2">{isLogin ? "Login" : "Register"}</h2>
        <input
          className="w-full mb-2 px-2 py-1 border rounded"
          type="email"
          placeholder="Email"
          value={email}
          onChange={e => setEmail(e.target.value)}
          required
        />
        <input
          className="w-full mb-2 px-2 py-1 border rounded"
          type="password"
          placeholder="Password"
          value={password}
          onChange={e => setPassword(e.target.value)}
          required
        />
        <button className="w-full bg-blue-500 text-white py-2 rounded mb-2" type="submit">
          {isLogin ? "Login" : "Register"}
        </button>
        <div className="text-center mb-2">
          <button type="button" className="text-blue-600 text-sm" onClick={() => setIsLogin(!isLogin)}>
            {isLogin ? "Need an account?" : "Have an account?"}
          </button>
        </div>
        {msg && <div className="text-red-500 text-sm">{msg}</div>}
      </form>
    </div>
  );
}