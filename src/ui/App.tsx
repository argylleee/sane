import { useCallback, useEffect, useRef, useState } from 'react';
import type { FormEvent, ReactNode } from 'react';
import { extractText, startEmbeddingsPreload } from '../ai';
import { analyze } from '../pipeline/analyze';
import { normalize } from '../pipeline/normalize';
import type { Lang, Level, Signal, Verdict } from '../types';

import { copyFor } from './copy';

const MAX_MESSAGE_LENGTH = 2_000;
const MAX_IMAGE_BYTES = 10 * 1024 * 1024;
const LANGUAGES: readonly Lang[] = ['en', 'fil', 'taglish'];
const LANGUAGE_NAMES: Record<Lang, string> = { en: 'English', fil: 'Filipino', taglish: 'Taglish' };
const THEMES = ['system', 'light', 'dark'] as const;
type Screen = 'welcome' | 'scan' | 'result' | 'learn';
type Theme = (typeof THEMES)[number];
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

function StatusMark({ level }: { level: Level }) {
  if (level === 'likely_scam') {
    return (
      <svg aria-hidden="true" viewBox="0 0 24 24" focusable="false">
        <path d="M12 3.5 22 21H2L12 3.5Z" />
        <path d="M12 9v5m0 3h.01" />
      </svg>
    );
  }

  if (level === 'suspicious') {
    return (
      <svg aria-hidden="true" viewBox="0 0 24 24" focusable="false">
        <circle cx="12" cy="12" r="9.5" />
        <path d="M12 7v6m0 4h.01" />
      </svg>
    );
  }

  if (level === 'probably_fine') {
    return (
      <svg aria-hidden="true" viewBox="0 0 24 24" focusable="false">
        <circle cx="12" cy="12" r="9.5" />
        <path d="m7.5 12.5 3 3 6-7" />
      </svg>
    );
  }

  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" focusable="false">
      <circle cx="12" cy="12" r="9.5" />
      <path d="M9.7 9a2.4 2.4 0 1 1 4.3 1.5c-.8 1-2 1.2-2 2.8m0 3h.01" />
    </svg>
  );
}

function BackIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" focusable="false">
      <path d="m14.5 5-7 7 7 7M8 12h13" />
    </svg>
  );
}

