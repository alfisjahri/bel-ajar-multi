import React, { useState, useEffect } from 'react';
import { BookOpen, UserCheck as WaliIcon, Users, RefreshCw, Camera, Image as ImageIcon, X, Check } from 'lucide-react';
import { getTeacherData } from '../utils/constants';

const TabInput = ({
  jurnalMode, setJurnalMode, journalDate, setStartDateJournal,
  selectedClass, setSelectedClass, selectedSubject, setSelectedSubject,
  waliClass, waliNotes, setWaliNotes, material, setMaterial,
  photoFiles, photoPreviews, handlePhotoSelect, handleRemovePhoto,
  students, fetchingStudents, attendance, setAttendance, grades, setGrades,
  loading, handleSubmitJurnal, setActiveTab, profile,
  guruWaliGroup, setGuruWaliGroup
}) => {
  const [isCompactMode, setIsCompactMode] = useState(false);

  const teacherData = getTeacherData(profile?.full_name) || {
    "MATEMATIKA": ["7", "8A", "8B"],
    "KODING & KA": ["8A", "8B", "9A", "9B"]
  };
  const availableClasses = [...new Set(Object.values(teacherData).flat())].sort();
  const availableSubjects = Object.keys(teacherData).filter(subj => teacherData[subj].includes(selectedClass));

  useEffect(() => {
    if (jurnalMode === 'mapel') {
      if (!availableClasses.includes(selectedClass) && availableClasses.length > 0) {
        setSelectedClass(availableClasses[0]);
      } else if (!availableSubjects.includes(selectedSubject) && availableSubjects.length > 0) {
        setSelectedSubject(availableSubjects[0]);
      }
    }
  }, [profile?.full_name, selectedClass, selectedSubject, jurnalMode, availableClasses.join(','), availableSubjects.join(',')]);


  return (
    <div className="space-y-2">
      {/* TOGGLE SWITCH 3 MODE PERADABAN */}
      <div className="bg-slate-200 dark:bg-slate-700 p-1 rounded-xl flex text-[10.5pt] font-semibold shadow-inner">
        <button 
          onClick={() => setJurnalMode('mapel')}
          className={`flex-1 py-1.5 rounded-lg flex items-center justify-center space-x-1 transition-all ${
            jurnalMode === 'mapel' ? 'bg-white dark:bg-slate-800 text-blue-600 shadow-sm' : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
          }`}
        >
          <span>Mapel</span>
        </button>

        {waliClass && (
          <button 
            onClick={() => setJurnalMode('wali_kelas')}
            className={`flex-1 py-1.5 rounded-lg flex items-center justify-center space-x-1 transition-all ${
              jurnalMode === 'wali_kelas' ? 'bg-emerald-600 text-white shadow-sm' : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
            }`}
          >
            <span>Wali Kelas</span>
          </button>
        )}

        <button 
          onClick={() => setJurnalMode('guru_wali')}
          className={`flex-1 py-1.5 rounded-lg flex items-center justify-center space-x-1 transition-all ${
            jurnalMode === 'guru_wali' ? 'bg-amber-600 text-white shadow-sm' : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
          }`}
        >
          <span>Guru Wali</span>
        </button>
      </div>

      {/* CARD 1: TANGGAL & DETAIL KELAS */}
      <div className="bg-white dark:bg-slate-800 p-3 rounded-xl border border-slate-100 dark:border-slate-700/60 shadow-sm space-y-3">
        {jurnalMode === 'mapel' ? (
          <div className="flex items-center gap-4 overflow-x-auto no-scrollbar pb-1">
            <div className="flex items-center gap-2 whitespace-nowrap">
              <label className="text-[10.5pt] font-bold text-slate-500 dark:text-slate-400">Tanggal</label>
              <input 
                type="date" 
                className="py-1.5 px-2 bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-700 rounded-lg text-[10.5pt] font-semibold text-slate-700 dark:text-slate-200"
                value={journalDate} 
                onChange={e => setStartDateJournal(e.target.value)}
              />
            </div>
            <div className="flex items-center gap-2 whitespace-nowrap">
              <label className="text-[10.5pt] font-bold text-slate-500 dark:text-slate-400">Kelas</label>
              <select 
                className="py-1.5 px-2 bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-700 rounded-lg text-[10.5pt] font-semibold text-slate-700 dark:text-slate-200"
                value={selectedClass} 
                onChange={e => setSelectedClass(e.target.value)}
              >
                {availableClasses.map(cls => (
                  <option key={cls} value={cls}>{cls}</option>
                ))}
              </select>
            </div>
            <div className="flex items-center gap-2 whitespace-nowrap">
              <label className="text-[10.5pt] font-bold text-slate-500 dark:text-slate-400">Mapel</label>
              <select 
                className="py-1.5 px-2 bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-700 rounded-lg text-[10.5pt] font-semibold text-slate-700 dark:text-slate-200"
                value={selectedSubject} 
                onChange={e => setSelectedSubject(e.target.value)}
              >
                {availableSubjects.map(subj => (
                  <option key={subj} value={subj}>{subj}</option>
                ))}
              </select>
            </div>
          </div>
        ) : (
          <div className="flex items-center gap-4 overflow-x-auto no-scrollbar pb-1">
            <div className="flex items-center gap-2 whitespace-nowrap">
              <label className="text-[10.5pt] font-bold text-slate-500 dark:text-slate-400">Tanggal</label>
              <input 
                type="date" 
                className="py-1.5 px-2 bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-700 rounded-lg text-[10.5pt] font-semibold text-slate-700 dark:text-slate-200"
                value={journalDate} 
                onChange={e => setStartDateJournal(e.target.value)}
              />
            </div>
            {jurnalMode === 'wali_kelas' && (
              <div className="flex items-center gap-2 whitespace-nowrap">
                <label className="text-[10.5pt] font-bold text-slate-500 dark:text-slate-400">Kelas</label>
                <div className="py-1.5 px-3 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-[10.5pt] font-bold text-slate-700 dark:text-slate-200">
                  {waliClass || "Bukan Wali Kelas"}
                </div>
              </div>
            )}
            {jurnalMode === 'guru_wali' && (
              <div className="flex items-center gap-2 whitespace-nowrap">
                <label className="text-[10.5pt] font-bold text-slate-500 dark:text-slate-400">Guru Wali</label>
                <div className="py-1.5 px-3 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-[10.5pt] font-bold text-slate-700 dark:text-slate-200">
                  {profile?.full_name}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* CARD 2: PRESENSI SISWA (Pill Switch Style) */}
      <div className="bg-white dark:bg-slate-800 p-2 rounded-xl border border-slate-100 dark:border-slate-700/60 shadow-sm space-y-2">
        <div className="flex justify-between items-center border-b border-slate-100 dark:border-slate-700/60 pb-1 mb-1">
          <div className="flex items-center space-x-2">
            <Users className={`w-4 h-4 ${jurnalMode === 'wali_kelas' ? 'text-emerald-600' : (jurnalMode === 'guru_wali' ? 'text-amber-600' : 'text-blue-600')}`} />
            <h3 className="font-semibold text-slate-800 dark:text-slate-100 text-[10.5pt]">
              {jurnalMode === 'wali_kelas' && `Presensi Wali Kelas`}
              {jurnalMode === 'guru_wali' && `Presensi Guru Wali`}
              {jurnalMode === 'mapel' && `Presensi Kelas ${selectedClass}`}
            </h3>
          </div>
          <div className="flex items-center space-x-3">
            <div className="flex items-center space-x-2 cursor-pointer" onClick={() => setIsCompactMode(!isCompactMode)}>
              <button 
                type="button"
                className={`w-10 h-5 flex items-center rounded-full p-1 transition-colors ${isCompactMode ? 'bg-blue-600' : 'bg-slate-300 dark:bg-slate-600'}`}
              >
                <div className={`bg-white w-3.5 h-3.5 rounded-full shadow-md transform transition-transform ${isCompactMode ? 'translate-x-4' : 'translate-x-0'}`}></div>
              </button>
            </div>
            {fetchingStudents && <RefreshCw className="w-3.5 h-3.5 text-blue-600 animate-spin" />}
          </div>
        </div>

        {students.length === 0 ? (
          <div className="text-center py-6 space-y-2">
            <p className="text-[10.5pt] text-slate-400 dark:text-slate-500 font-bold">
              {jurnalMode === 'guru_wali' ? 'Belum Ada Siswa.' : 'Tidak ada data siswa ditemukan.'}
            </p>
            {jurnalMode === 'guru_wali' && (
              <button 
                onClick={() => setActiveTab('siswa')}
                className="text-[10.5pt] bg-amber-100 text-amber-800 font-semibold px-3 py-1.5 rounded-xl border border-amber-300"
              >
                + Tandai Siswa
              </button>
            )}
          </div>
        ) : (
          <div className={`space-y-2 ${isCompactMode ? 'max-h-[32vh] overflow-y-auto pr-1' : ''}`}>
            {students.map((student, idx) => (
              <div key={student.id} className="p-3 bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-xl shadow-sm space-y-2">
                <div className="flex justify-between items-center">
                  <p className="font-semibold text-[10.5pt] text-slate-800 dark:text-slate-100">{idx + 1}. {student.name}</p>
                  {jurnalMode === 'guru_wali' && (
                    <span className="text-[10.5pt] font-semibold bg-amber-100 text-amber-800 px-2 py-0.5 rounded-md">
                      Kelas {student.class_name}
                    </span>
                  )}
                </div>

                <div className="flex items-center justify-between gap-2 pt-1">
                  
                  {/* SEGMENTED PILL SWITCH UNTUK PRESENSI H/S/I/A */}
                  <div className="bg-slate-100 dark:bg-slate-900 p-1 rounded-xl flex space-x-1 flex-1 max-w-[220px]">
                    {[
                      { code: 'Hadir', label: 'H', activeBg: 'bg-emerald-600 text-white shadow' },
                      { code: 'Sakit', label: 'S', activeBg: 'bg-amber-500 text-white shadow' },
                      { code: 'Izin', label: 'I', activeBg: 'bg-blue-600 text-white shadow' },
                      { code: 'Alfa', label: 'A', activeBg: 'bg-red-600 text-white shadow' },
                    ].map(item => {
                      const isSelected = (attendance[student.id] || 'Hadir') === item.code;

                      return (
                        <button
                          key={item.code}
                          type="button"
                          onClick={() => setAttendance({ ...attendance, [student.id]: item.code })}
                          className={`flex-1 py-1 rounded-md text-[10.5pt] font-bold transition-all duration-150 select-none ${
                            isSelected ? item.activeBg : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-100'
                          }`}
                        >
                          {item.label}
                        </button>
                      );
                    })}
                  </div>

                  {/* INPUT NILAI HANYA MUNCUL DI MODE MAPEL */}
                  {jurnalMode === 'mapel' && (
                    <div className="flex items-center space-x-1.5 pl-2 border-l border-slate-100 dark:border-slate-700">
                      <span className="text-[10.5pt] font-semibold text-slate-400 dark:text-slate-500 uppercase">Nilai:</span>
                      <input 
                        type="number" 
                        placeholder="0-100" 
                        className="w-14 text-[10.5pt] p-2 border border-slate-100 dark:border-slate-700 rounded-xl text-center font-bold bg-slate-50 dark:bg-slate-900 focus:bg-white dark:bg-slate-800 focus:ring-1 focus:ring-blue-500"
                        value={grades[student.id] || ''}
                        onChange={e => setGrades({...grades, [student.id]: e.target.value})}
                      />
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* CARD 3: MATERI / CATATAN & FOTO DOKUMENTASI */}
      <div className="bg-white dark:bg-slate-800 p-3 rounded-xl border border-slate-100 dark:border-slate-700/60 shadow-sm space-y-2">
        <div>
          <label className="text-[10.5pt] font-bold text-slate-500 dark:text-slate-400 dark:text-slate-500 block mb-1">
            {jurnalMode === 'mapel' ? 'Materi' : 'Catatan'}
          </label>
          <textarea 
            className="w-full p-2 bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-700 rounded-xl text-[10.5pt] min-h-[60px] font-medium focus:ring-2 focus:ring-blue-500 outline-none transition-all"
            placeholder={
              jurnalMode === 'mapel' 
                ? 'Ketik materi...' 
                : 'Ketik catatan...'
            }
            value={jurnalMode === 'mapel' ? material : waliNotes} 
            onChange={e => jurnalMode === 'mapel' ? setMaterial(e.target.value) : setWaliNotes(e.target.value)}
          />
        </div>

        <div>
          <label className="text-[10.5pt] font-bold text-slate-500 dark:text-slate-400 dark:text-slate-500 block mb-1">Dokumentasi</label>
          
          <div className="grid grid-cols-2 gap-2 mb-1">
            <label className="bg-blue-50 border border-blue-200 hover:bg-blue-100 text-blue-700 py-1.5 px-3 rounded-xl text-[10.5pt] font-bold flex items-center justify-center space-x-1.5 cursor-pointer active:scale-95 transition-all">
              <Camera className="w-4 h-4 text-blue-600" />
              <span>Kamera</span>
              <input 
                type="file" 
                accept="image/*" 
                capture="environment" 
                onChange={handlePhotoSelect} 
                className="hidden" 
              />
            </label>

            <label className="bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-700 hover:bg-slate-100 dark:bg-slate-900 text-slate-700 dark:text-slate-200 py-1.5 px-3 rounded-xl text-[10.5pt] font-bold flex items-center justify-center space-x-1.5 cursor-pointer active:scale-95 transition-all">
              <ImageIcon className="w-4 h-4 text-slate-600 dark:text-slate-300" />
              <span>Galeri</span>
              <input 
                type="file" 
                multiple 
                accept="image/*" 
                onChange={handlePhotoSelect} 
                className="hidden" 
              />
            </label>
          </div>

          {photoPreviews.length > 0 && (
            <div className="mt-2 space-y-1.5 bg-slate-50 dark:bg-slate-900 p-3 rounded-xl border border-slate-100 dark:border-slate-700">
              <p className="text-[10.5pt] text-emerald-600 font-bold">✓ {photoPreviews.length} foto terlampir:</p>
              <div className="flex gap-3 overflow-x-auto pt-2 pb-1 px-1">
                {photoPreviews.map((url, i) => (
                  <div key={i} className="relative flex-shrink-0 my-0.5">
                    <img src={url} alt="Preview Upload" className="w-16 h-16 object-cover rounded-xl border border-blue-300 shadow-sm" />
                    <button 
                      onClick={() => handleRemovePhoto(i)}
                      className="absolute -top-2 -right-2 bg-red-500 text-white p-1 rounded-full shadow-md hover:bg-red-600 active:scale-90 transition-all z-10"
                      title="Hapus foto ini"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      <button 
        onClick={handleSubmitJurnal} disabled={loading}
        className={`w-full text-white py-3 rounded-xl font-semibold shadow-lg flex items-center justify-center space-x-2 transition-all active:scale-98 ${
          jurnalMode === 'wali_kelas' ? 'bg-emerald-600 hover:bg-emerald-700' : (jurnalMode === 'guru_wali' ? 'bg-amber-600 hover:bg-amber-700' : 'bg-blue-600 hover:bg-blue-700')
        }`}
      >
        <Check className="w-5 h-5" />
        <span>{loading ? 'Menyimpan...' : 'Simpan Data'}</span>
      </button>
    </div>
  );
};

export default TabInput;
