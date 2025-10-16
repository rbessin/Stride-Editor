import { FileItem, FolderItem } from "@/types/fileSystem";
export default function useFileSystem() {
    // Recursively reads a directory and all its subdirectories
    // Returns a sorted array of files and folders
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

    // Handle the "Open Folder" button click
    // Opens a directory picker and reads the entire folder structure
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

    return { readDirectory };
}