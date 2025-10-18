'use client';

import { useEffect, useRef, useState } from 'react';
import type Quill from 'quill';
import 'quill/dist/quill.snow.css';
import '@/app/custom-quill.css';
import { Label } from '@/components/ui/Label';

// Type props for the Quill Editor
interface QuillEditorProps {
  fileContent?: string;
  fileName?: string;
  onContentChange?: (getContent: () => Promise<{ content: string; fileName: string }>) => void;
}

// Types for operations within Quill Editor
interface DeltaOperation {
  insert?: string | Record<string, unknown>;
  delete?: number;
  retain?: number;
  attributes?: Record<string, unknown>;
}

// Types for delta (an array of operations)
interface Delta {ops?: DeltaOperation[];}

// Declares the Quill Editor used for text editing
export default function QuillEditor({ fileContent, fileName, onContentChange }: QuillEditorProps) {
  // References to the Quill Editor div and to the Quill instance
  const editorRef = useRef<HTMLDivElement>(null);
  const quillRef = useRef<Quill | null>(null);
  // State variable to track word counts
  const [wordCount, setWordCount] = useState(0);
  // Reference to track Quill Editor instances and prevent double initialization
  const isInitialized = useRef(false);
  // State variables for model load and prediction states
  const [prediction, setPrediction] = useState<{ word: string; modelType: string } | null>(null);
  const [modelsLoaded, setModelsLoaded] = useState(false);
  // Reference to track updating prediction
  const predictionRef = useRef<{ word: string; modelType: string } | null>(null);
  // Reference to store predictModule so tab handler can access it
  const predictModuleRef = useRef<typeof import('@/lib/predictText') | null>(null);

  useEffect(() => {
    // Prevents server initialization of component and double initialization
    if (typeof window === 'undefined' || !editorRef.current || isInitialized.current) {return;}
    // Sets the component state to initialized, to prevent double initialization
    isInitialized.current = true;

    // Dynamically loads libraries and components once the editor component mounts
    Promise.all([
      import('katex'),
      import('quill'),
      import('@/lib/predictText')
    ]).then(([katexModule, QuillModule, predictModule]) => {
      // Loads the default Quill Module export
      const Quill = QuillModule.default;
      
      // Attaches KaTeX to window for Quill's formula module to access
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (window as any).katex = katexModule.default;
      
      // Store predictModule in ref for tab handler access
      predictModuleRef.current = predictModule;
      
      // Exits if the editor div dissapeared or if Quill already exists
      if (!editorRef.current || quillRef.current) return;

      // Initializes models and logs errors
      predictModule.loadModels().then(() => {
        setModelsLoaded(true);
      }).catch(err => {
        console.error('Failed to load models:', err);
      });

      // Initializes Quill and its toolbar settings
      quillRef.current = new Quill(editorRef.current, {
        theme: 'snow',
        placeholder: 'Start typing...',
        modules: {
          toolbar: [
            [{ 'header': [1, 2, 3, 4, 5, 6, false] }],
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
                // Handles tab key presses
                handler: function() {
                  if (predictionRef.current && quillRef.current && predictModuleRef.current) {
                    // Gets current cursor position
                    const selection = quillRef.current.getSelection();
                    // If cursor position exists, get prediction text and clear both the state and reference
                    if (selection) {
                      const predText = predictionRef.current.word;
                      setPrediction(null);
                      predictionRef.current = null;
                      // Inserts the word and a space at the cursor position and moves the cursor to after the inserted text
                      quillRef.current.insertText(selection.index, predText + ' ');
                      quillRef.current.setSelection(selection.index + predText.length + 1);
                      
                      // Get next prediction immediately after accepting current one
                      const text = quillRef.current.getText() || '';
                      const currentWords = text
                        .trim()
                        .split(/\s+/)
                        .filter((word: string) => word.length > 0)
                        .map((word: string) => word.toLowerCase());
                      
                      // Get new prediction if models are loaded
                      if (predictModuleRef.current.areModelsLoaded()) {
                        const newPred = predictModuleRef.current.predictNextWord(currentWords);
                        setPrediction(newPred);
                        predictionRef.current = newPred;
                      }
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

      // Text change handler, registers event listeners for whenever text changes in the editor
      quillRef.current.on('text-change', (delta: Delta) => {
        if (!quillRef.current) return;
        // Retrieves all text from the editor or uses default value
        const text = quillRef.current.getText() || '';
        // Gets the last operation from the change delta
        const lastOp = delta.ops && delta.ops.length > 0 ? delta.ops[delta.ops.length - 1] : null;
        // Checks if the user typed a space or a new line
        const justTypedSpace = lastOp?.insert === ' ' || lastOp?.insert === '\n';
        // Breaks text into words
        const currentWords = text
          .trim() // Remove leading/trailing whitespace
          .split(/\s+/) // Split on any whitespaces
          .filter((word: string) => word.length > 0) // Remove empty strings
          .map((word: string) => word.toLowerCase()); // Convert strings to lowercase
        
        // Updates word count
        setWordCount(currentWords.length);
        
        // Checks if user finished a word and models are ready
        if (justTypedSpace && predictModule.areModelsLoaded()) {
          // Gets the predicition and updates the state and reference
          const pred = predictModule.predictNextWord(currentWords);
          setPrediction(pred);
          predictionRef.current = pred;
        // Checks if user is still typing a word
        } else if (!justTypedSpace && currentWords.length > 0) {
          // Clears any existing prediction
          const lastWord = text.trim().split(/\s+/).pop() || '';
          if (lastWord.length > 0 && !lastWord.match(/^\s/)) {
            setPrediction(null);
            predictionRef.current = null;
          }
        }
      });
    // Error hangling if loading the editor fails
    }).catch(err => {
      console.error('Failed to initialize editor:', err);
    });

    // Cleanup function which runs when component unmounts
    return () => {
      if (quillRef.current) {
        try {quillRef.current.off('text-change');} catch {} // Removes the event listener
        quillRef.current = null; // Clears the Quill reference
      }
    };
  }, []);

  // If parent provides onContentChange callback, it gives the parent a function to call that returns current editor content and filename
  // Runs whenever callback or filename changes
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
    // Checks if the Quill Editor is initialized and there is file content
    if (quillRef.current && fileContent !== undefined) {
      // Defines the chunk character size
      const CHUNK_SIZE = 10000;
      // Checks if file is too large to load in one take
      if (fileContent.length > CHUNK_SIZE) {
        // Clears the editor text
        quillRef.current.setText('');
        // Defines the recursive function to insert chunks
        let index = 0;
        const insertChunk = () => {
          // Stops if file is loaded or if the Quill Editor is not initialized
          if (!quillRef.current || index >= fileContent.length) return;
          // Insert next chunk and advance index
          const chunk = fileContent.slice(index, index + CHUNK_SIZE);
          quillRef.current.insertText(index, chunk);
          index += CHUNK_SIZE;
          
          if (index < fileContent.length) {
            // Schedules next chunk load but prevents browser freezing
            setTimeout(insertChunk, 0);
          } else {
            // Moves cursor to after file
            quillRef.current.setSelection(0, 0);
          }
        };
        // Start the chunk process after a 50ms delay
        setTimeout(insertChunk, 50);
      } else {
        // Load small file directly after 50ms delay
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
      <div className="flex-1 bg-secondary flex flex-col">
        <div
          ref={editorRef} 
          className="flex-1 prose dark:prose-invert max-w-none relative"
        />
        
        <div className="text-xs my-1 mx-1 flex gap-2 items-center">
          {fileName && (<Label variant="primary" size="sm">{fileName}</Label>)}
          
          <Label variant="default" size="sm">Word count: {wordCount}</Label>
          
          {!modelsLoaded && (<Label variant="warning" size="sm">Loading prediction models...</Label>)}
          {modelsLoaded && prediction && (
            <>
              <Label variant="info" size="sm">Press <kbd className="px-1 py-0.5 mx-1 bg-gray-300 dark:bg-gray-600 rounded">Tab</kbd> to accept &quot;{prediction.word}&quot;</Label>
              <Label variant="info" size="sm">{prediction.modelType}-gram</Label>
            </>
          )}
        </div>
      </div>
    </div>
  );
}