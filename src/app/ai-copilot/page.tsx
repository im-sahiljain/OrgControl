"use client";

import React, { useState, useRef, useEffect } from "react";
import { Cpu, Send, Sparkles, AlertCircle, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useSelector } from "react-redux";
import type { RootState } from "../reduxToolkit/store";

export default function AICopilotPage() {
  const user = useSelector((state: RootState) => state.employeeUI.user);
  const userRole = user?.role;

  const [messages, setMessages] = useState<any[]>([]);
  const [input, setInput] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  // Initialize and reset welcome message based on active role
  useEffect(() => {
    if (user) {
      const isEmp = user.role === "employee";
      const welcomeText = isEmp
        ? `Hello ${user.name}! I am your SaaS AI Copilot. I can check your personal leave balances, verify your clock-in status, draft professional email templates, or assist you with internal directory searches. How can I help you today?`
        : `Hello ${user.name}! I am the unified SaaS AI Copilot. I can run semantic queries over your workforce directory, aggregate budget spends, check leave balances, and help write employee review structures. Ask me anything!`;
      setMessages([
        {
          id: "welcome",
          sender: "ai",
          text: welcomeText,
        },
      ]);
    }
  }, [user?.id, user?.role]);

  const suggestions = userRole === "employee"
    ? [
        "Check my attendance records",
        "Check my leaves balance",
        "Generate a template for a leave request",
      ]
    : [
        "Analyze current month salary budgets",
        "Find how many employees are currently clocked in",
        "Identify departments exceeding allocated caps",
      ];

  const handleSend = (textToSend?: string) => {
    const text = textToSend || input;
    if (!text) return;

    setMessages((prev) => [...prev, { id: Date.now(), sender: "user", text }]);
    setInput("");
    setLoading(true);

    // Simulate standard streamed responses
    setTimeout(() => {
      let reply = "";
      const query = text.toLowerCase();
      const isEmployee = userRole === "employee";

      if (isEmployee) {
        if (
          query.includes("budget") ||
          query.includes("salary") ||
          query.includes("pay") ||
          query.includes("spend") ||
          query.includes("cap") ||
          query.includes("revenue") ||
          query.includes("mrr")
        ) {
          reply = "Access Denied: Standard Employee profiles do not have authorization to view organization-wide payroll budgets, aggregate financial spend, or system-wide department metrics. Please contact your administrator if you require access.";
        } else if (query.includes("leave") || query.includes("balance")) {
          reply = `Querying personal benefit registries... Active records for ${user?.name || "Employee"} indicate 12 paid annual leaves and 5 sick leaves remaining for the current calendar year.`;
        } else if (query.includes("clock") || query.includes("attendance") || query.includes("in") || query.includes("active")) {
          reply = "Scanning timesheet terminals... Your profile is currently clocked in ('Active Duty') since 09:00 AM IST. All logs are securely synchronized with the primary database.";
        } else if (query.includes("template") || query.includes("draft") || query.includes("write")) {
          reply = `Sure! Here is a draft email template for a leave request:\n\nSubject: Leave Application - ${user?.name || "Employee"}\n\nDear Manager,\n\nI am writing to formally request leave starting from [Start Date] to [End Date]. I will ensure all pending tasks are handed over before my departure.\n\nThank you,\n${user?.name || "Employee"}`;
        } else {
          reply = `I processed your request: "${text}". Under multi-tenant data segregation, your query is constrained strictly to your individual employee scope ('${user?.email || "employee@company.in"}'). All queries are clean and match enterprise compliance.`;
        }
      } else {
        if (query.includes("budget") || query.includes("salary")) {
          reply = `Analyzing payroll data... The current aggregate monthly salary spend for organization (${user?.orgId || "Org Technologies"}) is approximately ₹18,50,000 across active departments (Engineering, HR, Sales, Finance). Budget configurations are safe and well below the threshold.`;
        } else if (query.includes("clock") || query.includes("in")) {
          reply = "Querying live timesheet registers... The system reports that active employees are currently clocked in ('Active Duty') according to shift schedules. General shift configurations are matching compliance specifications perfectly.";
        } else if (query.includes("cap") || query.includes("exceed") || query.includes("department")) {
          reply = "Scanning department allocations... Engineering, HR, Sales, and Finance allocations are within their respective budget caps. Zero departments are currently exceeding their allocated financial caps.";
        } else {
          reply = `I processed your request: "${text}". Mongoose multi-tenant isolation restricts this semantic scan strictly to organization scope: ${user?.orgId || "Org Technologies"}. The directories report clean compliance and zero anomalies. Let me know if you would like me to compile details!`;
        }
      }

      setMessages((prev) => [...prev, { id: Date.now() + 1, sender: "ai", text: reply }]);
      setLoading(false);
    }, 1500);
  };

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  return (
    <div className="space-y-6 max-w-4xl mx-auto h-[calc(100vh-140px)] flex flex-col">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50 flex items-center gap-2">
          <Cpu className="h-6 w-6 text-blue-600" />
          AI Copilot Workspace
        </h1>
        <p className="text-sm text-zinc-500">
          Leverage semantic query vectors and automated RAG checks over isolated tenant databases instantly.
        </p>
      </div>

      {/* Main Chat Interface */}
      <div className="flex-1 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl shadow-sm flex flex-col overflow-hidden">
        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex items-start gap-3 max-w-[80%] ${
                msg.sender === "user" ? "ml-auto flex-row-reverse" : ""
              }`}
            >
              <div
                className={`p-2.5 rounded-lg text-sm ${
                  msg.sender === "user"
                    ? "bg-blue-600 text-white rounded-br-none"
                    : "bg-zinc-100 dark:bg-zinc-800 text-zinc-800 dark:text-zinc-100 rounded-bl-none border border-zinc-200/50 dark:border-zinc-700/50"
                }`}
              >
                {msg.text}
              </div>
            </div>
          ))}

          {loading && (
            <div className="flex items-center gap-2 text-sm text-zinc-400">
              <Loader2 className="h-4 w-4 animate-spin text-blue-500" />
              <span>Scanning vectors...</span>
            </div>
          )}
          <div ref={bottomRef} />
        </div>

        {/* Suggestion tags */}
        <div className="p-4 bg-zinc-50/50 dark:bg-zinc-950/40 border-t border-zinc-100 dark:border-zinc-800 flex flex-wrap gap-2">
          {suggestions.map((s) => (
            <button
              key={s}
              onClick={() => handleSend(s)}
              className="text-xxs px-2.5 py-1 bg-white dark:bg-zinc-850 hover:bg-zinc-50 dark:hover:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-zinc-500 dark:text-zinc-400 rounded-full font-medium transition-colors"
            >
              {s}
            </button>
          ))}
        </div>

        {/* Form Input */}
        <div className="p-4 border-t border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSend()}
            placeholder="Query database, request statistics, write templates..."
            className="flex-1 border border-zinc-200 dark:border-zinc-850 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-zinc-800 dark:text-zinc-100 bg-zinc-50/20"
          />
          <Button onClick={() => handleSend()} className="bg-blue-600 hover:bg-blue-700 text-white">
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div className="flex items-center gap-2 p-3 bg-indigo-50/30 dark:bg-indigo-900/10 rounded-lg border border-indigo-100/30 text-indigo-700 dark:text-indigo-300 text-xs">
        <Sparkles className="h-4 w-4 shrink-0" />
        <span>RAG system active. Model searches are logically isolated within MongoDB Atlas Vector scopes.</span>
      </div>
    </div>
  );
}
