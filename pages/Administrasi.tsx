import React, { useState } from 'react';
import { Calendar, Users, Award, BookOpen, Activity, Edit, Download, Plus, Sparkles, AlertCircle } from 'lucide-react';
import { Button } from '../components/Button';
import { SetupData, GeneratedDocument, DocType } from '../types';
import { generateDocumentContent } from '../services/geminiService';
import { useNavigate } from 'react-router-dom';

interface AdministrasiProps {
  setupData: SetupData;
  addDocuments: (docs: GeneratedDocument[]) => void;
  documents: GeneratedDocument[];
}

const administrasiTypes = [
  { id: DocType.ADM_JADWAL, name: 'Jadwal Mengajar', icon: Calendar, color: 'text-blue-400', bg: 'bg-blue-500/10', desc: 'Jadwal mengajar per semester' },
  { id: DocType.ADM_ABSENSI, name: 'Daftar Hadir', icon: Users, color: 'text-emerald-400', bg: 'bg-emerald-500/10', desc: 'Rekapitulasi kehadiran siswa' },
  { id: DocType.ADM_NILAI, name: 'Daftar Nilai', icon: Award, color: 'text-amber-400', bg: 'bg-amber-500/10', desc: 'Leger nilai siswa' },
  { id: DocType.ADM_JURNAL, name: 'Jurnal Mengajar', icon: BookOpen, color: 'text-purple-400', bg: 'bg-purple-500/10', desc: 'Catatan harian pembelajaran' },
  { id: DocType.ADM_ANALISIS, name: 'Analisis Hasil', icon: Activity, color: 'text-pink-400', bg: 'bg-pink-500/10', desc: 'Analisis penilaian' },
  { id: DocType.ADM_REMEDIAL, name: 'Program Remedial', icon: Edit, color: 'text-rose-400', bg: 'bg-rose-500/10', desc: 'Program perbaikan nilai' }
];

const Administrasi: React.FC<AdministrasiProps> = ({ setupData, addDocuments, documents }) => {
  const navigate = useNavigate();
  const [generatingId, setGeneratingId] = useState<string | null>(null);

  // Filter existing admin docs
  const adminDocs = documents.filter(d => d.type.toString().startsWith('Administrasi'));

  const handleGenerate = async (type: DocType, name: string) => {
    if (!setupData.materi) {
      navigate('/setup');
      return;
    }

    setGeneratingId(type);
    
    try {
      const content = await generateDocumentContent(type, setupData);
      
      const newDoc: GeneratedDocument = {
        id: `admin-${Date.now()}`,
        type: type,
        title: `${name} - ${setupData.mapel}`,
        content: content,
        createdAt: Date.now(),
        setupData: { ...setupData }
      };

      addDocuments([newDoc]);
    } catch (error) {
      console.error(error);
      alert('Gagal generate dokumen.');
    } finally {
      setGeneratingId(null);
    }
  };

  const handleDownload = (doc: GeneratedDocument) => {
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
        </style>
      </head>
      <body>
        <h2 style="text-align:center">${doc.title}</h2>
        <p style="text-align:center">${doc.setupData.mapel} - Kelas ${doc.setupData.kelas}</p>
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
        <h2 className="text-3xl font-bold text-white mb-2">Administrasi Guru AI</h2>
        <p className="text-slate-400">Generate dokumen administrasi kelas secara instan dengan bantuan AI.</p>
      </div>

      {!setupData.materi && (
        <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-4 mb-8 flex items-center gap-3 text-amber-200">
           <AlertCircle size={20} />
           <p>Silakan lengkapi <span className="font-bold underline cursor-pointer" onClick={() => navigate('/setup')}>Setup Pembelajaran</span> terlebih dahulu.</p>
        </div>
      )}

      {/* Action Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-10">
        {administrasiTypes.map(type => (
          <button
            key={type.id}
            onClick={() => handleGenerate(type.id, type.name)}
            disabled={generatingId !== null || !setupData.materi}
            className={`group text-left bg-slate-800/50 border border-slate-700/50 rounded-xl p-6 transition-all relative overflow-hidden ${
              generatingId === type.id ? 'ring-2 ring-indigo-500' : 'hover:bg-slate-800 hover:border-indigo-500/50'
            } ${!setupData.materi ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            {generatingId === type.id && (
               <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-[1px] flex items-center justify-center z-10">
                 <Sparkles className="animate-spin text-indigo-400" size={24} />
               </div>
            )}

            <div className="flex items-start justify-between mb-4">
              <div className={`p-3 rounded-xl ${type.bg} ${type.color}`}>
                <type.icon size={24} />
              </div>
              <div className="p-2 rounded-lg bg-slate-700/50 text-slate-500 group-hover:bg-indigo-500/20 group-hover:text-indigo-400 transition-colors">
                <Plus size={16} />
              </div>
            </div>
            <h3 className="text-lg font-bold text-white mb-1 group-hover:text-indigo-300 transition-colors">{type.name}</h3>
            <p className="text-sm text-slate-400">{type.desc}</p>
          </button>
        ))}
      </div>

      {/* Generated List */}
      {adminDocs.length > 0 && (
        <div className="space-y-6">
          <h3 className="text-xl font-bold text-white">Dokumen Tersimpan</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {adminDocs.map(doc => {
              const typeInfo = administrasiTypes.find(t => t.id === doc.type);
              const Icon = typeInfo?.icon || Calendar; // Fallback icon
              const colorClass = typeInfo?.color || 'text-slate-400';
              
              return (
                <div key={doc.id} className="flex items-center justify-between p-5 bg-slate-900/50 border border-slate-800 rounded-xl hover:border-slate-700 transition-all">
                  <div className="flex items-center gap-4 overflow-hidden">
                    <div className={`p-3 rounded-xl bg-slate-800 ${colorClass}`}>
                      <Icon size={20} />
                    </div>
                    <div className="min-w-0">
                      <h4 className="font-semibold text-slate-200 truncate">{doc.title}</h4>
                      <p className="text-xs text-slate-500">
                        {new Date(doc.createdAt).toLocaleDateString()} • {doc.setupData.kelas || 'Umum'}
                      </p>
                    </div>
                  </div>
                  <button 
                    onClick={() => handleDownload(doc)}
                    className="shrink-0 p-2.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-900/20 transition-all"
                    title="Download Word"
                  >
                    <Download size={18} />
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default Administrasi;