import { useState, useEffect, useMemo, useCallback } from 'react';
import { appStore } from '../models/appStore';
import {
  apiLogin, apiPost,
  apiGetUsers, apiAddUser, apiUpdateUser, apiDeleteUser,
  apiGetProducts, apiAddProduct, apiUpdateProduct, apiDeleteProduct,
  apiGetInventory, apiAddInventory, apiUpdateInventory, apiDeleteInventory,
  apiGetFinance, apiAddFinance,
  apiGetIngredientRules, apiUpdateRecipe,
  apiCheckout, apiRefund,
} from '../services/api';

const getLocalISODate = (d = new Date()) => {
  const tzOffset = d.getTimezoneOffset() * 60000;
  return new Date(d.getTime() - tzOffset).toISOString().split('T')[0];
};
export default function useAppController(navigate) {
  const [users, setUsers] = useState([]);
  const [products, setProducts] = useState([]);
  const [inventory, setInventory] = useState([]);
  const [finance, setFinance] = useState([]);
  const [ingredientRules, setIngredientRules] = useState({});
  const [activeUser, setActiveUser] = useState(() => appStore.getActiveUser());
  const [appReady, setAppReady] = useState(false);
  const [authError, setAuthError] = useState('');
  const [globalAlert, setGlobalAlert] = useState(null);
  const triggerAlert = useCallback((message, type = 'info') => {
    setGlobalAlert({ message, type });
    setTimeout(() => setGlobalAlert(null), 3000);
  }, []);
  const [cart, setCart] = useState([]);
  const [posCategory, setPosCategory] = useState('All');
  const [posSearch, setPosSearch] = useState('');
  const [toppingPrice, setToppingPrice] = useState(0);
  const [cashPaid, setCashPaid] = useState('');
  const [checkoutReceipt, setCheckoutReceipt] = useState(null);
  const [orderQueue, setOrderQueue] = useState([]);
  const [nextOrderId, setNextOrderId] = useState(1);
  const [editingOrderId, setEditingOrderId] = useState(null);
  const [editingOldFinanceId, setEditingOldFinanceId] = useState(null);
  const [startDate, setStartDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() - 30);
    return getLocalISODate(d);
  });
  const [endDate, setEndDate] = useState(() => getLocalISODate());
  useEffect(() => {
    async function loadAll() {
      try {
        const [u, p, inv, rules] = await Promise.all([
          apiGetUsers(),
          apiGetProducts(),
          apiGetInventory(),
          apiGetIngredientRules(),
        ]);
        setUsers(Array.isArray(u) ? u : []);
        setProducts(Array.isArray(p) ? p : []);
        setInventory(Array.isArray(inv) ? inv : []);
        setIngredientRules(rules && typeof rules === 'object' && !Array.isArray(rules) ? rules : {});
      } catch (err) {
        triggerAlert('Gagal terhubung ke server database. Pastikan backend sudah berjalan.', 'error');
        console.error(err);
      } finally {
        setAppReady(true);
      }
    }
    loadAll();
  }, [triggerAlert]);
  useEffect(() => {
    apiGetFinance(startDate, endDate)
      .then(data => setFinance(Array.isArray(data) ? data : []))
      .catch(console.error);
  }, [startDate, endDate]);
  useEffect(() => {
    appStore.setActiveUser(activeUser);
  }, [activeUser]);
  const refreshInventory = useCallback(async () => {
    const inv = await apiGetInventory();
    setInventory(Array.isArray(inv) ? inv : []);
  }, []);
  const refreshFinance = useCallback(async () => {
    const fin = await apiGetFinance(startDate, endDate);
    setFinance(Array.isArray(fin) ? fin : []);
  }, [startDate, endDate]);
  const refreshIngredientRules = useCallback(async () => {
    const rules = await apiGetIngredientRules();
    setIngredientRules(rules);
  }, []);
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
  const stockStatus = useMemo(() => {
    const low = inventory.filter(i => i.stock < i.minStock);
    const out = inventory.filter(i => i.stock === 0);
    return { low, out };
  }, [inventory]);
  const cartSubtotal = useMemo(() =>
    cart.reduce((acc, item) => acc + item.product.price * item.quantity, 0), [cart]);
  const cartToppingTotal = useMemo(() => 0, []);
  const cartTotal = useMemo(() => cartSubtotal + cartToppingTotal, [cartSubtotal, cartToppingTotal]);
  const cartChange = useMemo(() => {
    const paid = parseFloat(cashPaid) || 0;
    return paid >= cartTotal ? paid - cartTotal : 0;
  }, [cashPaid, cartTotal]);
  const handleLogin = async (username, password) => {
    setAuthError('');
    try {
      const user = await apiLogin(username, password);
      setActiveUser(user);
      triggerAlert(`Selamat datang kembali, ${user.username}!`, 'success');
      navigate(user.role === 'pemilik' ? '/' : '/pos');
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
  const requestPasswordReset = async (username, email) => {
    if (!username || !email) {
      triggerAlert('Username dan email wajib diisi.', 'error');
      return false;
    }
    try {
      const res = await apiPost('/forgot-password', { username, email });
      if (res.success || res.message) {
        if (res.testUrl) {
          triggerAlert('Kode verifikasi dikirim! Klik tombol Virtual Inbox yang muncul.', 'success');
          return { success: true, testUrl: res.testUrl };
        }
        triggerAlert('Kode verifikasi telah dikirim ke email Anda.', 'success');
        return { success: true };
      }
      triggerAlert('Gagal mengirim kode verifikasi.', 'error');
      return false;
    } catch (err) {
      triggerAlert(err.message || 'Error mengirim kode.', 'error');
      return false;
    }
  };

  const verifyPasswordResetCode = async (username, email, code) => {
    if (!username || !email || !code) {
      triggerAlert('Kode verifikasi wajib diisi.', 'error');
      return false;
    }
    try {
      const res = await apiPost('/verify-code', { username, email, code });
      if (res.success) {
        triggerAlert('Kode verifikasi berhasil diverifikasi.', 'success');
        return true;
      }
      triggerAlert(res.error || 'Kode verifikasi salah.', 'error');
      return false;
    } catch (err) {
      triggerAlert(err.message || 'Error verifikasi kode.', 'error');
      return false;
    }
  };

  const confirmPasswordReset = async (username, email, code, newPassword) => {
    if (!username || !email || !code || !newPassword) {
      triggerAlert('Semua bidang wajib diisi.', 'error');
      return false;
    }
    try {
      const res = await apiPost('/confirm-forgot', { username, email, code, newPassword });
      if (res.success) {
        triggerAlert('Password berhasil direset. Silakan login.', 'success');
        return true;
      }
      triggerAlert(res.error || 'Verifikasi gagal.', 'error');
      return false;
    } catch (err) {
      triggerAlert(err.message || 'Error verifikasi.', 'error');
      return false;
    }
  };

  const handleForgotPassword = async () => {
    return false;
  };
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
  const addToCart = (product) => {
    const existing = cart.find(item => item.product.id === product.id);
    let newCart;
    if (existing) {
      newCart = cart.map(item => item.product.id === product.id
        ? { ...item, quantity: item.quantity + 1 } : item);
    } else {
      newCart = [...cart, { product, quantity: 1, toppings: { messes: false, agarAgar: false, nanas: false } }];
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
        id: editingOldFinanceId,
        type: 'pemasukan',
        amount: cartTotal,
        description: `Penjualan Kasir (Diedit): ${cart.map(i => `${i.quantity}x ${i.product.name}`).join(', ')}`,
        date: getLocalISODate(),
      };
    } else {
      finalFinanceLog = {
        type: 'pemasukan',
        amount: cartTotal,
        description: `Penjualan Kasir: ${cart.map(i => `${i.quantity}x ${i.product.name}`).join(', ')}`,
        date: getLocalISODate(),
      };
    }
    try {
      const response = await apiCheckout({ inventoryUpdates: updates, financeLog: finalFinanceLog });
      const returnedFinanceId = response.financeId;
      setInventory(prev => prev.map(inv => {
        const u = updates.find(x => x.id === inv.id);
        return u ? { ...inv, stock: u.stock } : inv;
      }));
      await refreshFinance();
      const targetId = editingOrderId ? `TRX-UB-${editingOrderId}` : `TRX-${Date.now().toString().slice(-6)}`;
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
      setOrderQueue(prev => [...prev, newOrder]);
      if (!editingOrderId) setNextOrderId(prev => prev + 1);
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
  const handleQueueCheckout = async (order, cashPaidAmount) => {
    const paidAmount = parseFloat(cashPaidAmount);
    if (isNaN(paidAmount) || paidAmount < order.total) {
      triggerAlert('Uang bayar kurang atau tidak valid.', 'error');
      return false;
    }
    const issues = checkCartFeasibility(order.items, inventory);
    if (issues.length > 0) {
      triggerAlert('Stok bahan tidak mencukupi!', 'error');
      return false;
    }
    const { updates, lowStockNames } = buildInventoryUpdates(order.items, inventory);
    const finalFinanceLog = {
      type: 'pemasukan',
      amount: order.total,
      description: `Penjualan Kasir: ${order.items.map(i => `${i.quantity}x ${i.product.name}`).join(', ')}`,
      date: getLocalISODate(),
    };
    try {
      const response = await apiCheckout({ inventoryUpdates: updates, financeLog: finalFinanceLog });
      const returnedFinanceId = response.financeId;
      setInventory(prev => prev.map(inv => {
        const u = updates.find(x => x.id === inv.id);
        return u ? { ...inv, stock: u.stock } : inv;
      }));
      await refreshFinance();
      const targetId = `TRX-Q-${order.id}-${Date.now().toString().slice(-4)}`;
      const receiptData = {
        id: targetId,
        cashier: activeUser?.username || 'Kasir',
        date: new Date().toLocaleString('id-ID'),
        items: [...order.items],
        toppingPrice: order.toppingPrice || 0,
        subtotal: order.subtotal,
        toppingTotal: order.total - order.subtotal,
        total: order.total,
        cashPaid: paidAmount,
        change: paidAmount - order.total,
      };
      setCheckoutReceipt(receiptData);
      setOrderQueue(prev => prev.map(o => o.id === order.id ? {
        ...o,
        financeId: returnedFinanceId,
        label: `Pesanan #${o.id} (Lunas)`,
        status: 'paid',
      } : o));
      if (lowStockNames.length > 0) {
        triggerAlert(`Transaksi Sukses! Peringatan: Stok (${[...new Set(lowStockNames)].join(', ')}) menipis!`, 'warning');
      } else {
        triggerAlert(`Transaksi pesanan #${order.id} berhasil diproses!`, 'success');
      }
      return true;
    } catch (err) {
      triggerAlert(`Gagal checkout antrian: ${err.message}`, 'error');
      return false;
    }
  };
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
  const processOrder = async (orderId) => {
    if (cart.length > 0) { triggerAlert('Kosongkan keranjang terlebih dahulu!', 'warning'); return false; }
    const order = orderQueue.find(o => o.id === orderId);
    if (!order) return false;
    setCart(order.items);
    setToppingPrice(order.toppingPrice);
    setEditingOrderId(order.id);
    setEditingOldFinanceId(null);
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
  const filteredFinance = useMemo(() => [...finance].sort((a, b) => b.id - a.id), [finance]);
  const financeSummary = useMemo(() => {
    let income = 0; let expense = 0;
    finance.forEach(log => {
      if (log.type === 'pemasukan') income += parseFloat(log.amount);
      else expense += parseFloat(log.amount);
    });
    return { income, expense, profit: income - expense };
  }, [finance]);
  const todayMetrics = useMemo(() => {
    const todayStr = getLocalISODate();
    let totalSales = 0; let countTrx = 0;
    finance.forEach(log => {
      if (log.date === todayStr && log.type === 'pemasukan') {
        totalSales += parseFloat(log.amount); countTrx++;
      }
    });
    const lowStockCount = inventory.filter(item => item.stock < item.minStock).length;
    return { totalSales, countTrx, lowStockCount };
  }, [finance, inventory]);
  const handleSaveFinance = async (type, amount, description, date) => {
    const amountVal = parseFloat(amount);
    if (isNaN(amountVal) || amountVal <= 0 || !description) {
      triggerAlert('Data keuangan tidak valid.', 'error'); return false;
    }
    try {
      await apiAddFinance({ type, amount: amountVal, description, date });
      await refreshFinance();
      triggerAlert(`${type === 'pemasukan' ? 'Pemasukan' : 'Pengeluaran'} berhasil dicatat.`, 'success');
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
  return {
    users, products, inventory, finance, activeUser, appReady,
    authError, setAuthError, globalAlert, triggerAlert,
    ingredientRules,
    cart, setCart,
    posCategory, setPosCategory,
    posSearch, setPosSearch,
    toppingPrice, setToppingPrice,
    cashPaid, setCashPaid,
    checkoutReceipt, setCheckoutReceipt,
    cartSubtotal, cartToppingTotal, cartTotal, cartChange,
    stockStatus, checkCartFeasibility,
    orderQueue, nextOrderId,
    addToCart, updateCartQuantity, toggleCartTopping,
    handleCheckout,
    handleQueueCheckout,
    addToOrderQueue, removeFromOrderQueue,
    processOrder, completePaidOrder, editPaidOrder,
    handleLogin, handleLogout, handleForgotPassword, requestPasswordReset, verifyPasswordResetCode, confirmPasswordReset,
    addUser, updateUser, deleteUser,
    handleSaveProduct, handleDeleteProduct, handleSaveRecipe,
    handleSaveInventory, handleDeleteInventory, handleSaveRestock,
    filteredFinance, financeSummary, allTimeSummary: financeSummary, todayMetrics,
    startDate, setStartDate, endDate, setEndDate,
    handleSaveFinance, handleExportCSV,
    chartData, maxChartVal,
  };
}
