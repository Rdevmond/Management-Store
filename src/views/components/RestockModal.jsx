import { createPortal } from 'react-dom';
import { FiX, FiZap } from 'react-icons/fi';
export default function RestockModal({
  restockItem,
  setRestockItem,
  restockAmount,
  setRestockAmount,
  restockUnitPrice,
  setRestockUnitPrice,
  isRestockPaid,
  setIsRestockPaid,
  onSubmitRestock
}) {
  if (!restockItem) return null;
  return createPortal(
    <div className="fixed inset-0 z-50 bg-slate-900/40 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl p-6 max-w-sm w-full border border-slate-100 shadow-2xl relative animate-fade-in text-slate-800 space-y-4">
        <button
          onClick={() => setRestockItem(null)}
          className="absolute top-4 right-4 text-slate-400 hover:text-slate-650 transition-colors"
        >
          <FiX className="text-lg" />
        </button>
        <div>
          <h3 className="text-lg font-bold text-slate-900 uppercase tracking-wide flex items-center gap-2">
            <FiZap className="text-green-600" />
            <span>Restock Bahan Baku</span>
          </h3>
          <p className="text-xs text-slate-400 font-medium mt-1">Tambahkan stok baru untuk: <strong className="text-slate-700">{restockItem.name}</strong></p>
        </div>
        <form onSubmit={onSubmitRestock} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-400 tracking-wider mb-1">Jumlah Tambahan</label>
            <div className="flex items-center space-x-2">
              <input
                type="number"
                step="0.01"
                required
                className="block flex-grow px-4 py-2.5 border border-slate-200 rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-900"
                placeholder="0"
                value={restockAmount}
                onChange={(e) => setRestockAmount(e.target.value)}
              />
              <span className="text-xs font-bold text-slate-900 bg-slate-50 px-4 py-2.5 border border-slate-200 rounded-xl">{restockItem.unit}</span>
            </div>
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-400 tracking-wider mb-1">Harga Beli per {restockItem.unit} (Rp)</label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-xs font-bold text-slate-400">Rp</span>
              <input
                type="number"
                step="1"
                className="block w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-900"
                placeholder={restockItem.price ? restockItem.price : 'Harga per unit'}
                value={restockUnitPrice}
                onChange={(e) => setRestockUnitPrice(e.target.value)}
              />
            </div>
            {restockAmount && restockUnitPrice && (
              <p className="text-xs text-slate-400 mt-1">
                Estimasi biaya: <span className="font-bold text-slate-600">Rp {(parseFloat(restockAmount) * parseFloat(restockUnitPrice)).toLocaleString('id-ID')}</span>
              </p>
            )}
          </div>
          <div className="flex items-start space-x-3 bg-slate-50 p-3 rounded-xl border border-slate-200">
            <input
              type="checkbox"
              id="restock-expense"
              className="rounded border-slate-350 text-green-600 focus:ring-green-600 mt-0.5 w-4 h-4 cursor-pointer"
              checked={isRestockPaid}
              onChange={(e) => setIsRestockPaid(e.target.checked)}
            />
            <label htmlFor="restock-expense" className="text-xs font-semibold text-slate-500 cursor-pointer select-none leading-relaxed">
              Catat sebagai Biaya Pengeluaran Operasional (Otomatis potong saldo kas toko)
            </label>
          </div>
          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={() => setRestockItem(null)}
              className="flex-grow py-2.5 border border-slate-200 text-slate-500 font-semibold rounded-xl hover:bg-slate-50 text-xs uppercase transition-colors"
            >
              Batal
            </button>
            <button
              type="submit"
              className="flex-grow py-2.5 bg-green-600 hover:bg-brand-green text-white font-semibold rounded-xl text-xs uppercase shadow-sm transition-colors"
            >
              Proses Restock
            </button>
          </div>
        </form>
      </div>
    </div>,
    document.body
  );
}
