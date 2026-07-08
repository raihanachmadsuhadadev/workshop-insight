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
  const [email, setEmail] = useState("admin@starmotor.test");
  const [password, setPassword] = useState("password");
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
      <section className="flex flex-col justify-between px-6 py-8 lg:px-12">
        <Link href="/" className="flex w-fit items-center gap-3">
          <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-orange-500">
            <Wrench className="h-5 w-5" aria-hidden="true" />
          </span>
          <span className="text-lg font-bold">Star Motor Insight</span>
        </Link>

        <div className="my-12 max-w-2xl">
          <Badge tone="orange">Dashboard Bengkel</Badge>
          <h1 className="mt-5 text-4xl font-bold leading-tight md:text-5xl">
            Masuk ke sistem transaksi dan analisis Star Motor.
          </h1>
          <p className="mt-5 text-base leading-8 text-slate-300">
            Login menggunakan Laravel Sanctum untuk masuk ke dashboard sesuai role admin atau
            owner.
          </p>
        </div>

        <p className="text-sm text-slate-500">(c) 2026 Star Motor Insight</p>
      </section>

      <section className="flex items-center justify-center bg-slate-50 px-4 py-10 text-slate-900">
        <div className="w-full max-w-md rounded-xl border border-slate-200 bg-white p-6 shadow-xl shadow-slate-950/10">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-orange-600">
              Login
            </p>
            <h2 className="mt-2 text-2xl font-bold text-slate-950">Masuk Dashboard</h2>
            <p className="mt-2 text-sm leading-6 text-slate-500">
              Gunakan akun demo untuk melihat tampilan role admin atau owner.
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
                placeholder="admin@starmotor.test"
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
                placeholder="password"
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

          <div className="mt-6 rounded-xl bg-slate-50 p-4 text-xs leading-6 text-slate-500">
            <p className="font-semibold text-slate-700">Demo akun</p>
            <p>Admin: admin@starmotor.test / password</p>
            <p>Owner: owner@starmotor.test / password</p>
          </div>
        </div>
      </section>
    </main>
  );
}
