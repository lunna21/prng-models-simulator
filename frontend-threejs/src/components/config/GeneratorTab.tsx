import { useMemo } from 'react';
import { useStore } from '@/store/store';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Separator } from '@/components/ui/separator';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, ReferenceLine } from 'recharts';
import type { GeneratorType } from '@/lib/generators/types';
import type { ChiSquareDetails, KSDetails, PokerDetails } from '@/lib/tests/types';
import { CheckCircle2, XCircle, AlertTriangle, Sparkles } from 'lucide-react';
import { EducationalHelp } from './EducationalHelp';
import { validateLCG, validateMCG } from '@/lib/generators/validation';

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
  const generatorError = useStore((s) => s.generatorError);
  const runTests = useStore((s) => s.runTests);
  const chiSquareResult = useStore((s) => s.chiSquareResult);
  const ksResult = useStore((s) => s.ksResult);
  const pokerResult = useStore((s) => s.pokerResult);
  const testError = useStore((s) => s.testError);

  const lcgValidation = useMemo(
    () => validateLCG(lcgConfig.a, lcgConfig.c, lcgConfig.m),
    [lcgConfig.a, lcgConfig.c, lcgConfig.m],
  );

  const mcgValidation = useMemo(
    () => validateMCG(mcgConfig.a, mcgConfig.m, mcgConfig.seed),
    [mcgConfig.a, mcgConfig.m, mcgConfig.seed],
  );

  const suggestLCGParams = () => {
    setLCGConfig({ a: 1664525, c: 1013904223, m: 4294967296, seed: 1 });
  };

  const suggestMCGParams = () => {
    setMCGConfig({ a: 48271, m: 2147483647, seed: 1 });
  };

  return (
    <div className="space-y-6">
      {/* Generator Config */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center justify-between">
              <span>Parámetros del Generador</span>
              <EducationalHelp generatorType={generatorType} />
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Tipo de Generador</Label>
              <Select
                value={generatorType}
                onValueChange={(v) => setGeneratorType(v as GeneratorType)}
              >
                <SelectTrigger>
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
                  <div className="space-y-1">
                    <Label className="text-xs">Semilla (X₀)</Label>
                    <Input
                      type="number"
                      value={lcgConfig.seed}
                      onChange={(e) => setLCGConfig({ seed: parseInt(e.target.value) || 0 })}
                    />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs">Multiplicador (a)</Label>
                    <Input
                      type="number"
                      value={lcgConfig.a}
                      onChange={(e) => setLCGConfig({ a: parseInt(e.target.value) || 0 })}
                    />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs">Incremento (c)</Label>
                    <Input
                      type="number"
                      value={lcgConfig.c}
                      onChange={(e) => setLCGConfig({ c: parseInt(e.target.value) || 0 })}
                    />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs">Modulo (m)</Label>
                    <Input
                      type="number"
                      value={lcgConfig.m}
                      onChange={(e) => setLCGConfig({ m: parseInt(e.target.value) || 1 })}
                    />
                  </div>
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">Cantidad (N)</Label>
                  <Input
                    type="number"
                    value={lcgConfig.count}
                    onChange={(e) => setLCGConfig({ count: parseInt(e.target.value) || 1 })}
                    min={1}
                    max={10000}
                  />
                </div>

                {/* LCG Validation */}
                <div className="rounded-lg border p-3 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-medium">Período máximo (Hull-Dobell)</span>
                    {lcgValidation.hasFullPeriod ? (
                      <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200 text-xs">
                        <CheckCircle2 className="h-3 w-3 mr-1" /> Garantizado
                      </Badge>
                    ) : (
                      <Badge variant="secondary" className="text-xs">
                        <AlertTriangle className="h-3 w-3 mr-1" /> No garantizado
                      </Badge>
                    )}
                  </div>
                  <div className="space-y-1.5">
                    {lcgValidation.checks.map((check, i) => (
                      <div key={i} className="flex items-start gap-2 text-xs">
                        {check.passed ? (
                          <CheckCircle2 className="h-3.5 w-3.5 text-green-500 mt-0.5 shrink-0" />
                        ) : (
                          <XCircle className="h-3.5 w-3.5 text-destructive mt-0.5 shrink-0" />
                        )}
                        <span className="text-muted-foreground">{check.message}</span>
                      </div>
                    ))}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    Período: <span className="font-mono">{lcgValidation.currentPeriod}</span>
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
              </>
            )}

            {/* MCG params */}
            {generatorType === 'mcg' && (
              <>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <Label className="text-xs">Semilla (X₀)</Label>
                    <Input
                      type="number"
                      value={mcgConfig.seed}
                      onChange={(e) => setMCGConfig({ seed: parseInt(e.target.value) || 0 })}
                    />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs">Multiplicador (a)</Label>
                    <Input
                      type="number"
                      value={mcgConfig.a}
                      onChange={(e) => setMCGConfig({ a: parseInt(e.target.value) || 0 })}
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <Label className="text-xs">Modulo (m)</Label>
                    <Input
                      type="number"
                      value={mcgConfig.m}
                      onChange={(e) => setMCGConfig({ m: parseInt(e.target.value) || 1 })}
                    />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs">Cantidad (N)</Label>
                    <Input
                      type="number"
                      value={mcgConfig.count}
                      onChange={(e) => setMCGConfig({ count: parseInt(e.target.value) || 1 })}
                      min={1}
                      max={10000}
                    />
                  </div>
                </div>

                {/* MCG Validation */}
                <div className="rounded-lg border p-3 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-medium">Período máximo (MCG)</span>
                    {mcgValidation.hasFullPeriod ? (
                      <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200 text-xs">
                        <CheckCircle2 className="h-3 w-3 mr-1" /> Garantizado
                      </Badge>
                    ) : (
                      <Badge variant="secondary" className="text-xs">
                        <AlertTriangle className="h-3 w-3 mr-1" /> No garantizado
                      </Badge>
                    )}
                  </div>
                  <div className="space-y-1.5">
                    {mcgValidation.checks.map((check, i) => (
                      <div key={i} className="flex items-start gap-2 text-xs">
                        {check.passed ? (
                          <CheckCircle2 className="h-3.5 w-3.5 text-green-500 mt-0.5 shrink-0" />
                        ) : (
                          <XCircle className="h-3.5 w-3.5 text-destructive mt-0.5 shrink-0" />
                        )}
                        <span className="text-muted-foreground">{check.message}</span>
                      </div>
                    ))}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    Período: <span className="font-mono">{mcgValidation.currentPeriod}</span>
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
              </>
            )}

            {/* Middle-Square params */}
            {generatorType === 'middle-square' && (
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <Label className="text-xs">Semilla</Label>
                  <Input
                    type="number"
                    value={msConfig.seed}
                    onChange={(e) => setMSConfig({ seed: parseInt(e.target.value) || 0 })}
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">Iteraciones</Label>
                  <Input
                    type="number"
                    value={msConfig.iterations}
                    onChange={(e) => setMSConfig({ iterations: parseInt(e.target.value) || 1 })}
                    min={1}
                    max={10000}
                  />
                </div>
              </div>
            )}

            <div className="flex gap-2">
              <Button onClick={generate} className="flex-1">
                Generar
              </Button>
              <Button
                variant="secondary"
                onClick={runTests}
                disabled={!generatorResult}
              >
                Ejecutar Pruebas
              </Button>
            </div>

            {generatorError && (
              <p className="text-sm text-destructive">{generatorError}</p>
            )}
          </CardContent>
        </Card>

        {/* Sequence Chart */}
        {generatorResult && (
          <Card>
            <CardHeader>
              <CardTitle className="text-base">
                Secuencia Generada ({generatorResult.normalized.length} valores)
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={200}>
                <LineChart
                  data={generatorResult.normalized.slice(0, 500).map((v, i) => ({
                    i: i + 1,
                    r: v,
                  }))}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="i" tick={{ fontSize: 10 }} />
                  <YAxis domain={[0, 1]} tick={{ fontSize: 10 }} />
                  <Tooltip />
                  <Line
                    type="monotone"
                    dataKey="r"
                    stroke="var(--color-primary)"
                    dot={false}
                    strokeWidth={1}
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Sequence Table */}
      {generatorResult && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Tabla de Resultados</CardTitle>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[250px]">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-16">N</TableHead>
                    <TableHead>Xₙ</TableHead>
                    <TableHead>Formula</TableHead>
                    <TableHead>Xₙ₊₁</TableHead>
                    <TableHead>Rᵢ</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {generatorResult.steps.slice(0, 200).map((step) => (
                    <TableRow key={step.iteration}>
                      <TableCell className="font-mono text-xs">{step.iteration}</TableCell>
                      <TableCell className="font-mono text-xs">{step.xPrev}</TableCell>
                      <TableCell className="font-mono text-xs">{step.formula}</TableCell>
                      <TableCell className="font-mono text-xs">{step.xNext}</TableCell>
                      <TableCell className="font-mono text-xs">{step.normalized}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              {generatorResult.steps.length > 200 && (
                <p className="text-xs text-muted-foreground mt-2 text-center">
                  Mostrando 200 de {generatorResult.steps.length} filas
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
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Chi-Square */}
            {chiSquareResult && (
              <Card>
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-sm">{chiSquareResult.testName}</CardTitle>
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
                    <span className="text-muted-foreground">Estadistico:</span>
                    <span className="font-mono">{chiSquareResult.statistic}</span>
                    <span className="text-muted-foreground">Valor critico:</span>
                    <span className="font-mono">{chiSquareResult.criticalValue}</span>
                  </div>
                  <ResponsiveContainer width="100%" height={120}>
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
                      <XAxis dataKey="bin" tick={{ fontSize: 8 }} />
                      <YAxis tick={{ fontSize: 8 }} />
                      <Tooltip />
                      <Bar dataKey="Observado" fill="var(--color-chart-1)" />
                      <Bar dataKey="Esperado" fill="var(--color-chart-2)" />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            )}

            {/* K-S */}
            {ksResult && (
              <Card>
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-sm">{ksResult.testName}</CardTitle>
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
                    <span className="text-muted-foreground">Valor critico:</span>
                    <span className="font-mono">{ksResult.criticalValue}</span>
                    <span className="text-muted-foreground">D+:</span>
                    <span className="font-mono">{(ksResult.details as KSDetails).dPlus}</span>
                    <span className="text-muted-foreground">D-:</span>
                    <span className="font-mono">{(ksResult.details as KSDetails).dMinus}</span>
                  </div>
                  <ResponsiveContainer width="100%" height={120}>
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
                      <XAxis dataKey="i" tick={{ fontSize: 8 }} />
                      <YAxis domain={[0, 1]} tick={{ fontSize: 8 }} />
                      <Tooltip />
                      <Line type="stepAfter" dataKey="Empirica" stroke="var(--color-chart-1)" dot={false} strokeWidth={1.5} />
                      <Line type="monotone" dataKey="Teorica" stroke="var(--color-chart-2)" dot={false} strokeWidth={1.5} />
                      <ReferenceLine y={0} stroke="#666" />
                    </LineChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            )}

            {/* Poker */}
            {pokerResult && (
              <Card>
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-sm">{pokerResult.testName}</CardTitle>
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
                    <span className="text-muted-foreground">Estadistico:</span>
                    <span className="font-mono">{pokerResult.statistic}</span>
                    <span className="text-muted-foreground">Valor critico:</span>
                    <span className="font-mono">{pokerResult.criticalValue}</span>
                    <span className="text-muted-foreground">Manos:</span>
                    <span className="font-mono">{(pokerResult.details as PokerDetails).totalHands}</span>
                  </div>
                  <ResponsiveContainer width="100%" height={120}>
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
                      <YAxis tick={{ fontSize: 8 }} />
                      <Tooltip />
                      <Bar dataKey="Observado" fill="var(--color-chart-1)" />
                      <Bar dataKey="Esperado" fill="var(--color-chart-2)" />
                    </BarChart>
                  </ResponsiveContainer>
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
