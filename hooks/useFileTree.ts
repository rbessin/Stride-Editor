import { useState } from 'react';
import { OpenItem } from '@/types/fileSystem';
import { findItemById, updateFileHandle, toggleFolderExpansion } from '@/lib/fileTreeUtils';

export function useFileTree() {
  const [openItems, setOpenItems] = useState<OpenItem[]>([]);
  const [activeFileId, setActiveFileId] = useState<string | null>(null);

  const addItem = (item: OpenItem) => {
    setOpenItems(prev => [...prev, item]);
  };

  const removeItem = (id: string) => {
    setOpenItems(prev => prev.filter(item => item.id !== id));
    if (activeFileId === id) {
      setActiveFileId(null);
    }
  };

  const clearAll = () => {
    setOpenItems([]);
    setActiveFileId(null);
  };

  const toggleFolder = (itemId: string) => {
    setOpenItems(prev => toggleFolderExpansion(prev, itemId));
  };

  const setActive = (id: string) => {
    setActiveFileId(id);
  };

  const updateHandle = (id: string | null, handle: FileSystemFileHandle) => {
    setOpenItems(prev => updateFileHandle(prev, id, handle));
  };

  const findItem = (id: string | null): OpenItem | null => {
    return findItemById(openItems, id);
  };

  return {
    openItems,
    activeFileId,
    addItem,
    removeItem,
    clearAll,
    toggleFolder,
    setActive,
    updateHandle,
    findItem
  };
}