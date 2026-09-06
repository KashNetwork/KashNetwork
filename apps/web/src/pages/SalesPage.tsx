import { BadgeCheck, CircleDollarSign, CircleMinus, Play, Sparkles, UserRound } from "lucide-react";
import { salesSections, type Block, type Section } from "@/content/sales-page";
import { RedUnderline, YellowSmear } from "@/components/text-accents";
import { LiveNotifications } from "@/components/LiveNotifications";

import founderAsset from "@/assets/founder.png.asset.json";
import results1Asset from "@/assets/results-1.png.asset.json";
import results2Asset from "@/assets/results-2.png.asset.json";
import closingAsset from "@/assets/closing.jpg.asset.json";


const ink = "rgb(4, 24, 78)";
const lime = "#75ef4e";
const limeGrad = "linear-gradient(#7ef450 0%, #5be030 100%)";
const CHECKOUT = "/secure-checkout";

const IMAGES: Record<string, string> = {
  founder: founderAsset.url,
  results1: results1Asset.url,
  results2: results2Asset.url,
  closing: closingAsset.url,
};

/* ---------- inline rich text: **bold**, _italic_, {{rgb(...)}}…{{/}} ---------- */
function RichText({ text }: { text: string }) {
  const lines = text.split("\n");
  return (
    <>
      {lines.map((line, li) => (
        <span key={li}>
          {li > 0 && <br />}
          {renderInline(line)}
        </span>
      ))}
    </>
  );
}

function renderInline(line: string) {
  const nodes: React.ReactNode[] = [];
  const re = /\{\{(rgb\([^)]*\))\}\}|\{\{\/\}\}|\*\*|_/g;
  let last = 0;
  let key = 0;
  let bold = false;
  let italic = false;
  let color: string | null = null;
  const push = (raw: string) => {
    if (!raw) return;
    nodes.push(
      <span
        key={key++}
        style={{
          fontWeight: bold ? 700 : undefined,
          fontStyle: italic ? "italic" : undefined,
          color: color ?? undefined,
        }}
      >
        {raw}
      </span>,
    );
  };
  let m: RegExpExecArray | null;
  while ((m = re.exec(line))) {
    push(line.slice(last, m.index));
    last = m.index + m[0].length;
    if (m[0] === "**") bold = !bold;
    else if (m[0] === "_") italic = !italic;
    else if (m[0] === "{{/}}") color = null;
    else color = m[1] ?? null;
  }
  push(line.slice(last));
  return nodes;
}

/* fluid font size: scales down on small screens, exact desktop value at >=1200px */
const fs = (size: number | string) => {
  const px = typeof size === "number" ? size : Number(size);
  return `clamp(${Math.round(px * 0.72)}px, ${(px / 11).toFixed(2)}vw, ${px}px)`;
};

