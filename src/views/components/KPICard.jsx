export default function KPICard({ label, value, sub, icon: Icon, iconBg, iconColor, iconBorder, valueCls }) {
  return (
    <div className="bg-white rounded-2xl border border-slate-100 p-5 shadow-sm hover:shadow-[0_4px_20px_rgba(0,0,0,0.06)] transition-shadow flex flex-col justify-between gap-4">
      <div className="flex items-center justify-between">
        <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">{label}</span>
        <span className={`p-2.5 rounded-xl text-sm border ${iconBg} ${iconColor} ${iconBorder}`}><Icon /></span>
      </div>
      <div>
        <p className={`text-xl font-bold ${valueCls || 'text-slate-800'}`}>{value}</p>
        <p className="text-xs text-slate-400 font-medium mt-0.5">{sub}</p>
      </div>
    </div>
  );
}
