
export interface ChannelProfile {
  channelName: string;
  niche: string;
  tone: string[];
  avgDuration: string;
  hookStyle: string;
  storytellingStyle: string;
  recurringKeywords: string[];
  audienceDemographic: string;
  uploadSchedule: string;
  performanceMetrics: {
    name: string;
    value: number;
    fullMark: number;
  }[];
}

export interface VideoIdea {
  id: string;
  title: string;
  hook: string;
  predictedCTR: string;
  reasoning: string;
}

export interface ScriptSection {
  heading: string;
  content: string;
  visualCue?: string;
  duration?: string;
}

export interface GeneratedScript {
  title: string;
  sections: ScriptSection[];
  totalEstimatedDuration: string;
}

export interface VideoMetadata {
  description: string;
  tags: string[];
  hashtags: string[];
  pinnedComment: string;
}

export enum AppStep {
  INPUT = 'INPUT',
  ANALYZING = 'ANALYZING',
  DASHBOARD = 'DASHBOARD',
  IDEATION = 'IDEATION',
  SCRIPTING = 'SCRIPTING'
}

export interface VoiceOption {
  name: string; // The API value
  label: string; // The UI display
  gender: 'Male' | 'Female';
  style: string;
}

export const VOICES: VoiceOption[] = [
  { name: 'Kore', label: 'Kore', gender: 'Female', style: 'Calm, Soothing' },
  { name: 'Puck', label: 'Puck', gender: 'Male', style: 'Energetic, Clear' },
  { name: 'Charon', label: 'Charon', gender: 'Male', style: 'Deep, Narrative' },
  { name: 'Fenrir', label: 'Fenrir', gender: 'Male', style: 'Strong, Authoritative' },
  { name: 'Zephyr', label: 'Zephyr', gender: 'Female', style: 'Friendly, Upbeat' },
];

export interface ScriptPart {
  index: number;
  text: string;
  audioUrl: string | null;
  isAudioLoading: boolean;
  audioError: boolean;
}

export interface SavedProject {
  id: string;
  name: string;
  timestamp: number;
  profile: ChannelProfile | null;
  ideas: VideoIdea[];
}
