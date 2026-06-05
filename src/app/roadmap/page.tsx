import { Navigation } from "@/components/Navigation";
import { Footer } from "@/components/Footer";
import { FadeIn } from "@/components/FadeIn";

const phases = [
  {
    number: "01",
    label: "Phase one",
    title: "Foundations",
    status: "In progress",
    items: [
      {
        heading: "Solana program",
        body: "The Anchor code is feature complete for agent wallet registration, transaction recording, and basic policy enforcement. It is deployed to devnet and has been internally reviewed. Before it sees mainnet, it goes through an external audit with a firm we will name when the engagement is signed. Settlement code is the part of any system you want to over-audit rather than under-audit, and we will hold mainnet back until the audit clears, even if it costs us a few weeks of momentum.",
      },
      {
        heading: "SDK surface",
        body: "The TypeScript SDK is the primary developer interface and ships first. The Python SDK follows within the same phase, since a large share of agent frameworks live in Python and we do not want to force teams to choose their language based on our shortcomings. Both SDKs cover x402 and MPP from day one, with a handler architecture that lets us add new protocols without breaking existing integrations.",
      },
      {
        heading: "Dashboard",
        body: "The version in beta testing today shows agent inventory, request volume, cost per agent, cache performance, and policy events. Phase one closes when the dashboard moves to public beta and any team that signs up can see their agents and spend in real time.",
      },
    ],
  },
  {
    number: "02",
    label: "Phase two",
    title: "Production readiness",
    status: "Up next",
    items: [
      {
        heading: "Policy engine",
        body: "The first version enforces budget caps, domain allowlists, rate limits, and per-call ceilings. The next version adds time-window policies, multi-signature approval flows for transactions above a configurable threshold, and policy templates that teams can apply across fleets of agents without rewriting them per agent. Policy is the layer that turns autonomous agents from a liability into something a finance team can actually approve, and we treat it accordingly.",
      },
      {
        heading: "Operator surface",
        body: "Structured webhooks for payment events, an audit log API that finance and compliance teams can wire into their own systems, role-based access control on the dashboard, and a CLI that covers every action available in the UI. Anything you can do by clicking, you should be able to do from a terminal or a script.",
      },
      {
        heading: "Observability",
        body: "We will publish a public status page covering gateway uptime, settlement latency, and per-protocol success rates. We will also expose a metrics endpoint that teams can scrape into their own monitoring stacks. Infrastructure you depend on should be transparent about how it is performing, not opaque.",
      },
    ],
  },
  {
    number: "03",
    label: "Phase three",
    title: "Ecosystem",
    status: "Planned",
    items: [
      {
        heading: "Protocol support",
        body: "We are watching ACP, AP2, and AMP closely. The architecture is built so that adding a new protocol is a matter of writing a handler, not changing the SDK contract. As any of these protocols gain real adoption, we will add them. We are not going to chase every specification that gets published, but we will be honest about what we support and what is in flight on a public protocol support page.",
      },
      {
        heading: "Chain strategy",
        body: "Solana is where the agent payment volume is today, and the economics and finality are what make sub-cent settlement possible. We are not planning multi-chain support in 2027. If the market changes, we will revisit. We would rather do one chain well than four chains adequately.",
      },
      {
        heading: "Developer floor",
        body: "Reference implementations for common agent patterns, including a paying research agent, a metered API consumer, and an agent that hires sub-agents and accounts for their work. We will also open a public bug bounty once the external audit is complete, with payouts scaled to severity.",
      },
    ],
  },
  {
    number: "04",
    label: "Phase four",
    title: "Longer horizons",
    status: "On the horizon",
    items: [
      {
        heading: "Agent reputation",
        body: "When an agent has a payment history that is verifiable on-chain, counterparties can decide whether to extend credit, offer discounts, or require pre-payment. We do not need to build a reputation system ourselves for this to work. We need to make sure the on-chain ledger is rich enough that someone else can.",
      },
      {
        heading: "Escrow and milestone payments",
        body: "Today, agent payments are mostly single-shot. As agents take on longer running tasks, the contracting pattern between them will look more like freelance work and less like API calls. The on-chain primitives need to support that.",
      },
      {
        heading: "Compliance frameworks",
        body: "We expect compliance frameworks for agent payments to land within the next two years. When they do, Maxim Protocol will need to support whatever attestation, identity, and reporting requirements emerge. We are tracking this and designing the policy engine with that future in mind, even though the current requirements are minimal.",
      },
    ],
  },
];

const phaseOpacity = ["opacity-100", "opacity-80", "opacity-55", "opacity-35"];

const statusConfig: Record<string, { badge: string; label: string; dot: boolean }> = {
  "In progress":    { badge: "bg-white text-black",              label: "In progress",    dot: true  },
  "Up next":        { badge: "bg-white/[0.08] text-white/60",    label: "Up next",        dot: false },
  "Planned":        { badge: "bg-white/[0.05] text-white/35",    label: "Planned",        dot: false },
  "On the horizon": { badge: "bg-white/[0.03] text-white/25",    label: "On the horizon", dot: false },
};

