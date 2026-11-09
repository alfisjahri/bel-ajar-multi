import { pb, eq } from '../pbClient';
import { Toast, Swal, compressImageToBase64, base64ToFile, newUuid } from './utils';

// Hapus semua record koleksi yang cocok dengan filter (PocketBase tak punya
// bulk-delete; ambil daftar lalu hapus satu per satu).
const deleteByFilter = async (collection, filter) => {
  const rows = await pb.collection(collection).getFullList({ filter, fields: 'id' });
  await Promise.all(rows.map((r) => pb.collection(collection).delete(r.id)));
};

export const fetchJournalsHistoryService = async ({ isDemo, setFetchingHistory, setJournalsHistory, profile }) => {
  if (isDemo || !profile?.full_name) return;
  setFetchingHistory(true);
  try {
    const data = await pb.collection('journals').getFullList({
      filter: eq('teacher_name', profile.full_name),
      sort: '-created_at',
    });
    setJournalsHistory(data);
  } catch (err) {
    console.error('Gagal fetch riwayat jurnal:', err);
  }
  setFetchingHistory(false);
};

export const handleStartEditJournalService = async ({ journal, editingJournal, setEditingJournal, setFetchingHistory, setEditStudentsList }) => {
  if (editingJournal?.id === journal.id) {
    setEditingJournal(null);
    return;
  }

  setFetchingHistory(true);
  let studentFilter = '';
  if (journal.subject === 'Presensi Guru Wali') {
    studentFilter = eq('group_name', journal.class_name);
  } else {
    studentFilter = eq('class_name', journal.class_name);
  }

  let studentList = [];
  try {
    studentList = await pb.collection('students').getFullList({ filter: studentFilter, sort: 'name' });
  } catch (err) {
    console.error('Gagal fetch siswa:', err);
  }

  let attData = [];
  let gradeData = [];
  try {
    attData = await pb.collection('attendance').getFullList({ filter: eq('journal', journal.id) });
  } catch (err) { console.error('Gagal fetch presensi:', err); }
  try {
    gradeData = await pb.collection('grades').getFullList({ filter: eq('journal', journal.id) });
  } catch (err) { console.error('Gagal fetch nilai:', err); }

  const initialAtt = {};
  const initialGrades = {};

  if (studentList) {
    studentList.forEach(s => {
      const foundAtt = attData?.find(a => a.student === s.id);
      initialAtt[s.id] = foundAtt ? foundAtt.status : 'Hadir';

      const foundGrade = gradeData?.find(g => g.student === s.id);
      initialGrades[s.id] = foundGrade ? foundGrade.score.toString() : '';
    });
  }

  setEditStudentsList(studentList || []);
  setEditingJournal({
    id: journal.id,
    material: journal.material,
    class_name: journal.class_name,
    created_at: journal.created_at,
    attendance: initialAtt,
    grades: initialGrades,
    subject: journal.subject
  });
  setFetchingHistory(false);
};

export const handleSaveFullJournalService = async ({ editingJournal, setSavingEdit, editStudentsList, setEditingJournal, fetchJournalsHistory }) => {
  if (!editingJournal) return;
  setSavingEdit(true);

  try {
    await pb.collection('journals').update(editingJournal.id, { material: editingJournal.material });
  } catch (jErr) {
    Toast.fire({ icon: 'error', title: 'Gagal update materi: ' + (jErr?.data?.message || jErr?.message) });
    setSavingEdit(false);
    return;
  }

  try {
    await deleteByFilter('attendance', eq('journal', editingJournal.id));
    const newAttRecords = editStudentsList.map(s => ({
      journal: editingJournal.id,
      student: s.id,
      status: editingJournal.attendance[s.id] || 'Hadir',
      date: editingJournal.created_at
    }));
    await Promise.all(newAttRecords.map((r) => pb.collection('attendance').create(r)));

    await deleteByFilter('grades', eq('journal', editingJournal.id));
    const newGradeRecords = [];
    for (const s of editStudentsList) {
      const scoreVal = editingJournal.grades[s.id];
      if (scoreVal !== undefined && scoreVal !== null && scoreVal !== '') {
        newGradeRecords.push({
          journal: editingJournal.id,
          student: s.id,
          score: parseFloat(scoreVal),
          date: editingJournal.created_at
        });
      }
    }
    if (newGradeRecords.length > 0) {
      await Promise.all(newGradeRecords.map((r) => pb.collection('grades').create(r)));
    }
  } catch (err) {
    Toast.fire({ icon: 'error', title: 'Gagal simpan presensi/nilai: ' + (err?.data?.message || err?.message) });
    setSavingEdit(false);
    return;
  }

  Toast.fire({ icon: 'success', title: 'Jurnal & Nilai Tersimpan Instan!' });
  setEditingJournal(null);
  setSavingEdit(false);
  fetchJournalsHistory();
};

