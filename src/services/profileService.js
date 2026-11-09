import { pb } from '../pbClient';
import { Toast, base64ToFile, compressImageToBase64, isStoragePath, newUuid } from './utils';

// Catatan: field file PocketBase bernama `signature` (menyimpan nama file).
// Frontend memakai kunci `signature_url`; pemetaan dilakukan di sini agar
// tampilan tidak berubah. File TTD baru disimpan di state sebagai _sigFile
// dan baru dikirim saat tombol Simpan ditekan (batal = TTD lama tetap).

export const fetchProfileService = async (user, setProfile) => {
  try {
    let data = null;
    try {
      data = await pb.collection('profiles').getOne(user.id);
    } catch (err) {
      if (err?.status !== 404) throw err;
      data = null;
    }
    if (data) {
      const profile = { ...data, signature_url: data.signature || '' };
      setProfile(profile);
      if (data.full_name) localStorage.setItem('teacher_name', data.full_name);
      if (data.nip) localStorage.setItem('teacher_nip', data.nip);
      if (data.signature) localStorage.setItem('teacher_sig', data.signature);
      if (data.guru_wali_group) localStorage.setItem('guru_wali_group', data.guru_wali_group);
    } else {
      // Auto-detect nama dari email (sebelum tanda @)
      const emailName = user.email ? user.email.split('@')[0].toUpperCase() : 'GURU BARU';
      const autoProfile = { full_name: emailName, nip: '', signature_url: '', guru_wali_group: '' };
      setProfile(autoProfile);
      localStorage.setItem('teacher_name', emailName);
      localStorage.removeItem('teacher_nip');
      localStorage.removeItem('teacher_sig');
      localStorage.removeItem('guru_wali_group');
    }
  } catch (err) {
    console.error('Gagal fetch profil:', err);
  }
};

export const handleSaveProfileService = async ({ session, profile, setLoading }) => {
  if (!session) return Toast.fire({ icon: 'error', title: 'Harus login dulu!' });
  setLoading(true);

  const userId = session.user.id;

  // Payload hanya field PocketBase (tanpa _sigFile / new_password / signature_url).
  const updates = {
    email: session.user.email,
    full_name: profile.full_name,
    nip: profile.nip,
    guru_wali_group: profile.guru_wali_group || null,
  };
  if (profile._sigFile) {
    updates.signature = profile._sigFile;
  }

  let saved = null;
  let error = null;
  try {
    saved = await pb.collection('profiles').update(userId, updates);
  } catch (err) {
    if (err?.status === 404) {
      try {
        saved = await pb.collection('profiles').create({ id: userId, ...updates });
      } catch (e2) {
        error = e2;
      }
    } else {
      error = err;
    }
  }

  let authError = null;
  if (profile.new_password && profile.new_password.trim() !== '') {
    // PocketBase wajib meminta password lama saat ganti password sendiri.
    try {
      await pb.collection('users').update(userId, {
        oldPassword: profile.old_password || '',
        password: profile.new_password,
        passwordConfirm: profile.new_password,
      });
    } catch (passError) {
      authError = passError;
    }
  }

  setLoading(false);

  if (!error && !authError) {
    const sigName = saved?.signature || profile.signature_url || '';
    // Bersihkan blob preview: simpan nama file asli.
    if (sigName && !sigName.startsWith('blob:')) {
      localStorage.setItem('teacher_sig', sigName);
    } else if (!sigName) {
      localStorage.removeItem('teacher_sig');
    }
    localStorage.setItem('teacher_name', profile.full_name);
    localStorage.setItem('teacher_nip', profile.nip);
    if (profile.guru_wali_group) localStorage.setItem('guru_wali_group', profile.guru_wali_group);
    else localStorage.removeItem('guru_wali_group');
    Toast.fire({ icon: 'success', title: 'Profil, NIP & Pengaturan Tersimpan!' });
    // Reset field password sementara
    profile.new_password = '';
    profile.old_password = '';
    profile._sigFile = null;
  } else {
    let errMsg = '';
    if (error) errMsg += (error?.data?.message || error?.message || 'Gagal simpan profil') + ' ';
    if (authError) {
      const m = authError?.data?.message || authError?.message || '';
      if (m.includes('oldPassword') || authError?.data?.data?.oldPassword) {
        errMsg += 'Password lama salah — isi password lama yang benar untuk ganti password.';
      } else if (m.includes('Auth session missing') || m.includes('Missing or invalid')) {
        errMsg += 'Demi keamanan, silakan Logout dan Login kembali untuk mengubah password.';
      } else {
        errMsg += 'Password gagal diubah: ' + m;
      }
    }
    Swal.fire({ icon: 'error', title: 'Gagal simpan', text: errMsg });
  }
};

export const handleSignatureUploadService = (e, setProfile, currentSignatureUrl) => {
  const file = e.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onloadend = async () => {
    const base64String = reader.result;

    Toast.fire({ icon: 'info', title: 'Mengupload TTD...' });
    try {
      const user = pb.authStore.model;
      if (!user) throw new Error('Sesi login tidak ditemukan');
      // Kompres ke JPEG lalu jadikan File; disimpan di state, dikirim saat Simpan.
      const compressed = await compressImageToBase64(file);
      const sigFile = await base64ToFile(compressed, `${user.id}-signature-${newUuid()}.jpg`);
      const previewUrl = URL.createObjectURL(sigFile);
      setProfile(prev => ({ ...prev, signature_url: previewUrl, _sigFile: sigFile }));
      // localStorage TIDAK diisi blob URL (sementara); nama file asli disimpan saat Simpan.
      Toast.fire({ icon: 'success', title: 'Gambar TTD berhasil dimuat dan diupload!' });
    } catch (err) {
      Toast.fire({ icon: 'error', title: 'Gagal mengupload TTD.' });
    }
  };
  reader.readAsDataURL(file);
};
