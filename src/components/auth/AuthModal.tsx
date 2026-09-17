"use client";

import React, { useState } from "react";
import { useAuth } from "@/src/context/AuthContext";
import { X, Lock, Mail, User as UserIcon, ArrowRight, Sparkles } from "lucide-react";

export default function AuthModal() {
  const { authModalOpen, closeAuthModal, authModalMode, openAuthModal, login, register } = useAuth();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!authModalOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsSubmitting(true);

    if (authModalMode === "register") {
      if (!name.trim()) {
        setError("Please enter your name");
        setIsSubmitting(false);
        return;
      }
      const res = await register(name, email, password);
      if (!res.success) {
        setError(res.error || "Registration failed");
      }
    } else {
      const res = await login(email, password);
      if (!res.success) {
        setError(res.error || "Login failed");
      }
    }

    setIsSubmitting(false);
  };

  const handleDemoSignIn = async () => {
    setError("");
    setIsSubmitting(true);
    const res = await login("demo@resumebuilder.com", "password123");
    if (!res.success) {
      // If demo user doesn't exist, create it
      await register("Demo Candidate", "demo@resumebuilder.com", "password123");
    }
    setIsSubmitting(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fade-in">
      <div className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl border border-slate-100 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-100 bg-slate-50/50">
          <div>
            <h2 className="text-xl font-bold text-slate-900">
              {authModalMode === "login" ? "Welcome Back" : "Create an Account"}
            </h2>
            <p className="text-sm text-slate-500 mt-0.5">
              {authModalMode === "login"
                ? "Sign in to access your saved resumes"
                : "Join thousands crafting standout resumes"}
            </p>
          </div>
          <button
            onClick={closeAuthModal}
            className="p-2 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-100 transition"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6">
          {error && (
            <div className="mb-4 p-3 rounded-lg bg-red-50 border border-red-200 text-sm text-red-600 flex items-center">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {authModalMode === "register" && (
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1">
                  Full Name
                </label>
                <div className="relative">
                  <UserIcon className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Alex Morgan"
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition"
                  />
                </div>
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="alex@example.com"
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-medium text-sm transition shadow-sm disabled:opacity-50"
            >
              {isSubmitting ? (
                "Processing..."
              ) : (
                <>
                  {authModalMode === "login" ? "Sign In" : "Get Started"}
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Quick Demo Access */}
          <div className="mt-4 pt-4 border-t border-slate-100 text-center">
            <button
              type="button"
              onClick={handleDemoSignIn}
              disabled={isSubmitting}
              className="w-full inline-flex items-center justify-center gap-2 py-2 px-3 rounded-lg border border-slate-200 bg-slate-50 hover:bg-slate-100 text-xs font-medium text-slate-700 transition"
            >
              <Sparkles className="w-3.5 h-3.5 text-blue-600" />
              1-Click Demo Login
            </button>
          </div>

          <div className="mt-4 text-center text-xs text-slate-500">
            {authModalMode === "login" ? (
              <>
                Don&apos;t have an account?{" "}
                <button
                  onClick={() => openAuthModal("register")}
                  className="text-blue-600 font-semibold hover:underline"
                >
                  Sign Up
                </button>
              </>
            ) : (
              <>
                Already have an account?{" "}
                <button
                  onClick={() => openAuthModal("login")}
                  className="text-blue-600 font-semibold hover:underline"
                >
                  Sign In
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
