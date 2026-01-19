"use client";

import { Suspense, useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

function AdminLoginInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const rawRedirect = searchParams.get("redirectTo") || "/admin";
  const redirectTarget = useMemo(() => (rawRedirect.startsWith("/admin") ? rawRedirect : "/admin"), [rawRedirect]);

  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [checking, setChecking] = useState(true);

  // Ensure native cursor is visible on admin pages
  useEffect(() => {
    const body = document?.body;
    if (!body) return undefined;
    const prevCursor = body.style.getPropertyValue("cursor");
    const prevPriority = body.style.getPropertyPriority("cursor");
    body.style.setProperty("cursor", "auto", "important");
    return () => {
      if (prevCursor) {
        body.style.setProperty("cursor", prevCursor, prevPriority);
      } else {
        body.style.removeProperty("cursor");
      }
    };
  }, []);

  // Skip login screen if already authenticated
  useEffect(() => {
    const verifySession = async () => {
      setChecking(true);
      try {
        const res = await fetch("/api/admin", { method: "GET" });
        const data = await res.json().catch(() => ({}));
        if (res.ok && data?.authenticated) {
          router.replace(redirectTarget);
          return;
        }
      } catch (err) {
        console.error("login precheck error", err);
      } finally {
        setChecking(false);
      }
    };

    verifySession();
  }, [redirectTarget, router]);

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/admin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "login", identifier, password }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data?.error || "Login failed");
        return;
      }

      router.replace(redirectTarget);
    } catch (err) {
      console.error("Login error", err);
      setError("Login failed");
    } finally {
      setLoading(false);
      setChecking(false);
    }
  }

  if (checking) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex items-center gap-3 text-sm text-muted-foreground">
          <span className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent" />
          Checking session...
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background">
      <form
        onSubmit={handleLogin}
        className="flex flex-col gap-4 p-8 rounded-xl bg-card border w-full max-w-sm"
      >
        <h1 className="text-xl font-bold mb-2">Admin Portal</h1>
        <input
          type="text"
          className="border rounded px-3 py-2 bg-background"
          placeholder="Username or email"
          value={identifier}
          onChange={(e) => setIdentifier(e.target.value)}
          required
        />
        <input
          type="password"
          className="border rounded px-3 py-2 bg-background"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <button
          type="submit"
          className="bg-primary text-white rounded px-4 py-2 font-semibold"
          disabled={loading}
        >
          {loading ? "Signing in..." : "Sign In"}
        </button>
        {error && <div className="text-red-500 text-sm">{error}</div>}
      </form>
    </div>
  );
}

export default function AdminLoginPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-background">
          <div className="flex items-center gap-3 text-sm text-muted-foreground">
            <span className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent" />
            Loading login...
          </div>
        </div>
      }
    >
      <AdminLoginInner />
    </Suspense>
  );
}
