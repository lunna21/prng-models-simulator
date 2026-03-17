import { useEffect, useRef, useCallback } from 'react';
import { useStore } from '@/store/store';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import {
  Play,
  Pause,
  SkipForward,
  SkipBack,
  Settings,
  RotateCcw,
} from 'lucide-react';
import type { GeneratorType } from '@/lib/generators/types';

export function ControlsPanel() {
  const generatorType = useStore((s) => s.generatorType);
  const setGeneratorType = useStore((s) => s.setGeneratorType);
  const simResult = useStore((s) => s.simResult);
  const currentEventIndex = useStore((s) => s.currentEventIndex);
  const isPlaying = useStore((s) => s.isPlaying);
  const playbackSpeed = useStore((s) => s.playbackSpeed);
  const setPlaying = useStore((s) => s.setPlaying);
  const setPlaybackSpeed = useStore((s) => s.setPlaybackSpeed);
  const stepForward = useStore((s) => s.stepForward);
  const stepBack = useStore((s) => s.stepBack);
  const jumpToEvent = useStore((s) => s.jumpToEvent);
  const setConfigOpen = useStore((s) => s.setConfigOpen);
  const runSim = useStore((s) => s.runSim);

  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const totalEvents = simResult ? simResult.snapshots.length : 0;

  // Auto-play logic
  const handleStepForward = useCallback(() => {
    const state = useStore.getState();
    if (!state.simResult) return;
    const maxIdx = state.simResult.snapshots.length - 1;
    if (state.currentEventIndex >= maxIdx) {
      useStore.getState().setPlaying(false);
      return;
    }
    stepForward();
  }, [stepForward]);

  useEffect(() => {
    if (isPlaying) {
      intervalRef.current = setInterval(handleStepForward, playbackSpeed);
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isPlaying, playbackSpeed, handleStepForward]);

  const snapshot = simResult?.snapshots[currentEventIndex];

  return (
    <div className="absolute bottom-4 left-4 z-10 flex flex-col gap-3 rounded-xl border border-border bg-background/90 p-4 shadow-lg backdrop-blur-sm" style={{ minWidth: 320 }}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-foreground">Panel de Control</h3>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setConfigOpen(true)}
          className="gap-1.5"
        >
          <Settings className="h-4 w-4" />
          Configurar
        </Button>
      </div>

      {/* Generator selector */}
      <div className="flex flex-col gap-1.5">
        <label className="text-xs text-muted-foreground">Generador</label>
        <Select
          value={generatorType}
          onValueChange={(v) => setGeneratorType(v as GeneratorType)}
        >
          <SelectTrigger className="h-8 text-xs">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="lcg">Congruencial Lineal (LCG)</SelectItem>
            <SelectItem value="mcg">Congruencial Multiplicativo (MCG)</SelectItem>
            <SelectItem value="middle-square">Cuadrados Medios</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Simulation Controls */}
      <div className="flex flex-col gap-2">
        <div className="flex items-center gap-1.5">
          <Button
            variant="outline"
            size="icon"
            className="h-8 w-8"
            onClick={() => jumpToEvent(0)}
            disabled={!simResult}
          >
            <RotateCcw className="h-3.5 w-3.5" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="h-8 w-8"
            onClick={stepBack}
            disabled={!simResult || currentEventIndex <= 0}
          >
            <SkipBack className="h-3.5 w-3.5" />
          </Button>
          <Button
            variant={isPlaying ? 'secondary' : 'default'}
            size="icon"
            className="h-8 w-8"
            onClick={() => {
              if (!simResult) {
                runSim();
              } else {
                setPlaying(!isPlaying);
              }
            }}
          >
            {isPlaying ? (
              <Pause className="h-3.5 w-3.5" />
            ) : (
              <Play className="h-3.5 w-3.5" />
            )}
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="h-8 w-8"
            onClick={stepForward}
            disabled={!simResult || currentEventIndex >= totalEvents - 1}
          >
            <SkipForward className="h-3.5 w-3.5" />
          </Button>
        </div>

        {/* Event counter */}
        {simResult && (
          <div className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground">
              Evento {currentEventIndex} / {totalEvents - 1}
            </span>
            {snapshot?.currentEvent && (
              <Badge variant="outline" className="text-xs">
                t={snapshot.currentEvent.time}
              </Badge>
            )}
          </div>
        )}

        {/* Speed control */}
        <div className="flex items-center gap-2">
          <span className="text-xs text-muted-foreground whitespace-nowrap">Velocidad</span>
          <Slider
            value={[playbackSpeed]}
            onValueChange={([v]) => setPlaybackSpeed(v)}
            min={100}
            max={3000}
            step={100}
            className="flex-1"
          />
          <span className="text-xs text-muted-foreground whitespace-nowrap">
            {(playbackSpeed / 1000).toFixed(1)}s
          </span>
        </div>
      </div>

      {/* Current event info */}
      {snapshot?.currentEvent && snapshot.currentEvent.type !== 'INIT' && (
        <div className="rounded-md border border-border bg-muted/50 p-2">
          <p className="text-xs font-medium">{snapshot.currentEvent.description}</p>
          <p className="text-xs text-muted-foreground">{snapshot.currentEvent.action}</p>
          <div className="mt-1 flex gap-2">
            <Badge variant="secondary" className="text-xs">
              Cola: {snapshot.currentEvent.queueLength}
            </Badge>
            <Badge variant="secondary" className="text-xs">
              N(t): {snapshot.currentEvent.systemCount}
            </Badge>
          </div>
        </div>
      )}
    </div>
  );
}

export default ControlsPanel;
