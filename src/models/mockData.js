export const DEFAULT_USERS = [
  { id: 1, username: 'pemilik', email: 'admin@essalju.com', password: 'admin123', role: 'pemilik', createdAt: '2026-05-19T10:00:00.000Z' },
  { id: 2, username: 'kasir', email: 'kasir@essalju.com', password: 'kasir123', role: 'kasir', createdAt: '2026-05-20T11:00:00.000Z' }
];
export const DEFAULT_PRODUCTS = [
  { id: 1, name: 'Es Salju Buah Sunkist', category: 'Es Salju Buah', price: 15000, image: '/images/bingso_sunkist.png' },
  { id: 2, name: 'Es Salju Buah Sirsak', category: 'Es Salju Buah', price: 15000, image: '/images/bingso_sirsak.png' },
  { id: 3, name: 'Es Salju Buah Mangga', category: 'Es Salju Buah', price: 15000, image: '/images/bingso_mangga.png' },
  { id: 4, name: 'Es Salju Buah Nenas', category: 'Es Salju Buah', price: 15000, image: '/images/bingso_nenas.png' },
  { id: 5, name: 'Es Salju Buah Delima', category: 'Es Salju Buah', price: 15000, image: '/images/bingso_delima.png' },
  { id: 6, name: 'Es Salju Buah Anggur', category: 'Es Salju Buah', price: 15000, image: '/images/bingso_anggur.png' },
  { id: 7, name: 'Bingsoo Vanila', category: 'Es Salju Susu / Bingsoo', price: 15000, image: '/images/bingso_vanila.png' },
  { id: 8, name: 'Bingsoo Coklat', category: 'Es Salju Susu / Bingsoo', price: 15000, image: '/images/bingso_coklat.png' },
  { id: 9, name: 'Bingsoo Stroberi', category: 'Es Salju Susu / Bingsoo', price: 15000, image: '/images/bingso_stroberi.png' },
  { id: 10, name: 'Es Salju Kietna', category: 'Kietna', price: 15000, image: '/images/bingso_kietna.png' },
  { id: 11, name: 'Minuman Kietna Nanas', category: 'Kietna', price: 15000, image: '/images/minuman_kietna_nanas.png' },
  { id: 12, name: 'Minuman Kietna Somboi', category: 'Minuman', price: 10000, image: '/images/minuman_somboi.png' }
];
export const DEFAULT_INVENTORY = [
  { id: 1, name: 'Mangkok Bingsoo', stock: 100, unit: 'Pcs', minStock: 20, price: 1500, purchaseLink: 'https://shopee.co.id/search?keyword=mangkok+bingsoo', personalReview: 'Mangkok tebal premium, menjaga es tidak cepat meleleh. Pelanggan suka ukurannya.' },
  { id: 2, name: 'Sendok Plastik', stock: 150, unit: 'Pcs', minStock: 30, price: 500, purchaseLink: 'https://shopee.co.id/search?keyword=sendok+plastik+bebek', personalReview: 'Bahan kaku, tidak gampang patah untuk menyendok es serut padat.' },
  { id: 3, name: 'Susu Kental Manis', stock: 50, unit: 'Kaleng', minStock: 10, price: 12000, purchaseLink: 'https://tokopedia.com/search?q=susu+kental+manis+carnation', personalReview: 'Susu kental manis Carnation paling gurih untuk bingsoo.' },
  { id: 4, name: 'Susu Segar/UHT', stock: 40, unit: 'Liter', minStock: 8, price: 18000, purchaseLink: 'https://tokopedia.com/search?q=greenfields+uht+full+cream+1l', personalReview: 'Susu Greenfield UHT menghasilkan salju es krim yang lembut.' },
  { id: 5, name: 'Bubuk Perasa (Coklat, Vanila, Stroberi)', stock: 10, unit: 'Kg', minStock: 2, price: 60000, purchaseLink: '', personalReview: 'Gunakan merk premium agar rasa buahnya terasa alami, tidak serik di tenggorokan.' },
  { id: 6, name: 'Buah Segar & Sirup (Sunkist, Sirsak, Mangga, Nanas, Delima, Anggur)', stock: 25, unit: 'Kg/Botol', minStock: 5, price: 45000, purchaseLink: '', personalReview: 'Beli langsung dari Pasar Buah Nangka untuk harga grosir dan kualitas segar harian.' },
  { id: 7, name: 'Jeruk Kietna & Somboi Kering', stock: 15, unit: 'Kg', minStock: 3, price: 50000, purchaseLink: '', personalReview: 'Suplier Medan. Jeruk kietna harum dan matang pohon, somboi kering asin sedang.' },
  { id: 8, name: 'Es Batu / Ice Block', stock: 30, unit: 'Pack', minStock: 5, price: 10000, purchaseLink: '', personalReview: 'Es kristal higienis dari depo es lokal terdekat.' },
  { id: 9, name: 'Kantong Plastik / Takeaway Bag', stock: 200, unit: 'Pcs', minStock: 40, price: 400, purchaseLink: 'https://shopee.co.id/search?keyword=plastik+tali+gelas+takeaway', personalReview: 'Plastik berlogo khusus, muat 1-2 cup dengan sekat kokoh.' }
];
export const DEFAULT_FINANCE = [
  { id: 1, type: 'pengeluaran', amount: 150000, description: 'Restock awal bahan baku (SKM & Susu Segar)', date: '2026-05-19' },
  { id: 2, type: 'pemasukan', amount: 45000, description: 'Penjualan POS #TRX-001 (3 x Es Salju Mangga)', date: '2026-05-20' },
  { id: 3, type: 'pemasukan', amount: 25000, description: 'Penjualan POS #TRX-002 (1 x Bingsoo Vanila + 1 x Minuman Kietna Somboi)', date: '2026-05-20' },
  { id: 4, type: 'pengeluaran', amount: 75000, description: 'Bayar Listrik Toko Harian', date: '2026-05-21' },
  { id: 5, type: 'pemasukan', amount: 60000, description: 'Penjualan POS #TRX-003 (4 x Es Salju Kietna)', date: '2026-05-21' }
];
export const INGREDIENT_RULES = {
  'Es Salju Buah': [
    { id: 1, amount: 1 },
    { id: 2, amount: 1 },
    { id: 3, amount: 0.05 },
    { id: 6, amount: 0.08 },
    { id: 8, amount: 0.1 }
  ],
  'Es Salju Susu / Bingsoo': [
    { id: 1, amount: 1 },
    { id: 2, amount: 1 },
    { id: 3, amount: 0.05 },
    { id: 4, amount: 0.15 },
    { id: 5, amount: 0.04 },
    { id: 8, amount: 0.1 }
  ],
  'Kietna': [
    { id: 2, amount: 1 },
    { id: 7, amount: 0.05 },
    { id: 8, amount: 0.1 },
    { id: 9, amount: 1 }
  ],
  'Minuman': [
    { id: 2, amount: 1 },
    { id: 7, amount: 0.03 },
    { id: 8, amount: 0.1 },
    { id: 9, amount: 1 }
  ]
};
