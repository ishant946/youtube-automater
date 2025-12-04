import { GoogleGenAI, Type, Modality } from "@google/genai";
import { ChannelProfile, VideoIdea, GeneratedScript } from "../types";

// Initialize Gemini Client
const getAiClient = () => {
  const apiKey = process.env.API_KEY;
  if (!apiKey) {
    throw new Error("API Key not found in environment variables.");
  }
  return new GoogleGenAI({ apiKey });
};

/**
 * Step 1: Analyze the channel using Search Grounding to find style, tone, and stats.
 */
export const analyzeChannel = async (channelInput: string): Promise<ChannelProfile> => {
  const ai = getAiClient();
  
  const prompt = `
    Analyze the YouTube channel "${channelInput}". 
    Use Google Search to find its recent popular videos, descriptions, and general content strategy.
    
    Return a RAW JSON object representing the channel's style profile.
    Do not use markdown formatting (no \`\`\`json or \`\`\`).
    
    The JSON must strictly follow this schema:
    {
      "channelName": "string",
      "niche": "string",
      "tone": ["string", "string"],
      "avgDuration": "string",
      "hookStyle": "string",
      "storytellingStyle": "string",
      "recurringKeywords": ["string", "string"],
      "audienceDemographic": "string",
      "uploadSchedule": "string",
      "performanceMetrics": [
        { "name": "Pacing", "value": 0-100, "fullMark": 100 },
        { "name": "Humor", "value": 0-100, "fullMark": 100 },
        { "name": "InformationDensity", "value": 0-100, "fullMark": 100 },
        { "name": "EditingComplexity", "value": 0-100, "fullMark": 100 },
        { "name": "EmotionalResonance", "value": 0-100, "fullMark": 100 }
      ]
    }
  `;

  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash",
    contents: prompt,
    config: {
      tools: [{ googleSearch: {} }],
    }
  });

  if (!response.text) throw new Error("Failed to analyze channel.");
  
  let jsonStr = response.text.trim();
  
  // Clean up any potential markdown formatting the model might output
  if (jsonStr.includes("```")) {
    jsonStr = jsonStr.replace(/```json/gi, "").replace(/```/g, "").trim();
  }

  try {
    const parsed = JSON.parse(jsonStr);
    
    // Safety check: Ensure arrays exist to prevent .map() errors
    return {
      ...parsed,
      tone: Array.isArray(parsed.tone) ? parsed.tone : ["Informative", "Engaging"],
      recurringKeywords: Array.isArray(parsed.recurringKeywords) ? parsed.recurringKeywords : [],
      performanceMetrics: Array.isArray(parsed.performanceMetrics) ? parsed.performanceMetrics : []
    } as ChannelProfile;
  } catch (e) {
    console.error("Failed to parse JSON", jsonStr);
    throw new Error("AI analysis failed to produce valid JSON. Please try again.");
  }
};

/**
 * Step 2: Generate Viral Titles based on the Profile.
 */
export const generateViralTitles = async (profile: ChannelProfile): Promise<VideoIdea[]> => {
  const ai = getAiClient();
  
  const prompt = `
    Based on the following YouTube Channel Profile, generate 10 viral video ideas.
    
    Profile: ${JSON.stringify(profile)}
    
    The titles must:
    - Match the channel's niche and tone.
    - Use high-CTR patterns (curiosity gaps, negatives, lists).
    - Be competitive in the current YouTube landscape.
  `;

  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash",
    contents: prompt,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            id: { type: Type.STRING },
            title: { type: Type.STRING },
            hook: { type: Type.STRING },
            predictedCTR: { type: Type.STRING },
            reasoning: { type: Type.STRING },
          }
        }
      }
    }
  });

  if (!response.text) throw new Error("Failed to generate titles.");
  try {
     const data = JSON.parse(response.text);
     return Array.isArray(data) ? data : [];
  } catch(e) {
     return [];
  }
};

/**
 * Step 3 (Stream): Generate a Full Script stream based on a selected title.
 * Returns an async generator for real-time typing effect.
 */
