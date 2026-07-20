import { FiX, FiPrinter, FiCornerDownRight } from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';

export default function CheckoutReceiptModal({
  checkoutReceipt,
  setCheckoutReceipt,
  fmt
}) {
  const navigate = useNavigate();
  if (!checkoutReceipt) return null;
  return (
    <div className="fixed inset-0 z-50 bg-slate-900/40 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl p-6 max-w-xs w-full border border-slate-150 shadow-2xl relative animate-fade-in">
        <button onClick={() => setCheckoutReceipt(null)}
          className="absolute top-4 right-4 text-slate-400 hover:text-slate-650 hover:bg-slate-50 p-1.5 rounded-lg transition-colors">
          <FiX className="text-base" />
        </button>
        <div className="text-center pb-4 border-b border-dashed border-slate-200 flex flex-col items-center">
          <div className="h-11 mb-2">
            <img src="/logo.png" alt="Logo" className="h-full w-auto object-contain" />
          </div>
          <h3 className="text-xs font-extrabold text-slate-900 uppercase tracking-wider">Es Susu Salju Korea</h3>
          <p className="text-[10px] text-green-600 font-black uppercase tracking-widest mt-0.5">Bingsoo &amp; Kietna Somboi</p>
          <p className="text-xs text-slate-400 mt-1 font-mono">{checkoutReceipt.id} · Struk Transaksi</p>
        </div>
        <div className="py-2.5 border-b border-dashed border-slate-200 font-mono text-xs text-slate-500 flex justify-between">
          <span>{checkoutReceipt.date.split(',')[0]}</span>
          <span>Kasir: {checkoutReceipt.cashier}</span>
        </div>
        <div className="py-3 border-b border-dashed border-slate-200 font-mono space-y-2">
          {checkoutReceipt.items.map((item, i) => {
            const tops = Object.keys(item.toppings).filter(k => item.toppings[k]).join(', ');
            const tCost = Object.values(item.toppings).filter(Boolean).length * checkoutReceipt.toppingPrice * item.quantity;
            return (
              <div key={i} className="text-xs">
                <div className="flex justify-between text-slate-800 font-bold">
                  <span>{item.quantity}x {item.product.name}</span>
                  <span>{fmt(item.product.price * item.quantity)}</span>
                </div>
                {tops && (
                  <div className="flex justify-between text-xs text-slate-400 pl-3">
                    <span><FiCornerDownRight className="inline mr-0.5 -mt-0.5" /> Topping: {tops}{checkoutReceipt.toppingPrice > 0 ? ' (+Rp2.000)' : ' (gratis)'}</span>
                    {tCost > 0 && <span>{fmt(tCost)}</span>}
                  </div>
                )}
              </div>
            );
          })}
        </div>
        <div className="py-3 border-b border-slate-100 font-mono space-y-1.5 text-xs">
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
          <div className="flex justify-between font-black text-slate-800 text-sm pt-2.5 mt-1 border-t border-slate-200">
            <span>TOTAL</span>
            <span>{fmt(checkoutReceipt.total)}</span>
          </div>
          <div className="flex justify-between text-slate-500 font-medium">
            <span>Tunai</span>
            <span>{fmt(checkoutReceipt.cashPaid)}</span>
          </div>
          <div className="flex justify-between font-black text-emerald-700 text-sm pt-1">
            <span>Kembalian</span>
            <span>{fmt(checkoutReceipt.change)}</span>
          </div>
        </div>
        <p className="text-center text-xs text-slate-450 italic mt-3.5 leading-relaxed font-medium">
          Terima kasih atas kunjungan Anda!<br />Pekanbaru, Riau
        </p>
        <div className="flex gap-2 mt-4 pt-3.5 border-t border-slate-100">
          <button onClick={() => { setCheckoutReceipt(null); navigate('/struk/' + checkoutReceipt.id); }}
            className="flex-1 py-2.5 bg-slate-900 hover:bg-dark-blue text-white text-xs font-bold rounded-xl flex items-center justify-center gap-1.5 transition-colors shadow-sm">
            <FiPrinter className="text-xs" /> Print Struk
          </button>
          <button onClick={() => setCheckoutReceipt(null)}
            className="flex-1 py-2.5 bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-600 text-xs font-bold rounded-xl transition-colors shadow-inner">
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
}
