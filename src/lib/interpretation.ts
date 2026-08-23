import { prisma } from './db';
import { stem, tokenize } from './stemmer';
import { FALLBACK_INTERPRETATION, DISCLAIMER } from './constants';
import { Symbol } from '@prisma/client';

let cachedSymbols: Symbol[] | null = null;

export async function loadSymbols() {
  if (!cachedSymbols) {
    cachedSymbols = await prisma.symbol.findMany();
  }
  return cachedSymbols;
}

const STOP_WORDS = new Set(['in', 'the', 'a', 'an', 'and', 'or', 'to', 'of', 'for', 'with', 'on', 'at', 'by', 'from', 'is', 'am', 'are', 'was', 'were', 'feeling', 'like']);

export async function extractSymbols(dreamText: string): Promise<Symbol[]> {
  const symbols = await loadSymbols();
  const normalizedText = dreamText.toLowerCase();
  
  const tokens = tokenize(dreamText).map(t => t.toLowerCase());
  const stemmedTokens = tokens.map(stem);
  const userWords = new Set([...tokens, ...stemmedTokens]);
  
  const matched: Symbol[] = [];
  
  for (const sym of symbols) {
    const keyword = sym.keyword.toLowerCase();
    
    if (keyword.includes(' ')) {
      // For multi-word symbols, the exact phrase must appear in the text,
      // or the stemmed words of the phrase must appear consecutively in the user's dream.
      if (normalizedText.includes(keyword)) {
        matched.push(sym);
      } else {
        const phraseStems = keyword.split(/\s+/).map(stem);
        let matchedPhrase = false;
        
        for (let i = 0; i <= stemmedTokens.length - phraseStems.length; i++) {
          let match = true;
          for (let j = 0; j < phraseStems.length; j++) {
            if (stemmedTokens[i + j] !== phraseStems[j]) {
              match = false;
              break;
            }
          }
          if (match) {
            matchedPhrase = true;
            break;
          }
        }
        
        if (matchedPhrase) {
          matched.push(sym);
        }
      }
    } else {
      // For single-word symbols, check if the keyword or its aliases/stems are in the user's words
      if (userWords.has(keyword) || sym.aliases.some(alias => userWords.has(alias.toLowerCase()))) {
        matched.push(sym);
      }
    }
  }
  
  // Sort by length descending so more specific/longer symbols get prioritized
  matched.sort((a, b) => b.keyword.length - a.keyword.length);
  
  // Fisher-Yates shuffle within same-length groups for variety
  for (let i = matched.length - 1; i > 0; i--) {
    if (matched[i].keyword.length === matched[i - 1].keyword.length) {
      const j = Math.floor(Math.random() * (i + 1));
      if (matched[j].keyword.length === matched[i].keyword.length) {
        [matched[i], matched[j]] = [matched[j], matched[i]];
      }
    }
  }
  
  return matched.slice(0, 4);
}

export function generateInterpretation(symbols: Symbol[], depthMode: 'deep' | 'surface' = 'deep'): string {
  if (symbols.length === 0) return FALLBACK_INTERPRETATION;
  
  let result = depthMode === 'deep' 
    ? "On a deeper psychological level, your dream holds significant meaning. "
    : "Looking at the literal elements of your dream, we can see some interesting themes. ";

  symbols.forEach((sym, index) => {
    const interpretationText = depthMode === 'deep' ? sym.interpretationTheme : `it relates to concepts of ${sym.keyword}`;
    
    if (index === 0) {
      result += `The presence of '${sym.keyword}' suggests ${interpretationText}. `;
    } else if (index === symbols.length - 1) {
      result += `Finally, '${sym.keyword}' often points to ${interpretationText}. `;
    } else {
      result += `Additionally, '${sym.keyword}' can mean ${interpretationText}. `;
    }
  });
  
  return result.trim();
}

/**
 * Validates if the input text represents a plausible dream, vision, or sleep story,
 * filtering out random technical buzzwords, code snippets, shopping lists, or gibberish.
 */
