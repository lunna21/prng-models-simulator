import { useMemo, useState } from 'react';
import { useStore } from '@/store/store';
import { Button } from '@/components/ui/button';
import { FormattedNumberInput } from '@/components/ui/formatted-number-input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tooltip, TooltipTrigger, TooltipContent } from '@/components/ui/tooltip';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Separator } from '@/components/ui/separator';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, LineChart, Line, ReferenceLine } from 'recharts';
import type { GeneratorType, MiddleSquareStepDetail, DegenerationInfo } from '@/lib/generators/types';
import type { ChiSquareDetails, KSDetails, PokerDetails } from '@/lib/tests/types';
import { CheckCircle2, XCircle, AlertTriangle, Sparkles, Info, ChevronDown, ChevronRight, Maximize2 } from 'lucide-react';
import { EducationalHelp } from './EducationalHelp';
import { MathFormula } from './MathFormula';
import { validateLCG, validateMCG } from '@/lib/generators/validation';
import { detectPeriod, findRepetition } from '@/lib/generators/period-detection';
import { getTestHelpContent } from './test-help-content';

function fmt(n: number): string {
  return n.toLocaleString('es-MX');
}

function LabeledInput({
  label,
  tooltip,
  value,
  onChange,
  invalid,
  min,
  max,
  placeholder,
  dataTour,
}: {
  label: string;
  tooltip: string;
  value: number;
  onChange: (v: number) => void;
  invalid?: boolean;
  min?: number;
  max?: number;
  placeholder?: string;
  dataTour?: string;
}) {
  return (
    <div className="space-y-1.5">
      <Label className="text-xs flex items-center gap-1">
        {label}
        <Tooltip>
          <TooltipTrigger asChild>
            <Info className="h-3 w-3 text-muted-foreground cursor-help" />
          </TooltipTrigger>
          <TooltipContent side="right" className="max-w-[220px]">
            <p className="text-xs">{tooltip}</p>
          </TooltipContent>
        </Tooltip>
      </Label>
      <FormattedNumberInput
        value={value}
        onChange={onChange}
        min={min}
        max={max}
        placeholder={placeholder}
        data-tour={dataTour}
        className={invalid ? 'border-destructive focus-visible:ring-destructive' : undefined}
        aria-invalid={invalid}
      />
    </div>
  );
}

