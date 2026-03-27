import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { toast } from 'sonner';
import type { GeneratorType, GeneratorResult } from '@/lib/generators/types';
import type { TestResult } from '@/lib/tests/types';
import type {
  SimConfig,
  SimulationResult,
  SimulationSnapshot,
  DistributionMode,
} from '@/lib/simulation/types';
import { lcg, mcg, middleSquare } from '@/lib/generators';
import { chiSquareTest, ksTest, pokerTest } from '@/lib/tests';
import { runSimulation, getDefaultArrivalTable, getDefaultServiceTable } from '@/lib/simulation';

// ── Generator Params ───────────────────────────────────
interface LCGConfig {
  seed: number;
  a: number;
  c: number;
  m: number;
  count: number;
}

interface MCGConfig {
  seed: number;
  a: number;
  m: number;
  count: number;
}

interface MSConfig {
  seed: number;
  iterations: number;
  d: number;
}

// ── Store State ────────────────────────────────────────
interface AppState {
  // Generator
  generatorType: GeneratorType;
  lcgConfig: LCGConfig;
  mcgConfig: MCGConfig;
  msConfig: MSConfig;
  generatorResult: GeneratorResult | null;
  generatorError: string | null;

  // Tests
  chiSquareResult: TestResult | null;
  ksResult: TestResult | null;
  pokerResult: TestResult | null;
  testError: string | null;

  // Simulation
  simConfig: SimConfig;
  simResult: SimulationResult | null;
  simError: string | null;
  currentEventIndex: number;
  isPlaying: boolean;
  playbackSpeed: number; // ms between steps

  // UI
  configOpen: boolean;
  configTab: string;
  dialogViewMode: 'normal' | 'expanded';

  // Actions
  setGeneratorType: (type: GeneratorType) => void;
  setLCGConfig: (config: Partial<LCGConfig>) => void;
  setMCGConfig: (config: Partial<MCGConfig>) => void;
  setMSConfig: (config: Partial<MSConfig>) => void;
  generate: () => void;

  runTests: () => void;

  setSimConfig: (config: Partial<SimConfig>) => void;
  runSim: () => void;
  stepForward: () => void;
  stepBack: () => void;
  jumpToEvent: (index: number) => void;
  setPlaying: (playing: boolean) => void;
  setPlaybackSpeed: (speed: number) => void;

  setConfigOpen: (open: boolean) => void;
  setConfigTab: (tab: string) => void;
  setDialogViewMode: (mode: 'normal' | 'expanded') => void;
  toggleDialogViewMode: () => void;

  // Convenience
  getCurrentSnapshot: () => SimulationSnapshot | null;
}

