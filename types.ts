export enum VoiceName {
  Puck = 'Puck',
  Charon = 'Charon',
  Kore = 'Kore',
  Fenrir = 'Fenrir',
  Zephyr = 'Zephyr'
}

export interface AudioGenerationState {
  isGenerating: boolean;
  audioUrl: string | null;
  error: string | null;
  transcript: string | null;
}

export interface WavHeaderOptions {
  sampleRate: number;
  numChannels: number;
  bitsPerSample: number;
}

export interface HistoryItem {
  id: string;
  text: string;
  voice: VoiceName;
  audioUrl: string;
  timestamp: number;
}