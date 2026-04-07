
export enum Language {
  INDONESIAN = 'id',
  ENGLISH = 'en'
}

export enum OutputFormat {
  TEXT = 'text',
  JSON = 'json'
}

export enum MediaMode {
  IMAGE = 'image',
  VIDEO = 'video'
}

export type PromptStyle = 'auto' | 'photorealistic' | 'digital_art' | 'anime' | 'cinematic' | 'cyberpunk' | 'oil_painting';

export interface PromptConfig {
  style: PromptStyle;
  strength: number; // 0.1 to 1.0 (temperature)
  faceConsistency: boolean;
  sceneDetection: boolean;
}

export interface PromptResult {
  textPrompt: string;
  jsonPrompt: string;
  metadata?: {
    lightingInfo?: string;
    styleDetected?: string;
  };
}

export interface AppTranslation {
  title: string;
  subtitle: string;
  uploadLabel: string;
  generateBtn: string;
  generating: string;
  copySuccess: string;
  downloadLabel: string;
  settingsTitle: string;
  styles: Record<PromptStyle, string>;
  labels: {
    style: string;
    strength: string;
    faceLock: string;
    sceneDetection: string;
    creative: string;
    precise: string;
  };
  modes: {
    image: string;
    video: string;
  };
  formats: {
    text: string;
    json: string;
  };
  errors: {
    noMedia: string;
    apiError: string;
    wrongType: string;
  };
}

export const translations: Record<Language, AppTranslation> = {
  [Language.ENGLISH]: {
    title: "IA STUDIO PROMPTS EXPLORE",
    subtitle: "Get prompts from images and videos you upload",
    uploadLabel: "Click to upload or drag and drop",
    generateBtn: "Generate Expert Prompt",
    generating: "Analyzing media details...",
    copySuccess: "Copied!",
    downloadLabel: "Download JSON",
    settingsTitle: "Expert Settings",
    styles: {
      auto: "Auto Detect",
      photorealistic: "Photorealistic",
      digital_art: "Digital Art",
      anime: "Anime / Manga",
      cinematic: "Cinematic Movie",
      cyberpunk: "Cyberpunk / Neon",
      oil_painting: "Oil Painting"
    },
    labels: {
      style: "Preferred Style",
      strength: "Prompt Creativity",
      faceLock: "Face Consistency Lock",
      sceneDetection: "Auto Scene Detection",
      creative: "Creative",
      precise: "Precise"
    },
    modes: {
      image: "Image Mode",
      video: "Video Mode"
    },
    formats: {
      text: "Text Prompt",
      json: "JSON Prompt"
    },
    errors: {
      noMedia: "Please upload a file first.",
      apiError: "Failed to generate prompt. Please try again.",
      wrongType: "Incorrect file type for selected mode."
    }
  },
  [Language.INDONESIAN]: {
    title: "IA STUDIO PROMPTS EXPLORE",
    subtitle: "Dapatkan prompt dari gambar dan video yang kamu unggah",
    uploadLabel: "Klik untuk unggah atau seret file",
    generateBtn: "Hasilkan Prompt Pakar",
    generating: "Menganalisis detail media...",
    copySuccess: "Disalin!",
    downloadLabel: "Unduh JSON",
    settingsTitle: "Pengaturan Pakar",
    styles: {
      auto: "Deteksi Otomatis",
      photorealistic: "Fotorealistik",
      digital_art: "Seni Digital",
      anime: "Anime / Manga",
      cinematic: "Film Sinematik",
      cyberpunk: "Cyberpunk / Neon",
      oil_painting: "Lukisan Cat Minyak"
    },
    labels: {
      style: "Gaya Pilihan",
      strength: "Kreativitas Prompt",
      faceLock: "Kunci Konsistensi Wajah",
      sceneDetection: "Deteksi Adegan Otomatis",
      creative: "Kreatif",
      precise: "Presisi"
    },
    modes: {
      image: "Mode Gambar",
      video: "Mode Video"
    },
    formats: {
      text: "Prompt Teks",
      json: "Prompt JSON"
    },
    errors: {
      noMedia: "Harap unggah file terlebih dahulu.",
      apiError: "Gagal menghasilkan prompt. Silakan coba lagi.",
      wrongType: "Jenis file tidak sesuai dengan mode terpilih."
    }
  }
};
