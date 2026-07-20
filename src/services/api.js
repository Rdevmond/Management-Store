import axios from 'axios';

const BASE = '/api';

const api = axios.create({
  baseURL: BASE,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.response.use(
  (response) => response.data,
  (error) => {
    let errorMessage = 'Terjadi kesalahan server.';
    if (error.response) {
      if (error.response.data && error.response.data.error) {
        errorMessage = typeof error.response.data.error === 'string' 
          ? error.response.data.error 
          : error.response.data.error.message || JSON.stringify(error.response.data.error);
      } else if (typeof error.response.data === 'string') {
        const cleanError = error.response.data.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
        errorMessage = cleanError || `HTTP Error ${error.response.status}`;
      } else if (error.response.data && error.response.data.message) {
        errorMessage = error.response.data.message;
      }

    } else if (error.request) {
      errorMessage = 'Tidak ada respons dari server. Periksa koneksi Anda.';
    } else {
      errorMessage = error.message;
    }
    return Promise.reject(new Error(errorMessage));
  }
);

async function request(path, options = {}) {
  const config = {
    method: options.method || 'GET',
    url: path,
    data: options.body,
  };
  return api(config);
}
export const apiPost = (path, data) => request(path, { method: 'POST', body: data });
export const apiLogin = (username, password) => request('/users/login', { method: 'POST', body: { username, password } });
export const apiGetUsers = () => request('/users');
export const apiAddUser = (user) => request('/users', { method: 'POST', body: user });
export const apiUpdateUser = (id, user) => request(`/users/${id}`, { method: 'PUT', body: user });
export const apiDeleteUser = (id) => request(`/users/${id}`, { method: 'DELETE' });
export const apiGetProducts = () => request('/products');
export const apiAddProduct = (p) => request('/products', { method: 'POST', body: p });
export const apiUpdateProduct = (id, p) => request(`/products/${id}`, { method: 'PUT', body: p });
export const apiDeleteProduct = (id) => request(`/products/${id}`, { method: 'DELETE' });
export const apiGetInventory = () => request('/inventory');
export const apiAddInventory = (item) => request('/inventory', { method: 'POST', body: item });
export const apiUpdateInventory = (id, item) => request(`/inventory/${id}`, { method: 'PUT', body: item });
export const apiDeleteInventory = (id) => request(`/inventory/${id}`, { method: 'DELETE' });
export const apiBulkUpdateInventory = (updates) =>
  request('/inventory/bulk-update', { method: 'POST', body: { updates } });
export const apiGetIngredientRules = () => request('/ingredient-rules');
export const apiUpdateRecipe = (productId, rules) =>
  request(`/ingredient-rules/${productId}`, { method: 'POST', body: { rules } });
export const apiGetFinance = (start, end) => {
  const params = start && end ? `?start=${start}&end=${end}` : '';
  return request(`/finance${params}`);
};
export const apiAddFinance = (log) => request('/finance', { method: 'POST', body: log });
export const apiCheckout = (payload) =>
  request('/checkout', { method: 'POST', body: payload });
export const apiRefund = (payload) =>
  request('/refund', { method: 'POST', body: payload });
