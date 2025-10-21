import { useState } from 'react';
import { TextButton } from '@/components/ui/Button';
import { Input } from '../ui/Input';

// Interface for Dialog Properties
interface NewFileDialogProps {
  onConfirm: (fileName: string) => void;
  onCancel: () => void;
}

export function NewFileDialog({ onConfirm, onCancel }: NewFileDialogProps) {
  const [fileName, setFileName] = useState('');
  // Handler for dialog confirmation
  const handleConfirm = () => {
    if (!fileName.trim()) {alert('Please enter a file name'); return;}
    onConfirm(fileName);
  };

  return (
    <div className="mt-2 p-2 bg-secondary rounded">
      <Input
        type="text"
        value={fileName}
        onChange={(e) => setFileName(e.target.value)}
        onKeyDown={(e) => {
            if (e.key === 'Enter') handleConfirm();
            if (e.key === 'Escape') onCancel();
        }}
        placeholder="Enter file name..."
        autoFocus
        size="md"
      />
      <div className="flex gap-2 mt-2">
        <TextButton onClick={handleConfirm} variant="success" size="md" className="flex-1">Create</TextButton>
        <TextButton onClick={onCancel} variant="danger" size="md" className="flex-1">Cancel</TextButton>
      </div>
    </div>
  );
}