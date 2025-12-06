
import * as React from 'react';
import { useState, useEffect } from 'react';
import { ChannelProfile, VideoIdea, AppStep, SavedProject } from './types';
import { analyzeChannel, generateViralTitles, generateScriptStream, generateScriptFromReferenceStream } from './services/geminiService';
import { InputSection } from './components/InputSection';
import { StyleDashboard } from './components/StyleDashboard';
import { IdeaSelection } from './components/IdeaSelection';
import { ScriptModal } from './components/ScriptModal';
import { AlertCircle } from 'lucide-react';

const App: React.FC = () => {
  const [step, setStep] = useState<AppStep>(AppStep.INPUT);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [profile, setProfile] = useState<ChannelProfile | null>(null);
  const [ideas, setIdeas] = useState<VideoIdea[]>([]);
  
  // Script Configuration
  const [scriptLength, setScriptLength] = useState("Standard (approx 800-1200 words)");
  
  // Script Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedIdea, setSelectedIdea] = useState<VideoIdea | null>(null);
  const [scriptContent, setScriptContent] = useState("");
  const [isScriptGenerating, setIsScriptGenerating] = useState(false);

  // Saved Projects State
  const [savedProjects, setSavedProjects] = useState<SavedProject[]>([]);

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

    const updatedProjects = [newProject, ...savedProjects.filter(p => p.name !== profile.channelName)]; // Avoid dupes by name, prefer recent
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
    setIsLoading(false); // Stop main loading as modal takes over

    // Determine Length Constraint
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
        setIsModalOpen(false); // Close modal on error to show banner
    } finally {
        setIsScriptGenerating(false);
    }
  };

  // Step 1.75: Direct Text to Audio (No AI Writing)
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
    setIsScriptGenerating(false); // Content is already provided
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
    <div className="min-h-screen bg-slate-900 pb-20 font-sans">
      {/* Navbar */}
      <nav className="border-b border-slate-800 bg-slate-900/50 backdrop-blur-md sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
            <div className="flex items-center gap-2 cursor-pointer" onClick={handleReset}>
                <div className="w-8 h-8 bg-gradient-to-br from-red-600 to-red-400 rounded-lg flex items-center justify-center font-bold text-white text-lg">
                    T
                </div>
                <span className="text-white font-bold text-lg hidden sm:block">TubeGenius AI</span>
            </div>
            {step !== AppStep.INPUT && (
                <div className="flex items-center gap-4">
                    <button onClick={handleReset} className="text-slate-400 hover:text-white text-sm transition-colors">
                        New Analysis
                    </button>
                    {profile && (
                        <div className="flex items-center gap-2">
                             <div className="w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center text-xs font-bold text-white border border-slate-600">
                                {profile.channelName.substring(0, 1)}
                             </div>
                        </div>
                    )}
                </div>
            )}
        </div>
      </nav>

      {/* Error Banner */}
      {error && (
        <div className="max-w-md mx-auto mt-4 bg-red-900/50 border border-red-500 text-red-200 px-4 py-3 rounded-lg flex items-center gap-2 animate-bounce-in z-50 relative">
          <AlertCircle className="w-5 h-5 shrink-0" />
          <span className="text-sm">{error}</span>
          <button onClick={() => setError(null)} className="ml-auto hover:text-white">✕</button>
        </div>
      )}

      {/* Main Content */}
      <main>
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
