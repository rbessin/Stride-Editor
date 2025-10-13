import { useState } from 'react';
import type { ReactElement } from 'react';
import { FolderOpenIcon, DocumentTextIcon, DocumentPlusIcon, ArrowDownTrayIcon, XMarkIcon, Cog6ToothIcon, AdjustmentsHorizontalIcon } from '@heroicons/react/24/solid';
import { IconButton, TextButton } from '@/components/ui/Button';
import Header from './Header';
import { ThemeToggle } from '../theme-toggle';

// Define the structure for a file item in the sidebar
interface FileItem {
  id: string;
  name: string;
  type: 'file';
  handle: FileSystemFileHandle;
}

// Define the structure for a folder item in the sidebar
interface FolderItem {
  id: string;
  name: string;
  type: 'folder';
  handle: FileSystemDirectoryHandle;
  children: (FileItem | FolderItem)[]; // Folders can contain files and subfolders
  isExpanded: boolean; // Track if the folder is currently expanded/collapsed
}

// Union type for any item in the sidebar
type OpenItem = FileItem | FolderItem;

// Extend the global Window interface to include File System Access API methods
declare global {
  interface Window {
    showDirectoryPicker(): Promise<FileSystemDirectoryHandle>;
    showOpenFilePicker(): Promise<FileSystemFileHandle[]>;
    showSaveFilePicker(options?: {
      suggestedName?: string;
      types?: Array<{
        description?: string;
        accept: Record<string, string[]>;
      }>;
    }): Promise<FileSystemFileHandle>;
  }
  
  interface FileSystemDirectoryHandle {
    values(): AsyncIterableIterator<FileSystemFileHandle | FileSystemDirectoryHandle>;
  }
}

// Props that the Sidebar component accepts
interface SidebarProps {
  onFileSelect?: (content: string, fileName: string, fileHandle: FileSystemFileHandle | null) => void;
  onLoadingChange?: (isLoading: boolean) => void;
  onSaveRequest?: () => Promise<{ content: string; fileName: string }>;
}

