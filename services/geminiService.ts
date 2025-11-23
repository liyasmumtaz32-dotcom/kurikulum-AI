import { GoogleGenAI } from "@google/genai";
import { DocType, SetupData } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

// Helper to clean markdown code blocks if Gemini adds them
const cleanHtmlOutput = (text: string): string => {
  return text.replace(/```html/g, '').replace(/```/g, '').trim();
};

export const generateDocumentContent = async (type: DocType, data: SetupData, extraPrompt: string = ""): Promise<string> => {
  const { jenjang, kelas, mapel, materi } = data;
  
  // Logic deteksi bahasa berdasarkan Mapel
  let languageInstruction = "Gunakan Bahasa Indonesia yang baku, formal, dan edukatif.";
  const mapelLower = mapel.toLowerCase();
  
  if (mapelLower.includes('inggris') || mapelLower.includes('english')) {
    languageInstruction = "PERHATIAN KHUSUS: Karena ini mapel BAHASA INGGRIS, maka Naskah Soal, Bacaan (Reading Text), dan Opsi Jawaban HARUS DALAM BAHASA INGGRIS sepenuhnya. Judul bagian boleh Bahasa Indonesia.";
  } else if (mapelLower.includes('arab')) {
    languageInstruction = "PERHATIAN KHUSUS: Karena ini mapel BAHASA ARAB, maka Naskah Soal dan Materi HARUS DALAM BAHASA ARAB (Gunakan huruf Arab/Hijaiyah yang valid). Sertakan harakat jika diperlukan untuk tingkat pemula.";
  } else if (mapelLower.includes('sunda')) {
    languageInstruction = "PERHATIAN KHUSUS: Karena ini mapel BAHASA SUNDA, maka Naskah Soal dan Materi HARUS DALAM BAHASA SUNDA yang baik dan benar (Sesuai Undak Usuk Basa).";
  } else if (mapelLower.includes('jawa')) {
    languageInstruction = "PERHATIAN KHUSUS: Karena ini mapel BAHASA JAWA, maka Naskah Soal dan Materi HARUS DALAM BAHASA JAWA.";
  }

  // Logic deteksi Matematika/Sains untuk formatting rumus
  let mathInstruction = "";
  if (['matematika', 'fisika', 'kimia', 'ipa', 'sains'].some(m => mapelLower.includes(m))) {
    mathInstruction = `
      8. FORMAT MATEMATIKA & SAINS (WAJIB):
         - JANGAN gunakan format LaTeX (seperti $x^2$ atau \\frac).
         - Gunakan tag HTML <sup> untuk pangkat/superscript. Contoh: x kuadrat ditulis "x<sup>2</sup>", derajat ditulis "30<sup>o</sup>".
         - Gunakan tag HTML <sub> untuk indeks/subscript. Contoh: "H<sub>2</sub>O", "x<sub>1</sub>".
         - Gunakan simbol HTML standar untuk operasi matematika (&times; untuk kali, &divide; untuk bagi, &plusmn; untuk kurang lebih).
    `;
  }

  let prompt = "";

  const commonContext = `
    Peran: Kamu adalah ahli kurikulum pendidikan Indonesia dan guru profesional (Kurikulum Merdeka).
    Konteks: Jenjang ${jenjang}, Kelas ${kelas}, Mata Pelajaran ${mapel}.
    Topik Materi: "${materi}".
    
    ${languageInstruction}

    INSTRUKSI FORMATTING DOKUMEN (PENTING AGAR RAPI DI MS WORD):
    1. Outputkan HANYA kode HTML (Hypertext Markup Language) yang valid untuk bagian <body>.
    2. JANGAN gunakan Markdown. JANGAN gunakan \`\`\`.
    3. Gunakan tag <h2>, <h3> untuk judul.
    4. Gunakan tag <table>, <tr>, <th>, <td> untuk tabel. Berikan border="1" style="border-collapse: collapse; width: 100%; border: 1px solid black;" pada tabel.
    5. Gunakan <p> untuk paragraf dan <br> untuk baris baru.
    6. Gunakan <b> atau <strong> untuk teks tebal.
    7. Pastikan tampilan rapi dan profesional siap cetak.
    ${mathInstruction}
  `;

  switch (type) {
    case DocType.MODUL:
      prompt = `
        ${commonContext}
        Tugas: Buat "Modul Ajar" lengkap dalam format HTML.
        Struktur Wajib:
        1. <h2>Informasi Umum</h2>
        2. <h2>Komponen Inti</h2> (Tujuan, Pemahaman Bermakna, Pertanyaan Pemantik, Kegiatan Pembelajaran, Asesmen).
        3. <h2>Lampiran</h2>
        
        Gunakan tabel untuk jadwal kegiatan pembelajaran.
      `;
      break;

    case DocType.KKTP:
      prompt = `
        ${commonContext}
        Tugas: Buat "Kriteria Ketercapaian Tujuan Pembelajaran (KKTP)" dalam format HTML.
        Buat tabel yang berisi: Tujuan Pembelajaran, Deskripsi Kriteria (Interval nilai/Rubrik), dan Tindak Lanjut.
      `;
      break;

    case DocType.ATP:
      prompt = `
        ${commonContext}
        Tugas: Buat "Alur Tujuan Pembelajaran (ATP)" dalam format HTML.
        Isi: Rasional, CP, Tujuan Pembelajaran.
        Buat tabel untuk Alur per pertemuan dan Alokasi Waktu.
      `;
      break;

    case DocType.PROTA:
      prompt = `
        ${commonContext}
        Tugas: Buat "Program Tahunan (Prota)" dalam format HTML.
        Output: Tabel HTML berisi Semester, Materi Pokok (termasuk "${materi}"), Alokasi Waktu.
      `;
      break;

    case DocType.PROMES:
      prompt = `
        ${commonContext}
        Tugas: Buat "Program Semester (Promes)" dalam format HTML.
        Output: Tabel distribusi materi ke bulan dan minggu efektif. Gunakan tabel yang rapi.
      `;
      break;

    // --- BANK SOAL ---
    case DocType.BS_KISI_KISI:
      prompt = `
        ${commonContext}
        Tugas: Buat "Kisi-kisi Soal" yang lengkap dalam format HTML.
        ${extraPrompt ? `Ikuti konfigurasi berikut: ${extraPrompt}` : `Buat minimal 5-10 indikator yang mencakup materi "${materi}".`}
        
        Buat Tabel HTML dengan kolom:
        - No
        - Kompetensi Dasar/CP
        - Materi
        - Indikator Soal
        - Level Kognitif (L1/L2/L3)
        - Bentuk Soal (PG/PG TKA/Uraian/Uraian TKA)
        - No Soal
        
        Pastikan indikator mencakup level kognitif tinggi untuk soal TKA.
      `;
      break;

    case DocType.BS_SOAL:
      prompt = `
        ${commonContext}
        Tugas: Buat "Naskah Soal" siap cetak dalam format HTML.
        ${extraPrompt ? `Konfigurasi Soal: ${extraPrompt}` : "Jumlah: 10 Soal Pilihan Ganda (opsi A-E) dan 5 Soal Uraian."}
        
        Panduan Khusus:
        1. Jika mapel Bahasa (Inggris/Arab/Sunda), pastikan teks soal menggunakan bahasa tersebut dengan benar.
        2. Soal TKA (Tes Kemampuan Akademik) harus bertipe HOTS (C4-C6).
        3. Format Soal PG:
           <p>1. Pertanyaan...</p>
           <ol type="A" style="margin-left: 20px;">
             <li>Opsi A</li>
             <li>Opsi B...</li>
           </ol>
        4. Format Soal Uraian: Gunakan nomor angka.
      `;
      break;

    case DocType.BS_KUNCI:
      prompt = `
        ${commonContext}
        Tugas: Buat "Kunci Jawaban dan Pembahasan" dalam format HTML.
        ${extraPrompt ? `Sesuaikan dengan konfigurasi soal: ${extraPrompt}` : ""}
        
        Format:
        <h3>A. Pilihan Ganda (Reguler & TKA)</h3>
        Buat tabel: No Soal | Kunci | Pembahasan.
        
        <h3>B. Uraian (Reguler & TKA)</h3>
        Buat tabel: No Soal | Jawaban Ideal | Pedoman Penskoran.
      `;
      break;

    case DocType.BS_ANALISIS:
      prompt = `
        ${commonContext}
        Tugas: Buat "Analisis Kualitatif Soal" (Telaah Soal) dalam format HTML.
        ${extraPrompt ? `Lingkup analisis mencakup semua soal sesuai konfigurasi: ${extraPrompt}` : ""}
        
        Buat tabel analisis per butir soal dengan kolom:
        - No Soal
        - Aspek Materi (Sesuai/Tidak)
        - Aspek Konstruksi (Jelas/Tidak)
        - Aspek Bahasa
        - Kesimpulan (Diterima/Revisi)
      `;
      break;

    case DocType.BS_RUBRIK:
      prompt = `
        ${commonContext}
        Tugas: Buat "Rubrik Penilaian dan Pedoman Penskoran" dalam format HTML.
        ${extraPrompt ? `Sesuaikan pembobotan dengan jumlah soal: ${extraPrompt}` : ""}
        
        Buat tabel Skema Penilaian untuk PG dan Uraian.
        Sertakan Rumus Perhitungan Nilai Akhir (NA).
      `;
      break;

    // --- ADMINISTRASI ---
    case DocType.ADM_JADWAL:
      prompt = `${commonContext} Tugas: Buat "Jadwal Mengajar" dalam format tabel HTML.`;
      break;
    case DocType.ADM_ABSENSI:
      prompt = `${commonContext} Tugas: Buat format "Daftar Hadir/Presensi Siswa" dalam format tabel HTML yang rapi dengan kolom Tanggal dan Keterangan.`;
      break;
    case DocType.ADM_NILAI:
      prompt = `${commonContext} Tugas: Buat format "Daftar Nilai (Leger)" dalam format tabel HTML mencakup Nilai Formatif, Sumatif, PTS, PAS.`;
      break;
    case DocType.ADM_JURNAL:
      prompt = `${commonContext} Tugas: Buat format "Jurnal Mengajar Harian" dalam format tabel HTML berisi Hari/Tgl, Jam, Materi, Kegiatan, Catatan.`;
      break;
    case DocType.ADM_ANALISIS:
      prompt = `${commonContext} Tugas: Buat format "Analisis Hasil Penilaian" dalam format tabel HTML untuk Ketuntasan Belajar.`;
      break;
    case DocType.ADM_REMEDIAL:
      prompt = `${commonContext} Tugas: Buat dokumen "Program Remedial dan Pengayaan" dalam format HTML. Sertakan tabel rencana kegiatan.`;
      break;
  }

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });

    const text = response.text;
    if (!text) return "Gagal menghasilkan konten.";
    
    return cleanHtmlOutput(text);
  } catch (error) {
    console.error("Gemini API Error:", error);
    throw new Error("Terjadi kesalahan saat menghubungi AI.");
  }
};