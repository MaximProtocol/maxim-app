"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Navigation } from "@/components/Navigation";
import { createClient } from "@/lib/supabase/client";

export default function signinPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    const supabase = createClient();
    const { error } = await supabase.auth.signInWithPassword({ email, password });

    if (error) {
      setError(error.message);
      setIsLoading(false);
      return;
    }

    router.push("/dashboard");
  };

  return (
    <div className="min-h-screen bg-[#09090b]">
      <Navigation />

      <main className="relative flex min-h-[calc(100vh-72px)] items-center justify-center px-6 py-16 bg-x-pattern-dark">
        {/* Gradient fade over dot pattern */}
        <div
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              "radial-gradient(ellipse 80% 60% at 50% 40%, rgba(9,9,11,0.92) 0%, rgba(9,9,11,0.5) 70%, transparent 100%)",
          }}
        />

        <div className="relative w-full max-w-[400px] animate-fade-up">
          {/* Logo */}
          <div className="mb-8 flex justify-center">
            <Link href="/">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/images/logo-transparent.png"
                alt="Maxim Protocol"
                className="h-8 w-auto"
              />
            </Link>
          </div>

          {/* Heading */}
          <div className="mb-8 text-center">
            <h1
              className="font-heading font-normal text-white"
              style={{
                fontSize: "32px",
                letterSpacing: "-0.02em",
                lineHeight: 1.2,
              }}
            >
              Welcome back
            </h1>
            <p className="mt-2 text-sm text-white/50">
              Sign in to your Maxim Protocol account
            </p>
          </div>

          {/* Form card */}
          <div className="rounded-2xl border border-white/[0.08] bg-[#18181b] p-8 shadow-2xl">
            <form onSubmit={handleSubmit} className="space-y-5">
              {error && (
                <div className="rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-400">
                  {error}
                </div>
              )}

              <div>
                <label
                  htmlFor="email"
                  className="mb-1.5 block text-sm font-medium text-white/70"
                >
                  Email
                </label>
                <input
                  id="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  className="w-full rounded-xl border border-white/[0.08] bg-[#09090b] px-4 py-3 text-sm text-white placeholder-white/25 outline-none transition focus:border-white/30 focus:ring-2 focus:ring-white/[0.06]"
                />
              </div>

              <div>
                <div className="mb-1.5 flex items-center justify-between">
                  <label
                    htmlFor="password"
                    className="text-sm font-medium text-white/70"
                  >
                    Password
                  </label>
                  <Link
                    href="/forgot-password"
                    className="text-xs text-white/40 transition hover:text-white"
                  >
                    Forgot password?
                  </Link>
                </div>
                <input
                  id="password"
                  type="password"
                  autoComplete="current-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full rounded-xl border border-white/[0.08] bg-[#09090b] px-4 py-3 text-sm text-white placeholder-white/25 outline-none transition focus:border-white/30 focus:ring-2 focus:ring-white/[0.06]"
                />
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="cursor-pointer mt-2 w-full rounded-full bg-white px-6 py-3 text-sm font-medium text-black transition hover:bg-white/90 disabled:opacity-50"
              >
                {isLoading ? "Signing in…" : "Sign in"}
              </button>
            </form>
          </div>

          {/* Sign up link */}
          <p className="mt-6 text-center text-sm text-white/40">
            Don&apos;t have an account?{" "}
            <Link
              href="/signup"
              className="font-medium text-white/70 transition hover:text-white"
            >
              Sign up
            </Link>
          </p>
        </div>
      </main>
    </div>
  );
}
