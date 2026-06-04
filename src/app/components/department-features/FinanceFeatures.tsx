import React from "react";
import { DollarSign, ArrowUpRight, ArrowDownRight, Wallet, PieChart } from "lucide-react";

export default function FinanceFeatures() {
  const accounts = [
    { name: "Operating Account", balance: "$450,200", trend: "+2.4%", isPositive: true },
    { name: "Payroll Reserve", balance: "$120,500", trend: "-0.5%", isPositive: false },
    { name: "Tax Escrow", balance: "$85,000", trend: "0.0%", isPositive: true },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-fade-in mt-6">
      {/* Budget Burn Rate */}
      <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-6 shadow-sm">
        <div className="flex items-center justify-between border-b border-zinc-100 dark:border-zinc-800 pb-3 mb-4">
          <h3 className="text-base font-bold flex items-center gap-2 text-zinc-900 dark:text-zinc-100">
            <PieChart className="h-5 w-5 text-violet-600" />
            Budget Burn Rate
          </h3>
          <span className="text-xxs px-2.5 py-1 font-bold rounded-full bg-violet-50 text-violet-600">
            FY 2026
          </span>
        </div>
        
        <div className="space-y-4">
          <div className="flex flex-col gap-1">
            <div className="flex justify-between items-center text-xs font-bold">
              <span>Engineering ($250k)</span>
              <span className="text-rose-600">85% Consumed</span>
            </div>
            <div className="h-2 w-full bg-zinc-100 dark:bg-zinc-800 rounded-full overflow-hidden">
              <div className="h-full bg-rose-500 rounded-full" style={{ width: '85%' }} />
            </div>
          </div>

          <div className="flex flex-col gap-1">
            <div className="flex justify-between items-center text-xs font-bold">
              <span>Sales ($180k)</span>
              <span className="text-amber-500">60% Consumed</span>
            </div>
            <div className="h-2 w-full bg-zinc-100 dark:bg-zinc-800 rounded-full overflow-hidden">
              <div className="h-full bg-amber-500 rounded-full" style={{ width: '60%' }} />
            </div>
          </div>

          <div className="flex flex-col gap-1">
            <div className="flex justify-between items-center text-xs font-bold">
              <span>Marketing ($120k)</span>
              <span className="text-emerald-500">30% Consumed</span>
            </div>
            <div className="h-2 w-full bg-zinc-100 dark:bg-zinc-800 rounded-full overflow-hidden">
              <div className="h-full bg-emerald-500 rounded-full" style={{ width: '30%' }} />
            </div>
          </div>
        </div>
      </div>

      {/* Cash Flow Summary */}
      <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-6 shadow-sm">
        <div className="flex items-center justify-between border-b border-zinc-100 dark:border-zinc-800 pb-3 mb-4">
          <h3 className="text-base font-bold flex items-center gap-2 text-zinc-900 dark:text-zinc-100">
            <Wallet className="h-5 w-5 text-blue-600" />
            Treasury Balances
          </h3>
        </div>
        
        <div className="space-y-3">
          {accounts.map((acc, idx) => (
            <div key={idx} className="flex justify-between items-center p-3 border border-zinc-100 dark:border-zinc-850 bg-zinc-50 dark:bg-zinc-950 rounded-xl text-xs">
              <div className="flex items-center gap-3">
                <div className="p-1.5 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-md">
                  <DollarSign className="h-4 w-4 text-zinc-500" />
                </div>
                <span className="font-bold text-zinc-800 dark:text-zinc-200">{acc.name}</span>
              </div>
              <div className="text-right">
                <span className="font-mono font-bold text-zinc-900 dark:text-zinc-100 block">{acc.balance}</span>
                <span className={`text-[10px] font-bold flex items-center gap-0.5 justify-end mt-0.5 ${acc.isPositive ? 'text-emerald-600' : 'text-rose-600'}`}>
                  {acc.isPositive ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownRight className="h-3 w-3" />}
                  {acc.trend}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
