"use client";

import React, { useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useDispatch } from "react-redux";
import Link from "next/link";
import axios from "axios";
import {
  Building2,
  User,
  Mail,
  ShieldCheck,
  Loader2,
  Lock,
  ShieldAlert,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { loginUser } from "@/app/reduxToolkit/slice";

function RegisterForm() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const dispatch = useDispatch();

  const selectedPlan = searchParams.get("plan") || "starter";

  const [formData, setFormData] = useState({
    companyName: "",
    adminName: "",
    adminEmail: "",
    password: "", // Added password
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
      const response = await axios.post("/api/organizations/register", {
        ...formData,
        plan: selectedPlan,
      });

      const { data } = response;
      if (data.success) {
        // Auto log in via Redux
        dispatch(
          loginUser({
            id: data.adminId,
            name: formData.adminName,
            email: formData.adminEmail,
            role: "org_admin",
            orgId: data.orgId,
            department: "Human Resources",
            position: "CHRO (Head of HR)",
          }),
        );
        // Redirect to their new dashboard
        router.push("/dashboard");
      } else {
        setError(data.error || "Failed to create organization");
      }
    } catch (err: any) {
      console.error(err);
      setError(err.response?.data?.error || "An unexpected error occurred.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full max-w-xl mx-auto bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl shadow-xl p-8 animate-fade-in">
      <div className="text-center space-y-2 mb-8">
        <h1 className="text-3xl font-extrabold tracking-tight text-zinc-900 dark:text-zinc-50">
          Onboard Your Organization
        </h1>
        <p className="text-sm text-zinc-500">
          Provision your secure tenant and set up your Administrator account.
        </p>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-50 dark:bg-red-950/20 text-red-600 dark:text-red-400 border border-red-200 dark:border-red-900 rounded-xl text-sm font-semibold flex items-center gap-2">
          <ShieldAlert className="h-4 w-4" />
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-4">
          <div>
            <label className="text-xs font-bold text-zinc-700 dark:text-zinc-300 mb-1.5 block">
              Organization / Company Name
            </label>
            <div className="relative">
              <Building2 className="absolute left-3 top-3 h-4 w-4 text-zinc-400" />
              <Input
                name="companyName"
                required
                value={formData.companyName}
                onChange={handleChange}
                placeholder="Acme Corporation"
                className="pl-9 bg-zinc-50 dark:bg-zinc-950/50"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-bold text-zinc-700 dark:text-zinc-300 mb-1.5 block">
              Your Full Name (Founding Admin)
            </label>
            <div className="relative">
              <User className="absolute left-3 top-3 h-4 w-4 text-zinc-400" />
              <Input
                name="adminName"
                required
                value={formData.adminName}
                onChange={handleChange}
                placeholder="Jane Doe"
                className="pl-9 bg-zinc-50 dark:bg-zinc-950/50"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-bold text-zinc-700 dark:text-zinc-300 mb-1.5 block">
                Work Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 h-4 w-4 text-zinc-400" />
                <Input
                  name="adminEmail"
                  type="email"
                  required
                  value={formData.adminEmail}
                  onChange={handleChange}
                  placeholder="jane@acmecorp.com"
                  className="pl-9 bg-zinc-50 dark:bg-zinc-950/50"
                />
              </div>
            </div>
            <div>
              <label className="text-xs font-bold text-zinc-700 dark:text-zinc-300 mb-1.5 block">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 h-4 w-4 text-zinc-400" />
                <Input
                  name="password"
                  type="password"
                  required
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="••••••••"
                  className="pl-9 bg-zinc-50 dark:bg-zinc-950/50"
                />
              </div>
            </div>
          </div>
        </div>

        <Button
          type="submit"
          disabled={isLoading}
          className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold h-12 text-base shadow-md"
        >
          {isLoading ? (
            <Loader2 className="h-5 w-5 animate-spin" />
          ) : (
            "Provision Tenant & Login"
          )}
        </Button>

        <p className="text-xs text-center text-zinc-500 font-medium pt-2">
          Already have an account?{" "}
          <Link
            href="/auth/org"
            className="text-emerald-600 font-bold hover:underline"
          >
            Log In Here
          </Link>
        </p>
      </form>
    </div>
  );
}

export default function RegisterPage() {
  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 flex flex-col">
      <header className="flex items-center justify-between px-6 py-4 border-b border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 sticky top-0 z-10">
        <Link href="/" className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-lg bg-blue-600 flex items-center justify-center text-white font-bold">
            O
          </div>
          <span className="text-xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
            Org Control
          </span>
        </Link>
        <Link
          href="/"
          className="text-sm font-semibold text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100"
        >
          Back to Gateway
        </Link>
      </header>
      <main className="flex-1 flex items-center justify-center p-4">
        <Suspense fallback={<div>Loading form...</div>}>
          <RegisterForm />
        </Suspense>
      </main>
    </div>
  );
}
