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

export default function RichTextEditor() {
  return <QuillEditor />;
}