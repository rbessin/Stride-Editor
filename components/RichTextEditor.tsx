'use client';

import { useEffect, useRef, useState } from 'react';
import Quill from 'quill';
import 'quill/dist/quill.snow.css';
import '@/app/custom-quill.css';
import { trainOnNewWord, predictNextWord } from '@/lib/predictText';

export default function RichTextEditor() {
  const editorRef = useRef<HTMLDivElement>(null);
  const quillRef = useRef<Quill | null>(null);
  const [wordCount, setWordCount] = useState(0);
  const [words, setWords] = useState<string[]>([]);
  const [prediction, setPrediction] = useState<string | null>(null);
  const predictionRef = useRef<string | null>(null);
  const previousWordsRef = useRef<string[]>([]);

  useEffect(() => {
    if (editorRef.current && !quillRef.current) {
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
            key: 9, // Tab key code
            handler: function() {
              if (predictionRef.current && quillRef.current) {
                const selection = quillRef.current.getSelection();
                
                if (selection) {
                  // Insert the prediction, move cursor and clear prediction
                  quillRef.current.insertText(selection.index, predictionRef.current + ' ');
                  quillRef.current.setSelection(selection.index + predictionRef.current.length + 1);
                  setPrediction(null);
                  predictionRef.current = null;
                }
                return false; // Prevent default tab behavior
              }
              return true; // Allow default if no prediction
            }
          }}}
        }
      });

      // Listen for text changes
      quillRef.current.on('text-change', (delta) => {
        const text = quillRef.current?.getText() || '';
        
        // Check if the last change was adding a space (word completion)
        const lastOp = delta.ops[delta.ops.length - 1];
        const justTypedSpace = lastOp?.insert === ' ' || lastOp?.insert === '\n';
        
        // Split into words
        const currentWords = text.trim().split(/\s+/).filter(word => word.length > 0);
        
        // Only train when a space/newline was just typed
        if (justTypedSpace && currentWords.length > previousWordsRef.current.length) {
          if (currentWords.length >= 2) {
            const contextWord = currentWords[currentWords.length - 2];
            const newWord = currentWords[currentWords.length - 1];
            trainOnNewWord(contextWord, newWord);
          }
          previousWordsRef.current = currentWords;
          
          // Get prediction after typing space
          const pred = predictNextWord(currentWords);
          setPrediction(pred);
          predictionRef.current = pred;
        } else if (justTypedSpace) {
          // If space was typed but no new word added, clear prediction
          setPrediction(null);
          predictionRef.current = null;
        }
        // DON'T clear prediction when typing regular characters - keep it visible!
        
        setWords(currentWords);
        setWordCount(currentWords.length);
      });
    }

    return () => {
      if (quillRef.current) {
        quillRef.current = null;
      }
    };
  }, []);

  return (
    <div className="flex-1 flex flex-col overflow-auto">
      <div className="flex-1 bg-white dark:bg-tertiary flex flex-col">
        <div 
          ref={editorRef} 
          className="flex-1 prose dark:prose-invert max-w-none relative"
        />
        
        {/* Ghost text */}
        {prediction && (
          <div 
            className="text-gray-400"
            style={{position: 'fixed', left: 20, bottom: 60, zIndex: 1000, fontSize: '20px'}}
          >
          </div>
        )}
        
        <div className="text-xs text-gray-500 dark:text-white my-1 mx-1">
          <span className='px-1 py-0.5 bg-gray-200 dark:bg-gray-700 rounded'>Word count: {wordCount}</span>
          {prediction && (
            <span className="ml-4">
              Press <kbd className="px-1 py-0.5 bg-gray-200 dark:bg-gray-700 rounded">Tab</kbd> to accept &quot; {prediction} &quot;
            </span>
          )}
        </div>
      </div>
    </div>
  );
}