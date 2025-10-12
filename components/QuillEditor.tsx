'use client';

import { useEffect, useRef, useState } from 'react';
import type Quill from 'quill';
import 'quill/dist/quill.snow.css';
import '@/app/custom-quill.css';

interface QuillEditorProps {
  fileContent?: string;
  fileName?: string;
  onContentChange?: (getContent: () => Promise<{ content: string; fileName: string }>) => void;
}

export default function QuillEditor({ fileContent, fileName, onContentChange }: QuillEditorProps) {
  const editorRef = useRef<HTMLDivElement>(null);
  const quillRef = useRef<Quill | null>(null);
  const [wordCount, setWordCount] = useState(0);
  const [prediction, setPrediction] = useState<string | null>(null);
  const [modelsLoaded, setModelsLoaded] = useState(false);
  const predictionRef = useRef<string | null>(null);
  const isInitialized = useRef(false);

  useEffect(() => {
    if (typeof window === 'undefined' || !editorRef.current || isInitialized.current) {
      return;
    }

    isInitialized.current = true;

    // Load everything dynamically
    Promise.all([
      import('quill'),
      import('@/lib/predictText')
    ]).then(([QuillModule, predictModule]) => {
      const Quill = QuillModule.default;
      
      if (!editorRef.current || quillRef.current) return;

      // Initialize models
      predictModule.loadModels().then(() => {
        setModelsLoaded(true);
        console.log('Models loaded');
      }).catch(err => {
        console.error('Failed to load models:', err);
      });

      // Initialize Quill
      quillRef.current = new Quill(editorRef.current, {
        theme: 'snow',
        placeholder: 'Start typing...',
        modules: {
          toolbar: [
            [{ 'header': [1, 2, 3, 4, 5, 6, false] }], // Dropdown with Normal option
            [{ 'font': [] }],
            
            ['bold', 'italic', 'underline', 'strike'],
            [{ 'color': [] }, { 'background': [] }],
            
            [{ 'script': 'sub'}, { 'script': 'super' }],
            
            [{ 'list': 'ordered'}, { 'list': 'bullet' }, { 'list': 'check' }],
            [{ 'indent': '-1'}, { 'indent': '+1' }],
            [{ 'align': [] }],
            [{ 'direction': 'rtl' }],
            
            ['blockquote', 'code-block'],
            ['link', 'image', 'video', 'formula'],
            
            ['clean']
          ],
          keyboard: {
            bindings: {
              tab: {
                key: 9,
                handler: function() {
                  if (predictionRef.current && quillRef.current) {
                    const selection = quillRef.current.getSelection();
                    
                    if (selection) {
                      const predText = predictionRef.current;
                      setPrediction(null);
                      predictionRef.current = null;
                      
                      quillRef.current.insertText(selection.index, predText + ' ');
                      quillRef.current.setSelection(selection.index + predText.length + 1);
                    }
                    return false;
                  }
                  return true;
                }
              }
            }
          }
        }
      });

      // Text change handler
      quillRef.current.on('text-change', (delta: any) => {
        if (!quillRef.current) return;
        
        const text = quillRef.current.getText() || '';
        
        const lastOp = delta.ops && delta.ops.length > 0 ? delta.ops[delta.ops.length - 1] : null;
        const justTypedSpace = lastOp?.insert === ' ' || lastOp?.insert === '\n';
        
        const currentWords = text
          .trim()
          .split(/\s+/)
          .filter((word: string) => word.length > 0)
          .map((word: string) => word.toLowerCase());
        
        setWordCount(currentWords.length);
        
        if (justTypedSpace && predictModule.areModelsLoaded()) {
          const pred = predictModule.predictNextWord(currentWords);
          setPrediction(pred);
          predictionRef.current = pred;
        } else if (!justTypedSpace && currentWords.length > 0) {
          const lastWord = text.trim().split(/\s+/).pop() || '';
          if (lastWord.length > 0 && !lastWord.match(/^\s/)) {
            setPrediction(null);
            predictionRef.current = null;
          }
        }
      });
    }).catch(err => {
      console.error('Failed to initialize editor:', err);
    });

    return () => {
      if (quillRef.current) {
        try {
          quillRef.current.off('text-change');
        } catch (e) {}
        quillRef.current = null;
      }
    };
  }, []);

  // Provide content getter to parent
  useEffect(() => {
    if (onContentChange && quillRef.current) {
      onContentChange(async () => ({
        content: quillRef.current?.getText() || '',
        fileName: fileName || 'untitled.txt'
      }));
    }
  }, [onContentChange, fileName]);

  // Load file content when it changes
  useEffect(() => {
    if (quillRef.current && fileContent !== undefined) {
      const CHUNK_SIZE = 10000; // Insert 10k characters at a time
      
      if (fileContent.length > CHUNK_SIZE) {
        // Clear editor first
        quillRef.current.setText('');
        
        let index = 0;
        const insertChunk = () => {
          if (!quillRef.current || index >= fileContent.length) return;
          
          const chunk = fileContent.slice(index, index + CHUNK_SIZE);
          quillRef.current.insertText(index, chunk);
          index += CHUNK_SIZE;
          
          if (index < fileContent.length) {
            setTimeout(insertChunk, 0);
          } else {
            quillRef.current.setSelection(0, 0);
          }
        };
        
        setTimeout(insertChunk, 50);
      } else {
        setTimeout(() => {
          if (quillRef.current) {
            quillRef.current.setText(fileContent);
            quillRef.current.setSelection(0, 0);
          }
        }, 50);
      }
    }
  }, [fileContent]);

  return (
    <div className="flex-1 flex flex-col overflow-auto">
      <div className="flex-1 bg-white dark:bg-tertiary flex flex-col">
        <div
          ref={editorRef} 
          className="flex-1 prose dark:prose-invert max-w-none relative"
        />
        
        <div className="text-xs text-gray-500 dark:text-white my-1 mx-1">
          {fileName && (
            <span className='px-1 py-0.5 bg-blue-200 dark:bg-blue-900 rounded mr-2'>
              {fileName}
            </span>
          )}
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