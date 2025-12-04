import React, { useEffect, useRef, useState } from 'react';
import { X, Copy, RefreshCw, Save, Loader2, Check, Mic, Play, Download, Volume2, Trash2 } from 'lucide-react';
import { VideoIdea, VOICES, VoiceOption } from '../types';
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

interface AudioSegment {
  index: number;
  text: string;
  url: string | null;
  isLoading: boolean;
  error: boolean;
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
  
  // Audio Segments State
  const [audioSegments, setAudioSegments] = useState<AudioSegment[]>([]);
  const [isProcessingAudio, setIsProcessingAudio] = useState(false);
  
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom while generating script
  useEffect(() => {
    if (isGenerating && bottomRef.current) {
      bottomRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [content, isGenerating]);

  // Cleanup audio URLs on unmount
  useEffect(() => {
    return () => {
      audioSegments.forEach(seg => {
        if (seg.url) URL.revokeObjectURL(seg.url);
      });
    };
  }, [audioSegments]);

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

  // Helper to split text into chunks of ~1000-1200 words
  const splitTextToSegments = (fullText: string): string[] => {
    const words = fullText.split(/\s+/);
    // If short enough, single segment
    if (words.length <= 1200) return [fullText];

    const chunks: string[] = [];
    const paragraphs = fullText.split('\n');
    let currentChunk = '';
    let currentWordCount = 0;

    for (const para of paragraphs) {
      const paraWordCount = para.trim().split(/\s+/).length;
      if (paraWordCount === 0) {
        currentChunk += '\n';
        continue;
      }

      // If adding this paragraph exceeds limit (soft limit 1000, hard 1200)
      if (currentWordCount + paraWordCount > 1000) {
        if (currentChunk.trim()) {
          chunks.push(currentChunk.trim());
        }
        currentChunk = para + '\n';
        currentWordCount = paraWordCount;
      } else {
        currentChunk += para + '\n';
        currentWordCount += paraWordCount;
      }
    }
    
    if (currentChunk.trim()) {
      chunks.push(currentChunk.trim());
    }

    return chunks;
  };

  const handleCreateVoiceOver = async () => {
    if (!content.trim()) return;

    // Reset existing segments
    audioSegments.forEach(seg => { if (seg.url) URL.revokeObjectURL(seg.url); });
    
    const textChunks = splitTextToSegments(content);
    const initialSegments: AudioSegment[] = textChunks.map((text, idx) => ({
      index: idx,
      text,
      url: null,
      isLoading: true,
      error: false
    }));

    setAudioSegments(initialSegments);
    setIsProcessingAudio(true);

    // Process sequentially to be safe
    for (let i = 0; i < initialSegments.length; i++) {
      try {
        const blob = await generateSpeech(initialSegments[i].text, selectedVoice.name);
        const url = URL.createObjectURL(blob);
        
        setAudioSegments(prev => prev.map(seg => 
          seg.index === i ? { ...seg, url, isLoading: false } : seg
        ));
      } catch (err) {
        console.error(`Failed to generate segment ${i + 1}`, err);
        setAudioSegments(prev => prev.map(seg => 
          seg.index === i ? { ...seg, isLoading: false, error: true } : seg
        ));
      }
    }
    setIsProcessingAudio(false);
  };

  const handleRegenerateSegment = async (index: number) => {
    const segment = audioSegments[index];
    if (!segment) return;

    // Update state to loading
    setAudioSegments(prev => prev.map(seg => 
      seg.index === index ? { ...seg, isLoading: true, error: false, url: null } : seg
    ));

    try {
      const blob = await generateSpeech(segment.text, selectedVoice.name);
      const url = URL.createObjectURL(blob);
      setAudioSegments(prev => prev.map(seg => 
        seg.index === index ? { ...seg, url, isLoading: false } : seg
      ));
    } catch (err) {
      setAudioSegments(prev => prev.map(seg => 
        seg.index === index ? { ...seg, isLoading: false, error: true } : seg
      ));
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div 
        className="absolute inset-0 bg-slate-900/80 backdrop-blur-sm"
        onClick={!isGenerating ? onClose : undefined}
      />
      
      <div className="relative bg-slate-800 rounded-2xl shadow-2xl w-full max-w-5xl h-[90vh] flex flex-col border border-slate-700 animate-slide-up overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-700 bg-slate-800 shrink-0">
          <div>
            <h3 className="text-xl font-bold text-white line-clamp-1">{idea.title}</h3>
            <p className="text-sm text-slate-400 flex items-center gap-2">
                <Mic className="w-3 h-3" /> Narration Script Generator
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
           <button
             onClick={handleCopy}
             className="flex items-center gap-2 text-xs font-medium text-slate-300 hover:text-white bg-slate-700/50 hover:bg-slate-700 px-3 py-1.5 rounded-lg transition-colors"
           >
             {copied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
             {copied ? 'Copied' : 'Copy Text'}
           </button>
           <button
             onClick={handleSave}
             className="flex items-center gap-2 text-xs font-medium text-slate-300 hover:text-white bg-slate-700/50 hover:bg-slate-700 px-3 py-1.5 rounded-lg transition-colors"
           >
             <Save className="w-3 h-3" /> Save .txt
           </button>
           <div className="flex-1" />
           {isGenerating ? (
             <div className="flex items-center gap-2 text-xs font-bold text-red-400 animate-pulse px-3 py-1.5">
               <Loader2 className="w-3 h-3 animate-spin" />
               GENERATING NARRATION...
             </div>
           ) : (
             <button
               onClick={onRegenerate}
               className="flex items-center gap-2 text-xs font-medium text-slate-300 hover:text-red-400 bg-slate-700/50 hover:bg-slate-700 px-3 py-1.5 rounded-lg transition-colors"
             >
               <RefreshCw className="w-3 h-3" /> Regenerate Text
             </button>
           )}
        </div>

        {/* Content Area - Split View (Text + Audio List) */}
        <div className="flex-1 flex min-h-0">
            {/* Editor Area */}
            <div className={`flex-1 relative bg-slate-900 h-full overflow-hidden flex flex-col border-r border-slate-700`}>
              <textarea
                ref={textareaRef}
                value={content}
                onChange={(e) => setContent(e.target.value)}
                disabled={isGenerating}
                placeholder="AI is writing the spoken narration..."
                className="w-full h-full bg-slate-50 text-slate-900 p-8 font-serif text-lg leading-loose resize-none focus:outline-none overflow-y-auto"
                spellCheck={false}
              />
              <div ref={bottomRef} />
            </div>

            {/* Audio Panel */}
            <div className="w-80 bg-slate-800 flex flex-col border-l border-slate-700 shrink-0">
                <div className="p-4 border-b border-slate-700 bg-slate-800/50">
                    <h4 className="text-sm font-bold text-white mb-3 flex items-center gap-2">
                        <Volume2 className="w-4 h-4 text-red-400" /> AI Voice-Over
                    </h4>
                    
                    <div className="flex flex-col gap-3">
                        <select
                            value={selectedVoice.name}
                            onChange={(e) => {
                                const v = VOICES.find(v => v.name === e.target.value);
                                if (v) setSelectedVoice(v);
                            }}
                            disabled={isProcessingAudio || isGenerating}
                            className="w-full bg-slate-700 text-white text-xs rounded-lg px-3 py-2 outline-none border border-slate-600 focus:border-red-500"
                        >
                            {VOICES.map(voice => (
                                <option key={voice.name} value={voice.name}>
                                    {voice.label} - {voice.gender} ({voice.style})
                                </option>
                            ))}
                        </select>

                        <button
                            onClick={handleCreateVoiceOver}
                            disabled={isProcessingAudio || isGenerating || !content.trim()}
                            className="w-full bg-red-600 hover:bg-red-500 disabled:bg-slate-700 disabled:text-slate-500 text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center justify-center gap-2 transition-all shadow-lg"
                        >
                            {isProcessingAudio ? <Loader2 className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4 fill-current" />}
                            {isProcessingAudio ? 'Generating...' : 'Create Voice-Over'}
                        </button>
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto p-4 space-y-3">
                    {audioSegments.length === 0 && !isProcessingAudio && (
                        <div className="text-center text-slate-500 text-xs py-8">
                            Click "Create Voice-Over" to generate audio for your script.
                        </div>
                    )}

                    {audioSegments.map((seg) => (
                        <div key={seg.index} className="bg-slate-900/50 rounded-lg border border-slate-700 p-3 animate-fade-in">
                            <div className="flex items-center justify-between mb-2">
                                <span className="text-xs font-bold text-slate-300">Part {seg.index + 1}</span>
                                <div className="flex gap-1">
                                    {seg.url && (
                                        <a 
                                            href={seg.url}
                                            download={`${idea.title}_Part_${seg.index + 1}.wav`}
                                            className="p-1 hover:bg-slate-700 rounded text-slate-400 hover:text-white transition-colors"
                                            title="Download"
                                        >
                                            <Download className="w-3 h-3" />
                                        </a>
                                    )}
                                    <button 
                                        onClick={() => handleRegenerateSegment(seg.index)}
                                        disabled={seg.isLoading}
                                        className="p-1 hover:bg-slate-700 rounded text-slate-400 hover:text-white transition-colors"
                                        title="Regenerate Part"
                                    >
                                        <RefreshCw className={`w-3 h-3 ${seg.isLoading ? 'animate-spin' : ''}`} />
                                    </button>
                                </div>
                            </div>

                            {seg.isLoading ? (
                                <div className="h-8 bg-slate-800 rounded animate-pulse w-full flex items-center justify-center">
                                    <span className="text-[10px] text-slate-500">Generating audio...</span>
                                </div>
                            ) : seg.error ? (
                                <div className="text-xs text-red-400 bg-red-900/20 p-2 rounded">
                                    Generation failed
                                </div>
                            ) : seg.url ? (
                                <audio 
                                    controls 
                                    src={seg.url} 
                                    className="w-full h-8 block" 
                                    style={{ height: '32px' }}
                                />
                            ) : null}
                            
                            <div className="mt-2 text-[10px] text-slate-500 truncate">
                                {seg.text.substring(0, 50)}...
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
