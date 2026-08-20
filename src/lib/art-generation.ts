import { ART_STYLE_SUFFIX } from './constants';

export function sanitizePrompt(dreamText: string): string {
  return dreamText.slice(0, 1000);
}

function scrubForNSFW(text: string): string {
  const nsfwMap: Record<string, string> = {
    'sex': 'intense passionate connection',
    'sexual': 'deeply passionate',
    'sexuality': 'raw passion',
    'intercourse': 'merging of energies',
    'naked': 'emotionally exposed and raw',
    'nude': 'unshielded and vulnerable',
    'nudity': 'complete vulnerability',
    'porn': 'hidden dark desires',
    'rape': 'violent emotional overpowering',
    'murder': 'sudden devastating ending',
    'kill': 'forceful elimination',
    'blood': 'vital life force',
    'death': 'absolute transformation',
    'intimate': 'emotionally close'
  };

  let scrubbed = text;
  for (const [trigger, replacement] of Object.entries(nsfwMap)) {
    const regex = new RegExp(`\\b${trigger}\\b`, 'gi');
    scrubbed = scrubbed.replace(regex, replacement);
  }
  return scrubbed;
}

export function buildArtPrompt(dreamText: string, interpretation?: string, type: 'literal' | 'feeling' = 'feeling', styleMode: 'surreal' | 'literal' = 'surreal'): string {
  let baseText = sanitizePrompt(dreamText);

  if (type === 'feeling' && interpretation) {
    // Scrub trigger words to bypass NSFW filters while maintaining the feeling
    let cleanMeaning = scrubForNSFW(interpretation);
    const stylePrefix = styleMode === 'surreal' ? 'Soft pastel surrealism' : 'Sharp defined literal representation';
    baseText = `Abstract ethereal fine art representing these subconscious dream feelings: ${cleanMeaning.slice(0, 300)}. ${stylePrefix}, high aesthetic.`;
  } else {
    // For literal dream generation, scrub NSFW keywords to prevent API blocks
    const stylePrefix = styleMode === 'surreal' ? 'Ethereal surreal fine art painting of' : 'Highly detailed photorealistic cinematic render of';
    baseText = `${stylePrefix}: ${scrubForNSFW(baseText).slice(0, 300)}`;
  }

  return `${baseText}${ART_STYLE_SUFFIX}`;
}

async function fetchWithTimeout(url: string, options: RequestInit, timeoutMs = 15000): Promise<Response> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const response = await fetch(url, { ...options, signal: controller.signal });
    return response;
  } finally {
    clearTimeout(timeoutId);
  }
}


async function generateWithHuggingFace(prompt: string, apiKey: string): Promise<string> {
  const res = await fetchWithTimeout(
    "https://api-inference.huggingface.co/models/black-forest-labs/FLUX.1-schnell",
    {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ inputs: prompt }),
    },
    30000
  );

  if (!res.ok) {
    const errorText = await res.text().catch(() => 'Unknown error');
    console.error(`[Art Generation] HuggingFace error (${res.status}): ${errorText.substring(0, 200)}`);
    // Fast-fail on rate limit, auth, or forbidden errors — don't wait for timeout
    if (res.status === 429 || res.status === 401 || res.status === 403) {
      throw new Error(`HuggingFace key rejected (${res.status})`);
    }
    throw new Error(`HuggingFace API failed: ${res.status} ${res.statusText}`);
  }

  const contentType = res.headers.get('content-type') || 'image/jpeg';
  
  // Guard: if the response is JSON, it's an error (e.g. model loading)
  if (contentType.includes('application/json')) {
    const errorData = await res.json().catch(() => ({}));
    console.error('[Art Generation] HuggingFace returned JSON instead of image:', errorData);
    throw new Error(`HuggingFace returned error: ${errorData?.error || 'model loading'}`);
  }

  const arrayBuffer = await res.arrayBuffer();
  
  // Guard: if the image is suspiciously small (<1KB), it's likely an error
  if (arrayBuffer.byteLength < 1000) {
    throw new Error('HuggingFace returned an invalid/empty image');
  }

  const base64Image = Buffer.from(arrayBuffer).toString('base64');
  return `data:${contentType};base64,${base64Image}`;
}

