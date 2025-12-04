import React, { useState } from 'react';
import { Search, Youtube, Loader2 } from 'lucide-react';

interface InputSectionProps {
  onAnalyze: (input: string) => void;
  isLoading: boolean;
}

export const InputSection: React.FC<InputSectionProps> = ({ onAnalyze, isLoading }) => {
  const [input, setInput] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (input.trim()) {
      onAnalyze(input);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[80vh] px-4 animate-fade-in">
      <div className="bg-slate-800/50 p-8 rounded-2xl border border-slate-700 shadow-2xl max-w-2xl w-full backdrop-blur-sm">
        <div className="flex justify-center mb-6">
          <div className="bg-red-600 p-4 rounded-full shadow-lg shadow-red-500/20">
            <Youtube className="w-12 h-12 text-white" />
          </div>
        </div>
        
        <h1 className="text-4xl font-bold text-center mb-4 text-white bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-400">
          TubeGenius AI
        </h1>
        <p className="text-slate-400 text-center mb-8 text-lg">
          Enter a YouTube channel URL or Name. We'll extract their DNA, 
          analyze their style, and write your next viral script.
        </p>

        <form onSubmit={handleSubmit} className="relative">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="e.g. 'MrBeast' or 'youtube.com/@Veritasium'"
            className="w-full bg-slate-900/50 border border-slate-600 text-white rounded-xl py-4 pl-12 pr-4 focus:ring-2 focus:ring-red-500 focus:border-transparent outline-none transition-all text-lg placeholder:text-slate-500"
            disabled={isLoading}
          />
          <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-500 w-5 h-5" />
          
          <button
            type="submit"
            disabled={isLoading || !input.trim()}
            className="absolute right-2 top-2 bottom-2 bg-gradient-to-r from-red-600 to-red-500 hover:from-red-500 hover:to-red-400 text-white px-6 rounded-lg font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                <span>Scanning...</span>
              </>
            ) : (
              <span>Analyze</span>
            )}
          </button>
        </form>

        <div className="mt-6 flex flex-wrap justify-center gap-2">
            <span className="text-xs text-slate-500 uppercase tracking-wider font-semibold">Popular Examples:</span>
            {['MKBHD', 'Ali Abdaal', 'Kurzgesagt', 'Cleo Abram'].map(example => (
                <button 
                    key={example}
                    onClick={() => setInput(example)}
                    className="text-xs bg-slate-700/50 hover:bg-slate-700 text-slate-300 px-3 py-1 rounded-full transition-colors border border-slate-600"
                >
                    {example}
                </button>
            ))}
        </div>
      </div>
    </div>
  );
};
