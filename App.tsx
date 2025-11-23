import React, { useState } from 'react';
import { HashRouter as Router, Routes, Route, NavLink, useLocation } from 'react-router-dom';
import { LayoutDashboard, Settings, FileText, Sparkles, ArrowRight, Menu, X, HelpCircle, ClipboardList } from 'lucide-react';
import { SetupData, GeneratedDocument, DocType } from './types';
import Dashboard from './pages/Dashboard';
import Setup from './pages/Setup';
import Documents from './pages/Documents';
import BankSoal from './pages/BankSoal';
import Administrasi from './pages/Administrasi';

// --- Layout Component ---
const SidebarItem = ({ to, icon: Icon, label }: { to: string, icon: any, label: string }) => {
  const location = useLocation();
  const isActive = location.pathname === to;

  return (
    <NavLink 
      to={to}
      className={`flex items-center gap-3 px-4 py-3.5 rounded-xl transition-all duration-200 group ${
        isActive 
        ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-900/20' 
        : 'text-slate-400 hover:bg-slate-800/50 hover:text-slate-100'
      }`}
    >
      <Icon size={20} className={`${isActive ? 'text-white' : 'text-slate-500 group-hover:text-slate-300'}`} />
      <span className="font-semibold text-sm">{label}</span>
      {isActive && <div className="ml-auto w-1.5 h-1.5 rounded-full bg-white animate-pulse" />}
    </NavLink>
  );
};

const AppLayout = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  
  // Global State
  const [setupData, setSetupData] = useState<SetupData>({
    jenjang: '',
    kelas: '',
    mapel: '',
    materi: ''
  });
  
  const [documents, setDocuments] = useState<GeneratedDocument[]>([]);

  const addDocuments = (newDocs: GeneratedDocument[]) => {
    setDocuments(prev => [...newDocs, ...prev]);
  };

  const bankSoalDocs = documents.filter(d => d.type.toString().startsWith('Bank Soal'));
  const adminDocs = documents.filter(d => d.type.toString().startsWith('Administrasi'));

  return (
    <div className="flex h-screen bg-slate-900 overflow-hidden selection:bg-indigo-500/30">
      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-slate-950/80 z-40 md:hidden backdrop-blur-sm"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`
        fixed inset-y-0 left-0 z-50 w-72 bg-slate-900 border-r border-slate-800 transform transition-transform duration-300 ease-out
        md:relative md:translate-x-0
        ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="h-20 flex items-center px-6 border-b border-slate-800/50">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-indigo-600 rounded-lg shadow-lg shadow-indigo-500/20">
                <Sparkles size={24} className="text-white" />
              </div>
              <div>
                <h1 className="font-bold text-lg text-white tracking-tight">Kurikulum AI</h1>
                <p className="text-xs text-slate-400 font-medium">Generator Merdeka</p>
              </div>
            </div>
            <button 
              onClick={() => setIsMobileMenuOpen(false)} 
              className="md:hidden ml-auto text-slate-400"
            >
              <X size={24} />
            </button>
          </div>

          {/* Nav */}
          <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto custom-scrollbar">
            <SidebarItem to="/" icon={LayoutDashboard} label="Dashboard" />
            <SidebarItem to="/setup" icon={Settings} label="Setup Pembelajaran" />
            <SidebarItem to="/documents" icon={FileText} label="Dokumen Saya" />
            <SidebarItem to="/bank-soal" icon={HelpCircle} label="Bank Soal" />
            <SidebarItem to="/administrasi" icon={ClipboardList} label="Administrasi" />
            
            <div className="mt-8 px-4">
               <div className="p-4 rounded-2xl bg-gradient-to-br from-slate-800 to-slate-900 border border-slate-700 relative overflow-hidden">
                 <div className="absolute -top-2 -right-2 w-16 h-16 bg-indigo-500/20 rounded-full blur-2xl"></div>
                 <h4 className="font-bold text-white mb-1 relative z-10">Butuh Bantuan?</h4>
                 <p className="text-xs text-slate-400 mb-3 relative z-10">Panduan penggunaan generator.</p>
                 <button className="text-xs font-semibold text-indigo-400 hover:text-indigo-300 flex items-center gap-1">
                   Lihat Panduan <ArrowRight size={12} />
                 </button>
               </div>
            </div>
          </nav>

          {/* Footer */}
          <div className="p-6 border-t border-slate-800/50">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-amber-500 flex items-center justify-center text-slate-900 font-bold text-xs">
                TG
              </div>
              <div className="overflow-hidden">
                <p className="text-sm font-semibold text-white truncate">Teacher Guru</p>
                <p className="text-xs text-emerald-400 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                  Online
                </p>
              </div>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col h-full overflow-hidden bg-[#0F172A] relative">
        <div className="absolute top-0 left-0 right-0 h-96 bg-indigo-600/5 blur-[120px] pointer-events-none"></div>
        
        {/* Mobile Header */}
        <div className="md:hidden h-16 flex items-center px-4 border-b border-slate-800 bg-slate-900/80 backdrop-blur-xl z-30 sticky top-0">
           <button onClick={() => setIsMobileMenuOpen(true)} className="text-slate-400 mr-4">
             <Menu size={24} />
           </button>
           <h1 className="font-bold text-white">Generator KM</h1>
        </div>

        <div className="flex-1 overflow-y-auto p-4 md:p-8 scroll-smooth">
          <div className="max-w-6xl mx-auto h-full">
            <Routes>
              <Route path="/" element={
                <Dashboard 
                  documents={documents} 
                  setupData={setupData} 
                  bankSoalCount={bankSoalDocs.length}
                  administrasiCount={adminDocs.length}
                />
              } />
              <Route path="/setup" element={<Setup setupData={setupData} setSetupData={setSetupData} addDocuments={addDocuments} />} />
              <Route path="/documents" element={<Documents documents={documents} />} />
              <Route path="/bank-soal" element={<BankSoal setupData={setupData} addDocuments={addDocuments} documents={documents} />} />
              <Route path="/administrasi" element={<Administrasi setupData={setupData} addDocuments={addDocuments} documents={documents} />} />
            </Routes>
          </div>
        </div>
      </main>
    </div>
  );
};

const App = () => {
  return (
    <Router>
      <AppLayout />
    </Router>
  );
};

export default App;