/* ---------- primitives ---------- */
function Text({ b, tag }: { b: Block; tag: "h1" | "h2" | "p" }) {
  const Tag = tag;
  const isHeading = tag !== "p";
  const isSalesPromise = tag === "h1" && b.x?.includes("$37 Per Hour Sending Emails");
  const isAttentionMarker = tag === "p" && b.x?.startsWith("ATTENTION:");
  const isDemoLine = tag === "p" && b.x?.startsWith("Click ▶️");
  const isAiCopy = tag === "p" && b.x?.startsWith("The A.I. assistant handles");
  const isMemberResultDisclaimer = tag === "p" && b.x?.startsWith("Member result shown.");
  if (isSalesPromise) {
    return (
      <h1
        className="w-full font-display text-center font-extrabold"
        style={{
          fontSize: "clamp(26px, 4.2vw, 50px)",
          color: ink,
          lineHeight: "1.12",
          letterSpacing: "-0.03em",
        }}
      >
        <span className="block whitespace-nowrap" style={{ fontSize: "clamp(22px, 6.9vw, 50px)" }}>
          ⚠️ Need <span style={{ color: "rgb(208, 2, 27)" }}>Emergency</span> Cash? ⚠️
        </span>
        <span
          className="mt-3 block font-display font-extrabold"
          style={{ fontSize: "clamp(29px, 7.3vw, 68px)", letterSpacing: "-0.03em" }}
        >
          <YellowSmear>$37 Per Hour Sending Emails</YellowSmear>
        </span>
      </h1>
    );
  }
  if (isAiCopy) {
    return (
      <p
        className="w-full whitespace-pre-line font-sans"
        style={{
          fontSize: "clamp(13px, 4vw, 35px)",
          fontWeight: b.w ? (Number(b.w) as number) : undefined,
          color: b.c ?? ink,
          textAlign: (b.a as "left" | "center") ?? "left",
          lineHeight: b.lh ?? undefined,
          letterSpacing: b.ls ?? undefined,
        }}
      >
        <RichText text={b.x ?? ""} />
      </p>
    );
  }

  if (isDemoLine) {
    return (
      <p
        className="w-full font-sans md:whitespace-nowrap"
        style={{
          fontSize: b.size ? fs(b.size) : undefined,
          fontWeight: b.w ? (Number(b.w) as number) : undefined,
          color: b.c ?? ink,
          textAlign: (b.a as "left" | "center") ?? "left",
          lineHeight: b.lh ?? undefined,
          letterSpacing: b.ls ?? undefined,
        }}
      >
        <RedUnderline>
          <span style={{ fontWeight: 800 }}>LIVE DEMO:</span>
        </RedUnderline>{" "}
        <RichText text={b.x ?? ""} />
      </p>
    );
  }

  if (isMemberResultDisclaimer) {
    return (
      <p
        className="w-full whitespace-nowrap text-center font-sans"
        style={{
          fontSize: "clamp(7px, 2.1vw, 14px)",
          fontWeight: b.w ? Number(b.w) : undefined,
          color: b.c ?? ink,
          lineHeight: b.lh ?? undefined,
        }}
      >
        <RichText text={b.x ?? ""} />
      </p>
    );
  }

  return (
    <Tag
      className={`w-full ${isHeading ? "font-display" : "font-sans"} ${b.x?.includes("\n") ? "whitespace-normal lg:whitespace-pre-line" : ""}`}
      style={{
        fontSize: b.size ? fs(b.size) : undefined,
        fontWeight: b.w ? (Number(b.w) as number) : undefined,
        color: b.c ?? ink,
        textAlign: (b.a as "left" | "center") ?? "left",
        lineHeight: b.lh ?? undefined,
        letterSpacing: b.ls ?? undefined,
        textTransform: isAttentionMarker ? "uppercase" : undefined,
      }}
    >
      <RichText text={b.x ?? ""} />
    </Tag>
  );
}

function Bullet({ b }: { b: Block }) {
  const content = (
    <>
      <CircleDollarSign
        className="shrink-0"
        style={{ width: "clamp(28px, 3.4vw, 40px)", height: "clamp(28px, 3.4vw, 40px)", color: lime, strokeWidth: 2 }}
      />
      <p
        className="font-sans"
        style={{
          fontSize: b.size ? fs(b.size) : fs(22),
          fontWeight: b.w ? (Number(b.w) as number) : 500,
          color: ink,
          lineHeight: "1.55em",
        }}
      >
        <RichText text={b.x ?? ""} />
      </p>
    </>
  );
  if (b.card) {
    return (
      <div
        className="flex w-full items-start gap-4 bg-white"
        style={{
          border: `5px solid ${lime}`,
          borderRadius: 22,
          padding: "clamp(16px, 2vw, 24px)",
          boxShadow: "0 18px 46px #092a6917",
        }}
      >
        {content}
      </div>
    );
  }
  return <div className="flex w-full items-start gap-4">{content}</div>;
}

