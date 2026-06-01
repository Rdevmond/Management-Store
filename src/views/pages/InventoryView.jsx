import { useState, useMemo } from 'react';
import { 
  FiPlus, FiZap, FiEdit, FiTrash2, FiSearch, 
  FiAlertTriangle, FiExternalLink, FiFileText, FiPackage
} from 'react-icons/fi';
import InventoryModal from '../components/InventoryModal';
import RestockModal from '../components/RestockModal';
import defaultDessert from '../../assets/default-dessert.png';
export default function InventoryView({ controller }) {
  const { 
    inventory, 
    handleSaveInventory, 
    handleDeleteInventory, 
    handleSaveRestock 
  } = controller;
  const [searchQuery, setSearchQuery] = useState('');
  const [showInvModal, setShowInvModal] = useState(false);
  const [mediaType, setMediaType] = useState('default');
  const [invForm, setInvForm] = useState({ 
    id: '', name: '', stock: '', unit: 'Pcs', minStock: '', price: '', purchaseLink: '', personalReview: '', image: '' 
  });
  const [restockItem, setRestockItem] = useState(null);
  const [restockAmount, setRestockAmount] = useState('');
  const [restockUnitPrice, setRestockUnitPrice] = useState('');
  const [isRestockPaid, setIsRestockPaid] = useState(true);
  const onOpenAdd = () => {
    setInvForm({ id: '', name: '', stock: '', unit: 'Pcs', minStock: '', price: '', purchaseLink: '', personalReview: '', image: defaultDessert });
    setMediaType('default');
    setShowInvModal(true);
  };
  const onOpenEdit = (item) => {
    if (!item) return;
    const itemImage = item.image || defaultDessert;
    setInvForm({
      id: item.id, name: item.name, stock: item.stock ? item.stock.toString() : '0', unit: item.unit || 'Pcs', minStock: item.minStock ? item.minStock.toString() : '0',
      price: item.price !== undefined ? item.price.toString() : '', purchaseLink: item.purchaseLink || '',
      personalReview: item.personalReview || '', image: itemImage
    });
    setMediaType(
      typeof itemImage === 'string' && itemImage.startsWith('data:image') ? 'upload' :
      itemImage === defaultDessert ? 'default' :
      typeof itemImage === 'string' && itemImage !== '' ? 'emoji' : 'default'
    );
    setShowInvModal(true);
  };
  const onSubmitInventory = (e) => {
    e.preventDefault();
    handleSaveInventory(invForm);
    setShowInvModal(false);
  };
  const onSubmitRestock = (e) => {
    e.preventDefault();
    handleSaveRestock(restockItem.id, restockAmount, restockUnitPrice, isRestockPaid);
    setRestockItem(null);
    setRestockAmount('');
    setRestockUnitPrice('');
  };
  const filteredInventory = useMemo(() => {
    const safeInventory = Array.isArray(inventory) ? inventory : [];
    return safeInventory.filter(item => 
      item && item.name?.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [inventory, searchQuery]);
  return (
    <div className="p-6 space-y-6">
        <div className="sticky top-0 z-10 bg-white p-4 border-b border-slate-100">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-4 rounded-2xl border border-slate-100 shadow-sm">
            <div>
              <h2 className="text-xl font-bold text-slate-900">Gudang & Stok Bahan</h2>
              <p className="text-xs text-slate-500 font-medium">Pantau ketersediaan bahan baku Es Salju kamu</p>
            </div>
            <button 
              onClick={onOpenAdd}
              className="px-4 py-2.5 bg-green-600 hover:bg-brand-green text-white text-xs font-bold rounded-xl shadow-sm transition-all flex items-center gap-2 uppercase tracking-wider"
            >
              <FiPlus className="text-sm" />
              <span>Tambah Bahan</span>
            </button>
          </div>
          <div className="relative max-w-md mt-4">
            <span className="absolute inset-y-0 left-0 flex items-center pl-4 text-slate-400">
              <FiSearch />
            </span>
            <input
              type="text"
              className="w-full pl-11 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-900 placeholder:text-slate-400 shadow-sm"
              placeholder="Cari nama bahan baku gudang..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>
        <div>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {filteredInventory.map((item) => {
              if (!item) return null;
              const isLowStock = item.stock <= item.minStock;
              const isBase64OrDefault = typeof item.image === 'string' && 
                (item.image.startsWith('data:image') || item.image.includes('default-dessert'));
              return (
              <div key={item.id} className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden flex flex-col group hover:shadow-md transition-all">
                <div className="h-48 w-full bg-slate-100 flex items-center justify-center relative">
                  {item.image ? (
                    isBase64OrDefault ? (
                      <img src={item.image} alt={item.name} className="w-full h-full object-contain" />
                    ) : (
                      <span className="text-6xl select-none">{item.image}</span>
                    )
                  ) : (
                    <div className="w-12 h-12 bg-slate-100 rounded-xl flex items-center justify-center text-slate-400 border border-slate-200/60">
                      <FiPackage className="text-xl" />
                    </div>
                  )}
                  {isLowStock && (
                    <span className="absolute top-3 left-3 px-2.5 py-1 bg-rose-50 border border-rose-100 text-rose-600 text-xs font-bold rounded-lg flex items-center gap-1 shadow-sm animate-pulse">
                      <FiAlertTriangle /> STOK MENIPIS
                    </span>
                  )}
                </div>
                <div className="p-4 flex-grow flex flex-col justify-between space-y-4">
                  <div>
                    <h4 className="font-bold text-slate-900 text-sm line-clamp-1 group-hover:text-green-600 transition-colors">{item.name}</h4>
                    <div className="mt-2 flex items-baseline gap-1">
                      <span className={`text-2xl font-black ${isLowStock ? 'text-rose-600' : 'text-slate-800'}`}>{item.stock}</span>
                      <span className="text-xs font-bold text-slate-500">{item.unit}</span>
                    </div>
                    <p className="text-xs text-slate-500 font-semibold mt-1">Batas aman: {item.minStock} {item.unit}</p>
                  </div>
                  {item.personalReview && (
                    <div className="p-2 bg-slate-50 border border-slate-100 rounded-xl flex items-start gap-1.5">
                      <FiFileText className="text-slate-400 text-xs mt-0.5 flex-shrink-0" />
                      <p className="text-xs font-medium text-slate-500 line-clamp-2">{item.personalReview}</p>
                    </div>
                  )}
                  <div className="flex flex-col gap-2 pt-3 border-t border-slate-100">
                    {item.purchaseLink && (
                      <a
                        href={item.purchaseLink}
                        target="_blank"
                        rel="noreferrer"
                        className="w-full text-xs font-bold text-sky-600 hover:text-sky-700 flex items-center justify-center gap-1 bg-sky-50 px-2 py-2 rounded-xl border border-sky-100/70 transition-colors shadow-sm"
                      >
                        <FiExternalLink /> Beli Online
                      </a>
                    )}
                    <div className="grid grid-cols-3 gap-1.5">
                      <button 
                        onClick={() => { setRestockItem(item); setRestockUnitPrice(item.price || ''); }} 
                        className="px-1 py-2 bg-sky-50 hover:bg-sky-100 text-slate-900 text-xs font-bold rounded-xl transition-colors flex flex-col sm:flex-row items-center justify-center gap-0.5 sm:gap-1 border border-sky-100/50"
                      >
                        <FiZap className="text-sky-600 text-xs" />
                        <span>Restock</span>
                      </button>
                      <button 
                        onClick={() => onOpenEdit(item)} 
                        className="px-1 py-2 bg-slate-50 hover:bg-slate-100 text-slate-600 text-xs font-bold rounded-xl transition-colors flex flex-col sm:flex-row items-center justify-center gap-0.5 sm:gap-1 border border-slate-200"
                      >
                        <FiEdit className="text-xs" />
                        <span>Ubah</span>
                      </button>
                      <button 
                        onClick={() => handleDeleteInventory(item.id)} 
                        className="px-1 py-2 bg-rose-50 hover:bg-rose-100 text-rose-600 text-xs font-bold rounded-xl transition-colors flex flex-col sm:flex-row items-center justify-center gap-0.5 sm:gap-1 border border-rose-100/50"
                      >
                        <FiTrash2 className="text-xs" />
                        <span>Hapus</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
              );
            })}
          </div>
        </div>
      <InventoryModal
        showInvModal={showInvModal}
        setShowInvModal={setShowInvModal}
        invForm={invForm}
        setInvForm={setInvForm}
        onSubmitInventory={onSubmitInventory}
        mediaType={mediaType}
        setMediaType={setMediaType}
      />
      <RestockModal
        restockItem={restockItem}
        setRestockItem={setRestockItem}
        restockAmount={restockAmount}
        setRestockAmount={setRestockAmount}
        restockUnitPrice={restockUnitPrice}
        setRestockUnitPrice={setRestockUnitPrice}
        isRestockPaid={isRestockPaid}
        setIsRestockPaid={setIsRestockPaid}
        onSubmitRestock={onSubmitRestock}
      />
    </div>
  );
}