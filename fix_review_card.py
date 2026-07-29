import re

with open('src/components/TabReview.jsx', 'r', encoding='utf-8') as f:
    content = f.read()

new_card = """
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
                  
                  <div className="space-y-3 pt-2 bg-blue-50/50 p-3 rounded-xl border border-blue-200">
                    <div>
                      <label className="text-[10.5pt] font-semibold text-slate-600 dark:text-slate-400 dark:text-slate-500 block mb-1">Edit Materi</label>
                      <textarea 
                        className="w-full p-3 bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-xl text-[10.5pt] font-medium min-h-[100px]"
                        value={editingJournal.material}
                        onChange={e => setEditingJournal({...editingJournal, material: e.target.value})}
                      />
                    </div>

                    <div>
                      <label className="text-[10.5pt] font-bold text-slate-600 dark:text-slate-300 block mb-2">Edit Presensi</label>
                      <div className="space-y-3 max-h-64 overflow-y-auto pr-1">
                        {editStudentsList.map((student, idx) => (
                          <div key={student.id} className="p-3 bg-white dark:bg-slate-800 border rounded-xl flex items-center justify-between text-[10.5pt] gap-2 shadow-sm">
                            <span className="font-bold text-[10.5pt] text-slate-800 dark:text-slate-100 truncate flex-1">{idx + 1}. {student.name}</span>
                            
                            <div className="flex items-center space-x-2">
                              <div className="bg-slate-100 dark:bg-slate-900 p-1 rounded-lg flex space-x-1">
                                {[
                                  { code: 'Hadir', label: 'H', activeBg: 'bg-emerald-600 text-white' },
                                  { code: 'Sakit', label: 'S', activeBg: 'bg-amber-500 text-white' },
                                  { code: 'Izin', label: 'I', activeBg: 'bg-blue-600 text-white' },
                                  { code: 'Alfa', label: 'A', activeBg: 'bg-red-600 text-white' },
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
                      onClick={() => handleDeleteJournal(j.id)}
                      className="flex-1 min-h-[44px] bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400 rounded-xl flex items-center justify-center hover:bg-red-100 dark:hover:bg-red-900/50 transition-colors"
                      title="Hapus Jurnal"
                    >
                      <Trash className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              )}
            </div>
"""

pattern = r'<div key=\{j\.id\} className="bg-white dark:bg-slate-800 p-3 rounded-xl border border-slate-100 dark:border-slate-700 shadow-sm space-y-2">.*?</div>\n\s*\);\n\s*\}\)\n\s*\)\}'
replacement = new_card[1:] + "\n          );\n        })\n      }"
new_content = re.sub(pattern, replacement, content, flags=re.DOTALL)

with open('src/components/TabReview.jsx', 'w', encoding='utf-8') as f:
    f.write(new_content)

print("Done")
