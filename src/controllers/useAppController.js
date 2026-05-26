import { useState, useEffect, useMemo, useCallback } from 'react';
import { appStore } from '../models/appStore';
import {
  apiLogin,
  apiGetUsers, apiAddUser, apiUpdateUser, apiDeleteUser,
  apiGetProducts, apiAddProduct, apiUpdateProduct, apiDeleteProduct,
  apiGetInventory, apiAddInventory, apiUpdateInventory, apiDeleteInventory,
  apiGetFinance, apiAddFinance,
  apiGetIngredientRules, apiUpdateRecipe,
  apiCheckout, apiRefund,
} from '../services/api';

export default function useAppController(navigate) {
  // ─── Core State ──────────────────────────────────────────────────
  const [users, setUsers] = useState([]);
  const [products, setProducts] = useState([]);
  const [inventory, setInventory] = useState([]);
  const [finance, setFinance] = useState([]);
  const [ingredientRules, setIngredientRules] = useState({});
  const [activeUser, setActiveUser] = useState(() => appStore.getActiveUser());
  const [appReady, setAppReady] = useState(false);

  // ─── UI States ───────────────────────────────────────────────────
  const [authError, setAuthError] = useState('');
  const [globalAlert, setGlobalAlert] = useState(null);

  const triggerAlert = useCallback((message, type = 'info') => {
    setGlobalAlert({ message, type });
    setTimeout(() => setGlobalAlert(null), 3000);
  }, []);

  // POS States
  const [cart, setCart] = useState([]);
  const [posCategory, setPosCategory] = useState('All');
  const [posSearch, setPosSearch] = useState('');
  const [toppingPrice, setToppingPrice] = useState(0);
  const [cashPaid, setCashPaid] = useState('');
  const [checkoutReceipt, setCheckoutReceipt] = useState(null);

  // Order Queue State
  const [orderQueue, setOrderQueue] = useState([]);
  const [nextOrderId, setNextOrderId] = useState(1);
  const [editingOrderId, setEditingOrderId] = useState(null);
  const [editingOldFinanceId, setEditingOldFinanceId] = useState(null);

  // Finance Date Filter
  const [startDate, setStartDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() - 30);
    return d.toISOString().split('T')[0];
  });
  const [endDate, setEndDate] = useState(() => new Date().toISOString().split('T')[0]);

  // ─── Load All Data on Mount ──────────────────────────────────────
  useEffect(() => {
    async function loadAll() {
      try {
        const [u, p, inv, rules] = await Promise.all([
          apiGetUsers(),
          apiGetProducts(),
          apiGetInventory(),
          apiGetIngredientRules(),
        ]);
        setUsers(u);
        setProducts(p);
        setInventory(inv);
        setIngredientRules(rules);
      } catch (err) {
        triggerAlert('Gagal terhubung ke server database. Pastikan backend sudah berjalan.', 'error');
        console.error(err);
      } finally {
        setAppReady(true);
      }
    }
    loadAll();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Reload finance whenever date filter changes
  useEffect(() => {
    apiGetFinance(startDate, endDate)
      .then(setFinance)
      .catch(console.error);
  }, [startDate, endDate]);

  // Persist active user in sessionStorage
  useEffect(() => {
    appStore.setActiveUser(activeUser);
  }, [activeUser]);

  // ─── Helper ─────────────────────────────────────────────────────

  // Re-fetch inventory from DB (after any mutation)
  const refreshInventory = useCallback(async () => {
    const inv = await apiGetInventory();
    setInventory(inv);
  }, []);

  const refreshFinance = useCallback(async () => {
    const fin = await apiGetFinance(startDate, endDate);
    setFinance(fin);
  }, [startDate, endDate]);

  const refreshIngredientRules = useCallback(async () => {
    const rules = await apiGetIngredientRules();
    setIngredientRules(rules);
  }, []);

  // ─── INGREDIENT RULES (from DB, kept in state) ──────────────────
  const checkCartFeasibility = useCallback((cartItems, currentInventory) => {
    const tempStock = {};
    currentInventory.forEach(inv => { tempStock[inv.id] = inv.stock; });
    const issues = [];
    cartItems.forEach(item => {
      const rules = ingredientRules[item.product.id] || [];
      rules.forEach(rule => {
        const needed = rule.amount * item.quantity;
        if (tempStock[rule.id] !== undefined) tempStock[rule.id] -= needed;
      });
    });
    currentInventory.forEach(inv => {
      if (tempStock[inv.id] !== undefined && tempStock[inv.id] < 0) {
        const needed = inv.stock - tempStock[inv.id];
        issues.push({ name: inv.name, stock: inv.stock, needed: Math.ceil(needed), unit: inv.unit });
      }
    });
    return issues;
  }, [ingredientRules]);

  // ─── CART MEMOS ─────────────────────────────────────────────────
  const stockStatus = useMemo(() => {
    const low = inventory.filter(i => i.stock < i.minStock);
    const out = inventory.filter(i => i.stock === 0);
    return { low, out };
  }, [inventory]);

  const cartSubtotal = useMemo(() =>
    cart.reduce((acc, item) => acc + item.product.price * item.quantity, 0), [cart]);

  const cartToppingTotal = useMemo(() => {
    if (toppingPrice === 0) return 0;
    return cart.reduce((acc, item) => {
      const tops = Object.values(item.toppings).filter(Boolean).length;
      return acc + tops * toppingPrice * item.quantity;
    }, 0);
  }, [cart, toppingPrice]);

  const cartTotal = useMemo(() => cartSubtotal + cartToppingTotal, [cartSubtotal, cartToppingTotal]);

  const cartChange = useMemo(() => {
    const paid = parseFloat(cashPaid) || 0;
    return paid >= cartTotal ? paid - cartTotal : 0;
  }, [cashPaid, cartTotal]);

  // ─── AUTH ────────────────────────────────────────────────────────
  const handleLogin = async (username, password) => {
    setAuthError('');
    try {
      const user = await apiLogin(username, password);
      setActiveUser(user);
      triggerAlert(`Selamat datang kembali, ${user.username}!`, 'success');
      navigate(user.role === 'admin' ? '/' : '/pos');
      return true;
    } catch (err) {
      setAuthError(err.message);
      return false;
    }
  };

  const handleLogout = () => {
    setActiveUser(null);
    setCart([]);
    triggerAlert('Anda telah keluar dari sistem.', 'info');
    navigate('/login');
  };

  const handleForgotPassword = () => {
    triggerAlert('Silakan hubungi admin untuk reset password.', 'info');
    return true;
  };

  // ─── USER MANAGEMENT ─────────────────────────────────────────────
  const addUser = async (newUser) => {
    if (!newUser.username || !newUser.email || !newUser.password || !newUser.role) {
      triggerAlert('Harap isi semua bidang pengguna.', 'error');
      return false;
    }
    try {
      const created = await apiAddUser(newUser);
      setUsers(prev => [...prev, created]);
      triggerAlert('Pengguna baru berhasil ditambahkan.', 'success');
      return true;
    } catch (err) {
      triggerAlert(err.message, 'error');
      return false;
    }
  };

  const updateUser = async (updatedUser) => {
    try {
      await apiUpdateUser(updatedUser.id, updatedUser);
      setUsers(prev => prev.map(u => u.id === updatedUser.id ? { ...u, ...updatedUser } : u));
      triggerAlert('Data pengguna berhasil diperbarui.', 'success');
      return true;
    } catch (err) {
      triggerAlert(err.message, 'error');
      return false;
    }
  };

  const deleteUser = async (userId) => {
    if (!window.confirm('Anda yakin ingin menghapus pengguna ini?')) return false;
    try {
      await apiDeleteUser(userId);
      setUsers(prev => prev.filter(u => u.id !== userId));
      triggerAlert('Pengguna berhasil dihapus.', 'info');
      return true;
    } catch (err) {
      triggerAlert(err.message, 'error');
      return false;
    }
  };

  // ─── PRODUCT MANAGEMENT ──────────────────────────────────────────
  const handleSaveProduct = async (form) => {
    if (!form.name || !form.price) {
      triggerAlert('Harap lengkapi formulir produk.', 'error');
      return false;
    }
    const payload = { name: form.name, category: form.category, price: parseFloat(form.price), image: form.image };
    try {
      if (form.id) {
        await apiUpdateProduct(form.id, payload);
        setProducts(prev => prev.map(p => p.id === form.id ? { ...p, ...payload } : p));
        triggerAlert('Produk menu berhasil diubah.', 'success');
      } else {
        const created = await apiAddProduct(payload);
        setProducts(prev => [...prev, created]);
        triggerAlert('Produk menu baru berhasil ditambahkan.', 'success');
      }
      return true;
    } catch (err) {
      triggerAlert(err.message, 'error');
      return false;
    }
  };

  const handleDeleteProduct = async (id) => {
    if (!window.confirm('Apakah Anda yakin ingin menghapus produk ini dari menu?')) return false;
    try {
      await apiDeleteProduct(id);
      setProducts(prev => prev.filter(p => p.id !== id));
      triggerAlert('Produk berhasil dihapus dari menu.', 'info');
      return true;
    } catch (err) {
      triggerAlert(err.message, 'error');
      return false;
    }
  };

  // ─── RECIPE MANAGEMENT ───────────────────────────────────────────
  const handleSaveRecipe = async (productId, rules) => {
    try {
      await apiUpdateRecipe(productId, rules);
      await refreshIngredientRules();
      triggerAlert('Resep berhasil disimpan.', 'success');
      return true;
    } catch (err) {
      triggerAlert(err.message, 'error');
      return false;
    }
  };

  // ─── INVENTORY MANAGEMENT ────────────────────────────────────────
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
          date: new Date().toISOString().split('T')[0],
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

  // ─── POS / CART ──────────────────────────────────────────────────
  const addToCart = (product) => {
    const existing = cart.find(item => item.product.id === product.id);
    let newCart;
    if (existing) {
      newCart = cart.map(item => item.product.id === product.id
        ? { ...item, quantity: item.quantity + 1 } : item);
    } else {
      newCart = [...cart, { product, quantity: 1, toppings: { nanas: false, meses: false } }];
    }
    const issues = checkCartFeasibility(newCart, inventory);
    if (issues.length > 0) {
      const msgs = issues.map(i => `${i.name} (Sisa: ${i.stock} ${i.unit})`).join(', ');
      triggerAlert(`Stok tidak mencukupi: ${msgs}`, 'warning');
      return;
    }
    setCart(newCart);
  };

  const updateCartQuantity = (productId, qty) => {
    if (qty <= 0) { setCart(cart.filter(item => item.product.id !== productId)); return; }
    const item = cart.find(i => i.product.id === productId);
    if (!item) return;
    if (qty > item.quantity) {
      const newCart = cart.map(i => i.product.id === productId ? { ...i, quantity: qty } : i);
      const issues = checkCartFeasibility(newCart, inventory);
      if (issues.length > 0) {
        triggerAlert('Stok bahan tidak mencukupi untuk jumlah tersebut!', 'warning');
        return;
      }
    }
    setCart(cart.map(item => item.product.id === productId ? { ...item, quantity: qty } : item));
  };

  const toggleCartTopping = (productId, toppingKey) => {
    setCart(cart.map(item => item.product.id === productId
      ? { ...item, toppings: { ...item.toppings, [toppingKey]: !item.toppings[toppingKey] } }
      : item));
  };

  // Build inventory deduction list from cart
  const buildInventoryUpdates = useCallback((cartItems, currentInventory) => {
    const tempStock = {};
    currentInventory.forEach(inv => { tempStock[inv.id] = inv.stock; });
    const lowStockNames = [];
    cartItems.forEach(item => {
      const rules = ingredientRules[item.product.id] || [];
      rules.forEach(rule => {
        if (tempStock[rule.id] !== undefined) {
          tempStock[rule.id] = Math.max(0, tempStock[rule.id] - rule.amount * item.quantity);
        }
      });
    });
    const updates = currentInventory
      .filter(inv => tempStock[inv.id] !== undefined && tempStock[inv.id] !== inv.stock)
      .map(inv => {
        if (tempStock[inv.id] < inv.minStock) lowStockNames.push(inv.name);
        return { id: inv.id, stock: tempStock[inv.id] };
      });
    return { updates, lowStockNames };
  }, [ingredientRules]);

  // ─── CHECKOUT ────────────────────────────────────────────────────
  const handleCheckout = async () => {
    if (cart.length === 0) { triggerAlert('Keranjang belanja masih kosong.', 'error'); return false; }
    const paidAmount = parseFloat(cashPaid);
    if (isNaN(paidAmount) || paidAmount < cartTotal) {
      triggerAlert('Uang bayar kurang atau tidak valid.', 'error'); return false;
    }
    const issues = checkCartFeasibility(cart, inventory);
    if (issues.length > 0) { triggerAlert('Stok bahan tidak mencukupi!', 'error'); return false; }

    const { updates, lowStockNames } = buildInventoryUpdates(cart, inventory);
    
    let finalFinanceLog;
    if (editingOrderId) {
      finalFinanceLog = {
        id: editingOldFinanceId, // update the existing finance log directly
        type: 'pemasukan',
        amount: cartTotal,
        description: `Penjualan Kasir (Diedit): ${cart.map(i => `${i.quantity}x ${i.product.name}`).join(', ')}`,
        date: new Date().toISOString().split('T')[0],
      };
    } else {
      finalFinanceLog = {
        type: 'pemasukan',
        amount: cartTotal,
        description: `Penjualan Kasir: ${cart.map(i => `${i.quantity}x ${i.product.name}`).join(', ')}`,
        date: new Date().toISOString().split('T')[0],
      };
    }

    try {
      const response = await apiCheckout({ inventoryUpdates: updates, financeLog: finalFinanceLog });
      const returnedFinanceId = response.financeId;

      // Update local inventory state
      setInventory(prev => prev.map(inv => {
        const u = updates.find(x => x.id === inv.id);
        return u ? { ...inv, stock: u.stock } : inv;
      }));
      await refreshFinance();

      const targetId = editingOrderId ? `TRX-UB-${editingOrderId}` : `TRX-${Date.now().toString().slice(-6)}`;

      // Create receipt & add to queue as paid
      const receiptData = {
        id: targetId,
        cashier: activeUser?.username || 'Kasir',
        date: new Date().toLocaleString('id-ID'),
        items: [...cart],
        toppingPrice,
        subtotal: cartSubtotal,
        toppingTotal: cartToppingTotal,
        total: cartTotal,
        cashPaid: paidAmount,
        change: paidAmount - cartTotal,
      };
      setCheckoutReceipt(receiptData);

      const newOrder = {
        id: editingOrderId || nextOrderId,
        financeId: returnedFinanceId || editingOldFinanceId,
        label: `Pesanan #${editingOrderId || nextOrderId} (Lunas)`,
        items: [...cart],
        toppingPrice,
        subtotal: cartSubtotal,
        total: cartTotal,
        timestamp: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }),
        status: 'paid',
      };
      
      if (editingOrderId) {
        setOrderQueue(prev => [...prev, newOrder]);
      } else {
        setOrderQueue(prev => [...prev, newOrder]);
        setNextOrderId(prev => prev + 1);
      }

      setEditingOrderId(null);
      setEditingOldFinanceId(null);
      setCart([]);
      setCashPaid('');

      if (lowStockNames.length > 0) {
        triggerAlert(`Transaksi Sukses! Peringatan: Stok (${[...new Set(lowStockNames)].join(', ')}) menipis!`, 'warning');
      } else {
        triggerAlert('Transaksi penjualan berhasil diproses!', 'success');
      }
      return true;
    } catch (err) {
      triggerAlert(`Gagal checkout: ${err.message}`, 'error');
      return false;
    }
  };

  // ─── ORDER QUEUE ─────────────────────────────────────────────────
  const addToOrderQueue = () => {
    if (cart.length === 0) { triggerAlert('Keranjang kosong.', 'error'); return false; }
    const issues = checkCartFeasibility(cart, inventory);
    if (issues.length > 0) { triggerAlert('Stok tidak cukup!', 'error'); return false; }
    const newOrder = {
      id: nextOrderId,
      label: `Pesanan #${nextOrderId}`,
      items: [...cart],
      toppingPrice,
      subtotal: cartSubtotal,
      total: cartTotal,
      timestamp: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }),
      status: 'antrian',
    };
    setOrderQueue(prev => [...prev, newOrder]);
    setNextOrderId(prev => prev + 1);
    setCart([]);
    triggerAlert(`Pesanan #${nextOrderId} berhasil masuk antrian!`, 'success');
    return true;
  };

  const removeFromOrderQueue = (orderId) => {
    setOrderQueue(prev => prev.filter(o => o.id !== orderId));
  };

  // Process queued (unpaid) order → pull to cart for payment
  const processOrder = async (orderId) => {
    if (cart.length > 0) { triggerAlert('Kosongkan keranjang terlebih dahulu!', 'warning'); return false; }
    const order = orderQueue.find(o => o.id === orderId);
    if (!order) return false;
    
    setCart(order.items);
    setToppingPrice(order.toppingPrice);
    setEditingOrderId(order.id);
    setEditingOldFinanceId(null); // Unpaid means no previous finance record
    setCashPaid('');
    setOrderQueue(prev => prev.filter(o => o.id !== orderId));
    triggerAlert('Pesanan ditarik ke keranjang. Silakan proses pembayaran.', 'info');
    return true;
  };

  const completePaidOrder = (orderId) => {
    setOrderQueue(prev => prev.map(o => o.id === orderId ? { ...o, status: 'selesai', completedAt: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }) } : o));
    triggerAlert('Pesanan selesai disajikan!', 'success');
  };

  const editPaidOrder = async (orderId) => {
    if (cart.length > 0) { triggerAlert('Kosongkan keranjang terlebih dahulu!', 'warning'); return false; }
    const order = orderQueue.find(o => o.id === orderId);
    if (!order) return;
    if (!window.confirm('Ubah pesanan? Stok akan dikembalikan ke gudang. Silakan bayar selisih harganya nanti.')) return;

    // Build restoration list
    const restorations = [];
    order.items.forEach(item => {
      const rules = ingredientRules[item.product.id] || [];
      rules.forEach(rule => {
        const existing = restorations.find(r => r.id === rule.id);
        const addAmt = rule.amount * item.quantity;
        if (existing) existing.amount += addAmt;
        else restorations.push({ id: rule.id, amount: addAmt });
      });
    });

    try {
      await apiRefund({ inventoryRestorations: restorations, financeLog: null });
      await refreshInventory();
      
      setCart(order.items);
      setToppingPrice(order.toppingPrice);
      setEditingOrderId(order.id);
      setEditingOldFinanceId(order.financeId);
      setCashPaid(order.total.toString());
      setOrderQueue(prev => prev.filter(o => o.id !== orderId));
      triggerAlert('Pesanan ditarik ke keranjang. Silakan ubah dan lanjutkan pembayaran.', 'info');
    } catch (err) {
      triggerAlert(`Gagal mengubah pesanan: ${err.message}`, 'error');
    }
  };

  // ─── FINANCE ─────────────────────────────────────────────────────
  const filteredFinance = useMemo(() => [...finance].sort((a, b) => b.id - a.id), [finance]);

  const financeSummary = useMemo(() => {
    let income = 0; let expense = 0;
    finance.forEach(log => {
      if (log.type === 'pemasukan') income += parseFloat(log.amount);
      else expense += parseFloat(log.amount);
    });
    return { income, expense, profit: income - expense };
  }, [finance]);

  const allTimeSummary = useMemo(() => {
    // For all-time summary, we already have financeSummary computed.
    return financeSummary;
  }, [financeSummary]);

  const todayMetrics = useMemo(() => {
    const todayStr = new Date().toISOString().split('T')[0];
    let totalSales = 0; let countTrx = 0;
    finance.forEach(log => {
      if (log.date === todayStr && log.type === 'pemasukan') {
        totalSales += parseFloat(log.amount); countTrx++;
      }
    });
    const lowStockCount = inventory.filter(item => item.stock < item.minStock).length;
    return { totalSales, countTrx, lowStockCount };
  }, [finance, inventory]);

  const handleSaveExpense = async (amount, description, date) => {
    const amountVal = parseFloat(amount);
    if (isNaN(amountVal) || amountVal <= 0 || !description) {
      triggerAlert('Data pengeluaran tidak valid.', 'error'); return false;
    }
    try {
      await apiAddFinance({ type: 'pengeluaran', amount: amountVal, description, date });
      await refreshFinance();
      triggerAlert('Pengeluaran berhasil dicatat.', 'success');
      return true;
    } catch (err) {
      triggerAlert(err.message, 'error'); return false;
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
      const d = new Date(); d.setDate(d.getDate() - i);
      days.push(d.toISOString().split('T')[0]);
    }
    return days.map(dayStr => {
      let income = 0; let expense = 0;
      finance.forEach(log => {
        if (log.date === dayStr) {
          if (log.type === 'pemasukan') income += parseFloat(log.amount);
          else expense += parseFloat(log.amount);
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

  // ─── Return ──────────────────────────────────────────────────────
  return {
    // State
    users, products, inventory, finance, activeUser, appReady,
    authError, setAuthError, globalAlert, triggerAlert,
    ingredientRules,

    // POS
    cart, setCart,
    posCategory, setPosCategory,
    posSearch, setPosSearch,
    toppingPrice, setToppingPrice,
    cashPaid, setCashPaid,
    checkoutReceipt, setCheckoutReceipt,
    cartSubtotal, cartToppingTotal, cartTotal, cartChange,
    stockStatus, checkCartFeasibility,

    // Queue
    orderQueue, nextOrderId,
    addToCart, updateCartQuantity, toggleCartTopping,
    handleCheckout,
    addToOrderQueue, removeFromOrderQueue,
    processOrder, completePaidOrder, editPaidOrder,

    // Auth
    handleLogin, handleLogout, handleForgotPassword,

    // Users
    addUser, updateUser, deleteUser,

    // Products & Recipes
    handleSaveProduct, handleDeleteProduct, handleSaveRecipe,

    // Inventory
    handleSaveInventory, handleDeleteInventory, handleSaveRestock,

    // Finance
    filteredFinance, financeSummary, allTimeSummary, todayMetrics,
    startDate, setStartDate, endDate, setEndDate,
    handleSaveExpense, handleExportCSV,
    chartData, maxChartVal,
  };
}
