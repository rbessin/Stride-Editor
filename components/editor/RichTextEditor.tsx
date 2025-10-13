'use client';

import dynamic from 'next/dynamic';

const QuillEditor = dynamic(() => import('./QuillEditor'), {
  ssr: false,
  loading: () => (
    <div className="flex-1 flex items-center justify-center">
      <p>Loading editor...</p>
    </div>
  )
});

interface RichTextEditorProps {
  fileContent?: string;
  fileName?: string;
  onContentChange?: (getContent: () => Promise<{ content: string; fileName: string }>) => void;
}

export default function RichTextEditor({ fileContent, fileName, onContentChange }: RichTextEditorProps) {
  return <QuillEditor fileContent={fileContent} fileName={fileName} onContentChange={onContentChange} />;
}