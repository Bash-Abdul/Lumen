'use client';

import { useState, useEffect } from "react";
import Link from "next/link";
import Button from "../../components/common/Button";
// import { useAuth } from "../../lib/hooks/useAuthMock";
import { login as mockLogin } from "../../lib/api/auth";
import useAuth from "@/hooks/useAuth";
import { useRouter } from "next/navigation"

export default function LoginPage() {
  // const { setUser } = useAuth();
  // const [email, setEmail] = useState("you@example.com");
  // const [password, setPassword] = useState("password");
  // const [status, setStatus] = useState("");

  const router = useRouter()
  const { login, user, loading, error, isAuthenticated } = useAuth();
    const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loader, setLoader] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();

    const res = await login({email, password});
    if (res.ok) {
      router.push("/")
      alert('Login successful');
    }


    // setStatus("Signing in...");
    // const { user } = await mockLogin({ email, password });
    // setUser(user);
    // setStatus("Signed in (mock). A real call would POST /api/auth/login.");
  };

    useEffect(() => {
    if (user) {
      router.replace('/');
    }
  }, [user,router]);
  // if (loader) return
  return (
    <div className="flex items-center justify-center h-full">
      <div className="max-w-lg mx-auto space-y-6 ">
      <div className="text-center space-y-2">
        <p className="text-xs uppercase tracking-[0.3em] text-emerald-300">
          Access
        </p>
        <h1 className="text-3xl font-semibold"> {isAuthenticated ? 'You are logged in' : 'Log in'} </h1>
        <p className="text-sm text-zinc-400">
          Mock authentication — wires to real backend later.
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
        <input
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          type="password"
          placeholder="Password"
          className="w-full rounded-xl bg-zinc-900/80 border border-zinc-800 px-4 py-3 text-sm text-zinc-100 focus:outline-none focus:border-emerald-400"
          required
        />

         {error && (
          <p className="text-sm text-red-400">{String(error)}</p>
        )}

        <Button type="submit" className="w-full">
          {
            loading ? 'Signing in....' : 'Sign in'
           }
        </Button>
        {/* {status && <p className="text-xs text-zinc-400">{status}</p>} */}
        <p className="text-sm text-zinc-400">
          No account?{" "}
          <Link href="/signup" className="text-emerald-300 hover:text-emerald-200">
           Sign up
          </Link>
        </p>
      </form>
    </div>
    </div>
  );
}
