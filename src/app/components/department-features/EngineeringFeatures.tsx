import React from "react";
import { Activity, Server, Database, CloudRain, PhoneCall, AlertCircle } from "lucide-react";

export default function EngineeringFeatures() {
  const services = [
    { name: "API Gateway", status: "operational", icon: Server },
    { name: "Auth Service", status: "operational", icon: Server },
    { name: "Main Database", status: "operational", icon: Database },
    { name: "CDN Edge", status: "degraded", icon: CloudRain },
  ];

  const onCallRoster = [
    { role: "Primary", name: "Suresh Kumar", time: "09:00 - 17:00 IST" },
    { role: "Secondary", name: "Ananya Patel", time: "17:00 - 01:00 IST" },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-fade-in mt-6">
      {/* System Health Monitor */}
      <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-6 shadow-sm">
        <div className="flex items-center justify-between border-b border-zinc-100 dark:border-zinc-800 pb-3 mb-4">
          <h3 className="text-base font-bold flex items-center gap-2 text-zinc-900 dark:text-zinc-100">
            <Activity className="h-5 w-5 text-blue-600" />
            System Health Monitor
          </h3>
          <span className="text-xxs px-2.5 py-1 font-bold rounded-full bg-blue-50 text-blue-600">
            Live Pulse
          </span>
        </div>
        
        <div className="space-y-3">
          {services.map((svc, idx) => (
            <div key={idx} className="flex justify-between items-center p-3 border border-zinc-100 dark:border-zinc-850 bg-zinc-50 dark:bg-zinc-950 rounded-xl text-xs">
              <div className="flex items-center gap-3">
                <svc.icon className="h-4 w-4 text-zinc-500" />
                <span className="font-bold text-zinc-800 dark:text-zinc-200">{svc.name}</span>
              </div>
              <span className={`text-[10px] uppercase font-extrabold px-2 py-0.5 rounded-full ${
                svc.status === 'operational' 
                  ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-400' 
                  : 'bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-400 animate-pulse'
              }`}>
                {svc.status}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* On-Call Roster */}
      <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-6 shadow-sm">
        <div className="flex items-center justify-between border-b border-zinc-100 dark:border-zinc-800 pb-3 mb-4">
          <h3 className="text-base font-bold flex items-center gap-2 text-zinc-900 dark:text-zinc-100">
            <PhoneCall className="h-5 w-5 text-rose-600" />
            PagerDuty Roster
          </h3>
          <span className="text-xxs px-2.5 py-1 font-bold rounded-full bg-rose-50 text-rose-600">
            Sev-1 Incidents
          </span>
        </div>
        
        <div className="space-y-3">
          {onCallRoster.map((person, idx) => (
            <div key={idx} className="p-4 border border-rose-100 dark:border-rose-900/30 bg-rose-50/50 dark:bg-rose-950/20 rounded-xl">
              <div className="flex justify-between items-start mb-2">
                <span className="text-xs font-bold text-rose-600 dark:text-rose-400 uppercase tracking-wider">{person.role}</span>
                <AlertCircle className="h-4 w-4 text-rose-400" />
              </div>
              <h4 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">{person.name}</h4>
              <p className="text-xs text-zinc-500 mt-0.5 font-medium">{person.time}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
