import { useMemo } from 'react';

export default function useFinanceViewHelper({
  filteredFinance,
  startDate,
  endDate,
  searchQuery,
  activeTab,
  chartType
}) {
  const formatRupiah = (num) =>
    'Rp ' + Number(num).toLocaleString('id-ID', { minimumFractionDigits: 0, maximumFractionDigits: 0 });

  const formatDateStr = (dateStr) => {
    if (!dateStr) return '';
    const dateObj = new Date(dateStr);
    if (isNaN(dateObj.getTime())) return dateStr;
    return dateObj.toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });
  };

  const searchedFinance = useMemo(() => {
    const trimmedQuery = searchQuery.trim();
    if (!trimmedQuery) return filteredFinance;
    const tokens = trimmedQuery.toLowerCase().split(/\s+/).filter(Boolean);
    const monthNames = ["januari", "februari", "maret", "april", "mei", "juni", "juli", "agustus", "september", "oktober", "november", "desember"];
    
    return filteredFinance.filter(l => {
      let dayStr = '', monthStr = '', yearStr = '';
      if (l.date) {
        const parts = l.date.split('-');
        if (parts.length === 3) {
          yearStr = parts[0];
          monthStr = monthNames[parseInt(parts[1], 10) - 1] || '';
          dayStr = parseInt(parts[2], 10).toString();
        }
      }
      const searchableText = [l.description, l.type, l.amount?.toString()].filter(Boolean).join(' ').toLowerCase();

      return tokens.every(tok => {
        if (tok === dayStr || tok === monthStr || tok === yearStr) return true;
        if (/^\d+$/.test(tok)) {
          const amountStr = l.amount?.toString() || '';
          if (amountStr.startsWith(tok)) return true;
          return new RegExp(`\\b${tok}\\b`).test(l.description?.toLowerCase() || '');
        }
        return searchableText.includes(tok);
      });
    });
  }, [filteredFinance, searchQuery]);

  const pemasukanLogs = useMemo(() => searchedFinance.filter(l => l.type === 'pemasukan'), [searchedFinance]);
  const pengeluaranLogs = useMemo(() => searchedFinance.filter(l => l.type === 'pengeluaran'), [searchedFinance]);
  const pemesananLogs = useMemo(() => pemasukanLogs.filter(l => l.description.includes('Penjualan Kasir')), [pemasukanLogs]);

  const productTrends = useMemo(() => {
    const trends = {};
    pemesananLogs.forEach(log => {
      let itemsStr;
      if (log.description.startsWith("Penjualan Kasir: ")) {
        itemsStr = log.description.slice("Penjualan Kasir: ".length);
      } else if (log.description.startsWith("Penjualan Kasir (Diedit): ")) {
        itemsStr = log.description.slice("Penjualan Kasir (Diedit): ".length);
      } else {
        return;
      }
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
    });
    return Object.entries(trends)
      .map(([name, qty]) => ({ name, qty }))
      .sort((a, b) => b.qty - a.qty);
  }, [pemesananLogs]);

  const dynamicChartData = useMemo(() => {
    const start = new Date(startDate);
    const end = new Date(endDate);
    const dateList = [];
    let current = new Date(start);
    while (current <= end && dateList.length <= 90) {
      dateList.push(current.toISOString().split('T')[0]);
      current.setDate(current.getDate() + 1);
    }
    const agg = {};
    filteredFinance.forEach(log => {
      const amt = parseFloat(log.amount) || 0;
      if (!agg[log.date]) agg[log.date] = { income: 0, expense: 0, orderCount: 0 };
      if (log.type === 'pemasukan') {
        agg[log.date].income += amt;
        if (log.description.includes('Penjualan Kasir')) agg[log.date].orderCount++;
      } else {
        agg[log.date].expense += amt;
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
            tension: 0.3,
            fill: chartType === 'line',
          },
          {
            label: 'Pengeluaran',
            data: dynamicChartData.map(d => d.expense),
            borderColor: '#e11d48',
            backgroundColor: chartType === 'line' ? 'rgba(225, 29, 72, 0.05)' : '#e11d48',
            borderWidth: 2,
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
          labels: { boxWidth: 10, font: { size: 10, weight: 'bold' } }
        },
        tooltip: {
          callbacks: {
            label: (context) => {
              const val = context.raw;
              if (activeTab === 'pemesanan') return `${context.dataset.label}: ${val} Porsi`;
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
          grid: { color: '#f1f5f9' }
        },
        x: {
          ticks: { font: { size: 9 } },
          grid: { display: false }
        }
      }
    };
  }, [activeTab]);

  return {
    searchedFinance,
    pemasukanLogs,
    pengeluaranLogs,
    pemesananLogs,
    productTrends,
    chartDataConfig,
    chartOptions,
    formatRupiah,
    formatDateStr
  };
}
