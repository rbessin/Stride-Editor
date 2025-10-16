// components/sidebar/FileTree.tsx

import { OpenItem, FileItem } from '@/types/fileSystem';
import { FileTreeItem } from './FileTreeItem';

interface FileTreeProps {
  items: OpenItem[];
  activeFileId: string | null;
  loadingFileId: string | null;
  onFileClick: (item: FileItem) => void;
  onFolderToggle: (itemId: string) => void;
  onClose: (id: string) => void;
}

export function FileTree({
  items,
  activeFileId,
  loadingFileId,
  onFileClick,
  onFolderToggle,
  onClose
}: FileTreeProps) {
  return (
    <div className="flex flex-col gap-y-1 mt-2">
      {items.map(item => (
        <FileTreeItem
          key={item.id}
          item={item}
          depth={0}
          isActive={activeFileId === item.id}
          isLoading={loadingFileId === item.id}
          onFileClick={onFileClick}
          onFolderToggle={onFolderToggle}
          onClose={onClose}
        />
      ))}
    </div>
  );
}