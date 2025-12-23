

import { useState } from "react";
import { signIn, signOut, useSession } from 'next-auth/react'
import api from "@/shared/lib/api";
import { redirect } from "next/navigation";
import { useRouter } from "next/navigation";

export default function useAuth() {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const { data: session, status } = useSession();
    const router = useRouter();


    // Register function
    async function register({ email, password }) {
    try {
      setError(null)
      setLoading(true)

      const res = await api.post("/auth/register", {
        email,
        password,
      })

      return res.data
    } catch (err) {
      console.error("Register error", err)
      const msg =
        err.response?.data?.message ||
        err.response?.data?.error ||
        "Failed to register"
      setError(msg)
      throw err
    } finally {
      setLoading(false)
    }
  }

//  Login function using NextAuth
  async function login({ email, password }) {
    try {
      setError(null)
      setLoading(true)

      const res = await signIn("credentials", {
        email,
        password,
        redirect: false, // we handle redirect ourselves
      })

      if (res?.error) {

           // ✅ Check if error is unverified email
           if (res.error === "UNVERIFIED_EMAIL") {
            setError("Please verify your email before logging in");
            return {
              ok: false,
              error: "UNVERIFIED_EMAIL",
              email, // Pass email so UI can show resend button
            };
          }

        setError(res.error)
        return { ok: false, error: res.error }
      }

      return { ok: true }
    } catch (err) {
      console.error("Login error", err)
      setError("Failed to login")
      return { ok: false, error: "Failed to login" }
    } finally {
      setLoading(false)
    }
  }


    // ✅ NEW: Resend verification email
    async function resendVerificationEmail(email) {
      try {
        setError(null);
        setLoading(true);
  
        const res = await api.post("/auth/resend-verification", { email });
  
        return { ok: true, message: res.data.message };
      } catch (err) {
        console.error("Resend verification error", err);
        const msg =
          err.response?.data?.message ||
          err.response?.data?.error ||
          "Failed to resend verification email";
        setError(msg);
        return { ok: false, error: msg };
      } finally {
        setLoading(false);
      }
    }
  

// Logout function using NextAuth
  async function logout() {
    try {
      setError(null)
      setLoading(true)
      await signOut({ redirect: false })
      // redirect('/')
      // window.location.href= '/';
      router.push('/');
      // you can manually redirect if you want:
      // window.location.href = "/"
    } catch (err) {
      console.error("Logout error", err)
      setError("Failed to logout")
    } finally {
      setLoading(false)
    }
  }

  return {
    // state
    user: session?.user || null,
    isAuthenticated: status === "authenticated",
    isLoadingSession: status === "loading",
    loading,
    error,

    // actions
    register,
    login,
    logout,
    resendVerificationEmail
  }
}
