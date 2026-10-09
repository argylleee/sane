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
  welcomeTitle: string;
  welcomeDescription: string;
  languageLabel: string;
  manualLabel: string;
  manualTitle: string;
  manualDescription: string;
  localLabel: string;
  localTitle: string;
  localDescription: string;
  start: string;
  scanNav: string;
  learnNav: string;
  backToScan: string;
  useText: string;
  scanTitle: string;
  scanDescription: string;
  messageLabel: string;
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
  screenshotUnavailable: string;
  readyTitle: string;
  readyDescription: string;
  howTitle: string;
  howSteps: readonly [string, string, string];
  pasteOnlyNotice: string;
  offlineReady: string;
  offlinePreparing: string;
  online: string;
  offline: string;
  networkRequests: (count: number) => string;
  embeddingTitle: string;
  embeddingAction: string;
  embeddingReady: string;
  embeddingUnavailable: string;
  embeddingProgress: (percent: number) => string;
  downloadPromptTitle: string;
  downloadPromptBody: string;
  downloadContinue: string;
  downloadCancel: string;
  sharedLimitError: string;
  shareEmpty: string;
  iosInstallHint: string;
  installApp: string;
  analysisError: string;
  resultTitle: string;
  resultSubtitle: string;
  coverageText: string;
  coverageImage: string;
  nextPrefix: string;
  originalTitle: string;
  imageOriginal: string;
  originalNote: string;
  another: string;
  modelTitle: string;
  modelRan: string;
  noModel: string;
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
    welcomeTitle: 'Check a suspicious message',
    welcomeDescription: 'Paste a message to check for possible scam signs.',
    languageLabel: 'Language',
    manualLabel: 'Manual check',
    manualTitle: 'You choose what to paste',
    manualDescription: 'Sane does not automatically read your clipboard.',
    localLabel: 'On device',
    localTitle: 'Local message check',
    localDescription: 'Results may be wrong. Accuracy has not been validated.',
    start: 'Start manual check',
    scanNav: 'Scan',
    learnNav: 'Learn',
    backToScan: 'Back to scan',
    useText: 'Use text instead',
    scanTitle: 'Scan a message',
    scanDescription: 'Paste a message or choose a screenshot to check for possible scam signs.',
    messageLabel: 'Original message',
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
    screenshotUnavailable:
      'Screenshot text extraction is not available yet. Paste the message text instead.',
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
    offlineReady: 'Offline ready',
    offlinePreparing: 'Preparing offline use',
    online: 'Online',
    offline: 'Offline',
    networkRequests: (count) => `Network requests during this check: ${count}`,
    embeddingTitle: 'Optional message matching',
    embeddingAction: 'Load offline matching',
    embeddingReady: 'Offline message matching is ready.',
    embeddingUnavailable:
      'Offline message matching could not load. You can still check with the basic rules.',
    embeddingProgress: (percent) => `Preparing message matching: ${percent}%`,
    downloadPromptTitle: 'Download message matching?',
    downloadPromptBody:
      'The model weights are about 120 MB, plus supporting files. Use Wi-Fi if you can. Your message stays on this device.',
    downloadContinue: 'Download on this device',
    downloadCancel: 'Maybe later',
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
    nextPrefix: 'Next step',
    originalTitle: 'Original message',
    imageOriginal: 'No text was extracted from this screenshot.',
    originalNote:
      'Message text is not opened. Link schemes are broken to prevent accidental visits.',
    another: 'Check another message',
    modelTitle: 'Model assessment',
    modelRan: 'An on-device model ran for this check.',
    noModel: 'No AI model ran for this check. Accuracy is not validated.',
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
    welcomeTitle: 'Suriin ang kahina-hinalang mensahe',
    welcomeDescription: 'I-paste ang mensahe para tingnan kung may senyales ng scam.',
    languageLabel: 'Wika',
    manualLabel: 'Manu-manong pagsusuri',
    manualTitle: 'Ikaw ang pipili ng ipa-paste',
    manualDescription: 'Hindi awtomatikong binabasa ng Sane ang clipboard mo.',
    localLabel: 'Sa device',
    localTitle: 'Pagsusuri sa device',
    localDescription: 'Maaaring magkamali ang resulta. Hindi pa napatunayan ang accuracy nito.',
    start: 'Simulan ang pagsusuri',
    scanNav: 'Suriin',
    learnNav: 'Alamin',
    backToScan: 'Bumalik sa pagsusuri',
    useText: 'Gamitin ang text',
    scanTitle: 'Suriin ang mensahe',
    scanDescription:
      'I-paste ang mensahe o pumili ng screenshot para tingnan kung may senyales ng scam.',
    messageLabel: 'Orihinal na mensahe',
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
    screenshotUnavailable:
      'Hindi pa available ang pagkuha ng text mula sa screenshot. I-paste na lang ang mensahe.',
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
    offlineReady: 'Handa offline',
    offlinePreparing: 'Inihahanda para magamit offline',
    online: 'Online',
    offline: 'Offline',
    networkRequests: (count) => `Mga network request habang nagsusuri: ${count}`,
    embeddingTitle: 'Opsyonal na pagtutugma ng mensahe',
    embeddingAction: 'I-load para offline',
    embeddingReady: 'Handa na ang pagtutugma ng mensahe offline.',
    embeddingUnavailable:
      'Hindi na-load ang pagtutugma offline. Maaari ka pa ring magsuri gamit ang mga batayang tuntunin.',
    embeddingProgress: (percent) => `Inihahanda ang pagtutugma ng mensahe: ${percent}%`,
    downloadPromptTitle: 'I-download ang pagtutugma ng mensahe?',
    downloadPromptBody:
      'Mga 120 MB ang model weights, dagdag pa ang supporting files. Gumamit ng Wi-Fi kung kaya. Mananatili sa device mo ang mensahe.',
    downloadContinue: 'I-download sa device na ito',
    downloadCancel: 'Mamaya na lang',
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
    nextPrefix: 'Susunod',
    originalTitle: 'Orihinal na mensahe',
    imageOriginal: 'Walang text na nakuha mula sa screenshot na ito.',
    originalNote:
      'Hindi binubuksan ang text. Binabago ang simula ng link para maiwasan ang aksidenteng pagbisita.',
    another: 'Suriin ang ibang mensahe',
    modelTitle: 'Pagtatasa ng modelo',
    modelRan: 'May on-device model na tumakbo sa pagsusuring ito.',
    noModel: 'Walang AI model na ginamit. Hindi pa napatunayan ang accuracy.',
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
    welcomeTitle: 'I-check ang suspicious na message',
    welcomeDescription: 'I-paste ang message para tingnan kung may possible scam signs.',
    languageLabel: 'Language',
    manualLabel: 'Manual check',
    manualTitle: 'Ikaw ang pipili ng ipa-paste',
    manualDescription: 'Hindi automatic na binabasa ng Sane ang clipboard mo.',
    localLabel: 'Sa device',
    localTitle: 'Local na message check',
    localDescription: 'Puwedeng magkamali ang result. Hindi pa validated ang accuracy.',
    start: 'Simulan ang manual check',
    scanNav: 'I-check',
    learnNav: 'Alamin',
    backToScan: 'Bumalik sa pag-check',
    useText: 'Gamitin ang text',
    scanTitle: 'I-check ang message',
    scanDescription:
      'I-paste ang message o pumili ng screenshot para tingnan ang possible scam signs.',
    messageLabel: 'Original na message',
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
    screenshotUnavailable:
      'Hindi pa available ang pagkuha ng text mula sa screenshot. I-paste na lang ang message.',
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
    offlineReady: 'Ready offline',
    offlinePreparing: 'Inihahanda para offline',
    online: 'Online',
    offline: 'Offline',
    networkRequests: (count) => `Network requests habang nagche-check: ${count}`,
    embeddingTitle: 'Optional na message matching',
    embeddingAction: 'I-load para offline',
    embeddingReady: 'Ready na ang offline message matching.',
    embeddingUnavailable:
      'Hindi na-load ang offline message matching. Puwede pa ring mag-check gamit ang basic rules.',
    embeddingProgress: (percent) => `Inihahanda ang message matching: ${percent}%`,
    downloadPromptTitle: 'I-download ang message matching?',
    downloadPromptBody:
      'Mga 120 MB ang model weights, plus supporting files. Wi-Fi muna kung kaya. Dito lang sa device ang message mo.',
    downloadContinue: 'I-download sa device na ito',
    downloadCancel: 'Later na lang',
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
    nextPrefix: 'Next step',
    originalTitle: 'Original na message',
    imageOriginal: 'Walang text na na-extract mula sa screenshot.',
    originalNote:
      'Hindi ino-open ang text. Binabago ang simula ng link para maiwasan ang accidental na pagbisita.',
    another: 'Mag-check ng ibang message',
    modelTitle: 'Model assessment',
    modelRan: 'May on-device model na tumakbo sa check na ito.',
    noModel: 'Walang AI model na tumakbo. Hindi pa validated ang accuracy.',
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
