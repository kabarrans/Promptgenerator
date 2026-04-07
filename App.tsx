import React, { useState, useRef, useEffect } from 'react';
import { 
  Language, translations, PromptResult, OutputFormat, 
  MediaMode, PromptStyle, PromptConfig 
} from './types';
import { analyzeMedia } from './services/gemini';
import CopyButton from './components/CopyButton';
import { 
  BrainCircuit,
  Sparkles, 
  Image as ImageIcon, 
  Video, 
  Settings2, 
  Upload, 
  RefreshCw, 
  Download, 
  Languages,
  ChevronRight,
  AlertCircle,
  FileJson,
  Type as TypeIcon,
  Zap
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

const App: React.FC = () => {
  const [lang, setLang] = useState<Language>(Language.ENGLISH);
  const [mode, setMode] = useState<MediaMode>(MediaMode.IMAGE);
  const [config, setConfig] = useState<PromptConfig>({
    style: 'auto',
    strength: 0.4,
    faceConsistency: false,
    sceneDetection: true,
  });

  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<PromptResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [activeFormat, setActiveFormat] = useState<OutputFormat>(OutputFormat.TEXT);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const t = translations[lang];

  useEffect(() => {
    document.documentElement.className = 'light';
  }, []);

  const handleModeChange = (newMode: MediaMode) => {
    if (newMode !== mode) {
      setMode(newMode);
      reset();
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      const isImage = selectedFile.type.startsWith('image/');
      const isVideo = selectedFile.type.startsWith('video/');
      if ((mode === MediaMode.IMAGE && !isImage) || (mode === MediaMode.VIDEO && !isVideo)) {
        setError(t.errors.wrongType);
        return;
      }
      setFile(selectedFile);
      setPreviewUrl(URL.createObjectURL(selectedFile));
      setResult(null);
      setError(null);
    }
  };

  const handleGenerate = async () => {
    if (!file) {
      setError(t.errors.noMedia);
      return;
    }
    setIsLoading(true);
    setError(null);
    try {
      const data = await analyzeMedia(file, lang, config);
      setResult(data);
    } catch (err: any) {
      setError(t.errors.apiError);
    } finally {
      setIsLoading(false);
    }
  };

  const downloadJson = () => {
    if (!result) return;
    const blob = new Blob([result.jsonPrompt], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `prompt_${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const reset = () => {
    setFile(null);
    setPreviewUrl(null);
    setResult(null);
    setError(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const formatJson = (jsonStr: string) => {
    try {
      return JSON.stringify(JSON.parse(jsonStr), null, 2);
    } catch (e) {
      return jsonStr; // Return raw string if parsing fails
    }
  };

  return (
    <div className="min-h-screen transition-colors duration-500 bg-slate-50 text-slate-900 font-sans selection:bg-orange-500 selection:text-white overflow-x-hidden">
      
      {/* Background Glows */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-[10%] -left-[10%] w-[40%] h-[40%] bg-orange-500/20 blur-[120px] rounded-full animate-pulse" />
        <div className="absolute top-[20%] -right-[10%] w-[30%] h-[30%] bg-amber-500/20 blur-[120px] rounded-full animate-pulse delay-700" />
        <div className="absolute -bottom-[10%] left-[20%] w-[40%] h-[40%] bg-yellow-500/10 blur-[120px] rounded-full animate-pulse delay-1000" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 py-8 md:px-8">
        
        {/* Navbar */}
        <nav className="flex flex-col md:flex-row justify-between items-center gap-6 mb-12">
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center gap-4"
          >
            <div className="relative group">
              <div className="absolute -inset-1 bg-gradient-to-r from-orange-600 to-amber-500 rounded-2xl blur opacity-25 group-hover:opacity-50 transition duration-1000 group-hover:duration-200"></div>
              <div className="relative w-14 h-14 bg-white ring-1 ring-slate-200 rounded-2xl flex items-center justify-center shadow-2xl transition-all duration-300 group-hover:scale-110 group-hover:rotate-3">
                <BrainCircuit className="w-8 h-8 text-orange-500" />
              </div>
            </div>
            <div>
              <h1 className="text-2xl md:text-3xl font-black tracking-tight gradient-text uppercase">
                {t.title}
              </h1>
              <p className="text-[10px] font-bold opacity-50 uppercase tracking-[0.2em]">{t.subtitle}</p>
            </div>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center gap-3"
          >
            {/* Language Switcher */}
            <div className="flex items-center gap-1 p-1 rounded-2xl border bg-white border-slate-200 shadow-xl">
              {(['en', 'id'] as const).map((l) => (
                <button
                  key={l}
                  onClick={() => setLang(l as Language)}
                  className={`px-4 py-2 rounded-xl text-xs font-black uppercase transition-all duration-300 ${
                    lang === l 
                    ? 'bg-orange-600 text-white shadow-lg shadow-orange-600/30' 
                    : 'opacity-40 hover:opacity-100'
                  }`}
                >
                  {l}
                </button>
              ))}
            </div>
          </motion.div>
        </nav>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Sidebar: Settings */}
          <motion.aside 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="lg:col-span-3 space-y-6"
          >
            <div className="glass-card p-6 rounded-[2.5rem]">
              <div className="flex items-center gap-3 mb-8">
                <div className="p-2 bg-orange-500/10 rounded-lg">
                  <Settings2 className="w-4 h-4 text-orange-500" />
                </div>
                <h2 className="text-sm font-black uppercase tracking-widest opacity-70">
                  {t.settingsTitle}
                </h2>
              </div>

              <div className="space-y-8">
                {/* Style Selector */}
                <div className="space-y-3">
                  <label className="text-[10px] font-black uppercase tracking-widest opacity-40 ml-1">{t.labels.style}</label>
                  <div className="relative group">
                    <select 
                      value={config.style}
                      onChange={(e) => setConfig({...config, style: e.target.value as PromptStyle})}
                      className="w-full p-4 rounded-2xl text-sm font-bold border appearance-none outline-none transition-all duration-300 bg-slate-50 border-slate-200 focus:border-orange-600"
                    >
                      {(Object.keys(t.styles) as PromptStyle[]).map(style => (
                        <option key={style} value={style}>{t.styles[style]}</option>
                      ))}
                    </select>
                    <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none opacity-40">
                      <ChevronRight className="w-4 h-4 rotate-90" />
                    </div>
                  </div>
                </div>

                {/* Creativity Slider */}
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <label className="text-[10px] font-black uppercase tracking-widest opacity-40 ml-1">{t.labels.strength}</label>
                    <span className="px-2 py-1 bg-orange-500/10 text-orange-500 rounded-lg text-[10px] font-black">
                      {(config.strength * 10).toFixed(0)}/10
                    </span>
                  </div>
                  <div className="relative h-2 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
                    <motion.div 
                      className="absolute top-0 left-0 h-full bg-gradient-to-r from-orange-500 to-amber-500"
                      initial={{ width: 0 }}
                      animate={{ width: `${config.strength * 100}%` }}
                      transition={{ type: "spring", stiffness: 100 }}
                    />
                    <input 
                      type="range" min="0.1" max="1.0" step="0.1"
                      value={config.strength}
                      onChange={(e) => setConfig({...config, strength: parseFloat(e.target.value)})}
                      className="absolute inset-0 w-full opacity-0 cursor-pointer z-10"
                    />
                  </div>
                  <div className="flex justify-between text-[9px] font-black uppercase tracking-tighter opacity-30">
                    <span>{t.labels.precise}</span>
                    <span>{t.labels.creative}</span>
                  </div>
                </div>

                {/* Toggles */}
                <div className="space-y-4 pt-6 border-t border-slate-200 dark:border-slate-800">
                  {[
                    { id: 'faceConsistency', label: t.labels.faceLock, icon: Zap },
                    { id: 'sceneDetection', label: t.labels.sceneDetection, icon: RefreshCw }
                  ].map((toggle) => (
                    <label key={toggle.id} className="flex items-center justify-between cursor-pointer group">
                      <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-lg transition-colors ${config[toggle.id as keyof PromptConfig] ? 'bg-orange-500/10 text-orange-500' : 'bg-slate-500/10 text-slate-500'}`}>
                          <toggle.icon className="w-3.5 h-3.5" />
                        </div>
                        <span className="text-xs font-bold opacity-70 group-hover:opacity-100 transition-opacity">{toggle.label}</span>
                      </div>
                      <div className="relative">
                        <input 
                          type="checkbox" 
                          className="sr-only"
                          checked={config[toggle.id as keyof PromptConfig] as boolean}
                          onChange={(e) => setConfig({...config, [toggle.id]: e.target.checked})}
                        />
                        <div className={`w-10 h-5 rounded-full transition-colors duration-300 ${
                          config[toggle.id as keyof PromptConfig] ? 'bg-orange-600' : 'bg-slate-300 dark:bg-slate-800'
                        }`}>
                          <motion.div 
                            animate={{ x: config[toggle.id as keyof PromptConfig] ? 20 : 4 }}
                            className="absolute top-1 w-3 h-3 bg-white rounded-full shadow-sm"
                          />
                        </div>
                      </div>
                    </label>
                  ))}
                </div>
              </div>
            </div>
          </motion.aside>

          {/* Main Content Area */}
          <main className="lg:col-span-9 space-y-8">
            
            {/* Mode Switcher & Upload */}
            <section className="space-y-6">
              <div className="flex gap-4">
                {[
                  { id: MediaMode.IMAGE, label: t.modes.image, icon: ImageIcon },
                  { id: MediaMode.VIDEO, label: t.modes.video, icon: Video }
                ].map((m) => (
                  <button
                    key={m.id}
                    onClick={() => handleModeChange(m.id)}
                    className={`flex-1 flex items-center justify-center gap-3 p-5 rounded-[2rem] border-2 transition-all duration-500 ${
                      mode === m.id 
                      ? 'bg-orange-600 border-orange-600 text-white shadow-2xl shadow-orange-600/30' 
                      : 'bg-white dark:bg-slate-900/50 border-slate-200 dark:border-slate-800 opacity-60 hover:opacity-100'
                    }`}
                  >
                    <m.icon className={`w-5 h-5 ${mode === m.id ? 'animate-bounce' : ''}`} />
                    <span className="text-sm font-black uppercase tracking-widest">{m.label}</span>
                  </button>
                ))}
              </div>

              <motion.div 
                layout
                className={`relative group glass-card rounded-[3rem] overflow-hidden transition-all duration-500 ${
                  previewUrl ? 'h-auto' : 'h-80'
                }`}
              >
                {!previewUrl ? (
                  <div 
                    onClick={() => fileInputRef.current?.click()}
                    className="absolute inset-0 flex flex-col items-center justify-center cursor-pointer group"
                  >
                    <div className="relative mb-6">
                      <div className="absolute inset-0 bg-orange-500/20 blur-2xl rounded-full scale-150 group-hover:scale-200 transition-transform duration-500" />
                      <div className="relative w-20 h-20 bg-orange-600 rounded-3xl flex items-center justify-center shadow-2xl group-hover:-rotate-6 transition-transform duration-500">
                        <Upload className="w-10 h-10 text-white" />
                      </div>
                    </div>
                    <p className="text-lg font-black tracking-tight mb-2">{t.uploadLabel}</p>
                    <p className="text-xs font-bold opacity-40 uppercase tracking-widest">
                      {mode === MediaMode.IMAGE ? 'JPG, PNG, WEBP' : 'MP4, MOV, WEBM'}
                    </p>
                  </div>
                ) : (
                  <div className="relative group">
                    {mode === MediaMode.IMAGE ? (
                      <img src={previewUrl} alt="Preview" className="w-full h-auto max-h-[600px] object-contain rounded-[3rem]" referrerPolicy="no-referrer" />
                    ) : (
                      <video src={previewUrl} controls className="w-full h-auto max-h-[600px] rounded-[3rem]" />
                    )}
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center backdrop-blur-sm">
                      <button 
                        onClick={reset}
                        className="bg-white text-black px-8 py-4 rounded-2xl font-black uppercase tracking-widest hover:scale-105 transition-transform"
                      >
                        Change Media
                      </button>
                    </div>
                  </div>
                )}
                <input 
                  type="file" 
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  accept={mode === MediaMode.IMAGE ? "image/*" : "video/*"}
                  className="hidden"
                />
              </motion.div>

              {error && (
                <motion.div 
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex items-center gap-3 p-4 bg-red-500/10 border border-red-500/20 text-red-500 rounded-2xl"
                >
                  <AlertCircle className="w-5 h-5" />
                  <span className="text-sm font-bold">{error}</span>
                </motion.div>
              )}

              <button
                disabled={!file || isLoading}
                onClick={handleGenerate}
                className={`w-full py-6 rounded-[2rem] font-black uppercase tracking-[0.2em] transition-all duration-500 flex items-center justify-center gap-4 shadow-2xl ${
                  !file || isLoading
                  ? 'bg-slate-200 dark:bg-slate-800 text-slate-400 cursor-not-allowed'
                  : 'bg-gradient-to-r from-orange-600 via-amber-600 to-yellow-600 text-white hover:scale-[1.02] shadow-orange-500/40'
                }`}
              >
                {isLoading ? (
                  <>
                    <RefreshCw className="w-6 h-6 animate-spin" />
                    {t.generating}
                  </>
                ) : (
                  <>
                    <Sparkles className="w-6 h-6" />
                    {t.generateBtn}
                  </>
                )}
              </button>
            </section>

            {/* Results Area */}
            <AnimatePresence>
              {result && (
                <motion.section 
                  initial={{ opacity: 0, y: 40 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="space-y-6"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex p-1 bg-slate-200 dark:bg-slate-900 rounded-2xl border border-slate-300 dark:border-slate-800">
                      {[
                        { id: OutputFormat.TEXT, label: t.formats.text, icon: TypeIcon },
                        { id: OutputFormat.JSON, label: t.formats.json, icon: FileJson }
                      ].map((f) => (
                        <button
                          key={f.id}
                          onClick={() => setActiveFormat(f.id)}
                          className={`flex items-center gap-2 px-6 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${
                            activeFormat === f.id 
                            ? 'bg-white text-orange-600 shadow-lg' 
                            : 'opacity-40 hover:opacity-100'
                          }`}
                        >
                          <f.icon className="w-4 h-4" />
                          {f.label}
                        </button>
                      ))}
                    </div>

                    {activeFormat === OutputFormat.JSON && (
                      <button 
                        onClick={downloadJson}
                        className="flex items-center gap-2 px-6 py-3 bg-orange-600/10 text-orange-500 rounded-2xl text-xs font-black uppercase tracking-widest hover:bg-orange-600 hover:text-white transition-all"
                      >
                        <Download className="w-4 h-4" />
                        {t.downloadLabel}
                      </button>
                    )}
                  </div>

                  <div className="glass-card rounded-[3rem] p-8 relative group">
                    <div className="absolute top-6 right-6 opacity-0 group-hover:opacity-100 transition-opacity">
                      <CopyButton 
                        text={activeFormat === OutputFormat.TEXT ? result.textPrompt : result.jsonPrompt} 
                        label="Copy" 
                        onCopy={t.copySuccess} 
                      />
                    </div>
                    
                    <div className="modern-scrollbar max-h-[400px] overflow-y-auto pr-4">
                      {activeFormat === OutputFormat.TEXT ? (
                        <p className="text-lg md:text-xl font-medium leading-relaxed opacity-90 first-letter:text-4xl first-letter:font-black first-letter:text-orange-500">
                          {result.textPrompt}
                        </p>
                      ) : (
                        <pre className="text-sm font-mono leading-relaxed text-orange-600 bg-orange-50 border-orange-100 p-6 rounded-3xl border overflow-x-auto">
                          {formatJson(result.jsonPrompt)}
                        </pre>
                      )}
                    </div>
                  </div>
                </motion.section>
              )}
            </AnimatePresence>
          </main>
        </div>

        {/* Footer */}
        <footer className="mt-20 pt-10 border-t border-slate-200 dark:border-slate-800 text-center">
          <p className="text-xs font-black uppercase tracking-[0.3em] opacity-20">
            Powered by Gemini AI &bull; Expert Prompt Engineering
          </p>
        </footer>
      </div>
    </div>
  );
};

export default App;
