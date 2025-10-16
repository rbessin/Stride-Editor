// components/sidebar/NewFileDialog.tsx

import { useState } from 'react';
import { TextButton } from '@/components/ui/Button';

interface NewFileDialogProps {
  onConfirm: (fileName: string) => void;
  onCancel: () => void;
}

export function NewFileDialog({ onConfirm, onCancel }: NewFileDialogProps) {
  const [fileName, setFileName] = useState('');

  const handleConfirm = () => {
    if (!fileName.trim()) {
      alert('Please enter a file name');
      return;
    }
    onConfirm(fileName);
  };

  return (
    <div className="mt-2 p-2 bg-gray-100 dark:bg-gray-800 rounded">
      <input
        type="text"
        value={fileName}
        onChange={(e) => setFileName(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === 'Enter') handleConfirm();
          if (e.key === 'Escape') onCancel();
        }}
        placeholder="Enter file name..."
        className="w-full px-2 py-1 text-sm border rounded dark:bg-gray-700 dark:border-gray-600"
        autoFocus
      />
      <div className="flex gap-2 mt-2">
        <TextButton onClick={handleConfirm} variant="primary" size="md" className="flex-1">
          Create
        </TextButton>
        <TextButton onClick={onCancel} variant="default" size="md" className="flex-1">
          Cancel
        </TextButton>
      </div>
    </div>
  );
}