import { useState } from 'react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { FormattedNumberInput } from '@/components/ui/formatted-number-input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { lcg, mcg, middleSquare } from '@/lib/generators';
import type { GeneratorResult } from '@/lib/generators/types';
import { chiSquareTest, ksTest, pokerTest } from '@/lib/tests';
import type { TestResult } from '@/lib/tests/types';
import type { ChiSquareDetails, KSDetails, PokerDetails } from '@/lib/tests/types';
import { CheckCircle2, Maximize2, XCircle } from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  ReferenceLine,
} from 'recharts';

interface CompareEntry {
  name: string;
  result: GeneratorResult;
  chi: TestResult;
  ks: TestResult;
  poker: TestResult | null;
}

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
}

export function CompareTab() {
  const [lcgConfig, setLcgConfig] = useState<LCGConfig>({
    seed: 7,
    a: 1664525,
    c: 1013904223,
    m: 4294967296,
    count: 1000,
  });

  const [mcgConfig, setMcgConfig] = useState<MCGConfig>({
    seed: 7,
    a: 16807,
    m: 2147483647,
    count: 1000,
  });

  const [msConfig, setMsConfig] = useState<MSConfig>({
    seed: 1234,
    iterations: 1000,
  });

  const [comparison, setComparison] = useState<CompareEntry[] | null>(null);
  const [activeChartTab, setActiveChartTab] = useState<'chi' | 'ks' | 'poker'>('chi');
  const [expandedChart, setExpandedChart] = useState<{ test: 'chi' | 'ks' | 'poker'; generator: string; entry: CompareEntry } | null>(null);

  const comparisonColumns = [
    {
      label: 'Prueba',
      tip: 'Prueba estadística aplicada para evaluar la calidad de la secuencia.',
      className: 'w-48',
    },
  ];

  const riColumns = [
    { label: 'i', tip: 'Índice de la observación dentro de la secuencia.', className: 'w-16' },
    { label: 'Ri LCG', tip: 'Valor normalizado generado por el método LCG.', className: 'text-center' },
    { label: 'Ri MCG', tip: 'Valor normalizado generado por el método MCG.', className: 'text-center' },
    {
      label: 'Ri C. Medios',
      tip: 'Valor normalizado generado por el método de Cuadrados Medios.',
      className: 'text-center',
    },
  ];

  const handleCompare = () => {
    try {
      const entries: CompareEntry[] = [];

      const lcgResult = lcg.generate({
        seed: lcgConfig.seed,
        a: lcgConfig.a,
        c: lcgConfig.c,
        m: lcgConfig.m,
        count: lcgConfig.count,
      });
      entries.push({
        name: 'LCG',
        result: lcgResult,
        chi: chiSquareTest(lcgResult.normalized),
        ks: ksTest(lcgResult.normalized),
        poker: lcgConfig.count >= 5 ? pokerTest(lcgResult.normalized) : null,
      });

      const mcgSeed = mcgConfig.seed === 0 ? 1 : mcgConfig.seed;
      const mcgResult = mcg.generate({
        seed: mcgSeed,
        a: mcgConfig.a,
        m: mcgConfig.m,
        count: mcgConfig.count,
      });
      entries.push({
        name: 'MCG',
        result: mcgResult,
        chi: chiSquareTest(mcgResult.normalized),
        ks: ksTest(mcgResult.normalized),
        poker: mcgConfig.count >= 5 ? pokerTest(mcgResult.normalized) : null,
      });

      const msSeed = Math.max(msConfig.seed, 10);
      const msResult = middleSquare.generate({
        seed: msSeed,
        iterations: msConfig.iterations,
        d: 4,
      });
      entries.push({
        name: 'Cuadrados Medios',
        result: msResult,
        chi: chiSquareTest(msResult.normalized),
        ks: ksTest(msResult.normalized),
        poker: msConfig.iterations >= 5 ? pokerTest(msResult.normalized) : null,
      });

      setComparison(entries);
      toast.success('Comparación completada', {
        description: '3 generadores evaluados con pruebas estadísticas.',
      });
    } catch (e) {
      const msg = (e as Error).message;
      setComparison(null);
      toast.error('Error en comparación', { description: msg });
    }
  };

  const PassBadge = ({ pass }: { pass: boolean }) =>
    pass ? (
      <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200 text-xs">
        <CheckCircle2 className="h-3 w-3 mr-1" /> Aprobada
      </Badge>
    ) : (
      <Badge variant="destructive" className="text-xs">
        <XCircle className="h-3 w-3 mr-1" /> Rechazada
      </Badge>
    );

  const openExpandedChart = (test: 'chi' | 'ks' | 'poker', entry: CompareEntry) => {
    setExpandedChart({ test, generator: entry.name, entry });
  };

  const renderChiChart = (entry: CompareEntry, expanded: boolean = false) => {
    const details = entry.chi.details as ChiSquareDetails;
    const chartData = details.observed.map((o, i) => ({
      bin: `${(i / details.bins).toFixed(1)}-${((i + 1) / details.bins).toFixed(1)}`,
      Observado: o,
      Esperado: Math.round(details.expected[i] * 100) / 100,
    }));

    return (
      <ResponsiveContainer width="100%" height={expanded ? 560 : 120}>
        <BarChart data={chartData} margin={{ top: 5, right: 5, left: -20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="bin" tick={{ fontSize: expanded ? 12 : 7 }} />
          <YAxis tick={{ fontSize: expanded ? 12 : 7 }} />
          <RechartsTooltip />
          <Bar dataKey="Observado" fill="var(--color-chart-1)" />
          <Bar dataKey="Esperado" fill="var(--color-chart-2)" />
        </BarChart>
      </ResponsiveContainer>
    );
  };

  const renderKSChart = (entry: CompareEntry, expanded: boolean = false) => {
    const details = entry.ks.details as KSDetails;
    const n = details.n;
    const chartData = details.sortedValues.slice(0, expanded ? 500 : 200).map((v, i) => ({
      i: i + 1,
      Empirica: (i + 1) / n,
      Teorica: v,
    }));

    return (
      <ResponsiveContainer width="100%" height={expanded ? 560 : 120}>
        <LineChart data={chartData} margin={{ top: 5, right: 5, left: -20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="i" tick={{ fontSize: expanded ? 12 : 7 }} />
          <YAxis domain={[0, 1]} tick={{ fontSize: expanded ? 12 : 7 }} />
          <RechartsTooltip />
          <Line type="stepAfter" dataKey="Empirica" stroke="var(--color-chart-1)" dot={false} strokeWidth={1.5} />
          <Line type="monotone" dataKey="Teorica" stroke="var(--color-chart-2)" dot={false} strokeWidth={1.5} />
          <ReferenceLine y={0} stroke="#666" />
        </LineChart>
      </ResponsiveContainer>
    );
  };

  const renderPokerChart = (entry: CompareEntry, expanded: boolean = false) => {
    if (!entry.poker) return <p className="text-xs text-muted-foreground">N/A</p>;

    const details = entry.poker.details as PokerDetails;
    const chartData = details.handCounts
      .filter((h) => h.observed > 0 || h.expected > 0.5)
      .map((h) => ({
        name: h.name.split(' (')[0],
        Observado: h.observed,
        Esperado: Math.round(h.expected * 100) / 100,
      }));

    return (
      <ResponsiveContainer width="100%" height={expanded ? 560 : 120}>
        <BarChart data={chartData} margin={{ top: 5, right: 5, left: -20, bottom: expanded ? 72 : 5 }}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="name" tick={{ fontSize: expanded ? 12 : 6 }} angle={-30} textAnchor="end" height={expanded ? 84 : 40} />
          <YAxis tick={{ fontSize: expanded ? 12 : 7 }} />
          <RechartsTooltip />
          <Bar dataKey="Observado" fill="var(--color-chart-1)" />
          <Bar dataKey="Esperado" fill="var(--color-chart-2)" />
        </BarChart>
      </ResponsiveContainer>
    );
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Parámetros de los Generadores</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Configura los parámetros para cada generador y ejecuta la comparación.
          </p>

          <Tabs defaultValue="lcg" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="lcg">LCG</TabsTrigger>
              <TabsTrigger value="mcg">MCG</TabsTrigger>
              <TabsTrigger value="ms">Cuadrados Medios</TabsTrigger>
            </TabsList>

            <TabsContent value="lcg" className="space-y-3 mt-4">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label className="text-xs">Semilla (X₀)</Label>
                  <FormattedNumberInput
                    value={lcgConfig.seed}
                    onChange={(v) => setLcgConfig((c) => ({ ...c, seed: v }))}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs">Multiplicador (a)</Label>
                  <FormattedNumberInput
                    value={lcgConfig.a}
                    onChange={(v) => setLcgConfig((c) => ({ ...c, a: v }))}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs">Incremento (c)</Label>
                  <FormattedNumberInput
                    value={lcgConfig.c}
                    onChange={(v) => setLcgConfig((c) => ({ ...c, c: v }))}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs">Módulo (m)</Label>
                  <FormattedNumberInput
                    value={lcgConfig.m}
                    onChange={(v) => setLcgConfig((c) => ({ ...c, m: v }))}
                  />
                </div>
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs">Cantidad (N)</Label>
                <FormattedNumberInput
                  value={lcgConfig.count}
                  onChange={(v) => setLcgConfig((c) => ({ ...c, count: Math.max(5, Math.min(v, 10000)) }))}
                  min={5}
                  max={10000}
                />
              </div>
            </TabsContent>

            <TabsContent value="mcg" className="space-y-3 mt-4">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label className="text-xs">Semilla (X₀)</Label>
                  <FormattedNumberInput
                    value={mcgConfig.seed}
                    onChange={(v) => setMcgConfig((c) => ({ ...c, seed: v }))}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs">Multiplicador (a)</Label>
                  <FormattedNumberInput
                    value={mcgConfig.a}
                    onChange={(v) => setMcgConfig((c) => ({ ...c, a: v }))}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs">Módulo (m)</Label>
                  <FormattedNumberInput
                    value={mcgConfig.m}
                    onChange={(v) => setMcgConfig((c) => ({ ...c, m: v }))}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs">Cantidad (N)</Label>
                  <FormattedNumberInput
                    value={mcgConfig.count}
                    onChange={(v) => setMcgConfig((c) => ({ ...c, count: Math.max(5, Math.min(v, 10000)) }))}
                    min={5}
                    max={10000}
                  />
                </div>
              </div>
            </TabsContent>

            <TabsContent value="ms" className="space-y-3 mt-4">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label className="text-xs">Semilla</Label>
                  <FormattedNumberInput
                    value={msConfig.seed}
                    onChange={(v) => setMsConfig((c) => ({ ...c, seed: v }))}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs">Iteraciones</Label>
                  <FormattedNumberInput
                    value={msConfig.iterations}
                    onChange={(v) => setMsConfig((c) => ({ ...c, iterations: Math.max(5, Math.min(v, 10000)) }))}
                    min={5}
                    max={10000}
                  />
                </div>
              </div>
            </TabsContent>
          </Tabs>

          <Button onClick={handleCompare} className="w-full">
            Comparar
          </Button>
        </CardContent>
      </Card>

      {comparison && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Resultados de la Comparación</CardTitle>
          </CardHeader>
          <CardContent>
            <ScrollArea className="w-full">
              <Table>
                <TableHeader>
                  <TableRow>
                    {comparisonColumns.map((col) => (
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
                    {comparison.map((e) => (
                      <TableHead key={e.name} className="text-center min-w-[180px]">
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <span className="inline-flex cursor-help items-center">{e.name}</span>
                          </TooltipTrigger>
                          <TooltipContent side="top" className="max-w-[220px]">
                            <p className="text-xs">Resultados del generador {e.name} para cada prueba estadística.</p>
                          </TooltipContent>
                        </Tooltip>
                      </TableHead>
                    ))}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <TableRow>
                    <TableCell className="font-medium">Chi-Cuadrada (χ²)</TableCell>
                    {comparison.map((e) => (
                      <TableCell key={e.name} className="text-center">
                        <div className="flex flex-col items-center gap-1">
                          <PassBadge pass={e.chi.pass} />
                          <span className="text-xs font-mono">
                            χ² = {e.chi.statistic.toFixed(2)} / {e.chi.criticalValue}
                          </span>
                        </div>
                      </TableCell>
                    ))}
                  </TableRow>

                  <TableRow>
                    <TableCell className="font-medium">Kolmogorov-Smirnov</TableCell>
                    {comparison.map((e) => (
                      <TableCell key={e.name} className="text-center">
                        <div className="flex flex-col items-center gap-1">
                          <PassBadge pass={e.ks.pass} />
                          <span className="text-xs font-mono">
                            D = {e.ks.statistic.toFixed(4)} / {e.ks.criticalValue}
                          </span>
                        </div>
                      </TableCell>
                    ))}
                  </TableRow>

                  <TableRow>
                    <TableCell className="font-medium">Poker</TableCell>
                    {comparison.map((e) => (
                      <TableCell key={e.name} className="text-center">
                        {e.poker ? (
                          <div className="flex flex-col items-center gap-1">
                            <PassBadge pass={e.poker.pass} />
                            <span className="text-xs font-mono">
                              χ² = {e.poker.statistic.toFixed(2)} / {e.poker.criticalValue}
                            </span>
                          </div>
                        ) : (
                          <span className="text-xs text-muted-foreground">N/A</span>
                        )}
                      </TableCell>
                    ))}
                  </TableRow>

                  <TableRow>
                    <TableCell className="font-medium">Resultado Global</TableCell>
                    {comparison.map((e) => {
                      const allPass = e.chi.pass && e.ks.pass && (e.poker?.pass ?? true);
                      return (
                        <TableCell key={e.name} className="text-center">
                          <Badge
                            className={
                              allPass
                                ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                                : 'bg-red-100 text-red-800'
                            }
                          >
                            {allPass ? 'Todas Aprobadas' : 'Alguna Rechazada'}
                          </Badge>
                        </TableCell>
                      );
                    })}
                  </TableRow>
                </TableBody>
              </Table>
            </ScrollArea>
          </CardContent>
        </Card>
      )}

      {comparison && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Valores Ri Generados</CardTitle>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[250px]">
              <Table>
                <TableHeader>
                  <TableRow>
                    {riColumns.map((col) => (
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
                  {comparison[0].result.normalized.slice(0, 200).map((_, i) => (
                    <TableRow key={i}>
                      <TableCell className="font-mono text-xs">{i + 1}</TableCell>
                      <TableCell className="font-mono text-xs text-center">
                        {comparison[0].result.normalized[i]?.toFixed(4) ?? '-'}
                      </TableCell>
                      <TableCell className="font-mono text-xs text-center">
                        {comparison[1].result.normalized[i]?.toFixed(4) ?? '-'}
                      </TableCell>
                      <TableCell className="font-mono text-xs text-center">
                        {comparison[2].result.normalized[i]?.toFixed(4) ?? '-'}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              {comparison[0].result.normalized.length > 200 && (
                <p className="text-xs text-muted-foreground mt-2 text-center">
                  Mostrando 200 de {comparison[0].result.normalized.length} filas
                </p>
              )}
            </ScrollArea>
          </CardContent>
        </Card>
      )}

      {comparison && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Gráficas de Pruebas</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Tabs
              value={activeChartTab}
              onValueChange={(v) => setActiveChartTab(v as 'chi' | 'ks' | 'poker')}
            >
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="chi">Chi-Cuadrada</TabsTrigger>
                <TabsTrigger value="ks">K-S</TabsTrigger>
                <TabsTrigger value="poker">Poker</TabsTrigger>
              </TabsList>

              <TabsContent value="chi" className="mt-4 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {comparison.map((e) => (
                    <Card key={e.name} className="p-3">
                      <CardHeader className="pb-2">
                        <div className="flex items-center justify-between">
                          <CardTitle className="text-sm">{e.name}</CardTitle>
                          <div className="flex items-center gap-1">
                            <PassBadge pass={e.chi.pass} />
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-7 w-7"
                              onClick={() => openExpandedChart('chi', e)}
                              aria-label={`Expandir grafica Chi-Cuadrada de ${e.name}`}
                              title="Expandir grafica"
                            >
                              <Maximize2 className="h-3.5 w-3.5" />
                            </Button>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="cursor-pointer" onClick={() => openExpandedChart('chi', e)}>
                          {renderChiChart(e, false)}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </TabsContent>

              <TabsContent value="ks" className="mt-4 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {comparison.map((e) => (
                    <Card key={e.name} className="p-3">
                      <CardHeader className="pb-2">
                        <div className="flex items-center justify-between">
                          <CardTitle className="text-sm">{e.name}</CardTitle>
                          <div className="flex items-center gap-1">
                            <PassBadge pass={e.ks.pass} />
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-7 w-7"
                              onClick={() => openExpandedChart('ks', e)}
                              aria-label={`Expandir grafica KS de ${e.name}`}
                              title="Expandir grafica"
                            >
                              <Maximize2 className="h-3.5 w-3.5" />
                            </Button>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="cursor-pointer" onClick={() => openExpandedChart('ks', e)}>
                          {renderKSChart(e, false)}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </TabsContent>

              <TabsContent value="poker" className="mt-4 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {comparison.map((e) => (
                    <Card key={e.name} className="p-3">
                      <CardHeader className="pb-2">
                        <div className="flex items-center justify-between">
                          <CardTitle className="text-sm">{e.name}</CardTitle>
                          <div className="flex items-center gap-1">
                            {e.poker ? <PassBadge pass={e.poker.pass} /> : <span className="text-xs text-muted-foreground">N/A</span>}
                            {e.poker ? (
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-7 w-7"
                                onClick={() => openExpandedChart('poker', e)}
                                aria-label={`Expandir grafica Poker de ${e.name}`}
                                title="Expandir grafica"
                              >
                                <Maximize2 className="h-3.5 w-3.5" />
                              </Button>
                            ) : null}
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent className={!e.poker ? 'flex items-center justify-center' : ''}>
                        {e.poker ? (
                          <div className="cursor-pointer" onClick={() => openExpandedChart('poker', e)}>
                            {renderPokerChart(e, false)}
                          </div>
                        ) : (
                          <span className="text-xs text-muted-foreground">N/A</span>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </TabsContent>

              {expandedChart && (
                <Dialog open={true} onOpenChange={(open) => !open && setExpandedChart(null)}>
                  <DialogContent className="w-[95vw] max-w-[95vw] h-[92vh] p-0 gap-0 flex flex-col">
                    <DialogHeader className="px-6 py-4 border-b border-border">
                      <DialogTitle>
                        {expandedChart.generator} - {expandedChart.test === 'chi' ? 'Chi-Cuadrada' : expandedChart.test === 'ks' ? 'Kolmogorov-Smirnov' : 'Poker'}
                      </DialogTitle>
                    </DialogHeader>
                    <div className="flex-1 min-h-0 overflow-auto p-6">
                      {expandedChart.test === 'chi' && renderChiChart(expandedChart.entry, true)}
                      {expandedChart.test === 'ks' && renderKSChart(expandedChart.entry, true)}
                      {expandedChart.test === 'poker' && renderPokerChart(expandedChart.entry, true)}
                    </div>
                  </DialogContent>
                </Dialog>
              )}
            </Tabs>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

export default CompareTab;
