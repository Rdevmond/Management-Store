import { FiList, FiShoppingBag, FiCheckCircle, FiCreditCard } from 'react-icons/fi';

export default function POSQueuePanel({
  queueSearch,
  setQueueSearch,
  queueTab,
  setQueueTab,
  orderQueue,
  fmt,
  removeFromOrderQueue,
  onPayQueueOrder,
  editPaidOrder,
  completePaidOrder
}) {
  const filteredQueue = orderQueue.filter(o => {
    const isMatch = o.label.toLowerCase().includes(queueSearch.toLowerCase());
    const isTab = queueTab === 'aktif' ? o.status !== 'selesai' : o.status === 'selesai';
    return isMatch && isTab;
  });

  return (
    <div className="flex-1 flex flex-col min-h-0 bg-slate-50/50">
      <div className="p-3 bg-white border-b border-slate-100 space-y-3 shrink-0">
        <input
          type="text"
          className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-900 placeholder:text-slate-350"
          placeholder="Cari nomor antrian..."
          value={queueSearch}
          onChange={e => setQueueSearch(e.target.value)}
        />
        <div className="flex gap-1 p-0.5 bg-slate-100 rounded-lg">
          <button
            onClick={() => setQueueTab('aktif')}
            className={`flex-1 py-1.5 rounded-md text-xs font-bold uppercase transition-all ${
              queueTab === 'aktif' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-400'
            }`}
          >
            Aktif
          </button>
          <button
            onClick={() => setQueueTab('selesai')}
            className={`flex-1 py-1.5 rounded-md text-xs font-bold uppercase transition-all ${
              queueTab === 'selesai' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-400'
            }`}
          >
            Selesai
          </button>
        </div>
      </div>
      <div className="flex-1 overflow-y-auto p-3.5 space-y-3">
        {filteredQueue.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center py-16 text-slate-400 font-semibold select-none animate-fade-in">
            <FiList className="text-3xl mb-2 opacity-25" />
            <p className="text-xs">Tidak ada pesanan antrian</p>
          </div>
        ) : (
          filteredQueue.map(order => {
            const totalItemCount = order.items.reduce((s, i) => s + i.quantity, 0);
            return (
              <div key={order.id} className="bg-white border border-slate-100 rounded-2xl p-4 shadow-sm hover:shadow-md transition-shadow animate-fade-in-fast">
                {/* Header: label + badge */}
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div>
                    <span className="text-sm font-black text-slate-900 leading-tight block">{order.label}</span>
                    <span className="text-xs font-semibold text-slate-400 block mt-0.5">
                      {order.timestamp} · <span className="text-slate-600 font-bold">{totalItemCount} porsi</span>
                    </span>
                  </div>
                  <span className={`shrink-0 text-[11px] font-black px-3 py-1 rounded-xl uppercase tracking-wider border ${
                    order.status === 'antrian'
                      ? 'bg-amber-50 text-amber-600 border-amber-200'
                      : order.status === 'paid'
                      ? 'bg-sky-50 text-sky-600 border-sky-200'
                      : 'bg-emerald-50 text-emerald-600 border-emerald-200'
                  }`}>
                    {order.status === 'paid' ? 'Lunas' : order.status}
                  </span>
                </div>

                {/* Items list */}
                <div className="bg-slate-50 rounded-xl px-3 py-2.5 space-y-1 border border-slate-100 mb-3">
                  {order.items.map((item, idx) => {
                    const activeToppings = item.toppings 
                      ? Object.entries(item.toppings).filter(([_, v]) => v).map(([k]) => k.replace('agarAgar', 'Agar-agar').replace('messes', 'Messes').replace('nanas', 'Nanas'))
                      : [];
                    return (
                      <div key={idx} className="flex flex-col mb-1.5 last:mb-0">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-semibold text-slate-600 truncate">{item.product.name}</span>
                          <span className="text-xs font-black text-slate-800 shrink-0 ml-2">{item.quantity}x</span>
                        </div>
                        {activeToppings.length > 0 && (
                          <div className="flex flex-wrap gap-1 mt-0.5">
                            {activeToppings.map((top, i) => (
                              <span key={i} className="text-[9px] font-bold bg-amber-100 text-amber-700 px-1.5 py-0.5 rounded uppercase tracking-wider">
                                {top}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>

                {/* Footer: total + actions */}
                <div className="flex items-center justify-between gap-2">
                  <span className="text-base font-black text-slate-900">{fmt(order.total)}</span>
                  <div className="flex gap-1.5">
                    {order.status === 'antrian' && (
                      <>
                        <button
                          onClick={() => removeFromOrderQueue(order.id)}
                          className="px-3 py-1.5 text-rose-600 hover:bg-rose-50 rounded-xl transition-colors text-xs font-bold uppercase border border-rose-200"
                        >
                          Hapus
                        </button>
                        <button
                          onClick={() => onPayQueueOrder(order)}
                          className="px-3 py-1.5 bg-green-600 hover:bg-green-700 text-white rounded-xl transition-all text-xs font-bold uppercase flex items-center gap-1 shadow-sm"
                        >
                          <FiShoppingBag className="text-xs" /> Bayar
                        </button>
                      </>
                    )}
                    {order.status === 'paid' && (
                      <>
                        <button
                          onClick={() => editPaidOrder(order.id)}
                          className="px-3 py-1.5 text-slate-500 hover:bg-slate-100 rounded-xl transition-colors text-xs font-bold uppercase border border-slate-200"
                        >
                          Ubah
                        </button>
                        <button
                          onClick={() => completePaidOrder(order.id)}
                          className="px-3 py-1.5 bg-slate-900 hover:bg-slate-700 text-white rounded-xl transition-all text-xs font-bold uppercase flex items-center gap-1 shadow-sm"
                        >
                          <FiCheckCircle className="text-xs" /> Selesai
                        </button>
                      </>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
