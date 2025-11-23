import React, { useState } from 'react';
import { GeneratedDocument, DocType } from '../types';
import { FileText, Download, Eye, Search, Calendar, Sparkles } from 'lucide-react';
import { Button } from '../components/Button';
import { useNavigate } from 'react-router-dom';

interface DocumentsProps {
  documents: GeneratedDocument[];
}

const Documents: React.FC<DocumentsProps> = ({ documents }) => {
  const navigate = useNavigate();
  const [selectedDoc, setSelectedDoc] = useState<GeneratedDocument | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  const filteredDocs = documents.filter(doc => 
    doc.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    doc.setupData.mapel.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleDownload = (doc: GeneratedDocument) => {
    // Construct a full HTML document that Word can interpret nicely
    const fullHtml = `
      <html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'>
      <head>
        <meta charset='utf-8'>
        <title>${doc.title}</title>
        <style>
          body { font-family: 'Times New Roman', serif; font-size: 12pt; line-height: 1.5; color: #000; }
          h1, h2, h3, h4 { font-family: Arial, sans-serif; color: #000; font-weight: bold; margin-top: 15px; margin-bottom: 10px; }
          table { border-collapse: collapse; width: 100%; margin: 15px 0; }
          th, td { border: 1px solid #000; padding: 5px 10px; text-align: left; vertical-align: top; }
          th { background-color: #f2f2f2; font-weight: bold; }
          .header { text-align: center; margin-bottom: 30px; border-bottom: 2px solid #000; padding-bottom: 10px; }
          p { margin-bottom: 10px; }
        </style>
      </head>
      <body>
        <div class="header">
          <h2>${doc.title}</h2>
          <p>${doc.setupData.mapel} - Kelas ${doc.setupData.kelas}</p>
          <p>Materi: ${doc.setupData.materi}</p>
        </div>
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

  if (documents.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] animate-fadeIn">
        <div className="w-24 h-24 bg-slate-800 rounded-full flex items-center justify-center mb-6 shadow-inner">
          <FileText size={48} className="text-slate-600" />
        </div>
        <h2 className="text-2xl font-bold text-white mb-2">Belum Ada Dokumen</h2>
        <p className="text-slate-400 text-center max-w-md mb-8">
          Anda belum membuat dokumen administrasi apapun. Mulai dengan setup pembelajaran.
        </p>
        <Button onClick={() => navigate('/setup')} icon={<Sparkles size={18} />}>
          Mulai Generate
        </Button>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col animate-fadeIn">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h2 className="text-3xl font-bold text-white mb-2">Pustaka Dokumen</h2>
          <p className="text-slate-400">Kelola dan unduh dokumen (.doc) yang telah digenerate oleh AI.</p>
        </div>
        
        <div className="relative">
          <input 
            type="text" 
            placeholder="Cari dokumen..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 pr-4 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-indigo-500 w-full md:w-64"
          />
          <Search className="absolute left-3 top-3 text-slate-500" size={18} />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 flex-1 overflow-hidden min-h-0">
        {/* List View */}
        <div className="lg:col-span-1 overflow-y-auto pr-2 space-y-3 custom-scrollbar">
          {filteredDocs.map(doc => (
            <div 
              key={doc.id}
              onClick={() => setSelectedDoc(doc)}
              className={`p-4 rounded-xl border cursor-pointer transition-all group ${
                selectedDoc?.id === doc.id
                ? 'bg-indigo-600 border-indigo-500 shadow-lg shadow-indigo-900/20'
                : 'bg-slate-800/50 border-slate-700/50 hover:bg-slate-800 hover:border-indigo-500/30'
              }`}
            >
              <div className="flex items-start justify-between mb-2">
                <div className={`p-2 rounded-lg ${selectedDoc?.id === doc.id ? 'bg-white/20 text-white' : 'bg-slate-700 text-indigo-400'}`}>
                  <FileText size={20} />
                </div>
                <span className={`text-xs px-2 py-1 rounded-md font-medium ${selectedDoc?.id === doc.id ? 'bg-indigo-800 text-indigo-200' : 'bg-slate-700 text-slate-400'}`}>
                  {doc.type}
                </span>
              </div>
              <h4 className={`font-bold text-sm mb-1 ${selectedDoc?.id === doc.id ? 'text-white' : 'text-slate-200 group-hover:text-white'}`}>
                {doc.setupData.materi}
              </h4>
              <p className={`text-xs flex items-center gap-2 ${selectedDoc?.id === doc.id ? 'text-indigo-200' : 'text-slate-500'}`}>
                <span>Kelas {doc.setupData.kelas}</span>
                <span>•</span>
                <span>{doc.setupData.mapel}</span>
              </p>
            </div>
          ))}
        </div>

        {/* Preview View */}
        <div className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-2xl flex flex-col overflow-hidden h-[600px] lg:h-auto">
          {selectedDoc ? (
            <>
              <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-slate-800/50">
                 <div>
                    <h3 className="font-bold text-white">{selectedDoc.title}</h3>
                    <p className="text-xs text-slate-400 mt-1 flex items-center gap-2">
                      <Calendar size={12} />
                      {new Date(selectedDoc.createdAt).toLocaleDateString('id-ID', { dateStyle: 'full' })}
                    </p>
                 </div>
                 <div className="flex gap-2">
                   <Button variant="secondary" className="px-3 py-2 text-sm" onClick={() => handleDownload(selectedDoc)}>
                     <Download size={16} className="mr-2" /> Download Word
                   </Button>
                 </div>
              </div>
              <div className="flex-1 overflow-y-auto p-8 bg-white custom-scrollbar">
                 {/* Render HTML content securely */}
                 <div 
                   className="prose prose-sm max-w-none text-slate-900 prose-headings:text-slate-900 prose-p:text-slate-800 prose-table:border-collapse prose-th:bg-slate-100 prose-th:p-2 prose-td:p-2 prose-th:border prose-td:border prose-th:border-slate-300 prose-td:border-slate-300"
                   dangerouslySetInnerHTML={{ __html: selectedDoc.content }}
                 />
              </div>
            </>
          ) : (
             <div className="flex-1 flex flex-col items-center justify-center text-slate-500">
               <Eye size={48} className="mb-4 opacity-20" />
               <p>Pilih dokumen untuk melihat preview</p>
             </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Documents;