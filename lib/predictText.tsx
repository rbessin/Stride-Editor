import { NGramModel } from './nGramModel';

let trigramModel: NGramModel | null = null;
let bigramModel: NGramModel | null = null;
let unigramModel: NGramModel | null = null;

// Load pre-trained models from JSON files
export async function loadModels(): Promise<void> {
  // Check if we're in the browser
  if (typeof window === 'undefined') {
    console.log('loadModels called on server, skipping');
    return;
  }

  try {
    // Load trigram model
    const trigramResponse = await fetch('/data/processed/trigram-model.json');
    if (!trigramResponse.ok) {
      throw new Error(`Failed to load trigram model: ${trigramResponse.status}`);
    }
    const trigramData = await trigramResponse.json();
    trigramModel = NGramModel.fromJSON(trigramData);
    
    // Load bigram model (fallback)
    const bigramResponse = await fetch('/data/processed/bigram-model.json');
    if (!bigramResponse.ok) {
      throw new Error(`Failed to load bigram model: ${bigramResponse.status}`);
    }
    const bigramData = await bigramResponse.json();
    bigramModel = NGramModel.fromJSON(bigramData);
    
    // Load unigram model (most common words fallback)
    const unigramResponse = await fetch('/data/processed/unigram-model.json');
    if (!unigramResponse.ok) {
      throw new Error(`Failed to load unigram model: ${unigramResponse.status}`);
    }
    const unigramData = await unigramResponse.json();
    unigramModel = NGramModel.fromJSON(unigramData);
    
    console.log('Models loaded successfully!');
    console.log('Trigram contexts:', trigramModel.size());
    console.log('Bigram contexts:', bigramModel.size());
    console.log('Unigram contexts:', unigramModel.size());
  } catch (error) {
    console.error('Failed to load models:', error);
    throw error;
  }
}

// Predict next word with fallback strategy
export function predictNextWord(words: string[]): string | null {
  if (words.length === 0) return null;
  
  // Check if models are loaded
  if (!trigramModel && !bigramModel && !unigramModel) {
    console.warn('Models not loaded yet');
    return null;
  }
  
  // Normalize words (lowercase, trim)
  const normalizedWords = words.map(w => w.toLowerCase().trim());
  
  // Try trigram (2 words of context)
  if (normalizedWords.length >= 2 && trigramModel) {
    const trigramContext = normalizedWords.slice(-2);
    const prediction = getBestPrediction(trigramModel, trigramContext, 'trigram');
    if (prediction) return prediction;
  }
  
  // Fallback to bigram (1 word of context)
  if (normalizedWords.length >= 1 && bigramModel) {
    const bigramContext = normalizedWords.slice(-1);
    const prediction = getBestPrediction(bigramModel, bigramContext, 'bigram');
    if (prediction) return prediction;
  }
  
  // Fallback to unigram (most common words)
  if (unigramModel) {
    const prediction = getBestPrediction(unigramModel, [], 'unigram');
    if (prediction) return prediction;
  }
  
  return null;
}

function getBestPrediction(
  model: NGramModel, 
  context: string[], 
  modelType: string
): string | null {
  const possibleWords = model.getPossibleWords(context);
  
  console.log(`[${modelType}] Looking up context:`, context);
  
  if (!possibleWords || possibleWords.size === 0) {
    console.log(`[${modelType}] No predictions found`);
    return null;
  }
  
  let bestWord = '';
  let maxCount = 0;
  
  for (const [word, count] of possibleWords) {
    if (count > maxCount) {
      maxCount = count;
      bestWord = word;
    }
  }
  
  console.log(`[${modelType}] Selected prediction: "${bestWord}" (count: ${maxCount})`);
  return bestWord;
}

export function areModelsLoaded(): boolean {
  return trigramModel !== null && bigramModel !== null && unigramModel !== null;
}