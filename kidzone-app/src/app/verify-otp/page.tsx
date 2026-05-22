"use client";

import { useState, type FormEvent, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import toast from "react-hot-toast";
import { FiArrowLeft, FiKey } from "react-icons/fi";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";

function VerifyOtpInner() {
  const router       = useRouter();
  const searchParams = useSearchParams();
  const phone        = searchParams.get("phone") ?? "";

  const [otp,     setOtp]     = useState("");
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);

  async function handleVerify(e: FormEvent) {
    e.preventDefault();
    if (otp.trim().length < 4) return toast.error("Enter the full OTP.");
    setLoading(true);
    try {
      const res = await fetch("/api/auth/verify-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone_number: phone, otp_code: otp.trim() }),
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error ?? "Incorrect OTP. Please try again.");
        return;
      }
      toast.success(`Welcome, ${data.data.full_name}!`);
      router.push("/dashboard");
    } catch {
      toast.error("Network error.");
    } finally {
      setLoading(false);
    }
  }

  async function handleResend() {
    setResending(true);
    try {
      const res = await fetch("/api/auth/send-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone_number: phone }),
      });
      const data = await res.json();
      if (!res.ok) { toast.error(data.error ?? "Could not resend OTP."); return; }
      toast.success("New OTP sent!");
      setOtp("");
    } catch {
      toast.error("Network error.");
    } finally {
      setResending(false);
    }
  }

  return (
    <main className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[var(--color-blue-soft)] via-[var(--color-purple-soft)] to-[var(--color-pink-soft)] p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[var(--color-purple-mid)] to-[var(--color-blue-mid)] flex items-center justify-center text-white text-2xl font-bold mx-auto mb-4 shadow-lg">
            K
          </div>
          <h1 className="text-3xl font-bold text-[var(--color-text)]">KidZone</h1>
          <p className="text-[var(--color-muted)] mt-1">Verify Your Identity</p>
        </div>

        <div className="bg-white/90 backdrop-blur-md rounded-3xl shadow-xl border border-[var(--color-border)] p-8">
          <button
            onClick={() => router.push("/")}
            className="flex items-center gap-1 text-sm text-[var(--color-muted)] hover:text-[var(--color-text)] mb-6 transition-colors"
          >
            <FiArrowLeft size={16} /> Back to Login
          </button>

          <div className="flex items-center gap-2 mb-4">
            <div className="w-8 h-8 rounded-xl bg-[var(--color-yellow-soft)] flex items-center justify-center">
              <FiKey className="text-[var(--color-yellow-accent)]" size={16} />
            </div>
            <h2 className="text-xl font-semibold text-[var(--color-text)]">Enter OTP</h2>
          </div>

          <p className="text-sm text-[var(--color-muted)] mb-6">
            We sent a verification code to{" "}
            <span className="font-medium text-[var(--color-text)]">{phone}</span>.
            The code expires in 5 minutes.
          </p>

          <form onSubmit={handleVerify} className="space-y-5">
            <Input
              label="One-Time Password"
              type="text"
              inputMode="numeric"
              pattern="[0-9]*"
              maxLength={10}
              placeholder="Enter your OTP"
              value={otp}
              onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
              icon={<FiKey size={16} />}
              required
            />

            <Button type="submit" loading={loading} className="w-full" size="lg">
              Verify & Log In
            </Button>
          </form>

          <div className="text-center mt-5">
            <button
              onClick={handleResend}
              disabled={resending}
              className="text-sm text-[var(--color-purple-accent)] hover:underline disabled:opacity-50"
            >
              {resending ? "Resending..." : "Didn't receive it? Resend OTP"}
            </button>
          </div>
        </div>
      </div>
    </main>
  );
}

export default function VerifyOtpPage() {
  return (
    <Suspense>
      <VerifyOtpInner />
    </Suspense>
  );
}
