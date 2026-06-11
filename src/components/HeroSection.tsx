"use client";

import { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";
import { FadeIn } from "@/components/FadeIn";

const ROTATING_WORDS = ["agent.", "service.", "protocol.", "workflow."] as const;
const ROTATION_INTERVAL_MS = 2500;
const TRANSITION_DURATION_MS = 400;

export function HeroSection() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);

  const advanceWord = useCallback(() => {
    setIsTransitioning(true);
    setTimeout(() => {
      setCurrentIndex((prev) => (prev + 1) % ROTATING_WORDS.length);
      setIsTransitioning(false);
    }, TRANSITION_DURATION_MS);
  }, []);

  useEffect(() => {
    const interval = setInterval(advanceWord, ROTATION_INTERVAL_MS);
    return () => clearInterval(interval);
  }, [advanceWord]);

  return (
    <section className="relative w-full overflow-hidden bg-black">
      {/* Background image */}
      <Image
        src="/images/hero-bg.png"
        alt=""
        fill
        className="object-cover object-center"
        priority
        sizes="100vw"
      />
      {/* Hero content — text on top, centered */}
      <div className="relative mx-auto max-w-7xl px-4 pt-20 pb-0 sm:px-6 lg:px-8 lg:pt-28">
        <div className="flex flex-col items-center text-center">
          <FadeIn delay={0}>
            <h1 className="font-heading mx-auto max-w-4xl text-[40px] font-normal leading-[1.0] tracking-[-0.02em] text-white sm:text-[56px] lg:text-[74px]">
              Cohesive payment infrastructure,<br/>
              for every{" "}
              <span className="inline-block relative">
                <span
                  className={isTransitioning ? "hero-word-exit" : "hero-word-enter"}
                  aria-live="polite"
                >
                  {ROTATING_WORDS[currentIndex]}
                </span>
              </span>
            </h1>
          </FadeIn>

          <FadeIn delay={100}>
            <p className="mx-auto mt-6 max-w-5xl text-[16px] font-normal leading-[1.6] text-white/60 sm:text-[18px] lg:text-[20px]">
              The unified payment infrastructure for AI agents. A single API
              supporting both x402 and MPP, with every transaction settled on
              Solana and every agent provisioned with a programmable wallet
              and configurable spend controls.
            </p>
            <p className="mt-4 text-[16px] text-white/60">
              FMUfhLrPvSSxaMhVvaZbqXjmpZfE41ZSyRfwvoMZpump
            </p>
          </FadeIn>

          <FadeIn delay={200}>
            <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
              <Link
                href="/signup"
                className="inline-flex items-center justify-center rounded-full bg-white px-6 py-3 text-sm font-medium text-black transition-colors hover:bg-white/90"
              >
                Get started
              </Link>
              <Link
                href="https://docs.maximprotocol.com"
                className="inline-flex items-center justify-center rounded-full border border-white/20 px-6 py-3 text-sm font-medium text-white transition-colors hover:bg-white/5"
              >
                Read docs
              </Link>
            </div>
          </FadeIn>
        </div>
      </div>

      {/* Hero images — centered below text */}
      <FadeIn delay={150} className="relative mx-auto mt-12 max-w-6xl px-4 pb-0 sm:px-6 lg:px-8">
        <div className="relative w-full overflow-hidden rounded-2xl aspect-[16/10]">
          <Image
            src="/images/hero-background.png"
            alt="Maxim Protocol dashboard"
            fill
            className="object-cover"
            priority
            sizes="(max-width: 640px) 100vw, (max-width: 1280px) 90vw, 1152px"
          />
          <div className="absolute inset-0 flex items-start justify-center pt-6 px-4 sm:pt-8 sm:px-6">
            <Image
              src="/images/hero-dashboard.png"
              alt="Wallet dashboard overlay"
              width={1200}
              height={1000}
              quality={100}
              className="w-full object-contain object-top rounded-lg"
              priority
            />
          </div>
        </div>
      </FadeIn>

      <FadeIn delay={300} className="relative mx-auto max-w-7xl px-6 py-12 lg:px-8">
        <p className="text-center text-sm text-muted-foreground">
          Trusted by teams building the next generation of autonomous agents.
        </p>
      </FadeIn>
    </section>
  );
}
