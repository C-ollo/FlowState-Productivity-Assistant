"use client";

import { Suspense, useEffect, useMemo } from "react";
import { useRouter, useSearchParams } from "next/navigation";

function GmailCallbackContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const { status, message } = useMemo(() => {
    const error = searchParams.get("error");
    if (error) {
      return { status: "error" as const, message: `Authorization failed: ${error}` };
    }
    const code = searchParams.get("code");
    if (!code) {
      return { status: "error" as const, message: "No authorization code received" };
    }
    return { status: "success" as const, message: "Gmail connected successfully!" };
  }, [searchParams]);

  useEffect(() => {
    if (status !== "success") return;
    const timer = setTimeout(() => {
      router.push("/settings");
    }, 2000);
    return () => clearTimeout(timer);
  }, [status, router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-background-dark">
      <div className="text-center">
        <div className="mb-6">
          {status === "success" && (
            <span className="material-symbols-outlined text-5xl text-green-400">
              check_circle
            </span>
          )}
          {status === "error" && (
            <span className="material-symbols-outlined text-5xl text-red-400">
              error
            </span>
          )}
        </div>
        <h1 className="text-xl font-bold mb-2">{message}</h1>
        {status === "success" && (
          <p className="text-sm text-text-muted">Redirecting to settings...</p>
        )}
        {status === "error" && (
          <button
            onClick={() => router.push("/settings")}
            className="mt-4 px-4 py-2 bg-primary rounded-lg text-sm font-bold hover:bg-blue-600 transition-colors"
          >
            Back to Settings
          </button>
        )}
      </div>
    </div>
  );
}

export default function GmailCallbackPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-background-dark">
          <span className="material-symbols-outlined text-5xl text-primary animate-spin">
            progress_activity
          </span>
        </div>
      }
    >
      <GmailCallbackContent />
    </Suspense>
  );
}
