
import * as React from 'react';
import { useState } from 'react';
import { VideoIdea } from '../types';
import { PlayCircle, TrendingUp, Sparkles, Loader2, PenTool, Plus, Save, Clock, Settings, ArrowRight } from 'lucide-react';

interface IdeaSelectionProps {
  ideas: VideoIdea[];
  onSelect: (idea: VideoIdea) => void;
  isWriting: boolean;
  selectedId: string | null;
  scriptLength: string;
  setScriptLength: (len: string) => void;
  onSaveProject: () => void;
}

export const IdeaSelection: React.FC<IdeaSelectionProps> = ({ 
    ideas, 
    onSelect, 
    isWriting, 
    selectedId,
    scriptLength,
    setScriptLength,
    onSaveProject
}) => {
  const [customTitle, setCustomTitle] = useState('');
  const [showSaveConfirm, setShowSaveConfirm] = useState(false);

  const handleCustomSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (customTitle.trim() && !isWriting) {
      onSelect({
        id: `custom-${Date.now()}`,
        title: customTitle,
        hook: 'Custom User Idea',
        predictedCTR: 'N/A',
        reasoning: 'User generated concept'
      });
    }
  };

  const handleSaveClick = () => {
    onSaveProject();
    setShowSaveConfirm(true);
    setTimeout(() => setShowSaveConfirm(false), 2000);
  };

  const LENGTH_OPTIONS = [
    { label: 'Short (Shorts/TikTok)', value: 'Short (approx 150-300 words, under 60s)' },
    { label: 'Standard (5-8 mins)', value: 'Standard (approx 800-1200 words)' },
    { label: 'Long Form (10+ mins)', value: 'Long (approx 1500-2000 words)' },
    { label: 'Deep Dive (20+ mins)', value: 'Extensive (approx 3000+ words)' },
  ];

  return (
    <div className="max-w-7xl mx-auto px-6 py-12 animate-fade-in pb-24">
       {/* Toolbar */}
       <div className="flex flex-col md:flex-row justify-between items-center mb-12 gap-6 glass-panel p-4 rounded-2xl sticky top-24 z-30 backdrop-blur-xl border-white/10">
         <div className="flex items-center gap-4 w-full md:w-auto">
            <div className="flex items-center gap-2 text-slate-400 text-xs font-bold uppercase tracking-wider shrink-0">
                <Settings className="w-4 h-4" /> Script Config:
            </div>
            <div className="relative flex-grow md:flex-grow-0">
                <select 
                    value={scriptLength}
                    onChange={(e) => setScriptLength(e.target.value)}
                    className="w-full md:w-64 bg-black/40 border border-white/10 text-white text-sm rounded-lg pl-3 pr-8 py-2.5 outline-none focus:border-red-500 transition-colors appearance-none"
                    disabled={isWriting}
                >
                    {LENGTH_OPTIONS.map((opt) => (
                        <option key={opt.value} value={opt.value} className="bg-slate-900">{opt.label}</option>
                    ))}
                </select>
                <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-slate-500">
                    <Clock className="w-3.5 h-3.5" />
                </div>
            </div>
         </div>

         <button 
            onClick={handleSaveClick}
            className={`w-full md:w-auto flex items-center justify-center gap-2 px-6 py-2.5 rounded-lg font-semibold text-sm transition-all border ${
                showSaveConfirm 
                ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/50' 
                : 'bg-white/5 hover:bg-white/10 text-white border-white/10'
            }`}
         >
            {showSaveConfirm ? <Settings className="w-4 h-4" /> : <Save className="w-4 h-4" />}
            {showSaveConfirm ? 'Project Saved' : 'Save Style & Ideas'}
         </button>
       </div>

       <div className="text-center mb-16">
         <h2 className="text-5xl font-heading font-bold text-white mb-6 tracking-tight">Viral <span className="text-gradient-red">Concepts</span></h2>
         <p className="text-slate-400 text-lg max-w-2xl mx-auto font-light">
            AI has analyzed the competitive landscape. Select a high-performing title below to generate your script instantly.
         </p>
       </div>

       {/* Custom Title Input */}
       <div className="max-w-3xl mx-auto mb-20 relative z-20 group">
          <div className="absolute -inset-1 bg-gradient-to-r from-red-600 via-purple-600 to-blue-600 rounded-2xl blur opacity-20 group-hover:opacity-40 transition duration-1000 group-hover:duration-200"></div>
          <div className="relative bg-black rounded-2xl border border-white/10 shadow-2xl p-2 flex flex-col sm:flex-row gap-2">
                <div className="flex-1 relative">
                    <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none">
                        <PenTool className="h-5 w-5 text-slate-500" />
                    </div>
                    <input 
                        type="text"
                        value={customTitle}
                        onChange={(e) => setCustomTitle(e.target.value)}
                        placeholder="Or type your own custom title here..."
                        className="w-full h-14 bg-transparent text-white rounded-xl pl-14 pr-4 focus:outline-none text-lg font-medium placeholder:text-slate-600"
                        disabled={isWriting}
                    />
                </div>
                <button 
                    type="submit"
                    onClick={handleCustomSubmit}
                    disabled={!customTitle.trim() || isWriting}
                    className="h-14 bg-white text-black hover:bg-slate-200 px-8 rounded-xl font-bold flex items-center justify-center gap-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shrink-0"
                >
                    {isWriting && selectedId?.startsWith('custom') ? (
                        <Loader2 className="w-5 h-5 animate-spin" />
                    ) : (
                        <>Create <ArrowRight className="w-5 h-5" /></>
                    )}
                </button>
          </div>
       </div>

       {/* AI Ideas Grid */}
       <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
         {ideas.map((idea, index) => {
            const isSelected = selectedId === idea.id;
            return (
                <div 
                    key={idea.id}
                    onClick={() => !isWriting && onSelect(idea)}
                    style={{ animationDelay: `${index * 100}ms` }}
                    className={`
                        glass-panel p-8 rounded-3xl cursor-pointer group relative overflow-hidden transition-all duration-300 hover:-translate-y-2 animate-slide-up flex flex-col h-full
                        ${isSelected ? 'ring-2 ring-red-500 bg-red-900/10' : 'hover:border-white/20 hover:bg-white/5'}
                        ${isWriting && !isSelected ? 'opacity-30 pointer-events-none grayscale' : ''}
                    `}
                >
                    {/* Hover Glow */}
                    <div className="absolute top-0 right-0 w-32 h-32 bg-red-500/10 rounded-full blur-3xl -mr-16 -mt-16 transition-opacity opacity-0 group-hover:opacity-100"></div>

                    <div className="flex justify-between items-start mb-6 relative z-10">
                        <div className="bg-black/40 backdrop-blur-md px-3 py-1.5 rounded-full text-xs font-mono font-bold text-emerald-400 border border-white/5 flex items-center gap-2">
                            <TrendingUp className="w-3 h-3" /> 
                            {idea.predictedCTR} CTR
                        </div>
                        {isSelected && isWriting && (
                            <div className="flex items-center gap-2 text-red-400 text-xs font-bold animate-pulse">
                                <Loader2 className="w-3 h-3 animate-spin" /> WRITING...
                            </div>
                        )}
                    </div>

                    <h3 className="text-xl font-bold text-white mb-4 group-hover:text-red-400 transition-colors leading-tight relative z-10 font-heading">
                        {idea.title}
                    </h3>
                    
                    <div className="mb-6 flex-grow relative z-10">
                        <p className="text-sm text-slate-400 line-clamp-3 leading-relaxed font-light">
                            <span className="text-slate-600 font-bold uppercase text-[10px] tracking-widest block mb-2">Hook Strategy</span>
                            {idea.hook}
                        </p>
                    </div>
                    
                    <div className="mt-auto pt-5 border-t border-white/5 relative z-10">
                        <div className="text-xs text-slate-500 flex items-start gap-2">
                            <Sparkles className="w-3.5 h-3.5 text-yellow-500 shrink-0 mt-0.5" /> 
                            <span className="opacity-70">{idea.reasoning}</span>
                        </div>
                    </div>
                </div>
            );
         })}
       </div>
    </div>
  );
};
