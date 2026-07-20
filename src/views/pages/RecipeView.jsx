import { useState, useMemo } from 'react';
import { FiPlus, FiTrash2, FiSave, FiList, FiBox, FiSearch } from 'react-icons/fi';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import Card from '../components/ui/Card';

export default function RecipeView({ controller }) {
  const { products, inventory, ingredientRules, handleSaveRecipe } = controller;
  const [selectedProductId, setSelectedProductId] = useState(null);
  const [currentRecipe, setCurrentRecipe] = useState([]);
  const [searchKeyword, setSearchKeyword] = useState('');
  
  const filteredProducts = useMemo(() => {
    const q = searchKeyword.toLowerCase();
    return products.filter(p => p.name.toLowerCase().includes(q) || p.category.toLowerCase().includes(q));
  }, [products, searchKeyword]);
  
  const selectedProduct = useMemo(() => products.find(p => p.id === selectedProductId), [products, selectedProductId]);
  
  const handleSelectProduct = (product) => {
    setSelectedProductId(product.id);
    const existingRules = ingredientRules[product.id] || [];
    setCurrentRecipe(existingRules.map(r => ({ inventory_id: r.id, amount: r.amount })));
  };
  
  const handleMaterialChange = (index, field, value) => {
    setCurrentRecipe(prev => prev.map((item, idx) => idx === index ? { ...item, [field]: field === 'inventory_id' ? parseInt(value) : value } : item));
  };
  
  const handleSave = async () => {
    if (!selectedProductId) return;
    const validRules = currentRecipe.filter(r => r.inventory_id && parseFloat(r.amount) > 0);
    if (new Set(validRules.map(r => r.inventory_id)).size !== validRules.length) {
      controller.triggerAlert('Terdapat bahan baku yang sama ganda. Harap gabungkan jumlahnya.', 'error');
      return;
    }
    await handleSaveRecipe(selectedProductId, validRules);
  };
  
  return (
    <div className="flex flex-col h-full animate-fade-in text-slate-800">
      <div className="mb-6 flex justify-between items-end">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-slate-800 flex items-center gap-2">
            <FiList className="text-green-600" /> Manajemen Resep & BOM
          </h2>
          <p className="text-sm text-slate-500 mt-1">Atur komposisi bahan baku untuk tiap-tiap menu.</p>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 flex-1 min-h-0">
        <Card className="md:col-span-4 flex flex-col min-h-0 overflow-hidden" bodyClassName="p-0 flex flex-col h-full">
          <div className="px-5 py-4 border-b border-slate-100 font-semibold text-slate-700 flex flex-col gap-3 shrink-0">
            <span>Pilih Menu</span>
            <Input
              placeholder="Cari menu..."
              icon={<FiSearch />}
              value={searchKeyword}
              onChange={(e) => setSearchKeyword(e.target.value)}
              className="h-10 text-sm"
              containerClassName="w-full"
            />
          </div>
          <div className="p-3 space-y-2 flex-1 overflow-y-auto min-h-0">
            {filteredProducts.map(p => {
              const ruleCount = (ingredientRules[p.id] || []).length;
              return (
                <button
                  key={p.id}
                  onClick={() => handleSelectProduct(p)}
                  className={`w-full text-left px-4 py-3 rounded-xl transition-all ${
                    selectedProductId === p.id 
                    ? 'bg-green-600/10 border-green-600/20 text-green-600 border' 
                    : 'hover:bg-slate-50 border border-transparent text-slate-600'
                  }`}
                >
                  <div className="flex justify-between items-center gap-2">
                    <span className="font-semibold text-sm truncate">{p.name}</span>
                    <span className={`text-xs px-2 py-0.5 rounded-full shrink-0 whitespace-nowrap ${ruleCount > 0 ? 'bg-green-600/20 text-green-600' : 'bg-slate-100 text-slate-400'}`}>
                      {ruleCount} bahan
                    </span>
                  </div>
                  <div className="text-xs mt-1 opacity-80">{p.category}</div>
                </button>
              )
            })}
          </div>
        </Card>
        
        <div className={`md:col-span-8 bg-white md:rounded-2xl border-0 md:border border-slate-100 shadow-sm flex flex-col min-h-0 ${selectedProductId ? 'fixed inset-0 z-[60] md:relative md:inset-auto md:z-auto' : 'hidden md:flex'}`}>
          {selectedProduct ? (
            <>
              <div className="px-6 py-4 border-b border-slate-100 flex flex-wrap sm:flex-nowrap justify-between items-center bg-slate-50/50 rounded-t-2xl shrink-0 gap-3">
                <div>
                  <span className="text-[10px] font-bold text-green-600 bg-green-50 px-2 py-0.5 rounded uppercase tracking-widest mb-1 inline-block border border-green-200/50">Mengedit Resep</span>
                  <h3 className="font-bold text-lg text-slate-800 leading-tight">{selectedProduct.name}</h3>
                  <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider mt-0.5">{selectedProduct.category}</p>
                </div>
                <div className="flex items-center gap-2 w-full sm:w-auto">
                  <Button 
                    variant="outline" 
                    onClick={() => setSelectedProductId(null)}
                    className="md:hidden flex-1 sm:flex-none"
                  >
                    Kembali
                  </Button>
                  <Button 
                    onClick={handleSave}
                    icon={<FiSave />}
                    className="flex-1 sm:flex-none px-6"
                  >
                    Simpan
                  </Button>
                </div>
              </div>
              
              <div className="p-6 bg-slate-50/30 rounded-b-2xl flex-1 overflow-y-auto min-h-0">
                <div className="space-y-4">
                  {currentRecipe.length === 0 ? (
                    <div className="text-center py-12 text-slate-400">
                      <FiBox className="mx-auto text-4xl mb-3 opacity-20" />
                      <p className="text-sm">Belum ada bahan baku yang diatur untuk menu ini.</p>
                    </div>
                  ) : (
                    currentRecipe.map((rule, idx) => (
                      <div key={idx} className="flex gap-3 items-start bg-white p-4 rounded-xl border border-slate-200 shadow-sm animate-fade-in-fast">
                        <div className="flex-1">
                          <label className="block text-xs font-semibold text-slate-500 mb-1.5 uppercase tracking-wide">Pilih Bahan Gudang</label>
                          <select
                            value={rule.inventory_id}
                            onChange={(e) => handleMaterialChange(idx, 'inventory_id', e.target.value)}
                            className="w-full h-10 px-3 rounded-lg border border-slate-200 bg-slate-50 text-sm focus:ring-2 focus:ring-green-600/20 focus:border-green-600 outline-none"
                          >
                            <option value="">-- Pilih Bahan --</option>
                            {inventory.map(inv => (
                              <option key={inv.id} value={inv.id}>{inv.name} (Stok: {inv.stock} {inv.unit})</option>
                            ))}
                          </select>
                        </div>
                        <div className="w-32">
                          <label className="block text-xs font-semibold text-slate-500 mb-1.5 uppercase tracking-wide">Takaran</label>
                          <div className="flex items-center gap-2">
                            <input
                              type="number"
                              min="0.01"
                              step="0.01"
                              value={rule.amount}
                              onChange={(e) => handleMaterialChange(idx, 'amount', e.target.value)}
                              className="w-full h-10 px-3 rounded-lg border border-slate-200 bg-slate-50 text-sm focus:ring-2 focus:ring-green-600/20 focus:border-green-600 outline-none"
                              placeholder="0"
                            />
                            <span className="text-xs font-semibold text-slate-400">
                              {rule.inventory_id ? inventory.find(i => i.id === rule.inventory_id)?.unit || '' : ''}
                            </span>
                          </div>
                        </div>
                        <div className="pt-6">
                          <Button 
                            variant="ghost"
                            onClick={() => setCurrentRecipe(currentRecipe.filter((_, i) => i !== idx))}
                            className="text-rose-400 hover:bg-rose-50 hover:text-rose-600 px-2"
                            title="Hapus Bahan"
                          >
                            <FiTrash2 className="text-lg" />
                          </Button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
                <div className="mt-6">
                  <button 
                    onClick={() => setCurrentRecipe([...currentRecipe, { inventory_id: '', amount: 1 }])}
                    className="w-full py-4 border-2 border-dashed border-slate-200 text-slate-500 hover:border-green-600/50 hover:text-green-600 hover:bg-green-600/5 rounded-xl font-semibold text-sm flex items-center justify-center gap-2 transition-all"
                  >
                    <FiPlus /> Tambah Bahan Baku
                  </button>
                </div>
              </div>
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-slate-400 bg-slate-50/50">
              <FiBox className="text-5xl mb-4 opacity-20" />
              <p className="font-semibold text-sm">Pilih menu di samping untuk mengatur resepnya.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
