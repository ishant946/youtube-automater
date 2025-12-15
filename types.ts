
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
  { name: 'Aoede', label: 'Aoede', gender: 'Female', style: 'Elegant, Expressive' },
  { name: 'Autonoe', label: 'Autonoe', gender: 'Female', style: 'Bright, Middle pitch' },
  { name: 'Calliope', label: 'Calliope', gender: 'Female', style: 'Warm, Engaging' },
  { name: 'Callirrhoe', label: 'Callirrhoe', gender: 'Female', style: 'Easy-going, Middle pitch' },
  { name: 'Charon', label: 'Charon', gender: 'Male', style: 'Deep, Narrative' },
  { name: 'Enceladus', label: 'Enceladus', gender: 'Male', style: 'Breathy, Lower pitch' },
  { name: 'Fenrir', label: 'Fenrir', gender: 'Male', style: 'Strong, Authoritative' },
  { name: 'Icarus', label: 'Icarus', gender: 'Male', style: 'Soft, Peaceful' },
  { name: 'Kore', label: 'Kore', gender: 'Female', style: 'Calm, Soothing' },
  { name: 'Leda', label: 'Leda', gender: 'Female', style: 'Sophisticated, Calm' },
  { name: 'Orpheus', label: 'Orpheus', gender: 'Male', style: 'Confident, Smooth' },
  { name: 'Orus', label: 'Orus', gender: 'Male', style: 'Firm, Lower middle pitch' },
  { name: 'Puck', label: 'Puck', gender: 'Male', style: 'Energetic, Clear' },
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