import Link from "next/link";
import {
  ArrowRight,
  BarChart3,
  CheckCircle2,
  GraduationCap,
  ShieldCheck,
  Sparkles,
  TrendingUp,
  Users,
  Zap,
} from "lucide-react";
import { SiteFooter, SiteNav } from "@/components/site-chrome";

const brandFrom = "#1E5BFF";
const brandTo = "#10B981";
const ctaGrad = `linear-gradient(135deg, ${brandFrom} 0%, ${brandTo} 100%)`;
const headlineGrad = `linear-gradient(90deg, #0B3B8C 0%, #1E5BFF 50%, #10B981 100%)`;
const ink = "#0B1220";
const sub = "#475569";
const subSoft = "#64748B";
const line = "#E6ECF5";
const surface = "#FFFFFF";
const tintBg = "#F6F9FF";

export default function Home() {
  return (
    <div className="min-h-screen antialiased" style={{ background: "#FFFFFF", color: ink }}>
      <div
        aria-hidden
        className="pointer-events-none fixed inset-0 -z-10"
        style={{
          background:
            "radial-gradient(60% 45% at 12% 0%, rgba(30,91,255,0.10), transparent 60%)," +
            "radial-gradient(50% 40% at 90% 0%, rgba(16,185,129,0.10), transparent 60%)," +
            "radial-gradient(70% 50% at 50% 100%, rgba(30,91,255,0.05), transparent 60%)",
        }}
      />
      <SiteNav />
      <Hero />
      <Features />
      <Benefits />
      <HowItWorks />
      <CTA />
      <SiteFooter />
    </div>
  );
}

function Hero() {
  return (
    <section className="relative">
      <div className="mx-auto grid max-w-7xl items-start gap-12 px-5 pb-16 pt-14 sm:px-8 sm:pt-20 lg:grid-cols-[1.05fr_0.95fr] lg:gap-14">
        <div className="min-w-0">
          <div
            className="inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-xs font-medium"
            style={{ border: `1px solid ${line}`, background: surface, color: sub, boxShadow: "0 1px 2px rgba(15,23,42,0.04)" }}
          >
            <Sparkles className="h-3.5 w-3.5" style={{ color: brandFrom }} />
            Trusted by members worldwide
          </div>

          <h1 className="mt-6 font-display text-[44px] font-extrabold leading-[1.02] tracking-tight sm:text-[60px] lg:text-[72px]" style={{ color: ink }}>
            Grow your business
            <br />
            <span
              style={{ backgroundImage: headlineGrad, WebkitBackgroundClip: "text", backgroundClip: "text", color: "transparent" }}
            >
              with targeted referrals.
            </span>
          </h1>

          <p className="mt-6 max-w-xl text-[17px] leading-relaxed sm:text-lg" style={{ color: sub }}>
            Kash Network is the affiliate platform that helps you track referrals, manage
            referral activity, and scale your business.
          </p>

          <div className="mt-10 grid max-w-xl gap-3.5 sm:grid-cols-3">
            {[
              { icon: TrendingUp, title: "Traffic Campaigns", desc: "Drive targeted clicks to your offers." },
              { icon: BarChart3, title: "Real-Time Analytics", desc: "Track clicks, signups & ROI live." },
              { icon: Users, title: "Partner Program", desc: "Receive referral rewards every month." },
            ].map(({ icon: Icon, title, desc }) => (
              <div
                key={title}
                className="rounded-2xl p-4 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-md"
                style={{ background: surface, border: `1px solid ${line}`, boxShadow: "0 1px 2px rgba(15,23,42,0.04)" }}
              >
                <div
                  className="mb-3 flex h-9 w-9 items-center justify-center rounded-xl"
                  style={{ background: "rgba(30,91,255,0.08)", color: brandFrom, border: `1px solid ${line}` }}
                >
                  <Icon className="h-4 w-4" />
                </div>
                <div className="text-[13.5px] font-semibold" style={{ color: ink }}>{title}</div>
                <div className="mt-1 text-xs leading-relaxed" style={{ color: subSoft }}>{desc}</div>
              </div>
            ))}
          </div>
        </div>

        <div id="join" className="lg:pt-2">
          <AuthPanel />
        </div>
      </div>
    </section>
  );
}

