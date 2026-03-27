import { useStore } from '@/store/store';
import { useDialogPreferences } from '@/hooks/useDialogPreferences';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Maximize2, Minimize2 } from 'lucide-react';
import { GeneratorTab } from './GeneratorTab';
import { CompareTab } from './CompareTab';
import { SimulationTab } from './SimulationTab';
import { EquationsTab } from './EquationsTab';
import { ShortcutsTab } from './ShortcutsTab';

export function ConfigDialog() {
  const configOpen = useStore((s) => s.configOpen);
  const setConfigOpen = useStore((s) => s.setConfigOpen);
  const configTab = useStore((s) => s.configTab);
  const setConfigTab = useStore((s) => s.setConfigTab);
  const { isExpanded, contentClassName, toggleDialogViewMode } = useDialogPreferences();

  return (
    <Dialog open={configOpen} onOpenChange={setConfigOpen}>
      <DialogContent
        className={`${contentClassName} config-dialog flex flex-col p-0 gap-0`}
      >
        <DialogHeader className="px-6 py-4 border-b border-border shrink-0">
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 -ml-2"
              onClick={toggleDialogViewMode}
              aria-label={isExpanded ? 'Restaurar tamaño del diálogo' : 'Expandir diálogo'}
              title={isExpanded ? 'Restaurar tamaño' : 'Expandir a toda la pantalla'}
            >
              <span className="relative h-4 w-4">
                <Maximize2
                  className={`absolute inset-0 h-4 w-4 transition-all duration-150 ease-out motion-reduce:transition-none ${
                    isExpanded ? 'opacity-0 scale-75 rotate-45' : 'opacity-100 scale-100 rotate-0'
                  }`}
                />
                <Minimize2
                  className={`absolute inset-0 h-4 w-4 transition-all duration-150 ease-out motion-reduce:transition-none ${
                    isExpanded ? 'opacity-100 scale-100 rotate-0' : 'opacity-0 scale-75 -rotate-45'
                  }`}
                />
              </span>
            </Button>
            <DialogTitle className="text-lg">Configuración del Simulador</DialogTitle>
          </div>
        </DialogHeader>

        <Tabs
          value={configTab}
          onValueChange={setConfigTab}
          className="flex-1 flex flex-col overflow-hidden"
        >
          <TabsList className="mx-6 mt-2 shrink-0 w-fit">
            <TabsTrigger value="generator" data-tour="tab-generator">Generador</TabsTrigger>
            <TabsTrigger value="compare" data-tour="tab-compare">Comparar</TabsTrigger>
            <TabsTrigger value="simulation" data-tour="tab-simulation">Simulación</TabsTrigger>
            <TabsTrigger value="equations" data-tour="tab-equations">Ecuaciones</TabsTrigger>
            <TabsTrigger value="shortcuts" data-tour="tab-shortcuts">Atajos</TabsTrigger>
          </TabsList>

          <div className="flex-1 overflow-y-auto px-6 py-4">
            <TabsContent value="generator" className="mt-0">
              <GeneratorTab />
            </TabsContent>
            <TabsContent value="compare" className="mt-0">
              <CompareTab />
            </TabsContent>
            <TabsContent value="simulation" className="mt-0">
              <SimulationTab />
            </TabsContent>
            <TabsContent value="equations" className="mt-0">
              <EquationsTab />
            </TabsContent>
            <TabsContent value="shortcuts" className="mt-0">
              <ShortcutsTab />
            </TabsContent>
          </div>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}

export default ConfigDialog;
