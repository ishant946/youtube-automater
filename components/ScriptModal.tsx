import React, { useEffect, useRef, useState } from 'react';
import { X, Copy, RefreshCw, Save, Loader2, Check, Mic, Play, Download, Volume2, Film } from 'lucide-react';
import { VideoIdea, VOICES, VoiceOption, ScriptPart } from '../types';
import { generateSpeech } from '../services/geminiService';

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
  
  // Media State
  const [scriptParts, setScriptParts] = useState<ScriptPart[]>([]);
  const [isProcessingMedia, setIsProcessingMedia] = useState(false);
  
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
      } catch (err) {
          setScriptParts(prev => prev.map(p => p.index === index ? { ...p, isAudioLoading: false, audioError: true } : p));
      }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div 
        className="absolute inset-0 bg-slate-900/80 backdrop-blur-sm"
        onClick={!isGenerating ? onClose : undefined}
      />
      
      <div className="relative bg-slate-800 rounded-2xl shadow-2xl w-full max-w-[90vw] h-[90vh] flex flex-col border border-slate-700 animate-slide-up overflow-hidden">
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

            {/* Media Production Panel */}
            <div className="w-[450px] bg-slate-800 flex flex-col border-l border-slate-700 shrink-0">
                <div className="p-4 border-b border-slate-700 bg-slate-800/50">
                    <h4 className="text-sm font-bold text-white mb-3 flex items-center gap-2">
                        <Mic className="w-4 h-4 text-red-400" /> Voice Over
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
                            {/* Part Header */}
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

                            {/* Audio Section */}
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
                            
                            {/* Text Preview for context */}
                            <div className="mt-2 text-[10px] text-slate-600 line-clamp-2">
                                {part.text}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
      </div>
    </div>
  );
};