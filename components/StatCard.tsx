import React from 'react';

interface StatCardProps {
  label: string;
  value: string | number;
  icon: React.ReactNode;
  trend?: string;
  colorClass: string;
}

export const StatCard: React.FC<StatCardProps> = ({ label, value, icon, trend, colorClass }) => {
  return (
    <div className="relative overflow-hidden bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 p-6 rounded-2xl group hover:border-slate-600 transition-all duration-300">
      <div className={`absolute top-0 right-0 -mt-4 -mr-4 w-24 h-24 rounded-full blur-2xl opacity-10 ${colorClass} group-hover:opacity-20 transition-opacity`}></div>
      <div className="flex items-center justify-between relative z-10">
        <div>
          <p className="text-slate-400 text-sm font-medium mb-1">{label}</p>
          <h3 className="text-3xl font-bold text-white">{value}</h3>
          {trend && <p className="text-xs text-emerald-400 mt-2 font-medium">{trend}</p>}
        </div>
        <div className={`p-3 rounded-xl bg-slate-700/50 text-white shadow-inner`}>
          {icon}
        </div>
      </div>
    </div>
  );
};