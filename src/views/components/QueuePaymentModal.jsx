import { useState, useMemo } from 'react';
import { FiX, FiCreditCard, FiDollarSign, FiCornerDownRight } from 'react-icons/fi';

export default function QueuePaymentModal({ order, onClose, fmt, onConfirm }) {
  const [cashPaid, setCashPaid] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const subtotal = order.subtotal;
  const total = order.total;
  const toppingTotal = total - subtotal;

  const change = useMemo(() => {
    const paid = parseFloat(cashPaid) || 0;
    return paid >= total ? paid - total : 0;
  }, [cashPaid, total]);

  const isPaidEnough = useMemo(() => {
    const paid = parseFloat(cashPaid) || 0;
    return paid >= total;
  }, [cashPaid, total]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isPaidEnough || isSubmitting) return;
    setIsSubmitting(true);
    try {
      await onConfirm(cashPaid);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleQuickCash = (amount) => {
    setCashPaid(amount.toString());
  };

  const handleAddCash = (amount) => {
    const current = parseFloat(cashPaid) || 0;
    setCashPaid((current + amount).toString());
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl p-6 max-w-md w-full border border-slate-100 shadow-2xl relative animate-fade-in text-slate-800 space-y-5">
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-slate-650 hover:bg-slate-100/50 p-2 rounded-xl transition-all duration-200"
        >
          <FiX className="text-lg" />
        </button>
        
        <div>
          <h3 className="text-lg font-black text-dark-blue uppercase tracking-tight flex items-center gap-2">
            <FiCreditCard className="text-brand-green text-xl animate-pulse" />
            <span>Bayar Pesanan Antrian</span>
          </h3>
          <p className="text-xs text-slate-400 font-medium mt-0.5">
            Proses transaksi langsung untuk {order.label}
          </p>
        </div>

        <div className="bg-slate-50/70 border border-slate-100 rounded-2xl p-4 max-h-40 overflow-y-auto space-y-2.5">
          <div className="flex justify-between items-center text-[10px] text-slate-400 font-extrabold uppercase tracking-wider pb-1.5 border-b border-slate-200/55">
            <span>Daftar Menu</span>
            <span>{order.items.reduce((s, i) => s + i.quantity, 0)} Porsi</span>
          </div>
          <div className="space-y-2">
            {order.items.map((item, idx) => {
              const toppingsStr = Object.keys(item.toppings || {})
                .filter(k => item.toppings[k])
                .join(', ');
              return (
                <div key={idx} className="flex justify-between text-xs font-semibold">
                  <div className="min-w-0 flex-1 pr-2">
                    <span className="text-slate-800">{item.quantity}x {item.product.name}</span>
                    {toppingsStr && (
                      <span className="block text-[10px] text-slate-400 font-medium pl-2.5">
                        <FiCornerDownRight className="inline mr-1" /> Topping: {toppingsStr}
                      </span>
                    )}
                  </div>
                  <span className="text-slate-600 font-bold shrink-0">
                    {fmt(item.product.price * item.quantity + (Object.values(item.toppings || {}).filter(Boolean).length * (order.toppingPrice || 0) * item.quantity))}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        <div className="bg-slate-50/40 border border-slate-100/55 rounded-2xl p-4 space-y-2 text-xs">
          <div className="flex justify-between text-slate-500 font-semibold">
            <span>Subtotal Menu</span>
            <span>{fmt(subtotal)}</span>
          </div>
          {toppingTotal > 0 && (
            <div className="flex justify-between text-slate-500 font-semibold">
              <span>Topping</span>
              <span>{fmt(toppingTotal)}</span>
            </div>
          )}
          <div className="flex justify-between items-center pt-2.5 border-t border-slate-150 text-slate-900 font-black">
            <span className="text-xs uppercase tracking-wider font-extrabold">Total Pembayaran</span>
            <span className="text-base text-dark-blue">{fmt(total)}</span>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">
              Jumlah Uang Tunai (Rp)
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                <span className="text-xs font-black text-slate-400">Rp</span>
              </div>
              <input
                type="number"
                required
                className="block w-full pl-10 pr-4 py-3 border border-slate-200 rounded-2xl text-sm font-extrabold text-slate-800 focus:outline-none focus:ring-2 focus:ring-green-600/10 focus:border-green-600 focus:bg-white bg-slate-50 transition-all placeholder:font-medium shadow-inner"
                placeholder="Masukkan nominal uang..."
                value={cashPaid}
                onChange={(e) => setCashPaid(e.target.value)}
                autoFocus
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">
              Bantuan Uang Cepat
            </span>
            <div className="grid grid-cols-4 gap-1.5">
              <button
                type="button"
                onClick={() => handleQuickCash(total)}
                className="py-2 bg-emerald-50 hover:bg-emerald-100 border border-emerald-150 rounded-xl text-[10px] font-extrabold text-brand-green uppercase transition-all"
              >
                Uang Pas
              </button>
              <button
                type="button"
                onClick={() => handleQuickCash(50000)}
                className="py-2 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl text-[10px] font-extrabold text-slate-600 transition-all"
              >
                Rp 50rb
              </button>
              <button
                type="button"
                onClick={() => handleQuickCash(100000)}
                className="py-2 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl text-[10px] font-extrabold text-slate-600 transition-all"
              >
                Rp 100rb
              </button>
              <button
                type="button"
                onClick={() => handleAddCash(10000)}
                className="py-2 bg-sky-50 hover:bg-sky-100 border border-sky-150 rounded-xl text-[10px] font-extrabold text-sky-700 transition-all"
              >
                +10.000
              </button>
            </div>
          </div>

          {isPaidEnough && (
            <div className="flex items-center justify-between bg-emerald-50 border border-emerald-150 px-4 py-3 rounded-2xl animate-fade-in-fast">
              <div className="flex items-center gap-1.5 text-emerald-600">
                <FiDollarSign className="text-lg animate-bounce" />
                <span className="text-xs font-extrabold uppercase tracking-wide leading-none">Kembalian</span>
              </div>
              <span className="text-base font-black text-emerald-700 leading-none">
                {fmt(change)}
              </span>
            </div>
          )}

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-3 border border-slate-200 text-slate-500 font-bold rounded-2xl hover:bg-slate-50 text-xs uppercase tracking-wider transition-all duration-200 active:scale-95"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={!isPaidEnough || isSubmitting}
              className="flex-1 py-3 bg-green-600 hover:bg-brand-green text-white font-extrabold rounded-2xl text-xs uppercase tracking-wider shadow-md hover:shadow-lg transition-all duration-200 disabled:opacity-40 disabled:pointer-events-none active:scale-95 flex items-center justify-center gap-1"
            >
              {isSubmitting ? 'Memproses...' : 'Proses Bayar'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
