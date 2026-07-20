export default function KPICard({ label, value, sub, icon: Icon, iconBg, iconColor, iconBorder, valueCls }) {
  return (
    <div className="bg-white rounded-2xl border border-slate-100 p-5 shadow-sm hover:shadow-[0_4px_20px_rgba(0,0,0,0.06)] transition-shadow">
      <div className="flex items-start justify-between gap-3 mb-3">
        <span className="text-xs font-bold text-slate-400 uppercase tracking-widest leading-relaxed">{label}</span>
        <span className={`p-2.5 rounded-xl text-sm border shrink-0 ${iconBg} ${iconColor} ${iconBorder}`}><Icon /></span>
      </div>
      <p className={`text-2xl font-black ${valueCls || 'text-slate-800'} leading-tight`}>{value}</p>
      <p className="text-xs text-slate-400 font-medium mt-1">{sub}</p>
    </div>
  );
}
