'use client';

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Button, Card, Field, Input } from '@/components/ui';
import { api, ApiError } from '@/lib/api';
import { useAuth } from '@/lib/auth';

export function Login() {
  const { login } = useAuth();
  const router = useRouter();
  const params = useSearchParams();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(
    params.get('link') === 'invalid' ? 'That sign-in link has expired. Enter your email below to get a new one.' : null,
  );
  const [info, setInfo] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setInfo(null);
    setBusy(true);
    try {
      await login(email.trim(), password);
      router.push('/app');
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Login failed.');
    } finally {
      setBusy(false);
    }
  }

  async function emailLink() {
    setError(null);
    setInfo(null);
    if (!email.trim()) {
      setError('Enter your email above first.');
      return;
    }
    setBusy(true);
    try {
      await api.requestSignInLink(email.trim());
      setInfo('If that email belongs to a member, a sign-in link is on its way. It works for 30 minutes.');
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Could not send the link. Try again.');
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="mx-auto max-w-sm px-4 py-16">
      <h1 className="mb-6 text-center text-xl font-extrabold text-foreground">
        Log in to Kash Network
      </h1>
      <Card>
        <form onSubmit={submit} className="space-y-4">
          <Field label="Email">
            <Input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} />
          </Field>
          <Field label="Password">
            <Input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </Field>
          {error && <p className="text-sm text-red-600">{error}</p>}
          {info && <p className="text-sm text-emerald-700">{info}</p>}
          <Button type="submit" disabled={busy} className="w-full">
            {busy ? 'Please wait…' : 'Log in'}
          </Button>
        </form>
        <button
          type="button"
          onClick={emailLink}
          disabled={busy}
          className="mt-4 w-full text-center text-sm font-medium text-[#2A7BEA] hover:underline disabled:opacity-50"
        >
          Forgot your password? Email me a sign-in link
        </button>
      </Card>
      <p className="mt-4 text-center text-xs text-slate-500">
        Free accounts don't use a password — you're logged in automatically.
      </p>
    </div>
  );
}
