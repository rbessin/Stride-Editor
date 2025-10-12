export class NGramModel {
  private nGrams: Map<string, Map<string, number>>;
  
  constructor() {
    this.nGrams = new Map();
  }
  
  addSequence(context: string, nextWord: string): void {
    if (!this.nGrams.has(context)) {
      this.nGrams.set(context, new Map());
    }
    const counts = this.nGrams.get(context)!;
    counts.set(nextWord, (counts.get(nextWord) || 0) + 1);
  }
  
  getPossibleWords(context: string): Map<string, number> | undefined {
    return this.nGrams.get(context);
  }
}