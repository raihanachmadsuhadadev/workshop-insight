"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AlertCircle, Loader2, LockKeyhole, Mail, Wrench } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/context/auth-context";

export default function LoginPage() {
  const router = useRouter();
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setIsSubmitting(true);

    try {
      const user = await login(email, password);
      router.replace(user.role === "owner" ? "/owner/dashboard" : "/admin/dashboard");
    } catch (loginError) {
      setError(loginError instanceof Error ? loginError.message : "Login gagal.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <main className="grid min-h-screen bg-slate-950 text-white lg:grid-cols-[1.05fr_0.95fr]">
      <section className="relative flex flex-col justify-between overflow-hidden px-6 py-8 lg:px-12">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(249,115,22,0.12),transparent_32%),linear-gradient(135deg,#0f172a_0%,#111827_58%,#1e293b_100%)]" />
        <div className="relative">
          <Link href="/" className="flex w-fit items-center gap-3">
            <span className="neo-button neo-button-primary flex h-11 w-11 items-center justify-center">
              <Wrench className="h-5 w-5" aria-hidden="true" />
            </span>
            <span className="text-lg font-bold">Workshop Insight</span>
          </Link>
        </div>

        <div className="relative my-12 max-w-2xl">
          <Badge tone="orange">Dashboard Bengkel</Badge>
          <h1 className="mt-5 text-4xl font-bold leading-tight md:text-5xl">
            Masuk ke sistem transaksi dan analisis bengkel.
          </h1>
          <p className="mt-5 text-base leading-8 text-slate-300">
            Masuk untuk mengelola transaksi, stok, laporan, dan analisis bengkel.
          </p>
        </div>

        <p className="relative text-sm text-slate-400">© 2026 Workshop Insight</p>
      </section>

      <section className="neo-page flex items-center justify-center px-4 py-10 text-slate-900">
        <div className="neo-card w-full max-w-md p-6">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-orange-600">
              Login
            </p>
            <h2 className="mt-2 text-2xl font-bold text-slate-950">Masuk Dashboard</h2>
            <p className="mt-2 text-sm leading-6 text-slate-500">
              Gunakan akun yang telah terdaftar untuk melanjutkan ke dashboard.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="mt-6 space-y-4">
            {error ? (
              <div className="flex gap-2 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">
                <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
                <span>{error}</span>
              </div>
            ) : null}

            <label className="block">
              <span className="mb-2 flex items-center gap-2 text-sm font-semibold text-slate-700">
                <Mail className="h-4 w-4 text-orange-500" aria-hidden="true" />
                Email
              </span>
              <Input
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder="nama@email.com"
                required
              />
            </label>

            <label className="block">
              <span className="mb-2 flex items-center gap-2 text-sm font-semibold text-slate-700">
                <LockKeyhole className="h-4 w-4 text-orange-500" aria-hidden="true" />
                Password
              </span>
              <Input
                type="password"
                placeholder="Masukkan password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                required
              />
            </label>

            <Button type="submit" className="w-full" disabled={isSubmitting}>
              {isSubmitting ? (
                <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
              ) : null}
              {isSubmitting ? "Memproses..." : "Masuk"}
            </Button>
          </form>
        </div>
      </section>
    </main>
  );
}
