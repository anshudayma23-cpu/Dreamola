export const PLAN_LIMITS = {
  free: { // Dreamer
    meanings: 3,
    literalArt: 2,
    feelingArt: 1,
    journalAccess: false,
    pdfExport: false,
  },
  mid: { // Lucid
    meanings: 5,
    literalArt: 3,
    feelingArt: 2,
    journalAccess: true,
    pdfExport: true,
  },
  premium: { // Oracle
    meanings: Infinity,
    literalArt: 7,
    feelingArt: 4,
    journalAccess: true,
    pdfExport: true,
  }
} as const;

export const GUEST_LIMITS = {
  meanings: 1,
  literalArt: 0,
  feelingArt: 0,
  journalAccess: false,
  pdfExport: false,
} as const;

export const ART_STYLE_SUFFIX =
  ", surreal dreamlike illustration, soft muted colors, ethereal atmosphere";

export const FALLBACK_INTERPRETATION =
  "This dream holds something personal to you — dreams like this often reflect " +
  "what's been on your mind lately. Consider what feeling stayed with you after waking.";

export const DISCLAIMER =
  "This is a reflective tool, not medical or psychological advice.";
