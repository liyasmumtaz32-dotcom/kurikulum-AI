import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Book, GraduationCap, Layers, Sparkles, Check, ArrowRight, BrainCircuit } from 'lucide-react';
import { Button } from '../components/Button';
import { SetupData, Jenjang, DocType, GeneratedDocument } from '../types';
import { generateDocumentContent } from '../services/geminiService';

// Detailed Data from requirements
const jenjangOptions = [Jenjang.SD, Jenjang.SMP, Jenjang.SMA];

const kelasMap: Record<string, string[]> = {
  'SD': ['1', '2', '3', '4', '5', '6'],
  'SMP': ['7', '8', '9'],
  'SMA': ['10', '11', '12']
};

const mapelMap: Record<string, string[]> = {
  'SD': [
    'Pendidikan Agama dan Budi Pekerti',
    'Pendidikan Pancasila',
    'Bahasa Indonesia',
    'Matematika',
    'IPAS (IPA dan IPS)',
    'PJOK',
    'Seni Musik',
    'Seni Rupa',
    'Seni Teater',
    'Seni Tari',
    'Bahasa Inggris',
    'Bahasa Sunda',
    'Bahasa Arab',
    'Muatan Lokal'
  ],
  'SMP': [
    'Pendidikan Agama dan Budi Pekerti',
    'Pendidikan Pancasila',
    'Bahasa Indonesia',
    'Matematika',
    'IPA',
    'IPS',
    'Bahasa Inggris',
    'Bahasa Sunda',
    'Bahasa Arab',
    'PJOK',
    'Seni Musik',
    'Seni Rupa',
    'Seni Teater',
    'Seni Tari',
    'Informatika',
    'Prakarya',
    'Bahasa Daerah',
    'Muatan Lokal'
  ],
  'SMA': [
    'Pendidikan Agama dan Budi Pekerti',
    'Pendidikan Pancasila',
    'Bahasa Indonesia',
    'Matematika',
    'Sejarah',
    'Bahasa Inggris',
    'Bahasa Sunda',
    'Bahasa Arab',
    'PJOK',
    'Seni (Musik/Rupa/Teater/Tari)',
    'Fisika',
    'Kimia',
    'Biologi',
    'Ekonomi',
    'Sosiologi',
    'Geografi',
    'Informatika',
    'Bahasa Asing Lain',
    'Antropologi',
    'Bahasa dan Sastra Lainnya'
  ]
};

interface SetupProps {
  setupData: SetupData;
  setSetupData: React.Dispatch<React.SetStateAction<SetupData>>;
  addDocuments: (docs: GeneratedDocument[]) => void;
}

