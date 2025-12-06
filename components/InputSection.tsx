
import * as React from 'react';
import { useState } from 'react';
import { Search, Youtube, Loader2, FileText, PenTool, History, ChevronRight, Trash2, Scale, Mic } from 'lucide-react';
import { SavedProject } from '../types';

interface InputSectionProps {
  onAnalyze: (input: string) => void;
  onCreateScript: (topic: string, transcript: string, matchLength: boolean) => void;
  onOpenStudio: (title: string, script: string) => void;
  onLoadProject: (project: SavedProject) => void;
  savedProjects: SavedProject[];
  onDeleteProject: (id: string) => void;
  isLoading: boolean;
}

export const InputSection: React.FC<InputSectionProps> = ({ 
    onAnalyze, 
    onCreateScript, 
    onOpenStudio,
    onLoadProject,
    savedProjects,
    onDeleteProject,
    isLoading 
}) => {
  const [activeTab, setActiveTab] = useState<'analyze' | 'create' | 'voice'>('analyze');
  
  // Analyze State
  const [input, setInput] = useState('');

  // Create Script State
  const [topic, setTopic] = useState('');
  const [transcript, setTranscript] = useState('');
  const [matchLength, setMatchLength] = useState(false);

  // Text to Audio State
  const [voiceTitle, setVoiceTitle] = useState('');
  const [voiceScript, setVoiceScript] = useState('');

  const handleAnalyzeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (input.trim()) {
      onAnalyze(input);
    }
  };

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (topic.trim() && transcript.trim()) {
      onCreateScript(topic, transcript, matchLength);
    }
  };

  const handleVoiceSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (voiceTitle.trim() && voiceScript.trim()) {
        onOpenStudio(voiceTitle, voiceScript);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[80vh] px-4 animate-fade-in py-12">
      <div className="bg-slate-800/50 p-8 rounded-2xl border border-slate-700 shadow-2xl max-w-2xl w-full backdrop-blur-sm z-10">
        
        {/* Header Icon */}
        <div className="flex justify-center mb-6">
          <div className="bg-gradient-to-br from-red-600 to-red-500 p-4 rounded-full shadow-lg shadow-red-500/20">
            {activeTab === 'analyze' && <Youtube className="w-10 h-10 text-white" />}
            {activeTab === 'create' && <FileText className="w-10 h-10 text-white" />}
            {activeTab === 'voice' && <Mic className="w-10 h-10 text-white" />}
          </div>
        </div>
        
        <h1 className="text-4xl font-bold text-center mb-2 text-white bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-400">
          TubeGenius AI
        </h1>
        <p className="text-slate-400 text-center mb-8 text-lg">
          {activeTab === 'analyze' && "Analyze any YouTube channel to extract its DNA and generate viral scripts."}
          {activeTab === 'create' && "Instantly create a script and voice-over using your own reference text."}
          {activeTab === 'voice' && "Convert your pre-written script into professional AI voice-overs."}
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
                <Youtube className="w-4 h-4" /> Analyze
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
            <button 
                onClick={() => setActiveTab('voice')}
                className={`flex-1 py-2 text-sm font-medium rounded-lg transition-all flex items-center justify-center gap-2 ${
                    activeTab === 'voice' 
                    ? 'bg-slate-700 text-white shadow-md' 
                    : 'text-slate-400 hover:text-white'
                }`}
            >
                <Mic className="w-4 h-4" /> Text to Audio
            </button>
        </div>

        {/* Tab Content: Analyze */}
        {activeTab === 'analyze' && (
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
        )}

        {/* Tab Content: Instant Script */}
        {activeTab === 'create' && (
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
                    <div className="flex items-center justify-between mb-1.5 ml-1">
                        <label className="block text-xs font-bold text-slate-400 uppercase">Reference Style / Transcript</label>
                        <label className="flex items-center gap-2 cursor-pointer group">
                             <div className={`w-4 h-4 rounded border flex items-center justify-center transition-colors ${matchLength ? 'bg-red-500 border-red-500' : 'border-slate-500 bg-transparent'}`}>
                                 {matchLength && <Scale className="w-2.5 h-2.5 text-white" />}
                             </div>
                             <input 
                                type="checkbox" 
                                checked={matchLength} 
                                onChange={(e) => setMatchLength(e.target.checked)} 
                                className="hidden"
                             />
                             <span className={`text-xs font-medium transition-colors ${matchLength ? 'text-red-400' : 'text-slate-500 group-hover:text-slate-400'}`}>Match Length</span>
                        </label>
                    </div>
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

        {/* Tab Content: Text to Audio */}
        {activeTab === 'voice' && (
            <form onSubmit={handleVoiceSubmit} className="space-y-4">
                <div>
                    <label className="block text-xs font-bold text-slate-400 uppercase mb-1.5 ml-1">Project Title</label>
                    <input
                        type="text"
                        value={voiceTitle}
                        onChange={(e) => setVoiceTitle(e.target.value)}
                        placeholder="e.g. My New Video"
                        className="w-full bg-slate-900/50 border border-slate-600 text-white rounded-xl px-4 py-3 focus:ring-2 focus:ring-red-500 focus:border-transparent outline-none transition-all placeholder:text-slate-600"
                        disabled={isLoading}
                    />
                </div>
                <div>
                    <label className="block text-xs font-bold text-slate-400 uppercase mb-1.5 ml-1">Script Content</label>
                    <textarea
                        value={voiceScript}
                        onChange={(e) => setVoiceScript(e.target.value)}
                        placeholder="Paste your finished script here..."
                        className="w-full h-40 bg-slate-900/50 border border-slate-600 text-white rounded-xl px-4 py-3 focus:ring-2 focus:ring-red-500 focus:border-transparent outline-none transition-all placeholder:text-slate-600 resize-none text-sm leading-relaxed"
                        disabled={isLoading}
                    />
                </div>

                <button
                    type="submit"
                    disabled={isLoading || !voiceTitle.trim() || !voiceScript.trim()}
                    className="w-full bg-gradient-to-r from-red-600 to-red-500 hover:from-red-500 hover:to-red-400 text-white py-3.5 rounded-xl font-bold transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg shadow-red-900/20"
                >
                    <Mic className="w-5 h-5" />
                    <span>Open Voice Studio</span>
                </button>
            </form>
        )}
      </div>

      {/* Saved Projects Section */}
      {savedProjects.length > 0 && (
          <div className="mt-12 w-full max-w-2xl animate-slide-up">
              <h3 className="text-slate-500 text-sm font-bold uppercase tracking-wider mb-4 flex items-center gap-2">
                  <History className="w-4 h-4" /> Recent Projects
              </h3>
              <div className="grid gap-3">
                  {savedProjects.map(project => (
                      <div 
                        key={project.id}
                        className="bg-slate-800/50 hover:bg-slate-800 border border-slate-700/50 rounded-xl p-4 flex items-center justify-between transition-all group"
                      >
                          <div className="flex-1 cursor-pointer" onClick={() => onLoadProject(project)}>
                              <h4 className="text-white font-semibold text-lg">{project.name}</h4>
                              <p className="text-slate-500 text-sm">
                                  {new Date(project.timestamp).toLocaleDateString()} • {project.ideas.length} ideas generated
                              </p>
                          </div>
                          <div className="flex items-center gap-3">
                              <button 
                                onClick={() => onLoadProject(project)}
                                className="text-slate-400 hover:text-white p-2 rounded-lg hover:bg-slate-700"
                              >
                                  <ChevronRight className="w-5 h-5" />
                              </button>
                              <button 
                                onClick={(e) => { e.stopPropagation(); onDeleteProject(project.id); }}
                                className="text-slate-600 hover:text-red-400 p-2 rounded-lg hover:bg-slate-900 opacity-0 group-hover:opacity-100 transition-opacity"
                              >
                                  <Trash2 className="w-4 h-4" />
                              </button>
                          </div>
                      </div>
                  ))}
              </div>
          </div>
      )}
    </div>
  );
};
