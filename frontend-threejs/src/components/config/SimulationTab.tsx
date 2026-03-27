import { useStore } from '@/store/store';
import { Button } from '@/components/ui/button';
import { FormattedDecimalInput } from '@/components/ui/formatted-decimal-input';
import { FormattedNumberInput } from '@/components/ui/formatted-number-input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Tooltip, TooltipTrigger, TooltipContent } from '@/components/ui/tooltip';
import { Info } from 'lucide-react';
import type { DistributionMode } from '@/lib/simulation/types';

export function SimulationTab() {
  const simConfig = useStore((s) => s.simConfig);
  const setSimConfig = useStore((s) => s.setSimConfig);
  const runSim = useStore((s) => s.runSim);
  const simResult = useStore((s) => s.simResult);

  return (
    <div className="space-y-6">
      {/* Configuration */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Parámetros de Simulación</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="text-xs flex items-center gap-1">
                  Núm. de Servidores
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Info className="h-3 w-3 text-muted-foreground cursor-help" />
                    </TooltipTrigger>
                    <TooltipContent side="right" className="max-w-[220px]">
                      <p className="text-xs">Ventanillas de servicio activas (c en M/M/c). Rango: 1–10.</p>
                    </TooltipContent>
                  </Tooltip>
                </Label>
                <FormattedNumberInput
                  value={simConfig.servers}
                  onChange={(v) => setSimConfig({ servers: Math.max(1, Math.min(v, 10)) })}
                  min={1}
                  max={10}
                  placeholder="ej. 2"
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs flex items-center gap-1">
                  Núm. de Clientes
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Info className="h-3 w-3 text-muted-foreground cursor-help" />
                    </TooltipTrigger>
                    <TooltipContent side="right" className="max-w-[220px]">
                      <p className="text-xs">Clientes totales a simular. Genera una secuencia larga si es necesario. Rango: 1–1,000.</p>
                    </TooltipContent>
                  </Tooltip>
                </Label>
                <FormattedNumberInput
                  value={simConfig.customerCount}
                  onChange={(v) => setSimConfig({ customerCount: Math.max(1, Math.min(v, 1000)) })}
                  min={1}
                  max={1000}
                  placeholder="ej. 10"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs flex items-center gap-1">
                Modo de Distribución
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Info className="h-3 w-3 text-muted-foreground cursor-help" />
                  </TooltipTrigger>
                  <TooltipContent side="right" className="max-w-[220px]">
                    <p className="text-xs">Exponencial usa transformada inversa X = -ln(1-U)/λ. Tabla usa distribución discreta predefinida.</p>
                  </TooltipContent>
                </Tooltip>
              </Label>
              <Select
                value={simConfig.distributionMode}
                onValueChange={(v) => setSimConfig({ distributionMode: v as DistributionMode })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="exponential">Exponencial (transformada inversa)</SelectItem>
                  <SelectItem value="table">Tabla de distribución (discreto)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {simConfig.distributionMode === 'exponential' && (
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label className="text-xs flex items-center gap-1">
                    Tasa de llegada (λ)
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Info className="h-3 w-3 text-muted-foreground cursor-help" />
                      </TooltipTrigger>
                      <TooltipContent side="right" className="max-w-[220px]">
                        <p className="text-xs">Llegadas promedio por unidad de tiempo. Debe ser &gt; 0. Para estabilidad: λ &lt; c·μ.</p>
                      </TooltipContent>
                    </Tooltip>
                  </Label>
                  <FormattedDecimalInput
                    value={simConfig.arrivalRate}
                    onChange={(v) => setSimConfig({ arrivalRate: v || 0.1 })}
                    min={0.01}
                    maxDecimals={2}
                    placeholder="ej. 1.5"
                    className={simConfig.arrivalRate <= 0 ? 'border-destructive focus-visible:ring-destructive' : undefined}
                    aria-invalid={simConfig.arrivalRate <= 0}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs flex items-center gap-1">
                    Tasa de servicio (μ)
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Info className="h-3 w-3 text-muted-foreground cursor-help" />
                      </TooltipTrigger>
                      <TooltipContent side="right" className="max-w-[220px]">
                        <p className="text-xs">Servicios completados por servidor por unidad de tiempo. Debe ser &gt; 0.</p>
                      </TooltipContent>
                    </Tooltip>
                  </Label>
                  <FormattedDecimalInput
                    value={simConfig.serviceRate}
                    onChange={(v) => setSimConfig({ serviceRate: v || 0.1 })}
                    min={0.01}
                    maxDecimals={2}
                    placeholder="ej. 2.0"
                    className={simConfig.serviceRate <= 0 ? 'border-destructive focus-visible:ring-destructive' : undefined}
                    aria-invalid={simConfig.serviceRate <= 0}
                  />
                </div>
              </div>
            )}

            {simConfig.distributionMode === 'table' && (
              <p className="text-xs text-muted-foreground">
                Se usarán las tablas de distribución predeterminadas basadas en el archivo
                de referencia CSV.
              </p>
            )}

            <Button onClick={runSim} className="w-full">
              Ejecutar Simulación
            </Button>
          </CardContent>
        </Card>

        {/* Summary Stats */}
        {simResult && (
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Resumen Estadístico</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-3">
                <div className="rounded-lg border border-border p-3">
                  <p className="text-xs text-muted-foreground">Espera Promedio</p>
                  <p className="text-lg font-bold font-mono">
                    {simResult.stats.avgWaitTime.toFixed(2)}
                  </p>
                </div>
                <div className="rounded-lg border border-border p-3">
                  <p className="text-xs text-muted-foreground">Servicio Promedio</p>
                  <p className="text-lg font-bold font-mono">
                    {simResult.stats.avgServiceTime.toFixed(2)}
                  </p>
                </div>
                <div className="rounded-lg border border-border p-3">
                  <p className="text-xs text-muted-foreground">Tiempo en Sistema</p>
                  <p className="text-lg font-bold font-mono">
                    {simResult.stats.avgSystemTime.toFixed(2)}
                  </p>
                </div>
                <div className="rounded-lg border border-border p-3">
                  <p className="text-xs text-muted-foreground">Max Cola</p>
                  <p className="text-lg font-bold font-mono">
                    {simResult.stats.maxQueueLength}
                  </p>
                </div>
                <div className="rounded-lg border border-border p-3">
                  <p className="text-xs text-muted-foreground">Cola Promedio</p>
                  <p className="text-lg font-bold font-mono">
                    {simResult.stats.avgQueueLength.toFixed(2)}
                  </p>
                </div>
                <div className="rounded-lg border border-border p-3">
                  <p className="text-xs text-muted-foreground">Tiempo Total</p>
                  <p className="text-lg font-bold font-mono">
                    {simResult.stats.totalSimulationTime.toFixed(2)}
                  </p>
                </div>
              </div>

              <Separator className="my-3" />

              <div className="space-y-2">
                <p className="text-xs font-medium">Utilización por Servidor</p>
                {simResult.stats.serverUtilization.map((u, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <span className="text-xs text-muted-foreground w-20">
                      Servidor {i + 1}
                    </span>
                    <div className="flex-1 h-4 bg-muted rounded-full overflow-hidden">
                      <div
                        className="h-full bg-primary rounded-full transition-all"
                        style={{ width: `${Math.min(u * 100, 100)}%` }}
                      />
                    </div>
                    <span className="text-xs font-mono w-14 text-right">
                      {(u * 100).toFixed(1)}%
                    </span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Event Log */}
      {simResult && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">
              Registro de Eventos ({simResult.events.length} eventos)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[250px]">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-16">Reloj</TableHead>
                    <TableHead>Evento</TableHead>
                    <TableHead>Acción</TableHead>
                    <TableHead>Próximo Evento</TableHead>
                    <TableHead className="w-16">N(t)</TableHead>
                    <TableHead>Cola</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {simResult.events.map((ev, i) => (
                    <TableRow key={i}>
                      <TableCell className="font-mono text-xs">{ev.time}</TableCell>
                      <TableCell className="text-xs">{ev.description}</TableCell>
                      <TableCell className="text-xs">{ev.action}</TableCell>
                      <TableCell className="text-xs font-mono">{ev.nextEvent}</TableCell>
                      <TableCell className="font-mono text-xs text-center">
                        {ev.systemCount}
                      </TableCell>
                      <TableCell className="text-xs">{ev.queueContent}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </ScrollArea>
          </CardContent>
        </Card>
      )}

      {/* Customer Table */}
      {simResult && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">
              Detalle por Cliente ({simResult.customers.length} clientes)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[250px]">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Cliente</TableHead>
                    <TableHead>R Llegada</TableHead>
                    <TableHead>T. Llegada</TableHead>
                    <TableHead>Llegada</TableHead>
                    <TableHead>Espera</TableHead>
                    <TableHead>Inicio Serv.</TableHead>
                    <TableHead>R Servicio</TableHead>
                    <TableHead>T. Servicio</TableHead>
                    <TableHead>Fin Serv.</TableHead>
                    <TableHead>Servidor</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {simResult.customers.map((c) => (
                    <TableRow key={c.id}>
                      <TableCell className="font-mono text-xs">C{c.id}</TableCell>
                      <TableCell className="font-mono text-xs">
                        {c.arrivalRandom.toFixed(4)}
                      </TableCell>
                      <TableCell className="font-mono text-xs">
                        {c.interArrivalTime.toFixed(2)}
                      </TableCell>
                      <TableCell className="font-mono text-xs">
                        {c.arrivalTime.toFixed(2)}
                      </TableCell>
                      <TableCell className="font-mono text-xs">
                        {c.waitTime.toFixed(2)}
                      </TableCell>
                      <TableCell className="font-mono text-xs">
                        {c.serviceStart.toFixed(2)}
                      </TableCell>
                      <TableCell className="font-mono text-xs">
                        {c.serviceRandom.toFixed(4)}
                      </TableCell>
                      <TableCell className="font-mono text-xs">
                        {c.serviceTime.toFixed(2)}
                      </TableCell>
                      <TableCell className="font-mono text-xs">
                        {c.departureTime.toFixed(2)}
                      </TableCell>
                      <TableCell className="font-mono text-xs text-center">
                        {c.serverAssigned || '-'}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </ScrollArea>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

export default SimulationTab;
