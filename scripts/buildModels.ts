import { NGramModel } from '@/lib/nGramModel';
import * as fs from 'fs';
import * as path from 'path';

function tokenize(text: string): string[] {
  // Remove Project Gutenberg headers/footers
  text = text.replace(/\*\*\* START OF .+ \*\*\*/gi, '');
  text = text.replace(/\*\*\* END OF .+ \*\*\*/gi, '');
  
  // Normalize: lowercase, split on whitespace and punctuation
  return text
    .toLowerCase()
    .replace(/[^\w\s']/g, ' ')
    .split(/\s+/)
    .filter(word => word.length > 0);
}

function processBook(filepath: string, models: { 
  fourgram: NGramModel,
  trigram: NGramModel, 
  bigram: NGramModel, 
  unigram: NGramModel 
}): void {
  console.log(`Processing: ${path.basename(filepath)}`);
  
  const text = fs.readFileSync(filepath, 'utf-8');
  const words = tokenize(text);
  
  console.log(`  ${words.length} words found`);
  
  // Build 4-grams
  for (let i = 0; i < words.length - 3; i++) {
    models.fourgram.addSequence([words[i], words[i+1], words[i+2]], words[i+3]);
  }
  
  // Build trigrams
  for (let i = 0; i < words.length - 2; i++) {
    models.trigram.addSequence([words[i], words[i + 1]], words[i + 2]);
  }
  
  // Build bigrams
  for (let i = 0; i < words.length - 1; i++) {
    models.bigram.addSequence([words[i]], words[i + 1]);
  }
  
  // Build unigrams (word frequencies)
  for (let i = 0; i < words.length; i++) {
    models.unigram.addSequence([], words[i]);
  }
}

async function main() {
  const models = {
    fourgram: new NGramModel(4),
    trigram: new NGramModel(3),
    bigram: new NGramModel(2),
    unigram: new NGramModel(1)
  };
  
  // Process all .txt files in data/raw directory
  const rawDir = path.join(process.cwd(), 'public', 'data', 'raw');
  const files = fs.readdirSync(rawDir).filter(f => f.endsWith('.txt'));
  
  console.log(`Found ${files.length} books to process\n`);
  
  for (const file of files) {
    processBook(path.join(rawDir, file), models);
  }
  
  console.log('\n--- Model Statistics ---');
  console.log(`4-gram contexts: ${models.fourgram.size()}`);
  console.log(`Trigram contexts: ${models.trigram.size()}`);
  console.log(`Bigram contexts: ${models.bigram.size()}`);
  console.log(`Unigram contexts: ${models.unigram.size()}`);
  
  // Prune rare n-grams to reduce file size
  console.log('\n--- Pruning rare n-grams ---');
  models.fourgram.prune(2); // Keep only n-grams that appear 2+ times
  models.trigram.prune(2);
  models.bigram.prune(3);
  models.unigram.prune(5);
  
  console.log(`After pruning:`);
  console.log(`4-gram contexts: ${models.fourgram.size()}`);
  console.log(`Trigram contexts: ${models.trigram.size()}`);
  console.log(`Bigram contexts: ${models.bigram.size()}`);
  console.log(`Unigram contexts: ${models.unigram.size()}`);
  
  // Save to JSON files
  const outputDir = path.join(process.cwd(), 'public', 'data', 'processed');
  fs.mkdirSync(outputDir, { recursive: true });
  
  console.log('\n--- Saving models ---');
  fs.writeFileSync(
    path.join(outputDir, 'fourgram-model.json'),
    JSON.stringify(models.fourgram.toJSON())
  );
  console.log('✓ Saved fourgram-model.json');
  
  fs.writeFileSync(
    path.join(outputDir, 'trigram-model.json'),
    JSON.stringify(models.trigram.toJSON())
  );
  console.log('✓ Saved trigram-model.json');
  
  fs.writeFileSync(
    path.join(outputDir, 'bigram-model.json'),
    JSON.stringify(models.bigram.toJSON())
  );
  console.log('✓ Saved bigram-model.json');
  
  fs.writeFileSync(
    path.join(outputDir, 'unigram-model.json'),
    JSON.stringify(models.unigram.toJSON())
  );
  console.log('✓ Saved unigram-model.json');
  
  console.log('\n✅ All models built successfully!');
}

main().catch(console.error);