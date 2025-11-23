import React from 'react';

export enum Jenjang {
  SD = 'SD',
  SMP = 'SMP',
  SMA = 'SMA'
}

export interface SetupData {
  jenjang: Jenjang | '';
  kelas: string;
  mapel: string;
  materi: string;
}

export enum DocType {
  MODUL = 'Modul Ajar',
  KKTP = 'KKTP',
  ATP = 'ATP',
  PROTA = 'Program Tahunan',
  PROMES = 'Program Semester',
  
  // Bank Soal
  BS_KISI_KISI = 'Bank Soal - Kisi-Kisi',
  BS_SOAL = 'Bank Soal - Naskah Soal',
  BS_KUNCI = 'Bank Soal - Kunci Jawaban',
  BS_ANALISIS = 'Bank Soal - Analisis Kualitatif',
  BS_RUBRIK = 'Bank Soal - Rubrik Penilaian',

  // Administrasi
  ADM_JADWAL = 'Administrasi - Jadwal Mengajar',
  ADM_ABSENSI = 'Administrasi - Daftar Hadir',
  ADM_NILAI = 'Administrasi - Daftar Nilai',
  ADM_JURNAL = 'Administrasi - Jurnal Mengajar',
  ADM_ANALISIS = 'Administrasi - Analisis Hasil',
  ADM_REMEDIAL = 'Administrasi - Program Remedial'
}

export interface GeneratedDocument {
  id: string;
  type: DocType;
  title: string;
  content: string;
  createdAt: number;
  setupData: SetupData;
}

export interface NavItem {
  id: string;
  label: string;
  path: string;
  icon: React.FC<any>;
}
