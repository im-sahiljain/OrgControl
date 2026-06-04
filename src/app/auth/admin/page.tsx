"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { useDispatch } from "react-redux";
import Link from "next/link";
import axios from "axios";
import { ShieldAlert, Mail, Lock, Loader2, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { setAuthSession } from "@/app/reduxToolkit/slice";

export default function AdminLoginPage() {
  const router = useRouter();
  const dispatch = useDispatch();

  const [formData, setFormData] = useState({
    email: "admin@saasmaker.in", // Prefilled for convenience based on plan
    password: "",
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      const response = await axios.post("/api/auth/login", {
        ...formData,
        loginType: "admin",
      });

      if (response.data.success) {
        dispatch(setAuthSession(response.data.user));
        router.push("/admin/dashboard");
      } else {
        setError(response.data.error || "Login failed.");
      }
    } catch (err: any) {
      setError(err.response?.data?.error || "Invalid platform credentials.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-zinc-950 flex flex-col justify-center items-center p-4 relative overflow-hidden">
      {/* Decorative background element for admin */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-red-600/5 blur-[120px] rounded-full pointer-events-none" />

      <div className="w-full max-w-md bg-zinc-900 border border-zinc-800 rounded-2xl shadow-2xl p-8 relative z-10 animate-fade-in">
        <div className="text-center space-y-2 mb-8">
          <div className="h-14 w-14 rounded-full bg-red-500/10 border border-red-500/20 text-red-500 flex items-center justify-center font-bold text-2xl mx-auto shadow-inner mb-4">
            <ShieldAlert className="h-6 w-6" />
          </div>
          <h1 className="text-2xl font-extrabold tracking-tight text-white">
            SaaS Maker Access
          </h1>
          <p className="text-sm text-zinc-400">
            Platform Owner restricted gateway.
          </p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-950/40 text-red-400 border border-red-900/50 rounded-xl text-sm font-semibold flex items-center gap-2">
            <AlertCircle className="h-4 w-4 shrink-0" />
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="text-sm font-bold text-zinc-300 mb-2 block">
              Platform Email
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-3.5 h-4 w-4 text-zinc-500" />
              <Input
                name="email"
                type="email"
                required
                value={formData.email}
                onChange={handleChange}
                placeholder="admin@saasmaker.in"
                className="pl-10 h-11 bg-zinc-950/50 border-zinc-800 text-white focus:border-red-500 focus:ring-red-500"
              />
            </div>
          </div>
          <div>
            <label className="text-sm font-bold text-zinc-300 mb-2 block">
              Master Password
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-3.5 h-4 w-4 text-zinc-500" />
              <Input
                name="password"
                type="password"
                required
                value={formData.password}
                onChange={handleChange}
                placeholder="••••••••"
                className="pl-10 h-11 bg-zinc-950/50 border-zinc-800 text-white focus:border-red-500 focus:ring-red-500"
              />
            </div>
          </div>
          <Button
            type="submit"
            disabled={isLoading}
            className="w-full bg-red-600 hover:bg-red-700 text-white font-bold h-11 shadow-lg"
          >
            {isLoading ? <Loader2 className="h-5 w-5 animate-spin" /> : "Authenticate to Core"}
          </Button>
        </form>
        
        <div className="mt-6 flex justify-center items-center text-sm font-medium">
          <Link href="/" className="text-zinc-500 hover:text-zinc-300 transition-colors flex items-center gap-2">
            Abort Sequence & Return to Gateway
          </Link>
        </div>
      </div>
    </div>
  );
}
