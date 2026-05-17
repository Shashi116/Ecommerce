"use client";

import React, { useState, useContext } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AuthContext } from "../context/AuthContext";
import Input from "../components/ui/Input";
import Button from "../components/ui/Button";
import { FcGoogle } from "react-icons/fc";
import authService from "../services/auth.service";

const Login = ({ handleAuthLogin }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const { login } = useContext(AuthContext);
  const router = useRouter();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleOAuth = async () => {
    try {
      setLoading(true);
      await handleAuthLogin();
    } catch (err) {
      console.error(err);
      setError("Google login failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    if (!email || !password) {
      setError("Please enter both email and password.");
      return;
    }
    try {
      setLoading(true);
      const data = await authService.login(email, password);
      login(data);
      router.push("/");
    } catch (error) {
      setError(error.message || "Login failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <form onSubmit={handleSubmit} className="auth-form">
        <h2>Login</h2>
        <Input
          label="Email"
          type="email"
          name="email"
          placeholder="you@email.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <Input
          label="Password"
          type="password"
          name="password"
          placeholder="••••••••"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        {error && (
          <p className="form-error" role="alert">
            {error}
          </p>
        )}
        <Button type="submit" size="lg">
          Login
        </Button>
        <Button
          type="button"
          size="lg"
          variant="secondary"
          onClick={handleOAuth}
        >
          <FcGoogle size={14} /> Sign With google
        </Button>
        <p>
          Don't have an account? <Link href="/register">Register</Link>
        </p>
      </form>
    </div>
  );
};

export default Login;