export async function validateDreamRelevancy(dreamText: string): Promise<{ isValid: boolean; reason?: string }> {
  const trimmed = dreamText.trim();
  
  // 1. Basic Heuristic Checks
  if (trimmed.length < 10) {
    return { isValid: false, reason: "Your description is too short. Please describe your dream in at least a full sentence." };
  }
  
  const words = trimmed.split(/\s+/);
  if (words.length < 2) {
    return { isValid: false, reason: "Please write a brief description of your dream (at least 2–3 words)." };
  }

  // Check repeating character spam (e.g., 'aaaaaa', 'asdfghjkl')
  if (/([a-zA-Z])\1{4,}/.test(trimmed) || /asdfgh|qwerty|zxcvbn/i.test(trimmed)) {
    return { isValid: false, reason: "Please avoid random keyboard characters or gibberish." };
  }

  // Check code/programming syntax (e.g. SELECT *, console.log, <script>, {}, ;)
  if (/select\s+.*\s+from/i.test(trimmed) || /<script|<\/script>/i.test(trimmed) || /[{};]=/i.test(trimmed)) {
    return { isValid: false, reason: "This input looks like code or a database query rather than a dream description." };
  }

  // Check heavy technical/programming keywords
  const techKeywords = [
    'load testing', 'web application', 'sql injection', 'unit test', 'api endpoint',
    'npm install', 'git commit', 'pull request', 'function()', 'database url',
    'source code', 'http://', 'https://', 'system.out.println', 'console.log',
    'select * from', 'where 1=1', 'drop table', 'const ', 'let ', 'var '
  ];
  const lowerText = trimmed.toLowerCase();
  if (techKeywords.some(kw => lowerText.includes(kw))) {
    return { isValid: false, reason: "This input looks like technical text or code rather than a dream description. Please describe what you saw, felt, or experienced in your sleep." };
  }

  // 2. AI Classification via Gemini API (Tier 2 Guardrail)
  const apiKey = process.env.GOOGLE_AI_API_KEY_1 || process.env.GEMINI_API_KEY;
  if (apiKey) {
    try {
      const prompt = `You are a strict dream content validator for Dreamola. Determine if the following input describes a plausible dream, sleep vision, surreal narrative, or emotional sleep experience.
If the text is technical documentation, programming code, web performance test, shopping list, business email, random gibberish, or non-dream statement (e.g., "web application load testing"), classify it as NOT a dream.

Respond ONLY with valid JSON in this exact structure:
{"isValidDream": true|false, "reason": "brief reason why"}

Text: "${trimmed.replace(/"/g, '\\"')}"`;

      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: { responseMimeType: "application/json" }
        })
      });

      if (response.ok) {
        const data = await response.json();
        const responseText = data.candidates?.[0]?.content?.parts?.[0]?.text;
        if (responseText) {
          const parsed = JSON.parse(responseText);
          if (parsed.isValidDream === false) {
            return {
              isValid: false,
              reason: parsed.reason || "We couldn't detect a dream story or sleep experience in your text. Please describe a scene, feeling, or vision from your dream."
            };
          }
        }
      }
    } catch (err) {
      console.warn("Gemini dream validation error, falling back to heuristic:", err);
    }
  }

  return { isValid: true };
}

export async function interpret(dreamText: string, depthMode: 'deep' | 'surface' = 'deep') {
  // Check dream relevancy guardrail
  const relevancy = await validateDreamRelevancy(dreamText);
  if (!relevancy.isValid) {
    return {
      isValidDream: false,
      error: 'NOT_A_DREAM',
      message: relevancy.reason || "We couldn't detect a dream story or sleep experience in your text. Please describe a scene, feeling, or vision from your dream.",
      interpretation: null,
      matchedSymbols: [],
      disclaimer: DISCLAIMER
    };
  }

  const symbols = await extractSymbols(dreamText);
  const interpretation = generateInterpretation(symbols, depthMode);
  
  return {
    isValidDream: true,
    interpretation,
    matchedSymbols: symbols.map(s => s.keyword),
    disclaimer: DISCLAIMER
  };
}

