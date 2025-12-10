
import * as React from 'react';
import { useEffect, useRef, useState } from 'react';
import { X, Copy, RefreshCw, Save, Loader2, Check, Mic, Play, Download, Volume2, Film, Search, Hash, MessageSquare, Clipboard, Minimize2 } from 'lucide-react';
import { VideoIdea, VOICES, VoiceOption, ScriptPart, VideoMetadata } from '../types';
import { generateSpeech, generateVideoMetadata } from '../services/geminiService';

interface ScriptModalProps {
  isOpen: boolean;
  onClose: () => void;
  idea: VideoIdea | null;
  content: string;
  setContent: (text: string) => void;
  isGenerating: boolean;
  onRegenerate: () => void;
}

export const ScriptModal: React.FC<ScriptModalProps> = ({
  isOpen,
  onClose,
  idea,
  content,
  setContent,
  isGenerating,
  onRegenerate
}) => {
  const [copied, setCopied] = useState(false);
  const [selectedVoice, setSelectedVoice] = useState<VoiceOption>(VOICES[0]);
  const [activeTab, setActiveTab] = useState<'voice' | 'seo'>('voice');
  const [scriptParts, setScriptParts] = useState<ScriptPart[]>([]);
  const [isProcessingMedia, setIsProcessingMedia] = useState(false);
  const [metadata, setMetadata] = useState<VideoMetadata | null>(null);
  const [isSeoLoading, setIsSeoLoading] = useState(false);
  
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isGenerating && bottomRef.current) {
      bottomRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [content, isGenerating]);

  useEffect(() => {
    return () => {
      scriptParts.forEach(part => {
        if (part.audioUrl) URL.revokeObjectURL(part.audioUrl);
      });
    };
  }, [scriptParts]);

  if (!isOpen || !idea) return null;

  const handleCopy = () => {
    navigator.clipboard.writeText(content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSave = () => {
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${idea.title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}_narration.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const splitTextToSegments = (fullText: string): string[] => {
    const TARGET_LIMIT = 500; 
    const paragraphs = fullText.split('\n');
    const chunks: string[] = [];
    let currentChunk = '';
    let currentWordCount = 0;

    for (const para of paragraphs) {
      const trimmedPara = para.trim();
      const wordCount = trimmedPara.length === 0 ? 0 : trimmedPara.split(/\s+/).length;
      if (currentWordCount > 0 && (currentWordCount + wordCount > TARGET_LIMIT)) {
        chunks.push(currentChunk.trim());
        currentChunk = para + '\n';
        currentWordCount = wordCount;
      } else {
        currentChunk += para + '\n';
        currentWordCount += wordCount;
      }
    }
    if (currentChunk.trim()) {
      chunks.push(currentChunk.trim());
    }
    return chunks.length > 0 ? chunks : [fullText];
  };

  const handleGenerateAudio = async () => {
    if (!content.trim()) return;
    const textChunks = splitTextToSegments(content);
    const initialParts: ScriptPart[] = textChunks.map((text, idx) => ({
      index: idx,
      text,
      audioUrl: null,
      isAudioLoading: true,
      audioError: false,
    }));
    setScriptParts(initialParts);
    setIsProcessingMedia(true);
    for (let i = 0; i < initialParts.length; i++) {
        await processPart(i, initialParts[i].text);
    }
    setIsProcessingMedia(false);
  };

  const processPart = async (index: number, text: string) => {
      try {
        const blob = await generateSpeech(text, selectedVoice.name);
        const url = URL.createObjectURL(blob);
        setScriptParts(prev => prev.map(p => p.index === index ? { ...p, audioUrl: url, isAudioLoading: false } : p));
        const a = document.createElement('a');
        a.style.display = 'none';
        a.href = url;
        a.download = `part_${index + 1}_voiceover.wav`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
      } catch (err) {
        setScriptParts(prev => prev.map(p => p.index === index ? { ...p, isAudioLoading: false, audioError: true } : p));
      }
  };

  const handleRegenerateAudio = async (index: number) => {
      const part = scriptParts.find(p => p.index === index);
      if (!part) return;
      setScriptParts(prev => prev.map(p => p.index === index ? { ...p, isAudioLoading: true, audioError: false, audioUrl: null } : p));
      try {
          const blob = await generateSpeech(part.text, selectedVoice.name);
          const url = URL.createObjectURL(blob);
          setScriptParts(prev => prev.map(p => p.index === index ? { ...p, audioUrl: url, isAudioLoading: false } : p));
          const a = document.createElement('a');
          a.style.display = 'none';
          a.href = url;
          a.download = `part_${index + 1}_voiceover.wav`;
          document.body.appendChild(a);
          a.click();
          document.body.removeChild(a);
      } catch (err) {
          setScriptParts(prev => prev.map(p => p.index === index ? { ...p, isAudioLoading: false, audioError: true } : p));
      }
  };

  const handleGenerateSeo = async () => {
      if (!content.trim()) return;
      setIsSeoLoading(true);
      try {
          const data = await generateVideoMetadata(idea.title, content);
          setMetadata(data);
      } catch (error) {
          console.error(error);
      } finally {
          setIsSeoLoading(false);
      }
  };

  const copyToClipboard = (text: string) => {
      navigator.clipboard.writeText(text);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div 
        className="absolute inset-0 bg-black/80 backdrop-blur-md"
        onClick={!isGenerating ? onClose : undefined}
      />
      
      <div className="relative glass-panel rounded-2xl w-full max-w-[95vw] h-[90vh] flex flex-col overflow-hidden shadow-2xl animate-slide-up border border-white/10">
        
        {/* Header - HUD Style */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/10 bg-black/40 shrink-0 relative">
          <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-lg bg-red-600/20 border border-red-500/50 flex items-center justify-center">
                  <Film className="w-5 h-5 text-red-500" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-white line-clamp-1 font-heading">{idea.title}</h3>
                <p className="text-xs text-slate-400 flex items-center gap-2 uppercase tracking-widest font-semibold">
                    Production Studio <span className="w-1 h-1 rounded-full bg-red-500 animate-pulse"></span> Live
                </p>
              </div>
          </div>
          <button 
            onClick={onClose}
            className="p-2 hover:bg-white/10 rounded-lg transition-colors text-slate-400 hover:text-white"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Toolbar */}
        <div className="flex items-center gap-3 px-6 py-3 bg-black/60 border-b border-white/5 shrink-0">
           <button onClick={handleCopy} className="text-xs font-bold uppercase tracking-wider bg-white/5 hover:bg-white/10 border border-white/10 text-slate-300 hover:text-white px-3 py-1.5 rounded transition-all flex items-center gap-2">
             {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
             {copied ? 'Copied' : 'Copy Text'}
           </button>
           <button onClick={handleSave} className="text-xs font-bold uppercase tracking-wider bg-white/5 hover:bg-white/10 border border-white/10 text-slate-300 hover:text-white px-3 py-1.5 rounded transition-all flex items-center gap-2">
             <Save className="w-3.5 h-3.5" /> Save .txt
           </button>
           <div className="flex-1" />
           {isGenerating ? (
             <div className="flex items-center gap-2 text-xs font-bold text-red-400 px-3 py-1.5 border border-red-500/30 bg-red-500/10 rounded animate-pulse">
               <Loader2 className="w-3.5 h-3.5 animate-spin" />
               GENERATING SCRIPT SEQUENCE...
             </div>
           ) : (
             <button onClick={onRegenerate} className="text-xs font-bold uppercase tracking-wider text-slate-400 hover:text-red-400 flex items-center gap-2 transition-colors">
               <RefreshCw className="w-3.5 h-3.5" /> Regenerate
             </button>
           )}
        </div>

        {/* Main Workspace */}
        <div className="flex-1 flex min-h-0 bg-black/20">
            {/* Editor */}
            <div className={`flex-1 relative h-full overflow-hidden flex flex-col border-r border-white/5`}>
              <textarea
                ref={textareaRef}
                value={content}
                onChange={(e) => setContent(e.target.value)}
                disabled={isGenerating}
                placeholder="Initializing AI script writer..."
                className="w-full h-full bg-transparent text-slate-200 p-8 font-serif text-lg leading-loose resize-none focus:outline-none overflow-y-auto selection:bg-red-500/30"
                spellCheck={false}
              />
              <div ref={bottomRef} />
            </div>

            {/* Sidebar (Control Panel) */}
            <div className="w-[450px] bg-black/40 flex flex-col border-l border-white/5 shrink-0 backdrop-blur-xl">
                
                {/* Tabs */}
                <div className="flex border-b border-white/5 bg-black/20">
                    <button 
                        onClick={() => setActiveTab('voice')}
                        className={`flex-1 py-4 text-xs font-bold uppercase tracking-widest flex items-center justify-center gap-2 transition-all ${
                            activeTab === 'voice' 
                            ? 'bg-white/5 text-red-400 border-b-2 border-red-500' 
                            : 'text-slate-500 hover:text-white hover:bg-white/5'
                        }`}
                    >
                        <Mic className="w-3.5 h-3.5" /> Voice Studio
                    </button>
                    <button 
                        onClick={() => setActiveTab('seo')}
                        className={`flex-1 py-4 text-xs font-bold uppercase tracking-widest flex items-center justify-center gap-2 transition-all ${
                            activeTab === 'seo' 
                            ? 'bg-white/5 text-blue-400 border-b-2 border-blue-500' 
                            : 'text-slate-500 hover:text-white hover:bg-white/5'
                        }`}
                    >
                        <Search className="w-3.5 h-3.5" /> SEO Metadata
                    </button>
                </div>

                {/* VOICE PANEL */}
                {activeTab === 'voice' && (
                    <div className="flex flex-col h-full overflow-hidden">
                        <div className="p-6 border-b border-white/5 shrink-0 space-y-4">
                            <div className="flex items-center justify-between">
                                <h4 className="text-sm font-bold text-white flex items-center gap-2">
                                    <Volume2 className="w-4 h-4 text-red-500" /> Neural Voice Config
                                </h4>
                            </div>
                            
                            <div className="space-y-3">
                                <div className="relative">
                                    <select
                                        value={selectedVoice.name}
                                        onChange={(e) => {
                                            const v = VOICES.find(v => v.name === e.target.value);
                                            if (v) setSelectedVoice(v);
                                        }}
                                        disabled={isProcessingMedia || isGenerating}
                                        className="w-full bg-black/60 text-white text-xs rounded-lg pl-3 pr-8 py-3 outline-none border border-white/10 focus:border-red-500 appearance-none font-mono"
                                    >
                                        {VOICES.map(voice => (
                                            <option key={voice.name} value={voice.name}>
                                                {voice.label.toUpperCase()} // {voice.gender.toUpperCase()} // {voice.style}
                                            </option>
                                        ))}
                                    </select>
                                    <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-slate-500">
                                        <Minimize2 className="w-3 h-3 rotate-45" />
                                    </div>
                                </div>

                                <button
                                    onClick={handleGenerateAudio}
                                    disabled={isProcessingMedia || isGenerating || !content.trim()}
                                    className="w-full bg-red-600 hover:bg-red-500 disabled:bg-white/5 disabled:text-slate-600 text-white px-4 py-3 rounded-lg text-xs font-bold uppercase tracking-widest flex items-center justify-center gap-2 transition-all shadow-[0_0_15px_rgba(220,38,38,0.4)]"
                                >
                                    {isProcessingMedia ? <Loader2 className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4 fill-current" />}
                                    {isProcessingMedia ? 'Synthesizing...' : 'Initialize Audio Render'}
                                </button>
                            </div>
                        </div>

                        <div className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar">
                            {scriptParts.length === 0 && !isProcessingMedia && (
                                <div className="h-full flex flex-col items-center justify-center text-slate-600 space-y-4 opacity-50">
                                    <div className="w-16 h-16 rounded-full border-2 border-dashed border-slate-700 flex items-center justify-center">
                                        <Volume2 className="w-6 h-6" />
                                    </div>
                                    <p className="text-xs font-mono">Awaiting Audio Generation...</p>
                                </div>
                            )}

                            {scriptParts.map((part) => (
                                <div key={part.index} className="bg-white/5 rounded-xl border border-white/5 p-4 animate-fade-in hover:bg-white/10 transition-colors group">
                                    <div className="flex items-center justify-between mb-3 border-b border-white/5 pb-2">
                                        <span className="text-[10px] font-bold text-red-400 uppercase tracking-wider">Sequence 0{part.index + 1}</span>
                                        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                            {part.audioUrl && (
                                                <a 
                                                    href={part.audioUrl}
                                                    download={`part_${part.index + 1}_voiceover.wav`}
                                                    className="p-1.5 bg-black/40 rounded hover:text-white text-slate-400 transition-colors"
                                                >
                                                    <Download className="w-3 h-3" />
                                                </a>
                                            )}
                                        </div>
                                    </div>

                                    <div>
                                        {part.isAudioLoading ? (
                                            <div className="h-8 bg-black/40 rounded w-full flex items-center justify-center relative overflow-hidden">
                                                <div className="absolute inset-0 bg-red-500/20 animate-pulse"></div>
                                                <span className="text-[10px] text-red-300 relative z-10 font-mono">RENDERING WAVEFORM...</span>
                                            </div>
                                        ) : part.audioError ? (
                                            <div className="text-[10px] text-red-500 font-mono">RENDER FAILED</div>
                                        ) : part.audioUrl ? (
                                            <audio controls src={part.audioUrl} className="w-full h-8 block opacity-80 hover:opacity-100 transition-opacity" style={{ height: '32px' }}/>
                                        ) : (
                                            <div className="flex items-center justify-between">
                                                 <span className="text-[10px] text-slate-500 font-mono">Ready to Render</span>
                                                 <button 
                                                    onClick={() => handleRegenerateAudio(part.index)}
                                                    className="text-[10px] text-white bg-white/10 px-2 py-1 rounded hover:bg-white/20"
                                                 >
                                                    Render
                                                 </button>
                                            </div>
                                        )}
                                    </div>
                                    
                                    <div className="mt-3 text-[10px] text-slate-500 line-clamp-2 font-mono leading-relaxed">
                                        {part.text}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* SEO PANEL */}
                {activeTab === 'seo' && (
                    <div className="flex flex-col h-full overflow-hidden">
                        <div className="p-6 border-b border-white/5 shrink-0 bg-blue-500/5">
                            <h4 className="text-sm font-bold text-blue-400 mb-3 flex items-center gap-2 uppercase tracking-wider">
                                <Search className="w-4 h-4" /> SEO Optimization
                            </h4>
                            <button
                                onClick={handleGenerateSeo}
                                disabled={isSeoLoading || isGenerating || !content.trim()}
                                className="w-full bg-blue-600 hover:bg-blue-500 disabled:bg-white/5 disabled:text-slate-600 text-white px-4 py-3 rounded-lg text-xs font-bold uppercase tracking-widest flex items-center justify-center gap-2 transition-all shadow-[0_0_15px_rgba(37,99,235,0.4)]"
                            >
                                {isSeoLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
                                {isSeoLoading ? 'Analyzing...' : 'Generate Metadata'}
                            </button>
                        </div>

                        <div className="flex-1 overflow-y-auto p-4 space-y-6">
                            {!metadata && !isSeoLoading && (
                                <div className="h-full flex flex-col items-center justify-center text-slate-600 space-y-4 opacity-50">
                                    <div className="w-16 h-16 rounded-full border-2 border-dashed border-slate-700 flex items-center justify-center">
                                        <Search className="w-6 h-6" />
                                    </div>
                                    <p className="text-xs font-mono">Run SEO Analysis</p>
                                </div>
                            )}

                            {isSeoLoading && (
                                <div className="space-y-4">
                                    <div className="h-20 bg-white/5 rounded-xl animate-pulse"></div>
                                    <div className="h-12 bg-white/5 rounded-xl animate-pulse"></div>
                                </div>
                            )}

                            {metadata && (
                                <>
                                    <div className="glass-panel p-4 rounded-xl border-l-2 border-l-blue-500">
                                        <div className="flex items-center justify-between mb-2">
                                            <span className="text-[10px] font-bold text-blue-400 uppercase tracking-widest">Description</span>
                                            <button onClick={() => copyToClipboard(metadata.description)} className="text-slate-400 hover:text-white"><Clipboard className="w-3 h-3" /></button>
                                        </div>
                                        <p className="text-xs text-slate-300 leading-relaxed font-light">{metadata.description}</p>
                                    </div>

                                    <div className="glass-panel p-4 rounded-xl border-l-2 border-l-emerald-500">
                                        <div className="flex items-center justify-between mb-3">
                                            <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-widest">Keywords / Tags</span>
                                            <button onClick={() => copyToClipboard(metadata.tags.join(','))} className="text-slate-400 hover:text-white"><Clipboard className="w-3 h-3" /></button>
                                        </div>
                                        <div className="flex flex-wrap gap-2">
                                            {metadata.tags.map((tag, i) => (
                                                <span key={i} className="text-[10px] bg-black/40 text-slate-300 px-2 py-1 rounded border border-white/10 font-mono">
                                                    {tag}
                                                </span>
                                            ))}
                                        </div>
                                    </div>

                                    <div className="glass-panel p-4 rounded-xl border-l-2 border-l-yellow-500">
                                        <div className="flex items-center justify-between mb-2">
                                            <span className="text-[10px] font-bold text-yellow-400 uppercase tracking-widest">Pinned Comment</span>
                                            <button onClick={() => copyToClipboard(metadata.pinnedComment)} className="text-slate-400 hover:text-white"><Clipboard className="w-3 h-3" /></button>
                                        </div>
                                        <p className="text-xs text-slate-300 italic">"{metadata.pinnedComment}"</p>
                                    </div>
                                </>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </div>
      </div>
    </div>
  );
};
