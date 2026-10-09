import { useCallback, useEffect, useRef, useState } from 'react';
import type { FormEvent, ReactNode } from 'react';
import {
  detectCapabilities,
  extractText,
  getEmbeddingsStatus,
  getLlmStatus,
  LLM_DOWNLOAD_MB,
  LLM_MODEL_BY_TIER,
  loadEmbeddings,
  loadLlm,
  shouldAutoPreload,
  startEmbeddingsPreload,
  startLlmPreload,
  subscribeEmbeddings,
  subscribeLlm,
} from '../ai';
import type { EmbeddingsStatus, LlmStatus, Tier } from '../ai';
import { addLlmExplanation, analyze } from '../pipeline/analyze';
import { normalize } from '../pipeline/normalize';
import type { Level, Signal, Verdict } from '../types';
import { copyFor } from './copy';
import { Button } from '@heroui/react';
import { initButtonAnimations } from './buttonAnimations';
import { motion, AnimatePresence } from 'motion/react';
import {
  Warning,
  WarningCircle,
  ShieldCheck,
  MagnifyingGlass,
  CaretLeft,
  UploadSimple,
  ClipboardText,
  Scan,
  Info,
  Sun,
  Moon,
} from '@phosphor-icons/react';

const MAX_MESSAGE_LENGTH = 2_000;
const MAX_IMAGE_BYTES = 10 * 1024 * 1024;
type Screen = 'welcome' | 'scan' | 'result' | 'learn';
type Theme = 'system' | 'light' | 'dark';

type OcrState = 'idle' | 'loading' | 'ready' | 'error';
type FeedbackKey =
  | 'clipboardUnavailable'
  | 'clipboardError'
  | 'screenshotTypeError'
  | 'screenshotLimitError'
  | 'analysisError'
  | 'sharedLimitError'
  | 'shareEmpty';

type SharedPayload = {
  text?: unknown;
  textTooLong?: unknown;
  image?: unknown;
  imageRejected?: unknown;
};

type InstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed'; platform: string }>;
};

function StatusMark({
  level,
  size = 24,
  className = '',
}: {
  level: Level;
  size?: number;
  className?: string;
}) {
  if (level === 'likely_scam')
    return <Warning size={size} weight="fill" className={`text-high ${className}`} />;
  if (level === 'suspicious')
    return <WarningCircle size={size} weight="fill" className={`text-caution ${className}`} />;
  if (level === 'probably_fine')
    return <ShieldCheck size={size} weight="fill" className={`text-good ${className}`} />;
  return <MagnifyingGlass size={size} weight="fill" className={`text-secondary ${className}`} />;
}

