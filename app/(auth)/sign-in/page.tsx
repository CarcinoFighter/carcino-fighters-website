"use client";

import { Suspense, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Eye, EyeOff } from "lucide-react";
import DarkVeil from "@/components/DarkVeil";

function SignInInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const registered = searchParams.get("registered");
  const rawRedirect = searchParams.get("redirectTo") || "/dashboard";
  const redirectTarget = useMemo(
    () => (rawRedirect.startsWith("/") ? rawRedirect : "/dashboard"),
    [rawRedirect],
  );

  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isEmployee, setIsEmployee] = useState(false);

  const type = showPassword ? "text" : "password";
  const Icon = showPassword ? EyeOff : Eye;

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const res = await fetch("/api/public-auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "login",
          identifier,
          password,
          isEmployee,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data?.error || "Login failed");
        return;
      }

      router.replace(redirectTarget);
    } catch (err) {
      console.error("public login error", err);
      setError("Login failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-none text-white flex items-center justify-center px-4 pt-[60px] md:pt-6 font-dmsans">
      <div className="fixed inset-0 pointer-events-none -z-10 bg-black mt-[12%] scale-[175%]">
        <DarkVeil
          hueShift={0}
          noiseIntensity={0.16}
          scanlineIntensity={0}
          speed={0.5}
          scanlineFrequency={0}
          warpAmount={0}
          resolutionScale={1}
        />
      </div>
      <div className="w-full max-w-[90%] md:max-w-[40%] mx-auto rounded-[55px] bg-black/40">
        <div className="grid gap-10 lg:grid-cols-[1.1fr,0.9fr] items-center">
          <div className="relative overflow-hidden px-6 md:px-16 py-8 md:py-10 ">
            <div className="liquidGlass-effect pointer-events-none"></div>
            <div className="cardGlass-tint pointer-events-none"></div>
            <div className="glass-noise"></div>
            <div className="cardGlass-borders pointer-events-none"></div>
            <div className="cardGlass-shine pointer-events-none"></div>
            <div className="liquidGlass-text pointer-events-none"></div>
            <div className="relative flex flex-col gap-6">
              <div className="pb-5">
                <h1 className="text-4xl font-semibold text-center pb-3 font-wintersolace">
                  Welcome back
                </h1>
                <div className="text-center text-base md:text-lg text-white/70">
                  New here?{" "}
                  <Link
                    href="/sign-up"
                    className="text-[#9a88ff] hover:text-white"
                  >
                    Create an account
                  </Link>
                </div>
                {registered && (
                  <div className="mt-3 inline-flex items-center gap-2 rounded-full border border-green-500/30 bg-green-500/10 px-3 py-1 text-sm text-green-200">
                    Account created! Please sign in.
                  </div>
                )}
              </div>

              <form className="space-y-8" onSubmit={handleLogin}>
                <div className="space-y-2">
                  <label className="uppercase tracking-[0.2em] text-white/50"></label>
                  <Input
                    type="text"
                    className="border-[#B5B5B5]/40 border-[2px] h-[50px] text-base rounded-[12px] focus:border-[#9875C1] placeholder:text-[#69626d] placeholder:text-base"
                    value={identifier}
                    onChange={(e) => setIdentifier(e.target.value)}
                    placeholder="Email or username"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <label className="uppercase tracking-[0.2em] text-white/50"></label>
                  <div className="relative">
                    <Input
                      type={type}
                      className="border-[#B5B5B5]/40 border-[2px] h-[50px] text-base rounded-[12px] focus:border-[#9875C1] placeholder:text-[#69626d] placeholder:text-base"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Password"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword((prev) => !prev)}
                      className="absolute inset-y-0 right-3 flex items-center text-white/70 hover:text-white"
                    >
                      <Icon className="h-5 w-5" />
                    </button>
                  </div>
                </div>

                <div className="flex items-center gap-2 py-1">
                  <input
                    id="employee-check"
                    type="checkbox"
                    className="h-4 w-4 rounded border-white/20  text-[#9875C1] focus:ring-[#9875C1]"
                    checked={isEmployee}
                    onChange={(e) => setIsEmployee(e.target.checked)}
                  />
                  <label
                    htmlFor="employee-check"
                    className="text-base text-white/70 hover:text-white cursor-pointer select-none"
                  >
                    Sign in as Employee
                  </label>
                </div>
                {error && (
                  <div className="rounded-lg border border-red-400/30 bg-red-500/10 px-3 py-2 text-sm text-red-100">
                    {error}
                  </div>
                )}
                <div className="w-full flex items-center justify-center">
                  <Button
                    type="submit"
                    className="w-[80%] h-14 bg-[#9875C1] hover:bg-[#8c5fbf] rounded-[15px] text-[20px] mb-5"
                    disabled={loading}
                  >
                    {loading ? "Signing in..." : "Sign in"}
                  </Button>
                </div>
              </form>
            </div>
          </div>

          {/* <div className="relative hidden lg:block rounded-2xl border border-white/10 bg-gradient-to-br from-purple-500/20 via-fuchsia-500/10 to-indigo-600/20 p-8 overflow-hidden">
                        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_30%,rgba(255,255,255,0.08),transparent_45%),radial-gradient(circle_at_70%_60%,rgba(108,99,255,0.15),transparent_55%)]" />
                        <div className="relative z-10 flex h-full flex-col justify-center gap-4 text-white">
                            <p className="text-sm text-white/70">Community of fighters</p>
                            <h2 className="text-3xl font-semibold leading-tight">Share, read, and support survivor stories.</h2>
                            <p className="text-white/70 text-base">Log back in to continue your journey, publish updates, or discover new stories of resilience.</p>
                        </div>
                    </div> */}
        </div>
      </div>
    </div>
  );
}

export default function SignInPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-[#686279] text-white/80">
          Loading sign-in...
        </div>
      }
    >
      <SignInInner />
    </Suspense>
  );
}
