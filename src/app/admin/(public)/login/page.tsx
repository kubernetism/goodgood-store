import { Suspense } from "react";
import { login } from "@/features/admin/auth-actions";

async function LoginForm({ searchParams }: { searchParams: Promise<{ error?: string }> }) {
  const { error } = await searchParams;
  return (
    <main id="main" className="admin-login">
      <div className="admin-login-card">
        <p className="admin-eyebrow">ABDUL SAMI HONEY</p>
        <h1>Welcome back</h1>
        <p>Sign in to manage your store.</p>
        {error && <p className="admin-message admin-error" role="alert">{error === "locked" ? "Too many attempts. Please wait 15 minutes and try again." : "Email or password is incorrect."}</p>}
        <form action={login} className="admin-form">
          <label>Email address<input name="email" type="email" autoComplete="username" required /></label>
          <label>Password<input name="password" type="password" autoComplete="current-password" required /></label>
          <button className="admin-button" type="submit">Sign in</button>
        </form>
      </div>
    </main>
  );
}

export const instant = false;

export default function LoginPage({ searchParams }: { searchParams: Promise<{ error?: string }> }) {
  return <Suspense fallback={<main className="admin-login">Loading…</main>}><LoginForm searchParams={searchParams} /></Suspense>;
}
