import * as React from 'react';
import { useState, useEffect } from 'react';
import { ChannelProfile, VideoIdea, AppStep, SavedProject } from './types';
import { analyzeChannel, generateViralTitles, generateScriptStream, generateScriptFromReferenceStream } from './services/geminiService';
import { InputSection } from './components/InputSection';
import { StyleDashboard } from './components/StyleDashboard';
import { IdeaSelection } from './components/IdeaSelection';
import { ScriptModal } from './components/ScriptModal';
import { AlertCircle, Zap, Sun, Moon } from 'lucide-react';

const App: React.FC = () => {
  const [step, setStep] = useState<AppStep>(AppStep.INPUT);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [profile, setProfile] = useState<ChannelProfile | null>(null);
  const [ideas, setIdeas] = useState<VideoIdea[]>([]);
  
  // Theme State
  const [theme, setTheme] = useState<'dark' | 'light'>(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('theme') as 'dark' | 'light' || 'dark';
    }
    return 'dark';
  });

  // Script Configuration
  const [scriptLength, setScriptLength] = useState("Standard (approx 800-1200 words)");
  
  // Script Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedIdea, setSelectedIdea] = useState<VideoIdea | null>(null);
  const [scriptContent, setScriptContent] = useState("");
  const [isScriptGenerating, setIsScriptGenerating] = useState(false);

  // Saved Projects State
  const [savedProjects, setSavedProjects] = useState<SavedProject[]>([]);

  // Theme Effect
  useEffect(() => {
    const root = window.document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    localStorage.setItem('theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => prev === 'dark' ? 'light' : 'dark');
  };

  // Load from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem('tubeGeniusProjects');
    if (saved) {
      try {
        setSavedProjects(JSON.parse(saved));
      } catch (e) {
        console.error("Failed to load saved projects");
      }
    }
  }, []);

  // Save Project Handler
  const handleSaveProject = () => {
    if (!profile) return;
    
    const newProject: SavedProject = {
        id: Date.now().toString(),
        name: profile.channelName,
        timestamp: Date.now(),
        profile,
        ideas
    };

    const updatedProjects = [newProject, ...savedProjects.filter(p => p.name !== profile.channelName)]; 
    setSavedProjects(updatedProjects);
    localStorage.setItem('tubeGeniusProjects', JSON.stringify(updatedProjects));
  };

  const handleLoadProject = (project: SavedProject) => {
      setProfile(project.profile);
      setIdeas(project.ideas);
      setStep(AppStep.IDEATION);
  };

  const handleDeleteProject = (id: string) => {
      const updated = savedProjects.filter(p => p.id !== id);
      setSavedProjects(updated);
      localStorage.setItem('tubeGeniusProjects', JSON.stringify(updated));
  };

  // Step 1: Analyze Channel
  const handleAnalyze = async (input: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await analyzeChannel(input);
      setProfile(data);
      setStep(AppStep.DASHBOARD);
    } catch (err: any) {
      setError(err.message || "Could not analyze channel. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  // Step 1.5: Manual Create Script (Shortcut)
  const handleCreateFromReference = async (topic: string, transcript: string, matchLength: boolean) => {
    setIsLoading(true);
    setError(null);

    // Create a dummy idea for the modal
    const dummyIdea: VideoIdea = {
        id: `manual-${Date.now()}`,
        title: topic,
        hook: 'Manual Creation',
        predictedCTR: 'N/A',
        reasoning: 'Generated from reference text'
    };
    
    setSelectedIdea(dummyIdea);
    setIsModalOpen(true);
    setScriptContent("");
    setIsScriptGenerating(true);
    setIsLoading(false); 

    let effectiveLength = scriptLength;
    if (matchLength) {
        const wordCount = transcript.trim().split(/\s+/).length;
        effectiveLength = `Approximately ${wordCount} words (matching the reference material length)`;
    }

    try {
        const stream = generateScriptFromReferenceStream(topic, transcript, effectiveLength);
        let fullText = "";
        for await (const chunk of stream) {
            fullText += chunk;
            setScriptContent(fullText);
        }
    } catch (err: any) {
        setError("Failed to generate script from reference. Try again.");
        setIsModalOpen(false); 
    } finally {
        setIsScriptGenerating(false);
    }
  };

  // Step 1.75: Direct Text to Audio
  const handleOpenStudio = (title: string, script: string) => {
    const dummyIdea: VideoIdea = {
        id: `voice-${Date.now()}`,
        title: title,
        hook: 'Direct Text to Voice',
        predictedCTR: 'N/A',
        reasoning: 'User provided script'
    };
    
    setSelectedIdea(dummyIdea);
    setScriptContent(script);
    setIsModalOpen(true);
    setIsScriptGenerating(false); 
  };

  // Step 2: Generate Ideas
  const handleGenerateTitles = async () => {
    if (!profile) return;
    setIsLoading(true);
    try {
      const generatedIdeas = await generateViralTitles(profile);
      setIdeas(generatedIdeas);
      setStep(AppStep.IDEATION);
    } catch (err: any) {
      setError("Failed to generate titles. Try again.");
    } finally {
      setIsLoading(false);
    }
  };

  // Step 3: Stream Script
  const generateScript = async (idea: VideoIdea) => {
    if (!profile) {
        if (idea.id.startsWith('manual-') || idea.id.startsWith('voice-')) {
             return; 
        }
        return; 
    }
    
    setIsScriptGenerating(true);
    setScriptContent("");
    setError(null);

    try {
      const stream = generateScriptStream(idea.title, profile, scriptLength);
      
      let fullText = "";
      for await (const chunk of stream) {
        fullText += chunk;
        setScriptContent(fullText);
      }
    } catch (err: any) {
      setError("Failed to generate script stream. Try again.");
    } finally {
      setIsScriptGenerating(false);
    }
  };

  const handleSelectIdea = (idea: VideoIdea) => {
    setSelectedIdea(idea);
    setIsModalOpen(true);
    generateScript(idea);
  };

  const handleRegenerate = () => {
    if (selectedIdea) {
        if (selectedIdea.id.startsWith('manual-') || selectedIdea.id.startsWith('voice-')) {
            setError("Regeneration is currently only available for Channel Analysis workflows.");
            return;
        }
        generateScript(selectedIdea);
    }
  };

  const handleReset = () => {
    setStep(AppStep.INPUT);
    setProfile(null);
    setIdeas([]);
    setError(null);
    setIsModalOpen(false);
    setSelectedIdea(null);
    setScriptContent("");
  };

  return (
    <div className="min-h-screen cinematic-bg text-dynamic font-sans selection:bg-red-500/30 selection:text-white relative overflow-x-hidden">
      
      {/* Parallax Stars Layer */}
      <div className="star-field fixed inset-0 pointer-events-none z-0"></div>
      
      {/* Navbar */}
      <nav className="border-b border-[var(--nav-border)] bg-[var(--nav-bg)] backdrop-blur-md sticky top-0 z-40 transition-colors duration-400">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
            <div className="flex items-center gap-3 cursor-pointer group" onClick={handleReset}>
                <div className="w-10 h-10 relative">
                    <div className="absolute inset-0 bg-red-600 rounded-xl blur-lg opacity-40 group-hover:opacity-60 transition-opacity"></div>
                    <div className="absolute inset-0 bg-gradient-to-br from-red-600 to-red-500 rounded-xl flex items-center justify-center font-bold text-white text-xl shadow-inner border border-white/10">
                        <Zap className="w-5 h-5 fill-current" />
                    </div>
                </div>
                <span className="text-dynamic font-heading font-bold text-2xl tracking-tight hidden sm:block">TubeGenius<span className="text-red-500">AI</span></span>
            </div>
            
            <div className="flex items-center gap-6">
                {step !== AppStep.INPUT && (
                    <>
                    <button onClick={handleReset} className="text-secondary-dynamic hover:text-dynamic text-sm font-medium transition-colors hover:scale-105 transform duration-200">
                        New Analysis
                    </button>
                    {profile && (
                        <div className="flex items-center gap-3 bg-white/5 px-4 py-2 rounded-full border border-white/10">
                             <div className="w-6 h-6 rounded-full bg-gradient-to-r from-red-600 to-orange-500 flex items-center justify-center text-[10px] font-bold text-white shadow-lg">
                                {profile.channelName.substring(0, 1)}
                             </div>
                             <span className="text-xs font-medium text-dynamic">{profile.channelName}</span>
                        </div>
                    )}
                    </>
                )}
                
                {/* Theme Toggle */}
                <button 
                  onClick={toggleTheme}
                  className="relative p-2 rounded-full bg-white/5 hover:bg-white/10 border border-white/5 transition-all duration-300 hover:scale-110 group"
                  aria-label="Toggle Theme"
                >
                  <div className="relative w-5 h-5">
                    <Sun className={`w-5 h-5 text-amber-400 absolute inset-0 transform transition-all duration-500 ${theme === 'light' ? 'rotate-0 opacity-100 scale-100' : 'rotate-90 opacity-0 scale-50'}`} />
                    <Moon className={`w-5 h-5 text-blue-200 absolute inset-0 transform transition-all duration-500 ${theme === 'dark' ? 'rotate-0 opacity-100 scale-100' : '-rotate-90 opacity-0 scale-50'}`} />
                  </div>
                  <div className="absolute inset-0 rounded-full bg-white/5 blur-md opacity-0 group-hover:opacity-50 transition-opacity"></div>
                </button>
            </div>
        </div>
      </nav>

      {/* Error Banner */}
      {error && (
        <div className="max-w-md mx-auto mt-6 bg-red-500/10 border border-red-500/50 backdrop-blur-md text-red-200 px-6 py-4 rounded-xl flex items-center gap-3 animate-bounce-in z-50 relative shadow-2xl shadow-red-900/20">
          <AlertCircle className="w-5 h-5 shrink-0 text-red-400" />
          <span className="text-sm font-medium">{error}</span>
          <button onClick={() => setError(null)} className="ml-auto hover:text-white transition-colors">✕</button>
        </div>
      )}

      {/* Main Content */}
      <main className="relative z-10">
        {step === AppStep.INPUT && (
            <InputSection 
                onAnalyze={handleAnalyze} 
                onCreateScript={handleCreateFromReference}
                onOpenStudio={handleOpenStudio}
                isLoading={isLoading}
                savedProjects={savedProjects}
                onLoadProject={handleLoadProject}
                onDeleteProject={handleDeleteProject}
            />
        )}
        
        {step === AppStep.DASHBOARD && profile && (
            <StyleDashboard 
                profile={profile} 
                onGenerateTitles={handleGenerateTitles}
                isGenerating={isLoading}
            />
        )}

        {step === AppStep.IDEATION && (
            <IdeaSelection 
                ideas={ideas} 
                onSelect={handleSelectIdea} 
                isWriting={false}
                selectedId={selectedIdea?.id || null}
                scriptLength={scriptLength}
                setScriptLength={setScriptLength}
                onSaveProject={handleSaveProject}
            />
        )}
      </main>

      {/* Script Generation Modal */}
      <ScriptModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        idea={selectedIdea}
        content={scriptContent}
        setContent={setScriptContent}
        isGenerating={isScriptGenerating}
        onRegenerate={handleRegenerate}
      />
    </div>
  );
};

export default App;