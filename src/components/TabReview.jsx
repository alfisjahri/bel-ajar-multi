import React, { useEffect } from 'react';
import { RefreshCw, Search, Filter, ArrowUpDown, Edit, Trash, Image as ImageIcon } from 'lucide-react';
import { getTeacherData } from '../utils/constants';

const TabReview = ({
  journalsHistory, fetchingHistory, fetchJournalsHistory, reviewSearchQuery,
  setReviewSearchQuery, reviewSubjectFilter, setReviewSubjectFilter,
  reviewClassFilter, setReviewClassFilter, reviewSortOrder, setReviewSortOrder,
  editingJournal, handleStartEditJournal, handleDeleteJournal,
  setEditingJournal, editStudentsList, handleSaveFullJournal, savingEdit,
  setSelectedImageModal, profile
}) => {
  const teacherData = getTeacherData(profile?.full_name) || {
    "MATEMATIKA": ["7", "8A", "8B"],
    "KODING & KA": ["8A", "8B", "9A", "9B"]
  };
  const availableSubjects = Object.keys(teacherData);
  const availableClasses = [...new Set(Object.values(teacherData).flat())].sort();

  useEffect(() => {
    if (reviewSubjectFilter !== 'ALL' && reviewSubjectFilter !== 'Wali Kelas' && reviewSubjectFilter !== 'Guru Wali') {
      if (!availableSubjects.includes(reviewSubjectFilter)) {
        setReviewSubjectFilter('ALL');
      }
    }
  }, [profile?.full_name, reviewSubjectFilter, availableSubjects]);

  const filteredJournalsHistory = journalsHistory
    .filter(j => {
      const matchesText = (j.material || '').toLowerCase().includes(reviewSearchQuery.toLowerCase());
      let matchesSubject = true;
      if (reviewSubjectFilter === 'Wali Kelas') matchesSubject = j.subject === 'Pembinaan Wali Kelas';
      else if (reviewSubjectFilter === 'Guru Wali') matchesSubject = j.subject === 'Presensi Guru Wali';
      else if (reviewSubjectFilter !== 'ALL') matchesSubject = j.subject === reviewSubjectFilter;

      let matchesClass = true;
      if (reviewClassFilter !== 'ALL') matchesClass = j.class_name === reviewClassFilter;

      return matchesText && matchesSubject && matchesClass;
    })
    .sort((a, b) => {
      const dateA = new Date(a.created_at).getTime();
      const dateB = new Date(b.created_at).getTime();
      return reviewSortOrder === 'desc' ? dateB - dateA : dateA - dateB;
    });

  return (
    <div className="space-y-3">
      <div className="flex justify-between items-center">
        <h3 className="font-semibold text-slate-800 dark:text-slate-100 text-[10.5pt]">Riwayat Jurnal</h3>
        <button onClick={fetchJournalsHistory} className="text-blue-600 p-1">
          <RefreshCw className={`w-3.5 h-3.5 ${fetchingHistory ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {/* 🔥 PANEL FILTER, SEARCH & SORT */}
      <div className="bg-white dark:bg-slate-800 p-3 rounded-xl border border-slate-100 dark:border-slate-700 shadow-sm space-y-2.5">
        
        {/* 1. KOTAK SEARCH TEXT MATERI */}
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400 dark:text-slate-500" />
          <input 
            type="text" 
            placeholder="Cari..." 
            className="w-full pl-9 pr-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-700 rounded-xl text-[10.5pt] font-medium focus:ring-1 focus:ring-blue-500"
            value={reviewSearchQuery} 
            onChange={e => setReviewSearchQuery(e.target.value)}
          />
        </div>

        {/* FILTER BAR: KELAS, MAPEL, SORT (1 BARIS) */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 no-scrollbar">
          
          <div className="flex items-center space-x-1 bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-700 px-2 py-1.5 rounded-xl flex-shrink-0">
            <span className="text-[10.5pt] font-bold text-slate-400 dark:text-slate-500">Kelas:</span>
            <select 
              className="bg-transparent text-[10.5pt] font-semibold text-slate-700 dark:text-slate-200 focus:outline-none"
              value={reviewClassFilter} 
              onChange={e => setReviewClassFilter(e.target.value)}
            >
              <option value="ALL">Semua Kelas</option>
              {availableClasses.map(cls => (
                <option key={cls} value={cls}>Kelas {cls}</option>
              ))}
            </select>
          </div>

          <div className="h-6 w-px bg-slate-200 dark:bg-slate-700 mx-1 flex-shrink-0" />

          <span className="text-[10.5pt] font-semibold text-slate-500 dark:text-slate-400 flex items-center gap-1 flex-shrink-0">
            <Filter className="w-4 h-4" /> Mapel:
          </span>
          {[
            { key: 'ALL', label: 'Semua' },
            ...availableSubjects.map(subj => ({ key: subj, label: subj })),
            { key: 'Wali Kelas', label: 'Wali Kelas' },
            { key: 'Guru Wali', label: 'Guru Wali' },
          ].map(chip => (
            <button 
              key={chip.key}
              onClick={() => setReviewSubjectFilter(chip.key)}
              className={`px-3 py-1.5 rounded-xl text-[10.5pt] font-semibold transition-all flex-shrink-0 ${
                reviewSubjectFilter === chip.key 
                  ? 'bg-blue-600 text-white shadow' 
                  : 'bg-slate-100 dark:bg-slate-900 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
              }`}
            >
              {chip.label}
            </button>
          ))}

          <div className="h-6 w-px bg-slate-200 dark:bg-slate-700 mx-1 flex-shrink-0" />

          <button 
            onClick={() => setReviewSortOrder(reviewSortOrder === 'desc' ? 'asc' : 'desc')}
            className="flex items-center space-x-1 px-3 py-1.5 bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-700 rounded-xl text-slate-600 dark:text-slate-300 font-bold flex-shrink-0"
          >
            <ArrowUpDown className="w-4 h-4" />
            <span className="text-[10.5pt]">{reviewSortOrder === 'desc' ? 'Terbaru' : 'Terlama'}</span>
          </button>
        </div>

      </div>

      {/* LIST RESULT RIWAYAT JURNAL */}
      <p className="text-[10.5pt] text-slate-400 dark:text-slate-500 font-semibold px-1">
        {filteredJournalsHistory.length} Jurnal
      </p>

      {filteredJournalsHistory.length === 0 ? (
        <p className="text-[10.5pt] text-slate-400 dark:text-slate-500 text-center py-10 bg-white dark:bg-slate-800 rounded-xl border">
          Tidak Ditemukan.
        </p>
      ) : (
        filteredJournalsHistory.map(j => {
          let photoList = j.photos || [];
          if (typeof photoList === 'string') {
            try { photoList = JSON.parse(photoList); } catch(e) { photoList = [photoList]; }
          }

          const isWaliEntry = j.subject === 'Pembinaan Wali Kelas';
          const isGuruWaliEntry = j.subject === 'Presensi Guru Wali';

          return (
                        <div key={j.id} className="bg-white dark:bg-slate-800 p-3 rounded-xl border border-slate-100 dark:border-slate-700 shadow-sm">
              {editingJournal?.id === j.id ? (
                <div className="space-y-3">
                  <div className="flex justify-between items-start border-b pb-2">
                    <div>
                      {!isGuruWaliEntry && !isWaliEntry && (
                        <span className="text-[10.5pt] font-bold px-2 py-0.5 rounded-md mr-1 bg-blue-100 text-blue-700">
                          {j.class_name}
                        </span>
                      )}
                      <span className={`text-[10.5pt] font-bold px-2 py-0.5 rounded-md ${
                        isWaliEntry ? 'bg-emerald-200 text-emerald-900' : (isGuruWaliEntry ? 'bg-amber-200 text-amber-900' : 'bg-indigo-100 text-indigo-700')
                      }`}>
                        {isWaliEntry ? 'Wali Kelas' : (isGuruWaliEntry ? 'Guru Wali' : j.subject)}
                      </span>
                    </div>
                    <span className="text-[10.5pt] text-slate-400 dark:text-slate-500 font-semibold">{new Date(j.created_at).toLocaleDateString('id-ID')}</span>
                  </div>
                  
                  <div className="space-y-3 pt-3 mt-2 bg-slate-50 dark:bg-slate-900/50 p-3 rounded-xl border border-slate-200 dark:border-slate-700">
                    <div>
                      <label className="text-[10.5pt] font-semibold text-slate-600 dark:text-slate-400 block mb-1">Edit Materi</label>
                      <textarea 
                        className="w-full p-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-600 rounded-xl text-[10.5pt] font-medium min-h-[100px] text-slate-700 dark:text-slate-200"
                        value={editingJournal.material}
                        onChange={e => setEditingJournal({...editingJournal, material: e.target.value})}
                      />
                    </div>

                    <div>
                      <label className="text-[10.5pt] font-bold text-slate-600 dark:text-slate-300 block mb-2">Edit Presensi</label>
                      <div className="space-y-3 max-h-64 overflow-y-auto pr-1">
                        {editStudentsList.map((student, idx) => (
                          <div key={student.id} className="p-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-600 rounded-xl flex items-center justify-between text-[10.5pt] gap-2 shadow-sm">
                            <span className="font-bold text-[10.5pt] text-slate-800 dark:text-slate-100 truncate flex-1">{idx + 1}. {student.name}</span>
                            
                            <div className="flex items-center space-x-2">
                              <div className="bg-slate-100 dark:bg-slate-900 p-1 rounded-lg flex space-x-1">
                                {[
                                  { code: 'Hadir', label: 'H', activeBg: 'bg-emerald-600 text-white' },
                                  { code: 'Sakit', label: 'S', activeBg: 'bg-amber-500 text-white' },
                                  { code: 'Izin', label: 'I', activeBg: 'bg-blue-600 text-white' },
                                  { code: 'Alpa', label: 'A', activeBg: 'bg-red-600 text-white' },
                                ].map(item => {
                                  const isSelected = (editingJournal.attendance[student.id] || 'Hadir') === item.code;
                                  return (
                                    <button
                                      key={item.code}
                                      type="button"
                                      onClick={() => setEditingJournal({
                                        ...editingJournal,
                                        attendance: { ...editingJournal.attendance, [student.id]: item.code }
                                      })}
                                      className={`px-3 py-1.5 rounded-md text-[10.5pt] font-bold transition-all ${
                                        isSelected ? item.activeBg : 'text-slate-400 dark:text-slate-500 hover:text-slate-700 dark:hover:text-slate-200'
                                      }`}
                                    >
                                      {item.label}
                                    </button>
                                  );
                                })}
                              </div>

                              {!isWaliEntry && !isGuruWaliEntry && (
                                <input 
                                  type="number" 
                                  placeholder="Nilai" 
                                  className="w-14 text-[10.5pt] p-2 border border-slate-300 dark:border-slate-600 rounded-lg text-center font-bold bg-white dark:bg-slate-800 focus:ring-1 focus:ring-blue-500"
                                  value={editingJournal.grades[student.id] !== undefined ? editingJournal.grades[student.id] : ''}
                                  onChange={e => setEditingJournal({
                                    ...editingJournal,
                                    grades: { ...editingJournal.grades, [student.id]: e.target.value }
                                  })}
                                />
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="flex gap-2 pt-2 border-t">
                      <button 
                        onClick={handleSaveFullJournal} disabled={savingEdit}
                        className="bg-emerald-600 hover:bg-emerald-700 text-white text-[10.5pt] font-bold px-4 py-2 rounded-xl flex-1 shadow"
                      >
                        {savingEdit ? 'Menyimpan...' : 'Simpan Perubahan'}
                      </button>
                      <button 
                        onClick={() => setEditingJournal(null)} 
                        className="bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200 text-[10.5pt] font-bold px-3 py-2 rounded-xl"
                      >
                        Batal
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="flex gap-3">
                  <div className="flex-1 min-w-0 space-y-2">
                    <div className="flex justify-between items-start border-b pb-2">
                      <div>
                        {!isGuruWaliEntry && !isWaliEntry && (
                          <span className="text-[10.5pt] font-bold px-2 py-0.5 rounded-md mr-1 bg-blue-100 text-blue-700">
                            {j.class_name}
                          </span>
                        )}
                        <span className={`text-[10.5pt] font-bold px-2 py-0.5 rounded-md ${
                          isWaliEntry ? 'bg-emerald-200 text-emerald-900' : (isGuruWaliEntry ? 'bg-amber-200 text-amber-900' : 'bg-indigo-100 text-indigo-700')
                        }`}>
                          {isWaliEntry ? 'Wali Kelas' : (isGuruWaliEntry ? 'Guru Wali' : j.subject)}
                        </span>
                      </div>
                      <span className="text-[10.5pt] text-slate-400 dark:text-slate-500 font-semibold mt-0.5">{new Date(j.created_at).toLocaleDateString('id-ID')}</span>
                    </div>

                    <p className="text-[10.5pt] text-slate-700 dark:text-slate-200 font-medium leading-relaxed break-words">{j.material}</p>

                    {Array.isArray(photoList) && photoList.length > 0 && (
                      <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
                        <p className="text-[10.5pt] font-bold text-slate-400 dark:text-slate-500 mb-1.5 flex items-center gap-1">
                          <ImageIcon className="w-3.5 h-3.5 text-blue-600" />
                          <span>Dokumentasi ({photoList.length}):</span>
                        </p>
                        <div className="flex gap-2 overflow-x-auto pb-1">
                          {photoList.map((url, i) => (
                            <img 
                              key={i} 
                              src={url} 
                              alt="Dokumentasi Jurnal" 
                              onClick={() => setSelectedImageModal(url)}
                              className="w-20 h-20 object-cover rounded-xl border-2 border-white shadow-md cursor-pointer hover:opacity-80 active:scale-95 transition-all flex-shrink-0" 
                            />
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* KOLOM KANAN: Tombol Aksi (Besar dan vertikal) */}
                  <div className="flex flex-col gap-2 border-l border-slate-100 dark:border-slate-700 pl-3 w-[56px] flex-shrink-0">
                    <button 
                      onClick={() => handleStartEditJournal(j)}
                      className="flex-1 min-h-[44px] bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-xl flex items-center justify-center hover:bg-blue-100 dark:hover:bg-blue-900/50 transition-colors"
                      title="Edit Jurnal"
                    >
                      <Edit className="w-5 h-5" />
                    </button>
                    <button 
                      onClick={() => handleDeleteJournal(j)}
                      className="flex-1 min-h-[44px] bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400 rounded-xl flex items-center justify-center hover:bg-red-100 dark:hover:bg-red-900/50 transition-colors"
                      title="Hapus Jurnal"
                    >
                      <Trash className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              )}
            </div>

          );
        })
      )}
    </div>
  );
};

export default TabReview;
