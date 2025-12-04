import React from 'react';
import { GeneratedScript, ScriptSection } from '../types';
import { Download, Copy, ArrowLeft, FileText, Check } from 'lucide-react';

interface ScriptViewProps {
  script: GeneratedScript;
  onBack: () => void;
}

export const ScriptView: React.FC<ScriptViewProps> = ({ script, onBack }) => {
  const [copied, setCopied] = React.useState(false);

  // Safe accessor
  const sections = script?.sections || [];

  const handleCopy = () => {
    const text = sections.map(s => `[${s.heading} - ${s.duration || '0:00'}]\n${s.content}`).join('\n\n');
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const text = sections.map(s => `### ${s.heading} (${s.duration || ''})\n\n**Visual:** ${s.visualCue || 'None'}\n\n${s.content}`).join('\n\n');
    const blob = new Blob([text], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${script.title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}_script.md`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 animate-slide-up h-[calc(100vh-80px)] flex flex-col">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4 shrink-0">
        <div>
            <button onClick={onBack} className="text-slate-400 hover:text-white flex items-center gap-2 text-sm mb-2 transition-colors">
                <ArrowLeft className="w-4 h-4" /> Back to Ideas
            </button>
            <h2 className="text-2xl font-bold text-white line-clamp-1">{script.title}</h2>
            <p className="text-slate-500 text-sm">Est. Duration: {script.totalEstimatedDuration}</p>
        </div>
        
        <div className="flex gap-2">
            <button 
                onClick={handleCopy}
                className="bg-slate-800 hover:bg-slate-700 text-white px-4 py-2 rounded-lg border border-slate-600 flex items-center gap-2 text-sm transition-all"
            >
                {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                {copied ? 'Copied' : 'Copy'}
            </button>
            <button 
                onClick={handleDownload}
                className="bg-red-600 hover:bg-red-500 text-white px-4 py-2 rounded-lg font-medium flex items-center gap-2 text-sm transition-all shadow-lg shadow-red-900/20"
            >
                <Download className="w-4 h-4" /> Export
            </button>
        </div>
      </div>

      {/* Script Content */}
      <div className="flex-1 bg-white text-slate-900 rounded-xl shadow-2xl overflow-hidden flex flex-col">
        <div className="bg-slate-50 border-b border-slate-200 px-6 py-3 flex items-center gap-2">
            <div className="flex gap-1.5">
                <div className="w-3 h-3 rounded-full bg-red-400"></div>
                <div className="w-3 h-3 rounded-full bg-yellow-400"></div>
                <div className="w-3 h-3 rounded-full bg-green-400"></div>
            </div>
            <span className="ml-4 text-xs font-mono text-slate-400 uppercase tracking-widest">Script Editor Mode</span>
        </div>
        
        <div className="flex-1 overflow-y-auto p-8 font-serif leading-relaxed text-lg">
            {sections.map((section, idx) => (
                <div key={idx} className="mb-8 group">
                    <div className="flex items-center justify-between mb-2 border-b border-slate-100 pb-1">
                        <span className="text-sm font-sans font-bold text-slate-400 uppercase tracking-wider">
                            {section.heading}
                        </span>
                        <span className="text-xs font-mono text-slate-400 bg-slate-100 px-2 py-0.5 rounded">
                            {section.duration}
                        </span>
                    </div>
                    
                    {section.visualCue && (
                        <div className="bg-blue-50 text-blue-800 px-4 py-2 rounded-lg text-sm mb-3 font-sans border-l-4 border-blue-400 italic">
                            <span className="font-bold not-italic mr-2">[VISUAL]</span> {section.visualCue}
                        </div>
                    )}
                    
                    <p className="whitespace-pre-wrap">{section.content}</p>
                </div>
            ))}
            <div className="h-20 flex items-center justify-center text-slate-300 text-sm italic">
                --- End of Script ---
            </div>
        </div>
      </div>

    </div>
  );
};