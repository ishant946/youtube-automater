
import * as React from 'react';
import { ChannelProfile } from '../types';
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer } from 'recharts';
import { BarChart2, Clock, Hash, Users, Zap, PenTool, Play } from 'lucide-react';

interface StyleDashboardProps {
  profile: ChannelProfile;
  onGenerateTitles: () => void;
  isGenerating: boolean;
}

export const StyleDashboard: React.FC<StyleDashboardProps> = ({ profile, onGenerateTitles, isGenerating }) => {
  const tones = profile.tone || [];
  const metrics = profile.performanceMetrics || [];
  const keywords = profile.recurringKeywords || [];

  return (
    <div className="max-w-7xl mx-auto px-6 py-10 animate-slide-up">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-6">
        <div>
          <h2 className="text-4xl font-heading font-bold text-white mb-3 tracking-tight">{profile.channelName}</h2>
          <div className="flex flex-wrap gap-2">
             <span className="bg-red-500/10 text-red-400 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider border border-red-500/20 shadow-[0_0_10px_rgba(239,68,68,0.1)]">
                {profile.niche}
             </span>
             {tones.slice(0, 2).map((t, i) => (
                 <span key={i} className="bg-white/5 text-slate-300 px-3 py-1 rounded-full text-xs border border-white/10">
                    {t}
                 </span>
             ))}
          </div>
        </div>
        <button
          onClick={onGenerateTitles}
          disabled={isGenerating}
          className="bg-white text-black hover:bg-slate-200 px-8 py-4 rounded-xl font-bold flex items-center gap-3 shadow-[0_0_20px_rgba(255,255,255,0.2)] transition-all disabled:opacity-50 transform hover:scale-105"
        >
          {isGenerating ? <div className="w-5 h-5 border-2 border-black border-t-transparent rounded-full animate-spin" /> : <Zap className="w-5 h-5 fill-black" />}
          Generate Viral Ideas
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {/* Radar Chart Card */}
        <div className="glass-panel p-6 rounded-3xl col-span-1 min-h-[350px] flex flex-col justify-center relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-32 h-32 bg-red-500/10 rounded-full blur-3xl -mr-10 -mt-10 group-hover:bg-red-500/20 transition-all duration-700"></div>
          <h3 className="text-sm font-bold text-slate-400 mb-6 uppercase tracking-wider flex items-center gap-2 relative z-10">
            <BarChart2 className="w-4 h-4 text-red-500" /> Channel DNA
          </h3>
          <div className="h-[280px] w-full relative z-10">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart cx="50%" cy="50%" outerRadius="70%" data={metrics}>
                <PolarGrid stroke="#ffffff" strokeOpacity={0.1} />
                <PolarAngleAxis dataKey="name" tick={{ fill: '#94a3b8', fontSize: 10, fontWeight: 600 }} />
                <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
                <Radar
                  name="Metrics"
                  dataKey="value"
                  stroke="#ef4444"
                  strokeWidth={3}
                  fill="#ef4444"
                  fillOpacity={0.2}
                />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Key Stats Grid */}
        <div className="col-span-1 md:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-6">
            {/* Stat Card */}
            <div className="glass-panel p-6 rounded-3xl relative overflow-hidden group hover:border-white/20 transition-all">
                <div className="absolute bottom-0 right-0 w-24 h-24 bg-blue-500/10 rounded-full blur-2xl group-hover:bg-blue-500/20 transition-all"></div>
                <div className="flex items-center gap-2 text-slate-400 mb-2 text-xs font-bold uppercase tracking-wider">
                    <Clock className="w-4 h-4 text-blue-500" /> Avg. Duration
                </div>
                <div className="text-3xl font-heading font-bold text-white mt-2">{profile.avgDuration}</div>
            </div>

            <div className="glass-panel p-6 rounded-3xl relative overflow-hidden group hover:border-white/20 transition-all">
                <div className="absolute bottom-0 right-0 w-24 h-24 bg-purple-500/10 rounded-full blur-2xl group-hover:bg-purple-500/20 transition-all"></div>
                <div className="flex items-center gap-2 text-slate-400 mb-2 text-xs font-bold uppercase tracking-wider">
                    <Users className="w-4 h-4 text-purple-500" /> Audience
                </div>
                <div className="text-lg font-medium text-white mt-1 leading-snug line-clamp-2">{profile.audienceDemographic}</div>
            </div>

            <div className="glass-panel p-6 rounded-3xl col-span-1 sm:col-span-2 group hover:border-white/20 transition-all">
                <div className="flex items-center gap-2 text-slate-400 mb-3 text-xs font-bold uppercase tracking-wider">
                    <PenTool className="w-4 h-4 text-yellow-500" /> Hook Strategy
                </div>
                <div className="text-base text-slate-200 leading-relaxed font-light">{profile.hookStyle}</div>
            </div>
            
            <div className="glass-panel p-6 rounded-3xl col-span-1 sm:col-span-2 group hover:border-white/20 transition-all">
                <div className="flex items-center gap-2 text-slate-400 mb-4 text-xs font-bold uppercase tracking-wider">
                    <Hash className="w-4 h-4 text-pink-500" /> Recurring Keywords
                </div>
                <div className="flex flex-wrap gap-2">
                    {keywords.map((kw, i) => (
                        <span key={i} className="text-xs font-medium bg-white/5 text-slate-300 px-3 py-1.5 rounded-lg border border-white/5 group-hover:border-white/10 transition-colors">
                            #{kw}
                        </span>
                    ))}
                </div>
            </div>
        </div>
      </div>
      
      {/* Storytelling Panel */}
      <div className="glass-panel p-8 rounded-3xl relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-red-500 via-purple-500 to-blue-500 opacity-50"></div>
        <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
            <Play className="w-5 h-5 text-white fill-current" /> Storytelling Architecture
        </h3>
        <p className="text-slate-300 leading-loose font-light text-lg">
            {profile.storytellingStyle}
        </p>
      </div>
    </div>
  );
};
