import { BankScene } from '@/components/scene/BankScene';
import { ControlsPanel } from '@/components/controls/ControlsPanel';
import { ConfigDialog } from '@/components/config/ConfigDialog';
import { Toaster } from 'sonner';

function App() {
  return (
    <div className="relative h-screen w-screen overflow-hidden bg-background">
      {/* 3D Scene - full viewport */}
      <div className="absolute inset-0">
        <BankScene />
      </div>

      {/* Title bar */}
      <div className="absolute top-4 left-1/2 -translate-x-1/2 z-10">
        <div className="rounded-xl border border-border bg-background/80 px-6 py-2 shadow-lg backdrop-blur-sm">
          <h1 className="text-sm font-bold tracking-tight text-foreground">
            Simulador de Colas Bancarias — PRNG
          </h1>
        </div>
      </div>

      {/* Controls Panel - bottom left */}
      <ControlsPanel />

      {/* Configuration Dialog */}
      <ConfigDialog />

      {/* Toast notifications */}
      <Toaster position="top-right" />
    </div>
  );
}

export default App;
