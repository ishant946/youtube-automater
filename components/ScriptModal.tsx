
import * as React from 'react';
import { useEffect, useRef, useState } from 'react';
import { X, Copy, RefreshCw, Save, Loader2, Check, Mic, Play, Download, Volume2, Film, Search, Hash, MessageSquare, Clipboard } from 'lucide-react';
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
  
  // Tabs for Right Panel
  const [activeTab, setActiveTab] = useState<'voice' | 'seo'>('voice');

  // Media State
  const [scriptParts, setScriptParts] = useState<ScriptPart[]>([]);
  const [isProcessingMedia, setIsProcessingMedia] = useState(false);
  
  // SEO State
  const [metadata, setMetadata] = useState<VideoMetadata | null>(null);
  const [isSeoLoading, setIsSeoLoading] = useState(false);
  
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom while generating script
  useEffect(() => {
    if (isGenerating && bottomRef.current) {
      bottomRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [content, isGenerating]);

  // Cleanup object URLs on unmount
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

  // Helper to split text into chunks of ~500 words at natural paragraph breaks
  const splitTextToSegments = (fullText: string): string[] => {
    const TARGET_LIMIT = 500; 
    
    // Split by newlines to preserve paragraph structure
    const paragraphs = fullText.split('\n');
    const chunks: string[] = [];
    
    let currentChunk = '';
    let currentWordCount = 0;

    for (const para of paragraphs) {
      const trimmedPara = para.trim();
      const wordCount = trimmedPara.length === 0 ? 0 : trimmedPara.split(/\s+/).length;

      // If adding this paragraph exceeds the target limit significantly, 
      // and we already have some content, start a new chunk.
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

    // 1. Prepare segments
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

    // 2. Process each part sequentially to avoid hitting rate limits too hard
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
        
        // Auto-download logic
        const a = document.createElement('a');
        a.style.display = 'none';
        a.href = url;
        a.download = `part_${index + 1}_voiceover.wav`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);

      } catch (err) {
        console.error("Audio generation error", err);
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

          // Auto-download logic
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
        className="absolute inset-0 bg-slate-900/80 backdrop-blur-sm"
        onClick={!isGenerating ? onClose : undefined}
      />
      
      <div className="relative bg-slate-800 rounded-2xl shadow-2xl w-full max-w-[95vw] h-[90vh] flex flex-col border border-slate-700 animate-slide-up overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-700 bg-slate-800 shrink-0">
          <div>
            <h3 className="text-xl font-bold text-white line-clamp-1">{idea.title}</h3>
            <p className="text-sm text-slate-400 flex items-center gap-2">
                <Film className="w-3 h-3" /> AI Video Production Studio
            </p>
          </div>
          <button 
            onClick={onClose}
            className="p-2 hover:bg-slate-700 rounded-lg transition-colors text-slate-400 hover:text-white"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Text Toolbar */}
        <div className="flex items-center gap-2 px-6 py-2 bg-slate-900/50 border-b border-slate-700 shrink-0">
           <button onClick={handleCopy} className="toolbar-btn">
             {copied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
             {copied ? 'Copied' : 'Copy'}
           </button>
           <button onClick={handleSave} className="toolbar-btn">
             <Save className="w-3 h-3" /> Save .txt
           </button>
           <div className="flex-1" />
           {isGenerating ? (
             <div className="flex items-center gap-2 text-xs font-bold text-red-400 animate-pulse px-3 py-1.5">
               <Loader2 className="w-3 h-3 animate-spin" />
               WRITING SCRIPT...
             </div>
           ) : (
             <button onClick={onRegenerate} className="toolbar-btn hover:text-red-400">
               <RefreshCw className="w-3 h-3" /> Regenerate Text
             </button>
           )}
        </div>

        {/* Content Area - Split View */}
        <div className="flex-1 flex min-h-0">
            {/* Editor Area */}
            <div className={`flex-1 relative bg-slate-900 h-full overflow-hidden flex flex-col border-r border-slate-700`}>
              <textarea
                ref={textareaRef}
                value={content}
                onChange={(e) => setContent(e.target.value)}
                disabled={isGenerating}
                placeholder="AI is writing the script..."
                className="w-full h-full bg-slate-50 text-slate-900 p-8 font-serif text-lg leading-loose resize-none focus:outline-none overflow-y-auto"
                spellCheck={false}
              />
              <div ref={bottomRef} />
            </div>

            {/* Right Panel (Tools) */}
            <div className="w-[450px] bg-slate-800 flex flex-col border-l border-slate-700 shrink-0">
                
                {/* Panel Tabs */}
                <div className="flex border-b border-slate-700">
                    <button 
                        onClick={() => setActiveTab('voice')}
                        className={`flex-1 py-3 text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 transition-colors ${
                            activeTab === 'voice' 
                            ? 'bg-slate-800 text-red-400 border-b-2 border-red-500' 
                            : 'bg-slate-900/30 text-slate-500 hover:text-slate-300'
                        }`}
                    >
                        <Mic className="w-3.5 h-3.5" /> Voice Over
                    </button>
                    <button 
                        onClick={() => setActiveTab('seo')}
                        className={`flex-1 py-3 text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 transition-colors ${
                            activeTab === 'seo' 
                            ? 'bg-slate-800 text-blue-400 border-b-2 border-blue-500' 
                            : 'bg-slate-900/30 text-slate-500 hover:text-slate-300'
                        }`}
                    >
                        <Search className="w-3.5 h-3.5" /> SEO & Metadata
                    </button>
                </div>

                {/* VOICE TAB CONTENT */}
                {activeTab === 'voice' && (
                    <div className="flex flex-col h-full overflow-hidden">
                        <div className="p-4 border-b border-slate-700 bg-slate-800/50 shrink-0">
                            <h4 className="text-sm font-bold text-white mb-3 flex items-center gap-2">
                                <Volume2 className="w-4 h-4 text-red-400" /> TTS Config
                            </h4>
                            
                            <div className="flex flex-col gap-3">
                                <select
                                    value={selectedVoice.name}
                                    onChange={(e) => {
                                        const v = VOICES.find(v => v.name === e.target.value);
                                        if (v) setSelectedVoice(v);
                                    }}
                                    disabled={isProcessingMedia || isGenerating}
                                    className="w-full bg-slate-700 text-white text-xs rounded-lg px-3 py-2 outline-none border border-slate-600 focus:border-red-500"
                                >
                                    {VOICES.map(voice => (
                                        <option key={voice.name} value={voice.name}>
                                            {voice.label} - {voice.gender} ({voice.style})
                                        </option>
                                    ))}
                                </select>

                                <button
                                    onClick={handleGenerateAudio}
                                    disabled={isProcessingMedia || isGenerating || !content.trim()}
                                    className="w-full bg-red-600 hover:bg-red-500 disabled:bg-slate-700 disabled:text-slate-500 text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center justify-center gap-2 transition-all shadow-lg"
                                >
                                    {isProcessingMedia ? <Loader2 className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4 fill-current" />}
                                    {isProcessingMedia ? 'Generating Audio...' : 'Generate Audio'}
                                </button>
                            </div>
                        </div>

                        <div className="flex-1 overflow-y-auto p-4 space-y-4">
                            {scriptParts.length === 0 && !isProcessingMedia && (
                                <div className="text-center text-slate-500 text-xs py-12 px-4">
                                    Click "Generate Audio" to split your script into parts and create voice-overs.
                                </div>
                            )}

                            {scriptParts.map((part) => (
                                <div key={part.index} className="bg-slate-900/50 rounded-xl border border-slate-700 p-4 animate-fade-in">
                                    <div className="flex items-center justify-between mb-3 border-b border-slate-700 pb-2">
                                        <span className="text-xs font-bold text-white">Part {part.index + 1}</span>
                                        <div className="flex gap-1">
                                            {part.audioUrl && (
                                                <a 
                                                    href={part.audioUrl}
                                                    download={`part_${part.index + 1}_voiceover.wav`}
                                                    className="p-1.5 hover:bg-slate-700 rounded text-slate-400 hover:text-white transition-colors"
                                                    title="Download Audio"
                                                >
                                                    <Download className="w-3.5 h-3.5" />
                                                </a>
                                            )}
                                        </div>
                                    </div>

                                    <div>
                                        <div className="flex items-center justify-between mb-1.5">
                                            <span className="text-[10px] uppercase font-bold text-slate-500">Audio Preview</span>
                                            <button 
                                                onClick={() => handleRegenerateAudio(part.index)}
                                                disabled={part.isAudioLoading}
                                                className="text-[10px] text-slate-400 hover:text-white flex items-center gap-1"
                                            >
                                                <RefreshCw className={`w-3 h-3 ${part.isAudioLoading ? 'animate-spin' : ''}`} />
                                            </button>
                                        </div>
                                        
                                        {part.isAudioLoading ? (
                                            <div className="h-8 bg-slate-800 rounded animate-pulse w-full flex items-center justify-center">
                                                <span className="text-[10px] text-slate-500">Synthesizing voice...</span>
                                            </div>
                                        ) : part.audioError ? (
                                            <div className="text-xs text-red-400 bg-red-900/20 p-2 rounded">Generation failed</div>
                                        ) : part.audioUrl ? (
                                            <audio controls src={part.audioUrl} className="w-full h-8 block" style={{ height: '32px' }}/>
                                        ) : null}
                                    </div>
                                    
                                    <div className="mt-2 text-[10px] text-slate-600 line-clamp-2">
                                        {part.text}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* SEO TAB CONTENT */}
                {activeTab === 'seo' && (
                    <div className="flex flex-col h-full overflow-hidden">
                        <div className="p-4 border-b border-slate-700 bg-slate-800/50 shrink-0">
                            <h4 className="text-sm font-bold text-white mb-3 flex items-center gap-2">
                                <Search className="w-4 h-4 text-blue-400" /> YouTube Metadata
                            </h4>
                            <p className="text-xs text-slate-400 mb-3">
                                Generate optimized titles, tags, and description for maximum reach.
                            </p>
                            <button
                                onClick={handleGenerateSeo}
                                disabled={isSeoLoading || isGenerating || !content.trim()}
                                className="w-full bg-blue-600 hover:bg-blue-500 disabled:bg-slate-700 disabled:text-slate-500 text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center justify-center gap-2 transition-all shadow-lg"
                            >
                                {isSeoLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
                                {isSeoLoading ? 'Analyzing Script...' : 'Generate Metadata'}
                            </button>
                        </div>

                        <div className="flex-1 overflow-y-auto p-4 space-y-6">
                            {!metadata && !isSeoLoading && (
                                <div className="text-center text-slate-500 text-xs py-12 px-4">
                                    Click "Generate Metadata" to analyze your script for SEO opportunities.
                                </div>
                            )}

                            {isSeoLoading && (
                                <div className="space-y-4 animate-pulse">
                                    <div className="h-20 bg-slate-700/50 rounded-xl"></div>
                                    <div className="h-12 bg-slate-700/50 rounded-xl"></div>
                                    <div className="h-12 bg-slate-700/50 rounded-xl"></div>
                                </div>
                            )}

                            {metadata && (
                                <>
                                    {/* Description */}
                                    <div className="bg-slate-900/50 rounded-xl border border-slate-700 p-4">
                                        <div className="flex items-center justify-between mb-2">
                                            <span className="text-xs font-bold text-blue-400 uppercase">Video Description</span>
                                            <button onClick={() => copyToClipboard(metadata.description)} className="text-slate-400 hover:text-white"><Clipboard className="w-3 h-3" /></button>
                                        </div>
                                        <p className="text-xs text-slate-300 leading-relaxed whitespace-pre-wrap">{metadata.description}</p>
                                    </div>

                                    {/* Tags */}
                                    <div className="bg-slate-900/50 rounded-xl border border-slate-700 p-4">
                                        <div className="flex items-center justify-between mb-2">
                                            <span className="text-xs font-bold text-emerald-400 uppercase flex items-center gap-1"><Hash className="w-3 h-3" /> Tags</span>
                                            <button onClick={() => copyToClipboard(metadata.tags.join(','))} className="text-slate-400 hover:text-white"><Clipboard className="w-3 h-3" /></button>
                                        </div>
                                        <div className="flex flex-wrap gap-1.5">
                                            {metadata.tags.map((tag, i) => (
                                                <span key={i} className="text-[10px] bg-slate-800 text-slate-300 px-2 py-0.5 rounded border border-slate-700">
                                                    {tag}
                                                </span>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Hashtags */}
                                    <div className="bg-slate-900/50 rounded-xl border border-slate-700 p-4">
                                        <div className="flex items-center justify-between mb-2">
                                            <span className="text-xs font-bold text-purple-400 uppercase flex items-center gap-1">Hashtags</span>
                                            <button onClick={() => copyToClipboard(metadata.hashtags.join(' '))} className="text-slate-400 hover:text-white"><Clipboard className="w-3 h-3" /></button>
                                        </div>
                                        <p className="text-xs text-blue-300 font-mono">{metadata.hashtags.join(' ')}</p>
                                    </div>

                                    {/* Pinned Comment */}
                                    <div className="bg-slate-900/50 rounded-xl border border-slate-700 p-4">
                                        <div className="flex items-center justify-between mb-2">
                                            <span className="text-xs font-bold text-yellow-400 uppercase flex items-center gap-1"><MessageSquare className="w-3 h-3" /> Pinned Comment</span>
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
