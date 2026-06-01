import Image from "next/image";
import { FadeIn } from "@/components/FadeIn";
import Link from "next/link";

export function CTASection() {
  return (
    <section>
      {/* CTA Hero */}
      <div className="relative overflow-hidden py-20 lg:py-48">
        <Image
          src="/images/banner.png"
          alt=""
          fill
          className="object-cover object-center brightness-30"
          sizes="100vw"
        />
        <div className="relative mx-auto max-w-6xl px-6 text-center">
          <FadeIn delay={0}>
            <h2 className="mx-auto max-w-6xl text-center text-[32px] font-normal leading-tight tracking-[-0.02em] text-white sm:text-[44px] lg:text-[56px]">
              Add payment infrastructure to your agents.<br className="hidden sm:block" /> Deploy to production the same day.
            </h2>
          </FadeIn>
          <FadeIn delay={120}>
            <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row sm:gap-4">
              <Link
                href="/signup"
                className="w-full rounded-full bg-white px-8 py-3 text-base font-medium text-black transition-colors hover:bg-white/90 sm:w-auto"
              >
                Get started
              </Link>
              <Link
                href="mailto:contact@maximprotocol.com"
                className="w-full rounded-full border border-white/20 px-8 py-3 text-base font-medium text-white transition-colors hover:bg-white/5 sm:w-auto"
              >
                Talk to us
              </Link>
            </div>
          </FadeIn>
        </div>
      </div>
    </section>
  );
}
