/**
 * appStore.js — Hanya menyimpan sesi pengguna yang sedang login.
 * Semua data (produk, inventaris, keuangan) kini diambil dari MySQL via API.
 */
export const appStore = {
  getActiveUser: () => {
    const saved = sessionStorage.getItem('activeUser');
    return saved ? JSON.parse(saved) : null;
  },
  setActiveUser: (user) => {
    if (user) {
      sessionStorage.setItem('activeUser', JSON.stringify(user));
    } else {
      sessionStorage.removeItem('activeUser');
    }
  },
};