function AuthPanel() {
  return (
    <div
      className="mx-auto w-full max-w-md rounded-3xl p-6 sm:p-7 lg:ml-auto"
      style={{
        background: surface,
        border: `1px solid ${line}`,
        boxShadow: "0 30px 60px -25px rgba(30,91,255,0.25), 0 8px 20px -10px rgba(15,23,42,0.08)",
      }}
    >
      <div className="text-[11px] font-semibold uppercase tracking-[0.18em]" style={{ color: brandFrom }}>
        Member Access
      </div>
      <h2 className="mt-1.5 font-display text-[26px] font-bold" style={{ color: ink }}>
        Welcome back
      </h2>
      <p className="mt-2 text-sm" style={{ color: sub }}>
        Sign in with the email and password you set up when you activated your membership.
      </p>

      <Link
        href="/login"
        className="group mt-5 inline-flex h-11 w-full items-center justify-center gap-2 rounded-full text-sm font-semibold text-white transition-all hover:-translate-y-px"
        style={{ background: ctaGrad, boxShadow: "0 14px 30px -12px rgba(30,91,255,0.5)" }}
      >
        Continue to login
        <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
      </Link>

      <div
        className="mt-5 rounded-xl px-4 py-3 text-xs leading-relaxed"
        style={{ border: "1px solid rgba(30,91,255,0.18)", background: "rgba(30,91,255,0.06)", color: sub }}
      >
        <span className="font-semibold" style={{ color: ink }}>New to Kash Network? </span>
        Use a referral link shared by an existing member to get started.
      </div>
    </div>
  );
}

