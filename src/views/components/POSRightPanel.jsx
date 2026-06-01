import { FiShoppingBag, FiList } from 'react-icons/fi';
import POSCartPanel from './POSCartPanel';
import POSQueuePanel from './POSQueuePanel';

export default function POSRightPanel({
  activePanel,
  setActivePanel,
  queueTab,
  setQueueTab,
  queueSearch,
  setQueueSearch,
  cart,
  totalQty,
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
  orderQueue,
  removeFromOrderQueue,
  completePaidOrder,
  editPaidOrder,
  addToOrderQueue,
  onPayQueueOrder
}) {
  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-2xl flex flex-col h-full w-full max-w-full overflow-hidden">
      <div className="px-3.5 pt-3.5 pb-0">
        <div className="flex gap-1 p-1 bg-slate-100/80 rounded-xl">
          <button
            onClick={() => setActivePanel('cart')}
            className={`flex-1 py-2 rounded-lg text-xs font-extrabold uppercase tracking-wide transition-all flex items-center justify-center gap-1.5 ${
              activePanel === 'cart'
                ? 'bg-white text-slate-900 shadow-[0_2px_8px_rgba(0,0,0,0.05)]'
                : 'text-slate-400 hover:text-slate-650'
            }`}
          >
            <FiShoppingBag className="text-xs text-green-600" />
            <span>Keranjang</span>
            {totalQty > 0 && (
              <span className="px-1.5 py-0.5 rounded-md bg-green-600 text-white text-[10px] font-extrabold leading-none">
                {totalQty}
              </span>
            )}
          </button>
          <button
            onClick={() => setActivePanel('queue')}
            className={`flex-1 py-2 rounded-lg text-xs font-extrabold uppercase tracking-wide transition-all flex items-center justify-center gap-1.5 ${
              activePanel === 'queue'
                ? 'bg-white text-slate-900 shadow-[0_2px_8px_rgba(0,0,0,0.05)]'
                : 'text-slate-400 hover:text-slate-655'
            }`}
          >
            <FiList className="text-xs text-slate-900" />
            <span>Antrian</span>
            {orderQueue.filter(o => o.status !== 'selesai').length > 0 && (
              <span className="w-4 h-4 rounded-full bg-rose-500 text-white text-xs font-extrabold flex items-center justify-center leading-none">
                {orderQueue.filter(o => o.status !== 'selesai').length}
              </span>
            )}
          </button>
        </div>
      </div>
      {activePanel === 'cart' ? (
        <POSCartPanel
          cart={cart}
          cartIssues={cartIssues}
          fmt={fmt}
          toppingPrice={toppingPrice}
          toggleCartTopping={toggleCartTopping}
          updateCartQuantity={updateCartQuantity}
          cartTotal={cartTotal}
          cartToppingTotal={cartToppingTotal}
          cashPaid={cashPaid}
          setCashPaid={setCashPaid}
          cartChange={cartChange}
          handleCheckout={handleCheckout}
          addToOrderQueue={addToOrderQueue}
        />
      ) : (
        <POSQueuePanel
          queueSearch={queueSearch}
          setQueueSearch={setQueueSearch}
          queueTab={queueTab}
          setQueueTab={setQueueTab}
          orderQueue={orderQueue}
          fmt={fmt}
          removeFromOrderQueue={removeFromOrderQueue}
          onPayQueueOrder={onPayQueueOrder}
          editPaidOrder={editPaidOrder}
          completePaidOrder={completePaidOrder}
        />
      )}
    </div>
  );
}
