import React from "react";
import { Users, Cake, Briefcase, GraduationCap, CalendarHeart } from "lucide-react";

export default function HRFeatures() {
  const milestones = [
    { name: "Suresh Kumar", event: "Work Anniversary (3 Years)", date: "Tomorrow", icon: Briefcase },
    { name: "Ananya Patel", event: "Birthday", date: "Oct 14", icon: Cake },
    { name: "Neha Reddy", event: "Work Anniversary (1 Year)", date: "Oct 22", icon: Briefcase },
  ];

  const requisitions = [
    { title: "Senior Frontend Engineer", dept: "Engineering", status: "Interviewing", candidates: 12 },
    { title: "Account Executive", dept: "Sales", status: "Sourcing", candidates: 4 },
    { title: "Financial Analyst", dept: "Finance", status: "Offer Extended", candidates: 1 },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-fade-in mt-6">
      {/* Upcoming Milestones */}
      <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-6 shadow-sm">
        <div className="flex items-center justify-between border-b border-zinc-100 dark:border-zinc-800 pb-3 mb-4">
          <h3 className="text-base font-bold flex items-center gap-2 text-zinc-900 dark:text-zinc-100">
            <CalendarHeart className="h-5 w-5 text-rose-500" />
            Upcoming Milestones
          </h3>
          <span className="text-xxs px-2.5 py-1 font-bold rounded-full bg-rose-50 text-rose-600">
            This Month
          </span>
        </div>
        
        <div className="space-y-3">
          {milestones.map((ms, idx) => (
            <div key={idx} className="flex justify-between items-center p-3 border border-zinc-100 dark:border-zinc-850 bg-zinc-50 dark:bg-zinc-950 rounded-xl text-xs">
              <div className="flex items-center gap-3">
                <div className="p-1.5 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-md">
                  <ms.icon className="h-4 w-4 text-rose-500" />
                </div>
                <div>
                  <span className="font-bold text-zinc-800 dark:text-zinc-200 block">{ms.name}</span>
                  <span className="text-[10px] text-zinc-500">{ms.event}</span>
                </div>
              </div>
              <span className="font-bold text-zinc-900 dark:text-zinc-100 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 px-2 py-1 rounded-md">
                {ms.date}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Open Requisitions */}
      <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-6 shadow-sm">
        <div className="flex items-center justify-between border-b border-zinc-100 dark:border-zinc-800 pb-3 mb-4">
          <h3 className="text-base font-bold flex items-center gap-2 text-zinc-900 dark:text-zinc-100">
            <Users className="h-5 w-5 text-emerald-600" />
            Open Requisitions
          </h3>
          <span className="text-xxs px-2.5 py-1 font-bold rounded-full bg-emerald-50 text-emerald-600">
            Active
          </span>
        </div>
        
        <div className="space-y-3">
          {requisitions.map((req, idx) => (
            <div key={idx} className="p-3 border border-zinc-100 dark:border-zinc-850 bg-zinc-50 dark:bg-zinc-950 rounded-xl text-xs">
              <div className="flex justify-between items-start mb-2">
                <span className="font-bold text-zinc-800 dark:text-zinc-200">{req.title}</span>
                <span className="text-[10px] uppercase font-extrabold px-1.5 py-0.5 rounded-full bg-zinc-200 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400">
                  {req.dept}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className={`text-[10px] font-bold flex items-center gap-1 ${
                  req.status === 'Offer Extended' ? 'text-emerald-600' : 'text-amber-600'
                }`}>
                  <div className={`h-1.5 w-1.5 rounded-full ${req.status === 'Offer Extended' ? 'bg-emerald-500' : 'bg-amber-500'}`} />
                  {req.status}
                </span>
                <span className="text-[10px] text-zinc-500 font-medium">
                  {req.candidates} Pipeline Candidates
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
