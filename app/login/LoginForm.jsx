"use client";

import { useState } from "react";

const VALID_USER = "vikram_adm";
const VALID_PASS = "Indi?ErP#8961";

export default function LoginForm() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    setTimeout(() => {
      if (username === VALID_USER && password === VALID_PASS) {
        sessionStorage.setItem("hrms_auth", "true");
        window.location.href = "/";
      } else {
        setError("Invalid username or password.");
        setLoading(false);
      }
    }, 400);
  };

  return (
    <form onSubmit={handleSubmit} className="login-form">
      <div className="login-form-header">
        <img src="/logo.png" alt="Indipet" className="login-logo" />
        <h1>Indipet HRMS</h1>
        <p>Sign in to your account</p>
      </div>
      {error && <div className="login-error">{error}</div>}
      <div className="login-field">
        <label htmlFor="username">Username</label>
        <input
          id="username"
          type="text"
          placeholder="Enter your username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          autoFocus
          required
        />
      </div>
      <div className="login-field">
        <label htmlFor="password">Password</label>
        <input
          id="password"
          type="password"
          placeholder="Enter your password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
      </div>
      <button type="submit" className="login-submit" disabled={loading}>
        {loading ? "Signing in..." : "Sign In"}
      </button>
    </form>
  );
}
