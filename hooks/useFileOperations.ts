// hooks/useFileOperations.ts

import { useState } from 'react';
import { FileItem, FolderItem } from '@/types/fileSystem';
import { readDirectory, readFileInChunks, checkFileSize } from '@/lib/fileSystemUtils';

interface UseFileOperationsProps {
  onFileSelect?: (content: string, fileName: string, fileHandle: FileSystemFileHandle | null) => void;
  onLoadingChange?: (isLoading: boolean) => void;
}

export function useFileOperations({ onFileSelect, onLoadingChange }: UseFileOperationsProps) {
  const [loadingFileId, setLoadingFileId] = useState<string | null>(null);

  /**
   * Open a folder using the native picker
   */
  const openFolder = async (): Promise<FolderItem | null> => {
    try {
      const dirHandle = await window.showDirectoryPicker();
      const children = await readDirectory(dirHandle);
      
      return {
        id: `root-${Date.now()}`,
        name: dirHandle.name,
        type: 'folder',
        handle: dirHandle,
        children,
        isExpanded: true
      };
    } catch (err) {
      if (err instanceof DOMException && err.name !== 'AbortError') {
        console.error('Error opening folder:', err);
      }
      return null;
    }
  };

  /**
   * Open a single file using the native picker
   */
  const openFile = async (): Promise<FileItem | null> => {
    try {
      const [fileHandle] = await window.showOpenFilePicker();
      
      return {
        id: `file-${Date.now()}`,
        name: fileHandle.name,
        type: 'file',
        handle: fileHandle
      };
    } catch (err) {
      if (err instanceof DOMException && err.name !== 'AbortError') {
        console.error('Error opening file:', err);
      }
      return null;
    }
  };

  /**
   * Read a file's content and notify parent
   */
  const readFile = async (fileItem: FileItem): Promise<void> => {
    try {
      // If it's a new file without a handle, just open it empty
      if (!fileItem.handle) {
        if (onFileSelect) {
          onFileSelect('', fileItem.name, null);
        }
        return;
      }

      setLoadingFileId(fileItem.id);
      onLoadingChange?.(true);
      
      const file = await fileItem.handle.getFile();
      
      // Check file size and warn if too large
      if (!checkFileSize(file)) {
        setLoadingFileId(null);
        onLoadingChange?.(false);
        return;
      }
      
      const content = await readFileInChunks(file);
      
      setLoadingFileId(null);
      onLoadingChange?.(false);
      
      if (onFileSelect) {
        onFileSelect(content, fileItem.name, fileItem.handle);
      }
    } catch (err) {
      console.error('Error reading file:', err);
      setLoadingFileId(null);
      onLoadingChange?.(false);
    }
  };

  /**
   * Save content to a file
   */
  const saveFile = async (
    fileHandle: FileSystemFileHandle | null,
    content: string,
    fileName: string
  ): Promise<FileSystemFileHandle | null> => {
    try {
      let handle = fileHandle;

      // If new file, prompt for save location
      if (!handle) {
        handle = await window.showSaveFilePicker({
          suggestedName: fileName || 'untitled.txt'
        });
      }

      const writable = await handle.createWritable();
      await writable.write(content);
      await writable.close();

      console.log('File saved successfully');
      return handle;
    } catch (err) {
      if (err instanceof DOMException && err.name !== 'AbortError') {
        console.error('Error saving file:', err);
        alert('Failed to save file');
      }
      return null;
    }
  };

  return {
    loadingFileId,
    openFolder,
    openFile,
    readFile,
    saveFile
  };
}