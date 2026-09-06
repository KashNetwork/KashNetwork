import {
  CheckCircle2,
  Lock,
  Mail,
  CreditCard,
  ShieldCheck,
  Headphones,
  ArrowRight,
  User,
  Phone,
  MapPin,
} from "lucide-react";
import avatarJehoyakim from "@/assets/testimonial-jehoyakim.png.asset.json";
import avatarGalib from "@/assets/testimonial-galib.png.asset.json";
import avatarTay from "@/assets/testimonial-tay.png.asset.json";

const ink = "#0B1220";
const navySub = "#475569";
const subSoft = "#64748B";
const line = "#E6ECF5";

export function Field({
  label,
  placeholder,
  type = "text",
  icon,
}: {
  label: string;
  placeholder: string;
  type?: string;
  icon?: React.ReactNode;
}) {
  return (
    <div>
      <label className="block font-display text-[16px] font-bold" style={{ color: "#04184E" }}>
        {label}
      </label>
      <div className="relative mt-1.5">
        <input
          type={type}
          placeholder={placeholder}
          className="w-full rounded-xl border-[3px] px-4 py-3 text-[15px] outline-none transition-colors placeholder:text-[#93A4BE] focus:border-[#2684FF]"
          style={{ borderColor: "#C7DBFA", background: "#F7FBFF", color: ink }}
        />
        {icon ? <span className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2">{icon}</span> : null}
      </div>
    </div>
  );
}

export function CheckoutGrid({
  ctaLabel = "Process Checkout Now",
  ctaNote,
  title = "Complete Your Secure Order",
  showPanel = true,
  wide = false,
  showTrialSummary = false,
}: {
  ctaLabel?: string;
  ctaNote?: string;
  title?: string;
  showPanel?: boolean;
  wide?: boolean;
  showTrialSummary?: boolean;
}) {
  const agreement = (
    <label className="flex items-center gap-2 text-[11.5px] font-semibold sm:gap-3 sm:text-[14px]" style={{ color: "#04184E" }}>
      <input
        type="checkbox"
        className="h-[16px] w-[16px] shrink-0 cursor-pointer appearance-none rounded-[6px] border-2 bg-white checked:border-[#3FDD1B] checked:bg-[#3FDD1B] sm:h-[18px] sm:w-[18px]"
        style={{ borderColor: "#3FDD1B" }}
      />
      <span className="whitespace-nowrap sm:whitespace-normal">
        I agree to the{" "}
        <a
          href="/terms-of-service"
          target="_blank"
          rel="noopener noreferrer"
          className="underline decoration-transparent transition hover:decoration-current"
        >
          Terms of Service
        </a>{" "}
        &amp;{" "}
        <a
          href="/refund-policy"
          target="_blank"
          rel="noopener noreferrer"
          className="underline decoration-transparent transition hover:decoration-current"
        >
          Refund Policy
        </a>
      </span>
    </label>
  );

  return (
    <section
      className={
        wide ? "mx-auto max-w-[840px] px-4 py-10 sm:px-5 sm:py-14" : "mx-auto max-w-[1120px] px-4 py-10 sm:px-5 sm:py-14"
      }
    >
      <div
        className={showPanel ? "grid items-start gap-6 lg:grid-cols-2" : "mx-auto w-full"}
        style={showPanel ? undefined : { maxWidth: 800 }}
      >
        <div
          className={`flex min-w-0 flex-col rounded-[22px] bg-white p-5 sm:p-9 ${wide ? "" : "lg:h-[882px]"}`}
          style={
            wide
              ? {
                  border: "4px solid #C7DBFA",
                  boxShadow: "0 18px 44px -28px rgba(11,42,107,0.28)",
                }
              : { boxShadow: "0 24px 60px -34px rgba(11,42,107,0.35)" }
          }
        >
          <h2
            className="text-center font-display font-extrabold"
            style={{
              color: "#04184E",
              fontSize: "clamp(21px, 4.4vw, 35px)",
              lineHeight: "1.08",
              letterSpacing: "-0.025em",
              whiteSpace: "nowrap",
            }}
          >
            {title}
          </h2>

          <div className="mt-7 space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <Field
                label="First Name"
                placeholder="First Name"
                icon={<User className="h-4 w-4" style={{ color: "#3FDD1B" }} />}
              />
              <Field
                label="Last Name"
                placeholder="Last Name"
                icon={<User className="h-4 w-4" style={{ color: "#3FDD1B" }} />}
              />
            </div>
            <Field
              label="Email Address"
              type="email"
              placeholder="you@example.com"
              icon={<Mail className="h-4 w-4" style={{ color: "#3FDD1B" }} />}
            />
            <Field
              label="Phone Number"
              type="tel"
              placeholder="Phone Number"
              icon={<Phone className="h-4 w-4" style={{ color: "#3FDD1B" }} />}
            />
            <Field
              label="Billing Address"
              placeholder="Street address"
              icon={<MapPin className="h-4 w-4" style={{ color: "#3FDD1B" }} />}
            />
            <div className="grid gap-3 sm:grid-cols-2">
              <div
                className="flex items-center gap-2 rounded-xl border px-4 py-3 text-[14px] font-bold"
                style={{
                  borderColor: "#3FDD1B",
                  color: "#04184E",
                  background: "#F1FEF2",
                  boxShadow: "0 0 0 1px #3FDD1B",
                }}
              >
                <CreditCard className="h-4 w-4" style={{ color: "#2684FF" }} />
                Credit Card
              </div>
              <div
                className="flex items-center gap-2 rounded-xl border px-4 py-3 text-[14px] font-bold"
                style={{ borderColor: "#D9E4F3", color: "#04184E", background: "#F7FBFF" }}
              >
                <span className="font-display text-[16px] font-extrabold italic" style={{ color: "#1E5BFF" }}>
                  P
                </span>
                PayPal
              </div>
            </div>

            <Field
              label="Credit Card Number"
              placeholder="1234 1234 1234 1234"
              icon={<CreditCard className="h-4 w-4" style={{ color: "#3FDD1B" }} />}
            />

            {agreement}

            {showTrialSummary ? (
              <div className="rounded-[16px] px-6 py-5" style={{ background: "#F6F9FE", border: "1px solid #E4ECF8" }}>
                <div className="flex flex-col items-start gap-4 sm:flex-row sm:items-center sm:gap-5">
                  <ShieldCheck className="hidden shrink-0 sm:block sm:h-[46px] sm:w-[46px]" style={{ color: "#2684FF" }} strokeWidth={2} />
                  <div className="min-w-0 flex-1">
                    <div
                      className="flex items-center gap-2 font-display text-[17px] font-extrabold leading-[24px] sm:text-[21px] sm:leading-[28px]"
                      style={{ color: "#04184E" }}
                    >
                      <ShieldCheck className="h-[20px] w-[20px] shrink-0 sm:hidden" style={{ color: "#2684FF" }} strokeWidth={2.2} />
                      <span className="whitespace-nowrap sm:whitespace-normal">7-Day Trial (Full Access)</span>
                    </div>
                    <div
                      className="mt-1 font-display text-[14px] font-semibold leading-[21px] whitespace-normal sm:text-[16px] sm:leading-[23px] sm:whitespace-pre-line"
                      style={{ color: "#3E4E68" }}
                    >
                      {'Instant activation of your\n"money-making" system.'}
                    </div>
                  </div>
                  <div className="shrink-0 text-left sm:border-l sm:border-[#DCE6F5] sm:pl-5 sm:text-right">
                    <div
                      className="font-display text-[23px] font-extrabold leading-[28px] sm:text-[27px] sm:leading-[32px]"
                      style={{ color: "#3FCC1B" }}
                    >
                      $1.00 USD
                    </div>
                    <div className="font-display text-[15px] font-semibold sm:text-[16px]" style={{ color: "#0B1220" }}>
                      Today
                    </div>
                  </div>
                </div>

                <div className="mt-4 border-t border-dashed" style={{ borderColor: "#CFDCEE" }} />

                <div className="mt-4 flex items-start gap-2 sm:gap-3">
                  <CheckCircle2 className="mt-[3px] h-[16px] w-[16px] shrink-0 sm:mt-[2px] sm:h-[19px] sm:w-[19px]" style={{ color: "#3FCC1B" }} />
                  <div className="min-w-0">
                    <div
                      className="font-display text-[13.5px] font-extrabold leading-[20px] whitespace-nowrap sm:text-[16px] sm:leading-[22px] sm:whitespace-normal"
                      style={{ color: "#04184E" }}
                    >
                      Try it risk-free
                      <span style={{ display: "inline-block", width: "10px" }} />
                      &bull;
                      <span style={{ display: "inline-block", width: "10px" }} />
                      Ready in seconds
                    </div>
                    <div
                      className="mt-0.5 font-display text-[12px] font-semibold leading-[18px] whitespace-nowrap sm:text-[14px] sm:leading-[20px] sm:whitespace-normal"
                      style={{ color: "#7C8AA3" }}
                    >
                      After 7 days, $47/month. Cancel anytime.
                    </div>
                  </div>
                </div>

              </div>
            ) : null}

            <button
              type="button"
              className="inline-flex w-full cursor-pointer items-center justify-center gap-2 rounded-full px-3 py-4 font-display font-extrabold whitespace-nowrap uppercase transition-transform hover:-translate-y-0.5 sm:gap-3 sm:px-6 sm:py-5"
              style={{
                background: "linear-gradient(180deg, #79EE3C 0%, #4FD41B 100%)",
                color: "#04184E",
                fontSize: showTrialSummary ? "clamp(12.5px, 3.3vw, 23px)" : "clamp(12px, 2.9vw, 17px)",
                letterSpacing: "0.01em",
                boxShadow: "0 16px 34px -16px rgba(91,224,48,0.65)",
              }}
            >
              {ctaLabel}
              <ArrowRight className={showTrialSummary ? "h-5 w-5 sm:h-6 sm:w-6" : "h-4 w-4 sm:h-5 sm:w-5"} />
            </button>


            {ctaNote ? (
              <p className="text-center text-[12.5px] font-semibold" style={{ color: navySub }}>
                {ctaNote}
              </p>
            ) : null}

            <div className="flex items-center justify-center gap-2 text-[13px] font-bold" style={{ color: "#04184E" }}>
              <Lock className="h-4 w-4" style={{ color: "#2684FF" }} />
              256-Bit SSL Encryption
            </div>
          </div>
        </div>

        {/* benefits + order summary */}
        {showPanel ? (
          <div
            className="flex h-full min-w-0 flex-col rounded-[22px] p-5 text-white sm:p-9"
            style={{
              background: "linear-gradient(135deg, #04123F 0%, #062A86 55%, #0A44C2 100%)",
              boxShadow: "0 28px 60px -30px rgba(11,42,107,0.6)",
            }}
          >
            <h2
              className="text-center font-display font-extrabold sm:text-left"
              style={{ fontSize: "clamp(22px, 4.6vw, 29px)", lineHeight: "1.3", letterSpacing: "-0.02em" }}
            >
              60-Second Setup • What's Included?

            </h2>

            <ul className="mt-6 space-y-5">
              {[
                "You Will Get Your Personal Affiliate Link (DONE-FOR-\nYOU Website) — Earn $37 monthly residual commissions\nwhen people join through your link.",
                "Your Affiliate Link Gets Shared — You get instant access\nto our trusted email advertising sources. These sources\nwill write the email ad for you and send it to\nTHOUSANDS of people interested in earning extra\nincome online.",
                "Our A.I. assistant replies to emails from interested\npeople on your behalf to turn conversations into\ncommissions — 24 hours a day, 7 days a week…\nIT NEVER SLEEPS!",
                "Unlimited Support — 24 / 7",
                "Access for 7 days for just $1",
              ].map((b) => (
                <li key={b} className="flex gap-3">
                  <CheckCircle2
                    className="mt-[3px] h-[21px] w-[21px] shrink-0"
                    style={{ color: "#3FDD1B" }}
                    strokeWidth={2.4}
                  />
                  <span className="min-w-0 font-display text-[15px] font-bold leading-[23px] whitespace-normal sm:text-[16.5px] sm:leading-[24px] lg:whitespace-pre-line">
                    {b}
                  </span>
                </li>
              ))}
            </ul>

            <div className="mt-8 rounded-[16px] p-4 sm:p-6" style={{ background: "rgba(255,255,255,0.17)" }}>
              <div
                className="font-display font-extrabold"
                style={{ fontSize: "clamp(22px, 4.6vw, 29px)", lineHeight: "1.25", letterSpacing: "-0.02em" }}
              >
                Order Summary
              </div>
              <div
                className="mt-3 space-y-1.5 font-display text-[15px] font-bold leading-[24px] sm:text-[16.5px] sm:leading-[26px]"
                style={{ color: "rgba(255, 255, 255, 0.86)" }}
              >
                <div>7-Day Trial… $1.00 Today</div>
                <div>After 7 Days (Future Payment)… $47 / month</div>
                <div style={{ color: "rgb(117, 239, 78)", fontSize: "clamp(17px, 3.6vw, 20px)", fontWeight: 900 }}>
                  Total Today………… $1.00 USD
                </div>
              </div>
            </div>

            <p className="mt-7 font-display text-[14px] font-bold leading-[22px] whitespace-normal sm:text-[15px] sm:leading-[24px] sm:whitespace-pre-line">
              {"Cancel anytime before your trial ends.\nNo contracts. No long-term commitment."}
            </p>
          </div>
        ) : null}
      </div>
    </section>
  );
}

export function VerifiedResults() {
  return (
    <section className="mx-auto max-w-[1060px] px-4 pt-6 pb-4 sm:px-5">
      <p
        className="text-center font-display text-[16px] font-extrabold uppercase sm:text-[20px]"
        style={{ color: "#2684FF", letterSpacing: "0.16em" }}
      >
        Verified Results
      </p>
      <h2
        className="mt-3 text-center font-display font-extrabold md:whitespace-nowrap"
        style={{
          color: "#04184E",
          fontSize: "clamp(28px, 4.4vw, 43px)",
          lineHeight: "1.08",
          letterSpacing: "-0.025em",
        }}
      >
        Real results. Real momentum.
      </h2>

      <div className="mt-7 grid gap-6 md:grid-cols-3">
        {[
          {
            quote:
              "“Before joining, I was struggling to make money online and nothing seemed to work. After following the system, I made my very first sale and earned $100 in commissions! This gave me the confidence that I can actually build consistent income online. If you're on the fence, this system really works!”",
            name: "Jehoyakim Jena",
            avatar: avatarJehoyakim.url,
          },
          {
            quote:
              "“Working with you has always been an absolute pleasure! Your professionalism, clear communication, and trust made this project a seamless and rewarding experience. I truly value our collaboration and look forward to many more successful projects together. Thank you for being so amazing!”",
            name: "Galib",
            avatar: avatarGalib.url,
          },
          {
            quote:
              "“Harley is the kind of person who has clearly done the work. She doesn't sugarcoat, and is refreshingly honest about what most people get wrong.  The results were undeniable. She delivers on what she promises, and that alone sets her apart from so many others in this space. My only regret is not finding her sooner.”",
            name: "Tay S.",
            avatar: avatarTay.url,
          },
        ].map((t) => (
          <figure
            key={t.name}
            className="flex min-w-0 flex-col items-center rounded-[18px] bg-white px-5 pb-6 pt-6 text-center sm:items-start sm:px-6 sm:text-left"
            style={{ boxShadow: "0 20px 44px -34px rgba(11,42,107,0.42)" }}
          >
            <div style={{ color: "#3FDD1B", fontSize: "15px", letterSpacing: "0" }}>★★★★★</div>
            <blockquote
              className="mt-4 flex-1 font-display text-[16px] font-bold leading-[24px] sm:text-[18px] sm:leading-[26px]"
              style={{ color: "#04184E" }}
            >
              {t.quote}
            </blockquote>
            <img
              src={t.avatar}
              alt={t.name}
              width={44}
              height={44}
              loading="lazy"
              className="mt-6 h-[44px] w-[44px] rounded-full object-cover"
            />
            <figcaption className="mt-4 font-display font-bold" style={{ color: "#04184E", fontSize: "14px" }}>
              — {t.name}
            </figcaption>
          </figure>

        ))}
      </div>
    </section>
  );
}

export function GuaranteeBanner({ wide = false }: { wide?: boolean }) {
  return (
    <section
      className={
        wide
          ? "mx-auto max-w-[840px] px-4 pt-6 pb-10 sm:px-5"
          : "mx-auto max-w-[1060px] px-4 pt-6 pb-10 sm:px-5"
      }
    >
      <div
        className="flex flex-col items-start gap-4 rounded-[18px] px-5 py-5 text-white sm:flex-row sm:items-center sm:gap-5 sm:px-7 sm:py-6"
        style={{
          background: "linear-gradient(90deg, #071A44 0%, #0B2A6B 45%, #1657C8 100%)",
          boxShadow: "0 22px 46px -32px rgba(11,42,107,0.7)",
        }}
      >
        <span
          className="hidden h-[46px] w-[46px] shrink-0 place-items-center rounded-[14px] sm:grid"
          style={{ background: "rgba(255,255,255,0.09)" }}
        >
          <ShieldCheck className="h-[22px] w-[22px]" style={{ color: "#3FDD1B" }} strokeWidth={2.2} />
        </span>
        <p className="min-w-0 font-display text-[15px] font-extrabold leading-[24px] whitespace-normal sm:text-[17px] sm:leading-[27px] md:whitespace-pre-line">
          <span
            className="mr-2 inline-grid h-[20px] w-[20px] shrink-0 translate-y-[3px] place-items-center rounded-[6px] align-baseline sm:hidden"
            style={{ background: "rgba(255,255,255,0.09)" }}
          >
            <ShieldCheck className="h-[13px] w-[13px]" style={{ color: "#3FDD1B" }} strokeWidth={2.4} />
          </span>
          {
            "You're protected by our ‘Iron-Clad' 7-Day Satisfaction Guarantee:\nIf you do not earn your first 7 commissions in 7 days, just cancel."
          }
        </p>
      </div>
    </section>
  );
}

export function CheckoutFooter({ variant = "tinted" }: { variant?: "tinted" | "plain" }) {
  const plain = variant === "plain";
  return (
    <footer style={plain ? undefined : { borderTop: `1px solid ${line}`, background: "#EEF4FF" }}>
      <div className={plain ? "mx-auto max-w-[1120px] px-4 sm:px-5" : "mx-auto max-w-5xl px-4 sm:px-5"}>
        {plain ? null : (
          <div className="grid gap-8 py-12 text-center text-sm md:grid-cols-[1.5fr_1fr_1fr] md:text-left">
            <div>
              <p className="leading-relaxed" style={{ color: navySub }}>
                Kash Network combines a ‘simple' email marketing system with an affiliate referral program —{" "}
                <span className="font-bold">all in one</span>. It's the <span className="font-bold">FASTEST</span> way
                to earn commissions online without needing any special skills.{" "}
                <span className="font-bold">100% BEGINNER-FRIENDLY!</span>
              </p>
              <div className="mt-4 space-y-2" style={{ color: navySub }}>
                <div className="flex items-center justify-center gap-2 md:justify-start">
                  <Mail className="h-3.5 w-3.5 shrink-0" />
                  <a href="mailto:support@kash.network" className="break-all hover:opacity-70">
                    support@kash.network
                  </a>
                </div>
                <div className="flex items-center justify-center gap-2 md:justify-start">
                  <Headphones className="h-3.5 w-3.5 shrink-0" />
                  24/7 partner support
                </div>
              </div>
            </div>
            <div className="md:justify-self-center">
              <FooterCol
                title="Legal"
                items={[
                  { label: "Terms of Service", href: "/terms-of-service" },
                  { label: "Privacy Policy", href: "/privacy-policy" },
                  { label: "Refund Policy", href: "/refund-policy" },
                  { label: "Cookie Policy", href: "/cookie-policy" },
                ]}
              />
            </div>
            <FooterCol
              title={"\u00A0"}
              items={[
                { label: "Income Disclaimer", href: "/income-disclaimer" },
                { label: "Affiliate Agreement", href: "/affiliate-agreement" },
                { label: "Frequently Asked Questions (FAQ's)", href: "/faq" },
              ]}
            />
          </div>
        )}

        <p
          className={plain ? "px-2 pb-8 pt-10 text-center text-[11px] leading-relaxed sm:text-left" : "pb-6 text-center text-[11px] leading-relaxed sm:text-left"}
          style={{ color: subSoft }}
        >
          Income Disclaimer: Results discussed on this page are not typical and are not a guarantee of income. Your
          results will depend on your effort, market conditions, the response of people, and other factors. Read our
          full Income Disclaimer for details.
        </p>
      </div>
      <div
        className="py-6 text-center text-xs"
        style={plain ? { color: subSoft } : { color: subSoft, borderTop: `1px solid ${line}` }}
      >
        © {new Date().getFullYear()} Kash Network LLC — All rights reserved.
      </div>
    </footer>
  );
}

function FooterCol({ title, items }: { title: string; items: { label: string; href: string }[] }) {
  return (
    <div>
      <div className="mb-3 font-semibold" style={{ color: ink }}>
        {title}
      </div>
      <ul className="space-y-2" style={{ color: navySub }}>
        {items.map((i) => (
          <li key={i.label}>
            <a href={i.href} className="transition-opacity hover:opacity-70">
              {i.label}
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
}
