import { useState, useMemo } from 'react';
import { 
  FiPlus, FiZap, FiEdit, FiTrash2, FiSearch, 
  FiAlertTriangle, FiExternalLink, FiFileText, FiPackage
} from 'react-icons/fi';
import InventoryModal from '../components/InventoryModal';
import RestockModal from '../components/RestockModal';
import defaultDessert from '../../assets/default-dessert.png';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import Card from '../components/ui/Card';

export default function InventoryView({ controller }) {
  const { 
    inventory, 
    handleSaveInventory, 
    handleDeleteInventory, 
    handleSaveRestock 
  } = controller;

  const [searchKeyword, setSearchKeyword] = useState('');
  const [showInvModal, setShowInvModal] = useState(false);
  const [mediaType, setMediaType] = useState('default');
  const [invForm, setInvForm] = useState({ 
    id: '', name: '', stock: '', unit: 'Pcs', minStock: '', price: '', purchaseLink: '', personalReview: '', image: '' 
  });
  
  const [restockItem, setRestockItem] = useState(null);
  const [restockAmount, setRestockAmount] = useState('');
  const [restockUnitPrice, setRestockUnitPrice] = useState('');
  const [isRestockPaid, setIsRestockPaid] = useState(true);

  const handleOpenAdd = () => {
    setInvForm({ id: '', name: '', stock: '', unit: 'Pcs', minStock: '', price: '', purchaseLink: '', personalReview: '', image: defaultDessert });
    setMediaType('default');
    setShowInvModal(true);
  };

  const handleOpenEdit = (item) => {
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

  const handleSubmitInventory = (e) => {
    e.preventDefault();
    handleSaveInventory(invForm);
    setShowInvModal(false);
  };

  const handleSubmitRestock = (e) => {
    e.preventDefault();
    handleSaveRestock(restockItem.id, restockAmount, restockUnitPrice, isRestockPaid);
    setRestockItem(null);
    setRestockAmount('');
    setRestockUnitPrice('');
  };

  const filteredInventory = useMemo(() => {
    const safeInventory = Array.isArray(inventory) ? inventory : [];
    return safeInventory.filter(item => 
      item && item.name?.toLowerCase().includes(searchKeyword.toLowerCase())
    );
  }, [inventory, searchKeyword]);

  return (
    <div className="space-y-6">
      <div className="sticky top-0 z-10 bg-slate-50 pt-1 pb-4">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-5 rounded-2xl border border-slate-100 shadow-sm">
          <div>
            <h2 className="text-xl font-bold text-slate-900">Gudang & Stok Bahan</h2>
            <p className="text-xs text-slate-500 font-medium mt-1">Pantau ketersediaan bahan baku</p>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
            <Input
              placeholder="Cari nama bahan baku..."
              icon={<FiSearch />}
              value={searchKeyword}
              onChange={(e) => setSearchKeyword(e.target.value)}
              containerClassName="w-full sm:w-64"
              className="h-10 text-sm rounded-xl"
            />
            <Button onClick={handleOpenAdd} icon={<FiPlus />} className="w-full sm:w-auto px-6">
              Tambah Bahan
            </Button>
          </div>
        </div>
      </div>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 pt-2">
        {filteredInventory.map((item) => {
          if (!item) return null;
          const isLowStock = Number(item.stock) <= Number(item.minStock);
          const isBase64OrDefault = typeof item.image === 'string' && 
            (item.image.startsWith('data:image') || item.image.includes('default-dessert'));
            
          return (
            <Card key={item.id} className="group hover:shadow-md transition-all overflow-hidden" bodyClassName="p-0 flex flex-col h-full">
              <div className="h-48 w-full bg-slate-100 flex items-center justify-center relative shrink-0">
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
              
              <div className="p-5 flex-grow flex flex-col justify-between space-y-4">
                <div>
                  <h4 className="font-bold text-slate-900 text-sm line-clamp-1 group-hover:text-green-600 transition-colors">{item.name}</h4>
                  <div className="mt-2 flex items-baseline gap-1">
                    <span className={`text-2xl font-black ${isLowStock ? 'text-rose-600' : 'text-slate-800'}`}>{item.stock}</span>
                    <span className="text-xs font-bold text-slate-500">{item.unit}</span>
                  </div>
                  <p className="text-xs text-slate-500 font-semibold mt-1">Batas aman: {item.minStock} {item.unit}</p>
                </div>
                
                {item.personalReview && (
                  <div className="p-2.5 bg-slate-50 border border-slate-100 rounded-xl flex items-start gap-2">
                    <FiFileText className="text-slate-400 text-sm mt-0.5 flex-shrink-0" />
                    <p className="text-xs font-medium text-slate-500 line-clamp-2">{item.personalReview}</p>
                  </div>
                )}
                
                <div className="flex flex-col gap-2 pt-3 border-t border-slate-100">
                  {item.purchaseLink && (
                    <a
                      href={item.purchaseLink}
                      target="_blank"
                      rel="noreferrer"
                      className="w-full text-xs font-bold text-sky-600 hover:text-sky-700 flex items-center justify-center gap-1 bg-sky-50 px-2 py-2.5 rounded-xl border border-sky-100/70 transition-colors shadow-sm"
                    >
                      <FiExternalLink /> Beli Online
                    </a>
                  )}
                  
                  <div className="grid grid-cols-3 gap-2">
                    <Button 
                      size="sm" 
                      variant="outline" 
                      className="bg-sky-50 text-sky-600 border-sky-200 hover:bg-sky-100 hover:border-sky-300"
                      onClick={() => { setRestockItem(item); setRestockUnitPrice(item.price || ''); }}
                      icon={<FiZap className="text-xs" />}
                    >
                      Stok
                    </Button>
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => handleOpenEdit(item)}
                      icon={<FiEdit className="text-xs" />}
                    >
                      Ubah
                    </Button>
                    <Button 
                      size="sm" 
                      variant="danger" 
                      onClick={() => handleDeleteInventory(item.id)}
                      icon={<FiTrash2 className="text-xs" />}
                    >
                      Hapus
                    </Button>
                  </div>
                </div>
              </div>
            </Card>
          );
        })}
      </div>
      
      <InventoryModal
        showInvModal={showInvModal}
        setShowInvModal={setShowInvModal}
        invForm={invForm}
        setInvForm={setInvForm}
        onSubmitInventory={handleSubmitInventory}
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
        onSubmitRestock={handleSubmitRestock}
      />
    </div>
  );
}