import natural from 'natural';

const stemmer = natural.PorterStemmer;

export function stem(word: string): string {
  return stemmer.stem(word.toLowerCase());
}

export function tokenize(text: string): string[] {
  const cleaned = text.toLowerCase().replace(/[^\w\s]/gi, '');
  return cleaned.split(/\s+/).filter(Boolean);
}
