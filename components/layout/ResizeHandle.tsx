'use client';

import { useState, useEffect } from 'react';

// Interface for the resize handle properties
interface ResizeHandleProps {
  onResize: (width: number) => void;
  minWidth?: number;
  maxWidth?: number;
}

export function ResizeHandle({ onResize, minWidth = 150, maxWidth = 600 }: ResizeHandleProps) {
  const [isResizing, setIsResizing] = useState(false);

  useEffect(() => {
    // Handle house movement when mouse down
    const handleMouseMove = (e: MouseEvent) => {
      if (!isResizing) return;
      
      const newWidth = Math.max(minWidth, Math.min(maxWidth, e.clientX));
      onResize(newWidth);
    };
    // Handle mouse up
    const handleMouseUp = () => {setIsResizing(false);};
    // Handle mouse movement when mouse is down
    if (isResizing) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      document.body.style.cursor = 'col-resize';
      document.body.style.userSelect = 'none';
    }
    // Stops handling mouse movement when mouse is up
    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
    };
  }, [isResizing, minWidth, maxWidth, onResize]);

  return (
    <div
      onMouseDown={() => setIsResizing(true)}
      className="w-2 border-x-2 border-tertiary bg-secondary hover:bg-blue-500 cursor-col-resize transition-colors flex-shrink-0"
    />
  );
}