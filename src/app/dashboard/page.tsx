"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { useSelector } from "react-redux";
import axios from "axios";
import {
  Users,
  Clock,
  CalendarCheck2,
  TrendingUp,
  Cpu,
  Coins,
  Settings,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  Award,
  Terminal,
  Activity,
  ChevronRight,
  TrendingDown,
  Building,
  UserCheck,
} from "lucide-react";
import type { RootState } from "../reduxToolkit/store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import DepartmentFeatureCard from "../components/DepartmentFeatureCard";
// import UnscreenedResumesWidget from "../components/UnscreenedResumesWidget";
import ResumeReviewDashboardWidget from "../components/ResumeReviewDashboardWidget";
import {
  resolveDepartmentRole,
  getVisibleFeatures,
  getRoleLabel,
  getDataScope,
  getFeatureAccessLevel,
} from "@/lib/roleResolver";
import {
  getFeatureById,
  getDefaultFeatureIdsForDept,
} from "@/lib/departmentRegistry";

export default function Dashboard() {
  const user = useSelector((state: RootState) => state.employeeUI.user);

  // Fetch employees list
  // const { data: employees, isLoading: isEmployeesLoading } = useQuery({
  //   queryKey: ["employees"],
  //   queryFn: async () => {
  //     const res = await axios.get(`/api/employees?orgId=${user?.orgId}`);
  //     return res.data.data || [];
  //   },
  //   enabled: !!user?.orgId,
  // });

  // Fetch departments list
  // const { data: departments, isLoading: isDepartmentsLoading } = useQuery({
  //   queryKey: ["departments"],
  //   queryFn: async () => {
  //     const res = await axios.get(`/api/departments?orgId=${user?.orgId}`);
  //     return res.data.data || [];
  //   },
  //   enabled: !!user?.orgId,
  // });

  // Fetch organizations list for platform admin
  const { data: organizations, isLoading: isOrganizationsLoading } = useQuery({
    queryKey: ["organizations"],
    queryFn: async () => {
      const res = await axios.get("/api/organizations");
      return res.data.data || [];
    },
    enabled: user?.role === "platform_admin",
  });

  // HR Admin preview control state
  const [adminDeptPreview, setAdminDeptPreview] = useState<string>("");

  // Auto-initialize department preview for HR Admins to Human Resources
  useEffect(() => {
    setAdminDeptPreview("Human Resources");
  }, []);

  // ----------------------------------------------------
  // INTERACTIVE MOCK STATE TRIGGERS FOR WIDGETS
  // ----------------------------------------------------

  // 1. Engineering Build Simulator
  const [buildLogs, setBuildLogs] = useState<string[]>([]);
  const [isBuilding, setIsBuilding] = useState<boolean>(false);
  const handleTriggerBuild = () => {
    setIsBuilding(true);
    setBuildLogs(["[CI/CD] Launching mock production compile pipeline..."]);

    const steps = [
      "[CI/CD] Resolving code dependency trees (Turbo)... Complete.",
      "[CI/CD] Running standard code linter rules... Clean.",
      "[CI/CD] Compiling NextJS edge serverless functions...",
      "[CI/CD] Pushing compiled assets to MongoDB Atlas cluster...",
      "[CI/CD] Deploying edge chunks to global Vercel serverless pool...",
      "[CI/CD] Live Production deployment online! 🚀",
    ];

    steps.forEach((step, idx) => {
      setTimeout(
        () => {
          setBuildLogs((prev) => [...prev, step]);
          if (idx === steps.length - 1) {
            setIsBuilding(false);
          }
        },
        (idx + 1) * 900,
      );
    });
  };

  // 2. Sales Opportunity pipeline
  const [salesOpportunities, setSalesOpportunities] = useState<any[]>([
    { client: "Tata Consulting Services", amount: 180000, stage: "Closed Won" },
    { client: "Reliance Retail", amount: 250000, stage: "Proposal" },
    { client: "Adani Ventures", amount: 95000, stage: "Prospecting" },
  ]);
  const [clientName, setClientName] = useState("");
  const [dealAmount, setDealAmount] = useState("");
  const [dealStage, setDealStage] = useState("Prospecting");
  const handleAddOpportunity = () => {
    if (!clientName || !dealAmount) return;
    setSalesOpportunities([
      ...salesOpportunities,
      { client: clientName, amount: Number(dealAmount), stage: dealStage },
    ]);
    setClientName("");
    setDealAmount("");
  };

  // 3. Finance Treasury Expenses
  const [expensesClaims, setExpensesClaims] = useState<any[]>([
    {
      title: "AWS Edge Server Invoicing",
      amount: 45000,
      category: "Infrastructure",
    },
    {
      title: "Shared Office Internet lease",
      amount: 15000,
      category: "Operations",
    },
    { title: "Regional Travel Allowance", amount: 8000, category: "Travel" },
  ]);
  const [expenseTitle, setExpenseTitle] = useState("");
  const [expenseAmount, setExpenseAmount] = useState("");
  const [expenseCategory, setExpenseCategory] = useState("Operations");
  const handleAddExpense = () => {
    if (!expenseTitle || !expenseAmount) return;
    setExpensesClaims([
      ...expensesClaims,
      {
        title: expenseTitle,
        amount: Number(expenseAmount),
        category: expenseCategory,
      },
    ]);
    setExpenseTitle("");
    setExpenseAmount("");
  };

  // 4. HR Interview Schedulers
  const [interviews, setInterviews] = useState<any[]>([
    {
      candidate: "Siddharth Sen",
      position: "Fullstack Dev",
      date: "June 3, 2026",
    },
    {
      candidate: "Priya Murthy",
      position: "UI/UX Architect",
      date: "June 5, 2026",
    },
  ]);
  const [candidateName, setCandidateName] = useState("");
  const [jobPosition, setJobPosition] = useState("");
  const [interviewDate, setInterviewDate] = useState("");
  const handleAddInterview = () => {
    if (!candidateName || !jobPosition || !interviewDate) return;
    setInterviews([
      ...interviews,
      { candidate: candidateName, position: jobPosition, date: interviewDate },
    ]);
    setCandidateName("");
    setJobPosition("");
    setInterviewDate("");
  };

  const isPageLoading = !user;

  if (isPageLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="flex flex-col items-center space-y-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <p className="text-sm font-medium text-zinc-550 dark:text-zinc-400">
            Loading session credentials...
          </p>
        </div>
      </div>
    );
  }

  // ----------------------------------------------------
  // HIERARCHY RESOLUTION LOGIC
  // ----------------------------------------------------
  // This is now handled by our central roleResolver utility, which we call below
  // when we find the user's active department.

  // ----------------------------------------------------
  // PLATFORM OWNER VIEW
  // ----------------------------------------------------
  if (user?.role === "platform_admin") {
    return (
      <div className="space-y-8 animate-fade-in">
        <div className="bg-linear-to-r from-zinc-900 to-zinc-850 text-white rounded-2xl p-6 md:p-8 shadow-xl border border-zinc-800 relative overflow-hidden">
          <div className="max-w-2xl">
            <h1 className="text-3xl font-extrabold tracking-tight mb-2">
              Platform Owner Administration
            </h1>
            <p className="text-zinc-400 text-sm">
              Global multi-tenant metrics, MongoDB Atlas active connection
              pools, MRR clusters, and tenant suspension gates.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-6 shadow-sm">
            <span className="text-xs text-zinc-400 font-bold block mb-1">
              Global Active Tenants
            </span>
            {isOrganizationsLoading ? (
              <div className="h-8 bg-zinc-200 dark:bg-zinc-800 rounded w-24 animate-pulse mt-1" />
            ) : (
              <h3 className="text-2xl font-bold text-zinc-900 dark:text-zinc-55">
                {organizations?.length || 0} Organizations
              </h3>
            )}
            <span className="text-xxs text-emerald-500 font-semibold block mt-1.5">
              ✓ All system modules operational
            </span>
          </div>
          <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-6 shadow-sm">
            <span className="text-xs text-zinc-400 block font-bold mb-1">
              SaaS MRR Growth
            </span>
            <h3 className="text-2xl font-bold text-zinc-900 dark:text-zinc-55">
              ₹8,45,000 / mo
            </h3>
            <span className="text-xxs text-blue-500 font-semibold block mt-1.5">
              ▲ +14.2% month-on-month
            </span>
          </div>
          <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-6 shadow-sm">
            <span className="text-xs text-zinc-400 block font-bold mb-1">
              Atlas M0 Connection Pools
            </span>
            {isOrganizationsLoading ? (
              <div className="h-8 bg-zinc-200 dark:bg-zinc-800 rounded w-24 animate-pulse mt-1" />
            ) : (
              <h3 className="text-2xl font-bold text-zinc-900 dark:text-zinc-55">
                9 Active Pools
              </h3>
            )}
            <span className="text-xxs text-zinc-400 font-medium block mt-1.5">
              Uptime logs synchronized cleanly
            </span>
          </div>
        </div>

        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-6 shadow-sm space-y-4">
          <h3 className="font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
            <ShieldCheck className="h-5 w-5 text-blue-600" />
            Global Tenants Cluster Control
          </h3>
          <div className="border border-zinc-150 dark:border-zinc-850 rounded-xl overflow-hidden text-xs">
            <div className="bg-zinc-50 dark:bg-zinc-950 p-3 border-b border-zinc-150 dark:border-zinc-850 font-bold text-zinc-500 flex justify-between">
              <span>Organization Tenant Name (ID)</span>
              <span>Status Gate</span>
            </div>
            {isOrganizationsLoading ? (
              <div className="p-4 space-y-3 animate-pulse">
                {[1, 2, 3].map((i) => (
                  <div
                    key={i}
                    className="flex justify-between items-center py-2 border-b border-zinc-100 dark:border-zinc-800/40 last:border-b-0"
                  >
                    <div className="space-y-1.5 flex-1">
                      <div className="h-4 bg-zinc-200 dark:bg-zinc-800 rounded w-1/3" />
                      <div className="h-3 bg-zinc-200 dark:bg-zinc-800 rounded w-1/2" />
                    </div>
                    <div className="h-5 bg-zinc-200 dark:bg-zinc-800 rounded w-12" />
                  </div>
                ))}
              </div>
            ) : organizations && organizations.length > 0 ? (
              organizations.map((org: any) => (
                <div
                  key={org._id}
                  className="p-3.5 bg-white dark:bg-zinc-900 flex justify-between items-center border-b border-zinc-100 dark:border-zinc-850 last:border-b-0"
                >
                  <div>
                    <span className="font-bold block text-zinc-800 dark:text-zinc-200">
                      {org.name} ({org.slug})
                    </span>
                    <span className="text-xxs text-zinc-400 block mt-0.5">
                      Admin: {org.adminEmail} | Plan: {org.plan}
                    </span>
                  </div>
                  <span
                    className={`px-2 py-1 rounded-full font-bold text-xxs ${
                      org.status === "active"
                        ? "bg-emerald-50 text-emerald-600"
                        : "bg-amber-50 text-amber-600"
                    }`}
                  >
                    {org.status}
                  </span>
                </div>
              ))
            ) : (
              <div className="p-4 text-center text-zinc-400 italic">
                No organizations found in database.
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  // const userDept = departments?.find((d: any) => d.name === user?.department);
  // const roleContext = resolveDepartmentRole(userDept, user?.id || "");
  // const roleLabel = getRoleLabel(roleContext.role);
  // const dataScope = getDataScope(roleContext.role);
  // const isLead =
  //   roleContext.role === "department_head" ||
  //   roleContext.role === "team_manager";

  // ----------------------------------------------------
  // ORGANIZATIONAL ADMIN (HR) VIEW
  // ----------------------------------------------------
  if (user?.role === "org_admin") {
    // Look up the preview department settings
    // const activePreviewDept = departments?.find(
    //   (d: any) => d.name === adminDeptPreview,
    // );
    // const previewHeadNames =
    //   activePreviewDept?.headIds
    //     ?.map(
    //       (id: string) =>
    //         employees?.find((e: any) => e._id === id || e.id === id)?.empName,
    //     )
    //     .filter(Boolean)
    //     .join(", ") || "Vacant";

    // const totalStaffCount = employees?.length || 0;
    // const totalDeptsCount = departments?.length || 0;

    return (
      <div className="space-y-8 animate-fade-in">
        {/* Admin Overview Header */}
        <div className="bg-linear-to-r from-blue-600 to-indigo-600 text-white rounded-2xl p-6 md:p-8 shadow-md relative overflow-hidden">
          <div className="max-w-3xl relative z-10">
            <h1 className="text-3xl font-extrabold tracking-tight mb-2">
              Welcome to your Org Workspace
            </h1>
            <p className="text-blue-100 text-sm">
              Supervise multi-tenant directories, monitor leaves & clock logs,
              process payroll systems, and configure layout configurators.
            </p>
          </div>
        </div>

        {/* Resume Review Workspace Metrics */}
        {user?.orgId && <ResumeReviewDashboardWidget orgId={user.orgId} />}

        {/* {user?.orgId && <UnscreenedResumesWidget orgId={user.orgId} />} */}

        {/* HR Dashboard Live Layout Preview Widget */}
        <div className="hidden bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-850 rounded-2xl p-6 space-y-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-zinc-200/60 pb-4">
            <div className="space-y-1">
              <h2 className="text-lg font-bold text-zinc-900 dark:text-zinc-50 flex items-center gap-2">
                <Settings className="h-5 w-5 text-blue-600 animate-spin-slow" />
                Department Dashboard Layout Live Preview Sandbox
              </h2>
              <p className="text-xs text-zinc-500 leading-relaxed">
                Choose any active department below to preview and test the exact
                visual dashboard configured for that team division.
              </p>
            </div>

            {/* Department Preview Selector (Hidden in UI to enforce CHRO HR view) */}
            {/* <div className="hidden items-center gap-2">
              <span className="text-xs font-bold text-zinc-500 whitespace-nowrap">
                Preview Active Board:
              </span>
              <select
                value={adminDeptPreview}
                onChange={(e) => setAdminDeptPreview(e.target.value)}
                className="px-3 py-1.5 border border-zinc-200 dark:border-zinc-800 rounded-lg bg-white dark:bg-zinc-900 text-xs focus:outline-none font-bold focus:ring-1 focus:ring-blue-500 text-zinc-850 dark:text-zinc-100"
              >
                {departments?.map((d: any) => (
                  <option key={d._id || d.id} value={d.name}>
                    {d.name} Layout
                  </option>
                ))}
              </select>
            </div> */}
          </div>

          {/* {activePreviewDept ? (
            <div className="space-y-6">
              {/* Preview Info Tag 
              <div className="bg-white dark:bg-zinc-900 border border-zinc-150 dark:border-zinc-800 rounded-xl p-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="space-y-1">
                  <span className="text-xs text-zinc-400 font-bold block uppercase tracking-wider">
                    Previewing Layout Mode:
                  </span>
                  <h3 className="text-base font-bold text-zinc-900 dark:text-zinc-50 flex items-center gap-1.5">
                    <Building className="h-4.5 w-4.5 text-blue-600" />
                    {activePreviewDept.name} Department Workspace
                  </h3>
                </div>

                <div className="grid grid-cols-2 gap-x-8 gap-y-1.5 text-xs font-semibold text-zinc-500">
                  <div className="flex justify-between gap-4">
                    <span>Oversight Head:</span>
                    {/* <span className="text-blue-600 dark:text-blue-400">
                      {previewHeadNames}
                    </span> 
                  </div>
                  <div className="flex justify-between gap-4">
                    <span>Sub-team Blocks:</span>
                    <span className="text-zinc-800 dark:text-zinc-200">
                      {activePreviewDept.managers?.length || 0} Managers
                    </span>
                  </div>
                  <div className="flex justify-between gap-4">
                    <span>Annual Budget Cap:</span>
                    <span className="text-zinc-800 dark:text-zinc-200 font-mono">
                      ₹{activePreviewDept.budget?.annual?.toLocaleString()}
                    </span>
                  </div>
                  <div className="flex justify-between gap-4">
                    <span>Features & Modules:</span>
                    <span className="text-violet-600 font-bold">
                      {
                        getDefaultFeatureIdsForDept(
                          activePreviewDept.slug,
                        ).filter((id) => getFeatureById(id)?.implemented).length
                      }{" "}
                      Active
                    </span>
                  </div>
                </div>
              </div>

              {/* Dynamic Mounted Widgets Render 
              {(() => {
                const combinedWidgets = getDefaultFeatureIdsForDept(
                  activePreviewDept.slug,
                );
                if (combinedWidgets.length === 0) {
                  return (
                    <div className="text-center py-16 border border-dashed border-zinc-200 dark:border-zinc-800 rounded-xl bg-white text-zinc-400 text-xs">
                      No active dashboard widgets are currently enabled for the
                      "{activePreviewDept.name}" department.
                    </div>
                  );
                }
                return (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {combinedWidgets.map((widgetId: string) => {
                      const predefinedFeature = getFeatureById(widgetId);
                      // Only show features that have been implemented
                      if (!predefinedFeature || !predefinedFeature.implemented)
                        return null;
                      const accessLevel = getFeatureAccessLevel(
                        predefinedFeature,
                        "department_head",
                      ); // Preview as head
                      return (
                        <DepartmentFeatureCard
                          key={widgetId}
                          feature={predefinedFeature}
                          accessLevel={accessLevel}
                          dataScope="department_wide"
                          roleLabel="Preview (Head)"
                        />
                      );
                    })}
                  </div>
                );
              })()}
            </div>
          ) : (
            <div className="text-center py-12 text-zinc-400 text-xs">
              Loading preview specifications...
            </div>
          )} */}
        </div>
      </div>
    );
  }

  // ----------------------------------------------------
  // GENERAL DEPARTMENT STAFF (ENGINEER / SALES / FINANCE) VIEW
  // ----------------------------------------------------
  // if (user?.role === "employee" && user?.department) {
  //   // const isWidgetEnabled = (widgetId: string) => {
  //   //   return userDept?.enabledWidgets?.includes(widgetId) || false;
  //   // };

  //   return (
  //     <div className="space-y-8 animate-fade-in">
  //       {/* Employee Welcome Banner */}
  //       <div className="bg-linear-to-r from-violet-600 to-indigo-600 text-white rounded-2xl p-6 md:p-8 shadow-md relative overflow-hidden">
  //         <div className="absolute top-0 right-0 p-8 opacity-10">
  //           <Award className="h-48 w-48 rotate-12" />
  //         </div>
  //         <div className="max-w-2xl relative z-10">
  //           <h1 className="text-3xl font-extrabold tracking-tight mb-2">
  //             Namaste, {user.name}!
  //           </h1>
  //           <p className="text-violet-100 text-sm mb-6 leading-relaxed">
  //             Welcome to your dedicated department workspace. Below are the
  //             customized active dashboard cards configured for the **
  //             {user.department}** department.
  //           </p>

  //           {/* Hierarchy Badge Card & Configurator */}
  //           {/* <div className="flex items-center gap-3">
  //             <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-violet-850/50 rounded-lg border border-violet-500/35 text-xs font-semibold">
  //               <UserCheck className="h-4 w-4 text-violet-300" />
  //               <span>Role Privilege: {roleLabel}</span>
  //             </div>
  //           </div> */}
  //         </div>
  //       </div>

  //       {/* {user?.department === "Human Resources" && user?.orgId && (
  //         <UnscreenedResumesWidget orgId={user.orgId} />
  //       )} */}

  //       {/* Dynamic Mounted Widgets Render */}
  //       {/* {(() => {
  //         if (isDepartmentsLoading) {
  //           return (
  //             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-pulse">
  //               {[1, 2, 3].map((i) => (
  //                 <div
  //                   key={i}
  //                   className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-6 h-48 flex flex-col justify-between"
  //                 >
  //                   <div className="space-y-3">
  //                     <div className="h-5 bg-zinc-200 dark:bg-zinc-800 rounded w-1/3" />
  //                     <div className="h-3 bg-zinc-200 dark:bg-zinc-800 rounded w-2/3" />
  //                     <div className="h-3 bg-zinc-200 dark:bg-zinc-800 rounded w-1/2" />
  //                   </div>
  //                   <div className="h-8 bg-zinc-200 dark:bg-zinc-800 rounded w-full" />
  //                 </div>
  //               ))}
  //             </div>
  //           );
  //         }
  //         const combinedWidgets = getDefaultFeatureIdsForDept(userDept?.slug);
  //         if (combinedWidgets.length === 0) {
  //           return (
  //             <div className="text-center py-20 border border-dashed border-zinc-200 dark:border-zinc-800 rounded-xl bg-white dark:bg-zinc-900 text-zinc-400 text-xs">
  //               No active dashboard modules are currently configured for your
  //               department ("{user.department}").
  //               <div className="mt-2 text-xxs font-medium text-zinc-400">
  //                 Please contact your HR Administrator (Sahil) to map team
  //                 trees!
  //               </div>
  //             </div>
  //           );
  //         }
  //         return (
  //           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
  //             {combinedWidgets.map((widgetId: string) => {
  //               const predefinedFeature = getFeatureById(widgetId);
  //               // Only show features that have been implemented
  //               if (!predefinedFeature || !predefinedFeature.implemented)
  //                 return null;
  //               const accessLevel = getFeatureAccessLevel(
  //                 predefinedFeature,
  //                 roleContext.role,
  //               );
  //               // Hide features that the user has 'none' access to completely
  //               if (accessLevel === "none") return null;

  //               return (
  //                 <DepartmentFeatureCard
  //                   key={widgetId}
  //                   feature={predefinedFeature}
  //                   accessLevel={accessLevel}
  //                   dataScope={dataScope}
  //                   roleLabel={roleLabel}
  //                 />
  //               );
  //             })}
  //           </div>
  //         );
  //       })()} */}
  //     </div>
  //   );
  // }

  // ----------------------------------------------------
  // GENERAL FALLBACK IF ROLE NOT RESOLVED
  // ----------------------------------------------------
  // return (
  //   <div className="space-y-6 animate-fade-in">
  //     <div className="text-center py-20 border border-zinc-200 rounded-xl bg-white space-y-4">
  //       <h2 className="text-xl font-bold">Establishing Workspace Session...</h2>
  //       <p className="text-sm text-zinc-400">
  //         Resolving organizational credentials from MongoDB.
  //       </p>
  //       <Link
  //         href="/"
  //         className="text-xs font-semibold px-4 py-2 bg-blue-600 text-white rounded-lg inline-block"
  //       >
  //         Go to Authentication PRESSETS
  //       </Link>
  //     </div>
  //   </div>
  // );
}
