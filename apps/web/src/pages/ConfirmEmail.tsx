import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Card } from '../components/ui';
import { useAuth } from '../lib/auth';

export function ConfirmEmail() {
  const [params] = useSearchParams();
  const { refresh } = useAuth();
  const [status, setStatus] = useState<'working' | 'ok' | 'error'>('working');
  const [detail, setDetail] = useState('');

  useEffect(() => {
    const token = params.get('token');
    if (!token) {
      setStatus('error');
      setDetail('Missing token.');
      return;
    }
    fetch(`/api/auth/email-change/confirm?token=${encodeURIComponent(token)}`, {
      credentials: 'include',
    })
      .then(async (r) => {
        const body = await r.json().catch(() => null);
        if (r.ok) {
          setStatus('ok');
          setDetail(body?.email ?? '');
          await refresh();
        } else {
          setStatus('error');
          setDetail(body?.message ?? 'This link is invalid or expired.');
        }
      })
      .catch(() => {
        setStatus('error');
        setDetail('Network error.');
      });
  }, [params, refresh]);

  return (
    <div className="mx-auto max-w-sm px-4 py-16">
      <Card className="text-center">
        {status === 'working' && <p className="text-sm text-slate-500">Confirming…</p>}
        {status === 'ok' && (
          <p className="text-sm text-ink">Your email is now {detail}. You can close this tab.</p>
        )}
        {status === 'error' && <p className="text-sm text-red-600">{detail}</p>}
      </Card>
    </div>
  );
}
