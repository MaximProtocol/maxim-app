import Link from "next/link";

export default function ConfirmedPage() {
  return (
    <div className="min-h-screen bg-[#09090b]">
      <main className="relative flex min-h-screen items-center justify-center px-6 py-16 bg-x-pattern-dark">
        {/* Gradient fade over dot pattern */}
        <div
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              "radial-gradient(ellipse 80% 60% at 50% 40%, rgba(9,9,11,0.92) 0%, rgba(9,9,11,0.5) 70%, transparent 100%)",
          }}
        />

        <div className="relative w-full max-w-[400px] text-center animate-fade-up">
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

          {/* Card */}
          <div className="rounded-2xl border border-white/[0.08] bg-[#18181b] p-10 shadow-2xl">
            {/* Checkmark icon */}
            <div className="mb-6 flex justify-center">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-white">
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 20 20"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M4 10.5L8 14.5L16 6.5"
                    stroke="black"
                    strokeWidth="1.75"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </div>
            </div>

            <h1
              className="font-normal text-white"
              style={{
                fontSize: "28px",
                letterSpacing: "-0.02em",
                lineHeight: 1.2,
              }}
            >
              Email confirmed
            </h1>
            <p className="mt-3 text-sm text-white/50 leading-relaxed">
              Your Maxim Protocol account is ready. You can now sign in and
              start managing your AI agents.
            </p>

            <Link
              href="/signin"
              className="mt-8 inline-flex w-full items-center justify-center rounded-full bg-white px-6 py-3 text-sm font-medium text-black transition hover:bg-white/90"
            >
              Continue to sign in
            </Link>
          </div>

          <p className="mt-6 text-xs text-white/40">
            Maxim Protocol. Cohesive AI payment infrastructure
          </p>
        </div>
      </main>
    </div>
  );
}
