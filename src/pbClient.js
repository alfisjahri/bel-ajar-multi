import PocketBase from 'pocketbase';

const pbUrl = import.meta.env.VITE_POCKETBASE_URL || 'https://pb.smpn1damai.web.id';

export const pb = new PocketBase(pbUrl);

// Matikan auto-cancellation: simpan presensi/nilai menembak 18 create
// bersamaan ke satu koleksi; default SDK membatalkan request sebelumnya
// ("The request was aborted (most likely autocancel...)") sehingga simpan
// gagal acak. App ini tidak butuh auto-cancel (tanpa search-as-you-type).
pb.autoCancellation(false);

// Helper: bangun filter equality yang aman (escape " dan \ di dalam nilai string).
export const eq = (field, value) => `${field} = "${String(value).replace(/\\/g, '\\\\').replace(/"/g, '\\"')}"`;
