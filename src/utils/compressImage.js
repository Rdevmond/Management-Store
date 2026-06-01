const compressImage = (file) => {
  const MAX_DIM = 600;
  const QUALITY = 0.4;
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const img = new Image();
      img.onload = () => {
        let { width, height } = img;
        if (width > height) {
          if (width > MAX_DIM) {
            height = Math.round((height * MAX_DIM) / width);
            width = MAX_DIM;
          }
        } else {
          if (height > MAX_DIM) {
            width = Math.round((width * MAX_DIM) / height);
            height = MAX_DIM;
          }
        }
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, width, height);
        const compressed = canvas.toDataURL('image/jpeg', QUALITY);
        const sizeKB = Math.round((compressed.length * 3) / 4 / 1024);
        if (sizeKB > 300) {
          reject(new Error('Ukuran gambar setelah kompresi masih terlalu besar (>300KB). Pilih gambar yang lebih kecil.'));
        } else {
          resolve(compressed);
        }
      };
      img.onerror = reject;
      img.src = reader.result;
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
};

export default compressImage;
