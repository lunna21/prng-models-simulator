import { useEffect } from 'react';
import { useStore } from '@/store/store';
import { isEditableElement, resolveShortcutAction } from '@/lib/shortcuts';

const TAB_MAP: Record<string, string> = {
  'tab-generator': 'generator',
  'tab-compare': 'compare',
  'tab-simulation': 'simulation',
  'tab-equations': 'equations',
  'tab-shortcuts': 'shortcuts',
};

export function useKeyboardShortcuts() {
  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.repeat || event.altKey || event.metaKey) {
        return;
      }

      const action = resolveShortcutAction({ key: event.key, ctrlKey: event.ctrlKey });
      if (!action) {
        return;
      }

      // Allow Ctrl shortcuts even in editable elements
      if (!event.ctrlKey && isEditableElement(event.target)) {
        return;
      }

      const state = useStore.getState();

      switch (action) {
        // ── Simulation ──
        case 'toggle-play': {
          if (!state.simResult) {
            state.runSim();
          } else {
            state.setPlaying(!state.isPlaying);
          }
          event.preventDefault();
          break;
        }
        case 'step-forward': {
          state.stepForward();
          event.preventDefault();
          break;
        }
        case 'step-back': {
          state.stepBack();
          event.preventDefault();
          break;
        }
        case 'restart': {
          state.jumpToEvent(0);
          state.setPlaying(false);
          event.preventDefault();
          break;
        }
        case 'open-config': {
          state.setConfigOpen(true);
          event.preventDefault();
          break;
        }
        case 'close-config': {
          state.setConfigOpen(false);
          event.preventDefault();
          break;
        }

        // ── Global ──
        case 'open-shortcuts-tab': {
          state.setConfigTab('shortcuts');
          state.setConfigOpen(true);
          event.preventDefault();
          break;
        }

        // ── Dialog navigation ──
        case 'tab-generator':
        case 'tab-compare':
        case 'tab-simulation':
        case 'tab-equations':
        case 'tab-shortcuts': {
          state.setConfigTab(TAB_MAP[action]);
          if (!state.configOpen) {
            state.setConfigOpen(true);
          }
          event.preventDefault();
          break;
        }
        case 'toggle-expand': {
          state.toggleDialogViewMode();
          event.preventDefault();
          break;
        }

        // ── Dialog actions ──
        case 'generate': {
          state.generate();
          event.preventDefault();
          break;
        }
        case 'run-tests': {
          state.runTests();
          event.preventDefault();
          break;
        }
        case 'run-simulation': {
          state.runSim();
          event.preventDefault();
          break;
        }
      }
    };

    window.addEventListener('keydown', onKeyDown);
    return () => {
      window.removeEventListener('keydown', onKeyDown);
    };
  }, []);
}
