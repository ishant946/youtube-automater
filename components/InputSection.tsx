import * as React from 'react';
import { useState } from 'react';
import { Search, Youtube, Loader2, PenTool, History, ChevronRight, Trash2, Scale, Mic, ArrowRight, Zap, Sparkles, Play } from 'lucide-react';
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
  
  // Form States
  const [input, setInput] = useState('');
  const [topic, setTopic] = useState('');
  const [transcript, setTranscript] = useState('');
  const [matchLength, setMatchLength] = useState(false);
  const [voiceTitle, setVoiceTitle] = useState('');
  const [voiceScript, setVoiceScript] = useState('');

  const handleAnalyzeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (input.trim()) onAnalyze(input);
  };

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (topic.trim() && transcript.trim()) onCreateScript(topic, transcript, matchLength);
  };

  const handleVoiceSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (voiceTitle.trim() && voiceScript.trim()) onOpenStudio(voiceTitle, voiceScript);
  };

  return (
    <div className="flex flex-col items-center min-h-[calc(100vh-80px)] px-4 py-16 relative overflow-hidden">
      
      {/* --- CINEMATIC ATMOSPHERE LAYERS --- */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[600px] bg-red-600/10 rounded-full blur-[150px] pointer-events-none -z-10 mix-blend-screen"></div>
      <div className="absolute bottom-0 right-0 w-[800px] h-[800px] bg-blue-900/10 rounded-full blur-[120px] pointer-events-none -z-10"></div>
      
      {/* --- HERO CORE (3D ORB) --- */}
      <div className="mb-14 relative orb-scene group cursor-pointer animate-fade-in">
        <div className="orb-float">
            <div className="orb-3d flex items-center justify-center relative">
                {/* Internal Glow */}
                <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-black/60 to-transparent z-20"></div>
                {/* Icon */}
                <div className="relative z-30 drop-shadow-[0_0_15px_rgba(255,255,255,0.5)] transform group-hover:scale-110 transition-transform duration-500">
                    {activeTab === 'analyze' && <Youtube className="w-16 h-16 text-white" strokeWidth={1.5} />}
                    {activeTab === 'create' && <Sparkles className="w-14 h-14 text-white" strokeWidth={1.5} />}
                    {activeTab === 'voice' && <Mic className="w-14 h-14 text-white" strokeWidth={1.5} />}
                </div>
            </div>
            
            {/* Orbital Rings */}
            <div className="orb-ring w-[220px] h-[220px] opacity-40 animate-spin" style={{ animationDuration: '20s' }}></div>
            <div className="orb-ring w-[280px] h-[280px] opacity-20 animate-spin" style={{ animationDuration: '30s', animationDirection: 'reverse' }}></div>
        </div>
        
        {/* Floor Reflection */}
        <div className="absolute -bottom-20 left-1/2 -translate-x-1/2 w-40 h-10 bg-red-500/30 blur-xl rounded-[100%] opacity-60 animate-pulse"></div>
      </div>

      {/* --- HEADLINE --- */}
      <div className="text-center mb-12 max-w-4xl z-10 animate-slide-up">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 mb-6 backdrop-blur-md shadow-[0_0_20px_rgba(255,255,255,0.05)]">
            <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse shadow-[0_0_10px_red]"></span>
            <span className="text-[10px] font-bold text-slate-300 tracking-[0.2em] uppercase">AI Orchestration Engine</span>
        </div>
        
        <h1 className="text-6xl md:text-8xl font-heading font-black text-white mb-6 tracking-tight leading-[0.9]">
            {activeTab === 'analyze' && <span className="text-glow-gradient">Viral DNA</span>}
            {activeTab === 'create' && <span className="text-glow-gradient">Hyper Script</span>}
            {activeTab === 'voice' && <span className="text-glow-gradient">Neural Voice</span>}
            <span className="block text-4xl md:text-5xl text-white/90 mt-2 font-light tracking-normal">
                {activeTab === 'analyze' ? 'Decoder' : activeTab === 'create' ? 'Architect' : 'Synthesizer'}
            </span>
        </h1>
      </div>

      {/* --- PREMIUM INTERFACE --- */}
      <div className="w-full max-w-2xl z-20 animate-slide-up" style={{ animationDelay: '0.2s' }}>
        
        {/* Tab Switcher */}
        <div className="flex justify-center mb-8">
            <div className="p-1.5 rounded-2xl glass-panel-premium flex gap-1 relative">
                {(['analyze', 'create', 'voice'] as const).map((tab) => (
                    <button 
                        key={tab}
                        onClick={() => setActiveTab(tab)}
                        className={`relative px-6 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all duration-500 z-10 flex items-center gap-2 ${
                            activeTab === tab 
                            ? 'text-white shadow-[0_0_20px_rgba(255,255,255,0.2)]' 
                            : 'text-slate-500 hover:text-slate-300'
                        }`}
                    >
                        {activeTab === tab && (
                            <div className="absolute inset-0 bg-white/10 rounded-xl border border-white/10 shadow-inner backdrop-blur-md -z-10"></div>
                        )}
                        {tab === 'analyze' && <Youtube className="w-3.5 h-3.5" />}
                        {tab === 'create' && <PenTool className="w-3.5 h-3.5" />}
                        {tab === 'voice' && <Mic className="w-3.5 h-3.5" />}
                        <span>{tab === 'analyze' ? 'Analyze' : tab === 'create' ? 'Write' : 'Speak'}</span>
                    </button>
                ))}
            </div>
        </div>

        {/* Input Console */}
        <div className="glass-panel-premium rounded-3xl p-1 relative group transition-all duration-500 hover:shadow-[0_0_50px_rgba(239,68,68,0.15)]">
            {/* Border Glow Animation */}
            <div className="absolute -inset-[1px] bg-gradient-to-r from-red-500/20 via-white/10 to-blue-500/20 rounded-3xl opacity-0 group-hover:opacity-100 transition duration-700 blur-sm -z-10"></div>

            <div className="bg-[#050508]/80 backdrop-blur-xl rounded-[20px] p-6">
                
                {/* ANALYZE FORM */}
                {activeTab === 'analyze' && (
                    <form onSubmit={handleAnalyzeSubmit} className="flex flex-col gap-4">
                        <div className="relative glass-input rounded-2xl flex items-center h-16 px-4 transition-all">
                            <Search className="w-5 h-5 text-slate-500 ml-2" />
                            <input
                                type="text"
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                placeholder="Paste YouTube Channel Link..."
                                className="w-full bg-transparent border-none text-white px-4 text-lg placeholder:text-slate-600 focus:ring-0 focus:outline-none font-medium h-full"
                                disabled={isLoading}
                            />
                            <button
                                type="submit"
                                disabled={isLoading || !input.trim()}
                                className="btn-primary-glow h-10 px-6 rounded-lg font-bold text-sm tracking-wide disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 shrink-0"
                            >
                                {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <span>ANALYZE</span>}
                            </button>
                        </div>
                        
                        {/* Examples */}
                        <div className="flex items-center justify-center gap-3 mt-2 opacity-60 hover:opacity-100 transition-opacity">
                            <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">Try:</span>
                            {['MKBHD', 'Veritasium', 'MrBeast'].map(ex => (
                                <button
                                    key={ex}
                                    type="button"
                                    onClick={() => setInput(ex)}
                                    className="text-xs text-slate-400 hover:text-white underline decoration-slate-600 hover:decoration-white underline-offset-4 transition-all"
                                >
                                    {ex}
                                </button>
                            ))}
                        </div>
                    </form>
                )}

                {/* CREATE FORM */}
                {activeTab === 'create' && (
                    <form onSubmit={handleCreateSubmit} className="flex flex-col gap-4">
                        <input
                            type="text"
                            value={topic}
                            onChange={(e) => setTopic(e.target.value)}
                            placeholder="Project Topic / Title..."
                            className="w-full h-14 bg-black/40 border border-white/10 rounded-xl px-5 text-white placeholder:text-slate-600 focus:border-blue-500/50 focus:bg-black/60 outline-none transition-all"
                            disabled={isLoading}
                        />
                        <textarea
                            value={transcript}
                            onChange={(e) => setTranscript(e.target.value)}
                            placeholder="Paste reference content (transcript, article, notes) to clone style..."
                            className="w-full h-32 bg-black/40 border border-white/10 rounded-xl px-5 py-4 text-white placeholder:text-slate-600 focus:border-blue-500/50 focus:bg-black/60 outline-none transition-all resize-none custom-scrollbar"
                            disabled={isLoading}
                        />
                        <div className="flex items-center justify-between">
                             <label className="flex items-center gap-2 cursor-pointer group">
                                <div className={`w-4 h-4 rounded border flex items-center justify-center transition-colors ${matchLength ? 'bg-blue-500 border-blue-500' : 'border-slate-600 bg-transparent'}`}>
                                    {matchLength && <Scale className="w-2.5 h-2.5 text-white" />}
                                </div>
                                <input type="checkbox" checked={matchLength} onChange={e => setMatchLength(e.target.checked)} className="hidden" />
                                <span className="text-xs font-medium text-slate-400 group-hover:text-slate-300">Match Length</span>
                             </label>
                             <button
                                type="submit"
                                disabled={isLoading || !topic.trim() || !transcript.trim()}
                                className="bg-blue-600 hover:bg-blue-500 text-white h-10 px-6 rounded-lg font-bold text-xs tracking-wide uppercase shadow-[0_0_15px_rgba(37,99,235,0.4)] hover:shadow-[0_0_25px_rgba(37,99,235,0.6)] transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                             >
                                {isLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Zap className="w-3.5 h-3.5 fill-current" />}
                                GENERATE
                             </button>
                        </div>
                    </form>
                )}

                {/* VOICE FORM */}
                {activeTab === 'voice' && (
                    <form onSubmit={handleVoiceSubmit} className="flex flex-col gap-4">
                        <input
                            type="text"
                            value={voiceTitle}
                            onChange={(e) => setVoiceTitle(e.target.value)}
                            placeholder="Script Title..."
                            className="w-full h-14 bg-black/40 border border-white/10 rounded-xl px-5 text-white placeholder:text-slate-600 focus:border-purple-500/50 focus:bg-black/60 outline-none transition-all"
                            disabled={isLoading}
                        />
                        <textarea
                            value={voiceScript}
                            onChange={(e) => setVoiceScript(e.target.value)}
                            placeholder="Paste your finished script here for production..."
                            className="w-full h-32 bg-black/40 border border-white/10 rounded-xl px-5 py-4 text-white placeholder:text-slate-600 focus:border-purple-500/50 focus:bg-black/60 outline-none transition-all resize-none custom-scrollbar"
                            disabled={isLoading}
                        />
                        <div className="flex justify-end">
                             <button
                                type="submit"
                                disabled={isLoading || !voiceTitle.trim() || !voiceScript.trim()}
                                className="bg-purple-600 hover:bg-purple-500 text-white h-10 px-6 rounded-lg font-bold text-xs tracking-wide uppercase shadow-[0_0_15px_rgba(147,51,234,0.4)] hover:shadow-[0_0_25px_rgba(147,51,234,0.6)] transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                             >
                                <Mic className="w-3.5 h-3.5" />
                                OPEN STUDIO
                             </button>
                        </div>
                    </form>
                )}
            </div>
        </div>
      </div>

      {/* --- SAVED PROJECTS (Glass Cards) --- */}
      {savedProjects.length > 0 && (
          <div className="mt-20 w-full max-w-2xl animate-fade-in">
              <h3 className="text-slate-600 text-[10px] font-bold uppercase tracking-[0.2em] mb-4 text-center">Recent Sessions</h3>
              <div className="grid gap-3">
                  {savedProjects.map((project, idx) => (
                      <div 
                        key={project.id}
                        onClick={() => onLoadProject(project)}
                        style={{ animationDelay: `${idx * 100}ms` }}
                        className="group bg-white/5 hover:bg-white/10 border border-white/5 hover:border-white/10 rounded-xl p-4 flex items-center justify-between transition-all cursor-pointer backdrop-blur-sm animate-slide-up hover:scale-[1.01]"
                      >
                          <div className="flex items-center gap-4">
                              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-white/10 to-transparent border border-white/10 flex items-center justify-center text-xs font-bold text-white group-hover:border-red-500/50 transition-colors">
                                  {project.name.charAt(0)}
                              </div>
                              <div>
                                <h4 className="text-white font-medium text-sm group-hover:text-red-400 transition-colors">
                                    {project.name}
                                </h4>
                                <p className="text-slate-500 text-[10px] mt-0.5">
                                    {new Date(project.timestamp).toLocaleDateString()}
                                </p>
                              </div>
                          </div>
                          
                          <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                              <button 
                                onClick={(e) => { e.stopPropagation(); onDeleteProject(project.id); }}
                                className="p-2 text-slate-500 hover:text-red-400 hover:bg-white/5 rounded-lg transition-colors"
                              >
                                  <Trash2 className="w-4 h-4" />
                              </button>
                              <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center border border-white/5 text-slate-300">
                                <ArrowRight className="w-4 h-4" />
                              </div>
                          </div>
                      </div>
                  ))}
              </div>
          </div>
      )}
    </div>
  );
};