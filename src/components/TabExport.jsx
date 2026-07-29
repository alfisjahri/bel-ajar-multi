import React from 'react';
import { Eye, Settings, ChevronUp, ChevronDown } from 'lucide-react';

const TabExport = ({
  reportType, setReportType, reportPeriod, setReportPeriod, reportClass, setReportClass,
  reportSubject, setReportSubject, startDate, setStartDateFilter, endDate, setEndDateFilter,
  loading, handleTriggerExportPreview, isProfileOpen, setIsProfileOpen,
  profile, setProfile, handleSaveProfile, handleSignatureUpload,
  isDarkMode, setIsDarkMode
}) => {
  return (
    <div className="space-y-4">
      <div className="bg-white dark:bg-slate-800 p-5 rounded-xl border border-slate-100 dark:border-slate-700 shadow-sm space-y-3">
        <h3 className="font-semibold text-slate-800 dark:text-slate-100 text-[10.5pt] border-b pb-2">Opsi Filter Rekap Laporan PDF</h3>
        
        <div>
          <label className="text-[10.5pt] font-bold text-slate-500 dark:text-slate-400 dark:text-slate-500 block mb-1">Jenis Laporan</label>
          <select 
            className="w-full p-3 bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-700 rounded-xl text-[10.5pt] font-medium text-slate-800 dark:text-slate-100"
            value={reportType} onChange={e => setReportType(e.target.value)}
          >
            <option value="mapel">📖 Mapel</option>
            <option value="wali_kelas">🏫 Wali Kelas</option>
            <option value="guru_wali">👥 Guru Wali</option>
          </select>
        </div>

        <div className={`grid ${reportType === 'mapel' ? 'grid-cols-2' : 'grid-cols-1'} gap-2`}>
          <div>
            <label className="text-[10.5pt] font-bold text-slate-500 dark:text-slate-400 block mb-1">Periode Laporan</label>
            <select 
              className="w-full p-2 bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-700 rounded-xl text-[10.5pt] font-semibold text-slate-700 dark:text-slate-200"
              value={reportPeriod} onChange={e => setReportPeriod(e.target.value)}
            >
              <option value="harian">Harian (Hari Ini)</option>
              <option value="mingguan">Mingguan (7 Hari)</option>
              <option value="bulanan">Bulanan (Bulan Ini)</option>
              <option value="semester">Semester Ini</option>
              <option value="custom">Tentukan Tanggal</option>
            </select>
          </div>

          {reportType === 'mapel' && (
            <div>
              <label className="text-[10.5pt] font-bold text-slate-500 dark:text-slate-400 block mb-1">Kelas Laporan</label>
              <select 
                className="w-full p-2 bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-700 rounded-xl text-[10.5pt] font-semibold text-slate-700 dark:text-slate-200"
                value={reportClass} onChange={e => setReportClass(e.target.value)}
              >
                <option value="7">Kelas 7</option>
                <option value="8A">Kelas 8A</option>
                <option value="8B">Kelas 8B</option>
                <option value="9A">Kelas 9A</option>
                <option value="9B">Kelas 9B</option>
              </select>
            </div>
          )}
        </div>

        {reportType === 'mapel' && (
          <div>
            <label className="text-[10.5pt] font-bold text-slate-500 dark:text-slate-400 dark:text-slate-500 block mb-1">Mapel Laporan</label>
            <select 
              className="w-full p-2 bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-700 rounded-xl text-[10.5pt] font-semibold text-slate-700 dark:text-slate-200"
              value={reportSubject} onChange={e => setReportSubject(e.target.value)}
            >
              {(reportClass === '7' || reportClass === '8A' || reportClass === '8B') && (
                <option value="Matematika">Matematika</option>
              )}
              {(reportClass === '8A' || reportClass === '8B' || reportClass === '9A' || reportClass === '9B') && (
                <option value="Koding">Koding</option>
              )}
            </select>
          </div>
        )}

        {reportPeriod === 'custom' && (
          <div className="grid grid-cols-2 gap-2 pt-1">
            <div>
              <label className="text-[10.5pt] font-bold text-slate-400 dark:text-slate-500 block mb-1">Dari Tanggal</label>
              <input type="date" className="w-full p-2 bg-slate-50 dark:bg-slate-900 border text-[10.5pt] rounded-xl" value={startDate} onChange={e => setStartDateFilter(e.target.value)} />
            </div>
            <div>
              <label className="text-[10.5pt] font-bold text-slate-400 dark:text-slate-500 block mb-1">Sampai Tanggal</label>
              <input type="date" className="w-full p-2 bg-slate-50 dark:bg-slate-900 border text-[10.5pt] rounded-xl" value={endDate} onChange={e => setEndDateFilter(e.target.value)} />
            </div>
          </div>
        )}

        <button 
          onClick={handleTriggerExportPreview} disabled={loading}
          className="w-full bg-emerald-600 hover:bg-emerald-700 text-white py-3 rounded-xl font-bold text-[10.5pt] flex items-center justify-center space-x-2 transition-all shadow"
        >
          <Eye className="w-4 h-4" />
          <span>{loading ? 'Mengambil Data Real...' : 'Preview / Print'}</span>
        </button>
      </div>

      <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-100 dark:border-slate-700 shadow-sm overflow-hidden transition-all">
        <button 
          onClick={() => setIsProfileOpen(!isProfileOpen)}
          className="w-full p-3 flex justify-between items-center bg-slate-50 dark:bg-slate-900/80 hover:bg-slate-100 dark:bg-slate-900 transition-colors"
        >
          <div className="flex items-center space-x-2">
            <Settings className="w-4 h-4 text-blue-600" />
            <h3 className="font-semibold text-slate-800 dark:text-slate-100 text-[10.5pt]">Profil</h3>
          </div>
          {isProfileOpen ? <ChevronUp className="w-4 h-4 text-slate-500 dark:text-slate-400 dark:text-slate-500" /> : <ChevronDown className="w-4 h-4 text-slate-500 dark:text-slate-400 dark:text-slate-500" />}
        </button>

        {isProfileOpen && (
          <div className="p-3 border-t border-slate-100 dark:border-slate-800 space-y-3 bg-white dark:bg-slate-800">
            {/* TEMA APLIKASI */}
            <div className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-700 rounded-xl">
              <div>
                <h4 className="text-[10.5pt] font-bold text-slate-800 dark:text-slate-100">Tema Aplikasi</h4>
                <p className="text-[10.5pt] text-slate-500 dark:text-slate-400">Pilih mode gelap atau terang</p>
              </div>
              <button 
                onClick={() => setIsDarkMode(!isDarkMode)}
                className={`w-12 h-6 flex items-center rounded-full p-1 transition-colors ${isDarkMode ? 'bg-blue-600' : 'bg-slate-300'}`}
              >
                <div className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform ${isDarkMode ? 'translate-x-6' : 'translate-x-0'}`}></div>
              </button>
            </div>

            <div>
              <label className="text-[10.5pt] font-bold text-slate-500 dark:text-slate-400 dark:text-slate-500 block mb-1">Nama Lengkap Guru</label>
              <input 
                type="text" className="w-full p-3 bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-700 rounded-xl text-[10.5pt] font-medium"
                placeholder="Masukkan Nama Lengkap & Gelar..."
                value={profile.full_name || ''} 
                onChange={e => setProfile({...profile, full_name: e.target.value})}
              />
            </div>

            <div>
              <label className="text-[10.5pt] font-bold text-slate-500 dark:text-slate-400 dark:text-slate-500 block mb-1">NIP Guru</label>
              <input 
                type="text" className="w-full p-3 bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-700 rounded-xl text-[10.5pt] font-medium"
                placeholder="Masukkan NIP Kamu..."
                value={profile.nip || ''} 
                onChange={e => setProfile({...profile, nip: e.target.value})}
              />
            </div>

            <div>
              <label className="text-[10.5pt] font-bold text-slate-500 dark:text-slate-400 dark:text-slate-500 block mb-1">Upload File Gambar TTD (PNG/JPG)</label>
              <input 
                type="file" accept="image/*" 
                onChange={handleSignatureUpload} 
                className="w-full text-[10.5pt] text-slate-500 dark:text-slate-400 dark:text-slate-500 file:mr-3 file:py-1.5 file:px-3 file:rounded-xl file:border-0 file:text-[10.5pt] file:font-bold file:bg-blue-50 file:text-blue-600" 
              />
              {profile.signature_url && (
                <div className="mt-2 p-2 bg-slate-50 dark:bg-slate-900 rounded-xl border border-slate-100 dark:border-slate-700 text-center">
                  <p className="text-[10.5pt] font-bold text-slate-400 dark:text-slate-500 mb-1">Preview TTD Tersimpan:</p>
                  <img src={profile.signature_url} alt="TTD Guru" className="h-16 mx-auto object-contain" />
                </div>
              )}
            </div>

            <button 
              onClick={handleSaveProfile} disabled={loading}
              className="w-full bg-slate-800 hover:bg-slate-900 text-white py-3 rounded-xl font-bold text-[10.5pt] shadow transition-all"
            >
              {loading ? 'Menyimpan...' : 'Simpan Profil'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default TabExport;
