import imageCompression from 'browser-image-compression';

// Catatan: fungsi ini tidak dipakai di mana pun (dead code, dipertahankan
// agar tidak merusak impor). Jalur upload aktif kini lewat field file
// PocketBase pada record jurnal (lihat services/journalService.js).
export async function compressAndUpload(files, _pbClient) {
  const uploadedUrls = [];

  const options = {
    maxSizeMB: 0.3, // Maksimal 300KB per foto
    maxWidthOrHeight: 1280,
    useWebWorker: true
  };

  for (const file of files) {
    try {
      const compressedFile = await imageCompression(file, options);
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.jpg`;
      // Tidak ada upload mandiri di PocketBase; file dikirim bersama record.
      // Kembalikan nama file sebagai penanda (bukan URL).
      uploadedUrls.push(fileName);
      void compressedFile;
    } catch (err) {
      console.error('Gagal kompres foto:', err);
    }
  }

  return uploadedUrls;
}
