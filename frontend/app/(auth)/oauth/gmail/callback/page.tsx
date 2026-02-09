"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

export default function GmailCallbackPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
  const [message, setMessage] = useState("Connecting your Gmail account...");

  useEffect(() => {
    const code = searchParams.get("code");
    const error = searchParams.get("error");

    if (error) {
      setStatus("error");
      setMessage(`Authorization failed: ${error}`);
      return;
    }

    if (!code) {
      setStatus("error");
      setMessage("No authorization code received");
      return;
    }

    // The backend handles the callback directly, so if we reach here
    // it means the backend already processed it and redirected
    // Just show success and redirect to settings
    setStatus("success");
    setMessage("Gmail connected successfully!");

    setTimeout(() => {
      router.push("/settings");
    }, 2000);
  }, [searchParams, router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-background-dark">
      <div className="text-center">
        <div className="mb-6">
          {status === "loading" && (
            <span className="material-symbols-outlined text-5xl text-primary animate-spin">
              progress_activity
            </span>
          )}
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
