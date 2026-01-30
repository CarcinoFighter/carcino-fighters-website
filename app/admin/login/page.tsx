"use client";

import { Suspense, useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Image from "next/image";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Eye, EyeOff, Icon } from "lucide-react";

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
  const [showPassword, setShowPassword] = useState(false);

  const type = showPassword ? "text" : "password";
  const Icon = showPassword ? EyeOff : Eye;

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
    <div className="h-screen w-screen relative">
      <Image
        src={`/leadership-bg-new-2.jpg`}
        width={1920}
        height={1080}
        alt="Background Image"
        className="absolute top-0 left-0 w-full h-full object-cover brightness-50"
      />


      <form
        onSubmit={handleLogin}
      >

        <div className="min-h-screen flex items-center justify-center bg-[#686279]">
          <div className="p-3 mt-7 rounded-xl h-3/4 bg-[#2C2638]/50 backdrop-blur-sm md:flex md:gap-2 drop-shadow-2xl drop-shadow-black/50">
            <Image
              src="/dummy_image4.png"
              width={400}
              height={500}
              alt="Auth Image"
              className="md:block hidden scale-95"
            />
            <Card className="bg-transparent border-0 shadow-none">
              <CardHeader className="flex items-center">
                <CardTitle className="text-3xl">
                  Sign in to your account
                </CardTitle>
              </CardHeader>
              <CardContent className="flex-col space-y-7 items-center">
                <Input
                  type="text"
                  className="bg-[#3C364C]"
                  placeholder="Username or email"
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  required
                />
                <div className="relative flex gap-2 items-center">
                  <Input
                    type={type}
                    className="bg-[#3C364C]"
                    placeholder="Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((prev) => !prev)}
                    className="absolute right-3 text-white/70 hover:text-white hover:cursor-pointer z-10"
                  >
                    <Icon />
                  </button>
                </div>
                <Button
                  type="submit"
                  className="w-full hover:cursor-pointer bg-[#6D54B5]"
                  disabled={loading}
                >
                  {loading ? "Signing in..." : "Sign In"}
                </Button>
                {error && <div className="text-red-500 text-sm">{error}</div>}
              </CardContent>
              <CardFooter className="flex-col space-y-3 justify-center items-center">
                <div className="flex items-center justify-center gap-1 w-full">
                  <div className="bg-slate-700 h-[1px] w-full"></div>
                  <p className="text-slate-500 text-sm text-nowrap font-medium px-1">
                    Or continue with
                  </p>
                  <div className="bg-slate-700 h-[1px] w-full"></div>
                </div>
                <Button
                  variant="ghost"
                  disabled
                  className="mt-2 flex items-center justify-center w-full border-[0.5px] px-5 py-7 hover:cursor-pointer border-white"
                >
                  <Image
                    src="/google-logo.png"
                    alt="Google"
                    width={32}
                    height={32}
                  />
                  Continue with Google <br />
                  (Work in Progress)
                </Button>
              </CardFooter>
            </Card>
          </div>
        </div>
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
