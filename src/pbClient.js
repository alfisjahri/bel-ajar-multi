import PocketBase from 'pocketbase';

const pbUrl = import.meta.env.VITE_POCKETBASE_URL || 'https://pb.alfisjahri.my.id';

export const pb = new PocketBase(pbUrl);

// Helper: bangun filter equality yang aman (escape " dan \ di dalam nilai string).
export const eq = (field, value) => `${field} = "${String(value).replace(/\\/g, '\\\\').replace(/"/g, '\\"')}"`;
