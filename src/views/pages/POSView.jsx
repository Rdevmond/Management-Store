import { useMemo, useState, useCallback } from 'react';
import {
  FiSearch, FiTrash2, FiPrinter, FiX, FiCreditCard, FiShoppingBag,
  FiMinus, FiPlus, FiList, FiAlertTriangle, FiAlertCircle, FiCheckCircle, FiClock
} from 'react-icons/fi';

const fmt = (n) => 'Rp ' + Number(n).toLocaleString('id-ID');

const ProductMedia = ({ media, name, size = 'w-12 h-12' }) => {
  const isUrl = media && (media.startsWith('http') || media.startsWith('/') || media.startsWith('data:'));
  return (
    <div className={`${size} rounded-xl overflow-hidden flex items-center justify-center shrink-0 bg-[#f8fafc] border border-slate-150 shadow-inner`}>
      {isUrl
        ? <img src={media} alt={name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300" />
        : <span className="text-2xl select-none filter drop-shadow-sm transform group-hover:scale-110 transition-transform duration-300">{media || '🍧'}</span>}
    </div>
  );
};

// Removed hardcoded CATEGORIES array

export default function POSView({ controller }) {
  const {
    products, cart, posCategory, setPosCategory, posSearch, setPosSearch,
    toppingPrice, setToppingPrice, cashPaid, setCashPaid,
    checkoutReceipt, setCheckoutReceipt, inventory,
    addToCart, updateCartQuantity, toggleCartTopping, handleCheckout,
    cartToppingTotal, cartTotal, cartChange,
    orderQueue, addToOrderQueue, removeFromOrderQueue, checkCartFeasibility, stockStatus,
    ingredientRules,
  } = controller;

  const [activePanel, setActivePanel] = useState('cart'); // 'cart' | 'queue'

  const filtered = useMemo(() => products.filter(p =>
    (posCategory === 'All' || p.category === posCategory) &&
    p.name.toLowerCase().includes(posSearch.toLowerCase())
  ), [products, posCategory, posSearch]);

  const CATEGORIES = useMemo(() => {
    const cats = new Set(products.map(p => p.category));
    return ['All', ...Array.from(cats).sort()];
  }, [products]);

  const totalQty = useMemo(() => cart.reduce((s, i) => s + i.quantity, 0), [cart]);

  // Real-time feasibility check for current cart (safety fallback)
  const cartIssues = useMemo(() => {
    if (cart.length === 0) return [];
    return checkCartFeasibility(cart, inventory);
  }, [cart, inventory, checkCartFeasibility]);

  // Dynamic stock computation based on DB ingredient rules and current cart consumption
  const getProductStock = useCallback((product) => {
    const rules = ingredientRules[product.id] || [];
    if (rules.length === 0) return 999;
    
    let minPortions = Infinity;
    rules.forEach(rule => {
      const invItem = inventory.find(i => i.id === rule.id);
      if (!invItem) return;
      
      const consumed = cart.reduce((acc, cartItem) => {
        const itemRules = ingredientRules[cartItem.product.id] || [];
        const match = itemRules.find(r => r.id === rule.id);
        return acc + (match ? match.amount * cartItem.quantity : 0);
      }, 0);
      
      const remaining = Math.max(0, invItem.stock - consumed);
      const portions = Math.floor(remaining / rule.amount);
      if (portions < minPortions) {
        minPortions = portions;
      }
    });
    
    return minPortions === Infinity ? 0 : minPortions;
  }, [inventory, cart, ingredientRules]);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-[fadeIn_0.4s_ease-out] text-slate-800">

      {/* ── LEFT: Menu Selection ── */}
      <div className="lg:col-span-2 flex flex-col gap-5">

        {/* Stock Alert Banners */}
        {stockStatus.out.length > 0 && (
          <div className="flex items-start gap-2.5 bg-rose-50 border border-rose-100 px-4 py-3 rounded-2xl text-xs text-rose-700 font-semibold animate-[fadeIn_0.3s_ease-out] shadow-sm">
            <FiAlertCircle className="shrink-0 mt-0.5 text-rose-500 text-sm" />
            <div>
              <span className="font-bold">Bahan Baku Habis: </span>
              {stockStatus.out.map(i => i.name).join(', ')}
            </div>
          </div>
        )}
        {stockStatus.low.length > 0 && (
          <div className="flex items-start gap-2.5 bg-amber-50 border border-amber-100 px-4 py-3 rounded-2xl text-xs text-amber-700 font-semibold animate-[fadeIn_0.3s_ease-out] shadow-sm">
            <FiAlertTriangle className="shrink-0 mt-0.5 text-amber-500 text-sm" />
            <div>
              <span className="font-bold">Bahan Baku Menipis: </span>
              {stockStatus.low.filter(i => i.stock > 0).map(i => `${i.name} (sisa ${i.stock} ${i.unit})`).join(', ')}
            </div>
          </div>
        )}

        {/* Search + Filter bar */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-[0_2px_12px_rgba(0,0,0,0.03)] p-4 space-y-3.5">
          <div className="flex gap-3 items-center">
            <div className="relative flex-1">
              <FiSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-sm" />
              <input
                type="text"
                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-[#1b305b]/10 focus:border-[#1b305b] focus:bg-white transition-all placeholder:text-slate-350 text-slate-800"
                placeholder="Cari nama menu..."
                value={posSearch}
                onChange={e => setPosSearch(e.target.value)}
              />
            </div>
            <button
              onClick={() => setToppingPrice(p => p === 0 ? 2000 : 0)}
              className={`shrink-0 px-4 py-2.5 rounded-xl text-xs font-bold transition-all border ${
                toppingPrice > 0
                  ? 'bg-[#108e50] text-white border-[#108e50] shadow-sm active:scale-95'
                  : 'bg-slate-50 border-slate-250 text-slate-500 hover:bg-slate-100/50 hover:border-slate-350'
              }`}
            >
              Topping: {toppingPrice > 0 ? `+${fmt(2000)}` : 'Gratis'}
            </button>
          </div>

          {/* Category pills */}
          <div className="flex flex-wrap gap-1.5 pt-1.5 border-t border-slate-100/80">
            {CATEGORIES.map(cat => (
              <button key={cat} onClick={() => setPosCategory(cat)}
                className={`px-3.5 py-2 rounded-xl text-[10px] font-extrabold tracking-wide uppercase transition-all border ${
                  posCategory === cat
                    ? 'bg-[#1b305b] text-white border-[#1b305b] shadow-sm'
                    : 'bg-[#f8fafc] border-slate-200 text-slate-500 hover:text-[#1b305b] hover:bg-slate-100/50 hover:border-slate-300'
                }`}>
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Product Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-3.5">
          {filtered.map(prod => {
            const stockCount = getProductStock(prod);
            const isOutOfStock = stockCount === 0;
            return (
              <div key={prod.id}
                onClick={() => {
                  if (!isOutOfStock) addToCart(prod);
                }}
                className={`bg-white border border-slate-100 rounded-2xl p-3.5 shadow-[0_2px_8px_rgba(0,0,0,0.02)] hover:shadow-[0_8px_24px_rgba(0,0,0,0.06)] hover:border-[#108e50]/20 cursor-pointer transition-all duration-300 flex flex-col gap-2.5 group relative ${
                  isOutOfStock ? 'opacity-55 bg-slate-50/50 cursor-not-allowed select-none' : ''
                }`}
              >
                {/* Product Image and Category Tag */}
                <div className="relative flex items-center justify-between">
                  <ProductMedia media={prod.image} name={prod.name} size="w-12 h-12" />
                  <div className="flex flex-col items-end gap-1.5 max-w-[50%]">
                    <span className="text-[8px] font-bold text-slate-400 border border-slate-100 bg-[#f8fafc] px-1.5 py-0.5 rounded-md uppercase tracking-wider text-right truncate">
                      {prod.category.split(' / ')[0]}
                    </span>
                    {/* Stock status indicator */}
                    {isOutOfStock ? (
                      <span className="text-[8px] font-extrabold text-rose-600 bg-rose-50 border border-rose-100 px-1.5 py-0.5 rounded-md uppercase tracking-wider">
                        Habis
                      </span>
                    ) : stockCount <= 5 ? (
                      <span className="text-[8px] font-extrabold text-amber-700 bg-amber-50 border border-amber-100 px-1.5 py-0.5 rounded-md uppercase tracking-wider animate-pulse">
                        Sisa {stockCount}
                      </span>
                    ) : (
                      <span className="text-[8px] font-extrabold text-[#108e50] bg-emerald-50 border border-emerald-100/50 px-1.5 py-0.5 rounded-md uppercase tracking-wider">
                        Stok {stockCount}
                      </span>
                    )}
                  </div>
                </div>

                {/* Product Name & Price */}
                <div className="flex-1 flex flex-col justify-between">
                  <h4 className="text-[11px] font-bold text-[#1b305b] leading-snug line-clamp-2 group-hover:text-[#108e50] transition-colors duration-200">
                    {prod.name}
                  </h4>
                  <div className="flex items-center justify-between mt-2 pt-2 border-t border-slate-50">
                    <span className="text-xs font-extrabold text-slate-700">{fmt(prod.price)}</span>
                    {isOutOfStock ? (
                      <span className="text-[9px] font-bold text-slate-400 bg-slate-100 px-2.5 py-1 rounded-lg border border-slate-200">
                        Habis
                      </span>
                    ) : (
                      <span className="text-[9px] font-bold text-[#108e50] bg-emerald-50 border border-emerald-150 px-2.5 py-1 rounded-lg group-hover:bg-[#108e50] group-hover:text-white transition-all duration-200">
                        + Pilih
                      </span>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
          {filtered.length === 0 && (
            <div className="col-span-full py-20 text-center text-slate-400 text-xs font-semibold border border-dashed border-slate-200 rounded-2xl bg-white shadow-sm">
              Tidak ada menu yang ditemukan.
            </div>
          )}
        </div>
      </div>

      {/* ── RIGHT: Cart + Queue ── */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-[0_2px_12px_rgba(0,0,0,0.03)] flex flex-col sticky top-6" style={{ height: 'calc(100vh - 48px)' }}>

        {/* Panel Tab Switcher */}
        <div className="px-3.5 pt-3.5 pb-0">
          <div className="flex gap-1 p-1 bg-slate-100/80 rounded-xl">
            <button onClick={() => setActivePanel('cart')}
              className={`flex-1 py-2 rounded-lg text-[10px] font-extrabold uppercase tracking-wide transition-all flex items-center justify-center gap-1.5 ${
                activePanel === 'cart'
                  ? 'bg-white text-[#1b305b] shadow-[0_2px_8px_rgba(0,0,0,0.05)]'
                  : 'text-slate-400 hover:text-slate-650'
              }`}>
              <FiShoppingBag className="text-xs text-[#108e50]" />
              <span>Keranjang</span>
              {totalQty > 0 && (
                <span className="px-1.5 py-0.5 rounded-md bg-[#108e50] text-white text-[8px] font-extrabold leading-none">
                  {totalQty}
                </span>
              )}
            </button>
            <button onClick={() => setActivePanel('queue')}
              className={`flex-1 py-2 rounded-lg text-[10px] font-extrabold uppercase tracking-wide transition-all flex items-center justify-center gap-1.5 ${
                activePanel === 'queue'
                  ? 'bg-white text-[#1b305b] shadow-[0_2px_8px_rgba(0,0,0,0.05)]'
                  : 'text-slate-400 hover:text-slate-655'
              }`}>
              <FiList className="text-xs text-[#1b305b]" />
              <span>Antrian</span>
              {orderQueue.length > 0 && (
                <span className="w-4 h-4 rounded-full bg-rose-500 text-white text-[9px] font-extrabold flex items-center justify-center leading-none">
                  {orderQueue.length}
                </span>
              )}
            </button>
          </div>
        </div>

        {/* ─── CART PANEL ─── */}
        {activePanel === 'cart' && (
          <>
            {/* Cart feasibility warning */}
            {cartIssues.length > 0 && (
              <div className="mx-3.5 mt-3.5 flex items-start gap-2 bg-rose-50 border border-rose-100 px-3 py-2.5 rounded-xl text-[10px] text-rose-700 font-semibold shadow-sm">
                <FiAlertCircle className="shrink-0 mt-0.5 text-rose-500" />
                <div>
                  <p className="font-bold mb-0.5">Peringatan: Stok bahan kurang!</p>
                  {cartIssues.map((issue, i) => (
                    <p key={i}>· {issue.name}: sisa {issue.stock} {issue.unit}, butuh {issue.needed} {issue.unit}</p>
                  ))}
                </div>
              </div>
            )}

            {/* Cart items */}
            <div className="flex-1 overflow-y-auto px-4 py-3.5 space-y-3">
              {cart.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center py-16 select-none animate-[fadeIn_0.3s_ease-out]">
                  <span className="text-4xl mb-3 filter grayscale opacity-45">🛒</span>
                  <p className="text-[11px] font-bold text-[#1b305b]">Keranjang Belanja Kosong</p>
                  <p className="text-[10px] text-slate-400 mt-1">Ketuk menu di sebelah kiri untuk menambahkan pesanan.</p>
                </div>
              ) : cart.map(item => {
                const toppCost = Object.values(item.toppings).filter(Boolean).length * toppingPrice * item.quantity;
                const itemTotal = item.product.price * item.quantity + toppCost;
                return (
                  <div key={item.product.id} className="pb-2.5 border-b border-slate-100 last:border-0 space-y-1.5 animate-[fadeIn_0.2s_ease-out]">
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center justify-between">
                          <p className="text-[11px] font-bold text-[#1b305b] leading-tight truncate pr-2">{item.product.name}</p>
                          <span className="text-[11px] font-extrabold text-[#108e50] shrink-0">{fmt(itemTotal)}</span>
                        </div>
                        <div className="flex items-center justify-between mt-1">
                          {/* Toppings Pills */}
                          <div className="flex gap-1">
                            {['nanas', 'meses'].map(key => (
                              <button key={key} onClick={() => toggleCartTopping(item.product.id, key)}
                                className={`px-2 py-0.5 rounded-md text-[9px] font-bold transition-all border ${
                                  item.toppings[key] ? 'bg-[#108e50] text-white border-[#108e50]' : 'bg-slate-50 text-slate-400 border-slate-200 hover:border-slate-300'
                                }`}>
                                {key}
                              </button>
                            ))}
                          </div>
                          
                          {/* Compact Quantity & Trash */}
                          <div className="flex items-center gap-2">
                            <div className="flex items-center border border-slate-200 rounded-lg overflow-hidden bg-white">
                              <button onClick={() => updateCartQuantity(item.product.id, item.quantity - 1)}
                                className="w-5 h-5 flex items-center justify-center bg-slate-50 hover:bg-slate-100 text-slate-600 transition-colors">
                                <FiMinus className="text-[8px]" />
                              </button>
                              <span className="w-5 text-center text-[10px] font-bold text-[#1b305b]">{item.quantity}</span>
                              <button onClick={() => updateCartQuantity(item.product.id, item.quantity + 1)}
                                className="w-5 h-5 flex items-center justify-center bg-slate-50 hover:bg-slate-100 text-slate-600 transition-colors">
                                <FiPlus className="text-[8px]" />
                              </button>
                            </div>
                            <button onClick={() => updateCartQuantity(item.product.id, 0)}
                              className="text-slate-350 hover:text-rose-600 hover:bg-rose-50 p-1 rounded-lg transition-colors">
                              <FiTrash2 className="text-[10px]" />
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Payment panel */}
            <div className="px-3 pb-3 pt-2.5 border-t border-slate-100 space-y-2.5 bg-[#f8fafc]/60 rounded-b-2xl shrink-0">
              {/* Totals Inline */}
              <div className="flex justify-between items-end bg-white border border-slate-200 shadow-sm rounded-xl px-3 py-2">
                <div className="space-y-0.5">
                  <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wide block">Total Pembayaran</span>
                  {(toppingPrice > 0 && cartToppingTotal > 0) && (
                     <span className="text-[8px] font-semibold text-slate-400">Termasuk topping {fmt(cartToppingTotal)}</span>
                  )}
                </div>
                <span className="text-sm font-black text-[#1b305b]">{fmt(cartTotal)}</span>
              </div>

              {/* Cash input inline with fast buttons */}
              <div className="flex gap-2 items-center">
                <div className="relative flex-1">
                  <span className="absolute inset-y-0 left-2.5 flex items-center text-[10px] font-extrabold text-slate-400">Rp</span>
                  <input type="number"
                    className="w-full pl-8 pr-2 py-2 bg-white border border-slate-250 text-slate-800 font-bold text-xs rounded-xl focus:outline-none focus:ring-2 focus:ring-[#108e50]/20 focus:border-[#108e50] transition-all shadow-sm"
                    placeholder="Uang Tunai"
                    value={cashPaid}
                    onChange={e => setCashPaid(e.target.value)}
                  />
                </div>
                {parseFloat(cashPaid) >= cartTotal && cartTotal > 0 && (
                  <div className="flex items-center gap-1.5 bg-emerald-50 border border-emerald-150 px-2 py-1.5 rounded-xl shrink-0 animate-[fadeIn_0.2s_ease-out]">
                    <span className="text-[8px] font-bold text-emerald-700 uppercase">Kembali</span>
                    <span className="text-[11px] font-black text-emerald-700">{fmt(cartChange)}</span>
                  </div>
                )}
              </div>

              {/* Fast cash buttons */}
              {cartTotal > 0 && (
                <div className="flex gap-1.5 overflow-x-auto pb-1 animate-[fadeIn_0.2s_ease-out]" style={{ scrollbarWidth: 'none' }}>
                  {[cartTotal, 20000, 50000, 100000].filter(v => v > 0).map(val => (
                    <button key={val} onClick={() => setCashPaid(val.toString())}
                      className="shrink-0 bg-white hover:bg-slate-50 active:bg-slate-100 text-[#1b305b] text-[9px] font-bold px-3 py-1.5 border border-slate-200 rounded-lg transition-all shadow-sm active:scale-95">
                      {val === cartTotal ? 'Uang Pas' : Number(val).toLocaleString('id-ID')}
                    </button>
                  ))}
                </div>
              )}

              {/* Action buttons */}
              <div className="grid grid-cols-2 gap-2 pt-0.5">
                <button
                  onClick={addToOrderQueue}
                  disabled={cart.length === 0 || cartIssues.length > 0}
                  className={`py-2 flex items-center justify-center gap-1.5 text-[10px] font-bold rounded-xl border transition-all ${
                    cart.length > 0 && cartIssues.length === 0
                      ? 'border-[#1b305b] bg-white text-[#1b305b] hover:bg-slate-50 active:scale-95 shadow-sm'
                      : 'border-slate-200 bg-slate-50 text-slate-300 cursor-not-allowed'
                  }`}>
                  <FiList className="text-[10px]" />
                  <span>+ Antrian</span>
                </button>
                <button onClick={handleCheckout} disabled={cart.length === 0 || cartIssues.length > 0}
                  className={`py-2 flex items-center justify-center gap-1.5 text-[10px] font-bold text-white rounded-xl shadow-sm hover:shadow-md transition-all ${
                    cart.length > 0 && cartIssues.length === 0
                      ? 'bg-[#108e50] hover:bg-[#0c6c3d] active:scale-95'
                      : 'bg-slate-250 cursor-not-allowed opacity-60'
                  }`}>
                  <FiCreditCard className="text-[10px]" />
                  <span>Bayar & Struk</span>
                </button>
              </div>
            </div>
          </>
        )}

        {/* ─── ORDER QUEUE PANEL ─── */}
        {activePanel === 'queue' && (
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {orderQueue.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center py-20 select-none animate-[fadeIn_0.3s_ease-out]">
                <span className="text-4xl mb-3 filter grayscale opacity-45">📋</span>
                <p className="text-[11px] font-bold text-[#1b305b]">Antrian Pesanan Kosong</p>
                <p className="text-[10px] text-slate-400 mt-1">Gunakan tombol "+ Antrian" pada keranjang untuk memarkir pesanan sementara.</p>
              </div>
            ) : (
              orderQueue.map(order => {
                const orderTotal = order.items.reduce((acc, i) => {
                  const topCost = Object.values(i.toppings).filter(Boolean).length * order.toppingPrice * i.quantity;
                  return acc + i.product.price * i.quantity + topCost;
                }, 0);
                return (
                  <div key={order.id} className="bg-white rounded-lg border border-slate-200 shadow-sm overflow-hidden flex flex-col animate-[fadeIn_0.2s_ease-out]">
                    {/* Order header */}
                    <div className="flex items-center justify-between px-3 py-1.5 bg-[#1b305b] text-white">
                      <div className="flex items-center gap-1.5">
                        <FiClock className="text-[9px] text-slate-350" />
                        <span className="text-[10px] font-bold">{order.label}</span>
                        <span className="text-[8px] text-slate-300 font-mono ml-1">{order.timestamp}</span>
                      </div>
                      <button
                        onClick={() => removeFromOrderQueue(order.id)}
                        className="text-white/70 hover:text-white p-0.5 hover:bg-white/10 rounded transition-colors"
                      >
                        <FiX className="text-[10px]" />
                      </button>
                    </div>

                    {/* Order items */}
                    <div className="px-3 py-2 space-y-1 bg-slate-50/50">
                      {order.items.map((item, idx) => {
                        const activeTops = Object.keys(item.toppings).filter(k => item.toppings[k]);
                        return (
                          <div key={idx} className="flex justify-between items-start text-[9px] text-slate-700 font-medium">
                            <div className="flex gap-1.5">
                              <span className="font-bold text-[#1b305b]">{item.quantity}×</span>
                              <span>{item.product.name} {activeTops.length > 0 && <span className="text-[#108e50]">({activeTops.join(', ')})</span>}</span>
                            </div>
                            <span className="text-slate-500">{fmt(item.product.price * item.quantity)}</span>
                          </div>
                        );
                      })}
                    </div>

                    {/* Order footer & actions inline */}
                    <div className="flex items-center justify-between px-3 py-2 border-t border-slate-100 bg-white">
                      <div className="flex items-center gap-1">
                        <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Total:</span>
                        <span className="text-[11px] font-black text-[#1b305b]">{fmt(orderTotal)}</span>
                      </div>
                      
                      <div className="flex justify-end gap-1.5">
                        {order.status === 'paid' ? (
                          <>
                            <button onClick={() => controller.editPaidOrder(order.id)}
                              className="px-2.5 py-1 bg-amber-50 hover:bg-amber-100 text-amber-700 border border-amber-200 text-[9px] font-bold rounded transition-all shadow-sm">
                              Ubah
                            </button>
                            <button onClick={() => controller.completePaidOrder(order.id)}
                              className="px-2.5 py-1 bg-[#108e50] hover:bg-[#0c6c3d] text-white text-[9px] font-bold rounded flex items-center gap-1 transition-all active:scale-95 shadow-sm">
                              <FiCheckCircle className="text-[9px]" /> Selesai
                            </button>
                          </>
                        ) : (
                          <button onClick={() => controller.processOrder(order.id)}
                            className="px-2.5 py-1 bg-[#1b305b] hover:bg-[#132242] text-white text-[9px] font-bold rounded flex items-center gap-1 transition-all active:scale-95 shadow-sm">
                            <FiCreditCard className="text-[9px]" /> Bayar
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        )}
      </div>

      {/* ── Receipt Modal ── */}
      {checkoutReceipt && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 max-w-xs w-full border border-slate-150 shadow-2xl relative animate-[fadeIn_0.3s_ease-out]">
            <button onClick={() => setCheckoutReceipt(null)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 hover:bg-slate-50 p-1.5 rounded-lg transition-colors">
              <FiX className="text-base" />
            </button>

            {/* Receipt header */}
            <div className="text-center pb-4 border-b border-dashed border-slate-200 flex flex-col items-center">
              <div className="h-11 mb-2">
                <img src="/logo.png" alt="Logo" className="h-full w-auto object-contain" />
              </div>
              <h3 className="text-xs font-extrabold text-[#1b305b] uppercase tracking-wider">Es Susu Salju Korea</h3>
              <p className="text-[8px] text-[#108e50] font-black uppercase tracking-widest mt-0.5">Bingsoo &amp; Kietna Somboi</p>
              <p className="text-[9px] text-slate-400 mt-1 font-mono">{checkoutReceipt.id} · Struk Transaksi</p>
            </div>

            {/* Meta */}
            <div className="py-2.5 border-b border-dashed border-slate-200 font-mono text-[9px] text-slate-500 flex justify-between">
              <span>{checkoutReceipt.date.split(',')[0]}</span>
              <span>Kasir: {checkoutReceipt.cashier}</span>
            </div>

            {/* Items */}
            <div className="py-3 border-b border-dashed border-slate-200 font-mono space-y-2">
              {checkoutReceipt.items.map((item, i) => {
                const tops = Object.keys(item.toppings).filter(k => item.toppings[k]).join(', ');
                const tCost = Object.values(item.toppings).filter(Boolean).length * checkoutReceipt.toppingPrice * item.quantity;
                return (
                  <div key={i} className="text-[10px]">
                    <div className="flex justify-between text-slate-800 font-bold">
                      <span>{item.quantity}× {item.product.name}</span>
                      <span>{fmt(item.product.price * item.quantity)}</span>
                    </div>
                    {tops && (
                      <div className="flex justify-between text-[9px] text-slate-400 pl-3">
                        <span>↳ Topping: {tops}{checkoutReceipt.toppingPrice > 0 ? ' (+Rp2.000)' : ' (gratis)'}</span>
                        {tCost > 0 && <span>{fmt(tCost)}</span>}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Totals */}
            <div className="py-3 border-b border-slate-100 font-mono space-y-1.5 text-[10px]">
              <div className="flex justify-between text-slate-500 font-medium">
                <span>Subtotal Menu</span>
                <span>{fmt(checkoutReceipt.subtotal)}</span>
              </div>
              {checkoutReceipt.toppingTotal > 0 && (
                <div className="flex justify-between text-slate-500 font-medium">
                  <span>Topping</span>
                  <span>{fmt(checkoutReceipt.toppingTotal)}</span>
                </div>
              )}
              <div className="flex justify-between font-black text-slate-800 text-[11px] pt-1.5 border-t border-slate-150">
                <span>TOTAL</span>
                <span>{fmt(checkoutReceipt.total)}</span>
              </div>
              <div className="flex justify-between text-slate-500 font-medium">
                <span>Tunai</span>
                <span>{fmt(checkoutReceipt.cashPaid)}</span>
              </div>
              <div className="flex justify-between font-black text-emerald-700">
                <span>Kembalian</span>
                <span>{fmt(checkoutReceipt.change)}</span>
              </div>
            </div>

            <p className="text-center text-[9px] text-slate-450 italic mt-3.5 leading-relaxed font-medium">
              Terima kasih atas kunjungan Anda!<br />Pekanbaru, Riau
            </p>

            <div className="flex gap-2 mt-4 pt-3.5 border-t border-slate-100">
              <button onClick={() => window.print()}
                className="flex-1 py-2.5 bg-[#1b305b] hover:bg-[#132242] text-white text-[10px] font-bold rounded-xl flex items-center justify-center gap-1.5 transition-colors shadow-sm">
                <FiPrinter className="text-xs" /> Print Struk
              </button>
              <button onClick={() => setCheckoutReceipt(null)}
                className="flex-1 py-2.5 bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-600 text-[10px] font-bold rounded-xl transition-colors shadow-inner">
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

