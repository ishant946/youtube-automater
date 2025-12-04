import React from 'react';
import { VideoIdea } from '../types';
import { PlayCircle, TrendingUp, Sparkles, Loader2 } from 'lucide-react';

interface IdeaSelectionProps {
  ideas: VideoIdea[];
  onSelect: (idea: VideoIdea) => void;
  isWriting: boolean;
  selectedId: string | null;
}

export const IdeaSelection: React.FC<IdeaSelectionProps> = ({ ideas, onSelect, isWriting, selectedId }) => {
  return (
    <div className="max-w-7xl mx-auto px-4 py-8 animate-fade-in">
       <div className="mb-8">
         <h2 className="text-3xl font-bold text-white mb-2">Viral Concepts</h2>
         <p className="text-slate-400">Select a title to generate the full script.</p>
       </div>

       <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
         {ideas.map((idea) => {
            const isSelected = selectedId === idea.id;
            return (
                <div 
                    key={idea.id}
                    onClick={() => !isWriting && onSelect(idea)}
                    className={`
                        group relative p-6 rounded-2xl border transition-all cursor-pointer overflow-hidden
                        ${isSelected 
                            ? 'bg-red-900/20 border-red-500 ring-1 ring-red-500' 
                            : 'bg-slate-800/50 border-slate-700 hover:border-slate-500 hover:bg-slate-800'}
                        ${isWriting && !isSelected ? 'opacity-50 pointer-events-none' : ''}
                    `}
                >
                    <div className="flex justify-between items-start mb-4">
                        <div className="bg-slate-900/80 px-3 py-1 rounded text-xs font-mono text-emerald-400 flex items-center gap-1">
                            <TrendingUp className="w-3 h-3" /> CTR: {idea.predictedCTR}
                        </div>
                        {isSelected && isWriting && (
                            <div className="flex items-center gap-2 text-red-400 text-sm animate-pulse font-semibold">
                                <Loader2 className="w-4 h-4 animate-spin" /> Writing Script...
                            </div>
                        )}
                    </div>

                    <h3 className="text-xl font-bold text-white mb-3 group-hover:text-red-400 transition-colors">
                        {idea.title}
                    </h3>
                    
                    <p className="text-sm text-slate-400 mb-4 line-clamp-2">
                        <span className="text-slate-500 font-semibold">Hook:</span> {idea.hook}
                    </p>
                    
                    <div className="text-xs text-slate-500 bg-slate-900/50 p-3 rounded-lg border border-slate-800">
                        <span className="text-slate-400 font-semibold flex items-center gap-1 mb-1">
                            <Sparkles className="w-3 h-3 text-yellow-500" /> Why it works:
                        </span>
                        {idea.reasoning}
                    </div>

                    <div className="absolute bottom-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
                         <PlayCircle className="w-8 h-8 text-red-500" />
                    </div>
                </div>
            );
         })}
       </div>
    </div>
  );
};
