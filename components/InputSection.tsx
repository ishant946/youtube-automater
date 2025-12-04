import React, { useState } from 'react';
import { Search, Youtube, Loader2, FileText, PenTool } from 'lucide-react';

interface InputSectionProps {
  onAnalyze: (input: string) => void;
  onCreateScript: (topic: string, transcript: string) => void;
  isLoading: boolean;
}

export const InputSection: React.FC<InputSectionProps> = ({ onAnalyze, onCreateScript, isLoading }) => {
  const [activeTab, setActiveTab] = useState<'analyze' | 'create'>('analyze');
  
  // Analyze State
  const [input, setInput] = useState('');

  // Create Script State
  const [topic, setTopic] = useState('');
  const [transcript, setTranscript] = useState('');

  const handleAnalyzeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (input.trim()) {
      onAnalyze(input);
    }
  };

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (topic.trim() && transcript.trim()) {
      onCreateScript(topic, transcript);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[80vh] px-4 animate-fade-in">
      <div className="bg-slate-800/50 p-8 rounded-2xl border border-slate-700 shadow-2xl max-w-2xl w-full backdrop-blur-sm">
        
        {/* Header Icon */}
        <div className="flex justify-center mb-6">
          <div className="bg-gradient-to-br from-red-600 to-red-500 p-4 rounded-full shadow-lg shadow-red-500/20">
            {activeTab === 'analyze' ? (
                 <Youtube className="w-10 h-10 text-white" />
            ) : (
                 <FileText className="w-10 h-10 text-white" />
            )}
          </div>
        </div>
        
        <h1 className="text-4xl font-bold text-center mb-2 text-white bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-400">
          TubeGenius AI
        </h1>
        <p className="text-slate-400 text-center mb-8 text-lg">
          {activeTab === 'analyze' 
            ? "Analyze any YouTube channel to extract its DNA and generate viral scripts."
            : "Instantly create a script and voice-over using your own reference text."
          }
        </p>

        {/* Tabs */}
        <div className="flex bg-slate-900/50 p-1 rounded-xl mb-8 border border-slate-700">
            <button 
                onClick={() => setActiveTab('analyze')}
                className={`flex-1 py-2 text-sm font-medium rounded-lg transition-all flex items-center justify-center gap-2 ${
                    activeTab === 'analyze' 
                    ? 'bg-slate-700 text-white shadow-md' 
                    : 'text-slate-400 hover:text-white'
                }`}
            >
                <Youtube className="w-4 h-4" /> Analyze Channel
            </button>
            <button 
                onClick={() => setActiveTab('create')}
                className={`flex-1 py-2 text-sm font-medium rounded-lg transition-all flex items-center justify-center gap-2 ${
                    activeTab === 'create' 
                    ? 'bg-slate-700 text-white shadow-md' 
                    : 'text-slate-400 hover:text-white'
                }`}
            >
                <PenTool className="w-4 h-4" /> Instant Script
            </button>
        </div>

        {/* Tab Content */}
        {activeTab === 'analyze' ? (
            <form onSubmit={handleAnalyzeSubmit} className="space-y-6">
                <div className="flex flex-col sm:flex-row gap-3">
                    <div className="relative flex-grow">
                        <input
                            type="text"
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            placeholder="e.g. 'MrBeast' or 'youtube.com/@Veritasium'"
                            className="w-full h-14 bg-slate-900/50 border border-slate-600 text-white rounded-xl pl-12 pr-4 focus:ring-2 focus:ring-red-500 focus:border-transparent outline-none transition-all text-lg placeholder:text-slate-500"
                            disabled={isLoading}
                        />
                        <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-500 w-5 h-5" />
                    </div>
                    
                    <button
                        type="submit"
                        disabled={isLoading || !input.trim()}
                        className="h-14 bg-gradient-to-r from-red-600 to-red-500 hover:from-red-500 hover:to-red-400 text-white px-8 rounded-xl font-bold transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg shadow-red-900/20 shrink-0 min-w-[140px]"
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
                </div>

                <div className="flex flex-wrap justify-center gap-2">
                    <span className="text-xs text-slate-500 uppercase tracking-wider font-semibold self-center mr-1">Popular:</span>
                    {['MKBHD', 'Ali Abdaal', 'Kurzgesagt', 'Cleo Abram'].map(example => (
                        <button 
                            key={example}
                            type="button"
                            onClick={() => setInput(example)}
                            className="text-xs bg-slate-700/50 hover:bg-slate-700 text-slate-300 px-3 py-1.5 rounded-lg transition-colors border border-slate-600 font-medium"
                        >
                            {example}
                        </button>
                    ))}
                </div>
            </form>
        ) : (
            <form onSubmit={handleCreateSubmit} className="space-y-4">
                <div>
                    <label className="block text-xs font-bold text-slate-400 uppercase mb-1.5 ml-1">Video Topic</label>
                    <input
                        type="text"
                        value={topic}
                        onChange={(e) => setTopic(e.target.value)}
                        placeholder="e.g. The Future of AI in Medicine"
                        className="w-full bg-slate-900/50 border border-slate-600 text-white rounded-xl px-4 py-3 focus:ring-2 focus:ring-red-500 focus:border-transparent outline-none transition-all placeholder:text-slate-600"
                        disabled={isLoading}
                    />
                </div>
                <div>
                    <label className="block text-xs font-bold text-slate-400 uppercase mb-1.5 ml-1">Reference Style / Transcript</label>
                    <textarea
                        value={transcript}
                        onChange={(e) => setTranscript(e.target.value)}
                        placeholder="Paste a transcript, article, or writing sample here. The AI will mimic this style."
                        className="w-full h-32 bg-slate-900/50 border border-slate-600 text-white rounded-xl px-4 py-3 focus:ring-2 focus:ring-red-500 focus:border-transparent outline-none transition-all placeholder:text-slate-600 resize-none text-sm"
                        disabled={isLoading}
                    />
                </div>

                <button
                    type="submit"
                    disabled={isLoading || !topic.trim() || !transcript.trim()}
                    className="w-full bg-gradient-to-r from-red-600 to-red-500 hover:from-red-500 hover:to-red-400 text-white py-3.5 rounded-xl font-bold transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg shadow-red-900/20"
                >
                    {isLoading ? (
                    <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        <span>Generating Script...</span>
                    </>
                    ) : (
                    <span>Create Script & Voice Over</span>
                    )}
                </button>
            </form>
        )}

      </div>
    </div>
  );
};