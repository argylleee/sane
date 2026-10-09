import type { Lang, Level } from '../types';

type AssessmentCopy = {
  label: string;
  summary: string;
  nextTitle: string;
  nextStep: string;
};

type GuideCopy = {
  title: string;
  body: string;
};

type Copy = {
  languageName: string;
  themeLabel: string;
  themeSystem: string;
  themeLight: string;
  themeDark: string;
  welcomeTitle: string;
  welcomeDescription: string;
  languageLabel: string;
  manualLabel: string;
  manualTitle: string;
  manualDescription: string;
  localLabel: string;
  localTitle: string;
  localDescription: string;
  privacyFootnote: string;
  start: string;
  backToScan: string;
  useText: string;
  scanTitle: string;
  scanDescription: string;
  messageLabel: string;
  extractedMessageLabel: string;
  messagePlaceholder: string;
  paste: string;
  upload: string;
  analyze: string;
  checking: string;
  characterCount: (count: number, max: number) => string;
  overLimit: string;
  clipboardUnavailable: string;
  clipboardError: string;
  screenshotSelected: (name: string) => string;
  screenshotTypeError: string;
  screenshotLimitError: string;
  screenshotLoading: string;
  screenshotReady: string;
  screenshotFailed: string;
  readyTitle: string;
  readyDescription: string;
  howTitle: string;
  howSteps: readonly [string, string, string];
  pasteOnlyNotice: string;
  sharedLimitError: string;
  shareEmpty: string;
  iosInstallHint: string;
  installApp: string;
  analysisError: string;
  resultTitle: string;
  resultSubtitle: string;
  coverageText: string;
  coverageImage: string;
  coverageOcr: string;
  ocrUsed: string;
  viewOriginal: string;
  nextPrefix: string;
  originalTitle: string;
  imageOriginal: string;
  originalNote: string;
  another: string;
  modelTitle: string;
  modelRan: string;
  noModel: string;
  modelPreparing: (percent: number) => string;
  modelReadyStatus: string;
  modelFailedStatus: string;
  modelPausedStatus: string;
  modelRetry: string;
  modelPrepare: string;
  modelDetails: string;
  modelNotReadyAtScan: string;
  modelFailedAtScan: string;
  modelSkippedAtScan: string;
  llmTitle: string;
  llmToggleLabel: string;
  llmDescription: string;
  llmPromptTitle: string;
  llmPromptBody: (size: number) => string;
  llmWriting: string;
  llmDownloadAction: string;
  llmCancelAction: string;
  llmProgress: (percent: number) => string;
  llmProgressLabel: string;
  llmReady: string;
  llmError: string;
  llmRetry: string;
  llmUnavailable: string;
  llmExplanationTitle: string;
  llmDisclaimer: string;
  llmModelRan: string;
  llmModelNotRun: string;
  rulesTitle: string;
  noSignals: string;
  signalNote: string;
  notAGuaranteeTitle: string;
  notAGuarantee: string;
  learnTitle: string;
  learnDescription: string;
  guides: readonly GuideCopy[];
  learnDisclaimerTitle: string;
  learnDisclaimer: string;
  learnAction: string;
  assessment: Record<Level, AssessmentCopy>;
};