export default function Sidebar({ onFileSelect, onLoadingChange, onSaveRequest }: SidebarProps) {
  // State to track all opened files and folders
  const [openItems, setOpenItems] = useState<OpenItem[]>([]);
  // State to track which file is currently active in the editor
  const [activeFileId, setActiveFileId] = useState<string | null>(null);
  // State to track which file is currently loading
  const [loadingFileId, setLoadingFileId] = useState<string | null>(null);
  // State to track if we're creating a new file
  const [isCreatingFile, setIsCreatingFile] = useState(false);
  const [newFileName, setNewFileName] = useState('');

  /**
   * Recursively reads a directory and all its subdirectories
   * Returns a sorted array of files and folders
   */
  const readDirectory = async (dirHandle: FileSystemDirectoryHandle): Promise<(FileItem | FolderItem)[]> => {
    const items: (FileItem | FolderItem)[] = [];
    
    // Iterate through all entries in the directory
    for await (const entry of dirHandle.values()) {
      if (entry.kind === 'file') {
        // Add file to the items array
        items.push({
          id: `${dirHandle.name}-${entry.name}-${Date.now()}`,
          name: entry.name,
          type: 'file',
          handle: entry as FileSystemFileHandle
        });
      } else if (entry.kind === 'directory') {
        // Recursively read subdirectory and add folder to items array
        const children = await readDirectory(entry as FileSystemDirectoryHandle);
        items.push({
          id: `${dirHandle.name}-${entry.name}-${Date.now()}`,
          name: entry.name,
          type: 'folder',
          handle: entry as FileSystemDirectoryHandle,
          children,
          isExpanded: false // Start with folders collapsed
        });
      }
    }
    
    // Sort items: folders first, then files, both alphabetically
    return items.sort((a, b) => {
      if (a.type === b.type) return a.name.localeCompare(b.name);
      return a.type === 'folder' ? -1 : 1;
    });
  };

  /**
   * Handle the "Open Folder" button click
   * Opens a directory picker and reads the entire folder structure
   */
  const handleOpenFolder = async () => {
    try {
      // Show native folder picker dialog
      const dirHandle = await window.showDirectoryPicker();
      // Read all contents of the selected folder
      const children = await readDirectory(dirHandle);
      const newItem: FolderItem = {
        id: `root-${Date.now()}`,
        name: dirHandle.name,
        type: 'folder',
        handle: dirHandle,
        children,
        isExpanded: true // Open root folder by default
      };
      // Add the folder to the sidebar
      setOpenItems(prev => [...prev, newItem]);
    } catch (err) {
      // User cancelled the picker or an error occurred
      if (err instanceof DOMException && err.name !== 'AbortError') {
        console.error('Error opening folder:', err);
      }
    }
  };

  /**
   * Handle the "Open File" button click
   * Opens a file picker and automatically loads the selected file
   */
  const handleOpenFile = async () => {
    try {
      // Show native file picker dialog
      const [fileHandle] = await window.showOpenFilePicker();
      const newItem: FileItem = {
        id: `file-${Date.now()}`,
        name: fileHandle.name,
        type: 'file',
        handle: fileHandle
      };
      // Add file to sidebar
      setOpenItems(prev => [...prev, newItem]);
      
      // Automatically open the file in the editor
      await handleFileClick(newItem);
    } catch (err) {
      // User cancelled the picker or an error occurred
      if (err instanceof DOMException && err.name !== 'AbortError') {
        console.error('Error opening file:', err);
      }
    }
  };

  /**
   * Handle clicking on a file in the sidebar
   * Reads the file content and passes it to the editor
   */
  const handleFileClick = async (fileItem: FileItem) => {
    try {
      // If it's a new file without a handle, just open it empty
      if (!fileItem.handle) {
        setActiveFileId(fileItem.id);
        if (onFileSelect) {
          onFileSelect('', fileItem.name, null);
        }
        return;
      }

      // Set loading state
      setLoadingFileId(fileItem.id);
      onLoadingChange?.(true);
      
      // Get the file from the file handle
      const file = await fileItem.handle.getFile();
      
      // Check file size and warn user if it's large
      const fileSizeInMB = file.size / (1024 * 1024);
      const MAX_SIZE_MB = 10;
      
      if (fileSizeInMB > MAX_SIZE_MB) {
        const shouldContinue = confirm(
          `This file is ${fileSizeInMB.toFixed(2)}MB. Large files may cause performance issues. Continue?`
        );
        if (!shouldContinue) {
          // User cancelled, clear loading state
          setLoadingFileId(null);
          onLoadingChange?.(false);
          return;
        }
      }
      
      // Read the file content
      const content = await readFileInChunks(file);
      
      // Update active file and clear loading state
      setActiveFileId(fileItem.id);
      setLoadingFileId(null);
      onLoadingChange?.(false);
      
      // Pass file content to parent component (editor)
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
   * Read file content, using standard method for small files
   * For larger files (>1MB), use FileReader for better compatibility
   */
  const readFileInChunks = async (file: File): Promise<string> => {
    // For small files, just read normally
    if (file.size < 1024 * 1024) { // Less than 1MB
      return await file.text();
    }
    
    // For larger files, use FileReader
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        resolve(e.target?.result as string);
      };
      reader.onerror = reject;
      reader.readAsText(file);
    });
  };

  /**
   * Toggle a folder's expanded/collapsed state
   * Recursively searches through the tree to find the folder by ID
   */
  const toggleFolder = (itemId: string) => {
    setOpenItems(prev => {
      const toggleInItems = (items: OpenItem[]): OpenItem[] => {
        return items.map(item => {
          if (item.id === itemId && item.type === 'folder') {
            // Found the folder, toggle its expanded state
            return { ...item, isExpanded: !item.isExpanded };
          }
          if (item.type === 'folder') {
            // Keep searching in subfolders
            return { ...item, children: toggleInItems(item.children) };
          }
          return item;
        });
      };
      return toggleInItems(prev);
    });
  };

  /**
   * Remove an item from the sidebar
   * If it's the active file, clear the active state
   */
  const handleCloseItem = (id: string) => {
    setOpenItems(prev => prev.filter(item => item.id !== id));
    if (activeFileId === id) {
      setActiveFileId(null);
    }
  };

  /**
   * Close all items in the sidebar
   */
  const handleCloseAll = () => {
    setOpenItems([]);
    setActiveFileId(null);
  };

  /**
   * Handle creating a new file
   * Creates an in-memory file that can be saved later
   */
  const handleCreateFile = () => {
    setIsCreatingFile(true);
    setNewFileName('');
  };

  /**
   * Confirm the new file creation
   * Creates a new file item with empty content
   */
  const confirmCreateFile = () => {
    if (!newFileName.trim()) {
      alert('Please enter a file name');
      return;
    }

    // Create a new file item with a temporary handle
    const newFile: FileItem = {
      id: `new-${Date.now()}`,
      name: newFileName,
      type: 'file',
      handle: null as unknown as FileSystemFileHandle // Temporary null handle for new files
    };

    setOpenItems(prev => [...prev, newFile]);
    setIsCreatingFile(false);
    setNewFileName('');

    // Open the new empty file in the editor
    setActiveFileId(newFile.id);
    if (onFileSelect) {
      onFileSelect('', newFile.name, null as unknown as FileSystemFileHandle);
    }
  };

  /**
   * Cancel file creation
   */
  const cancelCreateFile = () => {
    setIsCreatingFile(false);
    setNewFileName('');
  };

  /**
   * Save the current file
   * For new files, prompts for save location
   * For existing files, saves to the existing location
   */
  const handleSave = async () => {
    if (!onSaveRequest) return;

    try {
      // Get current content and filename from the editor
      const { content, fileName } = await onSaveRequest();
      
      // Find the active file item
      const activeFile = findFileById(openItems, activeFileId);
      
      if (!activeFile || activeFile.type !== 'file') {
        alert('No file is currently open');
        return;
      }

      let fileHandle = activeFile.handle;

      // If it's a new file (no handle), prompt for save location
      if (!fileHandle) {
        fileHandle = await window.showSaveFilePicker({
          suggestedName: fileName || 'untitled.txt'
        });

        // Update the file item with the new handle and name
        setOpenItems(prev => updateFileHandle(prev, activeFileId, fileHandle));
      }

      // Write content to file
      const writable = await fileHandle.createWritable();
      await writable.write(content);
      await writable.close();

      console.log('File saved successfully');
    } catch (err) {
      if (err instanceof DOMException && err.name !== 'AbortError') {
        console.error('Error saving file:', err);
        alert('Failed to save file');
      }
    }
  };

  /**
   * Helper function to find a file by ID in the tree
   */
  const findFileById = (items: OpenItem[], id: string | null): OpenItem | null => {
    if (!id) return null;
    
    for (const item of items) {
      if (item.id === id) return item;
      if (item.type === 'folder') {
        const found = findFileById(item.children, id);
        if (found) return found;
      }
    }
    return null;
  };

  /**
   * Helper function to update a file's handle after saving
   */
  const updateFileHandle = (items: OpenItem[], id: string | null, handle: FileSystemFileHandle): OpenItem[] => {
    if (!id) return items;
    
    return items.map(item => {
      if (item.id === id && item.type === 'file') {
        return { ...item, handle, name: handle.name };
      }
      if (item.type === 'folder') {
        return { ...item, children: updateFileHandle(item.children, id, handle) };
      }
      return item;
    });
  };

  /**
   * Recursively render an item (file or folder) in the sidebar
   * @param item - The file or folder to render
   * @param depth - The nesting depth (used for indentation)
   */
  const renderItem = (item: OpenItem, depth: number = 0): ReactElement => {
    const paddingLeft = depth * 16; // 16px indent per level

    if (item.type === 'file') {
      const isActive = activeFileId === item.id;
      const isLoading = loadingFileId === item.id;
      return (
        <div
          key={item.id}
          className={`flex items-center justify-between px-2 py-1 rounded text-sm cursor-pointer ${
            isActive 
              ? 'bg-blue-200 dark:bg-blue-900' // Highlight active file
              : 'bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700'
          }`}
          style={{ paddingLeft: `${paddingLeft + 8}px` }}
          onClick={() => !isLoading && handleFileClick(item)} // Prevent clicking while loading
        >
          <div className="flex items-center gap-x-2 overflow-hidden">
            <span className="text-xs">{isLoading ? '⏳' : '📄'}</span>
            <span className="truncate">{item.name}</span>
          </div>
          {/* Only show close button for root-level items */}
          {depth === 0 && (
            <IconButton icon={XMarkIcon} onClick={(e) => {e?.stopPropagation(); handleCloseItem(item.id);}} variant="danger" size="sm" className="ml-2"/>
          )}
        </div>
      );
    }

    // Render folder
    return (
      <div key={item.id}>
        <div
          className="flex items-center justify-between px-2 py-1 bg-gray-100 dark:bg-gray-800 rounded text-sm hover:bg-gray-200 dark:hover:bg-gray-700 cursor-pointer"
          style={{ paddingLeft: `${paddingLeft + 8}px` }}
          onClick={() => toggleFolder(item.id)}
        >
          <div className="flex items-center gap-x-2 overflow-hidden">
            {/* Show open or closed folder icon based on expanded state */}
            <span className="text-xs">{item.isExpanded ? '📂' : '📁'}</span>
            <span className="truncate">{item.name}</span>
          </div>
          {/* Only show close button for root-level items */}
          {depth === 0 && (
            <IconButton icon={XMarkIcon} onClick={(e) => {e?.stopPropagation(); handleCloseItem(item.id);}} variant="danger" size="sm" className="ml-2"/>
          )}
        </div>
        {/* Render children if folder is expanded */}
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
      <Header />
      {/* Action buttons */}
      <div className="flex flex-wrap gap-2 p-1 rounded-md bg-secondary text-sm">
        <IconButton icon={FolderOpenIcon} onClick={handleOpenFolder} />
        <IconButton icon={DocumentTextIcon} onClick={handleOpenFile} />
        <IconButton icon={DocumentPlusIcon} onClick={handleCreateFile} />
        <IconButton icon={ArrowDownTrayIcon} onClick={handleSave} variant="info" />
        <IconButton icon={XMarkIcon} onClick={handleCloseAll} variant="danger" />
        <IconButton icon={Cog6ToothIcon} onClick={() => {}} />
        <ThemeToggle />
      </div>

      {/* New file input dialog */}
      {isCreatingFile && (
        <div className="mt-2 p-2 bg-gray-100 dark:bg-gray-800 rounded">
          <input
            type="text"
            value={newFileName}
            onChange={(e) => setNewFileName(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') confirmCreateFile();
              if (e.key === 'Escape') cancelCreateFile();
            }}
            placeholder="Enter file name..."
            className="w-full px-2 py-1 text-sm border rounded dark:bg-gray-700 dark:border-gray-600"
            autoFocus
          />
          <div className="flex gap-2 mt-2">
            <TextButton onClick={confirmCreateFile} variant="primary" size="md" className="flex-1">Create</TextButton>
            <TextButton onClick={cancelCreateFile} variant="default" size="md" className="flex-1">Cancel</TextButton>
          </div>
        </div>
      )}

      {/* File/folder tree */}
      <div className="flex flex-col gap-y-1 mt-2">
        {openItems.map(item => renderItem(item))}
      </div>
    </div>
  );
}