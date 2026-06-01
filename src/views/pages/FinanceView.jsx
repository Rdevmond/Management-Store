import { useState } from 'react';
import { FiDownload, FiPlus, FiDollarSign, FiTrendingUp, FiTrendingDown, FiCalendar, FiShoppingCart, FiZap } from 'react-icons/fi';
import FinanceCharts from '../components/FinanceCharts';
import FinanceLogsTable from '../components/FinanceLogsTable';
import FinanceModal from '../components/FinanceModal';
import useFinanceViewHelper from '../../controllers/useFinanceViewHelper';

const getLocalISODate = (d = new Date()) => new Date(d.getTime() - d.getTimezoneOffset() * 60000).toISOString().split('T')[0];

export default function FinanceView({ controller }) {
  const {
    filteredFinance, financeSummary, startDate, setStartDate, endDate, setEndDate,
    handleSaveFinance, handleExportCSV
  } = controller;

  const [activeTab, setActiveTab] = useState('keuangan');
  const [chartType, setChartType] = useState('bar');
  const [period, setPeriod] = useState('custom');
  const [showFinanceModal, setShowFinanceModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [financeForm, setFinanceForm] = useState({
    type: 'pengeluaran', amount: '', description: '', date: getLocalISODate()
  });

  const {
    pemasukanLogs, pengeluaranLogs, productTrends,
    chartDataConfig, chartOptions, formatRupiah, formatDateStr
  } = useFinanceViewHelper({
    filteredFinance, financeSummary, startDate, endDate, searchQuery, activeTab, chartType
  });

  const handlePeriodChange = (newPeriod) => {
    setPeriod(newPeriod);
    const today = new Date();
    const todayStr = getLocalISODate(today);
    if (newPeriod === 'daily') {
      setStartDate(todayStr); setEndDate(todayStr);
    } else if (newPeriod === 'weekly') {
      const past = new Date(); past.setDate(today.getDate() - 7);
      setStartDate(getLocalISODate(past)); setEndDate(todayStr);
    } else if (newPeriod === 'monthly') {
      const past = new Date(); past.setDate(today.getDate() - 30);
      setStartDate(getLocalISODate(past)); setEndDate(todayStr);
    }
  };

  const onOpenAddFinance = (defaultType = 'pengeluaran') => {
    setFinanceForm({
      type: defaultType, amount: '', description: '', date: getLocalISODate()
    });
    setShowFinanceModal(true);
  };

  const onSubmitFinance = (e) => {
    e.preventDefault();
    const success = handleSaveFinance(financeForm.type, financeForm.amount, financeForm.description, financeForm.date);
    if (success) setShowFinanceModal(false);
  };

  const TABS = [
    { id: 'keuangan', label: 'Laporan Keuangan', icon: FiDollarSign, color: 'text-dark-blue' },
    { id: 'pemesanan', label: 'Laporan Pemesanan', icon: FiShoppingCart, color: 'text-brand-green' },
    { id: 'pengeluaran', label: 'Laporan Pengeluaran', icon: FiZap, color: 'text-brand-red' },
  ];

  return (
    <div className="space-y-6 animate-fade-in-slow text-slate-800">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between border-b border-slate-200/80 pb-5 gap-3">
        <div>
          <h2 className="text-2xl font-bold text-dark-blue uppercase tracking-tight">Laporan</h2>
          <p className="text-slate-400 text-xs font-medium">Pantau laba rugi, catat pengeluaran, dan ekspor laporan per kategori.</p>
        </div>
        <div className="flex flex-wrap items-center gap-2.5">
          <button onClick={handleExportCSV} className="px-4 py-2.5 bg-dark-blue hover:bg-slate-800 text-white font-semibold rounded-xl text-xs shadow-sm transition-all flex items-center gap-2">
            <FiDownload className="text-sm" /> <span>EKSPOR CSV</span>
          </button>
          <button onClick={() => onOpenAddFinance('pemasukan')} className="px-4 py-2.5 bg-brand-green hover:bg-green-700 text-white font-semibold rounded-xl text-xs shadow-sm transition-all flex items-center gap-2">
            <FiPlus className="text-sm" /> <span>CATAT PEMASUKAN</span>
          </button>
          <button onClick={() => onOpenAddFinance('pengeluaran')} className="px-4 py-2.5 bg-brand-red hover:bg-rose-700 text-white font-semibold rounded-xl text-xs shadow-sm transition-all flex items-center gap-2">
            <FiPlus className="text-sm" /> <span>CATAT PENGELUARAN</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-2xl border border-slate-100 p-5 shadow-sm flex flex-col justify-between">
          <h3 className="text-sm font-bold text-dark-blue uppercase tracking-wider mb-3 flex items-center gap-2">
            <FiCalendar className="text-brand-green" /> <span>Filter Tanggal</span>
          </h3>
          <div className="space-y-2">
            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">Dari</label>
              <input type="date" className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2" value={startDate} onChange={(e) => { setStartDate(e.target.value); setPeriod('custom'); }} />
            </div>
            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">Sampai</label>
              <input type="date" className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2" value={endDate} onChange={(e) => { setEndDate(e.target.value); setPeriod('custom'); }} />
            </div>
            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">Periode</label>
              <select className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs text-slate-800" value={period} onChange={(e) => handlePeriodChange(e.target.value)}>
                <option value="daily">Harian</option>
                <option value="weekly">Mingguan</option>
                <option value="monthly">Bulanan</option>
                <option value="custom">Custom</option>
              </select>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-100 p-5 shadow-sm flex items-center gap-4">
          <div className="p-3 bg-emerald-50 text-brand-green rounded-xl border border-emerald-100/55"><FiTrendingUp className="text-2xl" /></div>
          <div>
            <p className="text-slate-400 text-[10px] font-bold uppercase tracking-wider">Total Pemasukan</p>
            <h4 className="text-xl font-bold text-brand-green mt-0.5">{formatRupiah(financeSummary.income)}</h4>
            <p className="text-[10px] text-slate-400 font-semibold mt-0.5">Dari transaksi POS</p>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-100 p-5 shadow-sm flex items-center gap-4">
          <div className="p-3 bg-rose-50 text-brand-red rounded-xl border border-rose-100/55"><FiTrendingDown className="text-2xl" /></div>
          <div>
            <p className="text-slate-400 text-[10px] font-bold uppercase tracking-wider">Total Pengeluaran</p>
            <h4 className="text-xl font-bold text-brand-red mt-0.5">{formatRupiah(financeSummary.expense)}</h4>
            <p className="text-[10px] text-slate-400 font-semibold mt-0.5">Restock &amp; operasional</p>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-100 p-5 shadow-sm flex items-center gap-4">
          <div className={`p-3 rounded-xl border ${financeSummary.profit >= 0 ? 'bg-sky-50 text-dark-blue border-sky-100/55' : 'bg-rose-50 text-brand-red border-rose-100/55'}`}><FiDollarSign className="text-2xl" /></div>
          <div>
            <p className="text-slate-400 text-[10px] font-bold uppercase tracking-wider">Laba Bersih</p>
            <h4 className={`text-xl font-bold mt-0.5 ${financeSummary.profit >= 0 ? 'text-dark-blue' : 'text-brand-red'}`}>{formatRupiah(financeSummary.profit)}</h4>
            <p className="text-[10px] text-slate-400 font-semibold mt-0.5">Pemasukan - pengeluaran</p>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-100 bg-slate-50 sm:pr-4">
          <div className="flex overflow-x-auto" style={{ scrollbarWidth: 'none' }}>
            {TABS.map(tab => (
              <button key={tab.id} onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-5 py-4 text-xs font-bold transition-all border-b-2 whitespace-nowrap ${
                  activeTab === tab.id
                    ? `${tab.color} border-current bg-white`
                    : 'text-slate-400 border-transparent hover:text-slate-650'
                }`}>
                <tab.icon className="text-sm" />
                <span>{tab.label}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="p-5 border-b border-slate-100 bg-slate-50/50">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
            <div>
              <h4 className="text-xs font-bold text-dark-blue uppercase tracking-wider">Grafik Visualisasi</h4>
            </div>
            <div className="flex items-center gap-1 p-0.5 bg-slate-100 border rounded-xl">
              <button onClick={() => setChartType('bar')} className={`px-3 py-1.5 rounded-lg text-[10px] font-bold transition-all ${chartType === 'bar' ? 'bg-dark-blue text-white shadow-sm' : 'text-slate-400'}`}>Bar</button>
              <button onClick={() => setChartType('line')} className={`px-3 py-1.5 rounded-lg text-[10px] font-bold transition-all ${chartType === 'line' ? 'bg-dark-blue text-white shadow-sm' : 'text-slate-400'}`}>Line</button>
            </div>
          </div>
          <FinanceCharts chartType={chartType} chartDataConfig={chartDataConfig} chartOptions={chartOptions} />
        </div>

        <FinanceLogsTable
          activeTab={activeTab}
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          handleExportCSV={handleExportCSV}
          formatRupiah={formatRupiah}
          formatDateStr={formatDateStr}
          pemasukanLogs={pemasukanLogs}
          pengeluaranLogs={pengeluaranLogs}
          productTrends={productTrends}
          onOpenAddFinance={onOpenAddFinance}
        />
      </div>

      <FinanceModal
        showFinanceModal={showFinanceModal}
        setShowFinanceModal={setShowFinanceModal}
        financeForm={financeForm}
        setFinanceForm={setFinanceForm}
        onSubmitFinance={onSubmitFinance}
      />
    </div>
  );
}
