"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Eye, EyeOff } from "lucide-react";
import DarkVeil from "@/components/DarkVeil";

export default function SignUpPage() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    username: "",
    email: "",
    password: "",
    bio: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const type = showPassword ? "text" : "password";
  const Icon = showPassword ? EyeOff : Eye;

  async function handleSignUp(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const res = await fetch("/api/public-auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "register",
          name: formData.name,
          username: formData.username,
          email: formData.email,
          password: formData.password,
          bio: formData.bio,
        }),
      });
      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        setError(data?.error || "Registration failed");
        return;
      }

      router.push("/dashboard");
    } catch (err) {
      console.error("public sign-up error", err);
      setError("Registration failed");
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
      <div className="w-full max-w-[90%] md:max-w-[60%] mx-auto mt-6 rounded-[55px] bg-black/40">
        <div className="grid gap-10 lg:grid-cols-[1.1fr,0.9fr] items-center ">
          <div className="relative overflow-hidden px-6 md:px-16 py-8 md:py-8 ">
            <div className="liquidGlass-effect pointer-events-none"></div>
            <div className="cardGlass-tint pointer-events-none"></div>
            <div className="glass-noise"></div>
            <div className="cardGlass-borders pointer-events-none"></div>
            <div className="cardGlass-shine pointer-events-none"></div>
            <div className="liquidGlass-text pointer-events-none"></div>

            <div className="relative flex flex-col gap-6">
              <div className="pb-3">
                <p className="text-center text-base md:text-lg text-white/70">
                  Join the community
                </p>
                <h1 className="text-4xl font-semibold text-center py-2 font-wintersolace">
                  Create an account
                </h1>
                <div className="text-center text-base md:text-lg text-white/70">
                  Already have an account?{" "}
                  <Link
                    href="/sign-in"
                    className="text-[#9875C1] hover:text-white"
                  >
                    Log in
                  </Link>
                </div>
              </div>

              <form className="space-y-6" onSubmit={handleSignUp}>
                <div className="grid gap-3 md:grid-cols-2">
                  <div className="space-y-2">
                    <label className="uppercase tracking-[0.2em] text-white/50"></label>
                    <Input
                      className="border-[#B5B5B5]/40 border-[2px] h-[50px] text-base rounded-[12px] focus:border-[#9875C1] placeholder:text-[#69626d] placeholder:text-base"
                      value={formData.name}
                      placeholder="Full name"
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          name: e.target.value,
                        }))
                      }
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="uppercase tracking-[0.2em] text-white/50"></label>
                    <Input
                      className="border-[#B5B5B5]/40 border-[2px] h-[50px] text-base rounded-[12px] focus:border-[#9875C1] placeholder:text-[#69626d] placeholder:text-base"
                      value={formData.username}
                      placeholder="Username"
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          username: e.target.value,
                        }))
                      }
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="uppercase tracking-[0.2em] text-white/50"></label>
                  <Input
                    className="border-[#B5B5B5]/40 border-[2px] h-[50px] text-base rounded-[12px] focus:border-[#9875C1] placeholder:text-[#69626d] placeholder:text-base"
                    type="email"
                    value={formData.email}
                    placeholder="Email"
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        email: e.target.value,
                      }))
                    }
                    required
                  />
                </div>

                <div className="space-y-2">
                  <label className="uppercase tracking-[0.2em] text-white/50"></label>
                  <div className="relative">
                    <Input
                      type={type}
                      className="border-[#B5B5B5]/40 border-[2px] h-[50px] text-base rounded-[12px] focus:border-[#9875C1] placeholder:text-[#69626d] placeholder:text-base pr-11"
                      value={formData.password}
                      placeholder="Password"
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          password: e.target.value,
                        }))
                      }
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

                <div className="space-y-2">
                  <label className="uppercase tracking-[0.2em] text-white/50"></label>
                  <Textarea
                    className="border-[#B5B5B5]/40 border-[2px] min-h-[100px] text-base rounded-[12px] focus:border-[#9875C1] placeholder:text-[#69626d] placeholder:text-base"
                    placeholder="Tell us a bit about yourself (optional)"
                    value={formData.bio}
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, bio: e.target.value }))
                    }
                  />
                </div>

                {error && (
                  <div className="rounded-lg border border-red-400/30 bg-red-500/10 px-3 py-2 text-sm text-red-100">
                    {error}
                  </div>
                )}
                <div className="w-full flex items-center justify-center">
                  <Button
                    type="submit"
                    className="w-[100%] h-14 bg-[#9875C1] hover:bg-[#8c5fbf] rounded-[15px] text-[20px] mb-3"
                    disabled={loading}
                  >
                    {loading ? "Creating account..." : "Sign up"}
                  </Button>
                </div>

                {/* <div className="text-center text-sm text-white/60">
                  Or register with
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  className="w-full h-11 border border-white/15 bg-white/5 text-white"
                  disabled
                >
                  Coming soon
                </Button> */}
              </form>
            </div>
          </div>

          {/* <div className="relative hidden lg:block rounded-2xl border border-white/10 bg-gradient-to-br from-purple-500/20 via-fuchsia-500/10 to-indigo-600/20 p-8 overflow-hidden">
                        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_30%,rgba(255,255,255,0.08),transparent_45%),radial-gradient(circle_at_70%_60%,rgba(108,99,255,0.15),transparent_55%)]" />
                        <div className="relative z-10 flex h-full flex-col justify-center gap-4 text-white">
                            <p className="text-sm text-white/70">Welcome</p>
                            <h2 className="text-3xl font-semibold leading-tight">Create your account to share and discover survivor stories.</h2>
                            <p className="text-white/70 text-base">Join the community and start writing, reading, and connecting with others on the same journey.</p>
                        </div>
                    </div> */}
        </div>
      </div>
    </div>
  );
}
