import { useMemo, useState, useCallback } from 'react';
import { 
  FiSearch, FiAlertTriangle, FiAlertCircle 
} from 'react-icons/fi';
import POSRightPanel from '../components/POSRightPanel';
import ProductMedia from '../components/ProductMedia';
import CheckoutReceiptModal from '../components/CheckoutReceiptModal';
import QueuePaymentModal from '../components/QueuePaymentModal';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import Card from '../components/ui/Card';

const fmt = (n) => 'Rp ' + Number(n).toLocaleString('id-ID');

export default function POSView({ controller }) {
  const {
    products, cart, posCategory, setPosCategory, posSearch, setPosSearch,
    toppingPrice, setToppingPrice, cashPaid, setCashPaid,
    checkoutReceipt, setCheckoutReceipt, inventory,
    addToCart, updateCartQuantity, toggleCartTopping, handleCheckout,
    handleQueueCheckout,
    cartToppingTotal, cartTotal, cartChange, cartSubtotal,
    orderQueue, addToOrderQueue, removeFromOrderQueue, checkCartFeasibility, stockStatus,
    ingredientRules,
    processOrder, completePaidOrder, editPaidOrder
  } = controller;

  const [activePanel, setActivePanel] = useState('cart');
  const [queueTab, setQueueTab] = useState('aktif');
  const [queueSearch, setQueueSearch] = useState('');
  const [paymentQueueOrder, setPaymentQueueOrder] = useState(null);

  const filtered = useMemo(() => products.filter(p =>
    (posCategory === 'All' || p.category === posCategory) && p.name.toLowerCase().includes(posSearch.toLowerCase())
  ), [products, posCategory, posSearch]);

  const CATEGORIES = useMemo(() => ['All', ...Array.from(new Set(products.map(p => p.category))).sort()], [products]);

  const totalQty = useMemo(() => cart.reduce((s, i) => s + i.quantity, 0), [cart]);

  const cartIssues = useMemo(() => {
    if (cart.length === 0) return [];
    return checkCartFeasibility(cart, inventory);
  }, [cart, inventory, checkCartFeasibility]);

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
    <div className="flex-1 min-h-0 grid grid-cols-1 lg:grid-cols-3 xl:grid-cols-4 gap-6 animate-fade-in-slow text-slate-800">
      <div className="lg:col-span-2 xl:col-span-3 flex flex-col gap-5 min-h-[500px] lg:min-h-0">
        {stockStatus.out.length > 0 && (
          <div className="flex items-start gap-2.5 bg-rose-50 border border-rose-100/60 px-4 py-3 rounded-2xl text-xs text-rose-700 font-semibold animate-fade-in shadow-sm">
            <FiAlertCircle className="shrink-0 mt-0.5 text-rose-500 text-sm animate-pulse" />
            <div>
              <span className="font-extrabold text-rose-800">Bahan Baku Habis: </span>
              {stockStatus.out.map(i => i.name).join(', ')}
            </div>
          </div>
        )}
        {stockStatus.low.length > 0 && (
          <div className="flex items-start gap-2.5 bg-amber-50 border border-amber-100/60 px-4 py-3 rounded-2xl text-xs text-amber-700 font-semibold animate-fade-in shadow-sm">
            <FiAlertTriangle className="shrink-0 mt-0.5 text-amber-500 text-sm" />
            <div>
              <span className="font-extrabold text-amber-800">Bahan Baku Menipis: </span>
              {stockStatus.low.filter(i => i.stock > 0).map(i => `${i.name} (sisa ${i.stock} ${i.unit})`).join(', ')}
            </div>
          </div>
        )}
        
        <Card className="rounded-3xl shadow-[0_4px_20px_rgba(0,0,0,0.015)] border-slate-100/80 p-0" bodyClassName="p-5 space-y-4">
          <div className="flex items-center">
            <Input
              placeholder="Cari nama menu..."
              icon={<FiSearch />}
              value={posSearch}
              onChange={e => setPosSearch(e.target.value)}
              containerClassName="flex-1 w-full"
              className="h-11 text-xs rounded-2xl bg-slate-50 focus:bg-white"
            />
          </div>
          <div className="flex flex-wrap gap-2 pt-2 border-t border-slate-50">
            {CATEGORIES.map(cat => (
              <Button 
                key={cat} 
                onClick={() => setPosCategory(cat)}
                size="sm"
                variant={posCategory === cat ? 'secondary' : 'outline'}
                className={`rounded-xl text-[10px] font-bold tracking-widest uppercase transition-all duration-200 border ${posCategory === cat ? 'bg-slate-900 text-white border-slate-900 shadow-md' : 'bg-slate-50 border-slate-200 text-slate-500 hover:text-slate-900'}`}
              >
                {cat}
              </Button>
            ))}
          </div>
        </Card>
        
        <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-4 flex-1 overflow-y-auto min-h-0 pr-1 pb-2 auto-rows-max items-start">
          {filtered.map(prod => {
            const stockCount = getProductStock(prod);
            const isOutOfStock = stockCount === 0;
            return (
              <Card 
                key={prod.id}
                onClick={() => { if (!isOutOfStock) addToCart(prod); }}
                className={`rounded-3xl border-slate-100/80 shadow-[0_4px_16px_rgba(0,0,0,0.01)] hover:shadow-lg hover:-translate-y-1 hover:border-green-600/20 cursor-pointer transition-all duration-300 group ${
                  isOutOfStock ? 'opacity-50 bg-slate-50/50 cursor-not-allowed select-none' : ''
                }`}
                bodyClassName="p-4 flex flex-col gap-3"
              >
                <div className="relative flex items-center justify-between">
                  <ProductMedia media={prod.image} name={prod.name} size="w-16 h-16" />
                  <div className="flex flex-col items-end gap-1.5 max-w-[52%]">
                    <span className="text-[10px] font-semibold text-slate-400 border border-slate-100 bg-slate-50 px-2 py-0.5 rounded-lg uppercase tracking-wider text-right truncate">
                      {prod.category.split(' / ')[0]}
                    </span>
                    {isOutOfStock ? (
                      <span className="text-[10px] font-bold text-rose-600 bg-rose-50 border border-rose-100/55 px-2 py-0.5 rounded-lg uppercase tracking-wider">Habis</span>
                    ) : stockCount <= 5 ? (
                      <span className="text-[10px] font-bold text-amber-700 bg-amber-50 border border-amber-100/55 px-2 py-0.5 rounded-lg uppercase tracking-wider animate-pulse">Sisa {stockCount}</span>
                    ) : (
                      <span className="text-[10px] font-bold text-green-650 bg-emerald-50 border border-emerald-100/50 px-2 py-0.5 rounded-lg uppercase tracking-wider">Stok {stockCount}</span>
                    )}
                  </div>
                </div>
                <div className="flex flex-col mt-3 mb-1">
                  <h4 className="text-base font-bold text-slate-800 leading-snug line-clamp-2 group-hover:text-green-600 transition-colors duration-200">{prod.name}</h4>
                </div>
                <div className="pt-3 border-t border-slate-50 flex items-center justify-between mt-auto">
                  <span className="text-lg font-black text-slate-900">{fmt(prod.price)}</span>
                </div>
              </Card>
            );
          })}
          {filtered.length === 0 && (
            <div className="col-span-full py-24 text-center text-slate-450 text-xs font-bold border border-dashed border-slate-200/80 rounded-3xl bg-white shadow-sm">Tidak ada menu yang ditemukan.</div>
          )}
        </div>
      </div>
      <POSRightPanel
        activePanel={activePanel} setActivePanel={setActivePanel}
        queueTab={queueTab} setQueueTab={setQueueTab}
        queueSearch={queueSearch} setQueueSearch={setQueueSearch}
        cart={cart} totalQty={totalQty} cartIssues={cartIssues} fmt={fmt}
        toppingPrice={toppingPrice} toggleCartTopping={toggleCartTopping}
        updateCartQuantity={updateCartQuantity} cartTotal={cartTotal}
        cartSubtotal={cartSubtotal} cartToppingTotal={cartToppingTotal}
        cashPaid={cashPaid} setCashPaid={setCashPaid} cartChange={cartChange}
        handleCheckout={handleCheckout} orderQueue={orderQueue}
        removeFromOrderQueue={removeFromOrderQueue} processOrder={processOrder}
        completePaidOrder={completePaidOrder} editPaidOrder={editPaidOrder}
        addToOrderQueue={addToOrderQueue}
        onPayQueueOrder={setPaymentQueueOrder}
      />
      <CheckoutReceiptModal
        checkoutReceipt={checkoutReceipt} setCheckoutReceipt={setCheckoutReceipt} fmt={fmt}
      />
      {paymentQueueOrder && (
        <QueuePaymentModal
          order={paymentQueueOrder}
          onClose={() => setPaymentQueueOrder(null)}
          fmt={fmt}
          onConfirm={async (cashPaid) => {
            const success = await handleQueueCheckout(paymentQueueOrder, cashPaid);
            if (success) {
              setPaymentQueueOrder(null);
            }
          }}
        />
      )}
    </div>
  );
}
