"use client";
import Login from "../../views/Login";
import { fetchOAuthLogin } from "@/services/auth";

export default function Page() {
  return <Login handleAuthLogin={fetchOAuthLogin} />;
}