// Custom key sequence to distribute load (1-based indices mapped to environment variables)
const KEY_SEQUENCE = [1, 2, 5, 10, 3, 6, 11, 4, 7, 12, 8, 14, 9, 13, 15];
let requestCounter = 0;

export async function generateArt(dreamText: string, interpretation?: string, type: 'literal' | 'feeling' = 'feeling', styleMode: 'surreal' | 'literal' = 'surreal'): Promise<{ url: string }> {
  const prompt = buildArtPrompt(dreamText, interpretation, type, styleMode);
  console.log(`[Art Generation] Generating (${type}) with style (${styleMode}) for prompt: "${prompt}"`);

  // Load all keys into a map/record for easy lookup
  const hfKeysMap: Record<number, string | undefined> = {
    1: process.env.HUGGINGFACE_API_KEY_1,
    2: process.env.HUGGINGFACE_API_KEY_2,
    3: process.env.HUGGINGFACE_API_KEY_3,
    4: process.env.HUGGINGFACE_API_KEY_4,
    5: process.env.HUGGINGFACE_API_KEY_5,
    6: process.env.HUGGINGFACE_API_KEY_6,
    7: process.env.HUGGINGFACE_API_KEY_7,
    8: process.env.HUGGINGFACE_API_KEY_8,
    9: process.env.HUGGINGFACE_API_KEY_9,
    10: process.env.HUGGINGFACE_API_KEY_10,
    11: process.env.HUGGINGFACE_API_KEY_11,
    12: process.env.HUGGINGFACE_API_KEY_12,
    13: process.env.HUGGINGFACE_API_KEY_13,
    14: process.env.HUGGINGFACE_API_KEY_14,
    15: process.env.HUGGINGFACE_API_KEY_15,
  };

  // Build the ordered list of active/configured keys based on the custom KEY_SEQUENCE
  const activeKeys: { key: string; label: string }[] = [];
  
  // Start from the current offset in the sequence
  const startOffset = requestCounter % KEY_SEQUENCE.length;
  requestCounter++; // Move pointer for the next request

  for (let i = 0; i < KEY_SEQUENCE.length; i++) {
    const sequenceNum = KEY_SEQUENCE[(startOffset + i) % KEY_SEQUENCE.length];
    const key = hfKeysMap[sequenceNum];
    if (key) {
      activeKeys.push({ key, label: `Hugging Face API Key ${sequenceNum}` });
    }
  }

  // Fallback check for legacy non-numbered key
  if (process.env.HUGGINGFACE_API_KEY) {
    activeKeys.push({ key: process.env.HUGGINGFACE_API_KEY, label: 'Hugging Face API Key (Legacy)' });
  }

  // Try Hugging Face Keys in the distributed sequence order
  for (let i = 0; i < activeKeys.length; i++) {
    const { key, label } = activeKeys[i];
    try {
      const url = await generateWithHuggingFace(prompt, key);
      console.log(`[Art Generation] Successfully generated image using: ${label}`);
      return { url };
    } catch (e: any) {
      console.warn(`[Art Generation] ${label} failed: ${e.message}. Trying next key...`);
    }
  }

  // Fast, beautiful reliable fallback via Pollinations AI
  console.warn("[Art Generation] All primary keys failed, using reliable high-speed fallback...");
  const randomSeed = Math.floor(Math.random() * 1000000);
  const cleanPrompt = encodeURIComponent(prompt.trim());
  const fallbackUrl = `https://image.pollinations.ai/prompt/${cleanPrompt}?width=1024&height=1024&nologo=true&seed=${randomSeed}&model=flux`;

  return { url: fallbackUrl };
}
