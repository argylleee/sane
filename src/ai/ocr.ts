// OWNER: model. Stub: OCR is not wired yet; analyze() falls back to "paste the text".
export async function extractText(_image: File): Promise<string> {
  throw new Error('OCR is not available yet.');
}
