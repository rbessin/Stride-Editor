'use client';

import { useEffect, useRef, useState } from 'react';
import Quill from 'quill';
import 'quill/dist/quill.snow.css';
import '@/app/custom-quill.css';
import { loadModels, predictNextWord, areModelsLoaded } from '@/lib/predictText';

export default function RichTextEditor() {
  const editorRef = useRef<HTMLDivElement>(null);
  const quillRef = useRef<Quill | null>(null);
  const [wordCount, setWordCount] = useState(0);
  const [words, setWords] = useState<string[]>([]);
  const [prediction, setPrediction] = useState<string | null>(null);
  const [modelsLoaded, setModelsLoaded] = useState(false);
  const predictionRef = useRef<string | null>(null);
  const previousWordsRef = useRef<string[]>([]);
  const isInitialized = useRef(false); // Add this to prevent double initialization

  // Load models on component mount
  useEffect(() => {
    async function initModels() {
      try {
        await loadModels();
        setModelsLoaded(true);
        console.log('Prediction models loaded successfully');
      } catch (error) {console.error('Failed to load prediction models:', error);}
    }
    
    initModels();
  }, []);

  useEffect(() => {
    // Prevent double initialization
    if (editorRef.current && !quillRef.current && !isInitialized.current) {
      isInitialized.current = true; // Mark as initialized
      
      // Initialize Quill
      quillRef.current = new Quill(editorRef.current, {
        theme: 'snow',
        placeholder: 'Start typing...',
        modules: {
          toolbar: [
            ['bold', 'italic', 'underline'],
            [{ 'header': [1, 2, 3, false] }],
            [{ 'list': 'ordered'}, { 'list': 'bullet' }],
            ['clean']
          ],
          keyboard: { bindings: { tab: {
            key: 9,
            handler: function() {
              if (predictionRef.current && quillRef.current) {
                const selection = quillRef.current.getSelection();
                
                if (selection) {
                  const predText = predictionRef.current;
                  // Clear prediction before inserting to prevent race condition
                  setPrediction(null);
                  predictionRef.current = null;
                  
                  quillRef.current.insertText(selection.index, predText + ' ');
                  quillRef.current.setSelection(selection.index + predText.length + 1);
                }
                return false;
              }
              return true;
            }
          }}}
        }
      });

      // Listen for text changes
      quillRef.current.on('text-change', (delta) => {
        const text = quillRef.current?.getText() || '';
        
        const lastOp = delta.ops && delta.ops.length > 0 ? delta.ops[delta.ops.length - 1] : null;
        const justTypedSpace = lastOp?.insert === ' ' || lastOp?.insert === '\n';
        
        const currentWords = text
          .trim()
          .split(/\s+/)
          .filter(word => word.length > 0)
          .map(word => word.toLowerCase());
        
        if (justTypedSpace && areModelsLoaded()) {
          previousWordsRef.current = currentWords;
          
          const pred = predictNextWord(currentWords);
          setPrediction(pred);
          predictionRef.current = pred;
        } else if (!justTypedSpace && currentWords.length > 0) {
          const lastWord = text.trim().split(/\s+/).pop() || '';
          if (lastWord.length > 0 && !lastWord.match(/^\s/)) {
            setPrediction(null);
            predictionRef.current = null;
          }
        }
        console.log("Text changed.")
        setWords(currentWords);
        setWordCount(currentWords.length);
      });
    }
  }, []); // Empty dependency array - only run once on mount

  return (
    <div className="flex-1 flex flex-col overflow-auto">
      <div className="flex-1 bg-white dark:bg-tertiary flex flex-col">
        <div
          ref={editorRef} 
          className="flex-1 prose dark:prose-invert max-w-none relative"
        />
        
        {prediction && (
          <div 
            className="text-gray-400"
            style={{position: 'fixed', left: 20, bottom: 60, zIndex: 1000, fontSize: '20px'}}
          >
          </div>
        )}
        
        <div className="text-xs text-gray-500 dark:text-white my-1 mx-1">
          <span className='px-1 py-0.5 bg-gray-200 dark:bg-gray-700 rounded'>
            Word count: {wordCount}
          </span>
          {!modelsLoaded && (
            <span className="ml-4 text-yellow-600 dark:text-yellow-400">
              Loading prediction models...
            </span>
          )}
          {modelsLoaded && prediction && (
            <span className="ml-4">
              Press <kbd className="px-1 py-0.5 bg-gray-200 dark:bg-gray-700 rounded">Tab</kbd> to accept &quot;{prediction}&quot;
            </span>
          )}
        </div>
      </div>
    </div>
  );
}