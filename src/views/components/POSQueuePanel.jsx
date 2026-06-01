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
              <div key={order.id} className="bg-white border border-slate-100 rounded-xl p-3 shadow-sm hover:shadow transition-shadow space-y-2 animate-fade-in-fast">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-xs font-bold text-slate-900 block leading-none">{order.label}</span>
                    <span className="text-[10px] font-semibold text-slate-450 block mt-1 leading-none">
                      {order.timestamp} · {totalItemCount} porsi
                    </span>
                  </div>
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-md uppercase tracking-wider ${
                      order.status === 'antrian'
                        ? 'bg-amber-50 text-amber-600 border border-amber-100'
                        : 'bg-emerald-50 text-emerald-600 border border-emerald-100'
                    }`}
                  >
                    {order.status}
                  </span>
                </div>
                <div className="text-xs text-slate-500 font-medium pl-1.5 border-l-2 border-slate-100 space-y-0.5 py-0.5">
                  {order.items.map((item, idx) => (
                    <p key={idx} className="truncate">
                      · {item.quantity}x {item.product.name}
                    </p>
                  ))}
                </div>
                <div className="flex items-center justify-between pt-2 border-t border-slate-55">
                  <span className="text-xs font-black text-slate-900">{fmt(order.total)}</span>
                  <div className="flex gap-1 text-[10px]">
                    {order.status === 'antrian' && (
                      <>
                        <button
                          onClick={() => removeFromOrderQueue(order.id)}
                          className="px-2 py-1 text-rose-600 hover:bg-rose-50 rounded-lg transition-colors font-bold uppercase border border-rose-100/50"
                        >
                          Hapus
                        </button>
                        <button
                          onClick={() => onPayQueueOrder(order)}
                          className="px-2.5 py-1 bg-green-600 hover:bg-brand-green text-white rounded-lg transition-all font-bold uppercase flex items-center gap-0.5"
                        >
                          <FiShoppingBag className="text-xs" /> Bayar
                        </button>
                      </>
                    )}
                    {order.status === 'paid' && (
                      <>
                        <button
                          onClick={() => editPaidOrder(order.id)}
                          className="px-2 py-1 text-slate-500 hover:bg-slate-100 rounded-lg transition-colors font-bold uppercase border border-slate-200"
                        >
                          Ubah
                        </button>
                        <button
                          onClick={() => completePaidOrder(order.id)}
                          className="px-2.5 py-1 bg-slate-900 hover:bg-dark-blue text-white rounded-lg transition-all font-bold uppercase flex items-center gap-0.5"
                        >
                          <FiCheckCircle className="text-xs" /> Selesai
                        </button>
                      </>
                    )}
                    {order.status === 'selesai' && (
                      <button
                        onClick={() => editPaidOrder(order.id)}
                        className="px-2 py-1 bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-500 rounded-lg font-bold uppercase flex items-center gap-0.5"
                      >
                        <FiCreditCard className="text-xs" /> Bayar
                      </button>
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
