import { GoogleGenAI, Modality } from "@google/genai";
import { VoiceName } from "../types";
import { base64ToUint8Array, createWavBlob } from "../utils/audioUtils";

const API_KEY = process.env.API_KEY || "";

// Initialize Gemini client
const ai = new GoogleGenAI({ apiKey: API_KEY });

/**
 * Generates audio from text using Gemini 2.5 Flash TTS model.
 * Returns a URL for the generated WAV file.
 */
export const generateSpeech = async (
  text: string, 
  voice: VoiceName
): Promise<{ audioUrl: string }> => {
  if (!API_KEY) {
    throw new Error("La clave API no está configurada.");
  }

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash-preview-tts",
      contents: [{ parts: [{ text: text }] }],
      config: {
        responseModalities: [Modality.AUDIO],
        speechConfig: {
          voiceConfig: {
            prebuiltVoiceConfig: { voiceName: voice },
          },
        },
      },
    });

    const candidate = response.candidates?.[0];
    const audioPart = candidate?.content?.parts?.[0];

    if (!audioPart || !audioPart.inlineData || !audioPart.inlineData.data) {
      throw new Error("No se generó contenido de audio en la respuesta.");
    }

    // Convert Base64 string to Uint8Array (Raw PCM)
    const pcmData = base64ToUint8Array(audioPart.inlineData.data);

    // Wrap PCM in WAV container so it can be played and downloaded by standard browsers
    const wavBlob = createWavBlob(pcmData, 24000); // 24kHz is standard for this model

    // Create object URL
    const audioUrl = URL.createObjectURL(wavBlob);

    return { audioUrl };

  } catch (error: any) {
    console.error("Error en generateSpeech:", error);
    throw new Error(error.message || "Error al generar el audio.");
  }
};