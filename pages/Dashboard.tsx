import React from 'react';
import { useNavigate } from 'react-router-dom';
import { FileText, CheckCircle2, BookOpen, Clock, ArrowRight, Sparkles, AlertCircle, HelpCircle, ClipboardList } from 'lucide-react';
import { StatCard } from '../components/StatCard';
import { Button } from '../components/Button';
import { GeneratedDocument, SetupData } from '../types';

interface DashboardProps {
  documents: GeneratedDocument[];
  setupData: SetupData;
  bankSoalCount?: number;
  administrasiCount?: number;
}

const Dashboard: React.FC<DashboardProps> = ({ documents, setupData, bankSoalCount = 0, administrasiCount = 0 }) => {
  const navigate = useNavigate();
  const isSetupComplete = setupData.jenjang && setupData.kelas && setupData.mapel && setupData.materi;

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Welcome Section */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold text-white mb-2">Dashboard Overview</h2>
          <p className="text-slate-400">Selamat datang di panel administrasi guru profesional.</p>
        </div>
        <Button onClick={() => navigate('/setup')} icon={<Sparkles size={18} />}>
          Buat Dokumen Baru
        </Button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <StatCard 
          label="Total Dokumen" 
          value={documents.length} 
          icon={<FileText size={24} />} 
          colorClass="bg-indigo-500"
        />
        <StatCard 
          label="Bank Soal" 
          value={bankSoalCount} 
          icon={<HelpCircle size={24} />} 
          colorClass="bg-emerald-500"
        />
        <StatCard 
          label="Administrasi" 
          value={administrasiCount} 
          icon={<ClipboardList size={24} />} 
          colorClass="bg-amber-500"
        />
        <StatCard 
          label="Status Setup" 
          value={isSetupComplete ? "Siap" : "Belum"} 
          icon={isSetupComplete ? <CheckCircle2 size={24} /> : <AlertCircle size={24} />} 
          colorClass={isSetupComplete ? "bg-blue-500" : "bg-slate-500"}
        />
      </div>

      {/* Active Setup Card */}
      <div className="bg-gradient-to-r from-slate-800 to-slate-800/50 border border-slate-700 rounded-2xl p-6 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-full bg-indigo-500/5 skew-x-12 transform translate-x-20"></div>
        
        <div className="flex items-center gap-3 mb-6">
           <div className="p-2 rounded-lg bg-slate-700 text-indigo-400">
             <BookOpen size={20} />
           </div>
           <h3 className="text-lg font-bold text-white">Konteks Pembelajaran Aktif</h3>
        </div>

        {isSetupComplete ? (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 relative z-10">
            <div className="space-y-1">
              <p className="text-xs text-slate-500 uppercase tracking-wider font-semibold">Jenjang</p>
              <p className="text-lg font-bold text-white">{setupData.jenjang}</p>
            </div>
            <div className="space-y-1">
              <p className="text-xs text-slate-500 uppercase tracking-wider font-semibold">Kelas</p>
              <p className="text-lg font-bold text-white">{setupData.kelas}</p>
            </div>
            <div className="space-y-1">
              <p className="text-xs text-slate-500 uppercase tracking-wider font-semibold">Mapel</p>
              <p className="text-lg font-bold text-white truncate">{setupData.mapel}</p>
            </div>
            <div className="space-y-1">
              <p className="text-xs text-slate-500 uppercase tracking-wider font-semibold">Materi</p>
              <p className="text-lg font-bold text-amber-400 truncate">{setupData.materi}</p>
            </div>
          </div>
        ) : (
          <div className="text-center py-8">
            <div className="inline-flex p-3 rounded-full bg-slate-700/50 text-slate-400 mb-3">
               <AlertCircle size={24} />
            </div>
            <p className="text-slate-300 font-medium mb-1">Data pembelajaran belum lengkap</p>
            <p className="text-sm text-slate-500 mb-4">Lengkapi data di menu Setup untuk mulai generate.</p>
            <Button variant="secondary" onClick={() => navigate('/setup')} className="text-sm">
              Lengkapi Data <ArrowRight size={14} className="ml-2" />
            </Button>
          </div>
        )}
      </div>

      {/* Recent Documents List */}
      <div className="bg-slate-800/30 border border-slate-700/50 rounded-2xl p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-bold text-white">Dokumen Terbaru</h3>
          <button onClick={() => navigate('/documents')} className="text-sm text-indigo-400 hover:text-indigo-300 font-medium">
            Lihat Semua
          </button>
        </div>

        <div className="space-y-3">
          {documents.length > 0 ? documents.slice(0, 4).map((doc) => (
            <div key={doc.id} className="group flex items-center justify-between p-4 rounded-xl bg-slate-800/50 border border-slate-700/50 hover:border-indigo-500/30 hover:bg-slate-800 transition-all cursor-pointer">
               <div className="flex items-center gap-4">
                 <div className="p-2.5 rounded-lg bg-indigo-500/10 text-indigo-400 group-hover:bg-indigo-500 group-hover:text-white transition-colors">
                   <FileText size={20} />
                 </div>
                 <div>
                   <h4 className="text-white font-semibold text-sm">{doc.title}</h4>
                   <div className="flex items-center gap-2 text-xs text-slate-400 mt-0.5">
                      <span>{doc.setupData.mapel}</span>
                      <span className="w-1 h-1 rounded-full bg-slate-600"></span>
                      <span className="flex items-center gap-1"><Clock size={10} /> Baru saja</span>
                   </div>
                 </div>
               </div>
               <div className="px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 text-xs font-semibold border border-emerald-500/20">
                 Selesai
               </div>
            </div>
          )) : (
            <div className="text-center py-12 border-2 border-dashed border-slate-700/50 rounded-xl">
              <p className="text-slate-500 text-sm">Belum ada dokumen yang dibuat.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;