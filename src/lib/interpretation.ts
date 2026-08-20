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

export async function interpret(dreamText: string, depthMode: 'deep' | 'surface' = 'deep') {
  const symbols = await extractSymbols(dreamText);
  const interpretation = generateInterpretation(symbols, depthMode);
  
  return {
    interpretation,
    matchedSymbols: symbols.map(s => s.keyword),
    disclaimer: DISCLAIMER
  };
}