function Features() {
  const items = [
    { icon: Zap, title: "Traffic Campaigns", desc: "Launch trackable campaigns with unique short links and live analytics." },
    { icon: BarChart3, title: "Performance Dashboard", desc: "Monitor clicks, conversions, referral activity, and ROI in real time." },
    { icon: ShieldCheck, title: "Secure Requests", desc: "Request processing when ready — account details stay encrypted." },
    { icon: GraduationCap, title: "Training Library", desc: "Playbooks and scripts from successful affiliates." },
  ];
  return (
    <section id="features" className="py-20 sm:py-28" style={{ borderTop: `1px solid ${line}` }}>
      <div className="mx-auto max-w-7xl px-5 sm:px-8">
        <SectionHeader eyebrow="Features" title="Everything you need to grow." sub="A complete affiliate toolkit — from referral tracking to analytics — built for serious operators." />
        <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {items.map(({ icon: Icon, title, desc }) => (
            <div
              key={title}
              className="group rounded-2xl p-6 transition-all duration-300 hover:-translate-y-1 hover:shadow-lg"
              style={{ background: surface, border: `1px solid ${line}`, boxShadow: "0 1px 2px rgba(15,23,42,0.04)" }}
            >
              <div
                className="mb-5 flex h-11 w-11 items-center justify-center rounded-xl text-white transition-transform group-hover:scale-110"
                style={{ background: ctaGrad, boxShadow: "0 12px 28px -12px rgba(30,91,255,0.45)" }}
              >
                <Icon className="h-5 w-5" />
              </div>
              <div className="font-semibold" style={{ color: ink }}>{title}</div>
              <p className="mt-1.5 text-sm leading-relaxed" style={{ color: sub }}>{desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function Benefits() {
  const items = [
    "Recurring monthly referral rewards on every active referral.",
    "Branded referral links you can share anywhere",
    "Real-time click & conversion tracking",
    "Dedicated training, playbooks, and support",
    "Customer assignments managed by admins",
    "Transparent processing requests with clear status.",
  ];
  return (
    <section id="benefits" className="py-20 sm:py-28" style={{ borderTop: `1px solid ${line}`, background: tintBg }}>
      <div className="mx-auto grid max-w-7xl items-center gap-12 px-5 sm:px-8 lg:grid-cols-2 lg:gap-16">
        <div>
          <SectionHeader
            eyebrow="Benefits"
            title="Built for partners who want predictable growth."
            sub="Stop juggling spreadsheets. Kash Network gives you a single source of truth for every click, lead, and conversion."
          />
        </div>
        <ul className="grid gap-3 sm:grid-cols-2">
          {items.map((b) => (
            <li
              key={b}
              className="flex items-start gap-3 rounded-2xl p-4 transition-colors hover:shadow-md"
              style={{ background: surface, border: `1px solid ${line}` }}
            >
              <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0" style={{ color: brandTo }} />
              <span className="text-sm" style={{ color: ink }}>{b}</span>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

function HowItWorks() {
  const steps = [
    { n: "01", title: "Create your account", desc: "Sign up in seconds — no credit card required." },
    { n: "02", title: "Share your referral link", desc: "Use your unique link across social, email, or advertising campaigns." },
    { n: "03", title: "Track your referral activity", desc: "Monitor clicks, leads, and signups directly in your dashboard." },
  ];
  return (
    <section id="how-it-works" className="py-20 sm:py-28" style={{ borderTop: `1px solid ${line}` }}>
      <div className="mx-auto max-w-7xl px-5 sm:px-8">
        <SectionHeader eyebrow="How it works" title="Three steps to manage performance." />
        <div className="mt-12 grid gap-5 md:grid-cols-3">
          {steps.map((s) => (
            <div
              key={s.n}
              className="relative rounded-2xl p-7 transition-all duration-300 hover:-translate-y-1 hover:shadow-lg"
              style={{ background: surface, border: `1px solid ${line}`, boxShadow: "0 1px 2px rgba(15,23,42,0.04)" }}
            >
              <div
                className="font-display text-5xl font-extrabold"
                style={{ backgroundImage: headlineGrad, WebkitBackgroundClip: "text", backgroundClip: "text", color: "transparent" }}
              >
                {s.n}
              </div>
              <div className="mt-4 font-semibold" style={{ color: ink }}>{s.title}</div>
              <p className="mt-1.5 text-sm leading-relaxed" style={{ color: sub }}>{s.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function CTA() {
  return (
    <section className="py-20 sm:py-24">
      <div className="mx-auto max-w-6xl px-5 sm:px-8">
        <div
          className="relative overflow-hidden rounded-[28px] p-10 text-center sm:p-16"
          style={{ background: ctaGrad, boxShadow: "0 40px 100px -30px rgba(30,91,255,0.45)" }}
        >
          <div
            aria-hidden
            className="absolute inset-0 opacity-30"
            style={{
              background:
                "radial-gradient(60% 60% at 20% 20%, rgba(255,255,255,0.45), transparent 60%), radial-gradient(50% 50% at 80% 80%, rgba(0,0,0,0.15), transparent 60%)",
            }}
          />
          <div className="relative">
            <h2 className="font-display text-3xl font-bold tracking-tight text-white sm:text-5xl">
              Ready to grow your business?
            </h2>
            <p className="mx-auto mt-4 max-w-xl text-base text-white/90 sm:text-lg">
              Join Kash Network today and build your referral network with tools designed to help you grow.
            </p>
            <div className="mt-8 flex items-center justify-center gap-3">
              <Link
                href="/login"
                className="inline-flex h-12 items-center gap-2 rounded-full bg-white px-7 text-[15px] font-semibold transition-transform hover:-translate-y-0.5"
                style={{ color: brandFrom, boxShadow: "0 14px 30px -10px rgba(0,0,0,0.25)" }}
              >
                Continue to login →
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function SectionHeader({ eyebrow, title, sub: subText }: { eyebrow: string; title: string; sub?: string }) {
  return (
    <div className="max-w-2xl">
      <div className="text-[11px] font-semibold uppercase tracking-[0.18em]" style={{ color: brandFrom }}>
        {eyebrow}
      </div>
      <h2 className="mt-3 font-display text-3xl font-bold leading-[1.1] tracking-tight sm:text-[40px]" style={{ color: ink }}>
        {title}
      </h2>
      {subText && <p className="mt-4 text-base sm:text-lg" style={{ color: sub }}>{subText}</p>}
    </div>
  );
}
