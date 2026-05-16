"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Input from "../components/ui/Input";
import Button from "../components/ui/Button";
import { FcGoogle } from "react-icons/fc";

const Register = (onOAuth) => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const router = useRouter();
  const [error, setError] = useState("");
  const [step, setStep] = useState("register");
  const [otp, setOtp] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleOAuth = () => {
    onOAuth;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    if (!name || !email || !password) {
      setError("Please fill all fields.");
      return;
    }
    if (password.length < 6) {
      setError("Password should be at least 6 characters.");
      return;
    }
    try {
      setIsSubmitting(true);
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password }),
      });
      const data = await res.json();
      if (res.ok) {
        setStep("verify");
        setOtp("");
      } else {
        setError(data.message || "Registration failed.");
      }
    } catch (error) {
      console.error(error);
      setError("Registration failed. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleVerify = async (e) => {
    e.preventDefault();
    setError("");
    if (!otp.trim()) {
      setError("Please enter the OTP sent to your email.");
      return;
    }
    try {
      setIsSubmitting(true);
      const res = await fetch("/api/auth/verify-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, otp }),
      });
      const data = await res.json();
      if (res.ok) {
        alert("Verification successful. Please login.");
        router.push("/login");
      } else {
        setError(data.message || "OTP verification failed.");
      }
    } catch (error) {
      console.error(error);
      setError("OTP verification failed. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="auth-container">
      {step === "register" ? (
        <form onSubmit={handleSubmit} className="auth-form">
          <h2>Register</h2>
          <Input
            label="Full Name"
            type="text"
            name="name"
            placeholder="Full Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
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
            placeholder="Create a password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            helperText="Minimum 6 characters"
            required
          />
          {error && (
            <p className="form-error" role="alert">
              {error}
            </p>
          )}
          <Button type="submit" size="lg" disabled={isSubmitting}>
            {isSubmitting ? "Sending OTP..." : "Register"}
          </Button>
          <Button type="button" size="lg" variant="secondary" onClick={handleOAuth}>
            <FcGoogle size={14} /> Sign With google
          </Button>
          <p>
            Already have an account? <Link href="/login">Login</Link>
          </p>
        </form>
      ) : (
        <form onSubmit={handleVerify} className="auth-form">
          <h2>Verify OTP</h2>
          <p className="auth-note">
            We sent a 6-digit OTP to <strong>{email}</strong>.
          </p>
          <Input
            label="OTP"
            type="text"
            name="otp"
            placeholder="Enter 6-digit OTP"
            value={otp}
            onChange={(e) => setOtp(e.target.value)}
            inputMode="numeric"
            required
          />
          {error && (
            <p className="form-error" role="alert">
              {error}
            </p>
          )}
          <Button type="submit" size="lg" disabled={isSubmitting}>
            {isSubmitting ? "Verifying..." : "Verify"}
          </Button>
          <button
            type="button"
            className="auth-link"
            onClick={() => setStep("register")}
          >
            Back to Register
          </button>
        </form>
      )}
    </div>
  );
};

export default Register;
