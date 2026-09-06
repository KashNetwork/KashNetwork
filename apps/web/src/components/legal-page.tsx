import { Link } from "react-router-dom";
import type { LegalDoc } from "@/content/legal";
import { SiteNav, SiteFooter, ink, bodyText, softText, hairline, tint, brandBlue } from "@/components/site-chrome";

const H2_CLASS = "font-display font-bold text-[24px] mt-[56px] first:mt-0";
const H3_CLASS = "font-display font-bold text-[24px] mt-[40px] first:mt-0";
const HEADING_STYLE = { color: ink, letterSpacing: "-0.02em", lineHeight: "1.65" } as const;
const BODY_CLASS = "mt-[18px] text-[16px]";
const BODY_STYLE = { color: bodyText, lineHeight: "1.65" } as const;

function renderBlocks(doc: LegalDoc) {
  const out: React.ReactNode[] = [];
  let bullets: string[] = [];

  const flush = (key: string) => {
    if (!bullets.length) return;
    out.push(
      <ul key={`ul-${key}`} className="mt-[18px] pl-0 list-none text-[16px]" style={BODY_STYLE}>
        {bullets.map((b, i) => (
          <li key={i} className="mt-[18px] first:mt-0">{`• ${b}`}</li>
        ))}
      </ul>,


    );
    bullets = [];
  };

  // Some source paragraphs pack numbered headings and their body into one
  // string ("11.1 Term    This Agreement shall...", or even a whole
  // "6. Use of Information    6.1 Utilization of Data    The data..."). Split
  // them apart so headings render as headings, matching the reference pages.
  const H2 = /^\d+\.\s+\S[\s\S]{0,70}$/;
  const H3 = /^\d+\.\d+\s+\S[\s\S]{0,70}$/;
  const blocks = doc.blocks.flatMap((b) => {
    if (b.t !== "p") return [b];
    const segments = b.x.split(/\s{2,}/).map((s) => s.trim()).filter(Boolean);
    if (segments.length < 2 || !segments.some((s) => H2.test(s) || H3.test(s))) return [b];
    const out: { t: "h2" | "h3" | "p"; x: string }[] = [];
    segments.forEach((s) => {
      if (H2.test(s)) out.push({ t: "h2", x: s });
      else if (H3.test(s)) out.push({ t: "h3", x: s });
      else if (out.length && out[out.length - 1].t === "p")
        out[out.length - 1].x = `${out[out.length - 1].x} ${s}`;
      else out.push({ t: "p", x: s });
    });
    return out;
  });


  blocks.forEach((b, i) => {
    if (b.t === "li") {
      bullets.push(b.x);
      return;
    }
    flush(String(i));
    if (b.t === "h2") {
      out.push(
        <h2 key={i} className={H2_CLASS} style={HEADING_STYLE}>
          {b.x}
        </h2>,
      );
    } else if (b.t === "h3") {
      out.push(
        <h3 key={i} className={H3_CLASS} style={HEADING_STYLE}>
          {b.x}
        </h3>,
      );
    } else {
      out.push(
        <p key={i} className={BODY_CLASS} style={BODY_STYLE}>
          {b.x}
        </p>,
      );
    }
  });
  flush("end");
  return out;
}

export function LegalPage({ doc }: { doc: LegalDoc }) {
  return (
    <div style={{ background: "#FFFFFF", color: ink }} className="min-h-screen font-sans">
      <SiteNav />

      <div className="mx-auto max-w-[1440px] px-0">
        <header style={{ background: tint, borderBottom: `1px solid ${hairline}` }}>
          <div className="mx-auto max-w-[810px] px-5 py-16 sm:py-20">
            <Link
              to="/"
              className="text-[13px] font-bold uppercase tracking-[0.12em] hover:opacity-70 transition-opacity"
              style={{ color: brandBlue }}
            >
              ← Back to Kash Network
            </Link>
            <h1
              className="font-display font-extrabold text-[clamp(20px,7vw,40px)] sm:text-[52px] mt-5 whitespace-nowrap sm:whitespace-normal"
              style={{ color: ink, letterSpacing: "-0.04em", lineHeight: "1" }}
            >
              {doc.title}
            </h1>
            <p className="mt-5 text-[15px]" style={{ color: softText, lineHeight: "1.4" }}>
              {doc.effective}
            </p>
            <p className="mt-5 text-[18px]" style={{ color: bodyText, lineHeight: "1.45" }}>
              {doc.lede}
            </p>
          </div>
        </header>
      </div>

      <main className="mx-auto max-w-[810px] px-5 py-16 sm:py-20">{renderBlocks(doc)}</main>

      <SiteFooter />
    </div>
  );
}
