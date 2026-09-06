import type { ReactNode } from "react";
import highlightAsset from "@/assets/yellow-highlight.png.asset.json";

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

/** Yellow highlighter smear painted behind the text using the uploaded marker PNG. */
export function YellowSmear({ children }: { children: ReactNode }) {
  return (
    <span className="relative inline-block whitespace-nowrap">
      <img
        src={highlightAsset.url}
        alt=""
        aria-hidden="true"
        className="pointer-events-none absolute z-0 select-none"
        style={{
          left: "-7%",
          top: "-0.78em",
          /* em-based so the smear scales with the headline on small screens
             (6.9em x 2.75em === 469px x 187px at the desktop 68px headline) */
          width: "6.9em",
          maxWidth: "none",
          height: "2.75em",
          objectFit: "fill",
        }}
      />
      <span className="relative z-[1]">{children}</span>
    </span>
  );
}
