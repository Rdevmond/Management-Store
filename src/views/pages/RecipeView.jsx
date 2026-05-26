import { useState, useMemo } from 'react';
import { FiPlus, FiTrash2, FiSave, FiList, FiBox, FiSearch } from 'react-icons/fi';

export default function RecipeView({ controller }) {
  const { products, inventory, ingredientRules, handleSaveRecipe } = controller;
  
  const [selectedProductId, setSelectedProductId] = useState(null);
  const [currentRecipe, setCurrentRecipe] = useState([]); // Array of { inventory_id, amount }
  const [searchQuery, setSearchQuery] = useState('');

  const filteredProducts = useMemo(() => {
    if (!searchQuery) return products;
    const lower = searchQuery.toLowerCase();
    return products.filter(p => 
      p.name.toLowerCase().includes(lower) ||
      p.category.toLowerCase().includes(lower)
    );
  }, [products, searchQuery]);

  const selectedProduct = useMemo(() => 
    products.find(p => p.id === selectedProductId), 
  [products, selectedProductId]);

  // Load recipe when a product is clicked
  const handleSelectProduct = (product) => {
    setSelectedProductId(product.id);
    const existingRules = ingredientRules[product.id] || [];
    setCurrentRecipe(existingRules.map(r => ({ inventory_id: r.id, amount: r.amount })));
  };

  const handleAddMaterial = () => {
    setCurrentRecipe([...currentRecipe, { inventory_id: '', amount: 1 }]);
  };

  const handleRemoveMaterial = (index) => {
    setCurrentRecipe(currentRecipe.filter((_, i) => i !== index));
  };

  const handleMaterialChange = (index, field, value) => {
    const updated = [...currentRecipe];
    updated[index][field] = field === 'inventory_id' ? parseInt(value) : value;
    setCurrentRecipe(updated);
  };

  const handleSave = async () => {
    if (!selectedProductId) return;
    
    // Validate
    const validRules = currentRecipe.filter(r => r.inventory_id && parseFloat(r.amount) > 0);
    const hasDuplicates = new Set(validRules.map(r => r.inventory_id)).size !== validRules.length;
    
    if (hasDuplicates) {
      controller.triggerAlert('Terdapat bahan baku yang sama ganda. Harap gabungkan jumlahnya.', 'error');
      return;
    }

    await handleSaveRecipe(selectedProductId, validRules);
  };

  return (
    <div className="flex flex-col h-full animate-[fadeIn_0.3s_ease-out] text-slate-800">
      <div className="mb-6 flex justify-between items-end">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-slate-800 flex items-center gap-2">
            <FiList className="text-[#108e50]" />
            Manajemen Resep & BOM
          </h2>
          <p className="text-sm text-slate-500 mt-1">
            Atur komposisi bahan baku untuk tiap-tiap menu.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 flex-1 min-h-0">
        
        {/* Kiri: Daftar Menu */}
        <div className="md:col-span-4 bg-white rounded-2xl border border-slate-100 shadow-sm flex flex-col h-[calc(100vh-140px)]">
          <div className="px-5 py-4 border-b border-slate-100 font-semibold text-slate-700 flex flex-col gap-3">
            <span>Pilih Menu</span>
            <div className="relative">
              <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Cari menu..."
                className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-[#108e50]/20 focus:border-[#108e50]"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>
          <div className="flex-1 overflow-y-auto p-3 space-y-2">
            {filteredProducts.map(p => {
              const ruleCount = (ingredientRules[p.id] || []).length;
              return (
                <button
                  key={p.id}
                  onClick={() => handleSelectProduct(p)}
                  className={`w-full text-left px-4 py-3 rounded-xl transition-all ${
                    selectedProductId === p.id 
                    ? 'bg-[#108e50]/10 border-[#108e50]/20 text-[#108e50] border' 
                    : 'hover:bg-slate-50 border border-transparent text-slate-600'
                  }`}
                >
                  <div className="flex justify-between items-center">
                    <span className="font-semibold text-[13px]">{p.name}</span>
                    <span className={`text-[10px] px-2 py-0.5 rounded-full ${ruleCount > 0 ? 'bg-[#108e50]/20 text-[#108e50]' : 'bg-slate-100 text-slate-400'}`}>
                      {ruleCount} bahan
                    </span>
                  </div>
                  <div className="text-[11px] mt-1 opacity-80">{p.category}</div>
                </button>
              )
            })}
          </div>
        </div>

        {/* Kanan: Editor Resep */}
        <div className="md:col-span-8 bg-white rounded-2xl border border-slate-100 shadow-sm flex flex-col h-[calc(100vh-140px)]">
          {selectedProduct ? (
            <>
              <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50 rounded-t-2xl">
                <div>
                  <h3 className="font-bold text-lg text-slate-800">{selectedProduct.name}</h3>
                  <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">{selectedProduct.category}</p>
                </div>
                <button 
                  onClick={handleSave}
                  className="px-5 py-2 bg-[#108e50] hover:bg-[#0e7c45] text-white text-sm font-semibold rounded-xl transition-all shadow-sm flex items-center gap-2"
                >
                  <FiSave />
                  Simpan Resep
                </button>
              </div>

              <div className="flex-1 p-6 overflow-y-auto bg-slate-50/30">
                <div className="space-y-4">
                  {currentRecipe.length === 0 ? (
                    <div className="text-center py-12 text-slate-400">
                      <FiBox className="mx-auto text-4xl mb-3 opacity-20" />
                      <p className="text-sm">Belum ada bahan baku yang diatur untuk menu ini.</p>
                    </div>
                  ) : (
                    currentRecipe.map((rule, idx) => (
                      <div key={idx} className="flex gap-3 items-start bg-white p-4 rounded-xl border border-slate-200 shadow-sm animate-[fadeIn_0.2s_ease-out]">
                        <div className="flex-1">
                          <label className="block text-[11px] font-semibold text-slate-500 mb-1.5 uppercase tracking-wide">Pilih Bahan Gudang</label>
                          <select
                            value={rule.inventory_id}
                            onChange={(e) => handleMaterialChange(idx, 'inventory_id', e.target.value)}
                            className="w-full h-10 px-3 rounded-lg border border-slate-200 bg-slate-50 text-sm focus:ring-2 focus:ring-[#108e50]/20 focus:border-[#108e50] outline-none"
                          >
                            <option value="">-- Pilih Bahan --</option>
                            {inventory.map(inv => (
                              <option key={inv.id} value={inv.id}>{inv.name} (Stok: {inv.stock} {inv.unit})</option>
                            ))}
                          </select>
                        </div>
                        <div className="w-32">
                          <label className="block text-[11px] font-semibold text-slate-500 mb-1.5 uppercase tracking-wide">Takaran</label>
                          <div className="flex items-center gap-2">
                            <input
                              type="number"
                              min="0.01"
                              step="0.01"
                              value={rule.amount}
                              onChange={(e) => handleMaterialChange(idx, 'amount', e.target.value)}
                              className="w-full h-10 px-3 rounded-lg border border-slate-200 bg-slate-50 text-sm focus:ring-2 focus:ring-[#108e50]/20 focus:border-[#108e50] outline-none"
                              placeholder="0"
                            />
                            <span className="text-xs font-semibold text-slate-400">
                              {rule.inventory_id ? inventory.find(i => i.id === rule.inventory_id)?.unit || '' : ''}
                            </span>
                          </div>
                        </div>
                        <div className="pt-6">
                          <button 
                            onClick={() => handleRemoveMaterial(idx)}
                            className="w-10 h-10 flex items-center justify-center text-rose-400 hover:bg-rose-50 hover:text-rose-600 rounded-lg transition-colors border border-transparent hover:border-rose-100"
                            title="Hapus Bahan"
                          >
                            <FiTrash2 />
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>

                <div className="mt-6">
                  <button 
                    onClick={handleAddMaterial}
                    className="w-full py-4 border-2 border-dashed border-slate-200 text-slate-500 hover:border-[#108e50]/50 hover:text-[#108e50] hover:bg-[#108e50]/5 rounded-xl font-semibold text-sm flex items-center justify-center gap-2 transition-all"
                  >
                    <FiPlus />
                    Tambah Bahan Baku
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
