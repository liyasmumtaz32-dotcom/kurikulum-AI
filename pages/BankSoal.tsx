import React, { useState } from 'react';
import { Sparkles, FileText, CheckCircle2, Layers, Download, Eye, AlertCircle, ArrowRight, Calculator } from 'lucide-react';
import { Button } from '../components/Button';
import { SetupData, GeneratedDocument, DocType } from '../types';
import { generateDocumentContent } from '../services/geminiService';
import { useNavigate } from 'react-router-dom';

interface BankSoalProps {
  setupData: SetupData;
  addDocuments: (docs: GeneratedDocument[]) => void;
  documents: GeneratedDocument[];
}

const BankSoal: React.FC<BankSoalProps> = ({ setupData, addDocuments, documents }) => {
  const navigate = useNavigate();
  const [isGenerating, setIsGenerating] = useState(false);
  const [currentStep, setCurrentStep] = useState('');
  
  // New State for specific question counts
  const [qtyPG, setQtyPG] = useState(10);
  const [qtyPGTKA, setQtyPGTKA] = useState(5);
  const [qtyUraian, setQtyUraian] = useState(5);
  const [qtyUraianTKA, setQtyUraianTKA] = useState(2);

  // Filter recent Bank Soal documents
  const recentDocs = documents.filter(d => d.type.toString().startsWith('Bank Soal')).slice(0, 5);

  const totalSoal = qtyPG + qtyPGTKA + qtyUraian + qtyUraianTKA;

  const handleGenerateComplete = async () => {
    if (!setupData.materi) {
      navigate('/setup');
      return;
    }

    setIsGenerating(true);
    const typesToGenerate = [
      DocType.BS_KISI_KISI,
      DocType.BS_SOAL,
      DocType.BS_KUNCI,
      DocType.BS_ANALISIS,
      DocType.BS_RUBRIK
    ];

    const newDocs: GeneratedDocument[] = [];

    // Construct the detailed configuration string
    const questionConfig = `
      Rincian Jumlah & Jenis Soal yang diminta:
      1. Pilihan Ganda (PG) Reguler: ${qtyPG} butir.
      2. Pilihan Ganda (PG) TKA (Tes Kemampuan Akademik/HOTS): ${qtyPGTKA} butir.
      3. Uraian/Essay Reguler: ${qtyUraian} butir.
      4. Uraian/Essay TKA (Tes Kemampuan Akademik/HOTS): ${qtyUraianTKA} butir.
      Total Keseluruhan: ${totalSoal} butir soal.
      
      PENTING: Pastikan jumlah soal dalam output sesuai dengan rincian di atas.
    `;

    try {
      for (const type of typesToGenerate) {
        setCurrentStep(`Sedang menyusun ${type}...`);
        
        // Pass the configuration to ALL document types so they are consistent
        const content = await generateDocumentContent(type, setupData, questionConfig);
        
        newDocs.push({
          id: `${type}-${Date.now()}`,
          type: type,
          title: `${type} - ${setupData.materi}`,
          content: content,
          createdAt: Date.now(),
          setupData: { ...setupData }
        });

        // Small delay to be gentle with rate limits if any
        await new Promise(r => setTimeout(r, 1000));
      }

      addDocuments(newDocs);
      setCurrentStep('Selesai!');
    } catch (error) {
      console.error(error);
      setCurrentStep('Gagal generate.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleDownload = (doc: GeneratedDocument) => {
    // KOP SURAT
    const kopSurat = `
      <div style="text-align: center; font-family: 'Times New Roman', serif; margin-bottom: 20px; border-bottom: 3px double black; padding-bottom: 10px;">
        <h3 style="margin:0; font-size: 14pt; font-weight: bold;">YAYASAN PENDIDIKAN ISLAM PONDOK MODERN AL GHOZALI</h3>
        <h2 style="margin:0; font-size: 16pt; font-weight: bold;">SEKOLAH MENENGAH ATAS (SMA) ISLAM AL GHOZALI</h2>
        <p style="margin:0; font-size: 11pt;">Jl. Permata No. 19 Curug Gunungsindur Kab. Bogor 16340</p>
        <p style="margin:0; font-size: 11pt;">Telp. (0251) 8614072, e-mail: smaislamalghozalisma@ymail.com</p>
      </div>
    `;

    const fullHtml = `
      <html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'>
      <head>
        <meta charset='utf-8'>
        <title>${doc.title}</title>
        <style>
          body { font-family: 'Times New Roman', serif; font-size: 12pt; line-height: 1.5; }
          table { border-collapse: collapse; width: 100%; margin: 15px 0; }
          th, td { border: 1px solid #000; padding: 5px; }
          th { background-color: #f0f0f0; font-weight: bold; }
          h1, h2, h3 { color: #000; }
        </style>
      </head>
      <body>
        ${kopSurat}
        <h3 style="text-align:center; text-transform:uppercase; margin-top:0;">${doc.title}</h3>
        <p style="text-align:center; font-weight:bold;">Mata Pelajaran: ${doc.setupData.mapel} | Kelas: ${doc.setupData.kelas}</p>
        <hr>
        ${doc.content}
      </body>
      </html>
    `;

    const blob = new Blob([fullHtml], { type: 'application/msword' });
    const url = URL.createObjectURL(blob);
    const element = document.createElement("a");
    element.href = url;
    element.download = `${doc.title.replace(/[^a-zA-Z0-9]/g, '_')}.doc`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="animate-fadeIn pb-20">
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-white mb-2">Generator Bank Soal AI</h2>
        <p className="text-slate-400">Buat paket soal lengkap: Kisi-kisi, Naskah, Kunci, Analisis, dan Rubrik dalam format Word siap cetak.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Configuration Panel */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-slate-800/50 border border-slate-700/50 rounded-2xl p-6">
            <h3 className="font-bold text-white mb-4 flex items-center gap-2">
              <Layers size={20} className="text-indigo-400" />
              Konfigurasi Paket Soal
            </h3>

            {setupData.materi ? (
              <div className="space-y-5">
                <div className="p-4 rounded-xl bg-slate-900 border border-indigo-500/30 shadow-[0_0_15px_rgba(99,102,241,0.15)] relative overflow-hidden">
                  <div className="absolute top-0 right-0 p-2 bg-indigo-500/20 rounded-bl-xl text-[10px] font-bold text-indigo-300">
                    OTOMATIS DARI SETUP
                  </div>
                  <p className="text-xs text-slate-500 uppercase font-bold mb-1">Materi / Topik</p>
                  <p className="text-white font-medium text-lg leading-snug">{setupData.materi}</p>
                  <p className="text-xs text-slate-400 mt-2 pt-2 border-t border-slate-800 flex items-center gap-2">
                    <CheckCircle2 size={12} className="text-emerald-500" />
                    {setupData.mapel} - Kelas {setupData.kelas}
                  </p>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center gap-2 text-sm text-slate-300 font-semibold border-b border-slate-700 pb-2">
                     <Calculator size={16} /> Rincian Jumlah Soal
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs text-slate-400 mb-1.5">PG Reguler</label>
                      <input 
                        type="number" 
                        min="0"
                        max="50"
                        value={qtyPG}
                        onChange={(e) => setQtyPG(parseInt(e.target.value) || 0)}
                        className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white text-sm focus:border-indigo-500 outline-none transition-colors"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-indigo-300 mb-1.5 font-medium">PG TKA (HOTS)</label>
                      <input 
                        type="number" 
                        min="0"
                        max="50"
                        value={qtyPGTKA}
                        onChange={(e) => setQtyPGTKA(parseInt(e.target.value) || 0)}
                        className="w-full bg-slate-900 border border-indigo-500/50 rounded-lg px-3 py-2 text-white text-sm focus:border-indigo-500 outline-none transition-colors"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-slate-400 mb-1.5">Uraian Reguler</label>
                      <input 
                        type="number" 
                        min="0"
                        max="20"
                        value={qtyUraian}
                        onChange={(e) => setQtyUraian(parseInt(e.target.value) || 0)}
                        className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white text-sm focus:border-indigo-500 outline-none transition-colors"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-indigo-300 mb-1.5 font-medium">Uraian TKA</label>
                      <input 
                        type="number" 
                        min="0"
                        max="20"
                        value={qtyUraianTKA}
                        onChange={(e) => setQtyUraianTKA(parseInt(e.target.value) || 0)}
                        className="w-full bg-slate-900 border border-indigo-500/50 rounded-lg px-3 py-2 text-white text-sm focus:border-indigo-500 outline-none transition-colors"
                      />
                    </div>
                  </div>

                  <div className="flex items-center justify-between p-3 rounded-lg bg-indigo-900/20 border border-indigo-500/20">
                    <span className="text-sm text-indigo-200">Total Soal</span>
                    <span className="text-lg font-bold text-white">{totalSoal} <span className="text-xs font-normal text-indigo-300">butir</span></span>
                  </div>
                </div>

                <div className="pt-2">
                  <Button 
                    onClick={handleGenerateComplete}
                    isLoading={isGenerating}
                    disabled={totalSoal === 0}
                    className="w-full py-4 shadow-xl shadow-indigo-900/20"
                    icon={<Sparkles size={20} />}
                  >
                    {isGenerating ? currentStep : 'Generate Paket Lengkap'}
                  </Button>
                  <p className="text-xs text-slate-500 text-center mt-3">
                    Otomatis membuat 5 dokumen Word rapi sesuai rincian.
                  </p>
                </div>
              </div>
            ) : (
              <div className="text-center py-8">
                <AlertCircle className="mx-auto text-amber-500 mb-2" size={32} />
                <p className="text-slate-300 mb-4">Materi belum diatur.</p>
                <Button variant="secondary" onClick={() => navigate('/setup')}>Ke Setup Pembelajaran</Button>
              </div>
            )}
          </div>
          
          <div className="bg-gradient-to-br from-indigo-900/20 to-slate-900 border border-indigo-500/20 rounded-2xl p-6">
            <h4 className="font-bold text-white mb-2">Output Otomatis:</h4>
            <ul className="space-y-2 text-sm text-slate-300">
              <li className="flex items-center gap-2"><CheckCircle2 size={14} className="text-emerald-400" /> Kisi-kisi Soal (Sesuai jumlah)</li>
              <li className="flex items-center gap-2"><CheckCircle2 size={14} className="text-emerald-400" /> Naskah Soal (PG & TKA)</li>
              <li className="flex items-center gap-2"><CheckCircle2 size={14} className="text-emerald-400" /> Kunci Jawaban & Pembahasan</li>
              <li className="flex items-center gap-2"><CheckCircle2 size={14} className="text-emerald-400" /> Analisis Soal Kualitatif</li>
              <li className="flex items-center gap-2"><CheckCircle2 size={14} className="text-emerald-400" /> Rubrik Penilaian</li>
            </ul>
          </div>
        </div>

        {/* Results Panel */}
        <div className="lg:col-span-2">
          <h3 className="font-bold text-white mb-4">Riwayat Dokumen Bank Soal</h3>
          
          {recentDocs.length > 0 ? (
            <div className="space-y-4">
              {recentDocs.map(doc => (
                <div key={doc.id} className="bg-slate-800/30 border border-slate-700/50 rounded-xl p-5 hover:border-indigo-500/30 transition-all group">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-4">
                      <div className="p-3 rounded-lg bg-indigo-500/10 text-indigo-400 group-hover:bg-indigo-500 group-hover:text-white transition-colors">
                        <FileText size={24} />
                      </div>
                      <div>
                        <h4 className="font-bold text-white text-lg">{doc.title}</h4>
                        <div className="text-slate-400 text-sm mt-1 mb-2 line-clamp-2" dangerouslySetInnerHTML={{ __html: doc.content.substring(0, 150) + "..." }}></div>
                        <div className="flex items-center gap-2 text-xs text-slate-500">
                           <span className="bg-slate-700 px-2 py-0.5 rounded text-slate-300">{doc.type}</span>
                           <span>•</span>
                           <span>{new Date(doc.createdAt).toLocaleDateString()} {new Date(doc.createdAt).toLocaleTimeString()}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex flex-col gap-2">
                      <button 
                        onClick={() => handleDownload(doc)}
                        className="p-2 rounded-lg bg-slate-700 text-slate-300 hover:bg-slate-600 hover:text-white transition-colors"
                        title="Download Word"
                      >
                        <Download size={18} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
              <div className="text-center pt-4">
                 <Button variant="ghost" onClick={() => navigate('/documents')}>
                   Lihat Semua Dokumen <ArrowRight size={16} className="ml-2" />
                 </Button>
              </div>
            </div>
          ) : (
            <div className="h-96 flex flex-col items-center justify-center border-2 border-dashed border-slate-700/50 rounded-2xl bg-slate-800/20">
              <div className="w-20 h-20 bg-slate-800 rounded-full flex items-center justify-center mb-4">
                 <FileText size={32} className="text-slate-600" />
              </div>
              <p className="text-slate-400 font-medium">Belum ada dokumen Bank Soal yang dibuat.</p>
              <p className="text-xs text-slate-500 mt-1">Silakan konfigurasi dan generate paket soal baru.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default BankSoal;