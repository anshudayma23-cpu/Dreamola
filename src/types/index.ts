export type UserPlan = 'free' | 'premium';

export interface DreamolaUser {
  id: string;
  email: string;
  username: string;
  displayName?: string | null;
  bio?: string | null;
  plan: UserPlan;
}

export interface DreamInterpretationResult {
  interpretation: string;
  matchedSymbols: string[];
  disclaimer: string;
}

export interface ArtGenerationResult {
  artUrl: string;
}
