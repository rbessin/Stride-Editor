import { FileItem, FolderItem } from '@/types/fileSystem';

/**
 * Recursively reads a directory and all its subdirectories
 * Returns a sorted array of files and folders
 */
export async function readDirectory(
  dirHandle: FileSystemDirectoryHandle
): Promise<(FileItem | FolderItem)[]> {
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
}

/**
 * Read file content, using standard method for small files
 * For larger files (>1MB), use FileReader for better compatibility
 */
export async function readFileInChunks(file: File): Promise<string> {
  if (file.size < 1024 * 1024) {
    return await file.text();
  }
  
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      resolve(e.target?.result as string);
    };
    reader.onerror = reject;
    reader.readAsText(file);
  });
}

/**
 * Check if file is too large and prompt user
 * Returns true if should continue, false if cancelled
 */
export function checkFileSize(file: File, maxSizeMB: number = 10): boolean {
  const fileSizeInMB = file.size / (1024 * 1024);
  
  if (fileSizeInMB > maxSizeMB) {
    return confirm(
      `This file is ${fileSizeInMB.toFixed(2)}MB. Large files may cause performance issues. Continue?`
    );
  }
  
  return true;
}