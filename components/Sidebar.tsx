import { useState } from 'react';
import type { ReactElement } from 'react';

// Declare file types : FileItem, FolderItem, OpenItem
interface FileItem {
  id: string;
  name: string;
  type: 'file';
  handle: FileSystemFileHandle;
}

interface FolderItem {
  id: string;
  name: string;
  type: 'folder';
  handle: FileSystemDirectoryHandle;
  children: (FileItem | FolderItem)[];
  isExpanded: boolean;
}

type OpenItem = FileItem | FolderItem;

declare global {
  interface Window {
    showDirectoryPicker(): Promise<FileSystemDirectoryHandle>;
    showOpenFilePicker(): Promise<FileSystemFileHandle[]>;
  }
  
  interface FileSystemDirectoryHandle {
    values(): AsyncIterableIterator<FileSystemFileHandle | FileSystemDirectoryHandle>;
  }
}

interface SidebarProps {
  onFileSelect?: (content: string, fileName: string, fileHandle: FileSystemFileHandle) => void;
  onLoadingChange?: (isLoading: boolean) => void;
}

export default function Sidebar({ onFileSelect, onLoadingChange }: SidebarProps) {
  const [openItems, setOpenItems] = useState<OpenItem[]>([]);
  const [activeFileId, setActiveFileId] = useState<string | null>(null);
  const [loadingFileId, setLoadingFileId] = useState<string | null>(null);

  const readDirectory = async (dirHandle: FileSystemDirectoryHandle): Promise<(FileItem | FolderItem)[]> => {
    const items: (FileItem | FolderItem)[] = [];
    
    for await (const entry of dirHandle.values()) {
      if (entry.kind === 'file') {
        items.push({
          id: `${dirHandle.name}-${entry.name}-${Date.now()}`,
          name: entry.name,
          type: 'file',
          handle: entry as FileSystemFileHandle
        });
      } else if (entry.kind === 'directory') {
        const children = await readDirectory(entry as FileSystemDirectoryHandle);
        items.push({
          id: `${dirHandle.name}-${entry.name}-${Date.now()}`,
          name: entry.name,
          type: 'folder',
          handle: entry as FileSystemDirectoryHandle,
          children,
          isExpanded: false
        });
      }
    }
    
    return items.sort((a, b) => {
      if (a.type === b.type) return a.name.localeCompare(b.name);
      return a.type === 'folder' ? -1 : 1;
    });
  };

  const handleOpenFolder = async () => {
    try {
      const dirHandle = await window.showDirectoryPicker();
      const children = await readDirectory(dirHandle);
      const newItem: FolderItem = {
        id: `root-${Date.now()}`,
        name: dirHandle.name,
        type: 'folder',
        handle: dirHandle,
        children,
        isExpanded: true
      };
      setOpenItems(prev => [...prev, newItem]);
    } catch (err) {
      if (err instanceof DOMException && err.name !== 'AbortError') {
        console.error('Error opening folder:', err);
      }
    }
  };

  const handleOpenFile = async () => {
    try {
      const [fileHandle] = await window.showOpenFilePicker();
      const newItem: FileItem = {
        id: `file-${Date.now()}`,
        name: fileHandle.name,
        type: 'file',
        handle: fileHandle
      };
      setOpenItems(prev => [...prev, newItem]);
      
      // Automatically open the file in the editor
      await handleFileClick(newItem);
    } catch (err) {
      if (err instanceof DOMException && err.name !== 'AbortError') {
        console.error('Error opening file:', err);
      }
    }
  };

  const handleFileClick = async (fileItem: FileItem) => {
    try {
      setLoadingFileId(fileItem.id);
      onLoadingChange?.(true);
      
      const file = await fileItem.handle.getFile();
      
      // Check file size (in bytes)
      const fileSizeInMB = file.size / (1024 * 1024);
      const MAX_SIZE_MB = 10;
      
      if (fileSizeInMB > MAX_SIZE_MB) {
        const shouldContinue = confirm(
          `This file is ${fileSizeInMB.toFixed(2)}MB. Large files may cause performance issues. Continue?`
        );
        if (!shouldContinue) {
          setLoadingFileId(null);
          onLoadingChange?.(false);
          return;
        }
      }
      
      // Read file in chunks for better performance
      const content = await readFileInChunks(file);
      
      setActiveFileId(fileItem.id);
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

  const readFileInChunks = async (file: File): Promise<string> => {
    // For small files, just read normally
    if (file.size < 1024 * 1024) { // Less than 1MB
      return await file.text();
    }
    
    // For larger files, use FileReader with chunking
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        resolve(e.target?.result as string);
      };
      reader.onerror = reject;
      reader.readAsText(file);
    });
  };

  const toggleFolder = (itemId: string) => {
    setOpenItems(prev => {
      const toggleInItems = (items: OpenItem[]): OpenItem[] => {
        return items.map(item => {
          if (item.id === itemId && item.type === 'folder') {
            return { ...item, isExpanded: !item.isExpanded };
          }
          if (item.type === 'folder') {
            return { ...item, children: toggleInItems(item.children) };
          }
          return item;
        });
      };
      return toggleInItems(prev);
    });
  };

  const handleCloseItem = (id: string) => {
    setOpenItems(prev => prev.filter(item => item.id !== id));
    if (activeFileId === id) {
      setActiveFileId(null);
    }
  };

  const handleCloseAll = () => {
    setOpenItems([]);
    setActiveFileId(null);
  };

  const renderItem = (item: OpenItem, depth: number = 0): ReactElement => {
    const paddingLeft = depth * 16;

    if (item.type === 'file') {
      const isActive = activeFileId === item.id;
      const isLoading = loadingFileId === item.id;
      return (
        <div
          key={item.id}
          className={`flex items-center justify-between px-2 py-1 rounded text-sm cursor-pointer ${
            isActive 
              ? 'bg-blue-200 dark:bg-blue-900' 
              : 'bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700'
          }`}
          style={{ paddingLeft: `${paddingLeft + 8}px` }}
          onClick={() => !isLoading && handleFileClick(item)}
        >
          <div className="flex items-center gap-x-2 overflow-hidden">
            <span className="text-xs">{isLoading ? '⏳' : '📄'}</span>
            <span className="truncate">{item.name}</span>
          </div>
          {depth === 0 && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleCloseItem(item.id);
              }}
              className="ml-2 text-gray-500 hover:text-red-600 dark:hover:text-red-400 text-xs"
            >
              ✕
            </button>
          )}
        </div>
      );
    }

    return (
      <div key={item.id}>
        <div
          className="flex items-center justify-between px-2 py-1 bg-gray-100 dark:bg-gray-800 rounded text-sm hover:bg-gray-200 dark:hover:bg-gray-700 cursor-pointer"
          style={{ paddingLeft: `${paddingLeft + 8}px` }}
          onClick={() => toggleFolder(item.id)}
        >
          <div className="flex items-center gap-x-2 overflow-hidden">
            <span className="text-xs">{item.isExpanded ? '📂' : '📁'}</span>
            <span className="truncate">{item.name}</span>
          </div>
          {depth === 0 && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleCloseItem(item.id);
              }}
              className="ml-2 text-gray-500 hover:text-red-600 dark:hover:text-red-400 text-xs"
            >
              ✕
            </button>
          )}
        </div>
        {item.isExpanded && (
          <div className="flex flex-col gap-y-1 mt-1">
            {item.children.map(child => renderItem(child, depth + 1))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="flex flex-col w-1/6 p-1 bg-white dark:bg-tertiary border-r">
      <div className="flex gap-x-2 p-1 rounded-md bg-secondary text-sm">
        <button
          onClick={handleOpenFolder}
          className="px-1 py-0.5 bg-gray-200 hover:bg-gray-800 active:ring-1 dark:bg-gray-700 rounded"
        >
          Open Folder
        </button>
        <button
          onClick={handleOpenFile}
          className="px-1 py-0.5 bg-gray-200 hover:bg-gray-800 active:ring-1 dark:bg-gray-700 rounded"
        >
          Open File
        </button>
        <button
          onClick={handleCloseAll}
          className="px-1 py-0.5 bg-gray-200 hover:bg-gray-800 active:ring-1 dark:bg-gray-700 rounded"
        >
          Close All
        </button>
      </div>

      <div className="flex flex-col gap-y-1 mt-2">
        {openItems.map(item => renderItem(item))}
      </div>
    </div>
  );
}