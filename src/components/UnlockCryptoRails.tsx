import { FadeIn } from "@/components/FadeIn";
import Link from "next/link";

const features = [
  {
    title: "Protocol agnostic",
    description:
      "Supports x402 and MPP natively, with automatic protocol detection on every request. No conditional logic required in application code.",
  },
  {
    title: "On-chain by default",
    description:
      "Every transaction settles on Solana with a public signature. There is no secondary ledger or off-chain reconciliation layer.",
  },
  {
    title: "Programmable spend controls",
    description:
      "Per-agent budget caps, domain allowlists, rate limits, and call-level ceilings are enforced at the gateway before any funds move.",
  },
];

export function UnlockCryptoRails() {
  return (
    <section className="relative bg-[#111117] py-16 px-4 bg-x-pattern-dark sm:px-6 lg:py-24">
      <div className="mx-auto max-w-[1200px]">
        <FadeIn delay={0}>
          <h2 className="font-heading text-center text-white text-[36px] font-normal tracking-[-0.02em] leading-tight sm:text-[48px] lg:text-[56px]">
            One API. Any protocol.
          </h2>
        </FadeIn>

        <FadeIn delay={100}>
          <p className="mx-auto mt-6 max-w-3xl text-center text-[16px] leading-relaxed text-white/70 sm:text-[20px]">
            The agent payment landscape is fragmented across incompatible
            protocols, with no shared wallet primitive, no spend controls, and
            no verifiable on-chain record. Maxim Protocol resolves this at the
            infrastructure level.
          </p>
        </FadeIn>

        <FadeIn delay={180}>
          <Link
            href="https://docs.maximprotocol.com/quickstart/overview"
            className="mx-auto mt-8 block w-fit rounded-full border border-white/30 px-6 py-2.5 text-sm text-white hover:bg-white/10 transition-colors"
          >
            Integrate in under an hour
          </Link>
        </FadeIn>

        {/* Feature Cards */}
        <div className="mt-16 grid grid-cols-1 gap-6 lg:grid-cols-3">
          {features.map((feature, i) => (
            <FadeIn key={feature.title} delay={i * 80}>
              <div className="overflow-hidden rounded-xl border border-white/10 bg-[#1a1a22] h-full">
                <div className="p-6">
                  <h3 className="mb-6 text-3xl font-normal text-white">
                    {feature.title}
                  </h3>
                  <p className="text-base text-white/60">
                    {feature.description}
                  </p>
                </div>
              </div>
            </FadeIn>
          ))}
        </div>
      </div>
    </section>
  );
}
