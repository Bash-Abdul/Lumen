'use client';

import { useState, useEffect } from "react";
import Link from "next/link";
import Button from "../../../shared/ui/Button";
import useAuth from "@/features/auth/hooks/useAuth";
import { useRouter } from "next/navigation";
import { Eye, EyeOff } from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const { login, user, loading, error, isAuthenticated, resendVerificationEmail } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [passwordReveal, setPasswordReveal] = useState(false);
  const [showResend, setShowResend] = useState(false);
  const [resendSuccess, setResendSuccess] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const [isRateLimited, setIsRateLimited] = useState(false);
  const [isAccountLocked, setIsAccountLocked] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setShowResend(false);
    setResendSuccess(false);
    setIsRateLimited(false);
    setIsAccountLocked(false);

    const res = await login({ email, password });

    // ✅ Check if login failed due to unverified email
    if (res?.error === "UNVERIFIED_EMAIL") {
      setShowResend(true);
      return;
    }

    // ✅ Check if rate limited (too many attempts from IP)
    if (res?.error && res.error.includes("Too many login attempts")) {
      setIsRateLimited(true);
      return;
    }

    // ✅ Check if account is locked
    if (res?.error && res.error.includes("Account locked")) {
      setIsAccountLocked(true);
      return;
    }


    if (!res.ok) return;
  };

  // ✅ Handle resend verification email
  async function handleResend() {
    setResendLoading(true);
    const result = await resendVerificationEmail(email);
    setResendLoading(false);

    if (result?.ok) {
      setResendSuccess(true);
    }
  }

  useEffect(() => {
    if (!isAuthenticated || !user) return;

    if (user.onboardingDone === false) {
      router.replace("/onboarding");
    } else {
      router.replace("/");
    }
  }, [isAuthenticated, user, router]);

  // ✅ Determine if submit button should be disabled
  const isSubmitDisabled = loading || isRateLimited || isAccountLocked;

  return (
    <div className="flex items-center justify-center h-full">
      <div className="max-w-lg mx-auto space-y-6">
        <div className="text-center space-y-2">
          <p className="text-xs uppercase tracking-[0.3em] text-emerald-300">
            Access
          </p>
          <h1 className="text-3xl font-semibold">
            {isAuthenticated ? 'You are logged in' : 'Log in'}
          </h1>
          <p className="text-sm text-zinc-400">
            Enter your credentials to access your account
          </p>
        </div>

        <form onSubmit={handleLogin} className="card p-6 space-y-4">
          <input
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            type="email"
            placeholder="Email"
            className="w-full rounded-xl bg-zinc-900/80 border border-zinc-800 px-4 py-3 text-sm text-zinc-100 focus:outline-none focus:border-emerald-400"
            required
          />

          <div className="relative w-full">
            <input
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              type={passwordReveal ? 'text' : 'password'}
              placeholder="Password"
              className="w-full rounded-xl bg-zinc-900/80 border border-zinc-800 px-4 py-3 text-sm text-zinc-100 focus:outline-none focus:border-emerald-400"
              required
            />
            <button
              type="button"
              onClick={() => setPasswordReveal(prev => !prev)}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-300"
            >
              {passwordReveal ? <EyeOff size={20} /> : <Eye size={20} />}
            </button>
          </div>

          {/* ✅ Rate limit error */}
          {isRateLimited && (
            <div className="rounded-xl bg-orange-500/10 border border-orange-500/20 px-4 py-3">
              <p className="text-sm font-medium text-orange-400 mb-1">Too Many Attempts</p>
              <p className="text-xs text-orange-300/80">{String(error)}</p>
            </div>
          )}

          {/* ✅ Account locked error */}
          {isAccountLocked && (
            <div className="rounded-xl bg-red-500/10 border border-red-500/20 px-4 py-3">
              <p className="text-sm font-medium text-red-400 mb-1">Account Locked</p>
              <p className="text-xs text-red-300/80">{String(error)}</p>
            </div>
          )}

          {/* ✅ Generic error message (not rate limit or lockout) */}
          {error && !showResend && !isRateLimited && !isAccountLocked && (
            <div className="rounded-xl bg-red-500/10 border border-red-500/20 px-4 py-3">
              <p className="text-sm text-red-400">{String(error)}</p>
            </div>
          )}

          {/* ✅ Show resend verification section if email not verified */}
          {showResend && (
            <div className="rounded-xl bg-yellow-500/10 border border-yellow-500/20 p-4 space-y-3">
              <div className="space-y-1">
                <p className="text-sm font-medium text-yellow-400">
                  Email Not Verified
                </p>
                <p className="text-xs text-yellow-300/80">
                  Please check your email (or terminal console) for the verification link.
                  Didn't receive it? Click below to resend.
                </p>
              </div>
              <button
                type="button"
                onClick={handleResend}
                disabled={resendLoading || resendSuccess}
                className="w-full bg-yellow-600 hover:bg-yellow-700 disabled:opacity-50 disabled:cursor-not-allowed text-white py-2.5 px-4 rounded-xl text-sm font-medium transition"
              >
                {resendLoading
                  ? "Sending..."
                  : resendSuccess
                    ? "✓ Verification Email Sent!"
                    : "Resend Verification Email"}
              </button>
            </div>
          )}

          {/* ✅ Resend success message */}
          {resendSuccess && (
            <div className="rounded-xl bg-emerald-500/10 border border-emerald-500/20 px-4 py-3">
              <p className="text-sm text-emerald-400">
                ✓ Verification email sent! Check your email (or terminal console) for the link.
              </p>
            </div>
          )}

          <Button
            type="submit"
            className="w-full cursor-pointer"
            disabled={isSubmitDisabled}
          >
            {/* {loading ? 'Signing in...' : 'Sign in'} */}
            {loading ? 'Signing in...' : isRateLimited ? 'Too Many Attempts' : isAccountLocked ? 'Account Locked' : 'Sign in'}
          </Button>

          <p className="text-sm text-zinc-400 text-center">
            No account?{" "}
            <Link
              href="/signup"
              className="cursor-pointer text-emerald-300 hover:text-emerald-200 font-medium"
            >
              Sign up
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
}