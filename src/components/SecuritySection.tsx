import Image from "next/image";

const securityCards = [
  {
    image: "/images/security-custody.png",
    title: "On-chain ledger",
    description:
      "Every transaction carries a Solana transaction signature. There is no separate database of record. The on-chain state is the authoritative source, verifiable by any party at any time.",
  },
  {
    image: "/images/security-defense.png",
    title: "Non-custodial wallets",
    description:
      "Agent wallets are Program Derived Addresses. Maxim Protocol holds no signing authority over agent funds. Moving assets requires a valid instruction from the agent's registered keypair.",
  },
  {
    image: "/images/security-battle.png",
    title: "Pre-payment policy enforcement",
    description:
      "Spend policies are evaluated before any transaction is submitted to the network. Requests that exceed a budget ceiling or violate an allowlist are rejected at the gateway, not after funds are committed.",
  },
  {
    image: "/images/security-friction.png",
    title: "End-to-end payment chains",
    description:
      "Multi-agent payment hierarchies are recorded on-chain with parent transaction references at each link. Every node in an agent chain is independently traceable and auditable without third-party reporting tools.",
  },
];

const auditsRow1 = [
  { name: "< $0.001", date: "Per transaction", icon: "/images/audits/cure53.png" },
  { name: "< 1000ms", date: "Finality", icon: "/images/audits/zellic.png" },
  {
    name: "143M",
    date: "Daily transactions (May 2026)",
    icon: "/images/audits/swordbytes.png",
  },
  {
    name: "65,000 TPS",
    date: "Theoretical throughput",
    icon: "/images/audits/doyensec.png",
  },
];

const auditsRow2 = [
  {
    name: "USDC",
    date: "Primary settlement token",
    icon: "/images/audits/soc2.png",
  },
  {
    name: "$2T",
    date: "Stablecoin throughput per quarter",
    icon: "/images/audits/borgsecurity.png",
  },
  {
    name: "x402 + MPP",
    date: "Protocol support",
    icon: "/images/audits/hackerone.png",
  },
];

function CheckIcon() {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 20 20"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="mx-auto mt-3"
    >
      <circle cx="10" cy="10" r="10" fill="#10b981" />
      <path
        d="M6 10.5L8.5 13L14 7.5"
        stroke="white"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function AuditBadge({
  audit,
}: {
  audit: { name: string; date: string; icon: string };
}) {
  return (
    <div className="py-4 text-center">
      <div className="relative mx-auto mb-2 h-10 w-10">
        <Image src={audit.icon} alt={audit.name} fill className="object-contain" />
      </div>
      <p className="text-lg font-bold text-white">{audit.name}</p>
      <p className="text-sm text-white/50">{audit.date}</p>
      <CheckIcon />
    </div>
  );
}

export function SecuritySection() {
  return (
    <section className="bg-[#111117] bg-x-pattern-dark relative py-24">
      <div className="mx-auto max-w-[1200px] px-6">
        {/* Heading */}
        <div className="text-center">
          <h2 className="font-heading text-[56px] leading-[1.1] font-normal tracking-[-0.02em] text-white">
            Transparent by design.
          </h2>
          <p className="mx-auto mt-6 max-w-2xl text-xl text-white/70">
            Maxim Protocol maintains no private ledger. Every transaction is
            recorded on Solana with a public signature, accessible to anyone.
            Finance teams can audit every agent payment directly on-chain,
            with no intermediary required.
          </p>
          <a
            href="#"
            className="mx-auto mt-6 inline-block rounded-full border border-white/30 px-6 py-2.5 text-sm text-white transition-colors hover:bg-white/10"
          >
            Learn more &rarr;
          </a>
        </div>

        {/* Security Cards */}
        <div className="mt-16 grid grid-cols-1 gap-6 md:grid-cols-2">
          {securityCards.map((card) => (
            <div
              key={card.title}
              className="overflow-hidden rounded-xl border border-white/10 bg-[#1a1a22]"
            >
              <div className="relative h-52">
                <Image
                  src={card.image}
                  alt={card.title}
                  fill
                  className="object-cover"
                />
              </div>
              <div className="p-6">
                <h3 className="mb-2 text-xl font-normal text-white">
                  {card.title}
                </h3>
                {card.description && (
                  <p className="text-sm leading-relaxed text-white/60">
                    {card.description}
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Completed Audits */}
        <div className="mt-24">
          <p className="text-center text-sm uppercase tracking-wider text-white/60">
            Solana network
          </p>

          {/* Row 1 */}
          <div className="mt-10 grid grid-cols-2 gap-8 md:grid-cols-4">
            {auditsRow1.map((audit) => (
              <AuditBadge key={audit.name} audit={audit} />
            ))}
          </div>

          {/* Row 2 */}
          <div className="mx-auto grid max-w-3xl grid-cols-2 gap-8 md:grid-cols-3">
            {auditsRow2.map((audit) => (
              <AuditBadge key={audit.name} audit={audit} />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
