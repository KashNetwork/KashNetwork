import Link from "next/link";
import { Mail, Globe, Headphones } from "lucide-react";


export const ink = "#04184E";
export const bodyText = "#2B3A54";
export const softText = "#475B81";
export const hairline = "#E6ECF5";
export const tint = "#F5F8FD";
export const brandBlue = "#2684FF";
export const brandGrad = "linear-gradient(135deg, #2A7BEA 0%, #17A3B8 100%)";

export function KashMark({ size = 32 }: { size?: number }) {
  return (
    <span
      className="shrink-0 rounded-full flex items-center justify-center"
      style={{ background: brandGrad, height: size, width: size }}
    >
      <svg
        width={size * 0.56}
        height={size * 0.56}
        viewBox="0 0 24 24"
        fill="none"
        stroke="#FFFFFF"
        strokeWidth={1.9}
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <path d="M12 2.6 20.1 7v10L12 21.4 3.9 17V7z" />
        <circle cx="12" cy="12" r="3.6" />
      </svg>
    </span>
  );
}

export function SiteNav() {
  return (
    <nav
      className="relative z-40"
      style={{ background: "#FFFFFF", borderBottom: `1px solid ${hairline}` }}
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-8 h-[63px] flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2.5">
          <KashMark size={32} />
          <span className="font-display font-extrabold text-[18px] leading-none" style={{ color: "#0F172A" }}>
            Kash Network
          </span>
        </Link>

        <div className="hidden md:flex items-center gap-9 text-[15px] font-normal" style={{ color: "#475569" }}>
          <a href="/#features" className="hover:opacity-70 transition-opacity">Features</a>
          <a href="/#how-it-works" className="hover:opacity-70 transition-opacity">How It Works</a>
          <Link href="/contact" className="hover:opacity-70 transition-opacity">Contact</Link>
        </div>

        <Link
          href="/"
          className="shrink-0 rounded-full px-4 py-2 text-[13px] font-bold sm:px-5 sm:py-2.5 sm:text-[14px] text-white hover:opacity-90 transition-opacity"
          style={{ background: brandGrad }}
        >
          Get Started
        </Link>
      </div>
    </nav>
  );
}

export function SiteFooter() {
  return (
    <div className="mx-auto max-w-[1440px] px-0" style={{ background: "#FFFFFF" }}>
      <footer style={{ background: tint }}>
        <div className="px-5 sm:px-12 lg:px-[72px] pt-14 pb-4">
          <div className="grid gap-10 grid-cols-2 lg:grid-cols-[minmax(0,1.6fr)_minmax(0,0.75fr)_minmax(0,1.35fr)_minmax(0,1fr)] text-[15px] text-center sm:text-left">
            <div className="col-span-2 sm:col-span-1">
              <div className="flex items-center gap-2.5 justify-center sm:justify-start">
                <KashMark size={32} />
                <span className="font-display font-extrabold text-[19px] leading-none" style={{ color: "#0F172A" }}>
                  Kash Network
                </span>
              </div>
              <p className="mt-4 max-w-[260px] mx-auto leading-[1.55]" style={{ color: bodyText }}>
                The affiliate platform helping partners grow with targeted referrals.
              </p>
            </div>

            <div className="col-span-2 sm:col-span-1">
              <div className="font-display font-bold mb-4" style={{ color: ink }}>Product</div>
              <ul className="space-y-[9px]" style={{ color: bodyText }}>
                <li><a href="/#features" className="hover:opacity-70">Features</a></li>
                <li><a href="/#benefits" className="hover:opacity-70">Benefits</a></li>
                <li><a href="/#how-it-works" className="hover:opacity-70">How it works</a></li>
              </ul>
            </div>

            <div className="col-span-2 sm:col-span-1">
              <div className="font-display font-bold mb-4" style={{ color: ink }}>Legal</div>
              <div className="grid grid-cols-1 gap-x-6 gap-y-[9px] justify-items-center sm:grid-cols-2 sm:justify-items-start">
                <ul className="space-y-[9px]" style={{ color: bodyText }}>
                  <li><Link href="/terms-of-service" className="hover:opacity-70">Terms of Service</Link></li>
                  <li><Link href="/privacy-policy" className="hover:opacity-70">Privacy Policy</Link></li>
                  <li><Link href="/refund-policy" className="hover:opacity-70">Refund Policy</Link></li>
                </ul>
                <ul className="space-y-[9px]" style={{ color: bodyText }}>
                  <li><Link href="/income-disclaimer" className="hover:opacity-70">Income Disclaimer</Link></li>
                  <li><Link href="/affiliate-agreement" className="hover:opacity-70">Affiliate Agreement</Link></li>
                  <li><Link href="/cookie-policy" className="hover:opacity-70">Cookie Policy</Link></li>
                </ul>
              </div>
            </div>

            <div className="col-span-2 sm:col-span-1">
              <div className="font-display font-bold mb-4" style={{ color: ink }}>Contact</div>
              <ul className="space-y-[9px]" style={{ color: bodyText }}>
                <li className="flex items-center gap-2.5 justify-center sm:justify-start">
                  <Mail className="h-4 w-4 shrink-0" style={{ color: softText }} />
                  <a href="mailto:support@kash.network" className="break-all hover:opacity-70">support@kash.network</a>
                </li>
                <li className="flex items-center gap-2.5 justify-center sm:justify-start">
                  <Globe className="h-4 w-4 shrink-0" style={{ color: softText }} />
                  <a href="https://kash.network/" className="hover:opacity-70">kash.network</a>
                </li>
                <li className="flex items-center gap-2.5 justify-center sm:justify-start">
                  <Headphones className="h-4 w-4 shrink-0" style={{ color: softText }} />
                  <span>24/7 partner support</span>
                </li>
              </ul>
            </div>
          </div>

          <div
            className="mt-12 pt-6 text-center text-[14px]"
            style={{ color: softText, borderTop: `1px solid ${hairline}` }}
          >
            © Kash Network. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}

