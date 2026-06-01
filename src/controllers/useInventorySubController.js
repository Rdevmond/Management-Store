import { useState, useMemo, useCallback } from 'react';
import {
  apiGetInventory, apiAddInventory, apiUpdateInventory, apiDeleteInventory,
  apiAddFinance
} from '../services/api';

const getLocalISODate = (d = new Date()) => {
  const tzOffset = d.getTimezoneOffset() * 60000;
  return new Date(d.getTime() - tzOffset).toISOString().split('T')[0];
};

export default function useInventorySubController(triggerAlert, refreshFinance) {
  const [inventory, setInventory] = useState([]);

  const refreshInventory = useCallback(async () => {
    try {
      const inv = await apiGetInventory();
      setInventory(inv);
    } catch (err) {
      console.error(err);
    }
  }, []);

  const stockStatus = useMemo(() => {
    const safeInv = Array.isArray(inventory) ? inventory : [];
    const low = safeInv.filter(i => i.stock < i.minStock);
    const out = safeInv.filter(i => i.stock === 0);
    return { low, out };
  }, [inventory]);

  const handleSaveInventory = async (form) => {
    if (!form.name || !form.stock || !form.minStock) {
      triggerAlert('Harap lengkapi formulir barang.', 'error');
      return false;
    }
    const payload = {
      name: form.name,
      stock: parseFloat(form.stock),
      unit: form.unit,
      minStock: parseFloat(form.minStock),
      price: parseFloat(form.price) || 0,
      purchaseLink: form.purchaseLink || '',
      personalReview: form.personalReview || '',
      image: form.image || null,
    };
    try {
      if (form.id) {
        await apiUpdateInventory(form.id, payload);
        setInventory(prev => prev.map(i => i.id === form.id ? { ...i, ...payload } : i));
        triggerAlert('Bahan baku berhasil diubah.', 'success');
      } else {
        const created = await apiAddInventory(payload);
        setInventory(prev => [...prev, created]);
        triggerAlert('Bahan baku baru berhasil ditambahkan.', 'success');
      }
      return true;
    } catch (err) {
      triggerAlert(err.message, 'error');
      return false;
    }
  };

  const handleDeleteInventory = async (id) => {
    if (!window.confirm('Apakah Anda yakin ingin menghapus barang inventaris ini?')) return false;
    try {
      await apiDeleteInventory(id);
      setInventory(prev => prev.filter(i => i.id !== id));
      triggerAlert('Barang inventaris berhasil dihapus.', 'info');
      return true;
    } catch (err) {
      triggerAlert(err.message, 'error');
      return false;
    }
  };

  const handleSaveRestock = async (itemId, qty, isExpense, customUnitPrice) => {
    const amount = parseFloat(qty);
    if (isNaN(amount) || amount <= 0) {
      triggerAlert('Jumlah restock tidak valid.', 'error');
      return false;
    }
    const item = inventory.find(i => i.id === itemId);
    if (!item) return false;
    const newStock = item.stock + amount;
    try {
      await apiUpdateInventory(itemId, { ...item, stock: newStock });
      setInventory(prev => prev.map(i => i.id === itemId ? { ...i, stock: newStock } : i));
      if (isExpense) {
        const costPerUnit = customUnitPrice && parseFloat(customUnitPrice) > 0
          ? parseFloat(customUnitPrice) : (item.price || 10000);
        const totalExpense = costPerUnit * amount;
        const log = {
          type: 'pengeluaran',
          amount: totalExpense,
          description: `Restock Gudang: ${amount} ${item.unit} ${item.name} @ Rp${costPerUnit.toLocaleString('id-ID')}`,
          date: getLocalISODate(),
        };
        await apiAddFinance(log);
        await refreshFinance();
        triggerAlert(`Restock berhasil! Biaya Rp${totalExpense.toLocaleString('id-ID')} dicatat sebagai pengeluaran.`, 'success');
      } else {
        triggerAlert(`Restock berhasil! Stok ${item.name} bertambah sebesar ${amount} ${item.unit}.`, 'success');
      }
      return true;
    } catch (err) {
      triggerAlert(err.message, 'error');
      return false;
    }
  };

  return {
    inventory, setInventory, refreshInventory, stockStatus,
    handleSaveInventory, handleDeleteInventory, handleSaveRestock
  };
}
