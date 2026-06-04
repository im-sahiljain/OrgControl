import React from "react";
import { Target, Trophy, TrendingUp, DollarSign } from "lucide-react";

export default function SalesFeatures() {
  const currentRevenue = 1250000;
  const targetRevenue = 1500000;
  const progressPercent = Math.min(100, Math.round((currentRevenue / targetRevenue) * 100));

  const topPerformers = [
    { name: "Vikram Malhotra", amount: "$450k", deals: 12 },
    { name: "Neha Reddy", amount: "$380k", deals: 8 },
    { name: "Kabir Sen", amount: "$210k", deals: 5 },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-fade-in mt-6">
      {/* Quota Progress */}
      <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-6 shadow-sm flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between border-b border-zinc-100 dark:border-zinc-800 pb-3 mb-6">
            <h3 className="text-base font-bold flex items-center gap-2 text-zinc-900 dark:text-zinc-100">
              <Target className="h-5 w-5 text-emerald-600" />
              Q3 Revenue Quota
            </h3>
            <span className="text-xxs px-2.5 py-1 font-bold rounded-full bg-emerald-50 text-emerald-600">
              In Progress
            </span>
          </div>

          <div className="flex justify-between items-end mb-2">
            <div>
              <p className="text-xs text-zinc-500 font-medium mb-1">Current Achievement</p>
              <h4 className="text-3xl font-extrabold text-zinc-900 dark:text-zinc-100">
                ${(currentRevenue / 1000).toFixed(0)}k
              </h4>
            </div>
            <div className="text-right">
              <p className="text-xs text-zinc-500 font-medium mb-1">Target Goal</p>
              <h4 className="text-lg font-bold text-zinc-400">
                ${(targetRevenue / 1000).toFixed(0)}k
              </h4>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="h-4 w-full bg-zinc-100 dark:bg-zinc-800 rounded-full overflow-hidden mt-4">
            <div 
              className="h-full bg-gradient-to-r from-emerald-400 to-emerald-600 rounded-full transition-all duration-1000"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
          <div className="flex justify-between items-center mt-2">
            <span className="text-xs font-bold text-emerald-600">{progressPercent}% Achieved</span>
            <span className="text-xs font-medium text-zinc-400">{100 - progressPercent}% Remaining</span>
          </div>
        </div>
      </div>

      {/* Leaderboard */}
      <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-6 shadow-sm">
        <div className="flex items-center justify-between border-b border-zinc-100 dark:border-zinc-800 pb-3 mb-4">
          <h3 className="text-base font-bold flex items-center gap-2 text-zinc-900 dark:text-zinc-100">
            <Trophy className="h-5 w-5 text-amber-500" />
            Top Performers (MTD)
          </h3>
        </div>
        
        <div className="space-y-3">
          {topPerformers.map((person, idx) => (
            <div key={idx} className="flex justify-between items-center p-3 border border-zinc-100 dark:border-zinc-850 bg-zinc-50 dark:bg-zinc-950 rounded-xl text-xs">
              <div className="flex items-center gap-3">
                <div className={`h-6 w-6 rounded-full flex items-center justify-center font-bold text-white ${idx === 0 ? 'bg-amber-500' : idx === 1 ? 'bg-zinc-400' : 'bg-amber-700'}`}>
                  {idx + 1}
                </div>
                <div>
                  <span className="font-bold text-zinc-800 dark:text-zinc-200 block">{person.name}</span>
                  <span className="text-[10px] text-zinc-500">{person.deals} Deals Closed</span>
                </div>
              </div>
              <div className="text-right">
                <span className="font-mono font-bold text-zinc-900 dark:text-zinc-100 block">{person.amount}</span>
                <span className="text-[10px] text-emerald-600 font-bold flex items-center gap-0.5 justify-end mt-0.5">
                  <TrendingUp className="h-3 w-3" />
                  Leading
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
