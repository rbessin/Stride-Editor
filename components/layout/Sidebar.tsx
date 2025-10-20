import { useState } from 'react';
import { FileItem } from '@/types/fileSystem';
import { useFileTree } from '@/hooks/useFileTree';
import { useFileOperations } from '@/hooks/useFileOperations';
import Header from './Header';
import { SidebarActions } from '@/components/sidebar/SidebarActions';
import { FileTree } from '@/components/sidebar/FileTree';
import { NewFileDialog } from '@/components/sidebar/NewFileDialog';

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

  const handleOpenFolder = async () => {
    const folder = await fileOps.openFolder();
    if (folder) {
      fileTree.addItem(folder);
    }
  };

  const handleOpenFile = async () => {
    const file = await fileOps.openFile();
    if (file) {
      fileTree.addItem(file);
      await handleFileClick(file);
    }
  };

  const handleCloseFile = (id: string) => {
    fileTree.removeItem(id);
    if (fileTree.activeFileId === id && onFileSelect) {onFileSelect('', '', null);}
  };

  const handleFileClick = async (fileItem: FileItem) => {
    fileTree.setActive(fileItem.id);
    await fileOps.readFile(fileItem);
  };

  const handleCreateFile = () => {
    setIsCreatingFile(true);
  };

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

    if (onFileSelect) {
      onFileSelect('', newFile.name, null);
    }
  };

  const handleSave = async () => {
    if (!onSaveRequest) return;

    try {
      const { content, fileName } = await onSaveRequest();
      const activeFile = fileTree.findItem(fileTree.activeFileId);
      
      if (!activeFile || activeFile.type !== 'file') {
        alert('No file is currently open');
        return;
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
    <div className="flex flex-col w-1/6 p-1 bg-white dark:bg-tertiary" style={{ width: `${width}px` }}>
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