function InertMessage({ text }: { text: string }) {
  const urlPattern = /(https?:\/\/[^\s<>]+|www\.[^\s<>]+)/gi;
  const parts = text.split(urlPattern);

  return (
    <>
      {parts.map((part, index) =>
        /^https?:\/\//i.test(part) || /^www\./i.test(part) ? (
          <code className="url-fragment" aria-label={part} key={`${part}-${index}`}>
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
      <mark className="signal-highlight" key={`signal-${start}-${end}`}>
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

function LanguagePicker({
  lang,
  onChange,
  label,
  className = '',
}: {
  lang: Lang;
  onChange: (lang: Lang) => void;
  label: string;
  className?: string;
}) {
  return (
    <label className={`language-picker ${className}`}>
      <span className="visually-hidden">{label}</span>
      <select
        aria-label={label}
        value={lang}
        onChange={(event) => {
          const selected = LANGUAGES.find((language) => language === event.currentTarget.value);
          if (selected) onChange(selected);
        }}
      >
        {LANGUAGES.map((language) => (
          <option key={language} value={language}>
            {LANGUAGE_NAMES[language]}
          </option>
        ))}
      </select>
    </label>
  );
}

function ThemePicker({
  theme,
  onChange,
  copy,
}: {
  theme: Theme;
  onChange: (theme: Theme) => void;
  copy: ReturnType<typeof copyFor>;
}) {
  return (
    <label className="theme-picker">
      <span className="visually-hidden">{copy.themeLabel}</span>
      <select
        aria-label={copy.themeLabel}
        value={theme}
        onChange={(event) => {
          const selected = THEMES.find((option) => option === event.currentTarget.value);
          if (selected) onChange(selected);
        }}
      >
        <option value="system">{copy.themeSystem}</option>
        <option value="light">{copy.themeLight}</option>
        <option value="dark">{copy.themeDark}</option>
      </select>
    </label>
  );
}

function MainNavigation({
  screen,
  copy,
  onNavigate,
}: {
  screen: Screen;
  copy: ReturnType<typeof copyFor>;
  onNavigate: (screen: 'scan' | 'learn') => void;
}) {
  return (
    <nav className="main-navigation" aria-label="Main navigation">
      <button
        type="button"
        aria-current={screen === 'scan' ? 'page' : undefined}
        onClick={() => onNavigate('scan')}
      >
        {copy.scanNav}
      </button>
      <button
        type="button"
        aria-current={screen === 'learn' ? 'page' : undefined}
        onClick={() => onNavigate('learn')}
      >
        {copy.learnNav}
      </button>
    </nav>
  );
}

export function App() {
  const [screen, setScreen] = useState<Screen>('welcome');
  const [lang, setLang] = useState<Lang>('en');
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
  const copy = copyFor(lang);

  const overLimit = message.length > MAX_MESSAGE_LENGTH;
  const isAppleMobile = /iPhone|iPad|iPod/.test(navigator.userAgent);
  const isStandalone =
    window.matchMedia('(display-mode: standalone)').matches ||
    (navigator as Navigator & { standalone?: boolean }).standalone === true;
  const showIosInstallHint = isAppleMobile && !isStandalone;

  // Keep the existing first-visit model preload, which skips Data Saver and 2G connections.
  useEffect(() => {
    void startEmbeddingsPreload();
  }, []);

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

    return () => {
      navigator.serviceWorker.removeEventListener('message', onWorkerMessage);
    };
  }, [clearScreenshot, selectScreenshot]);

  useEffect(() => {
    document.documentElement.lang = lang === 'taglish' ? 'en-PH' : lang;
  }, [lang]);

  useEffect(() => {
    const colorScheme = window.matchMedia('(prefers-color-scheme: dark)');
    const applyTheme = () => {
      document.documentElement.dataset.theme =
        theme === 'system' ? (colorScheme.matches ? 'dark' : 'light') : theme;
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

    try {
      const result = await analyze(sourceImage ? { image: sourceImage } : { text: sourceMessage }, {
        lang,
        useLLM: false,
      });
      setVerdict(result);
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
    <div className="app-shell">
      <header className={`topbar${screen === 'result' ? ' topbar--result' : ''}`}>
        {screen === 'result' ? (
          <button
            className="back-button"
            type="button"
            aria-label={copy.backToScan}
            onClick={() => setScreen('scan')}
          >
            <BackIcon />
          </button>
        ) : null}
        <button
          className="brand"
          type="button"
          aria-label="Sane home"
          onClick={() => setScreen(screen === 'welcome' ? 'welcome' : 'scan')}
        >
          <img src="/icons/sane-logo.svg" alt="" />
        </button>
        {(screen === 'scan' || screen === 'learn') && (
          <MainNavigation screen={screen} copy={copy} onNavigate={setScreen} />
        )}
        <LanguagePicker
          className="topbar-language"
          label={copy.languageLabel}
          lang={lang}
          onChange={setLang}
        />
        <ThemePicker theme={theme} onChange={setTheme} copy={copy} />
      </header>

      <main key={screen} className={`page page--${screen}`}>
        {screen === 'welcome' && (
          <section className="welcome-layout" aria-labelledby="welcome-title">
            <div className="welcome-content">
              <h1 id="welcome-title">{copy.welcomeTitle}</h1>
              <p className="page-intro">{copy.welcomeDescription}</p>
              <fieldset className="language-choice">
                <legend>{copy.languageLabel}</legend>
                <div className="language-options">
                  {LANGUAGES.map((language) => (
                    <button
                      key={language}
                      type="button"
                      aria-pressed={lang === language}
                      onClick={() => setLang(language)}
                    >
                      {copyFor(language).languageName}
                    </button>
                  ))}
                </div>
              </fieldset>
              <button
                className="button button--primary welcome-start"
                type="button"
                onClick={() => setScreen('scan')}
              >
                {copy.start}
              </button>
              <p className="supporting-copy">{copy.privacyFootnote}</p>
            </div>
            <div className="welcome-details">
              <section className="detail-block">
                <p className="detail-label">{copy.manualLabel}</p>
                <h2>{copy.manualTitle}</h2>
                <p>{copy.manualDescription}</p>
              </section>
              <section className="detail-block">
                <p className="detail-label">{copy.localLabel}</p>
                <h2>{copy.localTitle}</h2>
                <p>{copy.localDescription}</p>
              </section>
            </div>
          </section>
        )}

        {screen === 'scan' && (
          <>
            <div className="page-heading">
              <h1>{copy.scanTitle}</h1>
              <p className="page-intro">{copy.scanDescription}</p>
            </div>
            <div className="scan-layout">
              <form className="scan-form" onSubmit={runAnalysis}>
                {image && (
                  <div className="selected-image" aria-live="polite">
                    <p>{copy.screenshotSelected(image.name)}</p>
                    <button
                      className="button button--quiet"
                      type="button"
                      onClick={clearScreenshot}
                    >
                      {copy.useText}
                    </button>
                  </div>
                )}

                <label className="field-label" htmlFor="message-input">
                  {image ? copy.extractedMessageLabel : copy.messageLabel}
                </label>
                <textarea
                  ref={messageInput}
                  id="message-input"
                  rows={7}
                  value={message}
                  placeholder={copy.messagePlaceholder}
                  aria-describedby="message-count"
                  disabled={ocrState === 'loading'}
                  onChange={(event) => {
                    setMessage(event.currentTarget.value);
                    setFeedback(null);
                  }}
                />
                <div
                  id="message-count"
                  className={`character-count${overLimit ? ' character-count--error' : ''}`}
                  aria-live="polite"
                >
                  {copy.characterCount(message.length, MAX_MESSAGE_LENGTH)}
                </div>
                {overLimit && <p className="field-error">{copy.overLimit}</p>}

                <div className="input-actions">
                  <button
                    className="button button--secondary"
                    type="button"
                    onClick={pasteFromClipboard}
                  >
                    {copy.paste}
                  </button>
                  <button
                    className="button button--secondary"
                    type="button"
                    onClick={() => fileInput.current?.click()}
                  >
                    {copy.upload}
                  </button>
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

                <button
                  className="button button--primary analyze-button"
                  type="submit"
                  disabled={
                    isAnalyzing ||
                    ocrState === 'loading' ||
                    (!image && !message.trim()) ||
                    overLimit
                  }
                >
                  {isAnalyzing ? copy.checking : copy.analyze}
                </button>

                {feedbackText && (
                  <p className="field-error" role="alert">
                    {feedbackText}
                  </p>
                )}
                {ocrState === 'loading' && (
                  <p className="loading-message" role="status">
                    {copy.screenshotLoading}
                  </p>
                )}
                {ocrState === 'ready' && <p className="supporting-copy">{copy.screenshotReady}</p>}
                {ocrState === 'error' && (
                  <p className="field-error" role="status">
                    {copy.screenshotFailed}
                  </p>
                )}
                {isAnalyzing && (
                  <p className="loading-message" role="status">
                    {copy.checking}
                  </p>
                )}

                <p className="supporting-copy">{copy.pasteOnlyNotice}</p>
              </form>

              <aside className="scan-help">
                <div className="notice notice--neutral">
                  <h2>{copy.readyTitle}</h2>
                  <p>{copy.readyDescription}</p>
                </div>
                <section className="how-to">
                  <h2>{copy.howTitle}</h2>
                  <ol>
                    {copy.howSteps.map((step) => (
                      <li key={step}>{step}</li>
                    ))}
                  </ol>
                </section>
                {showIosInstallHint && <p className="supporting-copy">{copy.iosInstallHint}</p>}
              </aside>
            </div>
          </>
        )}

        {screen === 'result' && verdict && (
          <>
            <div className="page-heading result-page-heading">
              <h1>{copy.resultTitle}</h1>
              <p className="page-intro">{copy.resultSubtitle}</p>
            </div>
            <div className="result-grid" aria-live="polite">
              <section className="result-primary">
                <div className={`verdict-strip verdict-strip--${verdict.level}`} role="status">
                  <StatusMark level={verdict.level} />
                  <h2>{copy.assessment[verdict.level].label}</h2>
                </div>
                <p className="coverage-label">
                  {resultUsedOcr
                    ? copy.coverageOcr
                    : resultIsImage
                      ? copy.coverageImage
                      : copy.coverageText}
                </p>
                <p className="assessment-summary">{copy.assessment[verdict.level].summary}</p>
                {verdict.explanation.extra && (
                  <section className="llm-explanation" aria-labelledby="llm-explanation-title">
                    <h2 id="llm-explanation-title">{copy.llmExplanationTitle}</h2>
                    <p className="llm-explanation-disclaimer">{copy.llmDisclaimer}</p>
                    <p className="llm-explanation-text">{verdict.explanation.extra}</p>
                  </section>
                )}
                <section className={`next-step next-step--${verdict.level}`}>
                  <h2 className="next-step-heading">
                    <StatusMark level="suspicious" />
                    <span>
                      {copy.nextPrefix}: {copy.assessment[verdict.level].nextTitle}
                    </span>
                  </h2>
                  <p>{copy.assessment[verdict.level].nextStep}</p>
                </section>

                <section className="result-section model-section">
                  <h2>{copy.modelTitle}</h2>
                  <p>
                    {verdict.usedModels.embeddings ||
                    verdict.usedModels.ocr ||
                    verdict.usedModels.llm ||
                    resultUsedOcr
                      ? copy.modelRan
                      : copy.noModel}
                  </p>
                  <p>{verdict.usedModels.llm ? copy.llmModelRan : copy.llmModelNotRun}</p>
                  {resultUsedOcr && <p>{copy.ocrUsed}</p>}
                </section>

                <section className="result-section evidence-section">
                  <h2>{copy.rulesTitle}</h2>
                  {verdict.signals.length > 0 ? (
                    <ul>
                      {verdict.signals.map((signal, index) => (
                        <li key={`${signal.id}-${index}`}>{signal.label}</li>
                      ))}
                    </ul>
                  ) : (
                    <p>{copy.noSignals}</p>
                  )}
                  <p className="supporting-copy">{copy.signalNote}</p>
                </section>

                {verdict.level === 'probably_fine' && (
                  <aside className="notice notice--neutral not-guarantee">
                    <h2>{copy.notAGuaranteeTitle}</h2>
                    <p>{copy.notAGuarantee}</p>
                  </aside>
                )}
                {resultIsImage && !resultMessage && (
                  <p className="field-error" role="status">
                    {copy.screenshotFailed}
                  </p>
                )}
              </section>

              <aside className="result-secondary">
                <section className="original-message">
                  <h2>{copy.originalTitle}</h2>
                  <p className="original-copy">
                    {resultMessage ? (
                      <HighlightedMessage text={resultMessage} signals={verdict.signals} />
                    ) : (
                      copy.imageOriginal
                    )}
                  </p>
                  <p className="supporting-copy">{copy.originalNote}</p>
                  {resultMessage && normalize(resultMessage) !== resultMessage && (
                    <details className="original-source">
                      <summary>{copy.viewOriginal}</summary>
                      <p className="original-copy">
                        <InertMessage text={resultMessage} />
                      </p>
                    </details>
                  )}
                </section>
                <button
                  className="button button--primary another-button"
                  type="button"
                  onClick={startAnotherCheck}
                >
                  {copy.another}
                </button>
                {canInstall && (
                  <button
                    className="button button--secondary install-button"
                    type="button"
                    onClick={promptInstall}
                  >
                    {copy.installApp}
                  </button>
                )}
              </aside>
            </div>
          </>
        )}

        {screen === 'learn' && (
          <>
            <div className="page-heading">
              <h1>{copy.learnTitle}</h1>
              <p className="page-intro">{copy.learnDescription}</p>
            </div>
            <div className="learn-layout">
              {copy.guides.map((guide) => (
                <section className="guide" key={guide.title}>
                  <h2>{guide.title}</h2>
                  <p>{guide.body}</p>
                </section>
              ))}
              <aside className="notice notice--neutral learn-notice">
                <h2>{copy.learnDisclaimerTitle}</h2>
                <p>{copy.learnDisclaimer}</p>
              </aside>
              <button
                className="button button--secondary learn-action"
                type="button"
                onClick={() => setScreen('scan')}
              >
                {copy.learnAction}
              </button>
            </div>
          </>
        )}
      </main>
    </div>
  );
}
