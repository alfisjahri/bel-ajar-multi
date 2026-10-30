import { supabase } from '../supabaseClient';

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

// UPLOAD IMAGE TO CLOUDINARY
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

// DELETE IMAGE FROM CLOUDINARY
export const deleteImageFromCloudinary = async (imageUrl) => {
  const cloudName = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
  const apiKey = import.meta.env.VITE_CLOUDINARY_API_KEY;
  const apiSecret = import.meta.env.VITE_CLOUDINARY_API_SECRET;

  if (!cloudName || !apiKey || !apiSecret) {
    console.warn('Konfigurasi API Key/Secret Cloudinary belum diatur di .env. Foto akan dibiarkan.');
    return;
  }

  try {
    // 1. Extract public_id from URL
    if (!imageUrl.includes('/upload/')) return;
    const afterUpload = imageUrl.split('/upload/')[1];
    const withoutVersion = afterUpload.replace(/^v\d+\//, '');
    const publicId = withoutVersion.substring(0, withoutVersion.lastIndexOf('.'));

    // 2. Generate Signature
    const timestamp = Math.floor(Date.now() / 1000);
    const signatureString = `public_id=${publicId}&timestamp=${timestamp}${apiSecret}`;
    
    const data = new TextEncoder().encode(signatureString);
    const hashBuffer = await crypto.subtle.digest('SHA-1', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const signature = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');

    // 3. Request Deletion
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
// SUPABASE STORAGE (VPS) — jalur upload baru. Cloudinary di atas dipertahankan
// selama masa transisi dual-format (nilai lama masih URL Cloudinary).
// Bucket privat 'journal-photos'; database menyimpan PATH, bukan URL.
// ============================================================================

export const STORAGE_BUCKET = 'journal-photos';

// URL Cloudinary lama: diawali http dan mengandung 'cloudinary' -> dipakai langsung.
export const isCloudinaryUrl = (value) =>
  typeof value === 'string' && value.startsWith('http') && value.includes('cloudinary');

// Path Storage baru: string tak kosong yang bukan URL.
export const isStoragePath = (value) =>
  typeof value === 'string' && value !== '' && !value.startsWith('http');

// UUID untuk nama file. crypto.randomUUID tersedia di secure context (HTTPS).
export const newUuid = () => {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) return crypto.randomUUID();
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}-${Math.random().toString(36).slice(2, 10)}`;
};

const base64ToBlob = async (fileOrBase64) => {
  if (typeof fileOrBase64 !== 'string') return fileOrBase64;
  const res = await fetch(fileOrBase64);
  return res.blob();
};

const guessContentType = (fileOrBase64) => {
  if (typeof fileOrBase64 === 'string') {
    const m = fileOrBase64.match(/^data:([^;,]+)/);
    if (m) return m[1];
  } else if (fileOrBase64 && fileOrBase64.type) {
    return fileOrBase64.type;
  }
  return 'image/jpeg';
};

// UPLOAD KE SUPABASE STORAGE — mengembalikan path (bukan URL).
// Memakai sesi login yang sudah ada (anon key + JWT user), tanpa secret di bundle.
export const uploadImageToStorage = async (fileOrBase64, path) => {
  const blob = await base64ToBlob(fileOrBase64);
  const { error } = await supabase.storage
    .from(STORAGE_BUCKET)
    .upload(path, blob, { contentType: guessContentType(fileOrBase64), upsert: false });

  if (error) {
    console.error('Error uploading to Storage:', error);
    throw error;
  }
  return path;
};

// HAPUS FILE DARI SUPABASE STORAGE — diam-diam (error hanya dicatat).
export const deleteImageFromStorage = async (path) => {
  if (!path) return;
  try {
    const { error } = await supabase.storage.from(STORAGE_BUCKET).remove([path]);
    if (error) {
      console.error('Gagal menghapus file di Storage:', error);
    }
  } catch (err) {
    console.error('Error deleting from Storage:', err);
  }
};

// HAPUS BERDASARKAN FORMAT NILAI (masa transisi):
// URL Cloudinary lama -> hapus via Cloudinary; path Storage -> hapus via Storage;
// URL http lain yang tak dikenal -> dibiarkan (bukan milik kita).
export const deleteImageByValue = async (value) => {
  if (!value) return;
  if (isCloudinaryUrl(value)) return deleteImageFromCloudinary(value);
  if (isStoragePath(value)) return deleteImageFromStorage(value);
};

// RESOLVE PATH STORAGE KE SIGNED URL 1 JAM (bucket privat, tidak ada getPublicUrl).
export const getSignedPhotoUrl = async (path) => {
  const { data, error } = await supabase.storage
    .from(STORAGE_BUCKET)
    .createSignedUrl(path, 3600);

  if (error || !data?.signedUrl) {
    console.error('Gagal membuat signed URL:', error);
    return '';
  }
  return data.signedUrl;
};

// RESOLVE NILAI TAMPILAN (dual-format):
// URL http (termasuk Cloudinary lama) -> dipakai langsung;
// path Storage -> signed URL; kosong -> string kosong.
export const resolveDisplayUrl = async (value) => {
  if (!value) return '';
  if (typeof value === 'string' && value.startsWith('http')) return value;
  return getSignedPhotoUrl(value);
};

