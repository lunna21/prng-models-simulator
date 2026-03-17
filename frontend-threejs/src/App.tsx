import { useEffect, useState } from 'react';
import { BankScene } from '@/components/scene/BankScene';
import { ControlsPanel } from '@/components/controls/ControlsPanel';
import { ConfigDialog } from '@/components/config/ConfigDialog';
import { Button } from '@/components/ui/button';
import { Toaster } from 'sonner';
import { Sun, Moon } from 'lucide-react';

function useTheme() {
  const [dark, setDark] = useState(() => {
    if (typeof window === 'undefined') return false;
    const stored = localStorage.getItem('theme');
    if (stored) return stored === 'dark';
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  });

  useEffect(() => {
    const root = document.documentElement;
    if (dark) {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    localStorage.setItem('theme', dark ? 'dark' : 'light');
  }, [dark]);

  return [dark, () => setDark((d) => !d)] as const;
}

function App() {
  const [dark, toggleTheme] = useTheme();

  return (
    <div className="relative h-screen w-screen overflow-hidden bg-background">
      {/* 3D Scene - full viewport */}
      <div className="absolute inset-0">
        <BankScene />
      </div>

      {/* Title bar */}
      <div className="absolute top-4 left-1/2 -translate-x-1/2 z-10">
        <div className="flex items-center gap-2 rounded-xl border border-border bg-background/80 px-6 py-2 shadow-lg backdrop-blur-sm">
          <h1 className="text-sm font-bold tracking-tight text-foreground">
            Simulador de Colas Bancarias — PRNG
          </h1>
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7"
            onClick={toggleTheme}
            aria-label={dark ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro'}
          >
            {dark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          </Button>
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
