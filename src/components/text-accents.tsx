import type { ReactNode } from "react";

/** Hand-drawn style red underline beneath the text. */
export function RedUnderline({ children }: { children: ReactNode }) {
  return (
    <span className="relative inline-block whitespace-nowrap">
      <span className="relative z-[1]">{children}</span>
      <svg
        aria-hidden="true"
        viewBox="0 0 200 14"
        preserveAspectRatio="none"
        className="pointer-events-none absolute left-[-2%] bottom-[-0.22em] h-[12px] w-[104%]"
      >
        <path
          d="M2,7 L198,7"
          fill="none"
          stroke="#E5162B"
          strokeWidth="6.2"
          strokeLinecap="round"
        />
      </svg>
    </span>
  );
}

/**
 * Hand-drawn yellow highlighter behind the wrapped words — a bold, near-opaque
 * felt-tip marker swipe (matches the client's reference image), edges roughened
 * by an SVG turbulence filter, ends uneven and lifted. Hugs the words tightly
 * so it never bleeds into the text that follows.
 */
export function YellowSmear({ children }: { children: ReactNode }) {
  return (
    <span
      className="relative inline-block whitespace-nowrap"
      style={{ color: "rgb(4, 24, 78)" }}
    >
      <svg aria-hidden="true" width="0" height="0" className="absolute">
        <filter id="kn-smear" x="-15%" y="-45%" width="130%" height="190%">
          <feTurbulence
            type="fractalNoise"
            baseFrequency="0.007 0.1"
            numOctaves="2"
            seed="6"
            result="n"
          />
          <feDisplacementMap
            in="SourceGraphic"
            in2="n"
            scale="7"
            xChannelSelector="R"
            yChannelSelector="G"
          />
        </filter>
      </svg>
      <span
        aria-hidden="true"
        className="pointer-events-none absolute"
        style={{
          left: "-0.22em",
          right: "-0.04em",
          top: "0.1em",
          bottom: "0.1em",
          zIndex: 0,
          background: "#FFD400",
          opacity: 0.92,
          mixBlendMode: "multiply",
          transform: "rotate(-1.4deg)",
          borderRadius: "48% 32% 44% 56% / 62% 54% 50% 44%",
          filter: "url(#kn-smear)",
        }}
      />
      <span className="relative z-[1]">{children}</span>
    </span>
  );
}