function InertMessage({ text }: { text: string }) {
  const urlPattern = /(https?:\/\/[^\s<>]+|www\.[^\s<>]+)/gi;
  const parts = text.split(urlPattern);

  return (
    <>
      {parts.map((part, index) =>
        /^https?:\/\//i.test(part) || /^www\./i.test(part) ? (
          <code
            className="text-primary font-semibold break-all"
            aria-label={part}
            key={`${part}-${index}`}
          >
            {part.replace(/^https:\/\//i, 'hxxps://').replace(/^http:\/\//i, 'hxxp://')}
          </code>
        ) : (
          <span key={`${part}-${index}`}>{part}</span>
        ),
      )}
    </>
  );
}

function HighlightedMessage({ text, signals }: { text: string; signals: Signal[] }) {
  const normalized = normalize(text);
  const spans = signals
    .flatMap((signal) => (signal.span ? [signal.span] : []))
    .map(([start, end]) => [Math.max(0, start), Math.min(normalized.length, end)] as const)
    .filter(([start, end]) => end > start)
    .sort(([left], [right]) => left - right);
  const merged: [number, number][] = [];

  for (const [start, end] of spans) {
    const previous = merged.at(-1);
    if (previous && start <= previous[1]) previous[1] = Math.max(previous[1], end);
    else merged.push([start, end]);
  }

  if (merged.length === 0) return <InertMessage text={normalized} />;

  const parts: ReactNode[] = [];
  let cursor = 0;
  for (const [start, end] of merged) {
    if (start > cursor) {
      parts.push(<InertMessage key={`text-${cursor}`} text={normalized.slice(cursor, start)} />);
    }
    parts.push(
      <mark
        className="bg-caution-surface text-text rounded px-1 -mx-1"
        key={`signal-${start}-${end}`}
      >
        <InertMessage text={normalized.slice(start, end)} />
      </mark>,
    );
    cursor = end;
  }
  if (cursor < normalized.length) {
    parts.push(<InertMessage key={`text-${cursor}`} text={normalized.slice(cursor)} />);
  }
  return <>{parts}</>;
}

function ThemeToggle({
  theme,
  onChange,
  copy,
}: {
  theme: Theme;
  onChange: (theme: Theme) => void;
  copy: ReturnType<typeof copyFor>;
}) {
  const isDark =
    theme === 'dark' ||
    (theme === 'system' &&
      typeof window !== 'undefined' &&
      window.matchMedia('(prefers-color-scheme: dark)').matches);

  const toggleTheme = () => {
    onChange(isDark ? 'light' : 'dark');
  };

  return (
    <Button
      isIconOnly
      variant="ghost"
      size="sm"
      aria-label={isDark ? copy.themeLight : copy.themeDark}
      className="h-9 w-9 rounded-full bg-surface/80 border border-border hover:bg-neutral text-text transition-all flex items-center justify-center cursor-pointer shadow-xs active:scale-95"
      onPress={toggleTheme}
    >
      <motion.div
        key={isDark ? 'dark' : 'light'}
        initial={{ rotate: -90, scale: 0.8, opacity: 0 }}
        animate={{ rotate: 0, scale: 1, opacity: 1 }}
        exit={{ rotate: 90, scale: 0.8, opacity: 0 }}
        transition={{ duration: 0.2 }}
        className="flex items-center justify-center"
      >
        {isDark ? (
          <Sun
            size={20}
            weight="bold"
            className="text-caution hover:scale-110 transition-transform"
          />
        ) : (
          <Moon
            size={20}
            weight="bold"
            className="text-secondary hover:text-text transition-colors"
          />
        )}
      </motion.div>
    </Button>
  );
}

function MainNavigation({
  screen,
  onNavigate,
}: {
  screen: Screen;
  onNavigate: (screen: 'scan' | 'learn') => void;
}) {
  return (
    <nav
      className="inline-flex items-center bg-highlight border border-border/80 backdrop-blur-xl p-1 rounded-full shadow-xs"
      aria-label="Main navigation"
    >
      {(['learn', 'scan'] as const).map((navScreen) => {
        const isSelected = screen === navScreen || (navScreen === 'scan' && screen === 'result');
        return (
          <button
            key={navScreen}
            type="button"
            aria-current={isSelected ? 'page' : undefined}
            onClick={() => onNavigate(navScreen)}
            className={`flex items-center justify-center gap-2 px-5 py-1.5 rounded-full text-sm font-semibold transition-all cursor-pointer select-none outline-none focus-visible:ring-2 focus-visible:ring-primary ${
              isSelected
                ? 'bg-primary text-on-primary shadow-sm font-bold'
                : 'text-secondary hover:text-text hover:bg-neutral/40'
            }`}
          >
            {navScreen === 'scan' ? (
              <Scan size={18} weight={isSelected ? 'bold' : 'regular'} />
            ) : (
              <Info size={18} weight={isSelected ? 'bold' : 'regular'} />
            )}
            <span className="capitalize">{navScreen}</span>
          </button>
        );
      })}
    </nav>
  );
}

export function App() {
  const [screen, setScreen] = useState<Screen>('welcome');
  const [theme, setTheme] = useState<Theme>('system');

  const [message, setMessage] = useState('');
  const [image, setImage] = useState<File | null>(null);
  const [ocrState, setOcrState] = useState<OcrState>('idle');
  const [verdict, setVerdict] = useState<Verdict | null>(null);
  const [resultMessage, setResultMessage] = useState('');
  const [resultIsImage, setResultIsImage] = useState(false);
  const [resultUsedOcr, setResultUsedOcr] = useState(false);
  const [feedback, setFeedback] = useState<FeedbackKey | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const [canInstall, setCanInstall] = useState(false);
  const installPrompt = useRef<InstallPromptEvent | null>(null);
  const ocrRequestId = useRef(0);
  const fileInput = useRef<HTMLInputElement>(null);
  const messageInput = useRef<HTMLTextAreaElement>(null);
  const [embeddingStatus, setEmbeddingStatus] = useState<EmbeddingsStatus>(getEmbeddingsStatus);
  const [modelAtScan, setModelAtScan] = useState<EmbeddingsStatus['state']>('idle');
  const [llmStatus, setLlmStatus] = useState<LlmStatus>(getLlmStatus);
  const [llmWriting, setLlmWriting] = useState(false);
  const llmTier: Tier = detectCapabilities().tier;
  const llmAvailable = LLM_MODEL_BY_TIER[llmTier] !== null;
  const copy = copyFor('en');

  const overLimit = message.length > MAX_MESSAGE_LENGTH;
  const isAppleMobile = /iPhone|iPad|iPod/.test(navigator.userAgent);
  const isStandalone =
    window.matchMedia('(display-mode: standalone)').matches ||
    (navigator as Navigator & { standalone?: boolean }).standalone === true;
  const showIosInstallHint = isAppleMobile && !isStandalone;

  useEffect(() => {
    // The explanation model follows the embedding model so the two downloads do not compete.
    void (startEmbeddingsPreload() ?? Promise.resolve()).finally(() => void startLlmPreload());
    return initButtonAnimations();
  }, []);

  useEffect(() => subscribeEmbeddings(setEmbeddingStatus), []);
  useEffect(() => subscribeLlm(setLlmStatus), []);

  function downloadLlm() {
    void loadLlm(llmTier).catch(() => undefined);
  }

  const clearScreenshot = useCallback(() => {
    ocrRequestId.current += 1;
    setImage(null);
    setOcrState('idle');
  }, []);

  const selectScreenshot = useCallback(
    (file: File | undefined) => {
      setFeedback(null);
      if (!file) return;
      if (!file.type.startsWith('image/')) {
        clearScreenshot();
        setFeedback('screenshotTypeError');
        return;
      }
      if (file.size > MAX_IMAGE_BYTES) {
        clearScreenshot();
        setFeedback('screenshotLimitError');
        return;
      }
      setImage(file);
      setMessage('');
      setScreen('scan');
      setOcrState('loading');
      const requestId = ++ocrRequestId.current;
      void extractText(file)
        .then((text) => {
          if (requestId !== ocrRequestId.current) return;
          setMessage(text);
          setOcrState('ready');
        })
        .catch(() => {
          if (requestId !== ocrRequestId.current) return;
          setOcrState('error');
        });
    },
    [clearScreenshot],
  );

  useEffect(() => {
    const onInstallPrompt = (event: Event) => {
      event.preventDefault();
      installPrompt.current = event as InstallPromptEvent;
      setCanInstall(true);
    };
    const onInstalled = () => {
      installPrompt.current = null;
      setCanInstall(false);
    };
    window.addEventListener('beforeinstallprompt', onInstallPrompt);
    window.addEventListener('appinstalled', onInstalled);
    return () => {
      window.removeEventListener('beforeinstallprompt', onInstallPrompt);
      window.removeEventListener('appinstalled', onInstalled);
    };
  }, []);

  useEffect(() => {
    if (!('serviceWorker' in navigator)) return;

    const appRoot = new URL('./', document.baseURI);
    const onWorkerMessage = (event: MessageEvent) => {
      if (event.data?.type !== 'shared') return;

      const payload = event.data.payload as SharedPayload | null;
      setScreen('scan');
      setFeedback(null);
      if (!payload) {
        setFeedback('shareEmpty');
        return;
      }

      const hasText = typeof payload.text === 'string' && payload.text.length > 0;
      const hasImage = payload.image instanceof File;
      if (!hasText && !hasImage && payload.imageRejected !== true) {
        setFeedback('shareEmpty');
        return;
      }

      if (
        payload.textTooLong === true ||
        (typeof payload.text === 'string' && payload.text.length > MAX_MESSAGE_LENGTH)
      ) {
        setMessage('');
        setFeedback('sharedLimitError');
      } else if (typeof payload.text === 'string') {
        clearScreenshot();
        setMessage(payload.text);
      }

      if (payload.image instanceof File) {
        selectScreenshot(payload.image);
      } else if (payload.imageRejected === true) {
        setFeedback('screenshotLimitError');
      }
    };

    navigator.serviceWorker.addEventListener('message', onWorkerMessage);
    void navigator.serviceWorker
      .register(new URL('sw.js', appRoot), { scope: appRoot.pathname })
      .then(async (registration) => {
        const ready = await navigator.serviceWorker.ready;
        const worker = registration.active ?? ready.active;
        if (!worker) return;
        const resources = performance
          .getEntriesByType('resource')
          .map((entry) => entry.name)
          .filter((name) => {
            try {
              return new URL(name).origin === appRoot.origin;
            } catch {
              return false;
            }
          });
        worker.postMessage({ type: 'cache-shell', resources });

        const currentUrl = new URL(window.location.href);
        if (currentUrl.searchParams.has('shared')) {
          window.history.replaceState({}, '', appRoot.pathname);
          worker.postMessage({ type: 'get-shared' });
        }
      })
      .catch((error: unknown) => console.error('Service worker registration failed', error));

    return () => navigator.serviceWorker.removeEventListener('message', onWorkerMessage);
  }, [clearScreenshot, selectScreenshot]);

  useEffect(() => {
    document.documentElement.lang = 'en';
  }, []);

  useEffect(() => {
    const colorScheme = window.matchMedia('(prefers-color-scheme: dark)');
    const applyTheme = () => {
      const resolved = theme === 'system' ? (colorScheme.matches ? 'dark' : 'light') : theme;
      document.documentElement.dataset.theme = resolved;
      document.documentElement.classList.toggle('dark', resolved === 'dark');
    };

    applyTheme();
    if (theme !== 'system') return;

    colorScheme.addEventListener('change', applyTheme);
    return () => colorScheme.removeEventListener('change', applyTheme);
  }, [theme]);

  async function pasteFromClipboard() {
    setFeedback(null);
    if (!navigator.clipboard?.readText) {
      setFeedback('clipboardUnavailable');
      return;
    }

    try {
      const clipboardText = await navigator.clipboard.readText();
      clearScreenshot();
      setMessage(clipboardText);
    } catch {
      setFeedback('clipboardError');
    }
  }

  async function runAnalysis(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (
      isAnalyzing ||
      ocrState === 'loading' ||
      (!image && !message.trim()) ||
      (!message.trim() && !image) ||
      overLimit
    )
      return;

    setFeedback(null);
    setIsAnalyzing(true);
    const sourceImage = image && !message.trim() ? image : null;
    const sourceMessage = message;
    const modelStateAtScan = getEmbeddingsStatus().state;

    try {
      const result = await analyze(sourceImage ? { image: sourceImage } : { text: sourceMessage }, {
        lang: 'en',
        useLLM: false,
      });
      setVerdict(result);
      if (getLlmStatus().state === 'ready' && sourceMessage.trim()) {
        // Show the verdict now; the on-device explanation fills in when it is written.
        setLlmWriting(true);
        void addLlmExplanation(result, normalize(sourceMessage))
          .then((explained) => setVerdict((current) => (current === result ? explained : current)))
          .finally(() => setLlmWriting(false));
      }
      setModelAtScan(modelStateAtScan);
      setResultMessage(sourceMessage);
      setResultIsImage(Boolean(image));
      setResultUsedOcr(Boolean(image && sourceMessage.trim() && ocrState === 'ready'));
      setScreen('result');
    } catch {
      setFeedback('analysisError');
    } finally {
      setIsAnalyzing(false);
    }
  }

  async function promptInstall() {
    const prompt = installPrompt.current;
    if (!prompt) return;
    await prompt.prompt();
    await prompt.userChoice;
    installPrompt.current = null;
    setCanInstall(false);
  }

  function startAnotherCheck() {
    setMessage('');
    clearScreenshot();
    setVerdict(null);
    setResultMessage('');
    setResultIsImage(false);
    setResultUsedOcr(false);
    setFeedback(null);
    setScreen('scan');
    window.requestAnimationFrame(() => messageInput.current?.focus());
  }

  const feedbackText = feedback ? copy[feedback] : null;

  return (
    <div className="min-h-[100dvh] flex flex-col selection:bg-primary selection:text-white">
      <header
        className={`sticky top-0 z-50 flex h-16 items-center px-4 md:px-8 gap-4 bg-background/90 backdrop-blur-md border-b border-border transition-colors ${screen === 'result' ? 'bg-surface/90' : ''}`}
      >
        {screen === 'result' ? (
          <Button
            isIconOnly
            variant="ghost"
            size="sm"
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-surface border border-transparent hover:bg-highlight active:scale-[0.98] transition-all text-text cursor-pointer"
            aria-label={copy.backToScan}
            onPress={() => setScreen('scan')}
          >
            <CaretLeft size={20} weight="bold" />
          </Button>
        ) : null}
        <button
          className="brand-action flex items-center shrink-0 hover:opacity-85 transition-opacity cursor-pointer"
          type="button"
          aria-label="Sane home"
          onClick={() => setScreen('welcome')}
        >
          <img
            src={`${import.meta.env.BASE_URL}icons/sane-logo.png`}
            alt="Sane"
            className="h-8 sm:h-9 w-auto object-contain"
          />
        </button>
        <div className="flex-1 flex justify-center hidden sm:flex">
          <MainNavigation screen={screen} onNavigate={setScreen} />
        </div>
        <div className="flex items-center gap-2 ml-auto">
          <ThemeToggle theme={theme} onChange={setTheme} copy={copy} />
        </div>
      </header>

      {/* Mobile nav for smaller screens */}
      <div className="sm:hidden flex justify-center items-center px-4 py-2 bg-surface/60 border-b border-border backdrop-blur-md sticky top-16 z-40">
        <MainNavigation screen={screen} onNavigate={setScreen} />
      </div>

      <main className="flex-1 w-full max-w-6xl mx-auto px-4 sm:px-6 md:px-8 py-8 md:py-16 flex flex-col relative overflow-hidden">
        <AnimatePresence mode="wait">
          {screen === 'welcome' && (
            <motion.section
              key="welcome"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="flex-1 grid lg:grid-cols-[minmax(0,1fr)_minmax(280px,420px)] items-center gap-10 lg:gap-16 py-10 md:py-16 max-w-6xl mx-auto w-full"
              aria-labelledby="welcome-title"
            >
              <div className="space-y-6 flex flex-col items-center text-center lg:items-start lg:text-left">
                <div className="space-y-4">
                  <h1
                    id="welcome-title"
                    className="home-headline text-text mx-auto lg:mx-0"
                    lang="fil"
                  >
                    {copy.welcomeTitle.split('? ').map((line, index) => (
                      <span className="block whitespace-nowrap" key={line}>
                        {line}
                        {index === 0 ? '? ' : ''}
                      </span>
                    ))}
                  </h1>
                  <p className="text-lg md:text-xl text-secondary leading-relaxed max-w-[34ch] mx-auto lg:mx-0">
                    {copy.welcomeDescription}
                  </p>
                </div>

                <div className="space-y-4 pt-4 flex flex-col items-center lg:items-start">
                  <Button
                    size="lg"
                    variant="primary"
                    className="home-start px-8 py-4 bg-primary text-on-primary rounded-full font-semibold text-lg hover:opacity-95 active:scale-95 transition-all duration-150 shadow-lg shadow-primary/20 cursor-pointer"
                    onPress={() => setScreen('scan')}
                  >
                    {copy.start}
                  </Button>
                  <p className="text-sm text-secondary">{copy.privacyFootnote}</p>
                </div>
              </div>

              <motion.div
                className="home-mascot-wrap order-last lg:order-none"
                initial={{ opacity: 0, scale: 0.94, y: 12 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                transition={{ duration: 0.45, delay: 0.08, ease: 'easeOut' }}
                aria-hidden="true"
              >
                <span className="mascot-orbit" />
                <span className="mascot-petal" />
                <span className="mascot-pebble" />
                <span className="mascot-spark" />
                <img
                  src={`${import.meta.env.BASE_URL}icons/sane-mascot.png`}
                  alt=""
                  className="home-mascot"
                />
              </motion.div>
            </motion.section>
          )}

          {screen === 'scan' && (
            <motion.div
              key="scan"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="grid lg:grid-cols-[1fr_360px] gap-12 lg:gap-24"
            >
              <div className="space-y-8">
                <div className="space-y-3">
                  <h1 className="text-3xl md:text-5xl font-bold tracking-tighter leading-[1.1] text-text">
                    {copy.scanTitle}
                  </h1>
                  <p className="text-lg text-secondary max-w-[45ch]">{copy.scanDescription}</p>
                </div>

                <form className="space-y-6" onSubmit={runAnalysis}>
                  {image && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="clay-panel rounded-2xl p-4 flex items-center justify-between gap-4"
                      aria-live="polite"
                    >
                      <div className="flex items-center gap-3 overflow-hidden">
                        <div className="h-12 w-12 rounded-lg bg-neutral flex items-center justify-center shrink-0">
                          <UploadSimple size={24} className="text-secondary" />
                        </div>
                        <p className="text-sm font-medium truncate text-text">
                          {copy.screenshotSelected(image.name)}
                        </p>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-sm font-bold text-primary hover:text-text transition-colors px-3 py-1.5 rounded-full hover:bg-neutral shrink-0 cursor-pointer"
                        onPress={clearScreenshot}
                      >
                        {copy.useText}
                      </Button>
                    </motion.div>
                  )}

                  <div className="space-y-2">
                    <label
                      className="text-sm font-bold text-text tracking-tight flex"
                      htmlFor="message-input"
                    >
                      {image ? copy.extractedMessageLabel : copy.messageLabel}
                    </label>
                    <div className="relative">
                      <textarea
                        ref={messageInput}
                        id="message-input"
                        rows={6}
                        value={message}
                        placeholder={copy.messagePlaceholder}
                        aria-describedby="message-count"
                        disabled={ocrState === 'loading'}
                        onChange={(event) => {
                          setMessage(event.currentTarget.value);
                          setFeedback(null);
                        }}
                        className="w-full clay-inset p-5 pb-10 text-base text-text placeholder:text-secondary/60 focus:outline-none focus:ring-2 focus:ring-primary/40 transition-all resize-y min-h-[180px]"
                      />
                      <div
                        id="message-count"
                        className={`absolute bottom-4 right-4 text-xs font-mono font-medium ${overLimit ? 'text-high' : 'text-secondary/60'}`}
                        aria-live="polite"
                      >
                        {copy.characterCount(message.length, MAX_MESSAGE_LENGTH)}
                      </div>
                    </div>
                    {overLimit && (
                      <p className="text-sm text-high font-medium flex items-center gap-1.5 mt-2">
                        <WarningCircle size={16} />
                        {copy.overLimit}
                      </p>
                    )}
                  </div>

                  <div
                    className="space-y-2 text-sm text-secondary"
                    role="status"
                    aria-live="polite"
                  >
                    {embeddingStatus.state === 'loading' && (
                      <p>{copy.modelPreparing(embeddingStatus.progress)}</p>
                    )}
                    {embeddingStatus.state === 'ready' && <p>{copy.modelReadyStatus}</p>}
                    {embeddingStatus.state === 'idle' && !shouldAutoPreload() && (
                      <>
                        <p>{copy.modelPausedStatus}</p>
                        <Button
                          type="button"
                          variant="outline"
                          onPress={() => void loadEmbeddings().catch(() => undefined)}
                        >
                          {copy.modelPrepare}
                        </Button>
                      </>
                    )}
                    {embeddingStatus.state === 'error' && (
                      <>
                        <p>{copy.modelFailedStatus}</p>
                        <Button
                          type="button"
                          variant="outline"
                          onPress={() => void loadEmbeddings().catch(() => undefined)}
                        >
                          {copy.modelRetry}
                        </Button>
                        {embeddingStatus.message && (
                          <details>
                            <summary>{copy.modelDetails}</summary>
                            <p>{embeddingStatus.message}</p>
                          </details>
                        )}
                      </>
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <Button
                      variant="outline"
                      size="md"
                      fullWidth
                      className="w-full flex items-center justify-center gap-2 py-3.5 bg-surface transition-all duration-150 rounded-xl font-bold text-sm text-text cursor-pointer"
                      onPress={pasteFromClipboard}
                    >
                      <ClipboardText size={18} /> {copy.paste}
                    </Button>
                    <Button
                      variant="outline"
                      size="md"
                      fullWidth
                      className="w-full flex items-center justify-center gap-2 py-3.5 bg-surface transition-all duration-150 rounded-xl font-bold text-sm text-text cursor-pointer"
                      onPress={() => fileInput.current?.click()}
                    >
                      <UploadSimple size={18} /> {copy.upload}
                    </Button>
                    <input
                      ref={fileInput}
                      type="file"
                      accept="image/*"
                      hidden
                      onChange={(event) => {
                        selectScreenshot(event.currentTarget.files?.[0]);
                        event.currentTarget.value = '';
                      }}
                    />
                  </div>

                  <Button
                    type="submit"
                    variant="primary"
                    size="lg"
                    fullWidth
                    className="w-full py-4.5 bg-primary text-on-primary rounded-xl font-bold text-lg hover:opacity-95 active:scale-[0.97] transition-all duration-150 shadow-lg shadow-primary/20 flex items-center justify-center gap-2 cursor-pointer disabled:bg-surface/60 disabled:border disabled:border-border disabled:text-secondary/50 disabled:shadow-none disabled:cursor-not-allowed disabled:active:scale-100"
                    isDisabled={
                      isAnalyzing ||
                      ocrState === 'loading' ||
                      (!image && !message.trim()) ||
                      overLimit
                    }
                  >
                    {isAnalyzing ? (
                      <>
                        <motion.div
                          animate={{ rotate: 360 }}
                          transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}
                        >
                          <MagnifyingGlass size={20} />
                        </motion.div>{' '}
                        {copy.checking}
                      </>
                    ) : (
                      <>
                        <MagnifyingGlass size={20} /> {copy.analyze}
                      </>
                    )}
                  </Button>

                  <div className="space-y-2 mt-4">
                    {feedbackText && (
                      <p
                        className="text-sm text-high font-medium flex items-center gap-1.5"
                        role="alert"
                      >
                        <WarningCircle size={16} />
                        {feedbackText}
                      </p>
                    )}
                    {ocrState === 'loading' && (
                      <p className="text-sm text-secondary font-medium" role="status">
                        {copy.screenshotLoading}
                      </p>
                    )}
                    {ocrState === 'ready' && (
                      <p className="text-sm text-good font-medium flex items-center gap-1.5">
                        <ShieldCheck size={16} />
                        {copy.screenshotReady}
                      </p>
                    )}
                    {ocrState === 'error' && (
                      <p
                        className="text-sm text-high font-medium flex items-center gap-1.5"
                        role="status"
                      >
                        <WarningCircle size={16} />
                        {copy.screenshotFailed}
                      </p>
                    )}
                  </div>
                  <p className="text-xs text-secondary text-center mt-6">{copy.pasteOnlyNotice}</p>
                </form>
              </div>

              <aside className="space-y-6 lg:pt-16">
                <div className="clay-panel rounded-2xl p-6">
                  <h2 className="text-base font-bold text-text tracking-tight mb-2 flex items-center gap-2">
                    <ShieldCheck size={18} className="text-good" /> {copy.readyTitle}
                  </h2>
                  <p className="text-sm text-secondary leading-relaxed">{copy.readyDescription}</p>
                </div>
                <section
                  className="clay-panel rounded-2xl p-6 space-y-3"
                  aria-labelledby="llm-title"
                >
                  <h2 id="llm-title" className="text-base font-bold text-text tracking-tight">
                    {copy.llmTitle}
                  </h2>
                  {llmAvailable ? (
                    <>
                      <p className="text-xs text-secondary leading-relaxed">
                        {copy.llmDescription}
                      </p>
                      {llmStatus.state === 'idle' && (
                        <div className="space-y-2">
                          <p className="text-xs text-secondary">
                            {copy.llmPromptBody(LLM_DOWNLOAD_MB)}
                          </p>
                          <Button size="sm" variant="outline" onPress={downloadLlm}>
                            {copy.llmDownloadAction}
                          </Button>
                        </div>
                      )}
                      {llmStatus.state === 'loading' && (
                        <div className="space-y-2" role="status" aria-live="polite">
                          <p className="text-xs text-secondary">
                            {copy.llmProgress(llmStatus.progress)}
                          </p>
                          <progress
                            className="w-full h-2"
                            max={100}
                            value={llmStatus.progress}
                            aria-label={copy.llmProgressLabel}
                          />
                        </div>
                      )}
                      {llmStatus.state === 'ready' && (
                        <p className="text-xs text-good font-medium" role="status">
                          {copy.llmReady}
                        </p>
                      )}
                      {llmStatus.state === 'error' && (
                        <div className="space-y-2" role="alert">
                          <p className="text-xs text-high font-medium">{copy.llmError}</p>
                          <Button size="sm" variant="outline" onPress={downloadLlm}>
                            {copy.llmRetry}
                          </Button>
                        </div>
                      )}
                    </>
                  ) : (
                    <p className="text-xs text-secondary">{copy.llmUnavailable}</p>
                  )}
                </section>
                <section className="px-2">
                  <h2 className="text-sm font-bold uppercase tracking-widest text-secondary mb-4">
                    {copy.howTitle}
                  </h2>
                  <ol className="space-y-4">
                    {copy.howSteps.map((step, i) => (
                      <li key={step} className="flex gap-4 text-sm text-text leading-relaxed">
                        <span className="flex-shrink-0 flex items-center justify-center h-6 w-6 rounded-full bg-primary-tonal text-primary font-bold text-xs">
                          {i + 1}
                        </span>
                        {step}
                      </li>
                    ))}
                  </ol>
                </section>
                {showIosInstallHint && (
                  <p className="text-xs text-secondary px-2">{copy.iosInstallHint}</p>
                )}
              </aside>
            </motion.div>
          )}

          {screen === 'result' && verdict && (
            <motion.div
              key="result"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="max-w-4xl mx-auto w-full space-y-8"
            >
              <div className="text-center space-y-3 mb-8">
                <h1 className="text-3xl md:text-5xl font-bold tracking-tighter leading-[1.1] text-text mx-auto">
                  {copy.resultTitle}
                </h1>
                <p className="text-lg text-secondary">{copy.resultSubtitle}</p>
              </div>

              <div className="grid md:grid-cols-[2fr_1fr] gap-6" aria-live="polite">
                <div className="space-y-6">
                  {/* Verdict Badge */}
                  <div
                    className={`p-6 rounded-2xl flex items-center gap-4 ${verdict.level === 'likely_scam' ? 'bg-high-surface text-high' : verdict.level === 'suspicious' ? 'bg-caution-surface text-caution' : verdict.level === 'probably_fine' ? 'bg-good-surface text-good' : 'bg-surface text-secondary'}`}
                    role="status"
                  >
                    <StatusMark level={verdict.level} size={32} />
                    <div>
                      <h2 className="text-2xl font-bold tracking-tight">
                        {copy.assessment[verdict.level].label}
                      </h2>
                      <p className="text-sm opacity-90 mt-1">
                        {resultUsedOcr
                          ? copy.coverageOcr
                          : resultIsImage
                            ? copy.coverageImage
                            : copy.coverageText}
                      </p>
                    </div>
                  </div>

                  {/* Summary & Next Step */}
                  <div className="clay-panel rounded-2xl p-6 space-y-6">
                    <p className="text-lg leading-relaxed text-text font-medium">
                      {copy.assessment[verdict.level].summary}
                    </p>

                    <div
                      className={`p-5 rounded-xl border ${verdict.level === 'likely_scam' ? 'bg-high-surface/50 border-high/20' : verdict.level === 'suspicious' ? 'bg-caution-surface/50 border-caution/20' : 'bg-neutral border-border'}`}
                    >
                      <h3 className="font-bold text-text flex items-center gap-2 mb-2">
                        <StatusMark level="suspicious" size={18} />
                        {copy.nextPrefix}: {copy.assessment[verdict.level].nextTitle}
                      </h3>
                      <p className="text-sm text-text/80 leading-relaxed">
                        {copy.assessment[verdict.level].nextStep}
                      </p>
                      {(verdict.level === 'likely_scam' || verdict.level === 'suspicious') &&
                        verdict.explanation.steps.length > 0 && (
                          <ul className="mt-3 space-y-2 list-disc pl-5 text-sm text-text/90 leading-relaxed">
                            {verdict.explanation.steps.map((step) => (
                              <li key={step}>{step}</li>
                            ))}
                          </ul>
                        )}
                    </div>
                  </div>

                  {/* LLM Explanation */}
                  {llmWriting && !verdict.explanation.extra && (
                    <p className="clay-panel rounded-2xl p-6 text-sm text-secondary" role="status">
                      {copy.llmWriting}
                    </p>
                  )}
                  {verdict.explanation.extra && (
                    <div className="clay-panel rounded-2xl p-6 space-y-3">
                      <h3 className="font-bold text-text">{copy.llmExplanationTitle}</h3>
                      <p className="text-sm text-text whitespace-pre-wrap leading-relaxed">
                        {verdict.explanation.extra}
                      </p>
                      <p className="text-xs text-secondary italic mt-4">{copy.llmDisclaimer}</p>
                    </div>
                  )}

                  {/* Evidence / Signals */}
                  <div className="clay-panel rounded-2xl p-6 space-y-4">
                    <h3 className="font-bold text-text">{copy.rulesTitle}</h3>
                    {verdict.signals.length > 0 ? (
                      <ul className="space-y-3">
                        {verdict.signals.map((signal, index) => (
                          <li
                            key={`${signal.id}-${index}`}
                            className="flex gap-3 text-sm text-text leading-relaxed bg-surface border border-border p-3 rounded-lg"
                          >
                            <WarningCircle size={18} className="shrink-0 text-caution mt-0.5" />
                            {signal.label}
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p className="text-sm text-secondary bg-neutral p-4 rounded-lg">
                        {copy.noSignals}
                      </p>
                    )}
                    <p className="text-xs text-secondary mt-2">{copy.signalNote}</p>
                  </div>

                  {verdict.level === 'probably_fine' && (
                    <aside className="clay-panel bg-neutral/50 rounded-2xl p-6 space-y-2">
                      <h3 className="font-bold text-text">{copy.notAGuaranteeTitle}</h3>
                      <p className="text-sm text-secondary">{copy.notAGuarantee}</p>
                    </aside>
                  )}
                  {resultIsImage && !resultMessage && (
                    <p
                      className="text-sm text-high font-medium flex items-center gap-1.5"
                      role="status"
                    >
                      <WarningCircle size={16} />
                      {copy.screenshotFailed}
                    </p>
                  )}
                </div>

                <aside className="space-y-6">
                  {/* Original Message */}
                  <div className="clay-panel rounded-2xl p-6 space-y-4">
                    <h3 className="font-bold text-text">{copy.originalTitle}</h3>
                    <div className="bg-surface border border-border rounded-xl p-4 text-sm text-text/90 leading-relaxed font-mono whitespace-pre-wrap max-h-64 overflow-y-auto shadow-inner">
                      {resultMessage ? (
                        <HighlightedMessage text={resultMessage} signals={verdict.signals} />
                      ) : (
                        copy.imageOriginal
                      )}
                    </div>
                    <p className="text-xs text-secondary">{copy.originalNote}</p>

                    {resultMessage && normalize(resultMessage) !== resultMessage && (
                      <details className="text-sm group">
                        <summary className="cursor-pointer font-medium text-primary hover:text-text transition-colors pb-2">
                          {copy.viewOriginal}
                        </summary>
                        <div className="bg-neutral rounded-lg p-3 text-xs font-mono text-secondary whitespace-pre-wrap">
                          <InertMessage text={resultMessage} />
                        </div>
                      </details>
                    )}
                  </div>

                  {/* Tech stack transparency */}
                  <div className="clay-panel rounded-2xl p-6 space-y-3">
                    <h3 className="text-sm font-bold uppercase tracking-widest text-secondary">
                      {copy.modelTitle}
                    </h3>
                    <div className="text-sm text-text/80 space-y-2">
                      <p>
                        {verdict.usedModels.embeddings ||
                        verdict.usedModels.ocr ||
                        verdict.usedModels.llm ||
                        resultUsedOcr
                          ? copy.modelRan
                          : modelAtScan === 'loading'
                            ? copy.modelNotReadyAtScan
                            : modelAtScan === 'error'
                              ? copy.modelFailedAtScan
                              : modelAtScan === 'idle' && !shouldAutoPreload()
                                ? copy.modelSkippedAtScan
                                : copy.noModel}
                      </p>
                      <p className="flex items-center gap-2">
                        <span
                          className={`h-2 w-2 rounded-full ${verdict.usedModels.llm ? 'bg-good' : 'bg-secondary'}`}
                        />
                        {verdict.usedModels.llm ? copy.llmModelRan : copy.llmModelNotRun}
                      </p>
                      {resultUsedOcr && (
                        <p className="flex items-center gap-2">
                          <span className="h-2 w-2 rounded-full bg-good" />
                          {copy.ocrUsed}
                        </p>
                      )}
                    </div>
                  </div>

                  <Button
                    variant="primary"
                    size="lg"
                    fullWidth
                    className="w-full py-4 bg-primary text-on-primary rounded-xl font-bold text-base hover:opacity-95 active:scale-95 transition-all duration-150 shadow-lg shadow-primary/20 flex items-center justify-center gap-2 cursor-pointer"
                    onPress={startAnotherCheck}
                  >
                    {copy.another}
                  </Button>

                  {canInstall && (
                    <Button
                      variant="outline"
                      size="md"
                      fullWidth
                      className="w-full py-3 bg-surface text-primary font-bold text-sm rounded-xl transition-all duration-150 flex items-center justify-center gap-2 cursor-pointer"
                      onPress={promptInstall}
                    >
                      {copy.installApp}
                    </Button>
                  )}
                </aside>
              </div>
            </motion.div>
          )}

          {screen === 'learn' && (
            <motion.div
              key="learn"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="max-w-3xl mx-auto w-full space-y-12"
            >
              <div className="text-center space-y-4 mb-12">
                <h1 className="text-4xl md:text-5xl font-bold tracking-tighter leading-[1.1] text-text mx-auto">
                  {copy.learnTitle}
                </h1>
                <p className="text-lg text-secondary max-w-[50ch] mx-auto">
                  {copy.learnDescription}
                </p>
              </div>

              <div className="grid gap-6">
                {copy.guides.map((guide) => (
                  <div className="clay-panel rounded-2xl p-6 md:p-8 space-y-3" key={guide.title}>
                    <h2 className="text-xl font-bold tracking-tight flex items-center gap-3">
                      <div className="h-8 w-8 rounded-full bg-primary-tonal text-primary flex items-center justify-center shrink-0">
                        <Info size={20} weight="bold" />
                      </div>
                      {guide.title}
                    </h2>
                    <p className="text-text/80 leading-relaxed pl-11">{guide.body}</p>
                  </div>
                ))}
              </div>

              <aside className="clay-panel bg-neutral/50 rounded-2xl p-6 md:p-8 text-center space-y-3">
                <h2 className="font-bold text-text">{copy.learnDisclaimerTitle}</h2>
                <p className="text-sm text-secondary">{copy.learnDisclaimer}</p>
              </aside>

              <div className="flex justify-center pt-8">
                <Button
                  size="lg"
                  variant="primary"
                  className="px-8 py-4 bg-primary text-on-primary rounded-full font-bold text-lg hover:opacity-95 active:scale-95 transition-all duration-150 shadow-lg shadow-primary/20 cursor-pointer"
                  onPress={() => setScreen('scan')}
                >
                  {copy.learnAction}
                </Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>
      <footer className="w-full border-t border-border bg-surface/30 mt-auto">
        <div className="mx-auto flex max-w-6xl flex-col sm:flex-row items-center justify-between gap-4 px-4 sm:px-6 md:px-8 py-8 text-sm text-secondary">
          <div className="flex items-center gap-4">
            <button
              type="button"
              onClick={() => setScreen('welcome')}
              className="brand-action flex items-center gap-2 hover:opacity-85 transition-opacity cursor-pointer"
              aria-label="Sane home"
            >
              <img
                src={`${import.meta.env.BASE_URL}icons/sane-logo.png`}
                alt="Sane"
                className="h-6 w-auto opacity-70"
              />
            </button>
            <p className="font-medium text-text/80">When in doubt, sane it out.</p>
          </div>
          <div className="flex items-center gap-6 text-xs font-semibold">
            <button type="button" className="hover:text-text transition-colors cursor-pointer">
              Privacy Policy
            </button>
            <button type="button" className="hover:text-text transition-colors cursor-pointer">
              Terms of Service
            </button>
            <span>&copy; {new Date().getFullYear()} Sane</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
