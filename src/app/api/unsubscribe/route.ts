import { NextResponse } from 'next/server';
import { getDb } from '@/server/db';
import { profileIdFromToken, unsubscribeProfile } from '@/server/services/unsubscribe';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const page = (title: string, body: string, status = 200) =>
  new NextResponse(
    `<!doctype html><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${title}</title>` +
      `<body style="font-family:system-ui,sans-serif;max-width:480px;margin:15vh auto;padding:0 20px;color:#0f172a;text-align:center">` +
      `<h1 style="font-size:22px">${title}</h1><p style="color:#475569">${body}</p></body>`,
    { status, headers: { 'content-type': 'text/html; charset=utf-8' } },
  );

async function run(req: Request) {
  const token = new URL(req.url).searchParams.get('t') ?? '';
  const id = profileIdFromToken(token);
  if (!id || !(await unsubscribeProfile(await getDb(), id))) {
    return { ok: false as const };
  }
  return { ok: true as const };
}

/** GET = the link in the email body. */
export async function GET(req: Request) {
  const r = await run(req);
  return r.ok
    ? page("You're unsubscribed", "You won't get any more emails from us. Sorry to see you go.")
    : page('Link not valid', 'This unsubscribe link is invalid or has expired. Email support@kash.network and we will remove you.', 400);
}

/** POST = Gmail/Apple one-click unsubscribe (List-Unsubscribe-Post). */
export async function POST(req: Request) {
  const r = await run(req);
  return NextResponse.json({ ok: r.ok }, { status: r.ok ? 200 : 400 });
}
