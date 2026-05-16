"use client";

import { signInWithPopup } from "firebase/auth";
import { auth, provider } from "@/firebase/config";

export const fetchOAuthLogin = async () => {
  try {

    if (!auth) {
      throw new Error("Firebase auth not initialized");
    }

    const result = await signInWithPopup(auth, provider);

    const token = await result.user.getIdToken();

    const response = await fetch("http://localhost:5000/auth/google", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ token }),
    });

    return await response.json();

  } catch (error) {
    console.error(error);
    throw error;
  }
};