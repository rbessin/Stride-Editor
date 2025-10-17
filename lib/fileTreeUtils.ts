import { OpenItem } from '@/types/fileSystem';

/**
 * Find a file or folder by ID in the tree
 */
export function findItemById(
  items: OpenItem[],
  id: string | null
): OpenItem | null {
  if (!id) return null;
  
  for (const item of items) {
    if (item.id === id) return item;
    if (item.type === 'folder') {
      const found = findItemById(item.children, id);
      if (found) return found;
    }
  }
  return null;
}

/**
 * Update a file's handle after saving
 */
export function updateFileHandle(
  items: OpenItem[],
  id: string | null,
  handle: FileSystemFileHandle
): OpenItem[] {
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
}

/**
 * Toggle a folder's expanded state
 */
export function toggleFolderExpansion(
  items: OpenItem[],
  itemId: string
): OpenItem[] {
  return items.map(item => {
    if (item.id === itemId && item.type === 'folder') {
      return { ...item, isExpanded: !item.isExpanded };
    }
    if (item.type === 'folder') {
      return { ...item, children: toggleFolderExpansion(item.children, itemId) };
    }
    return item;
  });
}