export default function RoadmapPage() {
  return (
    <>
      <Navigation />
      <main className="min-h-screen bg-[#09090b]">

        {/* ── Header ──────────────────────────────────────────────────────── */}
        <section className="mx-auto max-w-5xl px-4 pt-20 pb-16 sm:px-6 lg:px-8">
          <FadeIn delay={0}>
            <h1 className="font-heading max-w-2xl text-[42px] font-normal leading-[1.0] tracking-[-0.02em] text-white sm:text-[60px] lg:text-[72px]">
              Where we go<br />from here.
            </h1>
          </FadeIn>

          <FadeIn delay={80}>
            <p className="mt-8 max-w-2xl text-[16px] leading-[1.8] text-white/45 sm:text-[17px]">
              Maxim Protocol is a month old. The Anchor program is written, the
              SDKs are taking shape, and the dashboard is in beta testing. What
              follows is where we go from here, on the timeline we think we can
              hold ourselves to. We are publishing this because the people
              building on top of us deserve to know what we are working on, in
              what order, and why.
            </p>
          </FadeIn>

          {/* Phase overview strip */}
          <FadeIn delay={140}>
            <div className="mt-12 grid grid-cols-2 gap-2 sm:grid-cols-4">
              {phases.map((phase, i) => {
                const cfg = statusConfig[phase.status];
                return (
                  <div
                    key={phase.number}
                    className={`rounded-xl border px-4 py-3.5 transition-colors ${
                      phase.status === "In progress"
                        ? "border-white/[0.12] bg-white/[0.03]"
                        : "border-white/[0.06]"
                    } ${phaseOpacity[i]}`}
                  >
                    <p className="font-mono text-[10px] uppercase tracking-[0.15em] text-white/25">
                      {phase.label}
                    </p>
                    <p className="mt-1.5 text-sm font-medium text-white/70">{phase.title}</p>
                    <div className={`mt-2.5 inline-flex items-center gap-1.5 text-[11px] font-medium ${cfg.badge} rounded-full px-2.5 py-0.5`}>
                      {cfg.dot && (
                        <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-black" />
                      )}
                      {cfg.label}
                    </div>
                  </div>
                );
              })}
            </div>
          </FadeIn>
        </section>

        {/* ── Timeline ────────────────────────────────────────────────────── */}
        <section className="mx-auto max-w-5xl px-4 pb-24 sm:px-6 lg:px-8">
          <div className="relative">
            {/* Vertical connector line */}
            <div className="absolute left-[23px] top-2 bottom-8 w-px bg-gradient-to-b from-white/20 via-white/[0.07] to-transparent" />

            {phases.map((phase, phaseIndex) => {
              const isActive = phase.status === "In progress";
              const cfg = statusConfig[phase.status];
              return (
                <FadeIn key={phase.number} delay={phaseIndex * 70}>
                  <div className={`relative pb-16 pl-16 last:pb-0 ${phaseOpacity[phaseIndex]}`}>

                    {/* Timeline node */}
                    <div
                      className={`absolute left-0 top-0 flex h-12 w-12 items-center justify-center rounded-full border ${
                        isActive
                          ? "border-white/25 bg-white/[0.07]"
                          : "border-white/[0.08] bg-[#09090b]"
                      }`}
                    >
                      {isActive && (
                        <span className="absolute h-full w-full animate-ping rounded-full bg-white/[0.04]" />
                      )}
                      <span className={`font-mono text-[11px] ${isActive ? "text-white/50" : "text-white/20"}`}>
                        {phase.number}
                      </span>
                    </div>

                    {/* Phase heading */}
                    <div className="mb-6 flex flex-wrap items-center gap-3">
                      <h2
                        className={`font-heading text-[26px] font-normal tracking-[-0.01em] sm:text-[30px] ${
                          isActive ? "text-white" : "text-white/55"
                        }`}
                      >
                        {phase.title}
                      </h2>
                      <span
                        className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[11px] font-medium ${cfg.badge}`}
                      >
                        {cfg.dot && (
                          <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-black" />
                        )}
                        {cfg.label}
                      </span>
                    </div>

                    {/* Item cards */}
                    <div className="space-y-3">
                      {phase.items.map((item) => (
                        <div
                          key={item.heading}
                          className={`rounded-xl border px-5 py-4 ${
                            isActive
                              ? "border-white/[0.09] bg-white/[0.02]"
                              : "border-white/[0.05]"
                          }`}
                        >
                          <h3
                            className={`mb-2 text-sm font-medium ${
                              isActive ? "text-white/85" : "text-white/45"
                            }`}
                          >
                            {item.heading}
                          </h3>
                          <p
                            className={`text-sm leading-[1.8] ${
                              isActive ? "text-white/40" : "text-white/25"
                            }`}
                          >
                            {item.body}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                </FadeIn>
              );
            })}
          </div>
        </section>

        {/* ── Closing ─────────────────────────────────────────────────────── */}
        <section className="mx-auto max-w-5xl px-4 pb-24 sm:px-6 lg:px-8">
          <FadeIn delay={0}>
            <div className="border-t border-white/[0.06] pt-14">
              <p className="max-w-xl text-[16px] leading-[1.8] text-white/30 sm:text-[17px]">
                If you are building agents that need to pay for things, the work
                above is the work we are doing for you.
              </p>
            </div>
          </FadeIn>
        </section>

      </main>
      <Footer />
    </>
  );
}
