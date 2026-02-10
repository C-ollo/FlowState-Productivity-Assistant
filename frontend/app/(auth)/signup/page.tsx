"use client";

import { useState } from "react";
import Link from "next/link";
import { useRegister } from "@/hooks/use-auth";

export default function SignupPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const register = useRegister();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    register.mutate({ name, email, password });
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background-dark">
      <div className="w-full max-w-md p-8">
        <div className="flex items-center gap-3 mb-8 justify-center">
          <div className="bg-primary rounded-lg p-2 flex items-center justify-center">
            <span className="material-symbols-outlined text-white">bolt</span>
          </div>
          <div className="flex flex-col">
            <h1 className="text-white text-xl font-bold leading-none">
              FlowState
            </h1>
            <p className="text-text-muted text-xs font-medium">Local-first AI</p>
          </div>
        </div>

        <div className="bg-surface-dark rounded-xl border border-border-dark p-6">
          <h2 className="text-lg font-bold mb-6">Create your account</h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-text-muted mb-2">
                Name
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full bg-border-dark border-none rounded-lg px-4 py-2.5 text-sm focus:ring-1 focus:ring-primary placeholder:text-text-muted"
                placeholder="Your name"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-text-muted mb-2">
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-border-dark border-none rounded-lg px-4 py-2.5 text-sm focus:ring-1 focus:ring-primary placeholder:text-text-muted"
                placeholder="you@example.com"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-text-muted mb-2">
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-border-dark border-none rounded-lg px-4 py-2.5 text-sm focus:ring-1 focus:ring-primary placeholder:text-text-muted"
                placeholder="Create a password"
                required
                minLength={8}
              />
            </div>

            {register.isError && (
              <p className="text-red-400 text-sm">
                Registration failed. Please try again.
              </p>
            )}

            <button
              type="submit"
              disabled={register.isPending}
              className="w-full bg-primary hover:bg-blue-600 transition-colors text-white py-2.5 rounded-lg text-sm font-bold flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {register.isPending ? (
                <>
                  <span className="material-symbols-outlined animate-spin text-sm">
                    progress_activity
                  </span>
                  Creating account...
                </>
              ) : (
                "Create account"
              )}
            </button>
          </form>

          <p className="text-center text-sm text-text-muted mt-6">
            Already have an account?{" "}
            <Link href="/login" className="text-primary hover:underline">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