function MinusItem({ b }: { b: Block }) {
  return (
    <div className="flex w-full items-start" style={{ gap: 26 }}>
      <CircleMinus
        className="shrink-0"
        style={{ width: "clamp(24px, 2.9vw, 34px)", height: "clamp(24px, 2.9vw, 34px)", color: "rgb(208, 2, 27)", marginTop: 3 }}
        strokeWidth={2}
      />
      <p
        className="font-sans"
        style={{
          fontSize: b.size ? fs(b.size) : fs(22),
          fontWeight: b.w ? (Number(b.w) as number) : 500,
          color: ink,
          lineHeight: b.lh ?? "1.65em",
        }}
      >
        <RichText text={b.x ?? ""} />
      </p>
    </div>
  );
}

function IconItem({ b, type }: { b: Block; type: "person" | "check" }) {
  const Icon = type === "person" ? UserRound : BadgeCheck;
  return (
    <div className="flex w-full items-start gap-[18px]">
      <Icon
        className="mt-1 shrink-0"
        style={{ width: "clamp(28px, 3.4vw, 40px)", height: "clamp(28px, 3.4vw, 40px)", color: lime }}
        strokeWidth={2}
      />
      <p
        className="font-sans"
        style={{
          fontSize: b.size ? fs(b.size) : fs(22),
          color: ink,
          lineHeight: b.lh ?? "1.65em",
        }}
      >
        <RichText text={b.x ?? ""} />
      </p>
    </div>
  );
}

function Period({ b }: { b: Block }) {
  return (
    <div className="flex w-full items-center justify-center gap-3 text-center">
      <BadgeCheck className="shrink-0" style={{ width: "clamp(30px, 3.7vw, 44px)", height: "clamp(30px, 3.7vw, 44px)", color: lime }} strokeWidth={2.5} />
      <p
        className="font-display"
        style={{
          fontSize: b.size ? fs(b.size) : fs(50),
          fontWeight: b.w ? Number(b.w) : 700,
          color: b.c ?? lime,
          lineHeight: b.lh ?? "1.35em",
        }}
      >
        {b.x}
      </p>
    </div>
  );
}

function Cta({ b }: { b: Block }) {
  const button = (
    <div className="flex w-full flex-col items-center gap-3">
      <a
        href={CHECKOUT}
        className="flex w-full cursor-pointer items-center justify-center transition-transform hover:-translate-y-0.5"
        style={{
          maxWidth: 698,
          background: limeGrad,
          borderRadius: 100,
          padding: "clamp(16px, 2.1vw, 25px) clamp(16px, 2.3vw, 28px)",
          boxShadow: "0 12px 24px #5be0304d",
          textDecoration: "none",
        }}
      >
        <span
          className="font-display text-center"
          style={{
            fontSize: "clamp(18px, 5.2vw, 35px)",
            fontWeight: 800,
            color: ink,
            lineHeight: "1.1em",
            whiteSpace: "nowrap",
          }}
        >
          {b.label}
        </span>
      </a>
      <p
        className="font-sans text-center"
        style={{
          fontSize: "clamp(10px, 1.5vw, 20px)",
          color: "rgb(71, 91, 129)",
          lineHeight: "1.4em",
          whiteSpace: "nowrap",
        }}
      >
        {b.sub}
      </p>
    </div>
  );
  return button;
}

function Img({ b }: { b: Block }) {
  const src = IMAGES[b.src ?? ""];
  if (!src) return null;
  if (b.round) {
    const size = Number(b.w) || 220;
    const float = size === 220 ? "right" : "left";
    const alt = size === 220 ? "Harley Carter, creator of Kash Network" : "Harley Carter";
    const radius = size === 220 ? "100%" : 18;
    return (
      <>
        {/* mobile / small tablet: centered, no float */}
        <span
          className="mx-auto mb-5 block w-[180px] sm:hidden"
          style={{
            borderRadius: radius,
            border: "3px solid #2460e8",
            overflow: "hidden",
            aspectRatio: `${size} / ${b.h ?? size}`,
          }}
        >
          <img src={src} alt={alt} className="h-full w-full object-cover" loading="lazy" />
        </span>
        {/* desktop: original floated portrait */}
        <span
          className="hidden sm:block"
          style={{
            float,
            width: size,
            height: b.h ?? size,
            borderRadius: radius,
            border: "3px solid #2460e8",
            overflow: "hidden",
            margin: float === "right" ? "10px 0 20px 28px" : "6px 24px 20px 0",
          }}
        >
          <img src={src} alt={alt} className="h-full w-full object-cover" loading="lazy" />
        </span>
      </>
    );
  }


  return (
    <span
      className="block w-full overflow-hidden"
      style={{ maxHeight: b.h ?? 294, borderRadius: 14 }}
    >
      <img
        src={src}
        alt="Commission results screenshot"
        className="h-auto w-full object-contain"
        loading="lazy"
      />
    </span>
  );
}

