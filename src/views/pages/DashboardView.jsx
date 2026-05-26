import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { 
  FiAlertTriangle, FiDollarSign, FiPackage, FiTrendingUp,
  FiArrowRight, FiFileText, FiActivity, FiPieChart, FiShoppingBag
} from 'react-icons/fi';

const fmt = (n) => 'Rp ' + Number(n).toLocaleString('id-ID');

const KPICard = ({ label, value, sub, icon: Icon, iconBg, iconColor, iconBorder, valueCls }) => (
  <div className="bg-white rounded-2xl border border-slate-100 p-5 shadow-[0_2px_12px_rgba(0,0,0,0.03)] hover:shadow-[0_4px_20px_rgba(0,0,0,0.06)] transition-shadow flex flex-col justify-between gap-4">
    <div className="flex items-center justify-between">
      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{label}</span>
      <span className={`p-2.5 rounded-xl text-sm border ${iconBg} ${iconColor} ${iconBorder}`}><Icon /></span>
    </div>
    <div>
      <p className={`text-xl font-bold ${valueCls || 'text-slate-800'}`}>{value}</p>
      <p className="text-[11px] text-slate-400 font-medium mt-0.5">{sub}</p>
    </div>
  </div>
);

export default function DashboardView({ controller }) {
  const { todayMetrics, allTimeSummary, inventory, finance, products, chartData, maxChartVal } = controller;
  const [activeChart, setActiveChart] = useState('weeklySales');

  const lowStockItems = useMemo(() => inventory.filter(i => i.stock < i.minStock), [inventory]);

  const categoryStats = useMemo(() => {
    const cats = ['Es Salju Buah', 'Es Salju Susu / Bingsoo', 'Kietna', 'Minuman'];
    const dist = cats.map(cat => ({ name: cat, count: products.filter(p => p.category === cat).length }));
    const total = dist.reduce((s, c) => s + c.count, 0) || 1;
    return dist.map(d => ({ ...d, pct: Math.round((d.count / total) * 100) }));
  }, [products]);

  const criticalStats = useMemo(() =>
    [...inventory].sort((a, b) => (a.stock / a.minStock) - (b.stock / b.minStock)).slice(0, 5)
      .map(i => ({ ...i, ratio: Math.min(i.minStock > 0 ? i.stock / i.minStock : 1, 1.2) }))
  , [inventory]);

  const txMix = useMemo(() => {
    let inc = 0, exp = 0;
    finance.forEach(f => f.type === 'pemasukan' ? inc++ : exp++);
    const total = inc + exp || 1;
    return { inc, exp, incPct: Math.round(inc / total * 100), expPct: Math.round(exp / total * 100), total };
  }, [finance]);

  const CHART_TABS = [
    { id: 'weeklySales',    label: '7 Hari' },
    { id: 'categorySales',  label: 'Kategori' },
    { id: 'stockCritical',  label: 'Stok' },
    { id: 'transactionMix', label: 'Rasio Kas' },
  ];
  const COLORS = ['#1b305b', '#108e50', '#0284c7', '#d97706'];

  return (
    <div className="space-y-6 animate-[fadeIn_0.4s_ease-out]">

      {/* ── Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-5 border-b border-slate-200/70">
        <div>
          <h2 className="text-xl font-bold text-[#1b305b] tracking-tight">Ringkasan Dasbor</h2>
          <p className="text-slate-400 text-[11px] font-medium mt-0.5">Analisis harian penjualan &amp; manajemen stok bahan baku.</p>
        </div>
        <div className="px-3.5 py-2 bg-white border border-slate-100 rounded-xl text-[11px] text-slate-500 font-semibold shadow-sm select-none whitespace-nowrap">
          📅 {new Date().toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
        </div>
      </div>

      {/* ── Low Stock Alert ── */}
      {lowStockItems.length > 0 && (
        <div className="flex items-start gap-3 bg-rose-50 border border-rose-100 rounded-2xl p-4">
          <FiAlertTriangle className="text-rose-500 text-lg shrink-0 mt-0.5" />
          <div className="flex-1 min-w-0">
            <p className="text-[11px] font-bold text-rose-800">Bahan baku menipis di gudang</p>
            <p className="text-[11px] text-rose-600 font-medium mt-0.5 leading-relaxed">
              {lowStockItems.map(i => `${i.name} (${i.stock} ${i.unit})`).join(' · ')}
            </p>
          </div>
          <Link to="/inventaris" className="text-[10px] font-bold text-rose-600 hover:text-rose-800 transition-colors shrink-0 flex items-center gap-0.5 mt-0.5">
            Restock <FiArrowRight />
          </Link>
        </div>
      )}

      {/* ── KPI Cards ── */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        <KPICard
          label="Omzet Hari Ini"
          value={fmt(todayMetrics.totalSales)}
          sub={`${todayMetrics.countTrx} transaksi berhasil`}
          icon={FiTrendingUp}
          iconBg="bg-emerald-50" iconColor="text-[#108e50]" iconBorder="border-emerald-100"
          valueCls="text-slate-800"
        />
        <KPICard
          label="Persediaan Kritis"
          value={`${todayMetrics.lowStockCount} Bahan`}
          sub={todayMetrics.lowStockCount > 0 ? 'Butuh tambahan segera.' : 'Seluruh persediaan aman.'}
          icon={FiPackage}
          iconBg={todayMetrics.lowStockCount > 0 ? 'bg-rose-50' : 'bg-sky-50'}
          iconColor={todayMetrics.lowStockCount > 0 ? 'text-rose-500' : 'text-[#1b305b]'}
          iconBorder={todayMetrics.lowStockCount > 0 ? 'border-rose-100' : 'border-sky-100'}
          valueCls={todayMetrics.lowStockCount > 0 ? 'text-rose-600' : 'text-slate-800'}
        />
        <KPICard
          label="Estimasi Laba Bersih"
          value={fmt(allTimeSummary.profit)}
          sub="Selisih pemasukan vs operasional."
          icon={FiDollarSign}
          iconBg="bg-blue-50" iconColor="text-[#1b305b]" iconBorder="border-blue-100"
          valueCls={allTimeSummary.profit >= 0 ? 'text-slate-800' : 'text-rose-600'}
        />
      </div>

      {/* ── Charts + Activity ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">

        {/* Dynamic Chart Panel */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-100 shadow-[0_2px_12px_rgba(0,0,0,0.03)] p-5 flex flex-col">
          {/* Chart header */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-5">
            <h3 className="text-[11px] font-bold text-[#1b305b] uppercase tracking-widest flex items-center gap-2">
              <FiActivity className="text-[#108e50]" /> Grafik Visual Dinamis
            </h3>
            <div className="flex gap-1 bg-slate-50 border border-slate-100 p-1 rounded-xl shrink-0">
              {CHART_TABS.map(t => (
                <button key={t.id} onClick={() => setActiveChart(t.id)}
                  className={`px-3 py-1.5 rounded-lg text-[10px] font-bold transition-all ${
                    activeChart === t.id ? 'bg-white text-[#1b305b] shadow-sm' : 'text-slate-400 hover:text-slate-700'
                  }`}>
                  {t.label}
                </button>
              ))}
            </div>
          </div>

          {/* Chart area */}
          <div className="relative flex-1 min-h-[220px] flex items-center justify-center">

            {/* 1 — Weekly bar chart */}
            {activeChart === 'weeklySales' && (
              <svg className="w-full h-full" viewBox="0 0 600 220" preserveAspectRatio="none">
                {[40, 90, 140, 190].map(y => (
                  <line key={y} x1="48" y1={y} x2="585" y2={y} stroke="#f1f5f9" strokeWidth="1" />
                ))}
                <line x1="48" y1="190" x2="585" y2="190" stroke="#e2e8f0" strokeWidth="1" />
                {chartData.map((d, i) => {
                  const x = 70 + i * 76;
                  const ih = (d.income  / (maxChartVal || 1)) * 148;
                  const eh = (d.expense / (maxChartVal || 1)) * 148;
                  return (
                    <g key={d.dayStr}>
                      <rect x={x}    y={190 - ih} width="18" height={ih || 0} fill="#1b305b" rx="3" opacity="0.88">
                        <title>Pemasukan: {fmt(d.income)}</title>
                      </rect>
                      <rect x={x+22} y={190 - eh} width="18" height={eh || 0} fill="#108e50" rx="3" opacity="0.80">
                        <title>Pengeluaran: {fmt(d.expense)}</title>
                      </rect>
                      <text x={x+19} y="210" textAnchor="middle" fill="#94a3b8" fontSize="8.5" fontWeight="600">{d.label}</text>
                    </g>
                  );
                })}
                <text x="44" y="44"  textAnchor="end" fill="#cbd5e1" fontSize="7.5" fontWeight="600">{fmt(maxChartVal)}</text>
                <text x="44" y="117" textAnchor="end" fill="#cbd5e1" fontSize="7.5" fontWeight="600">{fmt(maxChartVal/2)}</text>
                <text x="44" y="194" textAnchor="end" fill="#cbd5e1" fontSize="7.5" fontWeight="600">Rp 0</text>
              </svg>
            )}

            {/* 2 — Category donut */}
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
                            stroke={COLORS[idx]} strokeWidth="3.5"
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
                    <span className="text-[9px] text-slate-400 font-bold mt-0.5">MENU</span>
                  </div>
                </div>
                <div className="flex-1 space-y-2.5 max-w-xs">
                  {categoryStats.map((s, idx) => (
                    <div key={s.name} className="space-y-1">
                      <div className="flex justify-between text-[11px]">
                        <span className="flex items-center gap-1.5 font-semibold text-slate-600">
                          <span className="w-2 h-2 rounded-full shrink-0" style={{ background: COLORS[idx] }} />
                          {s.name}
                        </span>
                        <span className="font-bold text-slate-700">{s.count} ({s.pct}%)</span>
                      </div>
                      <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                        <div className="h-full rounded-full transition-all duration-500" style={{ width: `${s.pct}%`, background: COLORS[idx] }} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 3 — Critical stock */}
            {activeChart === 'stockCritical' && (
              <div className="w-full h-full flex flex-col justify-center space-y-4 px-2">
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Stok vs Batas Minimum:</p>
                {criticalStats.map(item => {
                  const pct = Math.round(item.ratio * 100);
                  const isLow = item.stock < item.minStock;
                  return (
                    <div key={item.name} className="space-y-1">
                      <div className="flex justify-between text-[11px]">
                        <span className="font-semibold text-slate-700 truncate max-w-[55%]">{item.name}</span>
                        <span className={`font-bold ${isLow ? 'text-rose-500' : 'text-slate-500'}`}>
                          {item.stock} / {item.minStock} {item.unit}
                        </span>
                      </div>
                      <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                        <div className={`h-full rounded-full transition-all duration-500 ${isLow ? 'bg-rose-400' : 'bg-[#1b305b]'}`}
                          style={{ width: `${Math.max(4, Math.min(100, pct))}%` }} />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* 4 — Transaction mix */}
            {activeChart === 'transactionMix' && (
              <div className="w-full h-full flex items-center gap-6 px-2">
                <div className="flex-1 space-y-5">
                  {[
                    { label: 'Volume Pemasukan', count: txMix.inc, pct: txMix.incPct, color: '#1b305b' },
                    { label: 'Volume Pengeluaran', count: txMix.exp, pct: txMix.expPct, color: '#108e50' },
                  ].map(row => (
                    <div key={row.label} className="space-y-1.5">
                      <div className="flex justify-between text-[11px]">
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
                  <span className="text-[9px] text-slate-400 font-bold uppercase block">Total Log</span>
                  <span className="text-2xl font-bold text-[#1b305b]">{txMix.total}</span>
                </div>
              </div>
            )}
          </div>

          {/* Legend for weekly */}
          {activeChart === 'weeklySales' && (
            <div className="flex justify-center gap-6 mt-4 text-[10px] font-semibold text-slate-400">
              <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded bg-[#1b305b] inline-block" /> Pemasukan POS</span>
              <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded bg-[#108e50] inline-block" /> Pengeluaran</span>
            </div>
          )}
        </div>

        {/* Activity Feed */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-[0_2px_12px_rgba(0,0,0,0.03)] p-5 flex flex-col">
          <h3 className="text-[11px] font-bold text-[#1b305b] uppercase tracking-widest flex items-center gap-2 mb-4">
            <FiFileText className="text-[#108e50]" /> Mutasi Kas Terakhir
          </h3>
          <div className="flex-1 space-y-3 overflow-y-auto max-h-[240px] pr-1">
            {finance.slice(0, 8).map(log => (
              <div key={log.id} className="flex items-start justify-between gap-2 pb-3 border-b border-slate-50 last:border-0">
                <div className="min-w-0">
                  <p className="text-[11px] font-semibold text-slate-700 line-clamp-2 leading-snug">{log.description}</p>
                  <span className="text-[10px] text-slate-400 font-medium">{log.date}</span>
                </div>
                <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-lg shrink-0 whitespace-nowrap ${
                  log.type === 'pemasukan'
                    ? 'text-emerald-700 bg-emerald-50 border border-emerald-100'
                    : 'text-rose-600 bg-rose-50 border border-rose-100'
                }`}>
                  {log.type === 'pemasukan' ? '+' : '–'}{fmt(log.amount)}
                </span>
              </div>
            ))}
            {finance.length === 0 && (
              <p className="text-[11px] text-slate-400 text-center py-8 font-medium">Belum ada mutasi.</p>
            )}
          </div>
          <Link to="/laporan"
            className="mt-4 w-full py-2.5 text-center text-[10px] font-bold bg-slate-50 hover:bg-slate-100 text-[#1b305b] border border-slate-100 rounded-xl transition-colors block">
            LIHAT SEMUA LAPORAN →
          </Link>
        </div>
      </div>
    </div>
  );
}
