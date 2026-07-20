import { useState, useEffect, useMemo, useCallback } from 'react';
import { apiGetFinance, apiAddFinance } from '../services/api';

const getLocalISODate = (d = new Date()) => {
  const tzOffset = d.getTimezoneOffset() * 60000;
  return new Date(d.getTime() - tzOffset).toISOString().split('T')[0];
};

export default function useFinanceSubController(triggerAlert, inventory) {
  const [finance, setFinance] = useState([]);
  const [startDate, setStartDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() - 30);
    return getLocalISODate(d);
  });
  const [endDate, setEndDate] = useState(() => getLocalISODate());

  const refreshFinance = useCallback(async () => {
    try {
      const fin = await apiGetFinance(startDate, endDate);
      setFinance(fin);
    } catch (err) {
      console.error(err);
    }
  }, [startDate, endDate]);

  useEffect(() => {
    refreshFinance();
  }, [startDate, endDate, refreshFinance]);

  const filteredFinance = useMemo(() => [...finance].sort((a, b) => b.id - a.id), [finance]);

  const financeSummary = useMemo(() => {
    let income = 0;
    let expense = 0;
    finance.forEach(log => {
      if (log.type === 'pemasukan') income += parseFloat(log.amount) || 0;
      else expense += parseFloat(log.amount) || 0;
    });
    return { income, expense, profit: income - expense };
  }, [finance]);

  const todayMetrics = useMemo(() => {
    const todayStr = getLocalISODate();
    let totalSales = 0;
    let countTrx = 0;
    finance.forEach(log => {
      if (log.date === todayStr && log.type === 'pemasukan') {
        totalSales += parseFloat(log.amount) || 0;
        countTrx++;
      }
    });
    const lowStockCount = Array.isArray(inventory)
      ? inventory.filter(item => item.stock < item.minStock).length
      : 0;
    return { totalSales, countTrx, lowStockCount };
  }, [finance, inventory]);

  const handleSaveFinance = async (type, amount, description, date) => {
    const amountVal = parseFloat(amount);
    if (isNaN(amountVal) || amountVal <= 0 || !description) {
      triggerAlert('Data keuangan tidak valid.', 'error');
      return false;
    }
    try {
      await apiAddFinance({ type, amount: amountVal, description, date });
      await refreshFinance();
      triggerAlert(`${type === 'pemasukan' ? 'Pemasukan' : 'Pengeluaran'} berhasil dicatat.`, 'success');
      return true;
    } catch (err) {
      triggerAlert(err.message, 'error');
      return false;
    }
  };

  const handleExportCSV = () => {
    let csvContent = 'data:text/csv;charset=utf-8,ID,Tanggal,Jenis Transaksi,Keterangan,Jumlah Uang\n';
    filteredFinance.forEach(log => {
      csvContent += `${log.id},${log.date},${log.type.toUpperCase()},"${log.description.replace(/"/g, '""')}",${log.amount}\n`;
    });
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `laporan_keuangan_${startDate}_to_${endDate}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    triggerAlert('Laporan CSV berhasil diunduh.', 'success');
  };

  const chartData = useMemo(() => {
    const days = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      days.push(d.toISOString().split('T')[0]);
    }
    return days.map(dayStr => {
      let income = 0;
      let expense = 0;
      finance.forEach(log => {
        if (log.date === dayStr) {
          if (log.type === 'pemasukan') income += parseFloat(log.amount) || 0;
          else expense += parseFloat(log.amount) || 0;
        }
      });
      const parts = dayStr.split('-');
      return { dayStr, label: `${parts[2]}/${parts[1]}`, income, expense };
    });
  }, [finance]);

  const maxChartVal = useMemo(() => {
    let max = 50000;
    chartData.forEach(d => {
      if (d.income > max) max = d.income;
      if (d.expense > max) max = d.expense;
    });
    return max * 1.15;
  }, [chartData]);

  return {
    finance, setFinance, startDate, setStartDate, endDate, setEndDate,
    refreshFinance, filteredFinance, financeSummary, todayMetrics,
    handleSaveFinance, handleExportCSV, chartData, maxChartVal
  };
}
