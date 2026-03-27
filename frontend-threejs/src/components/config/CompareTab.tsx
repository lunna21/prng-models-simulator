import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
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
import { lcg, mcg, middleSquare } from '@/lib/generators';
import type { GeneratorResult } from '@/lib/generators/types';
import { chiSquareTest, ksTest, pokerTest } from '@/lib/tests';
import type { TestResult } from '@/lib/tests/types';
import type { ChiSquareDetails, KSDetails, PokerDetails } from '@/lib/tests/types';
import { CheckCircle2, XCircle } from 'lucide-react';
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

export function CompareTab() {
  const [seed, setSeed] = useState(7);
  const [count, setCount] = useState(1000);
  const [comparison, setComparison] = useState<CompareEntry[] | null>(null);
  const [activeChartTab, setActiveChartTab] = useState<'chi' | 'ks' | 'poker'>('chi');
  const [expandedChart, setExpandedChart] = useState<{ test: 'chi' | 'ks' | 'poker'; generator: string; entry: CompareEntry } | null>(null);

  const handleCompare = () => {
    try {
      setError(null);
      const entries: CompareEntry[] = [];

      // LCG
      const lcgResult = lcg.generate({ seed, a: 1664525, c: 1013904223, m: Math.pow(2, 32), count });
      entries.push({
        name: 'LCG',
        result: lcgResult,
        chi: chiSquareTest(lcgResult.normalized),
        ks: ksTest(lcgResult.normalized),
        poker: count >= 5 ? pokerTest(lcgResult.normalized) : null,
      });

      // MCG
      const mcgSeed = seed === 0 ? 1 : seed;
      const mcgResult = mcg.generate({ seed: mcgSeed, a: 16807, m: 2147483647, count });
      entries.push({
        name: 'MCG',
        result: mcgResult,
        chi: chiSquareTest(mcgResult.normalized),
        ks: ksTest(mcgResult.normalized),
        poker: count >= 5 ? pokerTest(mcgResult.normalized) : null,
      });

      // Middle-Square
      const msSeed = Math.max(seed, 10); // at least 2 digits
      const msResult = middleSquare.generate({ seed: msSeed, iterations: count });
      entries.push({
        name: 'Cuadrados Medios',
        result: msResult,
        chi: chiSquareTest(msResult.normalized),
        ks: ksTest(msResult.normalized),
        poker: count >= 5 ? pokerTest(msResult.normalized) : null,
      });

      setComparison(entries);
    } catch (e) {
      setError((e as Error).message);
      setComparison(null);
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

  const renderChiChart = (entry: CompareEntry, expanded: boolean = false) => {
    const details = entry.chi.details as ChiSquareDetails;
    const chartData = details.observed.map((o, i) => ({
      bin: `${(i / details.bins).toFixed(1)}-${((i + 1) / details.bins).toFixed(1)}`,
      Observado: o,
      Esperado: Math.round(details.expected[i] * 100) / 100,
    }));

    return (
      <ResponsiveContainer width="100%" height={expanded ? 300 : 120}>
        <BarChart data={chartData} margin={{ top: 5, right: 5, left: -20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="bin" tick={{ fontSize: expanded ? 10 : 7 }} />
          <YAxis tick={{ fontSize: expanded ? 10 : 7 }} />
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
      <ResponsiveContainer width="100%" height={expanded ? 300 : 120}>
        <LineChart data={chartData} margin={{ top: 5, right: 5, left: -20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="i" tick={{ fontSize: expanded ? 10 : 7 }} />
          <YAxis domain={[0, 1]} tick={{ fontSize: expanded ? 10 : 7 }} />
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
      <ResponsiveContainer width="100%" height={expanded ? 300 : 120}>
        <BarChart data={chartData} margin={{ top: 5, right: 5, left: -20, bottom: expanded ? 40 : 5 }}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="name" tick={{ fontSize: expanded ? 10 : 6 }} angle={-30} textAnchor="end" height={expanded ? 50 : 40} />
          <YAxis tick={{ fontSize: expanded ? 10 : 7 }} />
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
          <CardTitle className="text-base">Comparar Generadores</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Ejecuta los tres generadores con la misma semilla y compara los resultados
            de las pruebas estadisticas.
          </p>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <Label className="text-xs">Semilla</Label>
              <Input
                type="number"
                value={seed}
                onChange={(e) => setSeed(parseInt(e.target.value) || 0)}
              />
            </div>
            <div className="space-y-1">
              <Label className="text-xs">Cantidad (N)</Label>
              <Input
                type="number"
                value={count}
                onChange={(e) => setCount(parseInt(e.target.value) || 100)}
                min={5}
                max={10000}
              />
            </div>
          </div>
          <Button onClick={handleCompare}>Comparar</Button>
          {error && <p className="text-sm text-destructive">{error}</p>}
        </CardContent>
      </Card>

      {comparison && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Resultados de la Comparacion</CardTitle>
          </CardHeader>
          <CardContent>
            <ScrollArea className="w-full">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-48">Prueba</TableHead>
                    {comparison.map((e) => (
                      <TableHead key={e.name} className="text-center min-w-[180px]">
                        {e.name}
                      </TableHead>
                    ))}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {/* Chi-Square */}
                  <TableRow>
                    <TableCell className="font-medium">Chi-Cuadrada (χ²)</TableCell>
                    {comparison.map((e) => (
                      <TableCell key={e.name} className="text-center">
                        <div className="flex flex-col items-center gap-1">
                          <PassBadge pass={e.chi.pass} />
                          <span className="text-xs font-mono">
                            χ² = {e.chi.statistic} / {e.chi.criticalValue}
                          </span>
                        </div>
                      </TableCell>
                    ))}
                  </TableRow>

                  {/* K-S */}
                  <TableRow>
                    <TableCell className="font-medium">Kolmogorov-Smirnov</TableCell>
                    {comparison.map((e) => (
                      <TableCell key={e.name} className="text-center">
                        <div className="flex flex-col items-center gap-1">
                          <PassBadge pass={e.ks.pass} />
                          <span className="text-xs font-mono">
                            D = {e.ks.statistic} / {e.ks.criticalValue}
                          </span>
                        </div>
                      </TableCell>
                    ))}
                  </TableRow>

                  {/* Poker */}
                  <TableRow>
                    <TableCell className="font-medium">Poker</TableCell>
                    {comparison.map((e) => (
                      <TableCell key={e.name} className="text-center">
                        {e.poker ? (
                          <div className="flex flex-col items-center gap-1">
                            <PassBadge pass={e.poker.pass} />
                            <span className="text-xs font-mono">
                              χ² = {e.poker.statistic} / {e.poker.criticalValue}
                            </span>
                          </div>
                        ) : (
                          <span className="text-xs text-muted-foreground">N/A</span>
                        )}
                      </TableCell>
                    ))}
                  </TableRow>

                  {/* Summary */}
                  <TableRow>
                    <TableCell className="font-medium">Resultado Global</TableCell>
                    {comparison.map((e) => {
                      const allPass =
                        e.chi.pass && e.ks.pass && (e.poker?.pass ?? true);
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
                    <TableHead className="w-16">i</TableHead>
                    <TableHead className="text-center">Ri LCG</TableHead>
                    <TableHead className="text-center">Ri MCG</TableHead>
                    <TableHead className="text-center">Ri C. Medios</TableHead>
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
                          <PassBadge pass={e.chi.pass} />
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="cursor-pointer" onClick={() => setExpandedChart({ test: 'chi', generator: e.name, entry: e })}>
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
                          <PassBadge pass={e.ks.pass} />
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="cursor-pointer" onClick={() => setExpandedChart({ test: 'ks', generator: e.name, entry: e })}>
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
                          {e.poker ? <PassBadge pass={e.poker.pass} /> : <span className="text-xs text-muted-foreground">N/A</span>}
                        </div>
                      </CardHeader>
                      <CardContent className={!e.poker ? 'flex items-center justify-center' : ''}>
                        {e.poker ? (
                          <div className="cursor-pointer" onClick={() => setExpandedChart({ test: 'poker', generator: e.name, entry: e })}>
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
                  <DialogContent className="max-w-4xl max-h-[90vh]">
                    <DialogHeader>
                      <DialogTitle>
                        {expandedChart.generator} - {expandedChart.test === 'chi' ? 'Chi-Cuadrada' : expandedChart.test === 'ks' ? 'Kolmogorov-Smirnov' : 'Poker'}
                      </DialogTitle>
                    </DialogHeader>
                    <div className="overflow-auto">
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
