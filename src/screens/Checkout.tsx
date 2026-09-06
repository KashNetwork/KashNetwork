'use client';

import { CheckoutGrid, VerifiedResults, GuaranteeBanner, CheckoutFooter } from "@/components/checkout-sections";


const ink = "#0B1220";
const sub = "#475569";
const navy = "#0B2A6B";
const tintBg = "#F4F8FF";

export default function SecureCheckout() {
  return (
    <div className="min-h-screen antialiased" style={{ background: tintBg, color: ink }}>
      {/* ---------- HEADER ---------- */}
      <section className="mx-auto max-w-[1100px] px-4 pt-10 text-center sm:px-5 sm:pt-16">
        <p
          className="whitespace-nowrap font-display text-[12px] font-extrabold uppercase leading-[20px] tracking-[0.06em] sm:whitespace-normal sm:text-[19px] sm:leading-[26px] sm:tracking-[0.14em]"
          style={{ color: "#2684FF" }}

        >
          Start Your 7-Day Trial • Next Step Required
        </p>

        <h1
          className="mt-4 font-display font-extrabold"
          style={{
            color: "#04184E",
            fontSize: "clamp(34px, 7.6vw, 59px)",
            lineHeight: "1.06",
            letterSpacing: "-0.02em",
          }}
        >
          Let’s Activate Your
          <span className="block">Done-For-You System!</span>
        </h1>
        <p
          className="mt-4 font-display font-extrabold"
          style={{
            color: "#3FDD1B",
            fontSize: "clamp(16px, 2.6vw, 26px)",
            lineHeight: "1.3",
          }}
        >
          Complete the secure checkout below to unlock your 7-day trial for just $1.
        </p>
        <p
          className="mx-auto mt-3 max-w-[760px] text-[16px] leading-[25px] sm:text-[19px] sm:leading-[28px]"
          style={{ color: sub }}
        >
          You'll receive immediate access to your premium member dashboard,
          <span className="sm:block"> referral link, training, and the tools included with your membership.</span>
        </p>

        {/* testimonial pill */}
        <div
          className="mt-8 inline-flex max-w-full flex-col items-center gap-2 rounded-[28px] bg-white px-5 py-3.5 text-center sm:mt-10 sm:flex-row sm:items-center sm:gap-3 sm:rounded-full sm:px-7 sm:py-4 sm:text-left"
          style={{ boxShadow: "0 10px 30px -18px rgba(11,42,107,0.45)" }}
        >
          <span className="shrink-0" style={{ color: "#3FDD1B", fontSize: "16px", letterSpacing: "1px" }}>★★★★★</span>
          <p
            className="min-w-0 font-display text-[15px] font-extrabold sm:text-[17px]"
            style={{ color: navy }}
          >
            “The best decision I made for growing my online income this year!”
          </p>
        </div>

      </section>

      <CheckoutGrid />
      <VerifiedResults />
      <GuaranteeBanner />
      <CheckoutFooter />
    </div>
  );
}