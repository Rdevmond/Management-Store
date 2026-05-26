import { useState, useMemo } from 'react';
import { 
  FiDownload, 
  FiPlus, 
  FiDollarSign, 
  FiTrendingUp, 
  FiTrendingDown, 
  FiX, 
  FiCalendar,
  FiShoppingCart,
  FiZap,
  FiSearch
} from 'react-icons/fi';
import { Bar, Line } from 'react-chartjs-2';
import { 
  Chart as ChartJS, 
  CategoryScale, 
  LinearScale, 
  BarElement, 
  LineElement, 
  PointElement, 
  Filler, 
  Title, 
  Tooltip, 
  Legend 
} from 'chart.js';

ChartJS.register(
  CategoryScale, 
  LinearScale, 
  BarElement, 
  LineElement, 
  PointElement, 
  Filler, 
  Title, 
  Tooltip, 
  Legend
);

export default function FinanceView({ controller }) {
  const {
    filteredFinance,
    financeSummary,
    startDate,
    setStartDate,
    endDate,
    setEndDate,
    handleSaveFinance, handleExportCSV
  } = controller;

  // Tab: 'keuangan' | 'pemesanan' | 'pengeluaran'
  const [activeTab, setActiveTab] = useState('keuangan');

  // Chart type: 'bar' | 'line'
  const [chartType, setChartType] = useState('bar');

  // Local state for Quick Date Period Select
  const [period, setPeriod] = useState('custom');

  // Local state for Finance Form Modal
  const [showFinanceModal, setShowFinanceModal] = useState(false);
  const [financeForm, setFinanceForm] = useState({
    type: 'pengeluaran',
    amount: '',
    description: '',
    date: new Date().toISOString().split('T')[0]
  });

  const handlePeriodChange = (newPeriod) => {
    setPeriod(newPeriod);
    const today = new Date();
    const todayStr = today.toISOString().split('T')[0];
    if (newPeriod === 'daily') {
      setStartDate(todayStr);
      setEndDate(todayStr);
    } else if (newPeriod === 'weekly') {
      const past = new Date();
      past.setDate(today.getDate() - 7);
      setStartDate(past.toISOString().split('T')[0]);
      setEndDate(todayStr);
    } else if (newPeriod === 'monthly') {
      const past = new Date();
      past.setDate(today.getDate() - 30);
      setStartDate(past.toISOString().split('T')[0]);
      setEndDate(todayStr);
    }
  };

  const onOpenAddFinance = (defaultType = 'pengeluaran') => {
    setFinanceForm({
      type: defaultType,
      amount: '',
      description: '',
      date: new Date().toISOString().split('T')[0]
    });
    setShowFinanceModal(true);
  };

  const onSubmitFinance = (e) => {
    e.preventDefault();
    const success = handleSaveFinance(financeForm.type, financeForm.amount, financeForm.description, financeForm.date);
    if (success) {
      setShowFinanceModal(false);
    }
  };

  const formatRupiah = (num) =>
    'Rp ' + Number(num).toLocaleString('id-ID', { minimumFractionDigits: 0, maximumFractionDigits: 0 });

  const formatDateStr = (dateStr) => {
    if (!dateStr) return '';
    const dateObj = new Date(dateStr);
    if (isNaN(dateObj.getTime())) return dateStr;
    return dateObj.toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });
  };

  const [searchQuery, setSearchQuery] = useState('');

  const searchedFinance = useMemo(() => {
    const trimmedQuery = searchQuery.trim();
    if (!trimmedQuery) return filteredFinance;
    const tokens = trimmedQuery.toLowerCase().split(/\s+/).filter(Boolean);
    
    const monthNames = ["januari", "februari", "maret", "april", "mei", "juni", "juli", "agustus", "september", "oktober", "november", "desember"];
    
    return filteredFinance.filter(l => {
      let dayStr = '', monthStr = '', yearStr = '';
      if (l.date) {
        const parts = l.date.split('-'); // format YYYY-MM-DD
        if (parts.length === 3) {
          yearStr = parts[0];
          monthStr = monthNames[parseInt(parts[1], 10) - 1] || '';
          dayStr = parseInt(parts[2], 10).toString();
        }
      }
      
      const searchableText = [
        l.description,
        l.type,
        l.amount?.toString()
      ].filter(Boolean).join(' ').toLowerCase();

      return tokens.every(tok => {
        // Precise date matching
        if (tok === dayStr || tok === monthStr || tok === yearStr) return true;
        // Avoid numeric substring matching unintentionally (like "20" matching "120000")
        if (/^\d+$/.test(tok)) {
            const amountStr = l.amount?.toString() || '';
            // Only match amount if it starts with the token (e.g. "20" matches "20000", but not "120000")
            if (amountStr.startsWith(tok)) return true;
            return new RegExp(`\\b${tok}\\b`).test(l.description?.toLowerCase() || '');
        }
        return searchableText.includes(tok);
      });
    });
  }, [filteredFinance, searchQuery]);

  const pemasukanLogs = useMemo(() => searchedFinance.filter(l => l.type === 'pemasukan'), [searchedFinance]);
  const pengeluaranLogs = useMemo(() => searchedFinance.filter(l => l.type === 'pengeluaran'), [searchedFinance]);
  // POS orders are pemasukan that contain "Penjualan Kasir"
  const pemesananLogs = useMemo(() => pemasukanLogs.filter(l => l.description.includes('Penjualan Kasir')), [pemasukanLogs]);

  // Extract product trends from POS logs
  const productTrends = useMemo(() => {
    const trends = {};
    pemesananLogs.forEach(log => {
      const prefix = "Penjualan Kasir: ";
      if (log.description.startsWith(prefix)) {
        const itemsStr = log.description.slice(prefix.length);
        const items = itemsStr.split(', ');
        items.forEach(item => {
          const match = item.match(/^(\d+)x\s+(.+)$/);
          if (match) {
            const qty = parseInt(match[1], 10);
            const name = match[2];
            if (!trends[name]) trends[name] = 0;
            trends[name] += qty;
          }
        });
      }
    });
    
    // Convert to array and sort by quantity descending
    return Object.entries(trends)
      .map(([name, qty]) => ({ name, qty }))
      .sort((a, b) => b.qty - a.qty);
  }, [pemesananLogs]);

  // Generate dynamic date data points based on date range selected
  const dynamicChartData = useMemo(() => {
    const start = new Date(startDate);
    const end = new Date(endDate);
    const dateList = [];
    
    // Safety cap to avoid huge loops or memory issues (max 90 days)
    let current = new Date(start);
    while (current <= end && dateList.length <= 90) {
      dateList.push(current.toISOString().split('T')[0]);
      current.setDate(current.getDate() + 1);
    }
    
    // Pre-aggregate data for O(logs + dates) performance
    const agg = {};
    filteredFinance.forEach(log => {
      if (!agg[log.date]) agg[log.date] = { income: 0, expense: 0, orderCount: 0 };
      if (log.type === 'pemasukan') {
        agg[log.date].income += log.amount;
        if (log.description.includes('Penjualan Kasir')) {
          agg[log.date].orderCount++;
        }
      } else {
        agg[log.date].expense += log.amount;
      }
    });
    
    return dateList.map(dateStr => {
      const parts = dateStr.split('-');
      const label = `${parts[2]}/${parts[1]}`;
      const data = agg[dateStr] || { income: 0, expense: 0, orderCount: 0 };
      return { dateStr, label, income: data.income, expense: data.expense, orderCount: data.orderCount };
    });
  }, [filteredFinance, startDate, endDate]);

  const chartDataConfig = useMemo(() => {
    const labels = dynamicChartData.map(d => d.label);
    
    if (activeTab === 'keuangan') {
      return {
        labels,
        datasets: [
          {
            label: 'Pemasukan',
            data: dynamicChartData.map(d => d.income),
            borderColor: '#108e50',
            backgroundColor: chartType === 'line' ? 'rgba(16, 142, 80, 0.05)' : '#108e50',
            borderWidth: 2,
            borderRadius: chartType === 'bar' ? 4 : 0,
            tension: 0.3,
            fill: chartType === 'line',
          },
          {
            label: 'Pengeluaran',
            data: dynamicChartData.map(d => d.expense),
            borderColor: '#e11d48',
            backgroundColor: chartType === 'line' ? 'rgba(225, 29, 72, 0.05)' : '#e11d48',
            borderWidth: 2,
            borderRadius: chartType === 'bar' ? 4 : 0,
            tension: 0.3,
            fill: chartType === 'line',
          }
        ]
      };
    } else if (activeTab === 'pemesanan') {
      const topProducts = productTrends.slice(0, 10);
      return {
        labels: topProducts.map(p => p.name),
        datasets: [
          {
            label: 'Porsi Terjual',
            data: topProducts.map(p => p.qty),
            borderColor: '#108e50',
            backgroundColor: chartType === 'line' ? 'rgba(16, 142, 80, 0.05)' : '#108e50',
            borderWidth: 2,
            borderRadius: chartType === 'bar' ? 4 : 0,
            tension: 0.3,
            fill: chartType === 'line',
          }
        ]
      };
    } else {
      return {
        labels,
        datasets: [
          {
            label: 'Pengeluaran Operasional',
            data: dynamicChartData.map(d => d.expense),
            borderColor: '#e11d48',
            backgroundColor: chartType === 'line' ? 'rgba(225, 29, 72, 0.05)' : '#e11d48',
            borderWidth: 2,
            borderRadius: chartType === 'bar' ? 4 : 0,
            tension: 0.3,
            fill: chartType === 'line',
          }
        ]
      };
    }
  }, [dynamicChartData, activeTab, chartType, productTrends]);

  const chartOptions = useMemo(() => {
    return {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          display: activeTab === 'keuangan',
          position: 'top',
          labels: {
            boxWidth: 10,
            font: { size: 10, weight: 'bold' }
          }
        },
        tooltip: {
          callbacks: {
            label: (context) => {
              const val = context.raw;
              if (activeTab === 'pemesanan') {
                return `${context.dataset.label}: ${val} Porsi`;
              }
              return `${context.dataset.label}: Rp ${Number(val).toLocaleString('id-ID')}`;
            }
          }
        }
      },
      scales: {
        y: {
          beginAtZero: true,
          ticks: {
            callback: (value) => {
              if (activeTab === 'pemesanan') return value;
              if (value >= 1000000) return `Rp ${(value / 1000000).toFixed(1)}jt`;
              if (value >= 1000) return `Rp ${(value / 1000).toFixed(0)}rb`;
              return `Rp ${value}`;
            },
            font: { size: 9 }
          },
          grid: {
            color: '#f1f5f9'
          }
        },
        x: {
          ticks: {
            font: { size: 9 }
          },
          grid: {
            display: false
          }
        }
      }
    };
  }, [activeTab]);

  const TABS = [
    { id: 'keuangan', label: 'Laporan Keuangan', icon: FiDollarSign, color: 'text-[#1b305b]', bg: 'bg-sky-50 border-sky-200' },
    { id: 'pemesanan', label: 'Laporan Pemesanan', icon: FiShoppingCart, color: 'text-[#108e50]', bg: 'bg-emerald-50 border-emerald-200' },
    { id: 'pengeluaran', label: 'Laporan Pengeluaran', icon: FiZap, color: 'text-rose-600', bg: 'bg-rose-50 border-rose-200' },
  ];

  const renderTable = (logs, emptyMsg = 'Tidak ada data.') => (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-slate-100 text-left text-sm">
        <thead className="bg-[#f8fafc] text-[#1b305b] uppercase tracking-wider text-xs font-bold">
          <tr>
            <th className="px-6 py-4">Tanggal</th>
            <th className="px-6 py-4">Tipe</th>
            <th className="px-6 py-4">Keterangan</th>
            <th className="px-6 py-4 text-right">Jumlah Uang</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
          {logs.length === 0 ? (
            <tr>
              <td colSpan="4" className="px-6 py-12 text-center text-slate-400 font-semibold">{emptyMsg}</td>
            </tr>
          ) : (
            logs.map(log => {
              const isIncome = log.type === 'pemasukan';
              return (
                <tr key={log.id} className="transition-colors hover:bg-slate-50/70">
                  <td className="px-6 py-4 text-slate-400 font-semibold text-xs md:text-sm">{formatDateStr(log.date)}</td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center px-2 py-0.5 rounded-lg text-xs font-semibold uppercase ${
                      isIncome ? 'bg-emerald-50 text-[#108e50] border border-emerald-100/55' : 'bg-rose-50 text-rose-600 border border-rose-100/55'
                    }`}>
                      {log.type}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-slate-800 text-xs md:text-sm font-medium">{log.description}</td>
                  <td className={`px-6 py-4 text-right text-sm md:text-base font-bold ${isIncome ? 'text-[#108e50]' : 'text-rose-600'}`}>
                    {isIncome ? '+' : '-'} {formatRupiah(log.amount)}
                  </td>
                </tr>
              );
            })
          )}
        </tbody>
      </table>
    </div>
  );

  const renderChartSection = () => {
    return (
      <div className="p-5 border-b border-slate-100 bg-[#f8fafc]/50">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
          <div>
            <h4 className="text-xs font-bold text-[#1b305b] uppercase tracking-wider flex items-center gap-1.5">
              <span>Grafik Visualisasi</span>
              <span className="px-1.5 py-0.5 rounded bg-slate-100 border border-slate-200 text-slate-450 font-bold text-[9px] lowercase tracking-normal">
                {chartType}
              </span>
            </h4>
            <p className="text-[10px] text-slate-400 font-semibold mt-0.5">
              {activeTab === 'pemesanan' 
                ? 'Visualisasi 10 produk paling laku berdasarkan jumlah porsi terjual.'
                : `Visualisasi tren harian untuk data ${activeTab === 'keuangan' ? 'Pemasukan vs Pengeluaran' : 'Biaya Operasional'}.`}
            </p>
          </div>
          {/* Chart Type Selector Switch */}
          <div className="flex items-center self-start sm:self-center gap-1 p-0.5 bg-slate-100 border border-slate-200/85 rounded-xl">
            <button
              type="button"
              onClick={() => setChartType('bar')}
              className={`px-3 py-1.5 rounded-lg text-[10px] font-bold transition-all ${
                chartType === 'bar'
                  ? 'bg-[#1b305b] text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-600'
              }`}
            >
              Bar
            </button>
            <button
              type="button"
              onClick={() => setChartType('line')}
              className={`px-3 py-1.5 rounded-lg text-[10px] font-bold transition-all ${
                chartType === 'line'
                  ? 'bg-[#1b305b] text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-600'
              }`}
            >
              Line
            </button>
          </div>
        </div>

        <div className="h-60 w-full relative">
          {chartType === 'bar' ? (
            <Bar data={chartDataConfig} options={chartOptions} />
          ) : (
            <Line data={chartDataConfig} options={chartOptions} />
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6 animate-[fadeIn_0.4s_ease-out] text-slate-800">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between border-b border-slate-200/80 pb-5 gap-3">
        <div>
          <h2 className="text-2xl font-bold text-[#1b305b] uppercase tracking-tight">Laporan</h2>
          <p className="text-slate-400 text-xs font-medium">Pantau laba rugi, catat pengeluaran, dan ekspor laporan per kategori.</p>
        </div>
        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={handleExportCSV}
            className="px-4 py-2.5 bg-[#1b305b] hover:bg-[#132242] text-white font-semibold rounded-xl text-xs shadow-sm hover:shadow transition-all flex items-center gap-2"
          >
            <FiDownload className="text-sm" />
            <span>EKSPOR CSV</span>
          </button>
          <button
            onClick={() => onOpenAddFinance('pemasukan')}
            className="px-4 py-2.5 bg-[#108e50] hover:bg-[#0c6c3d] text-white font-semibold rounded-xl text-xs shadow-sm hover:shadow transition-all flex items-center gap-2"
          >
            <FiPlus className="text-sm" />
            <span>CATAT PEMASUKAN</span>
          </button>
          <button
            onClick={() => onOpenAddFinance('pengeluaran')}
            className="px-4 py-2.5 bg-[#e11d48] hover:bg-[#be123c] text-white font-semibold rounded-xl text-xs shadow-sm hover:shadow transition-all flex items-center gap-2"
          >
            <FiPlus className="text-sm" />
            <span>CATAT PENGELUARAN</span>
          </button>
        </div>
      </div>

      {/* Date Filter & Period Selector */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Filter Card */}
        <div className="bg-white rounded-2xl border border-slate-100 p-5 shadow-[0_4px_20px_rgba(0,0,0,0.015)] flex flex-col justify-between">
          <h3 className="text-sm font-bold text-[#1b305b] uppercase tracking-wider mb-3 flex items-center gap-2">
            <FiCalendar className="text-[#108e50]" />
            <span>Filter Tanggal</span>
          </h3>
          <div className="space-y-2">
            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">Dari</label>
              <input type="date"
                className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-[#1b305b]/10 focus:border-[#1b305b]"
                value={startDate} onChange={(e) => { setStartDate(e.target.value); setPeriod('custom'); }} />
            </div>
            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">Sampai</label>
              <input type="date"
                className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-[#1b305b]/10 focus:border-[#1b305b]"
                value={endDate} onChange={(e) => { setEndDate(e.target.value); setPeriod('custom'); }} />
            </div>
            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">Periode</label>
              <select className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#1b305b]/10 focus:border-[#1b305b]" value={period} onChange={(e) => handlePeriodChange(e.target.value)}>
                <option value="daily">Harian</option>
                <option value="weekly">Mingguan</option>
                <option value="monthly">Bulanan</option>
                <option value="custom">Custom</option>
              </select>
            </div>
          </div>
        </div>

        {/* KPI: Pemasukan */}
        <div className="bg-white rounded-2xl border border-slate-100 p-5 shadow-[0_4px_20px_rgba(0,0,0,0.015)] flex items-center gap-4">
          <div className="p-3 bg-emerald-50 text-[#108e50] rounded-xl border border-emerald-100/55">
            <FiTrendingUp className="text-2xl" />
          </div>
          <div>
            <p className="text-slate-400 text-[10px] font-bold uppercase tracking-wider">Total Pemasukan</p>
            <h4 className="text-xl font-bold text-[#108e50] mt-0.5">{formatRupiah(financeSummary.income)}</h4>
            <p className="text-[10px] text-slate-400 font-semibold mt-0.5">Dari transaksi kasir POS</p>
          </div>
        </div>

        {/* KPI: Pengeluaran */}
        <div className="bg-white rounded-2xl border border-slate-100 p-5 shadow-[0_4px_20px_rgba(0,0,0,0.015)] flex items-center gap-4">
          <div className="p-3 bg-rose-50 text-rose-600 rounded-xl border border-rose-100/55">
            <FiTrendingDown className="text-2xl" />
          </div>
          <div>
            <p className="text-slate-400 text-[10px] font-bold uppercase tracking-wider">Total Pengeluaran</p>
            <h4 className="text-xl font-bold text-rose-600 mt-0.5">{formatRupiah(financeSummary.expense)}</h4>
            <p className="text-[10px] text-slate-400 font-semibold mt-0.5">Restock &amp; operasional</p>
          </div>
        </div>

        {/* KPI: Laba Bersih */}
        <div className="bg-white rounded-2xl border border-slate-100 p-5 shadow-[0_4px_20px_rgba(0,0,0,0.015)] flex items-center gap-4">
          <div className={`p-3 rounded-xl border ${financeSummary.profit >= 0 ? 'bg-sky-50 text-[#1b305b] border-sky-100/55' : 'bg-rose-50 text-rose-600 border-rose-100/55'}`}>
            <FiDollarSign className="text-2xl" />
          </div>
          <div>
            <p className="text-slate-400 text-[10px] font-bold uppercase tracking-wider">Laba Bersih</p>
            <h4 className={`text-xl font-bold mt-0.5 ${financeSummary.profit >= 0 ? 'text-[#1b305b]' : 'text-rose-600'}`}>
              {formatRupiah(financeSummary.profit)}
            </h4>
            <p className="text-[10px] text-slate-400 font-semibold mt-0.5">Pemasukan - pengeluaran</p>
          </div>
        </div>
      </div>

      {/* Categorized Tabs */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-[0_4px_20px_rgba(0,0,0,0.015)] overflow-hidden">
        {/* Tab Bar with Search */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-100 bg-[#f8fafc] sm:pr-4">
          <div className="flex overflow-x-auto" style={{ scrollbarWidth: 'none' }}>
            {TABS.map(tab => (
              <button key={tab.id} onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-5 py-4 text-xs font-bold transition-all border-b-2 whitespace-nowrap ${
                  activeTab === tab.id
                    ? `${tab.color} border-current bg-white`
                    : 'text-slate-400 border-transparent hover:text-slate-655 hover:bg-slate-50'
                }`}>
                <tab.icon className="text-sm" />
                <span>{tab.label}</span>
                <span className={`px-1.5 py-0.5 rounded-md text-[9px] font-bold border ${
                  activeTab === tab.id ? tab.bg : 'bg-slate-100 border-slate-200 text-slate-400'
                }`}>
                  {tab.id === 'keuangan' ? searchedFinance.length
                    : tab.id === 'pemesanan' ? pemesananLogs.length
                    : pengeluaranLogs.length}
                </span>
              </button>
            ))}
          </div>
          <div className="px-4 pb-3 sm:p-0">
            <div className="relative">
              <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Cari transaksi..."
                className="w-full sm:w-64 pl-9 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-[#1b305b]/20 focus:border-[#1b305b]"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>
        </div>

        {/* Unified Visual Chart Rendering */}
        {renderChartSection()}

        {/* Tab: Laporan Keuangan (all transactions) */}
        {activeTab === 'keuangan' && (
          <div>
            <div className="px-6 py-3 bg-[#f8fafc] border-b border-slate-100">
              <p className="text-[10px] text-slate-400 font-medium">Semua mutasi kas dalam periode terpilih — pemasukan &amp; pengeluaran.</p>
            </div>
            {renderTable(searchedFinance, 'Tidak ada transaksi yang cocok.')}
          </div>
        )}

        {/* Tab: Laporan Pemesanan */}
        {activeTab === 'pemesanan' && (
          <div>
            <div className="px-6 py-3 bg-emerald-50/40 border-b border-emerald-100 flex items-center justify-between">
              <p className="text-[10px] text-[#108e50] font-semibold">Tren produk yang paling sering dibeli (Porsi Terjual).</p>
              <span className="text-[10px] font-bold text-[#108e50]">
                Omzet Total: {formatRupiah(pemesananLogs.reduce((s, l) => s + l.amount, 0))}
              </span>
            </div>
            {/* Custom Table for Trends */}
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-slate-100 text-left text-sm">
                <thead className="bg-[#f8fafc] text-[#1b305b] uppercase tracking-wider text-xs font-bold">
                  <tr>
                    <th className="px-6 py-4">Peringkat</th>
                    <th className="px-6 py-4">Nama Menu / Produk</th>
                    <th className="px-6 py-4 text-right">Total Terjual</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                  {productTrends.length === 0 ? (
                    <tr>
                      <td colSpan="3" className="px-6 py-12 text-center text-slate-400 font-semibold">Belum ada data penjualan produk di periode ini.</td>
                    </tr>
                  ) : (
                    productTrends.map((trend, idx) => (
                      <tr key={trend.name} className="transition-colors hover:bg-slate-50/70">
                        <td className="px-6 py-4">
                          <span className={`inline-flex items-center justify-center w-6 h-6 rounded-full text-[10px] font-bold ${
                            idx === 0 ? 'bg-amber-100 text-amber-600' :
                            idx === 1 ? 'bg-slate-200 text-slate-600' :
                            idx === 2 ? 'bg-orange-100 text-orange-600' :
                            'bg-slate-50 text-slate-400'
                          }`}>
                            #{idx + 1}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-slate-800 text-xs md:text-sm font-bold">{trend.name}</td>
                        <td className="px-6 py-4 text-right text-sm md:text-base font-black text-[#108e50]">
                          {trend.qty} <span className="text-[10px] font-semibold text-slate-400">porsi</span>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Tab: Laporan Pengeluaran */}
        {activeTab === 'pengeluaran' && (
          <div>
            <div className="px-6 py-3 bg-rose-50/40 border-b border-rose-100 flex items-center justify-between">
              <p className="text-[10px] text-rose-600 font-semibold">Pengeluaran operasional: listrik, restock bahan baku, dll.</p>
              <span className="text-[10px] font-bold text-rose-600">
                Total: {formatRupiah(pengeluaranLogs.reduce((s, l) => s + l.amount, 0))}
              </span>
            </div>
            {renderTable(pengeluaranLogs, 'Belum ada catatan pengeluaran di periode ini.')}
            {/* Quick add expense prompt */}
            <div className="px-6 py-4 bg-[#f8fafc] border-t border-slate-100 flex items-center justify-between">
              <p className="text-[10px] text-slate-400 font-medium">Catat pengeluaran baru seperti listrik, sewa, bahan dll.</p>
              <button onClick={() => onOpenAddFinance('pengeluaran')}
                className="px-3 py-1.5 bg-[#e11d48] hover:bg-[#be123c] text-white text-[10px] font-bold rounded-lg flex items-center gap-1 transition-colors">
                <FiPlus className="text-xs" /> Tambah Pengeluaran
              </button>
            </div>
          </div>
        )}
      </div>

      {/* FINANCE MODAL */}
      {showFinanceModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full border border-slate-100 shadow-2xl relative animate-[fadeIn_0.3s_ease-out] text-slate-800 space-y-4">
            <button onClick={() => setShowFinanceModal(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 transition-colors">
              <FiX className="text-lg" />
            </button>
            <h3 className="text-lg font-bold text-[#1b305b] uppercase tracking-wide flex items-center gap-2">
              {financeForm.type === 'pemasukan' ? <FiTrendingUp className="text-[#108e50] text-xl" /> : <FiTrendingDown className="text-rose-500 text-xl" />}
              <span>Catat {financeForm.type === 'pemasukan' ? 'Pemasukan' : 'Pengeluaran'} Baru</span>
            </h3>
            
            <form onSubmit={onSubmitFinance} className="space-y-4">
              {/* Type Switcher */}
              <div className="flex bg-slate-100/80 p-1 rounded-xl">
                <button type="button" onClick={() => setFinanceForm({...financeForm, type: 'pemasukan'})} 
                  className={`flex-1 py-2 text-[10px] font-bold rounded-lg uppercase transition-all ${financeForm.type === 'pemasukan' ? 'bg-white shadow text-[#108e50]' : 'text-slate-400 hover:text-slate-600'}`}>Pemasukan</button>
                <button type="button" onClick={() => setFinanceForm({...financeForm, type: 'pengeluaran'})} 
                  className={`flex-1 py-2 text-[10px] font-bold rounded-lg uppercase transition-all ${financeForm.type === 'pengeluaran' ? 'bg-white shadow text-[#e11d48]' : 'text-slate-400 hover:text-slate-600'}`}>Pengeluaran</button>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Kategori Umum</label>
                <div className="flex flex-wrap gap-1.5 mb-2">
                  {(financeForm.type === 'pengeluaran' ? ['Listrik', 'Air', 'Sewa', 'Lainnya'] : ['Modal', 'Layanan Tambahan', 'Lainnya']).map(preset => (
                    <button key={preset} type="button"
                      onClick={() => setFinanceForm({ ...financeForm, description: preset })}
                      className={`px-2.5 py-1 rounded-lg text-[10px] font-bold border transition-all ${
                        financeForm.description === preset
                          ? 'bg-[#1b305b] text-white border-[#1b305b]'
                          : 'bg-slate-50 border-slate-200 text-slate-500 hover:border-[#1b305b]/20'
                      }`}>
                      {preset}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Jumlah Uang (Rp)</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                    <span className="text-xs font-bold text-slate-400">Rp</span>
                  </div>
                  <input type="number" required
                    className="block w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-[#1b305b]/10 focus:border-[#1b305b]"
                    placeholder="Contoh: 150000"
                    value={financeForm.amount}
                    onChange={(e) => setFinanceForm({ ...financeForm, amount: e.target.value })}
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Keterangan</label>
                <textarea required rows="2"
                  className="block w-full px-4 py-2.5 border border-slate-200 rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-[#1b305b]/10 focus:border-[#1b305b] resize-none"
                  placeholder="Contoh detail..."
                  value={financeForm.description}
                  onChange={(e) => setFinanceForm({ ...financeForm, description: e.target.value })}
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Tanggal Transaksi</label>
                <input type="date" required
                  className="block w-full px-4 py-2.5 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-[#1b305b]/10 focus:border-[#1b305b]"
                  value={financeForm.date}
                  onChange={(e) => setFinanceForm({ ...financeForm, date: e.target.value })}
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowFinanceModal(false)}
                  className="flex-grow py-2.5 border border-slate-200 text-slate-500 font-semibold rounded-xl hover:bg-slate-50 text-xs uppercase transition-colors">
                  Batal
                </button>
                <button type="submit"
                  className={`flex-grow py-2.5 text-white font-semibold rounded-xl text-xs uppercase shadow-sm transition-colors ${
                    financeForm.type === 'pemasukan' ? 'bg-[#108e50] hover:bg-[#0c6c3d]' : 'bg-[#e11d48] hover:bg-[#be123c]'
                  }`}>
                  Simpan Data
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
