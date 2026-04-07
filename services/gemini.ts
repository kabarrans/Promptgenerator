
import { GoogleGenAI, Type } from "@google/genai";
import { Language, PromptResult, PromptConfig } from "../types";

const PROMPT_INSTRUCTION = (lang: Language, config: PromptConfig) => `
You are an expert prompt engineer. Analyze the attached media and extract a detailed, consistent AI prompt.

USER PREFERENCES:
- Language: ${lang === Language.ENGLISH ? 'English' : 'Indonesian'}
- Preferred Style Override: ${config.style}
- Face Consistency Focus: ${config.faceConsistency ? 'YES (Provide extremely detailed facial feature descriptions: eye color, shape, bone structure, skin texture, unique identifiers)' : 'Standard'}
- Scene Detection: ${config.sceneDetection ? 'YES (Describe transitions, movement, and key frames if video)' : 'General'}

STRICT OUTPUT FORMAT:
Provide the response in two parts separated by "|||SEP|||".

Part 1: A narrative, master prompt designed for high-end AI generators.
Part 2: A raw JSON object with keys:
{
  "subject": "Detailed subject description",
  "environment": "Setting and background details",
  "style": "Specific art/photography style",
  "lighting": "Advanced lighting analysis (direction, temperature, intensity)",
  "color_palette": "Hex codes or detailed color names",
  "composition": "Framing, angle, and camera specs",
  "face_details": "Precise facial descriptions (if applicable)",
  "technical_settings": "Lens, shutter, aperture, or render engine specs",
  "mood": "Emotional atmosphere",
  "negative_prompt": "What to avoid"
}

Ensure high technical accuracy. If it's a video, describe the most significant frame or the general sequence.
`;

export const analyzeMedia = async (
  file: File,
  language: Language,
  config: PromptConfig
): Promise<PromptResult> => {
  const apiKey = process.env.API_KEY;
  if (!apiKey) throw new Error("API Key is missing");

  const ai = new GoogleGenAI({ apiKey });
  
  const base64Data = await new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve((reader.result as string).split(',')[1]);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });

  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: {
      parts: [
        { text: PROMPT_INSTRUCTION(language, config) },
        { inlineData: { data: base64Data, mimeType: file.type } },
      ],
    },
    config: {
      temperature: config.strength,
      topP: 0.8,
    }
  });

  const rawText = response.text || "";
  const [textPrompt, ...rest] = rawText.split("|||SEP|||");
  const jsonPromptRaw = rest.join("|||SEP|||");
  
  // Robust JSON extraction: find the first '{' and last '}'
  let jsonPrompt = "{}";
  const firstBrace = jsonPromptRaw.indexOf('{');
  const lastBrace = jsonPromptRaw.lastIndexOf('}');
  
  if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
    jsonPrompt = jsonPromptRaw.substring(firstBrace, lastBrace + 1);
  } else {
    // Fallback if separator is missing or malformed
    const fb = rawText.indexOf('{');
    const lb = rawText.lastIndexOf('}');
    if (fb !== -1 && lb !== -1 && lb > fb) {
      jsonPrompt = rawText.substring(fb, lb + 1);
    }
  }

  return {
    textPrompt: textPrompt.trim() || rawText.split('{')[0].trim(),
    jsonPrompt: jsonPrompt.trim(),
  };
};
