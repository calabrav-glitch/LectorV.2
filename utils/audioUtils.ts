import { WavHeaderOptions } from '../types';

/**
 * Decodes a base64 string into a Uint8Array.
 */
export const base64ToUint8Array = (base64: string): Uint8Array => {
  const binaryString = atob(base64);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
};

/**
 * Creates a WAV file header.
 * Gemini 2.5 Flash TTS typically returns 24kHz, 1 channel (mono), 16-bit PCM.
 */
const createWavHeader = (dataLength: number, options: WavHeaderOptions): Uint8Array => {
  const buffer = new ArrayBuffer(44);
  const view = new DataView(buffer);
  
  const { sampleRate, numChannels, bitsPerSample } = options;
  const byteRate = (sampleRate * numChannels * bitsPerSample) / 8;
  const blockAlign = (numChannels * bitsPerSample) / 8;

  // RIFF identifier
  writeString(view, 0, 'RIFF');
  // RIFF chunk length (file size - 8)
  view.setUint32(4, 36 + dataLength, true);
  // RIFF type
  writeString(view, 8, 'WAVE');
  // format chunk identifier
  writeString(view, 12, 'fmt ');
  // format chunk length
  view.setUint32(16, 16, true);
  // sample format (raw)
  view.setUint16(20, 1, true);
  // channel count
  view.setUint16(22, numChannels, true);
  // sample rate
  view.setUint32(24, sampleRate, true);
  // byte rate (sample rate * block align)
  view.setUint32(28, byteRate, true);
  // block align (channel count * bytes per sample)
  view.setUint16(32, blockAlign, true);
  // bits per sample
  view.setUint16(34, bitsPerSample, true);
  // data chunk identifier
  writeString(view, 36, 'data');
  // data chunk length
  view.setUint32(40, dataLength, true);

  return new Uint8Array(buffer);
};

const writeString = (view: DataView, offset: number, string: string) => {
  for (let i = 0; i < string.length; i++) {
    view.setUint8(offset + i, string.charCodeAt(i));
  }
};

/**
 * Combines raw PCM data with a WAV header to create a playable Blob.
 */
export const createWavBlob = (pcmData: Uint8Array, sampleRate: number = 24000): Blob => {
  const header = createWavHeader(pcmData.length, {
    sampleRate: sampleRate,
    numChannels: 1,
    bitsPerSample: 16 // Gemini typically returns 16-bit PCM
  });

  // Combine header and data
  const wavBytes = new Uint8Array(header.length + pcmData.length);
  wavBytes.set(header);
  wavBytes.set(pcmData, header.length);

  return new Blob([wavBytes], { type: 'audio/wav' });
};