function Badge({ b }: { b: Block }) {
  return (
    <div
      className="flex items-center gap-2.5 bg-white"
      style={{
        border: "1px solid #2684ff2e",
        borderRadius: 100,
        padding: "11px 18px",
        boxShadow: "0 4px 12px #092a6914",
      }}
    >
      <Sparkles style={{ width: 20, height: 20, color: "#2460e8" }} strokeWidth={1.6} />
      <span
        className="font-sans font-extrabold lg:font-semibold"
        style={{ fontSize: fs(17), color: ink, lineHeight: "1.3em" }}
      >
        {b.x}
      </span>
    </div>
  );
}

function Video() {
  return (
    <div
      className="flex w-full items-center justify-center"
      style={{
        maxWidth: 802,
        aspectRatio: "802 / 451",
        background: "linear-gradient(#2563eb 0%, #09245f 100%)",
        borderRadius: 20,
      }}
    >
      <Play
        aria-hidden="true"
        fill="none"
        stroke="white"
        strokeWidth={1.5}
        style={{ width: "clamp(64px, 12vw, 143px)", height: "clamp(66px, 12.3vw, 147px)" }}
      />
    </div>
  );
}


const FOOTER_LINKS: { label: string; href: string }[] = [
  { label: "Terms of Service", href: "/terms-of-service" },
  { label: "Privacy Policy", href: "/privacy-policy" },
  { label: "Income Disclaimer", href: "/income-disclaimer" },
  { label: "Refund Policy", href: "/refund-policy" },
  { label: "Cookie Policy", href: "/cookie-policy" },
  { label: "Affiliate Agreement", href: "/affiliate-agreement" },
  { label: "Contact", href: "/contact" },
  { label: "Frequently Asked Questions (FAQ's)", href: "/faqs" },
];

/* ---------- block dispatcher ---------- */
function BlockView({ b }: { b: Block }) {
  switch (b.k) {
    case "h1":
    case "h2":
      return <Text b={b} tag={b.k} />;
    case "p":
      return <Text b={b} tag="p" />;
    case "bullet":
      return <Bullet b={b} />;
    case "minus":
      return <MinusItem b={b} />;
    case "person":
      return <IconItem b={b} type="person" />;
    case "check":
      return <IconItem b={b} type="check" />;
    case "period":
      return <Period b={b} />;
    case "cta":
      return <Cta b={b} />;
    case "img":
      return <Img b={b} />;
    case "badge":
      return <Badge b={b} />;
    case "video":
      return <Video />;
    case "quotecard":
      return (
        <div
          className="flex w-full flex-col items-center gap-[18px]"
          style={{
            background: "#f7fbff",
            border: "1px solid #2684ff29",
            borderRadius: 22,
            padding: "clamp(18px, 2.7vw, 32px)",
          }}
        >
          {(b.items ?? []).map((c, i) => (
            <BlockView key={i} b={c} />
          ))}
        </div>
      );
    case "flow":
      if (b.items?.[0]?.src === "closing") {
        const image = b.items[0];
        const copy = b.items[1];
        if (!copy) return null;
        return (
          <div className="grid w-full grid-cols-1 items-stretch gap-6 lg:grid-cols-[254px_minmax(0,1fr)]">
            <div className="mx-auto h-[200px] w-[180px] overflow-hidden rounded-[18px] border-[3px] border-[#2460e8] sm:h-[236px] sm:w-[212px] lg:mx-0 lg:h-full lg:min-h-[335px] lg:w-auto">
              <img src={IMAGES[image.src ?? ""]} alt="Harley Carter" className="h-full w-full object-cover" loading="lazy" />
            </div>
            <div className="flex min-w-0 items-center"><BlockView b={copy} /></div>
          </div>
        );
      }
      return (
        <div className="w-full space-y-[22px]">
          {(b.items ?? []).map((c, i) => (
            <BlockView key={i} b={c} />
          ))}
          <span className="block clear-both" />
        </div>
      );
    default:
      return null;
  }
}


