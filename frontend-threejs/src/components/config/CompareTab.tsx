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
import { Tooltip, TooltipTrigger, TooltipContent } from '@/components/ui/tooltip';
import { lcg, mcg, middleSquare } from '@/lib/generators';
import type { GeneratorResult } from '@/lib/generators/types';
import { chiSquareTest, ksTest, pokerTest } from '@/lib/tests';
import type { TestResult } from '@/lib/tests/types';
import { CheckCircle2, XCircle, Info } from 'lucide-react';

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

  const handleCompare = () => {
    try {
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
      const msResult = middleSquare.generate({ seed: msSeed, iterations: count, d: 4 });
      entries.push({
        name: 'Cuadrados Medios',
        result: msResult,
        chi: chiSquareTest(msResult.normalized),
        ks: ksTest(msResult.normalized),
        poker: count >= 5 ? pokerTest(msResult.normalized) : null,
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

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Comparar Generadores</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Ejecuta los tres generadores con la misma semilla y compara los resultados
            de las pruebas estadísticas.
          </p>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label className="text-xs flex items-center gap-1">
                Semilla
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Info className="h-3 w-3 text-muted-foreground cursor-help" />
                  </TooltipTrigger>
                  <TooltipContent side="right" className="max-w-[220px]">
                    <p className="text-xs">Valor inicial compartido por los tres generadores para la comparación.</p>
                  </TooltipContent>
                </Tooltip>
              </Label>
              <FormattedNumberInput
                value={seed}
                onChange={(v) => setSeed(v)}
                placeholder="ej. 7"
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs flex items-center gap-1">
                Cantidad (N)
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Info className="h-3 w-3 text-muted-foreground cursor-help" />
                  </TooltipTrigger>
                  <TooltipContent side="right" className="max-w-[220px]">
                    <p className="text-xs">Números a generar por cada modelo. Rango: 5–10,000.</p>
                  </TooltipContent>
                </Tooltip>
              </Label>
              <FormattedNumberInput
                value={count}
                onChange={(v) => setCount(Math.max(5, Math.min(v, 10000)))}
                min={5}
                max={10000}
                placeholder="ej. 1000"
              />
            </div>
          </div>
          <Button onClick={handleCompare}>Comparar</Button>
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
    </div>
  );
}

export default CompareTab;
