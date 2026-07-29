// HELPER SweetAlert2 Bawaan CDN
export const Swal = window.Swal || {
  fire: (opts) => alert(opts.title || opts.text),
  mixin: () => ({ fire: (opts) => alert(opts.title || opts.text) })
};

export const Toast = Swal.mixin({
  toast: true,
  position: 'top',
  showConfirmButton: false,
  timer: 2000,
  timerProgressBar: true
});

// HELPER ZONA WAKTU LOKAL GMT+8 (WITA)
export const getWitaDateString = (dateObj = new Date()) => {
  const witaTime = new Date(dateObj.toLocaleString('en-US', { timeZone: 'Asia/Makassar' }));
  const year = witaTime.getFullYear();
  const month = String(witaTime.getMonth() + 1).padStart(2, '0');
  const day = String(witaTime.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

// COMPRESS & CONVERT FOTO KE BASE64
export const compressImageToBase64 = (file) => {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target.result;
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const MAX_WIDTH = 600; 
        const scaleSize = MAX_WIDTH / img.width;
        
        if (img.width > MAX_WIDTH) {
          canvas.width = MAX_WIDTH;
          canvas.height = img.height * scaleSize;
        } else {
          canvas.width = img.width;
          canvas.height = img.height;
        }

        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        const compressedBase64 = canvas.toDataURL('image/jpeg', 0.6);
        resolve(compressedBase64);
      };
    };
  });
};