/* group round portraits with the copy that sits beside them in the reference rows */
function prepare(items: Block[]): Block[] {
  const out: Block[] = [];
  for (let i = 0; i < items.length; i++) {
    const it = items[i];
    if (!it) continue;
    if (it.k === "img" && it.round && Number(it.w) === 220) {
      const before = out.splice(Math.max(0, out.length - 2), 2);
      out.push({ k: "flow", items: [it, ...before] });
      continue;
    }
    if (it.k === "img" && it.round && Number(it.w) === 254) {
      const after = items.slice(i + 1, i + 2).filter(Boolean) as Block[];
      out.push({ k: "flow", items: [it, ...after] });
      i += after.length;
      continue;
    }
    out.push(it);
  }
  return out;
}


const GROUP_KINDS = new Set(["bullet", "minus", "person", "check"]);

function spacingFor(b: Block, prev: Block | undefined, isFirst: boolean, isLast: boolean) {
  let mt = 0;
  let mb = 0;
  let pl = 0;
  if (b.k === "h2") {
    mt = 36;
    mb = 24;
  } else if (b.k === "cta" || b.k === "quotecard") {
    mt = 34;
    mb = 34;
  } else if (b.k === "p" && prev && GROUP_KINDS.has(prev.k)) {
    mt = 28;
    if (prev.k === "bullet" && !b.x?.startsWith("Think about it for a second")) pl = 56;
  }
  if (isFirst) mt = 0;
  if (isLast) mb = 0;
  return { marginTop: mt || undefined, marginBottom: mb || undefined, paddingLeft: pl || undefined };
}

