import Image from "next/image";
import { cn } from "@/lib/utils";
import { FadeIn } from "@/components/FadeIn";
import { CodeWindow } from "@/components/CodeWindow";

interface FeatureItem {
  label: string;
}

interface FeatureBlockProps {
  heading: string;
  description: string;
  items: FeatureItem[];
  textSide?: "left" | "right";
  visual?: React.ReactNode;
}

function FeatureBlock({ heading, description, items, textSide = "left", visual }: FeatureBlockProps) {
  const textContent = (
    <div className="w-full lg:w-1/2 px-4 lg:px-8">
      <FadeIn delay={0}>
        <h2 className="font-heading text-[40px] md:text-[56px] font-normal text-white tracking-[-0.02em] leading-[1.1] mb-6">
          {heading}
        </h2>
      </FadeIn>
      <FadeIn delay={100}>
        <p className="text-white/70 text-lg leading-[1.6] max-w-lg">
          {description}
        </p>
      </FadeIn>
      <FadeIn delay={180}>
        <ul className="mt-8 space-y-4 list-disc list-inside">
          {items.map((item) => (
            <li key={item.label} className="text-white text-base">
              {item.label}
            </li>
          ))}
        </ul>
      </FadeIn>
    </div>
  );

  return (
    <div className="py-32">
      <div className={cn(
        "mx-auto max-w-7xl flex flex-col lg:flex-row items-center gap-8",
        textSide === "right" && "lg:flex-row-reverse"
      )}>
        {textContent}
        {visual ? (
          <FadeIn delay={120} className="w-full lg:w-1/2 px-4 lg:px-8">
            {visual}
          </FadeIn>
        ) : (
          <div className="hidden lg:block lg:w-1/2" />
        )}
      </div>
    </div>
  );
}

const feature1Items: FeatureItem[] = [
  { label: "Program Derived Addresses on Solana" },
  { label: "USDC settlement by default" },
  { label: "Fund via dashboard or on-chain transfer" },
  { label: "Non-custodial by design" },
];

const feature2Items: FeatureItem[] = [
  { label: "Auto protocol detection" },
  { label: "x402 and MPP handlers" },
  { label: "Transaction hash on every response" },
  { label: "Session reuse for MPP" },
];

const feature3Items: FeatureItem[] = [
  { label: "On-chain payment chains" },
  { label: "Budget caps per sub-agent invocation" },
  { label: "Queryable via API or Solana RPC" },
  { label: "Works with any agent framework" },
];

export function FeatureDetails() {
  return (
    <section
      id="features"
      className="relative bg-[#111117]"
      style={{
        backgroundImage:
          "radial-gradient(circle, rgba(255,255,255,0.05) 1.5px, transparent 1px)",
        backgroundSize: "24px 24px",
      }}
    >
      <FeatureBlock
        heading="Agent wallets, out of the box."
        description="Every agent provisioned through Maxim Protocol is assigned a Solana wallet on first initialization. Fund it, query the balance, and settle payments through a single consistent API, with no separate key management infrastructure required."
        items={feature1Items}
        textSide="left"
        visual={
          <Image
            src="/images/new-deployment.png"
            alt="New deployment modal"
            width={600}
            height={400}
            className="w-full rounded-xl border border-white/10"
          />
        }
      />
      <FeatureBlock
        heading="One call. Any protocol."
        description="A single call to maxim.pay() handles both x402 and MPP automatically. Protocol detection, session management, and signed payload construction are resolved at the gateway. Your application writes one line of code."
        items={feature2Items}
        textSide="right"
        visual={<CodeWindow />}
      />
      <FeatureBlock
        heading="Every agent chain, on-chain."
        description="When an orchestrator delegates work to sub-agents, the complete payment hierarchy is recorded on Solana with linked transaction references. Every spend is attributable, auditable, and queryable without a separate accounting layer."
        items={feature3Items}
        textSide="right"
        visual={
          <Image
            src="/images/agents.png"
            alt="Agent chain on-chain"
            width={600}
            height={400}
            className="w-full rounded-xl border border-white/10"
          />
        }
      />
    </section>
  );
}
