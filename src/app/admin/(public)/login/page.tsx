import Link from "next/link";
import type { Metadata } from "next";
import { Suspense } from "react";
import { ArrowLeft } from "lucide-react";
import { login } from "@/features/admin/auth-actions";
import { PasswordField } from "@/features/admin/password-field";
import { BrandMark } from "@/features/admin/shell";
import { SubmitButton } from "@/features/admin/submit-button";
import { Notice } from "@/features/admin/ui";

export const instant = false;
export const metadata: Metadata = { title: "Sign in" };

function LoginShell({ children }: { children: React.ReactNode }) {
  return <main id="main" className="admin-login">
    <div className="admin-login-comb">
      <div className="admin-login-wordmark"><BrandMark /><p className="admin-login-wordmark-text">Honey by Abdul Sami</p></div>
    </div>
    <div className="admin-login-pane">{children}</div>
  </main>;
}

async function LoginForm({ searchParams }: { searchParams: Promise<{ error?: string }> }) {
  const { error } = await searchParams;
  return <div className="admin-login-card">
    <div className="admin-stack-sm">
      <p className="admin-eyebrow">Honey by Abdul Sami · Admin</p>
      <h1>Welcome back</h1>
      <p className="admin-muted">Sign in to manage your store.</p>
    </div>
    {error && <Notice tone="error">{error === "locked" ? "Too many attempts. Please wait 15 minutes and try again." : "Email or password is incorrect."}</Notice>}
    <form action={login} className="admin-form">
      <div className="admin-field"><label className="admin-label" htmlFor="login-email">Email address</label><input id="login-email" name="email" type="email" autoComplete="username" required /></div>
      <div className="admin-field"><label className="admin-label" htmlFor="login-password">Password</label><PasswordField id="login-password" /></div>
      <SubmitButton block pendingLabel="Signing in…">Sign in</SubmitButton>
    </form>
    <Link className="admin-button quiet admin-login-back" href="/"><ArrowLeft aria-hidden="true" />Back to store</Link>
  </div>;
}

export default function LoginPage({ searchParams }: { searchParams: Promise<{ error?: string }> }) {
  return <LoginShell>
    <Suspense fallback={<div className="admin-login-card" role="status"><span className="sr-only">Loading…</span></div>}><LoginForm searchParams={searchParams} /></Suspense>
  </LoginShell>;
}
