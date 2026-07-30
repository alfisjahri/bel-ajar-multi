import React from 'react';
import { X, Printer } from 'lucide-react';

export const AbsenceDetailsModal = ({ studentAbsenceDetails, setStudentAbsenceDetails, setSelectedImageModal }) => {
  if (!studentAbsenceDetails) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/80 backdrop-blur-sm flex items-center justify-center p-3 overflow-y-auto">
      <div className="bg-white dark:bg-slate-800 rounded-xl p-5 w-full max-w-sm space-y-3 shadow-2xl">
        <div className="flex justify-between items-center border-b pb-2">
          <div>
            <h3 className="font-semibold text-[10.5pt] text-slate-800 dark:text-slate-100">{studentAbsenceDetails.student.name}</h3>
            <p className="text-[10.5pt] text-amber-600 font-bold">Riwayat Absen</p>
          </div>
          <button onClick={() => setStudentAbsenceDetails(null)} className="text-slate-400 dark:text-slate-500 p-1"><X className="w-5 h-5" /></button>
        </div>

        <div className="space-y-3 max-h-80 overflow-y-auto pr-1">
          {studentAbsenceDetails.details.map((d, idx) => (
            <div key={idx} className="p-3 bg-amber-50/60 border border-amber-200 rounded-xl space-y-1.5">
              <div className="flex justify-between items-center">
                <span className="text-[10.5pt] font-bold bg-amber-100 text-amber-800 px-2 py-0.5 rounded-md">{d.status}</span>
                <span className="text-[10.5pt] text-slate-500 dark:text-slate-400 dark:text-slate-500 font-semibold">{new Date(d.date).toLocaleDateString('id-ID')}</span>
              </div>
              <p className="text-[10.5pt] font-bold text-slate-800 dark:text-slate-100">{d.subject}</p>
              <p className="text-[10.5pt] text-slate-700 dark:text-slate-200 font-medium">{d.material}</p>
              
              {d.photos && d.photos.length > 0 && (
                <div className="flex gap-1.5 pt-1 overflow-x-auto">
                  {d.photos.map((p, i) => (
                    <img key={i} src={p} onClick={() => setSelectedImageModal(p)} alt="Foto Materi" className="w-12 h-12 object-cover rounded-lg border cursor-pointer hover:opacity-80 active:scale-95" />
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>

        <button onClick={() => setStudentAbsenceDetails(null)} className="w-full bg-slate-800 text-white font-bold text-[10.5pt] py-2 rounded-xl">
          Tutup
        </button>
      </div>
    </div>
  );
};

export const ImageLightboxModal = ({ selectedImageModal, setSelectedImageModal }) => {
  if (!selectedImageModal) return null;

  return (
    <div className="fixed inset-0 z-[70] bg-black/90 backdrop-blur-md flex items-center justify-center p-3">
      <button 
        onClick={() => setSelectedImageModal(null)}
        className="absolute top-4 right-4 bg-white dark:bg-slate-800/20 text-white p-2 rounded-full hover:bg-white dark:bg-slate-800/40 active:scale-90 transition-all z-10"
      >
        <X className="w-6 h-6" />
      </button>
      <img 
        src={selectedImageModal} 
        alt="Preview Dokumentasi Full" 
        className="max-w-full max-h-[85vh] object-contain rounded-xl shadow-2xl border border-white/20" 
      />
    </div>
  );
};

export const PrintPreviewModal = ({ showPreviewModal, setShowPreviewModal, previewData }) => {
  if (!showPreviewModal || !previewData) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/80 backdrop-blur-sm flex flex-col justify-between p-2 overflow-y-auto">
      <div className="no-print bg-white dark:bg-slate-800 p-3 rounded-xl flex justify-between items-center shadow-lg mb-3 sticky top-0 z-10 max-w-xl mx-auto w-full">
        <button 
          onClick={() => setShowPreviewModal(false)}
          className="bg-slate-100 dark:bg-slate-900 text-slate-700 dark:text-slate-200 px-3 py-1.5 rounded-xl text-[10.5pt] font-bold flex items-center space-x-1"
        >
          <X className="w-4 h-4" />
          <span>Tutup</span>
        </button>

        <button 
          onClick={() => window.print()}
          className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-xl text-[10.5pt] font-medium shadow flex items-center space-x-1.5"
        >
          <Printer className="w-4 h-4" />
          <span>Cetak PDF</span>
        </button>
      </div>

      <div className="print-document bg-white p-6 rounded-xl text-slate-900 font-serif shadow-2xl mx-auto w-full max-w-xl text-[9.5pt] leading-tight">
        
        {/* KOP SURAT */}
        <div className="flex items-center justify-between gap-3 mb-1">
          <img 
            src="/logo-kubar.png" 
            alt="Logo Pemkab Kutai Barat" 
            onError={(e) => { e.target.onerror = null; e.target.src = 'https://upload.wikimedia.org/wikipedia/commons/2/23/Coat_of_arms_of_West_Kutai_Regency.png'; }}
            className="w-16 h-20 object-contain"
          />

          <div className="text-center flex-1">
            <h3 className="font-bold text-[10.5pt] uppercase tracking-wide m-0 p-0">PEMERINTAH KABUPATEN KUTAI BARAT</h3>
            <h3 className="font-bold text-[12pt] uppercase tracking-wide m-0 p-0">DINAS PENDIDIKAN DAN KEBUDAYAAN</h3>
            <h2 className="font-bold text-[14pt] uppercase tracking-wider m-0 p-0">SMP NEGERI 1 DAMAI</h2>
            <p className="font-bold text-[8.5pt] m-0 p-0 mt-0.5">
              <u>NSS : 20.1.16.09.08.001</u> &nbsp;&nbsp; <u>NPSN : 30400615</u> &nbsp;&nbsp; <u>NIS : 200070</u>
            </p>
            <p className="text-[8pt] m-0 p-0 italic">
              Jalan Temanggung Gamas RT.1 No.27 Damai Kota - Kode Pos 75777
            </p>
          </div>

          <img 
            src="/logo-smp.png" 
            alt="Logo SMPN 1 Damai" 
            onError={(e) => { e.target.onerror = null; e.target.src = '/logo.png'; }}
            className="w-16 h-20 object-contain"
          />
        </div>

        <div className="border-t-[2.5px] border-black border-b-[0.8px] border-b-black h-[2px] my-2"></div>

        <div className="text-center my-3">
          <h4 className="font-bold text-[10.5pt] uppercase underline whitespace-pre-wrap">{previewData.title}</h4>
          {previewData.subtitle && <p className="text-[9pt] text-slate-700 font-sans mt-0.5">{previewData.subtitle}</p>}
        </div>

        <table className="w-full border-collapse border border-slate-900 text-[8.5pt] font-sans">
          <thead>
            <tr className="bg-slate-200 text-slate-900 font-bold text-center">
              <th rowSpan="2" className="border border-slate-900 p-1 w-8">NO</th>
              <th rowSpan="2" className={`border border-slate-900 p-1 ${previewData.isIndividual ? 'w-32 text-center' : 'text-left'}`}>
                {previewData.isIndividual ? 'TANGGAL' : 'NAMA LENGKAP SISWA'}
              </th>
              <th colSpan="4" className="border border-slate-900 p-1">PRESENSI</th>
              {previewData.reportType !== 'wali_kelas' && previewData.reportType !== 'guru_wali' && (
                <th rowSpan="2" className={`border border-slate-900 p-1 ${previewData.isIndividual ? '' : 'w-16'}`}>
                  {previewData.isIndividual ? 'CATATAN' : 'NILAI'}
                </th>
              )}
            </tr>
            <tr className="bg-slate-300 text-slate-900 font-bold text-center text-[8pt]">
              <th className="border border-slate-900 p-0.5 w-8 text-emerald-800 bg-emerald-100/60">H</th>
              <th className="border border-slate-900 p-0.5 w-8 text-amber-800 bg-amber-100/60">S</th>
              <th className="border border-slate-900 p-0.5 w-8 text-blue-800 bg-blue-100/60">I</th>
              <th className="border border-slate-900 p-0.5 w-8 text-red-800 bg-red-100/60">A</th>
            </tr>
          </thead>
          <tbody>
            {previewData.rows.length === 0 ? (
              <tr>
                <td colSpan={previewData.reportType === 'wali_kelas' || previewData.reportType === 'guru_wali' ? "6" : "7"} className="border border-slate-800 p-3 text-center text-slate-400 italic">Belum ada riwayat data presensi.</td>
              </tr>
            ) : (
              previewData.rows.map((row, idx) => (
                <tr key={idx} className={idx % 2 === 1 ? 'bg-slate-100' : 'bg-white'}>
                  <td className="border border-slate-800 p-1 text-center font-medium">{row.no}</td>
                  <td className={`border border-slate-800 p-1 font-bold uppercase ${previewData.isIndividual ? 'text-center' : ''}`}>{row.name}</td>
                  
                  <td className="border border-slate-800 p-1 text-center font-bold text-emerald-700 bg-emerald-50/30">
                    {row.h > 0 ? row.h : '-'}
                  </td>
                  <td className="border border-slate-800 p-1 text-center font-bold text-amber-700 bg-amber-50/30">
                    {row.s > 0 ? row.s : '-'}
                  </td>
                  <td className="border border-slate-800 p-1 text-center font-bold text-blue-700 bg-blue-50/30">
                    {row.i > 0 ? row.i : '-'}
                  </td>
                  <td className="border border-slate-800 p-1 text-center font-bold text-red-700 bg-red-50/30">
                    {row.a > 0 ? row.a : '-'}
                  </td>

                  {previewData.reportType !== 'wali_kelas' && previewData.reportType !== 'guru_wali' && (
                    <td className="border border-slate-800 p-1 text-center font-bold text-slate-800">{row.grade}</td>
                  )}
                </tr>
              ))
            )}
          </tbody>
        </table>

        {/* AREA TTD GURU DENGAN JABATAN DINAMIS */}
        <div className="mt-5 flex justify-end font-sans">
          <div className="w-56 text-left text-[9pt]">
            <p>Damai, {new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
            <p className="font-normal mb-1">{previewData.subjectRole},</p>
            <p className="text-[8pt] text-slate-500 italic mb-1">
              Periode: {previewData.isIndividual 
                ? 'Seluruh Riwayat'
                : previewData.reportPeriod === 'harian' 
                ? new Date(previewData.startDate).toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })
                : previewData.reportPeriod === 'mingguan' ? `MINGGUAN (${new Date(previewData.startDate).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })} - ${new Date(previewData.endDate).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })})`
                : previewData.reportPeriod === 'bulanan' ? `BULANAN (${new Date(previewData.startDate).toLocaleDateString('id-ID', { month: 'long', year: 'numeric' }).toUpperCase()})`
                : previewData.reportPeriod === 'semester' ? 'SEMESTER'
                : `${new Date(previewData.startDate).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })} - ${new Date(previewData.endDate).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}`
              }
            </p>
            
            <div className="h-14 my-1 flex items-center justify-start">
              {previewData.signatureUrl ? (
                <img src={previewData.signatureUrl} alt="TTD Guru" className="max-h-14 max-w-[160px] object-contain" />
              ) : (
                <div className="h-10 border-b border-dashed border-slate-300 w-full flex items-center text-[7pt] text-slate-400">(Belum ada foto TTD)</div>
              )}
            </div>

            <p className="font-bold underline text-[9.5pt]">{previewData.teacherName}</p>
            <p className="text-[8.5pt] text-slate-600">NIP. {previewData.teacherNip}</p>
          </div>
        </div>

      </div>
    </div>
  );
};
