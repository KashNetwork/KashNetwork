import { SIGNATURE, type SequenceStep } from '@/content/email-sequence';

export const FOOTER_ADDRESS = 'Kash Network LLC, 539 W. Commerce St Suite #1019, Dallas, TX 75208';

const esc = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
const escAttr = (s: string) => esc(s).replace(/"/g, '&quot;');

const LINK_TOKEN = /\{\{link:(.+?)\}\}/g;

/** Inline markup on already-escaped text: links, **bold**, _italic_. */
function inlineHtml(escaped: string, link: string): string {
  return escaped
    .replace(
      LINK_TOKEN,
      (_m, label: string) =>
        `<a href="${escAttr(link)}" style="color:#1a56db;font-weight:600;text-decoration:underline;">${label}</a>`,
    )
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/(^|[\s(])_(.+?)_(?=[\s).,!?:]|$)/g, '$1<em>$2</em>');
}

function inlineText(text: string, link: string): string {
  return text
    .replace(LINK_TOKEN, (_m, label: string) => `${label}: ${link}`)
    .replace(/\*\*(.+?)\*\*/g, '$1')
    .replace(/(^|[\s(])_(.+?)_(?=[\s).,!?:]|$)/g, '$1$2');
}

export interface RenderedEmail {
  subject: string;
  text: string;
  html: string;
}

/**
 * Renders one sequence email. `link` is this lead's credited affiliate's own
 * sales-page URL; in the HTML it only ever appears behind the link text
 * ({{link:...}}), never as a raw URL.
 */
export function renderSequenceEmail(step: SequenceStep, link: string, unsubscribeUrl: string): RenderedEmail {
  const blocks = step.body.split(/\n\n+/).map((b) => b.trim()).filter(Boolean);

  const htmlBlocks = blocks.map((b) => {
    const lines = b.split('\n');
    if (lines.every((l) => /^\d+\.\s/.test(l))) {
      const items = lines.map((l) => `<li style="margin:0 0 6px;">${inlineHtml(esc(l.replace(/^\d+\.\s/, '')), link)}</li>`).join('');
      return `<ol style="margin:0 0 16px;padding-left:22px;">${items}</ol>`;
    }
    return `<p style="margin:0 0 16px;">${inlineHtml(esc(b), link).replace(/\n/g, '<br>')}</p>`;
  });

  const html =
    `<div style="display:none;max-height:0;overflow:hidden;opacity:0;color:transparent;">${esc(step.preview)}</div>` +
    `<div style="font-family:Arial,Helvetica,sans-serif;font-size:16px;line-height:1.6;color:#0f172a;max-width:600px;">` +
    htmlBlocks.join('') +
    `<p style="margin:0 0 4px;">${esc(step.signoff)}</p>` +
    `<p style="margin:0 0 24px;"><strong>${esc(SIGNATURE)}</strong></p>` +
    `<p style="margin:0;padding-top:14px;border-top:1px solid #e2e8f0;font-size:12px;line-height:1.5;color:#64748b;">` +
    `${esc(FOOTER_ADDRESS)}<br>Don't want these emails? <a href="${escAttr(unsubscribeUrl)}" style="color:#64748b;">Unsubscribe</a></p>` +
    `</div>`;

  const text =
    blocks.map((b) => inlineText(b, link)).join('\n\n') +
    `\n\n${step.signoff}\n${SIGNATURE}\n\n--\n${FOOTER_ADDRESS}\nDon't want these emails? Unsubscribe: ${unsubscribeUrl}`;

  return { subject: step.subject, text, html };
}
