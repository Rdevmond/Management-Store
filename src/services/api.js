/**
 * api.js — Centralized API client untuk komunikasi dengan backend Express/MySQL.
 * Semua request dikirim ke /api/... dan di-proxy oleh Vite ke localhost:5000.
 */

const BASE = '/api';

async function request(path, options = {}) {
  const res = await fetch(`${BASE}${path}`, {
    headers: { 'Content-Type': 'application/json', ...options.headers },
    ...options,
    body: options.body ? JSON.stringify(options.body) : undefined,
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Terjadi kesalahan server.');
  return data;
}

// ─── AUTH ─────────────────────────────────────────────────
export const apiLogin = (username, password) =>
  request('/users/login', { method: 'POST', body: { username, password } });

// ─── USERS ────────────────────────────────────────────────
export const apiGetUsers = () => request('/users');
export const apiAddUser = (user) => request('/users', { method: 'POST', body: user });
export const apiUpdateUser = (id, user) => request(`/users/${id}`, { method: 'PUT', body: user });
export const apiDeleteUser = (id) => request(`/users/${id}`, { method: 'DELETE' });

// ─── PRODUCTS ─────────────────────────────────────────────
export const apiGetProducts = () => request('/products');
export const apiAddProduct = (p) => request('/products', { method: 'POST', body: p });
export const apiUpdateProduct = (id, p) => request(`/products/${id}`, { method: 'PUT', body: p });
export const apiDeleteProduct = (id) => request(`/products/${id}`, { method: 'DELETE' });

// ─── INVENTORY ────────────────────────────────────────────
export const apiGetInventory = () => request('/inventory');
export const apiAddInventory = (item) => request('/inventory', { method: 'POST', body: item });
export const apiUpdateInventory = (id, item) => request(`/inventory/${id}`, { method: 'PUT', body: item });
export const apiDeleteInventory = (id) => request(`/inventory/${id}`, { method: 'DELETE' });
export const apiBulkUpdateInventory = (updates) =>
  request('/inventory/bulk-update', { method: 'POST', body: { updates } });

// ─── INGREDIENT RULES ─────────────────────────────────────
export const apiGetIngredientRules = () => request('/ingredient-rules');
export const apiUpdateRecipe = (productId, rules) =>
  request(`/ingredient-rules/${productId}`, { method: 'POST', body: { rules } });

// ─── FINANCE ──────────────────────────────────────────────
export const apiGetFinance = (start, end) => {
  const params = start && end ? `?start=${start}&end=${end}` : '';
  return request(`/finance${params}`);
};
export const apiAddFinance = (log) => request('/finance', { method: 'POST', body: log });

// ─── CHECKOUT (Transaksi Atomik) ──────────────────────────
export const apiCheckout = (payload) =>
  request('/checkout', { method: 'POST', body: payload });

// ─── REFUND (Transaksi Atomik) ────────────────────────────
export const apiRefund = (payload) =>
  request('/refund', { method: 'POST', body: payload });
