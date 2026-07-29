import { supabase } from '../supabaseClient';
import { Toast } from './utils';

export const fetchProfileService = async (userId, setProfile) => {
  try {
    let { data } = await supabase.from('profiles').select('*').eq('id', userId).maybeSingle();
    if (data) {
      setProfile(data);
      if (data.full_name) localStorage.setItem('teacher_name', data.full_name);
      if (data.nip) localStorage.setItem('teacher_nip', data.nip);
      if (data.signature_url) localStorage.setItem('teacher_sig', data.signature_url);
    }
  } catch (err) {
    console.error('Gagal fetch profil:', err);
  }
};

export const handleSaveProfileService = async ({ session, profile, setLoading }) => {
  if (!session) return Toast.fire({ icon: 'error', title: 'Harus login dulu!' });
  setLoading(true);

  const updates = {
    id: session.user.id,
    full_name: profile.full_name,
    nip: profile.nip,
    signature_url: profile.signature_url,
    updated_at: new Date()
  };

  localStorage.setItem('teacher_name', profile.full_name);
  localStorage.setItem('teacher_nip', profile.nip);
  if (profile.signature_url) localStorage.setItem('teacher_sig', profile.signature_url);

  const { error } = await supabase.from('profiles').upsert(updates);
  setLoading(false);

  if (!error) {
    Toast.fire({ icon: 'success', title: 'Profil & NIP Tersimpan!' });
  } else {
    Toast.fire({ icon: 'error', title: 'Gagal simpan: ' + error.message });
  }
};

export const handleSignatureUploadService = (e, setProfile) => {
  const file = e.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onloadend = () => {
    const base64String = reader.result;
    setProfile(prev => ({ ...prev, signature_url: base64String }));
    localStorage.setItem('teacher_sig', base64String);
    Toast.fire({ icon: 'success', title: 'Gambar TTD berhasil dimuat!' });
  };
  reader.readAsDataURL(file);
};