export const handleDeleteJournalService = ({ journal, fetchJournalsHistory }) => {
  Swal.fire({
    title: 'Hapus Jurnal Ini?',
    text: 'Data presensi, nilai, dan dokumentasi terkait akan ikut terhapus permanen.',
    icon: 'warning',
    showCancelButton: true,
    confirmButtonColor: '#ef4444',
    cancelButtonColor: '#64748b',
    confirmButtonText: 'Ya, Hapus!',
    cancelButtonText: 'Batal'
  }).then(async (result) => {
    if (result.isConfirmed) {
      try {
        await deleteByFilter('attendance', eq('journal', journal.id));
        await deleteByFilter('grades', eq('journal', journal.id));
        // File foto ikut terhapus bersama record (field file PocketBase).
        await pb.collection('journals').delete(journal.id);
        Toast.fire({ icon: 'success', title: 'Jurnal berhasil dihapus' });
        fetchJournalsHistory();
      } catch (err) {
        Toast.fire({ icon: 'error', title: 'Gagal menghapus jurnal' });
      }
    }
  });
};

export const handleSubmitJurnalService = async ({
  isDemo, jurnalMode, material, setLoading, photoFiles, journalDate, selectedClass,
  selectedSubject, waliClass, waliNotes, guruWaliGroup, students, attendance, grades,
  setMaterial, setWaliNotes, setGuruWaliGroup, setPhotos, setPhotoPreviews, setGrades, initAttendance, profile
}) => {
  if (isDemo) return Toast.fire({ icon: 'info', title: 'Mode Demo: Data tidak tersimpan.' });

  if (jurnalMode === 'mapel' && !material.trim()) {
    return Toast.fire({ icon: 'warning', title: 'Isi materi pembelajaran dulu!' });
  }

  setLoading(true);
  let photoFileList = [];

  if (photoFiles.length > 0) {
    try {
      const user = pb.authStore.model;
      if (!user || !pb.authStore.isValid) throw new Error('Sesi login tidak ditemukan');
      photoFileList = await Promise.all(photoFiles.map(async (file) => {
        const base64Img = await compressImageToBase64(file);
        return base64ToFile(base64Img, `${newUuid()}.jpg`);
      }));
    } catch (err) {
      setLoading(false);
      return Toast.fire({ icon: 'error', title: 'Gagal mengupload foto.' });
    }
  }

  const customEntryDate = new Date(journalDate);

  let saveClassName = selectedClass;
  let saveSubject = selectedSubject;
  let saveMaterial = material;

  if (jurnalMode === 'wali_kelas') {
    saveClassName = waliClass;
    saveSubject = 'Pembinaan Wali Kelas';
    saveMaterial = waliNotes.trim() || `Presensi Harian Wali Kelas ${waliClass}`;
  } else if (jurnalMode === 'guru_wali') {
    saveClassName = profile?.full_name || 'NUR ALFI SYAHRI, S.P.';
    saveSubject = 'Presensi Guru Wali';
    saveMaterial = waliNotes.trim() || `Presensi Harian Binaan Guru Wali (${profile?.full_name || 'NUR ALFI SYAHRI, S.P.'})`;
  }

  let journal = null;
  try {
    const payload = {
      class_name: saveClassName,
      subject: saveSubject,
      material: saveMaterial,
      created_at: customEntryDate,
      teacher_name: profile.full_name || 'NUR ALFI SYAHRI, S.P.'
    };
    if (photoFileList.length > 0) payload.photos = photoFileList;
    if (profile?.id) payload.user = profile.id;
    journal = await pb.collection('journals').create(payload);
  } catch (error) {
    setLoading(false);
    return Toast.fire({ icon: 'error', title: 'Gagal simpan: ' + (error?.data?.message || error?.message) });
  }

  if (journal) {
    const attRecords = students.map(s => ({
      journal: journal.id, student: s.id, status: attendance[s.id] || 'Hadir', date: customEntryDate
    }));

    try {
      await Promise.all(attRecords.map((r) => pb.collection('attendance').create(r)));
    } catch (attInsertError) {
      console.error('Attendance Insert Error:', attInsertError);
      setLoading(false);
      // err.data bisa berupa object kosong {} (truthy) — ambil .message-nya dulu, jangan stringify object-nya
      const attMsg = attInsertError?.data?.message || attInsertError?.message || 'Tidak diketahui';
      return Toast.fire({ icon: 'error', title: 'Gagal menyimpan presensi: ' + attMsg });
    }

    if (jurnalMode === 'mapel') {
      const gradeRecords = students.filter(s => grades[s.id]).map(s => ({
        journal: journal.id, student: s.id, score: parseFloat(grades[s.id]), date: customEntryDate
      }));
      if (gradeRecords.length > 0) {
        try {
          await Promise.all(gradeRecords.map((r) => pb.collection('grades').create(r)));
        } catch (err) {
          console.error('Grade Insert Error:', err);
        }
      }
    }

    Swal.fire({
      icon: 'success',
      title: 'Tersimpan!',
      text: 'Data Presensi, Catatan, & Foto Berhasil Disimpan!',
      timer: 1800,
      showConfirmButton: false
    });

    setMaterial('');
    setWaliNotes('');
    if (setGuruWaliGroup) setGuruWaliGroup('');
    setPhotos([]);
    setPhotoPreviews([]);
    setGrades({});
    initAttendance(students);
  }
  setLoading(false);
};

