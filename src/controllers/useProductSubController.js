import { useState, useCallback } from 'react';
import {
  apiAddProduct, apiUpdateProduct, apiDeleteProduct,
  apiGetIngredientRules, apiUpdateRecipe
} from '../services/api';

export default function useProductSubController(triggerAlert) {
  const [products, setProducts] = useState([]);
  const [ingredientRules, setIngredientRules] = useState({});

  const refreshIngredientRules = useCallback(async () => {
    try {
      const rules = await apiGetIngredientRules();
      setIngredientRules(rules);
    } catch (err) {
      console.error(err);
    }
  }, []);

  const handleSaveProduct = async (form) => {
    if (!form.name || !form.price) {
      triggerAlert('Harap lengkapi formulir produk.', 'error');
      return false;
    }
    const payload = { name: form.name, category: form.category, price: parseFloat(form.price), image: form.image };
    try {
      if (form.id) {
        await apiUpdateProduct(form.id, payload);
        setProducts(prev => prev.map(p => p.id === form.id ? { ...p, ...payload } : p));
        triggerAlert('Produk menu berhasil diubah.', 'success');
      } else {
        const created = await apiAddProduct(payload);
        setProducts(prev => [...prev, created]);
        triggerAlert('Produk menu baru berhasil ditambahkan.', 'success');
      }
      return true;
    } catch (err) {
      triggerAlert(err.message, 'error');
      return false;
    }
  };

  const handleDeleteProduct = async (id) => {
    if (!window.confirm('Apakah Anda yakin ingin menghapus produk ini dari menu?')) return false;
    try {
      await apiDeleteProduct(id);
      setProducts(prev => prev.filter(p => p.id !== id));
      triggerAlert('Produk berhasil dihapus dari menu.', 'info');
      return true;
    } catch (err) {
      triggerAlert(err.message, 'error');
      return false;
    }
  };

  const handleSaveRecipe = async (productId, rules) => {
    try {
      await apiUpdateRecipe(productId, rules);
      await refreshIngredientRules();
      triggerAlert('Resep berhasil disimpan.', 'success');
      return true;
    } catch (err) {
      triggerAlert(err.message, 'error');
      return false;
    }
  };

  return {
    products, setProducts, ingredientRules, setIngredientRules,
    refreshIngredientRules, handleSaveProduct, handleDeleteProduct, handleSaveRecipe
  };
}
