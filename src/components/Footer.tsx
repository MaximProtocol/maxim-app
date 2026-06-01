import Link from "next/link";

function XIcon() {
  return (
    <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
      <path d="M11.47 9.22L17.18 3h-1.35l-4.96 5.4L6.84 3H2.5l5.99 8.17L2.5 18h1.35l5.24-5.7L13.16 18h4.34l-6.03-8.78zm-1.85 2.02l-.61-.82L4.4 4.01h2.08l3.9 5.22.61.82 5.07 6.79h-2.08l-4.36-5.82z" />
    </svg>
  );
}

function GitHubIcon() {
  return (
    <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M10 1.667A8.333 8.333 0 001.667 10c0 3.683 2.389 6.806 5.703 7.911.417.076.569-.181.569-.402 0-.198-.007-.723-.011-1.42-2.32.504-2.81-1.118-2.81-1.118-.38-.963-.927-1.22-.927-1.22-.757-.518.058-.507.058-.507.838.059 1.279.86 1.279.86.744 1.275 1.953.907 2.428.693.076-.54.291-.907.53-1.115-1.853-.21-3.802-.926-3.802-4.123 0-.911.325-1.656.86-2.24-.087-.21-.373-1.06.081-2.21 0 0 .7-.224 2.293.856a8.002 8.002 0 014.17 0c1.59-1.08 2.29-.856 2.29-.856.455 1.15.17 2 .083 2.21.537.584.858 1.329.858 2.24 0 3.206-1.953 3.91-3.812 4.115.3.258.568.768.568 1.548 0 1.118-.01 2.02-.01 2.294 0 .223.15.482.574.4A8.337 8.337 0 0018.333 10 8.333 8.333 0 0010 1.667z"
      />
    </svg>
  );
}

const productLinks = [
  { label: "Features", href: "/#features" },
  { label: "Roadmap", href: "/roadmap" },
  { label: "Dashboard", href: "/dashboard" },
  { label: "Sign up", href: "/signup" },
  { label: "Smart Contracts", href: "https://solscan.io/account/337JEF6PSMGSPwBSseMHFa95YxLACnJeehA5brVAgzKh?cluster=devnet" },
];

const solutionLinks = [
  { label: "Quickstart", href: "https://docs.maximprotocol.com/getting-started/quickstart" },
  { label: "Your first payment", href: "https://docs.maximprotocol.com/getting-started/your-first-payment" },
  { label: "MPP", href: "https://docs.maximprotocol.com/protocols/mpp" },
  { label: "x402 protocol", href: "https://docs.maximprotocol.com/protocols/x402" },
];

const resourceLinks = [
  { label: "Installation", href: "https://docs.maximprotocol.com/getting-started/installation" },
  { label: "Observability", href: "https://docs.maximprotocol.com/features/observability" },
  { label: "Architecture", href: "https://docs.maximprotocol.com/platform/architecture" },
  { label: "Security", href: "https://docs.maximprotocol.com/platform/security" },
];

export function Footer() {
  return (
    <footer className="border-t border-white/[0.08] bg-[#09090b]">
      <div className="mx-auto max-w-7xl px-6 py-16">
        <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
          {/* Product */}
          <div>
            <h4 className="mb-4 text-base font-semibold text-white">Product</h4>
            <ul>
              {productLinks.map((link) => (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    className="block py-1 text-sm text-white/50 transition-colors hover:text-white"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Solutions */}
          <div>
            <h4 className="mb-4 text-base font-semibold text-white">Developers</h4>
            <ul>
              {solutionLinks.map(({ label, href }) => (
                <li key={label}>
                  <Link
                    href={href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block py-1 text-sm text-white/50 transition-colors hover:text-white"
                  >
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Resources */}
          <div>
            <h4 className="mb-4 text-base font-semibold text-white">Resources</h4>
            <ul>
              {resourceLinks.map(({ label, href }) => (
                <li key={label}>
                  <Link
                    href={href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block py-1 text-sm text-white/50 transition-colors hover:text-white"
                  >
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Right side — Logo + tagline + socials */}
          <div className="col-span-2 mt-8 md:col-span-1 md:mt-0 md:text-right">
            <div className="flex md:justify-end">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/images/logo-transparent.png"
                alt="Maxim Protocol"
                className="h-8 w-auto"
              />
            </div>
            <p className="mt-4 text-sm font-semibold text-white/70">
              The payment interface for autonomous agents.
            </p>
            <div className="mt-4 flex gap-3 md:justify-end">
              <Link href="https://x.com/maximprotocol" className="text-white/50 transition-colors hover:text-white">
                <XIcon />
              </Link>
              <Link href="https://github.com/MaximProtocol" className="text-white/50 transition-colors hover:text-white">
                <GitHubIcon />
              </Link>
            </div>
            <p className="mt-6 text-xs text-white/30">&copy;2026 Maxim Protocol</p>
          </div>
        </div>
      </div>
    </footer>
  );
}