export const handleTriggerExportPreviewService = async ({
  setLoading, reportClass, reportSubject, reportType, isDemo, reportPeriod,
  startDate, endDate, handleOpenPrintPreview, profile, waliClass, guruWaliGroup
}) => {
  setLoading(true);
  let targetStudents = [];

  let targetClassName = reportClass;
  let targetSubjectName = reportSubject;

  if (reportType === 'wali_kelas') {
    targetClassName = waliClass || '8A';
    targetSubjectName = 'Pembinaan Wali Kelas';
  } else if (reportType === 'guru_wali') {
    targetClassName = profile?.full_name || 'NUR ALFI SYAHRI, S.P.';
    targetSubjectName = 'Presensi Guru Wali';
  }

  if (isDemo) {
    targetStudents = [
      { id: '1', name: 'AFIFATUL AZIZAH', class_name: '8A' },
      { id: '2', name: 'ENDO PRATAMA', class_name: '8B' }
    ];
  } else {
    if (reportType === 'guru_wali') {
      targetClassName = guruWaliGroup || 'Kelompok 5'; // This is just for the header label
    }

    // Step 2: Fetch students
    let stFilter = '';
    if (reportType === 'mapel' || reportType === 'wali_kelas') {
      stFilter = eq('class_name', targetClassName);
    } else if (reportType === 'guru_wali') {
      stFilter = eq('group_name', profile?.full_name);
    } else {
      stFilter = eq('class_name', reportClass);
    }
    try {
      targetStudents = await pb.collection('students').getFullList({ filter: stFilter, sort: 'name' });
    } catch (err) {
      console.error('Gagal fetch siswa laporan:', err);
      targetStudents = [];
    }
  }

  let fromDate = new Date();
  let toDate = new Date();

  if (reportPeriod === 'harian') {
    fromDate.setHours(0, 0, 0, 0);
    toDate.setHours(23, 59, 59, 999);
  } else if (reportPeriod === 'mingguan') {
    const day = fromDate.getDay();
    const diffToMonday = fromDate.getDate() - day + (day === 0 ? -6 : 1);
    fromDate.setDate(diffToMonday);
    fromDate.setHours(0, 0, 0, 0);

    toDate = new Date(fromDate);
    toDate.setDate(fromDate.getDate() + 5);
    toDate.setHours(23, 59, 59, 999);
  } else if (reportPeriod === 'bulanan') {
    fromDate = new Date(fromDate.getFullYear(), fromDate.getMonth(), 1, 0, 0, 0, 0);
    toDate = new Date(fromDate.getFullYear(), fromDate.getMonth() + 1, 0, 23, 59, 59, 999);
  } else if (reportPeriod === 'semester') {
    const currentMonth = fromDate.getMonth();
    const semesterStartMonth = currentMonth >= 6 ? 6 : 0;
    fromDate = new Date(fromDate.getFullYear(), semesterStartMonth, 1, 0, 0, 0, 0);
    toDate.setHours(23, 59, 59, 999);
  } else if (reportPeriod === 'custom') {
    fromDate = startDate ? new Date(startDate) : new Date(2020, 0, 1);
    fromDate.setHours(0, 0, 0, 0);
    toDate = endDate ? new Date(endDate) : new Date();
    toDate.setHours(23, 59, 59, 999);
  }

  let attSummaryMap = {};
  let gradeSummaryMap = {};

  if (!isDemo && targetStudents.length > 0) {
    let matchedJournals = [];
    try {
      matchedJournals = await pb.collection('journals').getFullList({
        filter: `${eq('class_name', targetClassName)} && ${eq('subject', targetSubjectName)} && created_at >= "${fromDate.toISOString()}" && created_at <= "${toDate.toISOString()}"`,
        fields: 'id,created_at',
      });
    } catch (err) {
      console.error('Gagal fetch jurnal laporan:', err);
    }

    if (matchedJournals && matchedJournals.length > 0) {
      const journalIds = matchedJournals.map(j => j.id);
      const journalFilter = journalIds.map((id) => eq('journal', id)).join(' || ');

      let attData = [];
      try {
        attData = await pb.collection('attendance').getFullList({
          filter: journalFilter,
          fields: 'journal,student,status',
        });
      } catch (err) {
        console.error('Gagal fetch presensi laporan:', err);
      }

      targetStudents.forEach(s => {
        attSummaryMap[s.id] = { H: 0, S: 0, I: 0, A: 0 };
        gradeSummaryMap[s.id] = [];
      });

      journalIds.forEach(jid => {
        targetStudents.forEach(s => {
          const record = attData?.find(a => a.journal === jid && a.student === s.id);
          const st = record ? (record.status || '').trim().toLowerCase() : 'hadir';

          if (st === 'hadir') attSummaryMap[s.id].H++;
          else if (st === 'sakit') attSummaryMap[s.id].S++;
          else if (st === 'izin') attSummaryMap[s.id].I++;
          else if (st === 'alfa' || st === 'alpa') attSummaryMap[s.id].A++;
        });
      });

      let gradeData = [];
      try {
        gradeData = await pb.collection('grades').getFullList({
          filter: journalFilter,
          fields: 'student,score',
        });
      } catch (err) {
        console.error('Gagal fetch nilai laporan:', err);
      }

      if (gradeData) {
        gradeData.forEach(g => {
          if (!gradeSummaryMap[g.student]) gradeSummaryMap[g.student] = [];
          gradeSummaryMap[g.student].push(g.score);
        });
      }
    }
  }

  const rows = targetStudents.map((s, idx) => {
    const attInfo = attSummaryMap[s.id] || { H: 0, S: 0, I: 0, A: 0 };
    const gradeList = gradeSummaryMap[s.id];

    let gradeDisplay = '-';
    if (gradeList && gradeList.length > 0) {
      const avg = gradeList.reduce((a, b) => a + b, 0) / gradeList.length;
      gradeDisplay = Number.isInteger(avg) ? avg.toString() : avg.toFixed(2);
    }

    return {
      no: idx + 1,
      name: s.name,
      h: attInfo.H,
      s: attInfo.S,
      i: attInfo.I,
      a: attInfo.A,
      grade: gradeDisplay
    };
  });

  const formatDateRange = () => {
    if (reportPeriod === 'mingguan') {
      return `\n${new Date(fromDate).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })} - ${new Date(toDate).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}`;
    } else if (reportPeriod === 'bulanan') {
      return `\n${new Date(fromDate).toLocaleDateString('id-ID', { month: 'long', year: 'numeric' }).toUpperCase()}`;
    } else if (reportPeriod === 'semester') {
      return '';
    } else if (reportPeriod === 'harian') {
      return '';
    } else {
      return `\n${new Date(fromDate).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })} - ${new Date(toDate).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}`;
    }
  };

  let periodString = '';
  if (reportPeriod === 'harian') {
    periodString = 'HARIAN';
  } else if (reportPeriod === 'bulanan') {
    periodString = `BULAN ${formatDateRange().trim()}`;
  } else {
    periodString = `${reportPeriod.toUpperCase()} ${formatDateRange()}`.trim();
  }

  let reportTitle = `REKAPITULASI PRESENSI & NILAI (${periodString})`;
  let reportSubtitle = `SMPN 1 Damai  |  Kelas: ${targetClassName}  |  Mata Pelajaran: ${targetSubjectName}`;

  let subjectRoleText = `Guru Mata Pelajaran ${targetSubjectName}`;

  if (reportType === 'wali_kelas') {
    reportTitle = `REKAP PRESENSI & PEMBINAAN WALI KELAS ${targetClassName} (${periodString})`;
    reportSubtitle = `SMPN 1 Damai  |  Wali Kelas: ${targetClassName}`;
    subjectRoleText = `Wali Kelas ${targetClassName}`;
  } else if (reportType === 'guru_wali') {
    reportTitle = `REKAP PRESENSI BINAAN GURU WALI (${periodString})`;
    reportSubtitle = `SMPN 1 Damai  |  Kelompok Binaan: ${targetClassName}`;
    subjectRoleText = `Guru Wali ${targetClassName}`;
  }

  handleOpenPrintPreview(
    reportTitle,
    reportSubtitle,
    subjectRoleText,
    rows,
    reportType,
    reportPeriod,
    fromDate,
    toDate
  );
  setLoading(false);
};
