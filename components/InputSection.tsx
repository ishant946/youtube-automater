import * as React from 'react';
import { useState } from 'react';
import { Search, Youtube, Loader2, PenTool, History, ChevronRight, Trash2, Scale, Mic, ArrowRight, Zap, Sparkles, Play, Scissors, Layers } from 'lucide-react';
import { SavedProject } from '../types';

interface InputSectionProps {
  onAnalyze: (input: string) => void;
  onCreateScript: (topic: string, transcript: string, matchLength: boolean) => void;
  onOpenStudio: (title: string, script: string, mode?: 'voice' | 'segment') => void;
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
  const [activeTab, setActiveTab] = useState<'analyze' | 'create' | 'voice' | 'segment'>('analyze');
  
  // Form States
  const [input, setInput] = useState('');
  const [topic, setTopic] = useState('');
  const [transcript, setTranscript] = useState('');
  const [matchLength, setMatchLength] = useState(false);
  const [voiceTitle, setVoiceTitle] = useState('');
  const [voiceScript, setVoiceScript] = useState('');
  const [segTitle, setSegTitle] = useState('');
  const [segScript, setSegScript] = useState('');

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
    if (voiceTitle.trim() && voiceScript.trim()) onOpenStudio(voiceTitle, voiceScript, 'voice');
  };

  const handleSegmentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (segTitle.trim() && segScript.trim()) onOpenStudio(segTitle, segScript, 'segment');
  }

  const TABS = [
    { id: 'analyze', label: 'Channel DNA', icon: Youtube, desc: 'Viral DNA Decoder', color: 'text-red-500' },
    { id: 'create', label: 'Script Writer', icon: PenTool, desc: 'Hyper Script Architect', color: 'text-blue-500' },
    { id: 'voice', label: 'Voice Studio', icon: Mic, desc: 'Neural Voice Synthesizer', color: 'text-purple-500' },
    { id: 'segment', label: 'Smart Splitter', icon: Scissors, desc: 'Intelligent Script Chunker', color: 'text-emerald-500' },
  ] as const;

  const activeIndex = TABS.findIndex(t => t.id === activeTab);
  const ActiveIcon = TABS[activeIndex].icon;

  return (
    <div className="flex flex-col items-center min-h-[calc(100vh-80px)] px-4 py-16 relative overflow-hidden">
      
      {/* --- CINEMATIC ATMOSPHERE LAYERS --- */}
      <div 
        className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[600px] rounded-full blur-[150px] pointer-events-none -z-10 transition-colors duration-1000"
        style={{ 
            background: activeTab === 'create' 
                ? 'var(--blob-blue)' 
                : activeTab === 'voice' 
                ? 'var(--blob-purple)' 
                : activeTab === 'segment'
                ? 'var(--blob-emerald)'
                : 'var(--blob-red)' 
        }}
      ></div>
      <div className="absolute bottom-0 right-0 w-[800px] h-[800px] bg-blue-900/5 rounded-full blur-[120px] pointer-events-none -z-10 dark:block hidden"></div>
      
      {/* --- HERO CORE (3D ORB) --- */}
      <div key={activeTab} className="mb-14 relative orb-scene group cursor-pointer mode-enter">
        <div className="orb-float">
            <div className="orb-3d flex items-center justify-center relative transition-transform duration-500">
                {/* Internal Glow */}
                <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-black/60 to-transparent z-20 opacity-80 dark:opacity-100"></div>
                {/* Icon */}
                <div className="relative z-30 drop-shadow-[0_0_15px_rgba(255,255,255,0.5)] transform group-hover:scale-110 transition-transform duration-500">
                    <ActiveIcon className="w-16 h-16 text-white" strokeWidth={1.5} />
                </div>
            </div>
            
            {/* Orbital Rings */}
            <div className="orb-ring w-[220px] h-[220px] opacity-40 animate-spin" style={{ animationDuration: '20s' }}></div>
            <div className="orb-ring w-[280px] h-[280px] opacity-20 animate-spin" style={{ animationDuration: '30s', animationDirection: 'reverse' }}></div>
        </div>
        
        {/* Floor Reflection */}
        <div className="absolute -bottom-20 left-1/2 -translate-x-1/2 w-40 h-10 blur-xl rounded-[100%] opacity-60 animate-pulse transition-colors duration-500"
             style={{ 
               background: activeTab === 'create' ? 'rgba(59, 130, 246, 0.3)' 
                         : activeTab === 'voice' ? 'rgba(147, 51, 234, 0.3)' 
                         : activeTab === 'segment' ? 'rgba(16, 185, 129, 0.3)'
                         : 'rgba(239, 68, 68, 0.3)' 
             }}
        ></div>
      </div>

      {/* --- HEADLINE --- */}
      <div key={`text-${activeTab}`} className="text-center mb-12 max-w-4xl z-10 mode-enter">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/50 dark:bg-white/5 border border-white/20 dark:border-white/10 mb-6 backdrop-blur-md shadow-[0_0_20px_rgba(0,0,0,0.05)] dark:shadow-[0_0_20px_rgba(255,255,255,0.05)]">
            <span className={`w-1.5 h-1.5 rounded-full animate-pulse shadow-[0_0_10px_currentColor] transition-colors duration-500 ${
              activeTab === 'create' ? 'bg-blue-500 text-blue-500' 
              : activeTab === 'voice' ? 'bg-purple-500 text-purple-500' 
              : activeTab === 'segment' ? 'bg-emerald-500 text-emerald-500'
              : 'bg-red-500 text-red-500'
            }`}></span>
            <span className="text-[10px] font-bold text-secondary-dynamic tracking-[0.2em] uppercase">AI Orchestration Engine</span>
        </div>
        
        <h1 className="text-6xl md:text-8xl font-heading font-black text-dynamic mb-6 tracking-tight leading-[0.9]">
            {activeTab === 'analyze' && <span className="text-glow-gradient">Viral DNA</span>}
            {activeTab === 'create' && <span className="text-glow-gradient" style={{ backgroundImage: 'var(--gradient-create)' }}>Hyper Script</span>}
            {activeTab === 'voice' && <span className="text-glow-gradient" style={{ backgroundImage: 'var(--gradient-voice)' }}>Neural Voice</span>}
            {activeTab === 'segment' && <span className="text-glow-gradient" style={{ backgroundImage: 'var(--gradient-segment)' }}>Smart Splitter</span>}
            <span className="block text-4xl md:text-5xl text-dynamic mt-2 font-light tracking-normal opacity-90">
                {TABS[activeIndex].desc.split(' ').slice(2).join(' ')}
            </span>
        </h1>
      </div>

      {/* --- PREMIUM INTERFACE --- */}
      <div className="w-full max-w-2xl z-20">
        
        {/* Tab Switcher - Glider */}
        <div className="flex justify-center mb-10 w-full">
            <div className="relative p-1.5 bg-[var(--tab-bg)] border border-[var(--glass-border)] rounded-2xl backdrop-blur-xl flex w-full shadow-2xl transition-all hover:scale-[1.01] hover:shadow-red-500/10 overflow-hidden">
                {/* Animated Background Pill */}
                <div 
                    className="absolute top-1.5 bottom-1.5 rounded-xl bg-white dark:bg-white/10 border border-black/5 dark:border-white/10 shadow-lg dark:shadow-[0_0_20px_rgba(255,255,255,0.1)] tab-glider z-0 overflow-hidden"
                    style={{
                        left: `${(activeIndex * 100) / TABS.length}%`,
                        width: `${100 / TABS.length}%`
                    }}
                >
                    {/* Gloss Sweep */}
                    <div className="absolute inset-0 bg-gradient-to-tr from-white/40 to-transparent opacity-40"></div>
                    <div className="absolute top-0 -left-[100%] w-full h-full bg-gradient-to-r from-transparent via-white/40 to-transparent animate-[sweep_2s_infinite]"></div>
                </div>

                {TABS.map((tab) => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id as any)}
                        className={`relative z-10 flex-1 flex flex-col md:flex-row items-center justify-center gap-1 md:gap-2 py-3 px-1 text-[10px] md:text-xs font-bold uppercase tracking-wider transition-colors duration-300 btn-hover-tilt ${
                            activeTab === tab.id ? 'text-black dark:text-white' : 'text-secondary-dynamic hover:text-dynamic'
                        }`}
                    >
                        <tab.icon className={`w-3.5 h-3.5 transition-colors duration-300 ${activeTab === tab.id ? tab.color : 'text-current opacity-70'}`} />
                        <span className="hidden md:inline">{tab.label}</span>
                        <span className="md:hidden">{tab.label.split(' ')[0]}</span>
                    </button>
                ))}
            </div>
        </div>

        {/* Input Console - Content Swapper */}
        <div className="glass-panel-premium rounded-3xl p-1 relative group transition-all duration-700 hover:shadow-[0_0_60px_rgba(239,68,68,0.1)]">
            {/* Border Glow Animation */}
            <div className={`absolute -inset-[1px] bg-gradient-to-r rounded-3xl opacity-0 group-hover:opacity-100 transition duration-700 blur-sm -z-10 ${
                activeTab === 'create' ? 'from-blue-500/30 via-white/10 to-blue-500/30' : 
                activeTab === 'voice' ? 'from-purple-500/30 via-white/10 to-purple-500/30' :
                activeTab === 'segment' ? 'from-emerald-500/30 via-white/10 to-emerald-500/30' :
                'from-red-500/30 via-white/10 to-red-500/30'
            }`}></div>

            <div className="bg-dynamic backdrop-blur-xl rounded-[20px] p-6 min-h-[140px] transition-colors duration-400">
                
                {/* ANALYZE FORM */}
                {activeTab === 'analyze' && (
                    <div key="analyze" className="mode-enter">
                        <form onSubmit={handleAnalyzeSubmit} className="flex flex-col gap-4">
                            <div className="relative glass-input rounded-2xl flex items-center h-16 px-4 transition-all hover:bg-white/50 dark:hover:bg-white/5 group-focus-within:bg-white dark:group-focus-within:bg-black/80">
                                <Search className="w-5 h-5 text-slate-500 ml-2" />
                                <input
                                    type="text"
                                    value={input}
                                    onChange={(e) => setInput(e.target.value)}
                                    placeholder="Paste YouTube Channel Link..."
                                    className="w-full bg-transparent border-none text-dynamic px-4 text-lg placeholder:text-slate-400 focus:ring-0 focus:outline-none font-medium h-full"
                                    disabled={isLoading}
                                />
                                <button
                                    type="submit"
                                    disabled={isLoading || !input.trim()}
                                    className="btn-primary-glow h-10 px-6 rounded-lg font-bold text-sm tracking-wide disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 shrink-0 hover:scale-105 active:scale-95 transition-transform"
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
                                        className="text-xs text-slate-400 hover:text-dynamic underline decoration-slate-400 hover:decoration-current underline-offset-4 transition-all"
                                    >
                                        {ex}
                                    </button>
                                ))}
                            </div>
                        </form>
                    </div>
                )}

                {/* CREATE FORM */}
                {activeTab === 'create' && (
                    <div key="create" className="mode-enter">
                        <form onSubmit={handleCreateSubmit} className="flex flex-col gap-4">
                            <input
                                type="text"
                                value={topic}
                                onChange={(e) => setTopic(e.target.value)}
                                placeholder="Project Topic / Title..."
                                className="w-full h-14 bg-[var(--input-bg)] border border-[var(--glass-border)] rounded-xl px-5 text-dynamic placeholder:text-slate-400 focus:border-blue-500/50 outline-none transition-all focus:shadow-[0_0_30px_rgba(59,130,246,0.1)]"
                                disabled={isLoading}
                            />
                            <textarea
                                value={transcript}
                                onChange={(e) => setTranscript(e.target.value)}
                                placeholder="Paste reference content (transcript, article, notes) to clone style..."
                                className="w-full h-32 bg-[var(--input-bg)] border border-[var(--glass-border)] rounded-xl px-5 py-4 text-dynamic placeholder:text-slate-400 focus:border-blue-500/50 outline-none transition-all resize-none custom-scrollbar focus:shadow-[0_0_30px_rgba(59,130,246,0.1)]"
                                disabled={isLoading}
                            />
                            <div className="flex items-center justify-between">
                                <label className="flex items-center gap-2 cursor-pointer group select-none">
                                    <div className={`w-4 h-4 rounded border flex items-center justify-center transition-all duration-300 ${matchLength ? 'bg-blue-500 border-blue-500 scale-110' : 'border-slate-400 bg-transparent group-hover:border-slate-500'}`}>
                                        <Scale className={`w-2.5 h-2.5 text-white transition-transform ${matchLength ? 'scale-100' : 'scale-0'}`} />
                                    </div>
                                    <input type="checkbox" checked={matchLength} onChange={e => setMatchLength(e.target.checked)} className="hidden" />
                                    <span className="text-xs font-medium text-slate-500 group-hover:text-dynamic transition-colors">Match Length</span>
                                </label>
                                <button
                                    type="submit"
                                    disabled={isLoading || !topic.trim() || !transcript.trim()}
                                    className="bg-blue-600 hover:bg-blue-500 text-white h-10 px-6 rounded-lg font-bold text-xs tracking-wide uppercase shadow-[0_0_15px_rgba(37,99,235,0.4)] hover:shadow-[0_0_25px_rgba(37,99,235,0.6)] transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 hover:scale-105 active:scale-95"
                                >
                                    {isLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Zap className="w-3.5 h-3.5 fill-current" />}
                                    GENERATE
                                </button>
                            </div>
                        </form>
                    </div>
                )}

                {/* VOICE FORM */}
                {activeTab === 'voice' && (
                    <div key="voice" className="mode-enter">
                        <form onSubmit={handleVoiceSubmit} className="flex flex-col gap-4">
                            <input
                                type="text"
                                value={voiceTitle}
                                onChange={(e) => setVoiceTitle(e.target.value)}
                                placeholder="Script Title..."
                                className="w-full h-14 bg-[var(--input-bg)] border border-[var(--glass-border)] rounded-xl px-5 text-dynamic placeholder:text-slate-400 focus:border-purple-500/50 outline-none transition-all focus:shadow-[0_0_30px_rgba(147,51,234,0.1)]"
                                disabled={isLoading}
                            />
                            <textarea
                                value={voiceScript}
                                onChange={(e) => setVoiceScript(e.target.value)}
                                placeholder="Paste your finished script here for production..."
                                className="w-full h-32 bg-[var(--input-bg)] border border-[var(--glass-border)] rounded-xl px-5 py-4 text-dynamic placeholder:text-slate-400 focus:border-purple-500/50 outline-none transition-all resize-none custom-scrollbar focus:shadow-[0_0_30px_rgba(147,51,234,0.1)]"
                                disabled={isLoading}
                            />
                            <div className="flex justify-end">
                                <button
                                    type="submit"
                                    disabled={isLoading || !voiceTitle.trim() || !voiceScript.trim()}
                                    className="bg-purple-600 hover:bg-purple-500 text-white h-10 px-6 rounded-lg font-bold text-xs tracking-wide uppercase shadow-[0_0_15px_rgba(147,51,234,0.4)] hover:shadow-[0_0_25px_rgba(147,51,234,0.6)] transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 hover:scale-105 active:scale-95"
                                >
                                    <Mic className="w-3.5 h-3.5" />
                                    OPEN STUDIO
                                </button>
                            </div>
                        </form>
                    </div>
                )}

                {/* SEGMENTER FORM */}
                {activeTab === 'segment' && (
                    <div key="segment" className="mode-enter">
                        <form onSubmit={handleSegmentSubmit} className="flex flex-col gap-4">
                            <input
                                type="text"
                                value={segTitle}
                                onChange={(e) => setSegTitle(e.target.value)}
                                placeholder="Content Title..."
                                className="w-full h-14 bg-[var(--input-bg)] border border-[var(--glass-border)] rounded-xl px-5 text-dynamic placeholder:text-slate-400 focus:border-emerald-500/50 outline-none transition-all focus:shadow-[0_0_30px_rgba(16,185,129,0.1)]"
                                disabled={isLoading}
                            />
                            <textarea
                                value={segScript}
                                onChange={(e) => setSegScript(e.target.value)}
                                placeholder="Paste long content here to split into segments..."
                                className="w-full h-32 bg-[var(--input-bg)] border border-[var(--glass-border)] rounded-xl px-5 py-4 text-dynamic placeholder:text-slate-400 focus:border-emerald-500/50 outline-none transition-all resize-none custom-scrollbar focus:shadow-[0_0_30px_rgba(16,185,129,0.1)]"
                                disabled={isLoading}
                            />
                            <div className="flex justify-end">
                                <button
                                    type="submit"
                                    disabled={isLoading || !segTitle.trim() || !segScript.trim()}
                                    className="bg-emerald-600 hover:bg-emerald-500 text-white h-10 px-6 rounded-lg font-bold text-xs tracking-wide uppercase shadow-[0_0_15px_rgba(16,185,129,0.4)] hover:shadow-[0_0_25px_rgba(16,185,129,0.6)] transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 hover:scale-105 active:scale-95"
                                >
                                    <Scissors className="w-3.5 h-3.5" />
                                    SPLIT CONTENT
                                </button>
                            </div>
                        </form>
                    </div>
                )}
            </div>
        </div>
      </div>

      {/* --- SAVED PROJECTS (Glass Cards) --- */}
      {savedProjects.length > 0 && (
          <div className="mt-20 w-full max-w-2xl animate-fade-in">
              <h3 className="text-slate-500 text-[10px] font-bold uppercase tracking-[0.2em] mb-4 text-center">Recent Sessions</h3>
              <div className="grid gap-3">
                  {savedProjects.map((project, idx) => (
                      <div 
                        key={project.id}
                        onClick={() => onLoadProject(project)}
                        style={{ animationDelay: `${idx * 100}ms` }}
                        className="group bg-white/40 dark:bg-white/5 hover:bg-white/60 dark:hover:bg-white/10 border border-white/20 dark:border-white/5 hover:border-red-200 dark:hover:border-white/10 rounded-xl p-4 flex items-center justify-between transition-all cursor-pointer backdrop-blur-sm animate-slide-up hover:scale-[1.01] shadow-sm hover:shadow-md"
                      >
                          <div className="flex items-center gap-4">
                              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-white/80 dark:from-white/10 to-transparent border border-white/20 dark:border-white/10 flex items-center justify-center text-xs font-bold text-dynamic group-hover:border-red-500/50 transition-colors">
                                  {project.name.charAt(0)}
                              </div>
                              <div>
                                <h4 className="text-dynamic font-medium text-sm group-hover:text-red-500 dark:group-hover:text-red-400 transition-colors">
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
                                className="p-2 text-slate-500 hover:text-red-400 hover:bg-white/10 rounded-lg transition-colors"
                              >
                                  <Trash2 className="w-4 h-4" />
                              </button>
                              <div className="w-8 h-8 rounded-lg bg-white/20 dark:bg-white/5 flex items-center justify-center border border-white/10 text-slate-400 dark:text-slate-300">
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