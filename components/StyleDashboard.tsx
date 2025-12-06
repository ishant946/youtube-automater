import * as React from 'react';
import { ChannelProfile } from '../types';
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer } from 'recharts';
import { BarChart2, Clock, Hash, Users, Zap, PenTool } from 'lucide-react';

interface StyleDashboardProps {
  profile: ChannelProfile;
  onGenerateTitles: () => void;
  isGenerating: boolean;
}

export const StyleDashboard: React.FC<StyleDashboardProps> = ({ profile, onGenerateTitles, isGenerating }) => {
  // Safe accessors in case API returns incomplete data
  const tones = profile.tone || [];
  const metrics = profile.performanceMetrics || [];
  const keywords = profile.recurringKeywords || [];

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 animate-slide-up">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h2 className="text-3xl font-bold text-white mb-2">{profile.channelName} <span className="text-slate-500 font-normal text-xl">Style Profile</span></h2>
          <div className="flex gap-2">
             <span className="bg-red-500/10 text-red-400 px-3 py-1 rounded-full text-sm border border-red-500/20 font-medium">
                {profile.niche}
             </span>
             {tones.slice(0, 2).map((t, i) => (
                 <span key={i} className="bg-slate-700/50 text-slate-300 px-3 py-1 rounded-full text-sm border border-slate-600">
                    {t}
                 </span>
             ))}
          </div>
        </div>
        <button
          onClick={onGenerateTitles}
          disabled={isGenerating}
          className="bg-white text-slate-900 hover:bg-slate-100 px-6 py-3 rounded-xl font-bold flex items-center gap-2 shadow-lg shadow-white/10 transition-all disabled:opacity-50"
        >
          {isGenerating ? <div className="w-5 h-5 border-2 border-slate-900 border-t-transparent rounded-full animate-spin" /> : <Zap className="w-5 h-5" />}
          Generate Viral Ideas
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {/* Radar Chart */}
        <div className="bg-slate-800/50 p-6 rounded-2xl border border-slate-700 col-span-1 min-h-[300px] flex flex-col justify-center">
          <h3 className="text-lg font-semibold text-slate-300 mb-4 flex items-center gap-2">
            <BarChart2 className="w-4 h-4 text-emerald-400" /> Content DNA
          </h3>
          <div className="h-[250px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart cx="50%" cy="50%" outerRadius="80%" data={metrics}>
                <PolarGrid stroke="#334155" />
                <PolarAngleAxis dataKey="name" tick={{ fill: '#94a3b8', fontSize: 12 }} />
                <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
                <Radar
                  name="Metrics"
                  dataKey="value"
                  stroke="#ef4444"
                  strokeWidth={2}
                  fill="#ef4444"
                  fillOpacity={0.3}
                />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Key Stats */}
        <div className="bg-slate-800/50 p-6 rounded-2xl border border-slate-700 col-span-1 md:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-4">
            
            <div className="bg-slate-900/50 p-4 rounded-xl border border-slate-700/50">
                <div className="flex items-center gap-2 text-slate-400 mb-2 text-sm font-medium">
                    <Clock className="w-4 h-4 text-blue-400" /> Average Duration
                </div>
                <div className="text-xl font-semibold text-white">{profile.avgDuration}</div>
            </div>

            <div className="bg-slate-900/50 p-4 rounded-xl border border-slate-700/50">
                <div className="flex items-center gap-2 text-slate-400 mb-2 text-sm font-medium">
                    <Users className="w-4 h-4 text-purple-400" /> Audience
                </div>
                <div className="text-xl font-semibold text-white truncate" title={profile.audienceDemographic}>{profile.audienceDemographic}</div>
            </div>

            <div className="bg-slate-900/50 p-4 rounded-xl border border-slate-700/50 col-span-1 sm:col-span-2">
                <div className="flex items-center gap-2 text-slate-400 mb-2 text-sm font-medium">
                    <PenTool className="w-4 h-4 text-yellow-400" /> Hook Strategy
                </div>
                <div className="text-base text-slate-200">{profile.hookStyle}</div>
            </div>
            
            <div className="bg-slate-900/50 p-4 rounded-xl border border-slate-700/50 col-span-1 sm:col-span-2">
                <div className="flex items-center gap-2 text-slate-400 mb-2 text-sm font-medium">
                    <Hash className="w-4 h-4 text-pink-400" /> Recurring Keywords
                </div>
                <div className="flex flex-wrap gap-2">
                    {keywords.map((kw, i) => (
                        <span key={i} className="text-xs bg-slate-800 text-slate-400 px-2 py-1 rounded border border-slate-700">#{kw}</span>
                    ))}
                </div>
            </div>
        </div>
      </div>
      
      <div className="bg-slate-800/50 p-6 rounded-2xl border border-slate-700">
        <h3 className="text-lg font-semibold text-slate-300 mb-4">Storytelling Pattern</h3>
        <p className="text-slate-300 leading-relaxed bg-slate-900/30 p-4 rounded-xl border border-slate-700/50">
            {profile.storytellingStyle}
        </p>
      </div>
    </div>
  );
};