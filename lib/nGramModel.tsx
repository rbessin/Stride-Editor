interface NGramEntry {
  context: string;
  words: [string, number][];
}

interface NGramJSON {
  n: number;
  nGrams: NGramEntry[];
}

export class NGramModel {
  private nGrams: Map<string, Map<string, number>>;
  private n: number; // The order of the n-gram (2 for bigram, 3 for trigram, etc.)
  
  constructor(n: number = 3) {
    this.nGrams = new Map();
    this.n = n;
  }
  
  // Add a sequence where context is an array of words
  addSequence(context: string[], nextWord: string): void {
    // Validate that context has the right length (n-1 words)
    if (context.length !== this.n - 1) {
      throw new Error(`Context must have ${this.n - 1} words for ${this.n}-gram model`);
    }
    
    // Join context words with a delimiter to create a unique key
    const contextKey = context.join('|');
    
    if (!this.nGrams.has(contextKey)) {
      this.nGrams.set(contextKey, new Map());
    }
    
    const counts = this.nGrams.get(contextKey)!;
    counts.set(nextWord, (counts.get(nextWord) || 0) + 1);
  }
  
  // Get possible next words given a context array
  getPossibleWords(context: string[]): Map<string, number> | undefined {
    if (context.length !== this.n - 1) {
      return undefined;
    }
    
    const contextKey = context.join('|');
    return this.nGrams.get(contextKey);
  }
  
  // Export model to JSON for saving
  toJSON(): NGramJSON {
    return {
      n: this.n,
      nGrams: Array.from(this.nGrams.entries()).map(([context, words]) => ({
        context,
        words: Array.from(words.entries())
      }))
    };
  }
  
  // Load model from JSON
  static fromJSON(json: NGramJSON): NGramModel {
    const model = new NGramModel(json.n);
    
    for (const entry of json.nGrams) {
      const wordsMap = new Map<string, number>(entry.words);
      model.nGrams.set(entry.context, wordsMap);
    }
    
    return model;
  }
  
  // Get the size of the model (number of unique contexts)
  size(): number {
    return this.nGrams.size;
  }
  
  // Prune rare n-grams (keep only those that appear at least minCount times)
  prune(minCount: number): void {
    for (const [context, words] of this.nGrams.entries()) {
      // Remove words that don't meet the minimum count
      for (const [word, count] of words.entries()) {
        if (count < minCount) {
          words.delete(word);
        }
      }
      
      // If no words remain, remove the entire context
      if (words.size === 0) {
        this.nGrams.delete(context);
      }
    }
  }
}