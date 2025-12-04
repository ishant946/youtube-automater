import React, { useState } from 'react';
import { ChannelProfile, VideoIdea, AppStep } from './types';
import { analyzeChannel, generateViralTitles, generateScriptStream } from './services/geminiService';
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
  
  // Script Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedIdea, setSelectedIdea] = useState<VideoIdea | null>(null);
  const [scriptContent, setScriptContent] = useState("");
  const [isScriptGenerating, setIsScriptGenerating] = useState(false);

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
    if (!profile) return;
    
    setIsScriptGenerating(true);
    setScriptContent("");
    setError(null);

    try {
      const stream = generateScriptStream(idea.title, profile);
      
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
            <InputSection onAnalyze={handleAnalyze} isLoading={isLoading} />
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
                isWriting={false} // Loading state handled by modal now
                selectedId={selectedIdea?.id || null}
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
