import { supabase } from '../supabaseClient';
import { Toast, Swal, compressImageToBase64, uploadImageToCloudinary, deleteImageFromCloudinary } from './utils';

export const fetchJournalsHistoryService = async ({ isDemo, setFetchingHistory, setJournalsHistory, profile }) => {
  if (isDemo || !profile?.full_name) return;
  setFetchingHistory(true);
  const { data, error } = await supabase
    .from('journals')
    .select('*')
    .eq('teacher_name', profile.full_name)
    .order('created_at', { ascending: false });

  if (!error && data) {
    setJournalsHistory(data);
  }
  setFetchingHistory(false);
};

export const handleStartEditJournalService = async ({ journal, editingJournal, setEditingJournal, setFetchingHistory, setEditStudentsList }) => {
  if (editingJournal?.id === journal.id) {
    setEditingJournal(null);
    return;
  }

  setFetchingHistory(true);
  let studentListQuery = supabase.from('students').select('*').order('name', { ascending: true });

  if (journal.subject === 'Presensi Guru Wali') {
    studentListQuery = studentListQuery.eq('group_name', 'Kelompok 5');
  } else {
    studentListQuery = studentListQuery.eq('class_name', journal.class_name);
  }

  const { data: studentList } = await studentListQuery;

  const { data: attData } = await supabase
    .from('attendance')
    .select('*')
    .eq('journal_id', journal.id);

  const { data: gradeData } = await supabase
    .from('grades')
    .select('*')
    .eq('journal_id', journal.id);

  const initialAtt = {};
  const initialGrades = {};

  if (studentList) {
    studentList.forEach(s => {
      const foundAtt = attData?.find(a => a.student_id === s.id);
      initialAtt[s.id] = foundAtt ? foundAtt.status : 'Hadir';

      const foundGrade = gradeData?.find(g => g.student_id === s.id);
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

  const { error: jErr } = await supabase
    .from('journals')
    .update({ material: editingJournal.material })
    .eq('id', editingJournal.id);

  if (jErr) {
    Toast.fire({ icon: 'error', title: 'Gagal update materi: ' + jErr.message });
    setSavingEdit(false);
    return;
  }

  await supabase.from('attendance').delete().eq('journal_id', editingJournal.id);
  const newAttRecords = editStudentsList.map(s => ({
    journal_id: editingJournal.id,
    student_id: s.id,
    status: editingJournal.attendance[s.id] || 'Hadir',
    date: editingJournal.created_at
  }));
  await supabase.from('attendance').insert(newAttRecords);

  await supabase.from('grades').delete().eq('journal_id', editingJournal.id);
  const newGradeRecords = [];
  for (const s of editStudentsList) {
    const scoreVal = editingJournal.grades[s.id];
    if (scoreVal !== undefined && scoreVal !== null && scoreVal !== '') {
      newGradeRecords.push({
        journal_id: editingJournal.id,
        student_id: s.id,
        score: parseFloat(scoreVal),
        date: editingJournal.created_at
      });
    }
  }
  if (newGradeRecords.length > 0) {
    await supabase.from('grades').insert(newGradeRecords);
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
      // Parse photos if it's stringified JSON
      let photoList = journal.photos || [];
      if (typeof photoList === 'string') {
        try { photoList = JSON.parse(photoList); } catch(e) { photoList = [photoList]; }
      }

      await supabase.from('attendance').delete().eq('journal_id', journal.id);
      await supabase.from('grades').delete().eq('journal_id', journal.id);
      const { error } = await supabase.from('journals').delete().eq('id', journal.id);

      if (!error) {
        // Delete images from Cloudinary silently in background
        if (Array.isArray(photoList) && photoList.length > 0) {
          photoList.forEach(url => {
            if (url) deleteImageFromCloudinary(url);
          });
        }
        
        Toast.fire({ icon: 'success', title: 'Jurnal berhasil dihapus' });
        fetchJournalsHistory();
      } else {
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
  let photoBase64List = [];

  if (photoFiles.length > 0) {
    for (const file of photoFiles) {
      try {
        const base64Img = await compressImageToBase64(file);
        const cloudinaryUrl = await uploadImageToCloudinary(base64Img);
        photoBase64List.push(cloudinaryUrl);
      } catch (err) {
        setLoading(false);
        return Toast.fire({ icon: 'error', title: 'Gagal mengupload foto ke Cloudinary.' });
      }
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
    saveClassName = guruWaliGroup || 'Kelompok 5';
    saveSubject = 'Presensi Guru Wali';
    saveMaterial = waliNotes.trim() || `Presensi Harian Binaan Guru Wali (${guruWaliGroup || 'Kelompok 5'})`;
  }

  const { data: journal, error } = await supabase.from('journals').insert([
    { 
      class_name: saveClassName, 
      subject: saveSubject, 
      material: saveMaterial, 
      photos: photoBase64List,
      created_at: customEntryDate,
      teacher_name: profile.full_name || 'NUR ALFI SYAHRI, S.P.'
    }
  ]).select().single();

  if (!error && journal) {
    const attRecords = students.map(s => ({
      journal_id: journal.id, student_id: s.id, status: attendance[s.id] || 'Hadir', date: customEntryDate
    }));

    await supabase.from('attendance').insert(attRecords);

    if (jurnalMode === 'mapel') {
      const gradeRecords = students.filter(s => grades[s.id]).map(s => ({
        journal_id: journal.id, student_id: s.id, score: parseFloat(grades[s.id]), date: customEntryDate
      }));
      if (gradeRecords.length > 0) await supabase.from('grades').insert(gradeRecords);
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
  } else {
    Toast.fire({ icon: 'error', title: 'Gagal simpan: ' + error?.message });
  }
  setLoading(false);
};

export const handleTriggerExportPreviewService = async ({
  setLoading, reportClass, reportSubject, reportType, isDemo, reportPeriod,
  startDate, endDate, handleOpenPrintPreview, profile
}) => {
  setLoading(true);
  let targetStudents = [];

  let targetClassName = reportClass;
  let targetSubjectName = reportSubject;

  if (reportType === 'wali_kelas') {
    targetClassName = '8A';
    targetSubjectName = 'Pembinaan Wali Kelas';
  } else if (reportType === 'guru_wali') {
    targetClassName = 'Kelompok 5';
    targetSubjectName = 'Presensi Guru Wali';
  }

  if (isDemo) {
    targetStudents = [
      { id: '1', name: 'AFIFATUL AZIZAH', class_name: '8A' },
      { id: '2', name: 'ENDO PRATAMA', class_name: '8B' }
    ];
  } else {
    let stQuery = supabase.from('students').select('*').order('name', { ascending: true });
    if (reportType === 'guru_wali') {
      stQuery = stQuery.eq('group_name', 'Kelompok 5');
    } else if (reportType === 'wali_kelas') {
      stQuery = stQuery.eq('class_name', '8A');
    } else {
      stQuery = stQuery.eq('class_name', reportClass);
    }
    const { data } = await stQuery;
    if (data) targetStudents = data;
  }

  let fromDate = new Date();
  let toDate = new Date();

  if (reportPeriod === 'harian') {
    fromDate.setHours(0, 0, 0, 0);
    toDate.setHours(23, 59, 59, 999);
  } else if (reportPeriod === 'mingguan') {
    fromDate.setDate(fromDate.getDate() - 7);
    fromDate.setHours(0, 0, 0, 0);
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
    fromDate = new Date(startDate);
    fromDate.setHours(0, 0, 0, 0);
    toDate = new Date(endDate);
    toDate.setHours(23, 59, 59, 999);
  }

  let attSummaryMap = {};
  let gradeSummaryMap = {};

  if (!isDemo && targetStudents.length > 0) {
    const { data: matchedJournals } = await supabase
      .from('journals')
      .select('id, created_at')
      .eq('class_name', targetClassName)
      .eq('subject', targetSubjectName)
      .gte('created_at', fromDate.toISOString())
      .lte('created_at', toDate.toISOString());

    if (matchedJournals && matchedJournals.length > 0) {
      const journalIds = matchedJournals.map(j => j.id);

      const { data: attData } = await supabase
        .from('attendance')
        .select('student_id, status')
        .in('journal_id', journalIds);

      const { data: gradeData } = await supabase
        .from('grades')
        .select('student_id, score')
        .in('journal_id', journalIds);

      if (attData) {
        attData.forEach(a => {
          if (!attSummaryMap[a.student_id]) {
            attSummaryMap[a.student_id] = { H: 0, S: 0, I: 0, A: 0 };
          }
          if (a.status === 'Hadir') attSummaryMap[a.student_id].H++;
          else if (a.status === 'Sakit') attSummaryMap[a.student_id].S++;
          else if (a.status === 'Izin') attSummaryMap[a.student_id].I++;
          else if (a.status === 'Alfa') attSummaryMap[a.student_id].A++;
        });
      }

      if (gradeData) {
        gradeData.forEach(g => {
          if (!gradeSummaryMap[g.student_id]) gradeSummaryMap[g.student_id] = [];
          gradeSummaryMap[g.student_id].push(g.score);
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

  let reportTitle = `REKAPITULASI PRESENSI & NILAI (${reportPeriod.toUpperCase()})`;
  let reportSubtitle = `SMPN 1 Damai  |  Kelas: ${targetClassName}  |  Mata Pelajaran: ${targetSubjectName}`;
  
  let subjectRoleText = `Guru Mata Pelajaran ${targetSubjectName}`;

  if (reportType === 'wali_kelas') {
    reportTitle = `REKAP PRESENSI & PEMBINAAN WALI KELAS 8A (${reportPeriod.toUpperCase()})`;
    reportSubtitle = `SMPN 1 Damai  |  Wali Kelas: 8A`;
    subjectRoleText = `Wali Kelas 8A`;
  } else if (reportType === 'guru_wali') {
    reportTitle = `REKAP PRESENSI BINAAN GURU WALI (${reportPeriod.toUpperCase()})`;
    reportSubtitle = `SMPN 1 Damai  |  Kelompok Binaan: Kelompok 5`;
    subjectRoleText = `Guru Wali Kelompok 5`;
  }

  handleOpenPrintPreview(
    reportTitle,
    reportSubtitle,
    subjectRoleText,
    rows
  );
  setLoading(false);
};
