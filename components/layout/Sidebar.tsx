import { useState } from 'react';
import { FileItem } from '@/types/fileSystem';
import { useFileTree } from '@/hooks/useFileTree';
import { useFileOperations } from '@/hooks/useFileOperations';
import Header from './Header';
import { SidebarActions } from '@/components/sidebar/SidebarActions';
import { FileTree } from '@/components/sidebar/FileTree';
import { NewFileDialog } from '@/components/sidebar/NewFileDialog';

// Interface for the sidebar properties
interface SidebarProps {
  onFileSelect?: (content: string, fileName: string, fileHandle: FileSystemFileHandle | null) => void;
  onLoadingChange?: (isLoading: boolean) => void;
  onSaveRequest?: () => Promise<{ content: string; fileName: string }>;
  width?: number;
}

export default function Sidebar({ onFileSelect, onLoadingChange, onSaveRequest, width = 250 }: SidebarProps) {
  const fileTree = useFileTree();
  const fileOps = useFileOperations({ onFileSelect, onLoadingChange });
  const [isCreatingFile, setIsCreatingFile] = useState(false);
  // Handler for opening a folder and adding it to the file tree
  const handleOpenFolder = async () => {
    const folder = await fileOps.openFolder();
    if (folder) {fileTree.addItem(folder);}
  };
  // Handler for opening a file and adding it to the file tree
  const handleOpenFile = async () => {
    const file = await fileOps.openFile();
    if (file) {fileTree.addItem(file); await handleFileClick(file);}
  };
  // Handler for closing a file and removing it from the file tree
  const handleCloseFile = (id: string) => {
    fileTree.removeItem(id);
    if (fileTree.activeFileId === id && onFileSelect) {onFileSelect('', '', null);}
  };
  // Handler for file clicks, setting the file as active
  const handleFileClick = async (fileItem: FileItem) => {
    fileTree.setActive(fileItem.id);
    await fileOps.readFile(fileItem);
  };
  // Handler for creating a file
  const handleCreateFile = () => {setIsCreatingFile(true);};
  // Handler for confirming file creation
  const handleConfirmCreate = (fileName: string) => {
    const newFile: FileItem = {
      id: `new-${Date.now()}`,
      name: fileName,
      type: 'file',
      handle: null
    };

    fileTree.addItem(newFile);
    fileTree.setActive(newFile.id);
    setIsCreatingFile(false);

    if (onFileSelect) {onFileSelect('', newFile.name, null);}
  };
  // Handler for file saving
  const handleSave = async () => {
    if (!onSaveRequest) return;

    try {
      const { content, fileName } = await onSaveRequest();
      const activeFile = fileTree.findItem(fileTree.activeFileId);
      
      if (!activeFile || activeFile.type !== 'file') {
        alert('No file is currently open'); return;
      }

      const newHandle = await fileOps.saveFile(activeFile.handle, content, fileName);
      
      if (newHandle && !activeFile.handle) {
        fileTree.updateHandle(fileTree.activeFileId, newHandle);
      }
    } catch (err) {
      console.error('Error in save handler:', err);
    }
  };

  return (
    <div className="flex flex-col w-1/6 p-1 bg-tertiary" style={{ width: `${width}px` }}>
      <Header />
      
      <SidebarActions
        onOpenFolder={handleOpenFolder}
        onOpenFile={handleOpenFile}
        onCreateFile={handleCreateFile}
        onSave={handleSave}
        onCloseAll={fileTree.clearAll}
        onSettings={() => {}}
      />

      {isCreatingFile && (
        <NewFileDialog
          onConfirm={handleConfirmCreate}
          onCancel={() => setIsCreatingFile(false)}
        />
      )}

      <FileTree
        items={fileTree.openItems}
        activeFileId={fileTree.activeFileId}
        loadingFileId={fileOps.loadingFileId}
        onFileClick={handleFileClick}
        onFolderToggle={fileTree.toggleFolder}
        onClose={handleCloseFile}
      />
    </div>
  );
}