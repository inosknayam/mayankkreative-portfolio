"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { FiPhone, FiShield } from "react-icons/fi";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";

export default function LoginPage() {
  const router = useRouter();
  const [phone, setPhone] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSendOtp(e: FormEvent) {
    e.preventDefault();
    if (!phone.trim()) return toast.error("Enter your phone number.");

    // Normalise: prepend + if missing
    const normalised = phone.startsWith("+") ? phone : `+${phone}`;

    setLoading(true);
    try {
      const res = await fetch("/api/auth/send-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone_number: normalised }),
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error ?? "Failed to send OTP.");
        return;
      }
      toast.success("OTP sent! Check your SMS / WhatsApp.");
      router.push(`/verify-otp?phone=${encodeURIComponent(normalised)}`);
    } catch {
      toast.error("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[var(--color-purple-soft)] via-[var(--color-blue-soft)] to-[var(--color-pink-soft)] p-4">
      <div className="w-full max-w-md">
        {/* Logo / Brand */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[var(--color-purple-mid)] to-[var(--color-blue-mid)] flex items-center justify-center text-white text-2xl font-bold mx-auto mb-4 shadow-lg">
            K
          </div>
          <h1 className="text-3xl font-bold text-[var(--color-text)]">KidZone</h1>
          <p className="text-[var(--color-muted)] mt-1">Staff Portal</p>
        </div>

        <div className="bg-white/90 backdrop-blur-md rounded-3xl shadow-xl border border-[var(--color-border)] p-8">
          <div className="flex items-center gap-2 mb-6">
            <div className="w-8 h-8 rounded-xl bg-[var(--color-purple-soft)] flex items-center justify-center">
              <FiShield className="text-[var(--color-purple-accent)]" size={16} />
            </div>
            <h2 className="text-xl font-semibold text-[var(--color-text)]">Staff Login</h2>
          </div>

          <p className="text-sm text-[var(--color-muted)] mb-6">
            Enter your registered phone number. A one-time code will be sent via SMS or WhatsApp.
          </p>

          <form onSubmit={handleSendOtp} className="space-y-5">
            <Input
              label="Phone Number (E.164 format)"
              type="tel"
              placeholder="+91XXXXXXXXXX"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              icon={<FiPhone size={16} />}
              required
            />

            <Button
              type="submit"
              loading={loading}
              className="w-full"
              size="lg"
            >
              Send OTP
            </Button>
          </form>

          <p className="text-center text-xs text-[var(--color-muted)] mt-6">
            Only registered KidZone staff can log in.
            <br />
            Contact your Branch Manager to get access.
          </p>
        </div>

        {/* Colour accent dots */}
        <div className="flex justify-center gap-2 mt-6">
          {["bg-[var(--color-blue-mid)]","bg-[var(--color-pink-mid)]","bg-[var(--color-yellow-mid)]","bg-[var(--color-purple-mid)]","bg-[var(--color-red-mid)]"].map((c,i) => (
            <div key={i} className={`w-2 h-2 rounded-full ${c} opacity-60`} />
          ))}
        </div>
      </div>
    </main>
  );
}
