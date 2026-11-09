import { pb } from '../pbClient';

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

// UPLOAD IMAGE TO CLOUDINARY (jalur lama, dipertahankan; tidak dipakai alur PocketBase)
export const uploadImageToCloudinary = async (fileOrBase64) => {
  const cloudName = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
  const uploadPreset = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET;

  if (!cloudName || !uploadPreset) {
    throw new Error('Konfigurasi Cloudinary belum diatur di .env');
  }

  const url = `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`;

  const formData = new FormData();
  formData.append('file', fileOrBase64);
  formData.append('upload_preset', uploadPreset);

  try {
    const response = await fetch(url, {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      throw new Error(`Gagal upload ke Cloudinary: ${response.statusText}`);
    }

    const data = await response.json();
    return data.secure_url;
  } catch (error) {
    console.error('Error uploading to Cloudinary:', error);
    throw error;
  }
};

// DELETE IMAGE FROM CLOUDINARY (jalur lama, dipertahankan)
export const deleteImageFromCloudinary = async (imageUrl) => {
  const cloudName = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
  const apiKey = import.meta.env.VITE_CLOUDINARY_API_KEY;
  const apiSecret = import.meta.env.VITE_CLOUDINARY_API_SECRET;

  if (!cloudName || !apiKey || !apiSecret) {
    console.warn('Konfigurasi API Key/Secret Cloudinary belum diatur di .env. Foto akan dibiarkan.');
    return;
  }

  try {
    if (!imageUrl.includes('/upload/')) return;
    const afterUpload = imageUrl.split('/upload/')[1];
    const withoutVersion = afterUpload.replace(/^v\d+\//, '');
    const publicId = withoutVersion.substring(0, withoutVersion.lastIndexOf('.'));

    const timestamp = Math.floor(Date.now() / 1000);
    const signatureString = `public_id=${publicId}&timestamp=${timestamp}${apiSecret}`;

    const data = new TextEncoder().encode(signatureString);
    const hashBuffer = await crypto.subtle.digest('SHA-1', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const signature = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');

    const url = `https://api.cloudinary.com/v1_1/${cloudName}/image/destroy`;
    const formData = new FormData();
    formData.append('public_id', publicId);
    formData.append('timestamp', timestamp);
    formData.append('api_key', apiKey);
    formData.append('signature', signature);

    const response = await fetch(url, { method: 'POST', body: formData });

    if (!response.ok) {
      console.error('Gagal menghapus foto di Cloudinary');
    }
  } catch (err) {
    console.error('Error deleting from Cloudinary:', err);
  }
};

// ============================================================================
// POCKETBASE FILES — foto jurnal & tanda tangan kini field file di record.
// Database menyimpan NAMA FILE (bukan path/URL); URL dibangun dari record.
// ============================================================================

// URL http lama (mis. Cloudinary) -> dipakai langsung.
export const isCloudinaryUrl = (value) =>
  typeof value === 'string' && value.startsWith('http') && value.includes('cloudinary');

// Nama file PocketBase: string tak kosong yang bukan URL dan bukan blob:/data:.
export const isStoragePath = (value) =>
  typeof value === 'string' && value !== '' && !value.startsWith('http')
  && !value.startsWith('blob:') && !value.startsWith('data:');

// UUID untuk nama file. crypto.randomUUID tersedia di secure context (HTTPS).
export const newUuid = () => {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) return crypto.randomUUID();
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}-${Math.random().toString(36).slice(2, 10)}`;
};

export const base64ToBlob = async (fileOrBase64) => {
  if (typeof fileOrBase64 !== 'string') return fileOrBase64;
  const res = await fetch(fileOrBase64);
  return res.blob();
};

// Ubah data URL base64 menjadi File siap kirim ke field file PocketBase.
export const base64ToFile = async (fileOrBase64, filename) => {
  const blob = await base64ToBlob(fileOrBase64);
  const type = blob.type || 'image/jpeg';
  const name = filename || `${newUuid()}.jpg`;
  return new File([blob], name, { type });
};

// URL file PocketBase (koleksi privat -> butuh token file).
// record = objek record PocketBase (punya id + collectionName/collectionId).
export const getFileUrl = async (record, filename) => {
  if (!record || !filename) return '';
  try {
    const token = await pb.files.getToken();
    return pb.files.getURL(record, filename, { token });
  } catch (err) {
    console.error('Gagal membuat URL file:', err);
    return '';
  }
};

// RESOLVE NILAI TAMPILAN:
// URL http/blob:/data: -> dipakai langsung;
// nama file PocketBase + record -> URL file bertoken; tanpa record -> ''.
export const resolveDisplayUrl = async (value, record) => {
  if (!value) return '';
  if (typeof value === 'string' && (value.startsWith('http') || value.startsWith('blob:') || value.startsWith('data:'))) return value;
  if (!record) return '';
  return getFileUrl(record, value);
};

// HAPUS FILE DARI RECORD POCKETBASE — hapus nama file dari field file record.
// (PocketBase menghapus file fisik saat nama file dihapus dari field.)
export const deleteFileFromRecord = async (collection, recordId, field, filename) => {
  if (!collection || !recordId || !field || !filename) return;
  try {
    const rec = await pb.collection(collection).getOne(recordId);
    const current = rec[field];
    if (!current) return;
    const next = Array.isArray(current) ? current.filter((f) => f !== filename) : '';
    await pb.collection(collection).update(recordId, { [field]: next });
  } catch (err) {
    console.error('Gagal menghapus file dari record:', err);
  }
};

// Kompatibilitas nama lama (dipakai service lama; kini no-op aman):
// upload/delete storage Supabase sudah tidak ada — file dikirim bersama record.
export const uploadImageToStorage = async () => {
  throw new Error('uploadImageToStorage tidak dipakai lagi (PocketBase: file dikirim bersama record).');
};
export const deleteImageFromStorage = async () => { /* no-op: file ikut terhapus bersama record/field */ };
export const deleteImageByValue = async (value) => {
  if (!value) return;
  if (isCloudinaryUrl(value)) return deleteImageFromCloudinary(value);
  // Nama file PocketBase: penghapusan ditangani saat record/field dihapus.
};
export const getSignedPhotoUrl = async () => '';
export const STORAGE_BUCKET = 'journal-photos';
