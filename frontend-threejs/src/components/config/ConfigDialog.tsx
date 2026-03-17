import { useStore } from '@/store/store';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { GeneratorTab } from './GeneratorTab';
import { CompareTab } from './CompareTab';
import { SimulationTab } from './SimulationTab';
import { EquationsTab } from './EquationsTab';

export function ConfigDialog() {
  const configOpen = useStore((s) => s.configOpen);
  const setConfigOpen = useStore((s) => s.setConfigOpen);
  const configTab = useStore((s) => s.configTab);
  const setConfigTab = useStore((s) => s.setConfigTab);

  return (
    <Dialog open={configOpen} onOpenChange={setConfigOpen}>
      <DialogContent className="max-w-6xl h-[90vh] flex flex-col p-0 gap-0">
        <DialogHeader className="px-6 py-4 border-b border-border shrink-0">
          <DialogTitle className="text-lg">Configuracion del Simulador</DialogTitle>
        </DialogHeader>

        <Tabs
          value={configTab}
          onValueChange={setConfigTab}
          className="flex-1 flex flex-col overflow-hidden"
        >
          <TabsList className="mx-6 mt-2 shrink-0 w-fit">
            <TabsTrigger value="generator">Generador</TabsTrigger>
            <TabsTrigger value="compare">Comparar</TabsTrigger>
            <TabsTrigger value="simulation">Simulacion</TabsTrigger>
            <TabsTrigger value="equations">Ecuaciones</TabsTrigger>
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
          </div>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}

export default ConfigDialog;
