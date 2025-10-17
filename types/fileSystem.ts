export interface FileItem {
  id: string;
  name: string;
  type: 'file';
  handle: FileSystemFileHandle | null;
}

export interface FolderItem {
  id: string;
  name: string;
  type: 'folder';
  handle: FileSystemDirectoryHandle;
  children: (FileItem | FolderItem)[];
  isExpanded: boolean;
}

export type OpenItem = FileItem | FolderItem;

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