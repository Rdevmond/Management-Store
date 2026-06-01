import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { 
  FiAlertTriangle, FiDollarSign, FiPackage, FiTrendingUp,
  FiArrowRight, FiFileText, FiActivity, FiCalendar
} from 'react-icons/fi';
import KPICard from '../components/KPICard';
import DashboardCharts from '../components/DashboardCharts';
const fmt = (n) => 'Rp ' + Number(n).toLocaleString('id-ID');
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
  return (
    <div className="flex-1 flex flex-col min-h-0 space-y-5 animate-fade-in-slow">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-5 border-b border-slate-200/70">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">Ringkasan Dasbor</h2>
          <p className="text-slate-500 text-xs font-medium mt-0.5">Analisis harian penjualan &amp; manajemen stok bahan baku.</p>
        </div>
        <div className="px-3.5 py-2 bg-white border border-slate-100 rounded-xl text-xs text-slate-500 font-semibold shadow-sm select-none whitespace-nowrap flex items-center gap-1.5">
          <FiCalendar className="text-slate-400" /> {new Date().toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
        </div>
      </div>
      {lowStockItems.length > 0 && (
        <div className="flex items-start gap-3 bg-rose-50 border border-rose-100 rounded-2xl p-4">
          <FiAlertTriangle className="text-rose-500 text-lg shrink-0 mt-0.5" />
          <div className="flex-1 min-w-0">
            <p className="text-xs font-bold text-rose-800">Bahan baku menipis di gudang</p>
            <p className="text-xs text-rose-600 font-medium mt-0.5 leading-relaxed">
              {lowStockItems.map(i => `${i.name} (${i.stock} ${i.unit})`).join(' · ')}
            </p>
          </div>
          <Link to="/inventaris" className="text-xs font-bold text-rose-600 hover:text-rose-800 transition-colors shrink-0 flex items-center gap-0.5 mt-0.5">
            Restock <FiArrowRight />
          </Link>
        </div>
      )}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        <Link to="/laporan" className="block">
          <KPICard
            label="Omzet Hari Ini"
            value={fmt(todayMetrics.totalSales)}
            sub={`${todayMetrics.countTrx} transaksi berhasil`}
            icon={FiTrendingUp}
            iconBg="bg-emerald-50" iconColor="text-green-600" iconBorder="border-emerald-100"
            valueCls="text-slate-800"
          />
        </Link>
        <Link to="/inventaris" className="block"><KPICard
          label="Persediaan Kritis"
          value={`${todayMetrics.lowStockCount} Bahan`}
          sub={todayMetrics.lowStockCount > 0 ? 'Butuh tambahan segera.' : 'Seluruh persediaan aman.'}
          icon={FiPackage}
          iconBg={todayMetrics.lowStockCount > 0 ? 'bg-rose-50' : 'bg-sky-50'}
          iconColor={todayMetrics.lowStockCount > 0 ? 'text-rose-500' : 'text-slate-900'}
          iconBorder={todayMetrics.lowStockCount > 0 ? 'border-rose-100' : 'border-sky-100'}
          valueCls={todayMetrics.lowStockCount > 0 ? 'text-rose-600' : 'text-slate-800'}
        /></Link>
        <KPICard
          label="Estimasi Laba Bersih"
          value={fmt(allTimeSummary.profit)}
          sub="Selisih pemasukan vs operasional."
          icon={FiDollarSign}
          iconBg="bg-blue-50" iconColor="text-slate-900" iconBorder="border-blue-100"
          valueCls={allTimeSummary.profit >= 0 ? 'text-slate-800' : 'text-rose-600'}
        />
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 flex-1 min-h-0">
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-100 shadow-sm p-5 flex flex-col min-h-0">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-5">
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-widest flex items-center gap-2">
              <FiActivity className="text-green-600" /> Grafik Visual Dinamis
            </h3>
            <div className="flex gap-1 bg-slate-50 border border-slate-100 p-1 rounded-xl shrink-0">
              {CHART_TABS.map(t => (
                <button key={t.id} onClick={() => setActiveChart(t.id)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                    activeChart === t.id ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'
                  }`}>
                  {t.label}
                </button>
              ))}
            </div>
          </div>
          <div className="flex-1 min-h-0">
            <DashboardCharts
              activeChart={activeChart}
              chartData={chartData}
              maxChartVal={maxChartVal}
              categoryStats={categoryStats}
              criticalStats={criticalStats}
              txMix={txMix}
              fmt={fmt}
            />
          </div>
          {activeChart === 'weeklySales' && (
            <div className="flex justify-center gap-6 mt-4 text-xs font-semibold text-slate-500">
              <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded bg-slate-900 inline-block" /> Pemasukan POS</span>
              <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded bg-green-600 inline-block" /> Pengeluaran</span>
            </div>
          )}
        </div>
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 flex flex-col min-h-0">
          <h3 className="text-xs font-bold text-slate-900 uppercase tracking-widest flex items-center gap-2 mb-4">
            <FiFileText className="text-green-600" /> Mutasi Kas Terakhir
          </h3>
          <div className="flex-1 space-y-3 overflow-y-auto min-h-0 pr-1">
            {finance.slice(0, 8).map(log => (
              <div key={log.id} className="flex items-start justify-between gap-2 pb-3 border-b border-slate-50 last:border-0">
                <div className="min-w-0">
                  <p className="text-xs font-semibold text-slate-700 line-clamp-2 leading-snug">{log.description}</p>
                  <span className="text-xs text-slate-500 font-medium">{log.date}</span>
                </div>
                <span className={`text-xs font-bold px-1.5 py-0.5 rounded-lg shrink-0 whitespace-nowrap ${
                  log.type === 'pemasukan'
                    ? 'text-emerald-700 bg-emerald-50 border border-emerald-100'
                    : 'text-rose-600 bg-rose-50 border border-rose-100'
                }`}>
                  {log.type === 'pemasukan' ? '+' : '-'}{fmt(log.amount)}
                </span>
              </div>
            ))}
            {finance.length === 0 && (
              <p className="text-xs text-slate-400 text-center py-8 font-medium">Belum ada mutasi.</p>
            )}
          </div>
          <Link to="/laporan"
            className="mt-4 w-full py-2.5 flex justify-center items-center gap-1 text-xs font-bold bg-slate-50 hover:bg-slate-100 text-slate-900 border border-slate-100 rounded-xl transition-colors">
            LIHAT SEMUA LAPORAN <FiArrowRight />
          </Link>
        </div>
      </div>
    </div>
  );
}