export function GeneratorTab() {
  const generatorType = useStore((s) => s.generatorType);
  const setGeneratorType = useStore((s) => s.setGeneratorType);
  const lcgConfig = useStore((s) => s.lcgConfig);
  const mcgConfig = useStore((s) => s.mcgConfig);
  const msConfig = useStore((s) => s.msConfig);
  const setLCGConfig = useStore((s) => s.setLCGConfig);
  const setMCGConfig = useStore((s) => s.setMCGConfig);
  const setMSConfig = useStore((s) => s.setMSConfig);
  const generate = useStore((s) => s.generate);
  const generatorResult = useStore((s) => s.generatorResult);
  const runTests = useStore((s) => s.runTests);
  const chiSquareResult = useStore((s) => s.chiSquareResult);
  const ksResult = useStore((s) => s.ksResult);
  const pokerResult = useStore((s) => s.pokerResult);
  const testError = useStore((s) => s.testError);

  const [isSequenceDialogOpen, setIsSequenceDialogOpen] = useState(false);
  const [expandedTest, setExpandedTest] = useState<string | null>(null);
  const [showLCGValidationDetails, setShowLCGValidationDetails] = useState(false);
  const [showMCGValidationDetails, setShowMCGValidationDetails] = useState(false);

  const lcgValidation = useMemo(
    () => validateLCG(lcgConfig.a, lcgConfig.c, lcgConfig.m),
    [lcgConfig.a, lcgConfig.c, lcgConfig.m],
  );

  const mcgValidation = useMemo(
    () => validateMCG(mcgConfig.a, mcgConfig.m, mcgConfig.seed),
    [mcgConfig.a, mcgConfig.m, mcgConfig.seed],
  );

  const periodDetection = useMemo(() => {
    if (!generatorResult) return null;
    return detectPeriod(generatorResult.sequence);
  }, [generatorResult]);

  const repetition = useMemo(() => {
    if (!generatorResult) return null;
    return findRepetition(generatorResult.sequence);
  }, [generatorResult]);

  const sequenceCycleLines = useMemo(() => {
    if (!periodDetection?.hasCycle || periodDetection.period == null || periodDetection.cycleStart == null) {
      return [] as number[];
    }

    const visibleLimit = Math.min(generatorResult?.normalized.length ?? 0, 500);
    const lines: number[] = [];

    for (let idx = periodDetection.cycleStart; idx < visibleLimit; idx += periodDetection.period) {
      lines.push(idx + 1);
    }

    return lines;
  }, [periodDetection, generatorResult]);

  const suggestLCGParams = () => {
    setLCGConfig({ a: 1664525, c: 1013904223, m: 4294967296, seed: 1 });
  };

  const suggestMCGParams = () => {
    setMCGConfig({ a: 48271, m: 2147483647, seed: 1 });
  };

  const middleSquareColumns = [
    { label: 'N', tip: 'Número de iteración de la secuencia.', className: 'w-12 text-center' },
    { label: 'Xₙ', tip: 'Valor actual antes de aplicar el método.', className: 'text-right' },
    { label: 'Izq.', tip: 'Dígitos de la parte izquierda tras elevar al cuadrado.' },
    {
      label: 'Centro',
      tip: 'Bloque central extraído del cuadrado; se usa como siguiente semilla.',
      className: 'bg-muted/50 text-center',
    },
    { label: 'Der.', tip: 'Dígitos de la parte derecha tras elevar al cuadrado.' },
    { label: 'Xₙ₊₁', tip: 'Siguiente valor entero generado.', className: 'text-right' },
    { label: 'Rᵢ', tip: 'Valor normalizado en el intervalo [0, 1).', className: 'text-right' },
  ];

  const congruentialColumns = [
    { label: 'N', tip: 'Número de iteración de la secuencia.', className: 'w-16 text-center' },
    { label: 'Xₙ', tip: 'Valor actual antes de aplicar la fórmula.', className: 'text-right' },
    { label: 'Fórmula', tip: 'Operación aplicada para calcular el siguiente valor.' },
    { label: 'Xₙ₊₁', tip: 'Siguiente valor entero generado.', className: 'text-right' },
    { label: 'Rᵢ', tip: 'Valor normalizado en el intervalo [0, 1).', className: 'text-right' },
  ];

  return (
    <div className="space-y-6">
      {/* Generator Config */}
      <div className="grid grid-cols-1 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center justify-between">
              <span>Parámetros del Generador</span>
              <div className="flex items-center gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="h-8"
                  onClick={() => setIsSequenceDialogOpen(true)}
                  disabled={!generatorResult}
                  title={generatorResult ? 'Ver secuencia generada' : 'Genera una secuencia para visualizarla'}
                >
                  <Maximize2 className="h-3.5 w-3.5 mr-1" /> Ver secuencia
                </Button>
                <EducationalHelp generatorType={generatorType} />
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label className="text-xs flex items-center gap-1" data-tour="generator-type-select">
                Tipo de Generador
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Info className="h-3 w-3 text-muted-foreground cursor-help" />
                  </TooltipTrigger>
                  <TooltipContent side="right" className="max-w-[220px]">
                    <p className="text-xs">Algoritmo usado para generar la secuencia de números pseudoaleatorios.</p>
                  </TooltipContent>
                </Tooltip>
              </Label>
                <Select
                  value={generatorType}
                  onValueChange={(v) => setGeneratorType(v as GeneratorType)}
                >
                  <SelectTrigger data-tour="generator-type-select">
                    <SelectValue />
                  </SelectTrigger>
                <SelectContent>
                  <SelectItem value="lcg">Congruencial Lineal (LCG)</SelectItem>
                  <SelectItem value="mcg">Congruencial Multiplicativo (MCG)</SelectItem>
                  <SelectItem value="middle-square">Cuadrados Medios</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* LCG params */}
            {generatorType === 'lcg' && (
              <>
                <div className="grid grid-cols-2 gap-3">
                  <LabeledInput
                    label="Semilla (X₀)"
                    tooltip="Valor inicial del generador. Cualquier entero no negativo."
                    value={lcgConfig.seed}
                    onChange={(v) => setLCGConfig({ seed: v })}
                    placeholder="ej. 7"
                    dataTour="lcg-seed"
                  />
                  <LabeledInput
                    label="Multiplicador (a)"
                    tooltip="Constante multiplicativa. Debe cumplir las condiciones de Hull-Dobell para período máximo."
                    value={lcgConfig.a}
                    onChange={(v) => setLCGConfig({ a: v })}
                    invalid={lcgConfig.a <= 0}
                    placeholder="ej. 1664525"
                    dataTour="lcg-a"
                  />
                  <LabeledInput
                    label="Incremento (c)"
                    tooltip="Constante aditiva. Debe ser coprimo con m para período completo."
                    value={lcgConfig.c}
                    onChange={(v) => setLCGConfig({ c: v })}
                    invalid={lcgConfig.c < 0}
                    placeholder="ej. 1013904223"
                    dataTour="lcg-c"
                  />
                  <LabeledInput
                    label="Módulo (m)"
                    tooltip="Determina el rango [0, m) y el período máximo. Potencias de 2 son comunes."
                    value={lcgConfig.m}
                    onChange={(v) => setLCGConfig({ m: v || 1 })}
                    invalid={lcgConfig.m <= 0}
                    placeholder="ej. 2³²"
                    dataTour="lcg-m"
                  />
                </div>
                <LabeledInput
                  label="Cantidad (N)"
                  tooltip="Número de valores a generar. Rango: 1 a 10,000."
                  value={lcgConfig.count}
                  onChange={(v) => setLCGConfig({ count: Math.max(1, Math.min(v, 10000)) })}
                  min={1}
                  max={10000}
                  placeholder="ej. 100"
                  dataTour="lcg-count"
                />

                {/* LCG Validation */}
                <div className="rounded-lg border p-3 space-y-2.5 bg-muted/15">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-xs font-medium">Período máximo (Hull-Dobell)</span>
                    <div className="flex items-center gap-2">
                      {lcgValidation.hasFullPeriod ? (
                        <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200 text-xs">
                          <CheckCircle2 className="h-3 w-3 mr-1" /> Garantizado
                        </Badge>
                      ) : (
                        <Badge variant="secondary" className="text-xs">
                          <AlertTriangle className="h-3 w-3 mr-1" /> No garantizado
                        </Badge>
                      )}
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        className="h-7 px-3 text-xs"
                        onClick={() => setShowLCGValidationDetails((prev) => !prev)}
                      >
                        {showLCGValidationDetails ? (
                          <ChevronDown className="h-3.5 w-3.5 mr-1" />
                        ) : (
                          <ChevronRight className="h-3.5 w-3.5 mr-1" />
                        )}
                        {showLCGValidationDetails ? 'Ocultar' : 'Ver detalle'}
                      </Button>
                    </div>
                  </div>

                  {showLCGValidationDetails && (
                    <div className="space-y-2.5 rounded-md border border-border/70 bg-background/70 p-2.5">
                      <div className="space-y-1.5">
                        {lcgValidation.checks.map((check, i) => (
                          <div key={i} className="flex items-start gap-2 text-xs">
                            {check.passed ? (
                              <CheckCircle2 className="h-3.5 w-3.5 text-green-500 mt-0.5 shrink-0" />
                            ) : (
                              <XCircle className="h-3.5 w-3.5 text-destructive mt-0.5 shrink-0" />
                            )}
                            <span className="text-muted-foreground leading-relaxed">{check.message}</span>
                          </div>
                        ))}
                      </div>

                      <div className="rounded-md border border-border/60 bg-muted/25 px-2.5 py-1.5 text-xs text-muted-foreground">
                        Período detectado: <span className="font-mono text-foreground">{lcgValidation.currentPeriod}</span>
                      </div>

                      {!lcgValidation.hasFullPeriod && (
                        <Button
                          variant="outline"
                          size="sm"
                          className="w-full text-xs h-7"
                          onClick={suggestLCGParams}
                        >
                          <Sparkles className="h-3 w-3 mr-1" /> Sugerir parámetros óptimos
                        </Button>
                      )}
                    </div>
                  )}
                </div>
              </>
            )}

            {/* MCG params */}
            {generatorType === 'mcg' && (
              <>
                <div className="grid grid-cols-2 gap-3">
                  <LabeledInput
                    label="Semilla (X₀)"
                    tooltip="Valor inicial. Debe ser distinto de cero. Para m=2^e, usar semilla impar."
                    value={mcgConfig.seed}
                    onChange={(v) => setMCGConfig({ seed: v })}
                    invalid={mcgConfig.seed === 0}
                    placeholder="ej. 7"
                    dataTour="mcg-seed"
                  />
                  <LabeledInput
                    label="Multiplicador (a)"
                    tooltip="Constante multiplicativa. Para m=2^e, usar a ≡ 3 o 5 (mod 8)."
                    value={mcgConfig.a}
                    onChange={(v) => setMCGConfig({ a: v })}
                    invalid={mcgConfig.a <= 0}
                    placeholder="ej. 48271"
                    dataTour="mcg-a"
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <LabeledInput
                    label="Módulo (m)"
                    tooltip="Rango del generador. Primos grandes (ej. 2³¹−1) dan mejores propiedades."
                    value={mcgConfig.m}
                    onChange={(v) => setMCGConfig({ m: v || 1 })}
                    invalid={mcgConfig.m <= 0}
                    placeholder="ej. 2³¹−1"
                    dataTour="mcg-m"
                  />
                  <LabeledInput
                    label="Cantidad (N)"
                    tooltip="Número de valores a generar. Rango: 1 a 10,000."
                    value={mcgConfig.count}
                    onChange={(v) => setMCGConfig({ count: Math.max(1, Math.min(v, 10000)) })}
                    min={1}
                    max={10000}
                    placeholder="ej. 100"
                    dataTour="mcg-count"
                  />
                </div>

                {/* MCG Validation */}
                <div className="rounded-lg border p-3 space-y-2.5 bg-muted/15">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-xs font-medium">Período máximo (MCG)</span>
                    <div className="flex items-center gap-2">
                      {mcgValidation.hasFullPeriod ? (
                        <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200 text-xs">
                          <CheckCircle2 className="h-3 w-3 mr-1" /> Garantizado
                        </Badge>
                      ) : (
                        <Badge variant="secondary" className="text-xs">
                          <AlertTriangle className="h-3 w-3 mr-1" /> No garantizado
                        </Badge>
                      )}
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        className="h-7 px-3 text-xs"
                        onClick={() => setShowMCGValidationDetails((prev) => !prev)}
                      >
                        {showMCGValidationDetails ? (
                          <ChevronDown className="h-3.5 w-3.5 mr-1" />
                        ) : (
                          <ChevronRight className="h-3.5 w-3.5 mr-1" />
                        )}
                        {showMCGValidationDetails ? 'Ocultar' : 'Ver detalle'}
                      </Button>
                    </div>
                  </div>

                  {showMCGValidationDetails && (
                    <div className="space-y-2.5 rounded-md border border-border/70 bg-background/70 p-2.5">
                      <div className="space-y-1.5">
                        {mcgValidation.checks.map((check, i) => (
                          <div key={i} className="flex items-start gap-2 text-xs">
                            {check.passed ? (
                              <CheckCircle2 className="h-3.5 w-3.5 text-green-500 mt-0.5 shrink-0" />
                            ) : (
                              <XCircle className="h-3.5 w-3.5 text-destructive mt-0.5 shrink-0" />
                            )}
                            <span className="text-muted-foreground leading-relaxed">{check.message}</span>
                          </div>
                        ))}
                      </div>

                      <div className="rounded-md border border-border/60 bg-muted/25 px-2.5 py-1.5 text-xs text-muted-foreground">
                        Período detectado: <span className="font-mono text-foreground">{mcgValidation.currentPeriod}</span>
                      </div>

                      {!mcgValidation.hasFullPeriod && (
                        <Button
                          variant="outline"
                          size="sm"
                          className="w-full text-xs h-7"
                          onClick={suggestMCGParams}
                        >
                          <Sparkles className="h-3 w-3 mr-1" /> Sugerir parámetros óptimos
                        </Button>
                      )}
                    </div>
                  )}
                </div>
              </>
            )}

            {/* Middle-Square params */}
            {generatorType === 'middle-square' && (
              <div className="grid grid-cols-2 gap-3">
                <LabeledInput
                  label="Semilla"
                  tooltip="Número inicial. Debe tener a lo sumo d dígitos."
                  value={msConfig.seed}
                  onChange={(v) => setMSConfig({ seed: v })}
                  invalid={msConfig.seed >= Math.pow(10, msConfig.d)}
                  placeholder="ej. 1234"
                  dataTour="ms-seed"
                />
                <LabeledInput
                  label="Dígitos (d)"
                  tooltip="Cantidad de dígitos a extraer. Debe ser par y ≥ 4 para buen período."
                  value={msConfig.d}
                  onChange={(v) => {
                    const clamped = Math.max(2, Math.min(v, 16));
                    const rounded = clamped % 2 === 0 ? clamped : clamped + 1;
                    setMSConfig({ d: Math.min(rounded, 16) });
                  }}
                  invalid={msConfig.d < 4 || msConfig.d % 2 !== 0}
                  placeholder="ej. 4"
                  dataTour="ms-d"
                />
                <div className="col-span-2">
                  <LabeledInput
                    label="Iteraciones"
                    tooltip="Cuántas veces aplicar el algoritmo. Rango: 1 a 10,000."
                    value={msConfig.iterations}
                    onChange={(v) => setMSConfig({ iterations: Math.max(1, Math.min(v, 10000)) })}
                    min={1}
                    max={10000}
                    placeholder="ej. 100"
                    dataTour="ms-iterations"
                  />
                </div>
              </div>
            )}

            <div className="flex flex-wrap justify-center gap-2">
              <Button onClick={generate} className="min-w-[170px] px-8" data-tour="generator-generate">
                Generar
              </Button>
              <Button
                variant="secondary"
                onClick={runTests}
                disabled={!generatorResult}
                className="min-w-[170px] px-8"
                data-tour="generator-run-tests"
              >
                Ejecutar Pruebas
              </Button>
            </div>

            {generatorResult?.degenerated && (
              <div className="rounded-lg border border-amber-300 bg-amber-50 dark:bg-amber-950 dark:border-amber-800 p-3 space-y-1.5">
                <p className="text-sm font-medium text-amber-800 dark:text-amber-200 flex items-center gap-1.5">
                  <AlertTriangle className="h-4 w-4" /> Degeneración detectada
                </p>
                <p className="text-xs text-amber-700 dark:text-amber-300 leading-relaxed">
                  {(generatorResult.degenerated as DegenerationInfo).reason === 'zero'
                    ? `En la iteración ${(generatorResult.degenerated as DegenerationInfo).iteration}, el valor converge a 0. Los valores siguientes serán siempre 0. Esto ocurre cuando los dígitos centrales del cuadrado son todos cero — un problema conocido del método de cuadrados medios. Use una semilla con más dígitos o diferente valor para evitarlo.`
                    : `En la iteración ${(generatorResult.degenerated as DegenerationInfo).iteration}, el valor ${(generatorResult.degenerated as DegenerationInfo).value} ya había aparecido. La secuencia entrará en un ciclo de período corto. Esto es una limitación inherente del método de cuadrados medios.`}
                </p>
              </div>
            )}
          </CardContent>
        </Card>
        {generatorResult && (
          <Dialog open={isSequenceDialogOpen} onOpenChange={setIsSequenceDialogOpen}>
            <DialogContent className="w-[95vw] max-w-[95vw] h-[92vh] p-0 gap-0 flex flex-col">
              <DialogHeader className="px-6 py-4 border-b border-border">
                <DialogTitle>Secuencia Generada ({fmt(generatorResult.normalized.length)} valores)</DialogTitle>
              </DialogHeader>
              <div className="flex-1 min-h-0 overflow-auto p-6 space-y-4">
                <ResponsiveContainer width="100%" height={520}>
                  <LineChart
                    data={generatorResult.normalized.slice(0, 500).map((v, i) => ({
                      i: i + 1,
                      r: v,
                    }))}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="i" tick={{ fontSize: 11 }} />
                    <YAxis domain={[0, 1]} tick={{ fontSize: 11 }} />
                    <RechartsTooltip />
                    <Line type="monotone" dataKey="r" stroke="var(--color-primary)" dot strokeWidth={1.25} />
                    {generatorResult.degenerated && (
                      <ReferenceLine
                        x={(generatorResult.degenerated as DegenerationInfo).iteration}
                        stroke="var(--color-destructive)"
                        strokeDasharray="5 5"
                        label={{ value: 'Degeneración', position: 'top', fontSize: 10, fill: 'var(--color-destructive)' }}
                      />
                    )}
                    {sequenceCycleLines.map((x, idx) => (
                      <ReferenceLine
                        key={`cycle-line-${x}`}
                        x={x}
                        stroke={idx === 0 ? 'var(--color-chart-3)' : 'var(--color-chart-4)'}
                        strokeDasharray="5 5"
                        label={
                          idx === 0
                            ? { value: 'Inicio ciclo', position: 'top', fontSize: 10, fill: 'var(--color-chart-3)' }
                            : idx === 1 && periodDetection?.period
                              ? { value: `Período=${periodDetection.period}`, position: 'top', fontSize: 10, fill: 'var(--color-chart-4)' }
                              : undefined
                        }
                      />
                    ))}
                  </LineChart>
                </ResponsiveContainer>

                <p className="text-sm text-muted-foreground leading-relaxed">
                  Cada punto representa el valor normalizado <span className="font-mono">Rᵢ</span> en el intervalo [0, 1). Una secuencia ideal debe mostrar los valores distribuidos uniformemente sin patrones visibles.
                </p>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-xs">
                  <div className="bg-muted/50 rounded p-2">
                    <span className="text-muted-foreground">Mín</span>
                    <p className="font-mono font-semibold">{Math.min(...generatorResult.normalized).toFixed(6)}</p>
                  </div>
                  <div className="bg-muted/50 rounded p-2">
                    <span className="text-muted-foreground">Máx</span>
                    <p className="font-mono font-semibold">{Math.max(...generatorResult.normalized).toFixed(6)}</p>
                  </div>
                  <div className="bg-muted/50 rounded p-2">
                    <span className="text-muted-foreground">Media</span>
                    <p className="font-mono font-semibold">
                      {(generatorResult.normalized.reduce((a, b) => a + b, 0) / generatorResult.normalized.length).toFixed(6)}
                    </p>
                  </div>
                  <div className="bg-muted/50 rounded p-2">
                    <span className="text-muted-foreground">Valores</span>
                    <p className="font-mono font-semibold">{fmt(generatorResult.normalized.length)}</p>
                  </div>
                </div>

                {(periodDetection?.hasCycle && periodDetection.period) || (repetition && repetition.index > 0 && !periodDetection?.hasCycle) ? (
                  <div className="flex items-center gap-2 text-xs">
                    {periodDetection?.hasCycle && periodDetection.period && (
                      <Badge variant="outline" className="bg-amber-50 dark:bg-amber-950 border-amber-300 dark:border-amber-700">
                        Período detectado: {periodDetection.period}
                      </Badge>
                    )}
                    {repetition && repetition.index > 0 && !periodDetection?.hasCycle && (
                      <Badge variant="outline" className="bg-orange-50 dark:bg-orange-950 border-orange-300 dark:border-orange-700">
                        Repetición en iteración {repetition.index + 1}
                      </Badge>
                    )}
                  </div>
                ) : null}
              </div>
            </DialogContent>
          </Dialog>
        )}
      </div>

      {/* Sequence Table */}
      {generatorResult && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Tabla de Resultados</CardTitle>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[280px]">
              {generatorType === 'middle-square' ? (
                <Table>
                  <TableHeader className="sticky top-0 bg-card z-10 shadow-sm">
                    <TableRow>
                      {middleSquareColumns.map((col) => (
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
                    {generatorResult.steps.slice(0, 200).map((step, idx) => {
                      const ms = step as MiddleSquareStepDetail;
                      const isEven = idx % 2 === 0;
                      return (
                        <TableRow 
                          key={step.iteration} 
                          className={`transition-colors hover:bg-muted/50 ${isEven ? 'bg-muted/20' : ''}`}
                        >
                          <TableCell className="font-mono text-xs text-center">{fmt(step.iteration)}</TableCell>
                          <TableCell className="font-mono text-xs text-right">{fmt(step.xPrev)}</TableCell>
                          <TableCell className="font-mono text-xs text-muted-foreground">{ms.leftPart || '—'}</TableCell>
                          <TableCell className="font-mono text-xs font-semibold bg-muted/50 text-center">{ms.extracted}</TableCell>
                          <TableCell className="font-mono text-xs text-muted-foreground">{ms.rightPart || '—'}</TableCell>
                          <TableCell className="font-mono text-xs text-right">{fmt(step.xNext)}</TableCell>
                          <TableCell className="font-mono text-xs text-right">{step.normalized}</TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              ) : (
                <Table>
                  <TableHeader className="sticky top-0 bg-card z-10 shadow-sm">
                    <TableRow>
                      {congruentialColumns.map((col) => (
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
                    {generatorResult.steps.slice(0, 200).map((step, idx) => {
                      const isEven = idx % 2 === 0;
                      return (
                        <TableRow 
                          key={step.iteration} 
                          className={`transition-colors hover:bg-muted/50 ${isEven ? 'bg-muted/20' : ''}`}
                        >
                          <TableCell className="font-mono text-xs text-center">{fmt(step.iteration)}</TableCell>
                          <TableCell className="font-mono text-xs text-right">{fmt(step.xPrev)}</TableCell>
                          <TableCell className="font-mono text-xs">{step.formula}</TableCell>
                          <TableCell className="font-mono text-xs text-right">{fmt(step.xNext)}</TableCell>
                          <TableCell className="font-mono text-xs text-right">{step.normalized}</TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              )}
              {generatorResult.steps.length > 200 && (
                <p className="text-xs text-muted-foreground mt-2 text-center">
                  Mostrando 200 de {fmt(generatorResult.steps.length)} filas
                </p>
              )}
            </ScrollArea>
          </CardContent>
        </Card>
      )}

      {/* Test Results */}
      {(chiSquareResult || ksResult || pokerResult) && (
        <>
          <Separator />
          <h3 className="text-base font-semibold">Resultados de Pruebas Estadísticas</h3>
          {testError && <p className="text-sm text-destructive">{testError}</p>}
          <div className={`grid gap-4 ${expandedTest ? 'grid-cols-1' : 'grid-cols-1 md:grid-cols-3'}`}>
            {/* Chi-Square */}
            {chiSquareResult && (
              <Card className={expandedTest === 'chiSquare' ? 'md:col-span-3' : ''}>
                <CardHeader 
                  className="pb-2 cursor-pointer select-none"
                  onClick={() => setExpandedTest(expandedTest === 'chiSquare' ? null : 'chiSquare')}
                >
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-sm flex items-center gap-2">
                      {expandedTest === 'chiSquare' ? (
                        <ChevronDown className="h-4 w-4 text-muted-foreground" />
                      ) : (
                        <ChevronRight className="h-4 w-4 text-muted-foreground" />
                      )}
                      {chiSquareResult.testName}
                    </CardTitle>
                    {chiSquareResult.pass ? (
                      <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                        <CheckCircle2 className="h-3 w-3 mr-1" /> Aprobada
                      </Badge>
                    ) : (
                      <Badge variant="destructive">
                        <XCircle className="h-3 w-3 mr-1" /> Rechazada
                      </Badge>
                    )}
                  </div>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div className="grid grid-cols-2 gap-1 text-xs">
                    <span className="text-muted-foreground">Estadístico:</span>
                    <span className="font-mono">{chiSquareResult.statistic}</span>
                    <span className="text-muted-foreground">Valor crítico:</span>
                    <span className="font-mono">{chiSquareResult.criticalValue}</span>
                  </div>
                  <ResponsiveContainer width="100%" height={expandedTest === 'chiSquare' ? 200 : 120}>
                    <BarChart
                      data={(() => {
                        const d = chiSquareResult.details as ChiSquareDetails;
                        return d.observed.map((o, i) => ({
                          bin: `${(i / d.bins).toFixed(1)}-${((i + 1) / d.bins).toFixed(1)}`,
                          Observado: o,
                          Esperado: d.expected[i],
                        }));
                      })()}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="bin" tick={{ fontSize: expandedTest === 'chiSquare' ? 10 : 8 }} />
                      <YAxis tick={{ fontSize: expandedTest === 'chiSquare' ? 10 : 8 }} />
                      <RechartsTooltip />
                      <Bar dataKey="Observado" fill="var(--color-chart-1)" />
                      <Bar dataKey="Esperado" fill="var(--color-chart-2)" />
                    </BarChart>
                  </ResponsiveContainer>
                  {expandedTest === 'chiSquare' && (
                    <div className="test-content space-y-3 pt-3 border-t">
                      <div className="space-y-2">
                        <h5 className="text-sm font-semibold flex items-center gap-2">
                          {getTestHelpContent('chiSquare').whatItEvaluates.title}
                        </h5>
                        <p className="text-xs text-muted-foreground leading-relaxed">
                          {getTestHelpContent('chiSquare').whatItEvaluates.content}
                        </p>
                      </div>
                      <div className="space-y-2">
                        <h5 className="text-sm font-semibold">¿Cómo funciona?</h5>
                        <div className="space-y-2">
                          {getTestHelpContent('chiSquare').howItWorks.map((step, idx) => (
                            <div key={idx} className="test-step flex items-start gap-2 text-xs">
                              <span className="font-semibold text-primary shrink-0">{step.title}</span>
                              <span className="text-muted-foreground">{step.content}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                      <div className="rounded-md bg-muted p-3">
                        <p className="text-xs font-medium mb-1">{getTestHelpContent('chiSquare').keyFormula.label}</p>
                        <div className="flex items-center justify-center min-h-[32px]">
                          <MathFormula tex={getTestHelpContent('chiSquare').keyFormula.tex} />
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">
                          {getTestHelpContent('chiSquare').keyFormula.description}
                        </p>
                      </div>
                      <div className="space-y-1">
                        <h5 className="text-xs font-semibold">Consejos de interpretación</h5>
                        <ul className="space-y-1">
                          {getTestHelpContent('chiSquare').interpretationTips.map((tip, idx) => (
                            <li key={idx} className="text-xs text-muted-foreground flex items-start gap-1.5">
                              <span className="text-primary mt-0.5">•</span>
                              {tip}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {/* K-S */}
            {ksResult && (
              <Card className={expandedTest === 'kolmogorovSmirnov' ? 'md:col-span-3' : ''}>
                <CardHeader 
                  className="pb-2 cursor-pointer select-none"
                  onClick={() => setExpandedTest(expandedTest === 'kolmogorovSmirnov' ? null : 'kolmogorovSmirnov')}
                >
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-sm flex items-center gap-2">
                      {expandedTest === 'kolmogorovSmirnov' ? (
                        <ChevronDown className="h-4 w-4 text-muted-foreground" />
                      ) : (
                        <ChevronRight className="h-4 w-4 text-muted-foreground" />
                      )}
                      {ksResult.testName}
                    </CardTitle>
                    {ksResult.pass ? (
                      <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                        <CheckCircle2 className="h-3 w-3 mr-1" /> Aprobada
                      </Badge>
                    ) : (
                      <Badge variant="destructive">
                        <XCircle className="h-3 w-3 mr-1" /> Rechazada
                      </Badge>
                    )}
                  </div>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div className="grid grid-cols-2 gap-1 text-xs">
                    <span className="text-muted-foreground">D max:</span>
                    <span className="font-mono">{ksResult.statistic}</span>
                    <span className="text-muted-foreground">Valor crítico:</span>
                    <span className="font-mono">{ksResult.criticalValue}</span>
                    <span className="text-muted-foreground">D+:</span>
                    <span className="font-mono">{(ksResult.details as KSDetails).dPlus}</span>
                    <span className="text-muted-foreground">D-:</span>
                    <span className="font-mono">{(ksResult.details as KSDetails).dMinus}</span>
                  </div>
                  <ResponsiveContainer width="100%" height={expandedTest === 'kolmogorovSmirnov' ? 200 : 120}>
                    <LineChart
                      data={(() => {
                        const d = ksResult.details as KSDetails;
                        const n = d.n;
                        return d.sortedValues.slice(0, 200).map((v, i) => ({
                          i: i + 1,
                          Empirica: (i + 1) / n,
                          Teorica: v,
                        }));
                      })()}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="i" tick={{ fontSize: expandedTest === 'kolmogorovSmirnov' ? 10 : 8 }} />
                      <YAxis domain={[0, 1]} tick={{ fontSize: expandedTest === 'kolmogorovSmirnov' ? 10 : 8 }} />
                      <RechartsTooltip />
                      <Line type="stepAfter" dataKey="Empirica" stroke="var(--color-chart-1)" dot={false} strokeWidth={1.5} />
                      <Line type="monotone" dataKey="Teorica" stroke="var(--color-chart-2)" dot={false} strokeWidth={1.5} />
                      <ReferenceLine y={0} stroke="#666" />
                    </LineChart>
                  </ResponsiveContainer>
                  {expandedTest === 'kolmogorovSmirnov' && (
                    <div className="test-content space-y-3 pt-3 border-t">
                      <div className="space-y-2">
                        <h5 className="text-sm font-semibold flex items-center gap-2">
                          {getTestHelpContent('kolmogorovSmirnov').whatItEvaluates.title}
                        </h5>
                        <p className="text-xs text-muted-foreground leading-relaxed">
                          {getTestHelpContent('kolmogorovSmirnov').whatItEvaluates.content}
                        </p>
                      </div>
                      <div className="space-y-2">
                        <h5 className="text-sm font-semibold">¿Cómo funciona?</h5>
                        <div className="space-y-2">
                          {getTestHelpContent('kolmogorovSmirnov').howItWorks.map((step, idx) => (
                            <div key={idx} className="test-step flex items-start gap-2 text-xs">
                              <span className="font-semibold text-primary shrink-0">{step.title}</span>
                              <span className="text-muted-foreground">{step.content}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                      <div className="rounded-md bg-muted p-3">
                        <p className="text-xs font-medium mb-1">{getTestHelpContent('kolmogorovSmirnov').keyFormula.label}</p>
                        <div className="flex items-center justify-center min-h-[32px]">
                          <MathFormula tex={getTestHelpContent('kolmogorovSmirnov').keyFormula.tex} />
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">
                          {getTestHelpContent('kolmogorovSmirnov').keyFormula.description}
                        </p>
                      </div>
                      <div className="space-y-1">
                        <h5 className="text-xs font-semibold">Consejos de interpretación</h5>
                        <ul className="space-y-1">
                          {getTestHelpContent('kolmogorovSmirnov').interpretationTips.map((tip, idx) => (
                            <li key={idx} className="text-xs text-muted-foreground flex items-start gap-1.5">
                              <span className="text-primary mt-0.5">•</span>
                              {tip}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Poker */}
            {pokerResult && (
              <Card className={expandedTest === 'poker' ? 'md:col-span-3' : ''}>
                <CardHeader 
                  className="pb-2 cursor-pointer select-none"
                  onClick={() => setExpandedTest(expandedTest === 'poker' ? null : 'poker')}
                >
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-sm flex items-center gap-2">
                      {expandedTest === 'poker' ? (
                        <ChevronDown className="h-4 w-4 text-muted-foreground" />
                      ) : (
                        <ChevronRight className="h-4 w-4 text-muted-foreground" />
                      )}
                      {pokerResult.testName}
                    </CardTitle>
                    {pokerResult.pass ? (
                      <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                        <CheckCircle2 className="h-3 w-3 mr-1" /> Aprobada
                      </Badge>
                    ) : (
                      <Badge variant="destructive">
                        <XCircle className="h-3 w-3 mr-1" /> Rechazada
                      </Badge>
                    )}
                  </div>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div className="grid grid-cols-2 gap-1 text-xs">
                    <span className="text-muted-foreground">Estadístico:</span>
                    <span className="font-mono">{pokerResult.statistic}</span>
                    <span className="text-muted-foreground">Valor crítico:</span>
                    <span className="font-mono">{pokerResult.criticalValue}</span>
                    <span className="text-muted-foreground">Manos:</span>
                    <span className="font-mono">{fmt((pokerResult.details as PokerDetails).totalHands)}</span>
                  </div>
                  <ResponsiveContainer width="100%" height={expandedTest === 'poker' ? 200 : 120}>
                    <BarChart
                      data={(() => {
                        const d = pokerResult.details as PokerDetails;
                        return d.handCounts
                          .filter((h) => h.observed > 0 || h.expected > 0.5)
                          .map((h) => ({
                            name: h.name.split(' (')[0],
                            Observado: h.observed,
                            Esperado: Math.round(h.expected * 100) / 100,
                          }));
                      })()}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" tick={{ fontSize: 7 }} angle={-30} textAnchor="end" height={50} />
                      <YAxis tick={{ fontSize: expandedTest === 'poker' ? 10 : 8 }} />
                      <RechartsTooltip />
                      <Bar dataKey="Observado" fill="var(--color-chart-1)" />
                      <Bar dataKey="Esperado" fill="var(--color-chart-2)" />
                    </BarChart>
                  </ResponsiveContainer>
                  {expandedTest === 'poker' && (
                    <div className="test-content space-y-3 pt-3 border-t">
                      <div className="space-y-2">
                        <h5 className="text-sm font-semibold flex items-center gap-2">
                          {getTestHelpContent('poker').whatItEvaluates.title}
                        </h5>
                        <p className="text-xs text-muted-foreground leading-relaxed">
                          {getTestHelpContent('poker').whatItEvaluates.content}
                        </p>
                      </div>
                      <div className="space-y-2">
                        <h5 className="text-sm font-semibold">¿Cómo funciona?</h5>
                        <div className="space-y-2">
                          {getTestHelpContent('poker').howItWorks.map((step, idx) => (
                            <div key={idx} className="test-step flex items-start gap-2 text-xs">
                              <span className="font-semibold text-primary shrink-0">{step.title}</span>
                              <span className="text-muted-foreground">{step.content}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                      <div className="rounded-md bg-muted p-3">
                        <p className="text-xs font-medium mb-1">{getTestHelpContent('poker').keyFormula.label}</p>
                        <div className="flex items-center justify-center min-h-[32px]">
                          <MathFormula tex={getTestHelpContent('poker').keyFormula.tex} />
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">
                          {getTestHelpContent('poker').keyFormula.description}
                        </p>
                      </div>
                      <div className="space-y-1">
                        <h5 className="text-xs font-semibold">Consejos de interpretación</h5>
                        <ul className="space-y-1">
                          {getTestHelpContent('poker').interpretationTips.map((tip, idx) => (
                            <li key={idx} className="text-xs text-muted-foreground flex items-start gap-1.5">
                              <span className="text-primary mt-0.5">•</span>
                              {tip}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}
          </div>
        </>
      )}
    </div>
  );
}

export default GeneratorTab;