const Setup: React.FC<SetupProps> = ({ setupData, setSetupData, addDocuments }) => {
  const navigate = useNavigate();
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationStep, setGenerationStep] = useState<string>('');

  const handleUpdate = (field: keyof SetupData, value: any) => {
    setSetupData(prev => {
      const newData = { ...prev, [field]: value };
      if (field === 'jenjang') {
        newData.kelas = '';
        newData.mapel = '';
      }
      return newData;
    });
  };

  const handleGenerate = async () => {
    if (!setupData.materi) return;

    setIsGenerating(true);
    const docsToGenerate = [DocType.MODUL, DocType.ATP, DocType.KKTP, DocType.PROTA, DocType.PROMES];
    const newDocuments: GeneratedDocument[] = [];

    try {
      for (const type of docsToGenerate) {
        setGenerationStep(`Sedang menyusun ${type}...`);
        
        // Add slight delay to prevent hitting rate limits too hard if any
        if (newDocuments.length > 0) await new Promise(r => setTimeout(r, 500));

        const content = await generateDocumentContent(type, setupData);
        
        newDocuments.push({
          id: `${type}-${Date.now()}`,
          type,
          title: `${type} - ${setupData.materi}`,
          content,
          createdAt: Date.now(),
          setupData: { ...setupData }
        });
      }

      addDocuments(newDocuments);
      setGenerationStep('Selesai!');
      setTimeout(() => navigate('/documents'), 500);

    } catch (error) {
      console.error(error);
      setGenerationStep('Terjadi kesalahan. Coba lagi.');
    } finally {
      setIsGenerating(false);
    }
  };

  // Derived state for options
  const currentMapelOptions = setupData.jenjang ? mapelMap[setupData.jenjang] : [];

  return (
    <div className="max-w-4xl mx-auto animate-fadeIn pb-20">
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-white mb-2">Setup Pembelajaran</h2>
        <p className="text-slate-400">Tentukan konteks pembelajaran agar sistem dapat menyusun dokumen yang akurat.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Form Section */}
        <div className="lg:col-span-2 space-y-8">
          
          {/* Step 1: Jenjang */}
          <section className="bg-slate-800/50 border border-slate-700/50 rounded-2xl p-6">
             <div className="flex items-center gap-3 mb-4 text-indigo-400">
               <GraduationCap size={24} />
               <h3 className="font-bold text-white">1. Jenjang Pendidikan</h3>
             </div>
             <div className="grid grid-cols-3 gap-4">
               {jenjangOptions.map(j => (
                 <button
                   key={j}
                   onClick={() => handleUpdate('jenjang', j)}
                   className={`p-4 rounded-xl font-bold transition-all border-2 ${
                     setupData.jenjang === j 
                     ? 'bg-indigo-600 border-indigo-600 text-white shadow-lg shadow-indigo-500/20' 
                     : 'bg-slate-900/50 border-transparent text-slate-400 hover:border-slate-600 hover:bg-slate-800'
                   }`}
                 >
                   {j}
                 </button>
               ))}
             </div>
          </section>

          {/* Step 2: Kelas */}
          <section className={`bg-slate-800/50 border border-slate-700/50 rounded-2xl p-6 transition-opacity duration-300 ${!setupData.jenjang ? 'opacity-50 pointer-events-none' : 'opacity-100'}`}>
             <div className="flex items-center gap-3 mb-4 text-indigo-400">
               <Layers size={24} />
               <h3 className="font-bold text-white">2. Kelas</h3>
             </div>
             <div className="flex flex-wrap gap-3">
               {setupData.jenjang && kelasMap[setupData.jenjang]?.map(k => (
                 <button
                    key={k}
                    onClick={() => handleUpdate('kelas', k)}
                    className={`w-12 h-12 rounded-xl font-bold transition-all flex items-center justify-center ${
                      setupData.kelas === k
                      ? 'bg-amber-500 text-slate-900 shadow-lg shadow-amber-500/20' 
                      : 'bg-slate-900/50 text-slate-400 hover:bg-slate-700'
                    }`}
                 >
                   {k}
                 </button>
               ))}
             </div>
          </section>

          {/* Step 3: Mapel */}
          <section className={`bg-slate-800/50 border border-slate-700/50 rounded-2xl p-6 transition-opacity duration-300 ${!setupData.kelas ? 'opacity-50 pointer-events-none' : 'opacity-100'}`}>
             <div className="flex items-center gap-3 mb-4 text-indigo-400">
               <Book size={24} />
               <h3 className="font-bold text-white">3. Mata Pelajaran</h3>
             </div>
             <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-80 overflow-y-auto custom-scrollbar pr-2">
               {currentMapelOptions.map(m => (
                 <button
                   key={m}
                   onClick={() => handleUpdate('mapel', m)}
                   className={`px-4 py-3 text-sm rounded-xl font-semibold transition-all text-left ${
                     setupData.mapel === m
                     ? 'bg-indigo-600 text-white' 
                     : 'bg-slate-900/50 text-slate-400 hover:bg-slate-700'
                   }`}
                 >
                   {m}
                 </button>
               ))}
             </div>
          </section>

           {/* Step 4: Materi Input */}
           <section className={`bg-slate-800/50 border border-slate-700/50 rounded-2xl p-6 transition-opacity duration-300 ${!setupData.mapel ? 'opacity-50 pointer-events-none' : 'opacity-100'}`}>
             <div className="flex items-center gap-3 mb-4 text-indigo-400">
               <BrainCircuit size={24} />
               <h3 className="font-bold text-white">4. Topik / Materi Spesifik</h3>
             </div>
             <input 
               type="text"
               value={setupData.materi}
               onChange={(e) => handleUpdate('materi', e.target.value)}
               placeholder="Contoh: Bilangan Bulat, Ekosistem, Teks Prosedur..."
               className="w-full bg-slate-900 border border-slate-700 rounded-xl px-5 py-4 text-white focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all"
             />
          </section>

        </div>

        {/* Preview / Action Panel */}
        <div className="lg:col-span-1">
          <div className="sticky top-8 space-y-6">
            <div className="bg-gradient-to-br from-slate-800 to-slate-900 border border-slate-700 rounded-2xl p-6 shadow-2xl">
              <h3 className="text-lg font-bold text-white mb-6">Ringkasan Setup</h3>
              
              <div className="space-y-4 relative">
                <div className="absolute left-[11px] top-2 bottom-2 w-0.5 bg-slate-700"></div>
                
                <div className="flex items-center gap-4 relative z-10">
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold border-2 shrink-0 ${setupData.jenjang ? 'bg-indigo-500 border-indigo-500 text-white' : 'bg-slate-800 border-slate-600 text-slate-500'}`}>1</div>
                  <span className={setupData.jenjang ? 'text-white' : 'text-slate-600'}>{setupData.jenjang || 'Pilih Jenjang'}</span>
                </div>
                
                <div className="flex items-center gap-4 relative z-10">
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold border-2 shrink-0 ${setupData.kelas ? 'bg-indigo-500 border-indigo-500 text-white' : 'bg-slate-800 border-slate-600 text-slate-500'}`}>2</div>
                  <span className={setupData.kelas ? 'text-white' : 'text-slate-600'}>{setupData.kelas ? `Kelas ${setupData.kelas}` : 'Pilih Kelas'}</span>
                </div>
                
                <div className="flex items-center gap-4 relative z-10">
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold border-2 shrink-0 ${setupData.mapel ? 'bg-indigo-500 border-indigo-500 text-white' : 'bg-slate-800 border-slate-600 text-slate-500'}`}>3</div>
                  <span className={`truncate ${setupData.mapel ? 'text-white' : 'text-slate-600'}`}>{setupData.mapel || 'Pilih Mapel'}</span>
                </div>

                <div className="flex items-center gap-4 relative z-10">
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold border-2 shrink-0 ${setupData.materi ? 'bg-indigo-500 border-indigo-500 text-white' : 'bg-slate-800 border-slate-600 text-slate-500'}`}>4</div>
                  <span className={`truncate ${setupData.materi ? 'text-white font-medium' : 'text-slate-600'}`}>{setupData.materi || 'Isi Materi'}</span>
                </div>
              </div>

              <div className="mt-8 pt-6 border-t border-slate-700">
                {isGenerating ? (
                  <div className="text-center space-y-3">
                    <div className="inline-block animate-spin text-indigo-400 mb-2">
                      <Sparkles size={32} />
                    </div>
                    <p className="text-indigo-300 font-medium text-sm animate-pulse">{generationStep}</p>
                    <p className="text-xs text-slate-500">AI sedang menyusun dokumen lengkap...</p>
                  </div>
                ) : (
                  <Button 
                    onClick={handleGenerate}
                    disabled={!setupData.jenjang || !setupData.kelas || !setupData.mapel || !setupData.materi}
                    className="w-full py-4 text-lg shadow-xl shadow-indigo-900/20"
                    icon={<Sparkles size={20} />}
                  >
                    Generate Dokumen
                  </Button>
                )}
              </div>
            </div>
            
            <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-200 text-sm">
              <p className="flex items-start gap-2">
                <span className="mt-0.5 text-amber-400">💡</span>
                <span>Dokumen yang dihasilkan: Modul Ajar, ATP, KKTP, Prota, dan Promes.</span>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Setup;