export const COPY: Record<Lang, Copy> = {
  en: {
    languageName: 'English',
    themeLabel: 'Theme',
    themeSystem: 'System',
    themeLight: 'Light',
    themeDark: 'Dark',
    welcomeTitle: 'May duda? I-check muna.',
    welcomeDescription:
      'Unsure about a message? Paste it here to check for possible scam warning signs.',
    languageLabel: 'Language',
    manualLabel: 'Manual',
    manualTitle: 'Paste to scan',
    manualDescription: 'You choose what to paste. Sane does not automatically read your clipboard.',
    localLabel: 'On device',
    localTitle: 'Local phone analysis',
    localDescription:
      'The baseline may miss or incorrectly flag messages. Its accuracy is not validated.',
    privacyFootnote: 'No account needed. Messages are checked on your device.',
    start: 'Check a message',
    backToScan: 'Back to scan',
    useText: 'Use text instead',
    scanTitle: 'Scan a message',
    scanDescription:
      'Paste a message or upload a screenshot to check for possible scam indicators.',
    messageLabel: 'Original message',
    extractedMessageLabel: 'Extracted message',
    messagePlaceholder: 'Paste or type the complete message here.',
    paste: 'Paste',
    upload: 'Choose screenshot',
    analyze: 'Analyze',
    checking: 'Checking on this device…',
    characterCount: (count, max) => `${count.toLocaleString('en')} / ${max.toLocaleString('en')}`,
    overLimit: 'This message is over the 2,000 character limit. Shorten it to continue.',
    clipboardUnavailable: 'Clipboard access is unavailable. Paste directly into the message box.',
    clipboardError: 'Could not read the clipboard. Check browser permission or paste directly.',
    screenshotSelected: (name) => `Selected screenshot: ${name}`,
    screenshotTypeError: 'Choose an image file to continue.',
    screenshotLimitError: 'This image is too large. Choose an image smaller than 10 MB.',
    screenshotLoading: 'Reading text from this screenshot on your device…',
    screenshotReady: 'Review and edit the extracted text before checking.',
    screenshotFailed: 'We could not read this screenshot. Paste or type the message instead.',
    readyTitle: 'Ready to check',
    readyDescription:
      'Messages are checked on this device. Results may be wrong and do not guarantee a message is safe.',
    howTitle: 'How to check',
    howSteps: [
      'Paste a message or choose a screenshot.',
      'Review the message, then select Analyze.',
      'Read the possible signs and next step.',
    ],
    pasteOnlyNotice: 'Clipboard is read only when you choose Paste. Links are never opened.',
    sharedLimitError:
      'This shared message is over the 2,000 character limit. Paste a shorter part to check.',
    shareEmpty: 'No message or screenshot came through. Paste or choose one to check.',
    iosInstallHint: 'On iPhone or iPad, use Share, then Add to Home Screen to keep Sane handy.',
    installApp: 'Install Sane',
    analysisError: 'The check could not finish. Try again or paste the message into the box.',
    resultTitle: 'Message assessment',
    resultSubtitle: 'A helpful check, not a guarantee.',
    coverageText: 'Coverage: complete message · entered manually',
    coverageImage: 'Coverage: screenshot text unavailable',
    coverageOcr: 'Coverage: text read from screenshot and reviewed',
    ocrUsed: 'Screenshot text was read on this device.',
    viewOriginal: 'View original message',
    nextPrefix: 'Next step',
    originalTitle: 'Original message',
    imageOriginal: 'No text was extracted from this screenshot.',
    originalNote:
      'Message text is not opened. Link schemes are broken to prevent accidental visits.',
    another: 'Check another message',
    modelTitle: 'Model assessment',
    modelRan: 'An on-device model ran for this check.',
    noModel: 'No AI model ran for this check. Accuracy is not validated.',
    modelPreparing: (percent) =>
      `Preparing the AI check: ${percent}%. You can still check a message; it will use rules only until this is ready.`,
    modelReadyStatus: 'AI check ready.',
    modelFailedStatus: 'The AI check could not be prepared. Checks use rules only.',
    modelPausedStatus: 'The AI check is paused to save data. Checks use rules only.',
    modelRetry: 'Try again',
    modelPrepare: 'Prepare the AI check',
    modelDetails: 'Details for troubleshooting',
    modelNotReadyAtScan:
      'The AI check was not ready yet, so this used rules only. Check again once it is ready.',
    modelFailedAtScan:
      'The AI check could not run, so this used rules only. You can try preparing it again.',
    modelSkippedAtScan: 'The AI check is paused to save data, so this used rules only.',
    llmTitle: 'AI explanation',
    llmToggleLabel: 'Use an AI-written explanation',
    llmDescription:
      'A small on-device model explains each result in plain words. Rules still decide the risk level.',
    llmPromptTitle: 'Download the explanation model?',
    llmPromptBody: (size) =>
      `Paused to save mobile data. About ${size} MB, downloaded once. Your message stays on this device.`,
    llmWriting: 'Writing a short explanation on this device…',
    llmDownloadAction: 'Download model',
    llmCancelAction: 'Maybe later',
    llmProgress: (percent) => `Downloading the AI model: ${percent}%`,
    llmProgressLabel: 'AI model download progress',
    llmReady: 'AI explanation is ready on this device.',
    llmError: 'The model could not load. Checks still work without it.',
    llmRetry: 'Try again',
    llmUnavailable: 'AI explanation needs a browser with WebGPU. The regular check still works.',
    llmExplanationTitle: 'AI explanation',
    llmDisclaimer: 'AI-written, may be wrong. It cannot change the risk level.',
    llmModelRan: 'The AI explanation model ran for this check.',
    llmModelNotRun: 'The AI explanation model did not run for this check.',
    rulesTitle: 'Observed message details',
    noSignals: 'No specific warning signs were identified in the available text.',
    signalNote: 'A single word or link does not prove that a message is a scam.',
    notAGuaranteeTitle: 'Not a guarantee',
    notAGuarantee:
      'No obvious warning signs do not prove that the sender or request is legitimate. Verify independently.',
    learnTitle: 'Pause and verify',
    learnDescription: 'Short guides you can read offline.',
    guides: [
      {
        title: 'Verification codes',
        body: 'Never share a verification code. If you requested a sign-in, open the official app yourself.',
      },
      {
        title: 'Suspicious links',
        body: 'Do not follow a message link to verify a claim. Open the official app or type its known website yourself.',
      },
      {
        title: 'Payment requests',
        body: 'Pause before paying a fee or sending money. Verify the reason independently, even when the amount is small.',
      },
      {
        title: 'Contact independently',
        body: 'Use a contact route from an official app, known website, or trusted statement, not a number or link in the message.',
      },
    ],
    learnDisclaimerTitle: 'A check, not a verdict',
    learnDisclaimer:
      'The local baseline can make mistakes. Its accuracy is not validated. Independent verification still matters.',
    learnAction: 'Check a message',
    assessment: {
      likely_scam: {
        label: 'High concern',
        summary: 'This message has signs that could put your money or account at risk.',
        nextTitle: 'Verify independently',
        nextStep:
          'Do not use the message link. Open the official app or use a contact route you already trust.',
      },
      suspicious: {
        label: 'Use caution',
        summary: 'This request is unclear. The sender cannot be confirmed from the message alone.',
        nextTitle: 'Verify independently',
        nextStep:
          'Confirm through a contact route you already trust. Do not rely only on the sender name.',
      },
      probably_fine: {
        label: 'No obvious warning signs',
        summary:
          'No obvious warning signs are visible in this text. That does not prove the sender is legitimate.',
        nextTitle: 'Still verify',
        nextStep:
          'If anything feels unexpected, open the official app yourself. Never share a verification code.',
      },
      not_sure: {
        label: 'Unable to assess',
        summary: 'There is not enough readable information to assess this message.',
        nextTitle: 'Check the original',
        nextStep:
          'Review the complete message or paste its text here. Verify unexpected requests independently.',
      },
    },
  },
  fil: {
    languageName: 'Filipino',
    themeLabel: 'Tema',
    themeSystem: 'System',
    themeLight: 'Maliwanag',
    themeDark: 'Madilim',
    welcomeTitle: 'May duda? I-check muna.',
    welcomeDescription:
      'Kakaibang mensahe? I-paste dito para makita ang posibleng senyales ng scam.',
    languageLabel: 'Wika',
    manualLabel: 'Manu-mano',
    manualTitle: 'I-paste para suriin',
    manualDescription:
      'Ikaw ang pipili at magpa-paste ng mensahe. Hindi awtomatikong binabasa ang clipboard.',
    localLabel: 'Sa device',
    localTitle: 'Pagsusuri sa telepono',
    localDescription:
      'Maaaring may hindi makita o maling ma-flag ang baseline. Hindi pa napatunayan ang accuracy nito.',
    privacyFootnote: 'Walang account na kailangan. Sa iyong device lang sinusuri ang mensahe.',
    start: 'Suriin ang Mensahe',
    backToScan: 'Bumalik sa pagsusuri',
    useText: 'Gamitin ang text',
    scanTitle: 'Suriin ang mensahe',
    scanDescription:
      'I-paste ang mensahe o pumili ng screenshot para tingnan kung may senyales ng scam.',
    messageLabel: 'Orihinal na mensahe',
    extractedMessageLabel: 'Nakuha na mensahe',
    messagePlaceholder: 'I-paste o i-type rito ang buong mensahe.',
    paste: 'I-paste',
    upload: 'Pumili ng screenshot',
    analyze: 'Suriin',
    checking: 'Sinusuri sa device na ito…',
    characterCount: (count, max) => `${count.toLocaleString('fil')} / ${max.toLocaleString('fil')}`,
    overLimit: 'Lampas ito sa 2,000 character. Paikliin ang mensahe para magpatuloy.',
    clipboardUnavailable: 'Hindi mabuksan ang clipboard. I-paste ang mensahe sa kahon.',
    clipboardError: 'Hindi mabasa ang clipboard. Tingnan ang pahintulot o mag-paste sa kahon.',
    screenshotSelected: (name) => `Napiling screenshot: ${name}`,
    screenshotTypeError: 'Pumili ng image file para magpatuloy.',
    screenshotLimitError: 'Masyadong malaki ang image. Pumili ng mas maliit sa 10 MB.',
    screenshotLoading: 'Binabasa sa device mo ang text mula sa screenshot…',
    screenshotReady: 'Basahin at i-edit muna ang nakuha na text bago magsuri.',
    screenshotFailed: 'Hindi mabasa ang screenshot. I-paste o i-type na lang ang mensahe.',
    readyTitle: 'Handa nang magsuri',
    readyDescription:
      'Sinusuri ang mensahe sa device mo. Maaaring mali ang resulta at hindi nito ginagarantiya na ligtas ito.',
    howTitle: 'Paano magsuri',
    howSteps: [
      'I-paste ang mensahe o pumili ng screenshot.',
      'Basahin muna ito, saka piliin ang Suriin.',
      'Tingnan ang mga posibleng senyales at susunod na hakbang.',
    ],
    pasteOnlyNotice:
      'Binabasa lang ang clipboard kapag pinili mo ang I-paste. Hindi binubuksan ang mga link.',
    sharedLimitError:
      'Lampas sa 2,000 character ang mensaheng ipinasa. Mag-paste ng mas maikling bahagi para masuri.',
    shareEmpty: 'Walang dumating na mensahe o screenshot. Mag-paste o pumili ng susuriin.',
    iosInstallHint:
      'Sa iPhone o iPad, piliin ang Share, saka Add to Home Screen para madaling buksan ang Sane.',
    installApp: 'I-install ang Sane',
    analysisError: 'Hindi natapos ang pagsusuri. Subukan ulit o i-paste ang mensahe sa kahon.',
    resultTitle: 'Resulta ng pagsusuri',
    resultSubtitle: 'Gabay lang ito, hindi garantiya.',
    coverageText: 'Saklaw: buong mensahe · ikaw ang naglagay',
    coverageImage: 'Saklaw: hindi mabasa ang text sa screenshot',
    coverageOcr: 'Saklaw: binasa at nirepaso ang text mula sa screenshot',
    ocrUsed: 'Binasa sa device na ito ang text mula sa screenshot.',
    viewOriginal: 'Tingnan ang orihinal na mensahe',
    nextPrefix: 'Susunod',
    originalTitle: 'Orihinal na mensahe',
    imageOriginal: 'Walang text na nakuha mula sa screenshot na ito.',
    originalNote:
      'Hindi binubuksan ang text. Binabago ang simula ng link para maiwasan ang aksidenteng pagbisita.',
    another: 'Suriin ang ibang mensahe',
    modelTitle: 'Pagtatasa ng modelo',
    modelRan: 'May on-device model na tumakbo sa pagsusuring ito.',
    noModel: 'Walang AI model na ginamit. Hindi pa napatunayan ang accuracy.',
    modelPreparing: (percent) =>
      `Inihahanda ang AI check: ${percent}%. Maaari ka pa ring mag-check ng mensahe; rules lang ang gagamitin hanggang handa na ito.`,
    modelReadyStatus: 'Handa na ang AI check.',
    modelFailedStatus: 'Hindi nahanda ang AI check. Rules lang ang gamit ng mga check.',
    modelPausedStatus:
      'Naka-pause ang AI check para makatipid ng data. Rules lang ang gamit ng mga check.',
    modelRetry: 'Subukan muli',
    modelPrepare: 'Ihanda ang AI check',
    modelDetails: 'Detalye para sa pag-aayos',
    modelNotReadyAtScan:
      'Hindi pa handa ang AI check, kaya rules lang ang ginamit dito. Mag-check muli kapag handa na ito.',
    modelFailedAtScan:
      'Hindi tumakbo ang AI check, kaya rules lang ang ginamit dito. Maaari mong subukang ihanda itong muli.',
    modelSkippedAtScan:
      'Naka-pause ang AI check para makatipid ng data, kaya rules lang ang ginamit dito.',
    llmTitle: 'AI na paliwanag',
    llmToggleLabel: 'Gumamit ng AI na paliwanag',
    llmDescription:
      'Isang maliit na model sa device ang nagpapaliwanag ng bawat resulta. Rules pa rin ang nagtatakda ng risk level.',
    llmPromptTitle: 'I-download ang model para sa paliwanag?',
    llmPromptBody: (size) =>
      `Naka-pause para makatipid ng mobile data. Mga ${size} MB, isang beses lang ida-download. Sa device mo mananatili ang mensahe.`,
    llmWriting: 'Isinusulat ang maikling paliwanag sa device na ito…',
    llmDownloadAction: 'I-download ang model',
    llmCancelAction: 'Mamaya na lang',
    llmProgress: (percent) => `Dina-download ang AI model: ${percent}%`,
    llmProgressLabel: 'Progress ng pag-download ng AI model',
    llmReady: 'Handa na sa device ang AI na paliwanag.',
    llmError: 'Hindi ma-load ang model. Gagana pa rin ang check kahit wala ito.',
    llmRetry: 'Subukan ulit',
    llmUnavailable:
      'Kailangan ng WebGPU para sa AI na paliwanag. Gagana pa rin ang regular na check.',
    llmExplanationTitle: 'AI na paliwanag',
    llmDisclaimer: 'AI ang sumulat nito at puwedeng magkamali. Hindi nito mababago ang risk level.',
    llmModelRan: 'Tumakbo ang AI explanation model para sa check na ito.',
    llmModelNotRun: 'Hindi tumakbo ang AI explanation model para sa check na ito.',
    rulesTitle: 'Mga nakitang detalye',
    noSignals: 'Walang tiyak na babala na nakita sa nababasang text.',
    signalNote: 'Hindi sapat ang iisang salita o link para sabihing scam ang mensahe.',
    notAGuaranteeTitle: 'Hindi garantiya',
    notAGuarantee:
      'Hindi patunay na lehitimo ang sender kapag walang nakitang babala. Mag-verify sa ibang paraan.',
    learnTitle: 'Huminto at mag-verify',
    learnDescription: 'Maiikling gabay na mababasa offline.',
    guides: [
      {
        title: 'Mga verification code',
        body: 'Huwag ibahagi ang verification code. Kung ikaw ang nag-sign in, buksan mismo ang opisyal na app.',
      },
      {
        title: 'Kahina-hinalang link',
        body: 'Huwag sundan ang link para patunayan ang claim. Buksan ang opisyal na app o i-type ang kilalang website.',
      },
      {
        title: 'Hiling na pagbabayad',
        body: 'Huminto muna bago magbayad o magpadala ng pera. Beripikahin ang dahilan sa ibang paraan.',
      },
      {
        title: 'Makipag-ugnayan nang hiwalay',
        body: 'Gamitin ang contact mula sa opisyal na app o kilalang website, hindi ang numero o link sa mensahe.',
      },
    ],
    learnDisclaimerTitle: 'Pagsusuri lang, hindi hatol',
    learnDisclaimer:
      'Maaaring magkamali ang lokal na baseline. Hindi pa napatunayan ang accuracy nito. Mahalaga pa rin ang sariling beripikasyon.',
    learnAction: 'Suriin ang mensahe',
    assessment: {
      likely_scam: {
        label: 'Matinding babala',
        summary: 'May mga senyales na maaaring maglagay sa pera o account mo sa panganib.',
        nextTitle: 'Mag-verify nang hiwalay',
        nextStep:
          'Huwag gamitin ang link sa mensahe. Buksan ang opisyal na app o gumamit ng kilalang contact route.',
      },
      suspicious: {
        label: 'Mag-ingat',
        summary: 'Hindi malinaw ang hiling. Hindi mapapatunayan ang sender mula sa mensahe lang.',
        nextTitle: 'Mag-verify nang hiwalay',
        nextStep:
          'Kumpirmahin gamit ang contact na pinagkakatiwalaan mo. Huwag umasa sa pangalan lang ng sender.',
      },
      probably_fine: {
        label: 'Walang nakitang malinaw na babala',
        summary: 'Walang malinaw na babala sa text. Hindi nito pinatutunayang lehitimo ang sender.',
        nextTitle: 'Mag-verify pa rin',
        nextStep:
          'Kung hindi inaasahan ang mensahe, buksan mismo ang opisyal na app. Huwag ibigay ang code.',
      },
      not_sure: {
        label: 'Hindi masuri',
        summary: 'Kulang ang nababasang impormasyon para masuri ang mensaheng ito.',
        nextTitle: 'Tingnan ang orihinal',
        nextStep:
          'Basahin ang buong mensahe o i-paste rito ang text. Mag-verify ng hindi inaasahang hiling.',
      },
    },
  },
  taglish: {
    languageName: 'Taglish',
    themeLabel: 'Theme',
    themeSystem: 'System',
    themeLight: 'Light',
    themeDark: 'Dark',
    welcomeTitle: 'May duda? I-check muna.',
    welcomeDescription:
      'Kakaibang message? I-paste dito para makita ang posibleng senyales ng scam.',
    languageLabel: 'Language',
    manualLabel: 'Manual check',
    manualTitle: 'Ikaw ang pipili ng ipa-paste',
    manualDescription: 'Hindi automatic na binabasa ng Sane ang clipboard mo.',
    localLabel: 'Sa device',
    localTitle: 'Local na message check',
    localDescription: 'Puwedeng magkamali ang result. Hindi pa validated ang accuracy.',
    privacyFootnote: 'Walang account na kailangan. Sa device mo lang sinusuri ang message.',
    start: 'I-check ang Message',
    backToScan: 'Bumalik sa pag-check',
    useText: 'Gamitin ang text',
    scanTitle: 'I-check ang message',
    scanDescription:
      'I-paste ang message o pumili ng screenshot para tingnan ang possible scam signs.',
    messageLabel: 'Original na message',
    extractedMessageLabel: 'Extracted na message',
    messagePlaceholder: 'I-paste o i-type dito ang buong message.',
    paste: 'I-paste',
    upload: 'Pumili ng screenshot',
    analyze: 'I-check',
    checking: 'Chine-check sa device na ito…',
    characterCount: (count, max) => `${count.toLocaleString('en')} / ${max.toLocaleString('en')}`,
    overLimit: 'Lampas ito sa 2,000 characters. Paikliin ang message para magpatuloy.',
    clipboardUnavailable: 'Hindi available ang clipboard. I-paste ang message sa text box.',
    clipboardError: 'Hindi mabasa ang clipboard. Check ang permission o mag-paste sa text box.',
    screenshotSelected: (name) => `Selected screenshot: ${name}`,
    screenshotTypeError: 'Pumili ng image file para magpatuloy.',
    screenshotLimitError: 'Masyadong malaking image. Pumili ng mas maliit sa 10 MB.',
    screenshotLoading: 'Binabasa sa device mo ang text mula sa screenshot…',
    screenshotReady: 'I-review at i-edit muna ang extracted text bago mag-check.',
    screenshotFailed: 'Hindi mabasa ang screenshot. I-paste o i-type na lang ang message.',
    readyTitle: 'Ready nang mag-check',
    readyDescription:
      'Sa device mo chine-check ang message. Puwedeng mali ang result at walang safety guarantee.',
    howTitle: 'Paano mag-check',
    howSteps: [
      'I-paste ang message o pumili ng screenshot.',
      'I-review ang message, saka piliin ang I-check.',
      'Basahin ang possible signs at next step.',
    ],
    pasteOnlyNotice:
      'Clipboard lang ang binabasa kapag pinili mo ang I-paste. Hindi ino-open ang links.',
    sharedLimitError:
      'Lampas 2,000 characters ang shared message. I-paste ang mas maikling part para ma-check.',
    shareEmpty: 'Walang dumating na message o screenshot. Mag-paste o pumili ng iche-check.',
    iosInstallHint:
      'Sa iPhone o iPad, tap Share, tapos Add to Home Screen para madaling balikan ang Sane.',
    installApp: 'I-install ang Sane',
    analysisError: 'Hindi natapos ang check. Try ulit o i-paste ang message sa box.',
    resultTitle: 'Message assessment',
    resultSubtitle: 'Helpful na check ito, hindi guarantee.',
    coverageText: 'Coverage: buong message · ikaw ang nag-enter',
    coverageImage: 'Coverage: hindi available ang screenshot text',
    coverageOcr: 'Coverage: na-read at na-review ang text mula sa screenshot',
    ocrUsed: 'Na-read sa device na ito ang screenshot text.',
    viewOriginal: 'View ang original na message',
    nextPrefix: 'Next step',
    originalTitle: 'Original na message',
    imageOriginal: 'Walang text na na-extract mula sa screenshot.',
    originalNote:
      'Hindi ino-open ang text. Binabago ang simula ng link para maiwasan ang accidental na pagbisita.',
    another: 'Mag-check ng ibang message',
    modelTitle: 'Model assessment',
    modelRan: 'May on-device model na tumakbo sa check na ito.',
    noModel: 'Walang AI model na tumakbo. Hindi pa validated ang accuracy.',
    modelPreparing: (percent) =>
      `Inihahanda ang AI check: ${percent}%. Pwede ka pa ring mag-check ng message; rules lang ang gagamitin hangga't hindi pa ready.`,
    modelReadyStatus: 'Ready na ang AI check.',
    modelFailedStatus: 'Hindi na-prepare ang AI check. Rules lang ang gamit ng mga check.',
    modelPausedStatus:
      'Naka-pause ang AI check para makatipid ng data. Rules lang ang gamit ng mga check.',
    modelRetry: 'Subukan ulit',
    modelPrepare: 'I-prepare ang AI check',
    modelDetails: 'Details para sa troubleshooting',
    modelNotReadyAtScan:
      'Hindi pa ready ang AI check, kaya rules lang ang ginamit dito. I-check ulit kapag ready na.',
    modelFailedAtScan:
      'Hindi tumakbo ang AI check, kaya rules lang ang ginamit dito. Pwede mong subukang i-prepare ulit.',
    modelSkippedAtScan:
      'Naka-pause ang AI check para makatipid ng data, kaya rules lang ang ginamit dito.',
    llmTitle: 'AI explanation',
    llmToggleLabel: 'Gumamit ng AI-written explanation',
    llmDescription:
      'May maliit na on-device model na nag-e-explain ng bawat result. Rules pa rin ang nagde-decide ng risk level.',
    llmPromptTitle: 'I-download ang model para sa explanation?',
    llmPromptBody: (size) =>
      `Naka-pause para makatipid sa mobile data. Mga ${size} MB, one-time download lang. Sa device mo lang ang message.`,
    llmWriting: 'Sinusulat ang maikling explanation sa device na ito…',
    llmDownloadAction: 'I-download ang model',
    llmCancelAction: 'Mamaya na lang',
    llmProgress: (percent) => `Dina-download ang AI model: ${percent}%`,
    llmProgressLabel: 'Progress ng pag-download ng AI model',
    llmReady: 'Ready na sa device ang AI explanation.',
    llmError: 'Hindi ma-load ang model. Gagana pa rin ang check kahit wala ito.',
    llmRetry: 'Try ulit',
    llmUnavailable:
      'Kailangan ng WebGPU para sa AI explanation. Gagana pa rin ang regular na check.',
    llmExplanationTitle: 'AI explanation',
    llmDisclaimer: 'AI-written ito at puwedeng magkamali. Hindi nito mababago ang risk level.',
    llmModelRan: 'Tumakbo ang AI explanation model para sa check na ito.',
    llmModelNotRun: 'Hindi tumakbo ang AI explanation model para sa check na ito.',
    rulesTitle: 'Mga napansing detalye',
    noSignals: 'Walang partikular na warning signs sa nababasang text.',
    signalNote: 'Hindi proof ng scam ang isang word o link lang.',
    notAGuaranteeTitle: 'Hindi guarantee',
    notAGuarantee:
      'Hindi ibig sabihin na legit ang sender kapag walang nakitang warning signs. Mag-verify nang hiwalay.',
    learnTitle: 'Pause at mag-verify',
    learnDescription: 'Maiikling guide na mababasa offline.',
    guides: [
      {
        title: 'Verification codes',
        body: 'Huwag i-share ang verification code. Kung ikaw ang nag-sign in, buksan mismo ang official app.',
      },
      {
        title: 'Suspicious links',
        body: 'Huwag sundan ang message link para mag-verify. Buksan ang official app o i-type ang known website.',
      },
      {
        title: 'Payment requests',
        body: 'Pause muna bago magbayad o mag-send ng money. I-verify ang dahilan sa ibang paraan.',
      },
      {
        title: 'Contact independently',
        body: 'Gamitin ang contact mula sa official app o known website, hindi ang number o link sa message.',
      },
    ],
    learnDisclaimerTitle: 'Check lang, hindi verdict',
    learnDisclaimer:
      'Puwedeng magkamali ang local baseline. Hindi pa validated ang accuracy. Importante pa rin ang sariling verification.',
    learnAction: 'Mag-check ng message',
    assessment: {
      likely_scam: {
        label: 'Matinding babala',
        summary: 'May signs na puwedeng maglagay sa pera o account mo sa risk.',
        nextTitle: 'Mag-verify nang hiwalay',
        nextStep:
          'Huwag gamitin ang link sa message. Buksan ang official app o gumamit ng contact na trusted mo.',
      },
      suspicious: {
        label: 'Mag-ingat',
        summary: 'Hindi malinaw ang request. Hindi mako-confirm ang sender mula sa message lang.',
        nextTitle: 'Mag-verify nang hiwalay',
        nextStep: 'I-confirm gamit ang contact na trusted mo. Huwag umasa sa sender name lang.',
      },
      probably_fine: {
        label: 'Walang obvious na warning signs',
        summary:
          'Walang obvious na warning signs sa text. Hindi nito pinapatunayang legit ang sender.',
        nextTitle: 'Mag-verify pa rin',
        nextStep:
          'Kung unexpected ito, buksan mismo ang official app. Huwag i-share ang verification code.',
      },
      not_sure: {
        label: 'Hindi masuri',
        summary: 'Kulang ang nababasang info para ma-assess ang message na ito.',
        nextTitle: 'Check ang original',
        nextStep:
          'Basahin ang buong message o i-paste dito ang text. Mag-verify ng unexpected na request.',
      },
    },
  },
};

export function copyFor(lang: Lang): Copy {
  return COPY[lang];
}

export const VERDICT_LEVELS: readonly Level[] = [
  'likely_scam',
  'suspicious',
  'probably_fine',
  'not_sure',
];
