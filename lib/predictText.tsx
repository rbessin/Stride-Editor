import { NGramModel } from './nGramModel';

const model = new NGramModel();

// Train on a single new word pair (context + next word)
export function trainOnNewWord(contextWord: string, nextWord: string): void {
  model.addSequence(contextWord, nextWord);
}

export function predictNextWord(words: string[]): string | null {
  if (words.length === 0) return null;
  
  const context = words[words.length - 1];
  const possibleWords = model.getPossibleWords(context);
  
  console.log('Looking up context:', context);
  console.log('Possible words from model:', possibleWords);
  
  if (!possibleWords) return null;
  
  let bestWord = '';
  let maxCount = 0;
  
  for (const [word, count] of possibleWords) {
    console.log(`  - "${word}": ${count} times`);
    if (count > maxCount) {
      maxCount = count;
      bestWord = word;
    }
  }
  
  console.log('Selected prediction:', bestWord);
  return bestWord;
}