export const useStore = create<AppState>()(
  persist(
    (set, get) => ({
  // ── Defaults ──
  generatorType: 'lcg',
  lcgConfig: { seed: 7, a: 5, c: 3, m: 16, count: 100 },
  mcgConfig: { seed: 7, a: 5, m: 16, count: 100 },
  msConfig: { seed: 1234, iterations: 100, d: 4 },
  generatorResult: null,
  generatorError: null,

  chiSquareResult: null,
  ksResult: null,
  pokerResult: null,
  testError: null,

  simConfig: {
    servers: 1,
    arrivalRate: 1,
    serviceRate: 1.5,
    customerCount: 10,
    distributionMode: 'exponential' as DistributionMode,
    arrivalTable: getDefaultArrivalTable(),
    serviceTable: getDefaultServiceTable(),
  },
  simResult: null,
  simError: null,
  currentEventIndex: 0,
  isPlaying: false,
  playbackSpeed: 1000,

  configOpen: false,
  configTab: 'generator',
  dialogViewMode: 'normal',

  // ── Generator Actions ──
  setGeneratorType: (type) => set({ generatorType: type, generatorResult: null, generatorError: null }),

  setLCGConfig: (config) =>
    set((s) => ({ lcgConfig: { ...s.lcgConfig, ...config } })),
  setMCGConfig: (config) =>
    set((s) => ({ mcgConfig: { ...s.mcgConfig, ...config } })),
  setMSConfig: (config) =>
    set((s) => ({ msConfig: { ...s.msConfig, ...config } })),

  generate: () => {
    const state = get();
    try {
      let result: GeneratorResult;
      switch (state.generatorType) {
        case 'lcg':
          result = lcg.generate(state.lcgConfig);
          break;
        case 'mcg':
          result = mcg.generate(state.mcgConfig);
          break;
        case 'middle-square':
          result = middleSquare.generate(state.msConfig);
          break;
      }
      set({
        generatorResult: result,
        generatorError: null,
        chiSquareResult: null,
        ksResult: null,
        pokerResult: null,
      });
      toast.success('Secuencia generada', {
        description: `${result.sequence.length} valores generados con ${state.generatorType.toUpperCase()}.`,
      });
    } catch (e) {
      const msg = (e as Error).message;
      set({ generatorResult: null, generatorError: msg });
      toast.error('Error al generar', { description: msg });
    }
  },

  // ── Test Actions ──
  runTests: () => {
    const state = get();
    if (!state.generatorResult) {
      set({ testError: 'Primero genere una secuencia.' });
      toast.warning('Primero genere una secuencia');
      return;
    }
    try {
      const values = state.generatorResult.normalized;
      const chi = chiSquareTest(values);
      const ks = ksTest(values);
      const poker = values.length >= 5 ? pokerTest(values) : null;
      set({
        chiSquareResult: chi,
        ksResult: ks,
        pokerResult: poker,
        testError: null,
      });
      toast.success('Pruebas ejecutadas', {
        description: 'Chi-cuadrada, Kolmogorov-Smirnov y Póker completadas.',
      });
    } catch (e) {
      const msg = (e as Error).message;
      set({ testError: msg });
      toast.error('Error en pruebas', { description: msg });
    }
  },

  // ── Simulation Actions ──
  setSimConfig: (config) =>
    set((s) => ({ simConfig: { ...s.simConfig, ...config } })),

  runSim: () => {
    const state = get();
    // Generate PRNG sequence if needed
    let sequence = state.generatorResult?.normalized;
    if (!sequence || sequence.length < state.simConfig.customerCount * 2) {
      // Auto-generate with current generator
      try {
        const needed = state.simConfig.customerCount * 2;
        let result: GeneratorResult;
        switch (state.generatorType) {
          case 'lcg':
            result = lcg.generate({ ...state.lcgConfig, count: needed });
            break;
          case 'mcg':
            result = mcg.generate({ ...state.mcgConfig, count: needed });
            break;
          case 'middle-square':
            result = middleSquare.generate({ ...state.msConfig, iterations: needed });
            break;
        }
        sequence = result.normalized;
        set({ generatorResult: result });
        toast.info('Secuencia auto-generada', {
          description: `Se generaron ${needed} valores para la simulación.`,
        });
      } catch (e) {
        const msg = (e as Error).message;
        set({ simError: msg });
        toast.error('Error al generar secuencia', { description: msg });
        return;
      }
    }

    try {
      const simResult = runSimulation(state.simConfig, sequence);
      set({
        simResult,
        simError: null,
        currentEventIndex: 0,
        isPlaying: false,
      });
      toast.success('Simulación completada', {
        description: `${simResult.events.length} eventos procesados.`,
      });
    } catch (e) {
      const msg = (e as Error).message;
      set({ simResult: null, simError: msg });
      toast.error('Error en simulación', { description: msg });
    }
  },

  stepForward: () => {
    const state = get();
    if (!state.simResult) return;
    const maxIdx = state.simResult.snapshots.length - 1;
    if (state.currentEventIndex < maxIdx) {
      set({ currentEventIndex: state.currentEventIndex + 1 });
    }
  },

  stepBack: () => {
    const state = get();
    if (state.currentEventIndex > 0) {
      set({ currentEventIndex: state.currentEventIndex - 1 });
    }
  },

  jumpToEvent: (index) => {
    const state = get();
    if (!state.simResult) return;
    const clamped = Math.max(0, Math.min(index, state.simResult.snapshots.length - 1));
    set({ currentEventIndex: clamped });
  },

  setPlaying: (playing) => set({ isPlaying: playing }),
  setPlaybackSpeed: (speed) => set({ playbackSpeed: speed }),

  setConfigOpen: (open) => set({ configOpen: open }),
  setConfigTab: (tab) => set({ configTab: tab }),
  setDialogViewMode: (mode) => set({ dialogViewMode: mode }),
  toggleDialogViewMode: () => {
    const mode = get().dialogViewMode;
    set({ dialogViewMode: mode === 'normal' ? 'expanded' : 'normal' });
  },

  getCurrentSnapshot: () => {
    const state = get();
    if (!state.simResult) return null;
    return state.simResult.snapshots[state.currentEventIndex] ?? null;
  },
    }),
    {
      name: 'app-ui-preferences',
      partialize: (state) => ({
        configTab: state.configTab,
        dialogViewMode: state.dialogViewMode,
      }),
    },
  ),
);
