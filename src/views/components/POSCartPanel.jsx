import { FiTrash2, FiShoppingCart, FiAlertCircle, FiMinus, FiPlus, FiClock, FiCreditCard } from 'react-icons/fi';

export default function POSCartPanel({
  cart,
  cartIssues,
  fmt,
  toppingPrice,
  toggleCartTopping,
  updateCartQuantity,
  cartTotal,
  cartToppingTotal,
  cashPaid,
  setCashPaid,
  cartChange,
  handleCheckout,
  addToOrderQueue
}) {
  return (
    <div className="flex flex-col flex-1 min-h-0">
      {cartIssues.length > 0 && (
        <div className="mx-3.5 mt-3.5 flex items-start gap-2 bg-rose-50 border border-rose-100 px-3 py-2.5 rounded-xl text-xs text-rose-700 font-semibold shadow-sm">
          <FiAlertCircle className="shrink-0 mt-0.5 text-rose-500" />
          <div>
            <p className="font-bold mb-0.5">Peringatan: Stok bahan kurang!</p>
            {cartIssues.map((issue, i) => (
              <p key={i}>· {issue.name}: sisa {issue.stock} {issue.unit}, butuh {issue.needed} {issue.unit}</p>
            ))}
          </div>
        </div>
      )}
      <div className="flex-1 overflow-y-auto px-4 py-3.5 space-y-3">
        {cart.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center py-16 select-none animate-fade-in">
            <FiShoppingCart className="text-4xl mb-3 text-slate-300" />
            <p className="text-xs font-bold text-slate-900">Keranjang Belanja Kosong</p>
            <p className="text-xs text-slate-400 mt-1">Ketuk menu di sebelah kiri untuk menambahkan pesanan.</p>
          </div>
        ) : (
          cart.map(item => {
            const itemTotal = item.product.price * item.quantity;
            return (
              <div key={item.product.id} className="py-3 border-b border-slate-100 last:border-0 animate-fade-in-fast">
                <div className="flex items-center justify-between gap-2">
                  {/* Name + price stacked on left */}
                  <div className="min-w-0 flex-1">
                    <p className="text-[13px] font-bold text-slate-800 leading-snug line-clamp-2">{item.product.name}</p>
                    <span className="text-sm font-black text-green-600 mt-0.5 block">{fmt(itemTotal)}</span>
                    <div className="flex flex-wrap gap-1.5 mt-2">
                      {[
                        { key: 'messes', label: 'Messes' },
                        { key: 'agarAgar', label: 'Agar-agar' },
                        { key: 'nanas', label: 'Nanas' }
                      ].map(t => (
                        <button
                          key={t.key}
                          onClick={() => toggleCartTopping(item.product.id, t.key)}
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-full border transition-colors ${
                            item.toppings?.[t.key]
                              ? 'bg-amber-100 border-amber-200 text-amber-700'
                              : 'bg-white border-slate-200 text-slate-400 hover:border-slate-300 hover:bg-slate-50'
                          }`}
                        >
                          {t.label}
                        </button>
                      ))}
                    </div>
                  </div>
                  {/* Quantity controls + delete on right, vertically centered */}
                  <div className="flex items-center gap-2 shrink-0">
                    <div className="flex items-center border border-slate-200 rounded-lg overflow-hidden bg-white shadow-sm">
                      <button
                        onClick={() => updateCartQuantity(item.product.id, item.quantity - 1)}
                        className="w-7 h-7 flex items-center justify-center bg-slate-50 hover:bg-slate-100 text-slate-600 transition-colors"
                      >
                        <FiMinus className="text-xs" />
                      </button>
                      <span className="w-8 text-center text-sm font-bold text-slate-900">{item.quantity}</span>
                      <button
                        onClick={() => updateCartQuantity(item.product.id, item.quantity + 1)}
                        className="w-7 h-7 flex items-center justify-center bg-slate-50 hover:bg-slate-100 text-slate-600 transition-colors"
                      >
                        <FiPlus className="text-xs" />
                      </button>
                    </div>
                    <button
                      onClick={() => updateCartQuantity(item.product.id, 0)}
                      className="text-rose-500 hover:text-rose-700 hover:bg-rose-50 p-1.5 rounded-lg transition-colors border border-transparent hover:border-rose-100"
                    >
                      <FiTrash2 className="text-sm" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
      <div className="px-3 pb-3 pt-2.5 border-t border-slate-100 space-y-2.5 bg-slate-50/60 rounded-b-2xl shrink-0">
        <div className="flex justify-between items-end bg-white border border-slate-200 shadow-sm rounded-xl px-3 py-2">
          <div className="space-y-0.5">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wide block">Total Pembayaran</span>
          </div>
          <span className="text-sm font-black text-slate-900">{fmt(cartTotal)}</span>
        </div>
        <div className="flex gap-2 items-center">
          <div className="relative flex-1">
            <span className="absolute inset-y-0 left-2.5 flex items-center text-xs font-extrabold text-slate-400">Rp</span>
            <input
              type="number"
              className="w-full pl-8 pr-2 py-2 bg-white border border-slate-250 text-slate-800 font-bold text-xs rounded-xl focus:outline-none focus:ring-2 focus:ring-green-600/20 focus:border-green-600 transition-all shadow-sm"
              placeholder="Uang Tunai"
              value={cashPaid}
              onChange={e => setCashPaid(e.target.value)}
            />
          </div>
          {parseFloat(cashPaid) >= cartTotal && cartTotal > 0 && (
            <div className="flex items-center gap-1.5 bg-emerald-50 border border-emerald-150 px-2 py-1.5 rounded-xl shrink-0 animate-fade-in-fast">
              <span className="text-[10px] font-bold text-emerald-600 block leading-none">Kembalian</span>
              <span className="text-xs font-black text-emerald-700 leading-none">{fmt(cartChange)}</span>
            </div>
          )}
        </div>
        <div className="flex gap-2 text-xs">
          <button
            onClick={addToOrderQueue}
            className="flex-1 min-w-0 py-2.5 bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-600 font-extrabold rounded-xl transition-all active:scale-95 uppercase flex items-center justify-center gap-1.5 overflow-hidden"
          >
            <FiClock className="text-slate-400 text-sm shrink-0" />
            <span className="truncate text-[10px] tracking-wide">Simpan Antrian</span>
          </button>
          <button
            onClick={handleCheckout}
            disabled={cartIssues.length > 0}
            className="flex-1 min-w-0 py-2.5 bg-green-600 hover:bg-brand-green text-white font-extrabold rounded-xl transition-all shadow-sm hover:shadow active:scale-95 uppercase disabled:opacity-40 disabled:pointer-events-none flex items-center justify-center gap-1.5 overflow-hidden"
          >
            <FiCreditCard className="text-white text-sm shrink-0" />
            <span className="truncate text-[10px] tracking-wide">Proses Bayar</span>
          </button>
        </div>
      </div>
    </div>
  );
}
