'use client';

import dynamic from 'next/dynamic';

// Creates a dynamic import of Quill Editor
const QuillEditor = dynamic(() => import('./QuillEditor'), {
  // Blocks server side rendering
  ssr: false,
  // Server renders loading while client renders the editor
  loading: () => (
    <div className="flex-1 flex items-center justify-center">
      <p>Loading editor...</p>
    </div>
  )
});

// Defined the prop interface for the Quill Editor
interface RichTextEditorProps {
  fileContent?: string;
  fileName?: string;
  onContentChange?: (getContent: () => Promise<{ content: string; fileName: string }>) => void;
}

// Exports the dynamically loaded Quill Editor component with its props
export default function RichTextEditor({ fileContent, fileName, onContentChange }: RichTextEditorProps) {
  return <QuillEditor fileContent={fileContent} fileName={fileName} onContentChange={onContentChange} />;
}