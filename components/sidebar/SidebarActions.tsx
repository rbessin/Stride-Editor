// components/sidebar/SidebarActions.tsx

import {
  FolderOpenIcon,
  DocumentTextIcon,
  DocumentPlusIcon,
  ArrowDownTrayIcon,
  XMarkIcon,
  Cog6ToothIcon
} from '@heroicons/react/24/solid';
import { IconButton } from '@/components/ui/Button';
import { ThemeToggle } from '@/components/theme/theme-toggle';

interface SidebarActionsProps {
  onOpenFolder: () => void;
  onOpenFile: () => void;
  onCreateFile: () => void;
  onSave: () => void;
  onCloseAll: () => void;
  onSettings: () => void;
}

export function SidebarActions({
  onOpenFolder,
  onOpenFile,
  onCreateFile,
  onSave,
  onCloseAll,
  onSettings
}: SidebarActionsProps) {
  return (
    <div className="flex flex-wrap gap-2 p-1 rounded-md bg-secondary text-sm">
      <IconButton icon={FolderOpenIcon} onClick={onOpenFolder} />
      <IconButton icon={DocumentTextIcon} onClick={onOpenFile} />
      <IconButton icon={DocumentPlusIcon} onClick={onCreateFile} />
      <IconButton icon={ArrowDownTrayIcon} onClick={onSave} variant="info" />
      <IconButton icon={XMarkIcon} onClick={onCloseAll} variant="danger" />
      <IconButton icon={Cog6ToothIcon} onClick={onSettings} />
      <ThemeToggle />
    </div>
  );
}