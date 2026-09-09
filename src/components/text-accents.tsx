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
 * Hand-drawn yellow highlighter behind the text — a felt-tip marker swipe:
 * slanted, lifted ends, a slightly wavy body, and a second lighter pass, all
 * multiplied over the page so the ink stays readable. Hugs the wrapped words
 * tightly so it never bleeds into the text that follows.
 */
export function YellowSmear({ children }: { children: ReactNode }) {
  return (
    <span
      className="relative inline-block whitespace-nowrap"
      style={{ color: "rgb(4, 24, 78)" }}
    >
      <svg
        aria-hidden="true"
        viewBox="0 0 120 32"
        preserveAspectRatio="none"
        className="pointer-events-none absolute left-[-1.5%] top-[9%] -z-0 h-[84%] w-[103%] -rotate-[1.8deg]"
        style={{ mixBlendMode: "multiply" }}
      >
        {/* main marker pass */}
        <path
          d="M4 7.5C6 4.2 9.5 3.4 15 3.1c14-.9 78-1.6 97 .3 4.6.5 4.4 4.6 4 9.2-.5 6-.2 12.6-4.4 14.9-3.6 2-40 2.2-63 2.4-19 .2-42 .5-45-2.6-2.4-2.4-2-8.6-1.6-13 .3-3.2-.2-5.5 2.6-6.9Z"
          fill="#FFE24D"
        />
        {/* lighter overlap streak */}
        <path
          d="M9 20c18 3 74 2.6 100 .8 6-.4 9-1.2 9.4 2 .4 3-2.6 5.3-9 5.7-25 1.6-78 1.8-96-.4-5-.6-8-1.1-8.4-4-.3-2.2 1-3.6 4-4.1Z"
          fill="#FFEF9C"
        />
      </svg>
      <span className="relative z-[1]">{children}</span>
    </span>
  );
}
