"use client";

import Link from "next/link";
import { useState } from "react";
import { cn } from "@/lib/utils";

const navItems = [
  { label: "Features", href: "/#features" },
  { label: "Roadmap", href: "/roadmap" },
  { label: "Smart Contracts", href: "https://solscan.io/account/337JEF6PSMGSPwBSseMHFa95YxLACnJeehA5brVAgzKh?cluster=devnet" },
  { label: "Docs", href: "https://docs.maximprotocol.com" },
  { label: "GitHub", href: "https://github.com/maximprotocol" },
  { label: "X", href: "https://x.com/maximprotocol" },
] as const;

export function Navigation() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 w-full bg-[#09090b] border-b border-white/[0.08]">
      <nav className="mx-auto flex h-[72px] items-center justify-between px-4 sm:px-6 lg:px-10">
        <div className="flex items-center gap-4">
          <Link href="/" className="flex items-center">
            <img
              src="/images/logo-transparent.png"
              alt="Maxim Protocol"
              className="h-8 w-auto sm:h-10"
            />
          </Link>
        </div>

        <ul className="hidden items-center gap-1 lg:flex">
          {navItems.map(({ label, href }) => (
            <li key={label}>
              <Link
                href={href}
                className="flex items-center gap-1 rounded-md px-3 py-2 text-sm font-medium text-white/70 transition hover:text-white"
                aria-label={label}
              >
                {label === "X" ? (
                  <svg
                    viewBox="0 0 24 24"
                    className="h-4 w-4 fill-current"
                    aria-hidden="true"
                  >
                    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                  </svg>
                ) : (
                  label
                )}
              </Link>
            </li>
          ))}
        </ul>

        <div className="flex items-center gap-2 sm:gap-4">
          <Link
            href="/signin"
            className="hidden text-sm font-medium text-white/60 transition hover:text-white sm:inline-flex"
          >
            Sign in
          </Link>
          <Link
            href="/signup"
            className="rounded-full bg-white px-4 py-1.5 text-sm font-medium text-black transition hover:bg-white/90"
          >
            Sign up
          </Link>

          {/* Mobile hamburger */}
          <button
            type="button"
            className="inline-flex items-center justify-center rounded-md p-2 text-white/70 lg:hidden"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle navigation menu"
            aria-expanded={mobileMenuOpen}
          >
            <svg
              className="h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
            >
              {mobileMenuOpen ? (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M6 18L18 6M6 6l12 12"
                />
              ) : (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M3.75 6.75h16.5M3.75 12h16.5M3.75 17.25h16.5"
                />
              )}
            </svg>
          </button>
        </div>
      </nav>

      {/* Mobile menu */}
      <div
        className={cn(
          "overflow-hidden border-t border-white/[0.08] bg-[#09090b] transition-all duration-200 lg:hidden",
          mobileMenuOpen ? "max-h-96" : "max-h-0 border-t-0"
        )}
      >
        <ul className="flex flex-col gap-1 px-6 py-4">
          {navItems.map(({ label, href }) => (
            <li key={label}>
              <Link
                href={href}
                className="flex items-center gap-2 rounded-md px-3 py-2.5 text-sm font-medium text-white/70 transition hover:bg-white/5 hover:text-white"
              >
                {label === "X" ? (
                  <>
                    <svg
                      viewBox="0 0 24 24"
                      className="h-4 w-4 fill-current"
                      aria-hidden="true"
                    >
                      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                    </svg>
                    X
                  </>
                ) : (
                  label
                )}
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </header>
  );
}