export const generateScriptStream = async function* (title: string, profile: ChannelProfile) {
  const ai = getAiClient();
  
  const prompt = `
    Write a complete YouTube narration script for the title: "${title}".
    
    You MUST emulate the style of the channel described below:
    ${JSON.stringify(profile)}
    
    STRICT FORMATTING RULES:
    - OUTPUT PLAIN TEXT ONLY.
    - DO NOT use Markdown formatting (no ## headers, no **bold**, no bullet points).
    - DO NOT include visual cues, camera directions, stage notes, or scene descriptions.
    - DO NOT include speaker labels (e.g., "Host:", "Narrator:").
    - DO NOT include timestamps.
    - Write ONLY the spoken words for the voiceover.
    - The output must be continuous plain text paragraphs suitable for reading aloud.
    
    The script must be full length and ready for recording immediately.
    Start directly with the hook.
  `;

  // Using Gemini 3 Pro for advanced creative writing
  const stream = await ai.models.generateContentStream({
    model: "gemini-3-pro-preview", 
    contents: prompt,
    config: {
        thinkingConfig: { thinkingBudget: 2048 },
    }
  });

  for await (const chunk of stream) {
    if (chunk.text) {
      yield chunk.text;
    }
  }
};

/**
 * Alternate Step 3: Generate Script from Reference Text (Manual Workflow)
 */
export const generateScriptFromReferenceStream = async function* (topic: string, referenceTranscript: string) {
  const ai = getAiClient();
  
  const prompt = `
    Write a complete YouTube narration script for the topic: "${topic}".
    
    Use the following Reference Transcript as a guide for TONE, VOCABULARY, PACING, and STRUCTURE:
    ---
    ${referenceTranscript.substring(0, 10000)}
    ---
    
    STRICT FORMATTING RULES:
    - OUTPUT PLAIN TEXT ONLY.
    - DO NOT use Markdown formatting (no ## headers, no **bold**, no bullet points).
    - DO NOT include visual cues, camera directions, stage notes, or scene descriptions.
    - DO NOT include speaker labels.
    - Write ONLY the spoken words for the voiceover.
    
    Start directly with an engaging hook related to ${topic}.
  `;

  const stream = await ai.models.generateContentStream({
    model: "gemini-3-pro-preview", 
    contents: prompt,
    config: {
        thinkingConfig: { thinkingBudget: 2048 },
    }
  });

  for await (const chunk of stream) {
    if (chunk.text) {
      yield chunk.text;
    }
  }
};

/**
 * Helper: Convert Raw PCM data to WAV Blob
 * Gemini Live API and TTS models return raw PCM (no header).
 * We must wrap it in a WAV container to be playable in browsers.
 */
function pcmToWav(pcmData: Uint8Array, sampleRate: number = 24000): Blob {
  const numChannels = 1;
  const byteRate = sampleRate * numChannels * 2; // 2 bytes per sample (16-bit)
  const blockAlign = numChannels * 2;
  const dataSize = pcmData.length;
  const buffer = new ArrayBuffer(44 + dataSize);
  const view = new DataView(buffer);

  // RIFF chunk descriptor
  writeString(view, 0, 'RIFF');
  view.setUint32(4, 36 + dataSize, true);
  writeString(view, 8, 'WAVE');

  // fmt sub-chunk
  writeString(view, 12, 'fmt ');
  view.setUint32(16, 16, true); // Subchunk1Size (16 for PCM)
  view.setUint16(20, 1, true); // AudioFormat (1 for PCM)
  view.setUint16(22, numChannels, true); // NumChannels
  view.setUint32(24, sampleRate, true); // SampleRate
  view.setUint32(28, byteRate, true); // ByteRate
  view.setUint16(32, blockAlign, true); // BlockAlign
  view.setUint16(34, 16, true); // BitsPerSample

  // data sub-chunk
  writeString(view, 36, 'data');
  view.setUint32(40, dataSize, true);

  // Write PCM data
  const pcmBytes = new Uint8Array(buffer, 44);
  pcmBytes.set(pcmData);

  return new Blob([buffer], { type: 'audio/wav' });
}

function writeString(view: DataView, offset: number, string: string) {
  for (let i = 0; i < string.length; i++) {
    view.setUint8(offset + i, string.charCodeAt(i));
  }
}

/**
 * Step 4: Generate Audio Voice-Over
 */
export const generateSpeech = async (text: string, voiceName: string): Promise<Blob> => {
  const ai = getAiClient();
  
  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash-preview-tts",
    contents: [{ parts: [{ text: text }] }],
    config: {
      responseModalities: [Modality.AUDIO],
      speechConfig: {
        voiceConfig: {
          prebuiltVoiceConfig: { voiceName: voiceName },
        },
      },
    },
  });

  const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
  
  if (!base64Audio) {
    throw new Error("No audio data returned from API");
  }

  // Convert Base64 string to Uint8Array
  const binaryString = atob(base64Audio);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }

  // Convert raw PCM to WAV blob so it is playable
  return pcmToWav(bytes, 24000); 
};