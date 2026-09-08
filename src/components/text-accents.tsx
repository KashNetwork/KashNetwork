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
 * Hand-drawn style yellow highlighter behind the text. Same marker look as the
 * landing-page headline: a slightly skewed, rounded band of solid marker yellow
 * that multiplies over the ink so the letters stay readable.
 */
export function YellowSmear({ children }: { children: ReactNode }) {
  return (
    <span className="relative inline-block whitespace-nowrap" style={{ color: "rgb(4, 24, 78)" }}>
      <span
        aria-hidden="true"
        className="absolute -inset-x-2 top-[16%] bottom-[16%] -z-0 -rotate-[1.5deg] rounded-[6px]"
        style={{ background: "#FFE24D" }}
      />
      <span className="relative z-[1]">{children}</span>
    </span>
  );
}
