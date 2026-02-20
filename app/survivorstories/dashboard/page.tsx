"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";

export default function SurvivorStoriesDashboardRedirect() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/admin/survivor-stories");
  }, [router]);

  return (
    <div className="min-h-screen bg-black text-white flex items-center justify-center px-6">
      <div className="max-w-xl text-center space-y-4">
        <h1 className="text-2xl font-semibold">Dashboard moved</h1>
        <p className="text-sm text-white/70">
          Survivor Stories are now published from the Admin Panel by society members. We are redirecting you to the
          new home.
        </p>
        <Button onClick={() => router.replace("/admin/survivor-stories")}>Go now</Button>
      </div>
    </div>
  );
}
