"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">("idle");
  const [showEmail, setShowEmail] = useState(false);

  async function handleGoogle() {
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: `${window.location.origin}/` },
    });
  }

  async function handleEmail() {
    if (!email.trim()) return;
    setStatus("sending");
    const { error } = await supabase.auth.signInWithOtp({
      email: email.trim(),
      options: { emailRedirectTo: `${window.location.origin}/` },
    });
    setStatus(error ? "error" : "sent");
  }

  return (
    <main className="min-h-screen bg-cream px-6 py-16">
      <div className="mx-auto max-w-md">
        {/* Intro */}
        <p className="mb-3 text-[10px] uppercase tracking-[0.2em] text-stone">
          A shopping list
        </p>
        <h1 className="font-serif text-4xl leading-[1.05] text-ink sm:text-5xl">
          Plan, shop, cook.
        </h1>

        <p className="mt-6 text-[15px] leading-relaxed text-ink-soft">
          A calm, considered grocery list that turns recipes into shopping.
        </p>

        {/* Features */}
        <ul className="mt-8 space-y-3">
          <li className="flex gap-3 text-[15px] text-ink">
            <span className="font-serif italic text-stone">01</span>
            <span>Import a recipe and it becomes a tidy, aisle-sorted list.</span>
          </li>
          <li className="flex gap-3 text-[15px] text-ink">
            <span className="font-serif italic text-stone">02</span>
            <span>Save lists to reuse, so you can pull up “weekly groceries” any time.</span>
          </li>
          <li className="flex gap-3 text-[15px] text-ink">
            <span className="font-serif italic text-stone">03</span>
            <span>Check items off as you shop to track what’s left.</span>
          </li>
        </ul>

        {/* Recommendation */}
        <p className="mt-8 border-l-2 border-hairline pl-4 text-[14px] italic leading-relaxed text-ink-soft">
          Plan it on your laptop at home, your usual staples plus a recipe or
          two, save it, then open it on your phone in the store.
        </p>

        {/* Auth */}
        <div className="mt-10">
          {status === "sent" ? (
            <p className="text-[15px] text-ink">
              Check your email for a login link.
            </p>
          ) : (
            <>
              <button
                onClick={handleGoogle}
                className="flex w-full items-center justify-center gap-3 rounded-xl border border-ink/15 bg-white py-3 text-[15px] text-ink transition hover:border-ink/40"
              >
                <GoogleIcon />
                Continue with Google
              </button>

              {!showEmail ? (
                <button
                  onClick={() => setShowEmail(true)}
                  className="mt-4 w-full text-center text-xs uppercase tracking-wide text-stone hover:text-ink"
                >
                  or continue with email
                </button>
              ) : (
                <div className="mt-4 flex items-center gap-3 border-b border-ink pb-2">
                  <input
                    type="email"
                    autoFocus
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleEmail()}
                    className="flex-1 bg-transparent text-ink placeholder:text-stone outline-none"
                  />
                  <button
                    onClick={handleEmail}
                    disabled={status === "sending" || !email.trim()}
                    className="text-xs uppercase tracking-wide text-ink underline underline-offset-4 disabled:text-stone disabled:no-underline"
                  >
                    {status === "sending" ? "Sending" : "Send link"}
                  </button>
                </div>
              )}

              {status === "error" && (
                <p className="mt-3 text-xs text-red-700">
                  Something went wrong. Try again.
                </p>
              )}
            </>
          )}
        </div>
      </div>
    </main>
  );
}

function GoogleIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24">
      <path
        fill="#4285F4"
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"
      />
      <path
        fill="#34A853"
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84A11 11 0 0 0 12 23z"
      />
      <path
        fill="#FBBC05"
        d="M5.84 14.1a6.6 6.6 0 0 1 0-4.2V7.06H2.18a11 11 0 0 0 0 9.88l3.66-2.84z"
      />
      <path
        fill="#EA4335"
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84C6.71 7.31 9.14 5.38 12 5.38z"
      />
    </svg>
  );
}