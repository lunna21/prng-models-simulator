import { SHORTCUTS } from '@/lib/shortcuts';
import type { ShortcutCategory } from '@/lib/shortcuts';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Separator } from '@/components/ui/separator';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';

const CATEGORY_LABELS: Record<ShortcutCategory, string> = {
  simulation: 'Simulación',
  'dialog-nav': 'Navegación del Diálogo',
  'dialog-action': 'Acciones del Diálogo',
};

const CATEGORY_ORDER: ShortcutCategory[] = ['simulation', 'dialog-nav', 'dialog-action'];
const tableColumns = [
  {
    label: 'Atajo',
    tip: 'Combinación de teclas que activa una acción.',
    className: 'w-[260px]',
  },
  {
    label: 'Acción',
    tip: 'Descripción de lo que sucede al ejecutar el atajo.',
  },
];

function formatKey(key: string): string {
  if (key === 'Space') return 'Espacio';
  if (key === 'ArrowRight') return '\u2192';
  if (key === 'ArrowLeft') return '\u2190';
  if (key === 'Escape') return 'Esc';
  if (key === 'Enter') return 'Enter';
  return key.toUpperCase();
}

function formatKeys(keys: string[], requiresCtrl?: boolean): string {
  const prefix = requiresCtrl ? 'Ctrl + ' : '';
  return prefix + keys.map(formatKey).join(' + ');
}

export function ShortcutsTab() {
  const grouped = CATEGORY_ORDER.map((cat) => ({
    category: cat,
    label: CATEGORY_LABELS[cat],
    shortcuts: SHORTCUTS.filter((s) => s.category === cat),
  }));

  return (
    <div className="space-y-6">
      <div className="space-y-1">
        <h3 className="text-sm font-medium">Atajos de teclado</h3>
        <p className="text-xs text-muted-foreground">
          Usa estos atajos para navegar y controlar la simulación más rápido.
        </p>
      </div>

      {grouped.map((group, i) => (
        <div key={group.category} className="space-y-2">
          {i > 0 && <Separator />}
          <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
            {group.label}
          </h4>
          <Table>
            <TableHeader>
              <TableRow>
                {tableColumns.map((col) => (
                  <TableHead key={col.label} className={col.className}>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <span className="inline-flex cursor-help items-center">{col.label}</span>
                      </TooltipTrigger>
                      <TooltipContent side="top" className="max-w-[220px]">
                        <p className="text-xs">{col.tip}</p>
                      </TooltipContent>
                    </Tooltip>
                  </TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {group.shortcuts.map((shortcut) => (
                <TableRow key={shortcut.action}>
                  <TableCell className="font-mono text-xs">
                    {formatKeys(shortcut.keys, shortcut.requiresCtrl)}
                  </TableCell>
                  <TableCell>{shortcut.description}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      ))}
    </div>
  );
}

export default ShortcutsTab;
