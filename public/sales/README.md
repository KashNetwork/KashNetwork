# Sales page images

Drop the real client photos here with these EXACT filenames. They are referenced
by `src/screens/SalesPage.tsx` (`IMAGES` map) and appear on `/activate`.

| File            | Where it shows on the page                                    | Client attachment |
|-----------------|--------------------------------------------------------------|-------------------|
| `founder.jpg`   | Round portrait next to "So I built a 'new system'..."        | Harley Carter photo |
| `results-1.png` | First wide "commission results" screenshot (upper page)      | Explodely $100 commissions screenshot |
| `results-2.png` | Second wide "commission results" screenshot (mid page)       | Gmail inbox / replies screenshot |
| `closing.jpg`   | Tall portrait in the closing section                         | Harley Carter photo (can reuse founder) |

Optional testimonial headshots (only if we wire the testimonial section):
`testimonial-jehoyakim.png`, `testimonial-galib.png`, `testimonial-tay.png`

After adding files, redeploy:
`npx vercel deploy --prod --yes --token <token>`
