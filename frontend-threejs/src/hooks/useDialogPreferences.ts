import { useStore } from '@/store/store';

export function useDialogPreferences() {
  const dialogViewMode = useStore((s) => s.dialogViewMode);
  const toggleDialogViewMode = useStore((s) => s.toggleDialogViewMode);

  const isExpanded = dialogViewMode === 'expanded';
  const contentClassName = isExpanded
    ? 'max-w-[calc(100vw-2rem)] h-[calc(100vh-2rem)]'
    : 'max-w-6xl h-[90vh]';

  return {
    dialogViewMode,
    isExpanded,
    contentClassName,
    toggleDialogViewMode,
  };
}
