import React, { useState } from 'react';
import { VideoIdea } from '../types';
import { PlayCircle, TrendingUp, Sparkles, Loader2, PenTool, Plus } from 'lucide-react';

interface IdeaSelectionProps {
  ideas: VideoIdea[];
  onSelect: (idea: VideoIdea) => void;
  isWriting: boolean;
  selectedId: string | null;
}

export const IdeaSelection: React.FC<IdeaSelectionProps> = ({ ideas, onSelect, isWriting, selectedId }) => {
  const [customTitle, setCustomTitle] = useState('');

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

  return (
    <div className="max-w-7xl mx-auto px-4 py-12 animate-fade-in">
       <div className="text-center mb-12">
         <h2 className="text-4xl font-bold text-white mb-4">Viral Concepts</h2>
         <p className="text-slate-400 text-lg max-w-2xl mx-auto">
            Select a generated viral concept below to start writing, or input your own idea.
         </p>
       </div>

       {/* Custom Title Input - Sleek Bar Design */}
       <div className="max-w-3xl mx-auto mb-16 relative z-10">
          <div className="bg-slate-800/80 p-2 rounded-2xl border border-slate-700 shadow-2xl backdrop-blur-xl">
            <form onSubmit={handleCustomSubmit} className="flex flex-col sm:flex-row gap-2">
                <div className="flex-1 relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                        <PenTool className="h-5 w-5 text-slate-500" />
                    </div>
                    <input 
                        type="text"
                        value={customTitle}
                        onChange={(e) => setCustomTitle(e.target.value)}
                        placeholder="Type your own custom video title..."
                        className="w-full h-14 bg-slate-900/50 border border-slate-600/30 text-white rounded-xl pl-12 pr-4 focus:ring-2 focus:ring-red-500 focus:border-transparent outline-none transition-all placeholder:text-slate-500 text-lg"
                        disabled={isWriting}
                    />
                </div>
                <button 
                    type="submit"
                    disabled={!customTitle.trim() || isWriting}
                    className="h-14 bg-white text-slate-900 hover:bg-slate-100 px-8 rounded-xl font-bold flex items-center justify-center gap-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl shrink-0"
                >
                    {isWriting && selectedId?.startsWith('custom') ? (
                        <Loader2 className="w-5 h-5 animate-spin" />
                    ) : (
                        <Plus className="w-5 h-5" />
                    )}
                    Create
                </button>
            </form>
          </div>
          <p className="text-center text-slate-600 text-sm mt-3 font-medium">
              Start writing immediately with a custom topic
          </p>
       </div>

       {/* AI Ideas Grid */}
       <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
         {ideas.map((idea) => {
            const isSelected = selectedId === idea.id;
            return (
                <div 
                    key={idea.id}
                    onClick={() => !isWriting && onSelect(idea)}
                    className={`
                        group relative p-6 rounded-2xl border transition-all cursor-pointer overflow-hidden flex flex-col h-full
                        ${isSelected 
                            ? 'bg-red-900/20 border-red-500 ring-1 ring-red-500 transform scale-[1.02]' 
                            : 'bg-slate-800/40 border-slate-700/50 hover:border-slate-500 hover:bg-slate-800/80 hover:-translate-y-1 hover:shadow-2xl'}
                        ${isWriting && !isSelected ? 'opacity-40 pointer-events-none grayscale' : ''}
                    `}
                >
                    <div className="flex justify-between items-start mb-4">
                        <div className="bg-slate-900/80 px-3 py-1.5 rounded-lg text-xs font-mono text-emerald-400 flex items-center gap-1.5 border border-slate-700/50 shadow-sm">
                            <TrendingUp className="w-3.5 h-3.5" /> 
                            <span>CTR: {idea.predictedCTR}</span>
                        </div>
                        {isSelected && isWriting && (
                            <div className="flex items-center gap-2 text-red-400 text-sm animate-pulse font-bold bg-red-400/10 px-2 py-1 rounded">
                                <Loader2 className="w-3.5 h-3.5 animate-spin" /> Writing...
                            </div>
                        )}
                    </div>

                    <h3 className="text-xl font-bold text-white mb-3 group-hover:text-red-400 transition-colors leading-tight">
                        {idea.title}
                    </h3>
                    
                    <div className="mb-4 flex-grow">
                        <p className="text-sm text-slate-400 line-clamp-3 leading-relaxed">
                            <span className="text-slate-500 font-semibold uppercase text-xs tracking-wider block mb-1">Hook Strategy</span>
                            {idea.hook}
                        </p>
                    </div>
                    
                    <div className="mt-auto pt-4 border-t border-slate-700/50">
                        <div className="text-xs text-slate-500 flex items-start gap-2">
                            <Sparkles className="w-3.5 h-3.5 text-yellow-500 shrink-0 mt-0.5" /> 
                            <span className="italic opacity-80">{idea.reasoning}</span>
                        </div>
                    </div>

                    <div className="absolute bottom-4 right-4 opacity-0 group-hover:opacity-100 transition-all transform translate-y-2 group-hover:translate-y-0 duration-300">
                         <PlayCircle className="w-10 h-10 text-red-500 drop-shadow-lg bg-slate-900 rounded-full" />
                    </div>
                </div>
            );
         })}
       </div>
    </div>
  );
};