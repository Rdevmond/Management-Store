import { FiPieChart, FiShoppingBag } from 'react-icons/fi';
export default function DashboardCharts({
  activeChart,
  chartData,
  maxChartVal,
  categoryStats,
  criticalStats,
  txMix,
  fmt,
  colors = ['#1b305b', '#108e50', '#0284c7', '#d97706']
}) {
  return (
    <div className="relative flex-1 min-h-[220px] flex items-center justify-center">
      {activeChart === 'weeklySales' && (
        <svg className="w-full" height="220" style={{ minWidth: '300px' }}>
          {[40, 90, 140, 190].map(y => (
            <line key={y} x1="55" y1={y} x2="98%" y2={y} stroke="#f1f5f9" strokeWidth="1" />
          ))}
          <line x1="55" y1="190" x2="98%" y2="190" stroke="#e2e8f0" strokeWidth="1" />
          {chartData.map((d, i) => {
            const xPct = 15 + (i * (80 / (chartData.length - 1 || 1)));
            const rawIh = (d.income / (maxChartVal || 1)) * 148;
            const rawEh = (d.expense / (maxChartVal || 1)) * 148;
            const ih = Math.max(0, Math.min(148, rawIh));
            const eh = Math.max(0, Math.min(148, rawEh));
            return (
              <g key={d.dayStr}>
                <rect x={`${xPct}%`} dx="-10" y={190 - ih} width="16" height={ih || 0} fill="var(--color-dark-blue)" rx="3" opacity="0.88" style={{ transform: 'translateX(-10px)' }}>
                  <title>Pemasukan: {fmt(d.income)}</title>
                </rect>
                <rect x={`${xPct}%`} dx="8" y={190 - eh} width="16" height={eh || 0} fill="var(--color-brand-green)" rx="3" opacity="0.80" style={{ transform: 'translateX(8px)' }}>
                  <title>Pengeluaran: {fmt(d.expense)}</title>
                </rect>
                <text x={`${xPct}%`} dx="7" y="210" textAnchor="middle" fill="#94a3b8" fontSize="10" fontWeight="600">{d.label}</text>
              </g>
            );
          })}
          <text x="48" y="44" textAnchor="end" fill="#cbd5e1" fontSize="10" fontWeight="600">{fmt(maxChartVal)}</text>
          <text x="48" y="117" textAnchor="end" fill="#cbd5e1" fontSize="10" fontWeight="600">{fmt(maxChartVal / 2)}</text>
          <text x="48" y="194" textAnchor="end" fill="#cbd5e1" fontSize="10" fontWeight="600">Rp 0</text>
        </svg>
      )}
      {activeChart === 'categorySales' && (
        <div className="w-full h-full flex flex-col sm:flex-row items-center justify-around gap-6 py-2">
          <div className="relative w-36 h-36 shrink-0">
            <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
              <circle cx="18" cy="18" r="15.9" fill="none" stroke="#f1f5f9" strokeWidth="3" />
              {(() => {
                let offset = 0;
                return categoryStats.map((s, idx) => {
                  const dash = `${s.pct} ${100 - s.pct}`;
                  const el = (
                    <circle key={s.name} cx="18" cy="18" r="15.9" fill="none"
                      stroke={colors[idx]} strokeWidth="3.5"
                      strokeDasharray={dash} strokeDashoffset={100 - offset + 25}
                      className="transition-all duration-500" />
                  );
                  offset += s.pct;
                  return el;
                });
              })()}
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <FiPieChart className="text-slate-300 text-2xl" />
              <span className="text-xs text-slate-400 font-bold mt-0.5">MENU</span>
            </div>
          </div>
          <div className="flex-1 space-y-2.5 max-w-xs">
            {categoryStats.map((s, idx) => (
              <div key={s.name} className="space-y-1">
                <div className="flex justify-between text-xs">
                  <span className="flex items-center gap-1.5 font-semibold text-slate-600">
                    <span className="w-2 h-2 rounded-full shrink-0" style={{ background: colors[idx] }} />
                    {s.name}
                  </span>
                  <span className="font-bold text-slate-700">{s.count} ({s.pct}%)</span>
                </div>
                <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                  <div className="h-full rounded-full transition-all duration-500" style={{ width: `${s.pct}%`, background: colors[idx] }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
      {activeChart === 'stockCritical' && (
        <div className="w-full h-full flex flex-col justify-center space-y-4 px-2">
          <p className="text-xs text-slate-400 font-bold uppercase tracking-widest">Stok vs Batas Minimum:</p>
          {criticalStats.map(item => {
            const pct = Math.round(item.ratio * 100);
            const isLow = item.stock < item.minStock;
            return (
              <div key={item.name} className="space-y-1">
                <div className="flex justify-between text-xs">
                  <span className="font-semibold text-slate-700 truncate max-w-[55%]">{item.name}</span>
                  <span className={`font-bold ${isLow ? 'text-rose-500' : 'text-slate-500'}`}>
                    {item.stock} / {item.minStock} {item.unit}
                  </span>
                </div>
                <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                  <div className={`h-full rounded-full transition-all duration-500 ${isLow ? 'bg-rose-400' : 'bg-slate-900'}`}
                    style={{ width: `${Math.max(4, Math.min(100, pct))}%` }} />
                </div>
              </div>
            );
          })}
        </div>
      )}
      {activeChart === 'transactionMix' && (
        <div className="w-full h-full flex items-center gap-6 px-2">
          <div className="flex-1 space-y-5">
            {[
              { label: 'Volume Pemasukan', count: txMix.inc, pct: txMix.incPct, color: '#1b305b' },
              { label: 'Volume Pengeluaran', count: txMix.exp, pct: txMix.expPct, color: '#108e50' },
            ].map(row => (
              <div key={row.label} className="space-y-1.5">
                <div className="flex justify-between text-xs">
                  <span className="font-semibold text-slate-600">{row.label}</span>
                  <span className="font-bold" style={{ color: row.color }}>{row.count} mutasi ({row.pct}%)</span>
                </div>
                <div className="w-full h-3 bg-slate-100 rounded-lg overflow-hidden">
                  <div className="h-full rounded-lg transition-all duration-500" style={{ width: `${row.pct}%`, background: row.color }} />
                </div>
              </div>
            ))}
          </div>
          <div className="bg-slate-50 border border-slate-100 rounded-2xl p-4 text-center shrink-0 w-28">
            <FiShoppingBag className="text-slate-300 text-2xl mx-auto mb-1" />
            <span className="text-xs text-slate-400 font-bold uppercase block">Total Log</span>
            <span className="text-2xl font-bold text-slate-900">{txMix.total}</span>
          </div>
        </div>
      )}
    </div>
  );
}
