"use client";

import Link from "next/link";
import { useState } from "react";
import { Navigation } from "@/components/Navigation";
import { createClient } from "@/lib/supabase/client";

export default function SignupPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    const supabase = createClient();
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { full_name: name },
      },
    });

    if (error) {
      setError(error.message);
      setIsLoading(false);
      return;
    }

    setSuccess(true);
    setIsLoading(false);
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

          {success ? (
            <>
              <div className="mb-8 text-center">
                <h1
                  className="font-heading font-normal text-white"
                  style={{
                    fontSize: "32px",
                    letterSpacing: "-0.02em",
                    lineHeight: 1.2,
                  }}
                >
                  Check your email
                </h1>
                <p className="mt-2 text-sm text-white/50">
                  We sent a confirmation link to{" "}
                  <span className="font-medium text-white">{email}</span>
                </p>
              </div>
              <div className="rounded-2xl border border-white/[0.08] bg-[#18181b] p-8 shadow-2xl text-center">
                <p className="text-sm text-white/60">
                  Click the link in the email to activate your account, then{" "}
                  <Link
                    href="/signin"
                    className="font-medium text-white transition hover:text-white/70"
                  >
                    sign in
                  </Link>
                  .
                </p>
              </div>
            </>
          ) : (
            <>
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
                  Get started
                </h1>
                <p className="mt-2 text-sm text-white/50">
                  Create your Maxim Protocol account
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
                      htmlFor="name"
                      className="mb-1.5 block text-sm font-medium text-white/70"
                    >
                      Full name
                    </label>
                    <input
                      id="name"
                      type="text"
                      autoComplete="name"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="John Doe"
                      className="w-full rounded-xl border border-white/[0.08] bg-[#09090b] px-4 py-3 text-sm text-white placeholder-white/25 outline-none transition focus:border-white/30 focus:ring-2 focus:ring-white/[0.06]"
                    />
                  </div>

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
                      placeholder="john@email.com"
                      className="w-full rounded-xl border border-white/[0.08] bg-[#09090b] px-4 py-3 text-sm text-white placeholder-white/25 outline-none transition focus:border-white/30 focus:ring-2 focus:ring-white/[0.06]"
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="password"
                      className="mb-1.5 block text-sm font-medium text-white/70"
                    >
                      Password
                    </label>
                    <input
                      id="password"
                      type="password"
                      autoComplete="new-password"
                      required
                      minLength={8}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Min. 8 characters"
                      className="w-full rounded-xl border border-white/[0.08] bg-[#09090b] px-4 py-3 text-sm text-white placeholder-white/25 outline-none transition focus:border-white/30 focus:ring-2 focus:ring-white/[0.06]"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={isLoading}
                    className="cursor-pointer mt-2 w-full rounded-full bg-white px-6 py-3 text-sm font-medium text-black transition hover:bg-white/90 disabled:opacity-50"
                  >
                    {isLoading ? "Creating account…" : "Create account"}
                  </button>
                </form>
              </div>
            </>
          )}

          {/* Log in link */}
          <p className="mt-6 text-center text-sm text-white/40">
            Already have an account?{" "}
            <Link
              href="/signin"
              className="font-medium text-white/70 transition hover:text-white"
            >
              Sign in
            </Link>
          </p>
        </div>
      </main>
    </div>
  );
}
