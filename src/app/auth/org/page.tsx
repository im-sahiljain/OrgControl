"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { useDispatch } from "react-redux";
import Link from "next/link";
import axios from "axios";
import { Building2, Mail, Lock, Loader2, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { loginUser } from "@/app/reduxToolkit/slice";

export default function OrgLoginPage() {
  const router = useRouter();
  const dispatch = useDispatch();

  const [formData, setFormData] = useState({
    email: "",
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
        loginType: "org",
      });

      if (response.data.success) {
        dispatch(loginUser(response.data.user));
        router.push("/dashboard");
      } else {
        setError(response.data.error || "Login failed.");
      }
    } catch (err: any) {
      setError(err.response?.data?.error || "Invalid credentials or network error.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 flex flex-col justify-center items-center p-4">
      <div className="w-full max-w-md bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl shadow-xl p-8 animate-fade-in">
        <div className="text-center space-y-2 mb-8">
          <div className="h-12 w-12 rounded-xl bg-blue-600 text-white flex items-center justify-center font-bold text-2xl mx-auto shadow-md mb-4">
            <Building2 className="h-6 w-6" />
          </div>
          <h1 className="text-2xl font-extrabold tracking-tight text-zinc-900 dark:text-zinc-50">
            Organization Login
          </h1>
          <p className="text-sm text-zinc-500">
            Access your secure tenant workspace.
          </p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 dark:bg-red-950/20 text-red-600 dark:text-red-400 border border-red-200 dark:border-red-900 rounded-xl text-sm font-semibold flex items-center gap-2">
            <AlertCircle className="h-4 w-4 shrink-0" />
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="text-sm font-bold text-zinc-700 dark:text-zinc-300 mb-2 block">
              Work Email
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-3.5 h-4 w-4 text-zinc-400" />
              <Input
                name="email"
                type="email"
                required
                value={formData.email}
                onChange={handleChange}
                placeholder="you@company.com"
                className="pl-10 h-11 bg-zinc-50 dark:bg-zinc-950"
              />
            </div>
          </div>
          <div>
            <label className="text-sm font-bold text-zinc-700 dark:text-zinc-300 mb-2 block">
              Password
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-3.5 h-4 w-4 text-zinc-400" />
              <Input
                name="password"
                type="password"
                required
                value={formData.password}
                onChange={handleChange}
                placeholder="••••••••"
                className="pl-10 h-11 bg-zinc-50 dark:bg-zinc-950"
              />
            </div>
          </div>
          <Button
            type="submit"
            disabled={isLoading}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold h-11 shadow-md"
          >
            {isLoading ? <Loader2 className="h-5 w-5 animate-spin" /> : "Sign In to Workspace"}
          </Button>
        </form>
        
        <div className="mt-6 flex justify-between items-center text-sm font-medium">
          <Link href="/" className="text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100">
            Back to Gateway
          </Link>
          <Link href="/register" className="text-blue-600 hover:underline">
            Register New Org
          </Link>
        </div>
      </div>
    </div>
  );
}