function SectionView({ s }: { s: Section }) {
  if (s.kind === "footer") {
    return (
      <section className="mx-auto w-full" style={{ maxWidth: 1200, background: "#04184e" }}>
        <div className="flex flex-col items-center gap-4" style={{ padding: "clamp(32px, 4vw, 48px) clamp(16px, 3.4vw, 40px)" }}>
          <p
            className="font-sans text-center"
            style={{ fontSize: fs(15), color: "rgb(214, 230, 255)", lineHeight: "1.7em" }}
          >
            {FOOTER_LINKS.map((l, i) => (
              <span key={l.href}>
                {i > 0 && <span className="opacity-50"> | </span>}
                <a href={l.href} target="_blank" rel="noopener noreferrer" className="hover:opacity-70">
                  {l.label}
                </a>
              </span>
            ))}
          </p>
          <p
            className="font-sans text-center whitespace-normal lg:whitespace-pre-line"
            style={{ fontSize: fs(13), color: "rgb(174, 194, 228)", lineHeight: "1.55em" }}
          >
            {s.items[1]?.x}
          </p>
        </div>
      </section>
    );
  }

  const isBand = s.kind === "band";
  const isHero = s.kind === "hero";
  const isLongOffer = s.items.some((item) => item.x === "Who Is This Really For?");

  if (s.kind === "tint") {
    const bullets = s.items.filter((item) => item.k === "bullet");
    return (
      <section className="w-full bg-[#f7fbff]">
        <div
          className="mx-auto flex w-full flex-col items-center lg:min-h-[995px]"
          style={{ maxWidth: 920, padding: "clamp(40px, 5.8vw, 70px) clamp(16px, 3.4vw, 40px)", gap: 28 }}
        >
          <h2
            className="w-full font-display text-center"
            style={{
              fontSize: fs(27),
              fontWeight: 800,
              color: ink,
              lineHeight: "1.55em",
              letterSpacing: "0.015em",
            }}
          >
            <span className="portrait:mb-[0.6em] portrait:block landscape:inline lg:mb-0 lg:inline" style={{ fontSize: fs(58), letterSpacing: "-0.035em" }}>
              Zero Experience?{" "}
            </span>
            <span className="portrait:block landscape:inline lg:inline" style={{ fontSize: fs(58), letterSpacing: "-0.035em", color: "rgb(208, 2, 27)" }}>
              PERFECT.
            </span>
            <br />
            60 SECONDS to get set up and ready to earn commissions!
            <br />
            <br />
            <br />
            <span style={{ fontSize: fs(38), letterSpacing: "-0.035em" }}>Here’s how it works:</span>
          </h2>
          <div className="flex w-full flex-col gap-[18px]">
            {bullets.map((b, i) => (
              <BlockView key={i} b={b} />
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (isBand) {
    return (
      <section
        className="flex w-full flex-col items-center"
        style={{
          background: "linear-gradient(#051a53 0%, #0c4db7 100%)",
          padding: "clamp(44px, 6.3vw, 76px) clamp(16px, 3.4vw, 40px)",
          gap: 24,
        }}
      >
        <div
          className="mx-auto flex w-full flex-col items-center"
          style={{ maxWidth: 880, gap: 32 }}
        >
          {(() => {
            const list = prepare(s.items);
            return list.map((b, i) => (
              <div key={i} className="flex w-full justify-center" style={spacingFor(b, list[i - 1], i === 0, i === list.length - 1)}>
                <div className="w-full" style={{ maxWidth: 860 }}>
                  <BlockView b={b} />
                </div>
              </div>
            ));
          })()}
        </div>
      </section>
    );
  }

  return (
    <section
      className="w-full"
      style={{ background: "#f7fbff" }}
    >

      <div
        className="mx-auto flex w-full flex-col items-center"
        style={{
          maxWidth: isHero ? 1200 : 820,
          background: isHero ? "linear-gradient(#f7fbff 0%, #fff 100%)" : "#fff",
          borderRadius: isHero ? undefined : isLongOffer ? "0 0 22px 22px" : 22,
          boxShadow: isHero ? undefined : "0 24px 64px rgba(9, 42, 105, 0.10)",
          marginBottom: isLongOffer ? 34 : undefined,
          padding: isHero
            ? "clamp(44px, 6.3vw, 76px) clamp(16px, 3.4vw, 40px) clamp(40px, 5.3vw, 64px)"
            : "clamp(44px, 6.3vw, 76px) clamp(16px, 3.4vw, 40px)",
          gap: isHero ? 32 : 38,
        }}
      >
        {(() => {
          const list = prepare(s.items);
          const CENTERED = new Set(["badge", "video", "cta"]);
          return list.map((b, i) => (
            <div
              key={i}
              className={`w-full ${CENTERED.has(b.k) ? "flex justify-center" : ""}`}
              style={spacingFor(b, list[i - 1], i === 0, i === list.length - 1)}
            >
              <BlockView b={b} />
            </div>
          ));
        })()}
        <span className="block w-full clear-both" />
      </div>
    </section>
  );
}

export default function SalesPage({ embedded = false }: { embedded?: boolean }) {
  return (
    <div className="min-h-screen w-full antialiased" style={{ background: "#f7fbff" }}>
      <div className="mx-auto w-full max-w-[1200px]" style={{ background: "#f7fbff" }}>
        {salesSections.map((s, i) => (
          <SectionView key={i} s={s} />
        ))}
      </div>
      {!embedded && <LiveNotifications location="sales" />}
    </div>
  );
}
