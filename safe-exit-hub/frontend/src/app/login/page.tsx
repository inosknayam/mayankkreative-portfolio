'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth';

export default function LoginPage() {
  const { sendOtp, login } = useAuth();
  const router = useRouter();
  const [phone, setPhone] = useState('+15550001001');
  const [code, setCode] = useState('');
  const [step, setStep] = useState<'phone' | 'otp'>('phone');
  const [channel, setChannel] = useState<'sms' | 'whatsapp'>('sms');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const handleSend = async () => {
    setError('');
    setBusy(true);
    try {
      await sendOtp(phone, channel);
      setStep('otp');
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to send OTP');
    } finally {
      setBusy(false);
    }
  };

  const handleVerify = async () => {
    setError('');
    setBusy(true);
    try {
      await login(phone, code);
      router.push('/dashboard');
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Invalid OTP');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="card w-full max-w-md p-8 space-y-6">
        <div className="text-center space-y-2">
          <h1 className="text-2xl font-bold text-ink">Staff Login</h1>
          <p className="text-sm text-ink-muted">
            OTP via SMS or WhatsApp — no hardcoded accounts
          </p>
        </div>

        {error && (
          <p className="text-sm text-center px-3 py-2 rounded-lg badge-red">{error}</p>
        )}

        <label className="block space-y-1">
          <span className="text-sm font-medium">Phone number</span>
          <input
            className="input-field"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="+15550001001"
            disabled={step === 'otp'}
          />
        </label>

        {step === 'phone' && (
          <>
            <div className="flex gap-2">
              {(['sms', 'whatsapp'] as const).map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setChannel(c)}
                  className={`flex-1 py-2 rounded-lg text-sm font-medium ${
                    channel === c ? 'badge-purple' : 'badge-blue'
                  }`}
                >
                  {c === 'sms' ? 'SMS' : 'WhatsApp'}
                </button>
              ))}
            </div>
            <button type="button" className="btn-primary w-full" disabled={busy} onClick={handleSend}>
              Send OTP
            </button>
          </>
        )}

        {step === 'otp' && (
          <>
            <label className="block space-y-1">
              <span className="text-sm font-medium">6-digit code</span>
              <input
                className="input-field"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                placeholder="123456"
                maxLength={6}
              />
            </label>
            <p className="text-xs text-ink-muted text-center">
              Dev mode: check backend console for the OTP code
            </p>
            <button type="button" className="btn-primary w-full" disabled={busy} onClick={handleVerify}>
              Verify & Sign In
            </button>
            <button
              type="button"
              className="w-full text-sm text-ink-muted underline"
              onClick={() => setStep('phone')}
            >
              Change phone number
            </button>
          </>
        )}
      </div>
    </div>
  );
}
