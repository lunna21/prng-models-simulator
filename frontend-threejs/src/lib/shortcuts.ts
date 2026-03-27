export type ShortcutAction =
  // Simulation
  | 'toggle-play'
  | 'step-forward'
  | 'step-back'
  | 'restart'
  | 'open-config'
  | 'close-config'
  // Global
  | 'open-shortcuts-tab'
  // Dialog navigation
  | 'tab-generator'
  | 'tab-compare'
  | 'tab-simulation'
  | 'tab-equations'
  | 'tab-shortcuts'
  | 'toggle-expand'
  // Dialog actions
  | 'generate'
  | 'run-tests'
  | 'run-simulation';

export type ShortcutCategory = 'simulation' | 'dialog-nav' | 'dialog-action';

export interface ShortcutDefinition {
  action: ShortcutAction;
  keys: string[];
  description: string;
  category: ShortcutCategory;
  requiresCtrl?: boolean;
}

export const SHORTCUTS: ShortcutDefinition[] = [
  // ── Simulation ──
  {
    action: 'toggle-play',
    keys: ['Space'],
    description: 'Inicia o pausa la simulacion',
    category: 'simulation',
  },
  {
    action: 'step-forward',
    keys: ['ArrowRight'],
    description: 'Avanza un evento',
    category: 'simulation',
  },
  {
    action: 'step-back',
    keys: ['ArrowLeft'],
    description: 'Retrocede un evento',
    category: 'simulation',
  },
  {
    action: 'restart',
    keys: ['R'],
    description: 'Reinicia al primer evento',
    category: 'simulation',
  },
  {
    action: 'open-config',
    keys: ['C'],
    description: 'Abre la configuracion',
    category: 'simulation',
  },
  {
    action: 'close-config',
    keys: ['Escape'],
    description: 'Cierra la configuracion',
    category: 'simulation',
  },

  // ── Global ──
  {
    action: 'open-shortcuts-tab',
    keys: ['?'],
    description: 'Abre la referencia de atajos',
    category: 'dialog-nav',
  },

  // ── Dialog navigation ──
  {
    action: 'tab-generator',
    keys: ['1'],
    description: 'Tab Generador',
    category: 'dialog-nav',
    requiresCtrl: true,
  },
  {
    action: 'tab-compare',
    keys: ['2'],
    description: 'Tab Comparar',
    category: 'dialog-nav',
    requiresCtrl: true,
  },
  {
    action: 'tab-simulation',
    keys: ['3'],
    description: 'Tab Simulacion',
    category: 'dialog-nav',
    requiresCtrl: true,
  },
  {
    action: 'tab-equations',
    keys: ['4'],
    description: 'Tab Ecuaciones',
    category: 'dialog-nav',
    requiresCtrl: true,
  },
  {
    action: 'tab-shortcuts',
    keys: ['5'],
    description: 'Tab Atajos',
    category: 'dialog-nav',
    requiresCtrl: true,
  },
  {
    action: 'toggle-expand',
    keys: ['E'],
    description: 'Expandir/contraer dialogo',
    category: 'dialog-nav',
    requiresCtrl: true,
  },

  // ── Dialog actions ──
  {
    action: 'generate',
    keys: ['G'],
    description: 'Generar numeros pseudoaleatorios',
    category: 'dialog-action',
    requiresCtrl: true,
  },
  {
    action: 'run-tests',
    keys: ['T'],
    description: 'Ejecutar pruebas estadisticas',
    category: 'dialog-action',
    requiresCtrl: true,
  },
  {
    action: 'run-simulation',
    keys: ['Enter'],
    description: 'Ejecutar simulacion',
    category: 'dialog-action',
    requiresCtrl: true,
  },
];

interface KeyEvent {
  key: string;
  ctrlKey: boolean;
}

const KEY_TO_ACTION: Record<string, ShortcutAction> = {
  ' ': 'toggle-play',
  arrowright: 'step-forward',
  arrowleft: 'step-back',
  r: 'restart',
  c: 'open-config',
  escape: 'close-config',
  '?': 'open-shortcuts-tab',
};

const CTRL_KEY_TO_ACTION: Record<string, ShortcutAction> = {
  '1': 'tab-generator',
  '2': 'tab-compare',
  '3': 'tab-simulation',
  '4': 'tab-equations',
  '5': 'tab-shortcuts',
  e: 'toggle-expand',
  g: 'generate',
  t: 'run-tests',
  enter: 'run-simulation',
};

export function resolveShortcutAction(event: KeyEvent): ShortcutAction | null {
  const { key, ctrlKey } = event;

  if (ctrlKey) {
    const normalizedKey = key.toLowerCase();
    return CTRL_KEY_TO_ACTION[normalizedKey] ?? null;
  }

  if (key === ' ') {
    return KEY_TO_ACTION[key];
  }

  const normalizedKey = key.toLowerCase();
  return KEY_TO_ACTION[normalizedKey] ?? null;
}

export function isEditableElement(target: EventTarget | null): boolean {
  if (!(target instanceof Element)) {
    return false;
  }

  if (target.closest('[contenteditable="true"]')) {
    return true;
  }

  return ['INPUT', 'TEXTAREA', 'SELECT'].includes(target.tagName);
}
