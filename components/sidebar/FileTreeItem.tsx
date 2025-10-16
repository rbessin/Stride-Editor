// components/sidebar/FileTreeItem.tsx

import type { ReactElement } from 'react';
import { XMarkIcon } from '@heroicons/react/24/solid';
import { IconButton } from '@/components/ui/Button';
import { OpenItem, FileItem } from '@/types/fileSystem';

interface FileTreeItemProps {
  item: OpenItem;
  depth: number;
  isActive: boolean;
  isLoading: boolean;
  onFileClick: (item: FileItem) => void;
  onFolderToggle: (itemId: string) => void;
  onClose: (id: string) => void;
}

export function FileTreeItem({
  item,
  depth,
  isActive,
  isLoading,
  onFileClick,
  onFolderToggle,
  onClose
}: FileTreeItemProps): ReactElement {
  const paddingLeft = depth * 16 + 8;

  if (item.type === 'file') {
    return (
      <div
        className={`flex items-center justify-between px-2 py-1 rounded text-sm cursor-pointer ${
          isActive 
            ? 'bg-blue-200 dark:bg-blue-900'
            : 'bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700'
        }`}
        style={{ paddingLeft: `${paddingLeft}px` }}
        onClick={() => !isLoading && onFileClick(item)}
      >
        <div className="flex items-center gap-x-2 overflow-hidden">
          <span className="text-xs">{isLoading ? '⏳' : '📄'}</span>
          <span className="truncate">{item.name}</span>
        </div>
        {depth === 0 && (
          <IconButton
            icon={XMarkIcon}
            onClick={(e) => {
              e?.stopPropagation();
              onClose(item.id);
            }}
            variant="danger"
            size="sm"
            className="ml-2"
          />
        )}
      </div>
    );
  }

  return (
    <div>
      <div
        className="flex items-center justify-between px-2 py-1 bg-gray-100 dark:bg-gray-800 rounded text-sm hover:bg-gray-200 dark:hover:bg-gray-700 cursor-pointer"
        style={{ paddingLeft: `${paddingLeft}px` }}
        onClick={() => onFolderToggle(item.id)}
      >
        <div className="flex items-center gap-x-2 overflow-hidden">
          <span className="text-xs">{item.isExpanded ? '📂' : '📁'}</span>
          <span className="truncate">{item.name}</span>
        </div>
        {depth === 0 && (
          <IconButton
            icon={XMarkIcon}
            onClick={(e) => {
              e?.stopPropagation();
              onClose(item.id);
            }}
            variant="danger"
            size="sm"
            className="ml-2"
          />
        )}
      </div>
      {item.isExpanded && (
        <div className="flex flex-col gap-y-1 mt-1">
          {item.children.map(child => (
            <FileTreeItem
              key={child.id}
              item={child}
              depth={depth + 1}
              isActive={false}
              isLoading={false}
              onFileClick={onFileClick}
              onFolderToggle={onFolderToggle}
              onClose={onClose}
            />
          ))}
        </div>
      )}
    </div>
  );
}