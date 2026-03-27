import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { ChevronDown, ChevronRight } from 'lucide-react';
import { MathFormula } from './MathFormula';

interface FormulaEntry {
  label: string;
  tex: string;
  colors?: Record<string, string>;
  description?: string;
}

function FormulaBlock({ title, formulas, index }: { title: string; formulas: FormulaEntry[]; index: number }) {
  const [expanded, setExpanded] = useState(true);

  return (
    <Card
      className="formula-card"
      style={{ animationDelay: `${index * 120}ms` }}
    >
      <CardHeader
        className="cursor-pointer select-none"
        onClick={() => setExpanded(!expanded)}
      >
        <CardTitle className="text-base flex items-center gap-2">
          {expanded ? (
            <ChevronDown className="h-4 w-4 text-muted-foreground" />
          ) : (
            <ChevronRight className="h-4 w-4 text-muted-foreground" />
          )}
          {title}
        </CardTitle>
      </CardHeader>
      {expanded && (
        <CardContent className="space-y-4 formula-content">
          {formulas.map((f, i) => (
            <div key={i} className="space-y-1">
              <p className="text-sm font-medium">{f.label}</p>
              <div className="rounded-md bg-muted p-3 text-sm overflow-x-auto flex items-center justify-center min-h-[48px]">
                <MathFormula tex={f.tex} colors={f.colors} />
              </div>
              {f.description && (
                <p className="text-xs text-muted-foreground">{f.description}</p>
              )}
            </div>
          ))}
        </CardContent>
      )}
    </Card>
  );
}

const COLORS = {
  seed: '#3b82f6',      // blue
  mult: '#ef4444',      // red
  mod: '#22c55e',       // green
  inc: '#f59e0b',       // amber
  stat: '#8b5cf6',      // purple
  norm: '#06b6d4',      // cyan
};

const FORMULA_SECTIONS = [
  {
    title: 'Generadores de Números Pseudoaleatorios',
    formulas: [
      {
        label: 'Congruencial Lineal (LCG)',
        tex: 'X_{n+1} = (a \\cdot X_n + c) \\mod m',
        colors: { X: COLORS.seed, a: COLORS.mult, c: COLORS.inc, m: COLORS.mod },
        description: 'a = multiplicador, c = incremento, m = módulo, X₀ = semilla.',
      },
      {
        label: 'Normalización LCG',
        tex: 'R_i = \\frac{X_{n+1}}{m}',
        colors: { R: COLORS.norm, X: COLORS.seed, m: COLORS.mod },
        description: 'Convierte el valor entero en un número en [0, 1).',
      },
      {
        label: 'Congruencial Multiplicativo (MCG)',
        tex: 'X_{n+1} = (a \\cdot X_n) \\mod m',
        colors: { X: COLORS.seed, a: COLORS.mult, m: COLORS.mod },
        description: 'Caso especial del LCG con c = 0. Requiere semilla distinta de cero.',
      },
      {
        label: 'Cuadrados Medios',
        tex: 'X_{n+1} = \\text{medios}(X_n^2,\\; d)',
        colors: { X: COLORS.seed },
        description: 'Se eleva X(n) al cuadrado, se rellena con ceros a 2d dígitos, y se extraen los d dígitos centrales.',
      },
    ] as FormulaEntry[],
  },
  {
    title: 'Prueba Chi-Cuadrada (χ²)',
    formulas: [
      {
        label: 'Estadístico',
        tex: '\\chi^2 = \\sum_{i=1}^{k} \\frac{(O_i - E_i)^2}{E_i}',
        colors: { O: COLORS.seed, E: COLORS.mult, k: COLORS.mod },
        description: 'Oᵢ = frecuencia observada, Eᵢ = frecuencia esperada = n/k, k = número de intervalos.',
      },
      {
        label: 'Criterio de aceptación',
        tex: '\\chi^2_{calc} \\leq \\chi^2_{crit} \\; (\\alpha=0.05,\\; gl=k-1)',
        colors: { '\\alpha': COLORS.stat, k: COLORS.mod },
        description: 'Si el estadístico ≤ valor crítico, no se rechaza H₀ (uniformidad).',
      },
    ] as FormulaEntry[],
  },
  {
    title: 'Prueba Kolmogorov-Smirnov',
    formulas: [
      {
        label: 'Estadístico D',
        tex: 'D = \\max(D^+,\\; D^-)',
        colors: { D: COLORS.stat },
      },
      {
        label: 'D⁺',
        tex: 'D^+ = \\max_{1 \\leq i \\leq n} \\left( \\frac{i}{n} - R_{(i)} \\right)',
        colors: { D: COLORS.stat, R: COLORS.norm },
      },
      {
        label: 'D⁻',
        tex: 'D^- = \\max_{1 \\leq i \\leq n} \\left( R_{(i)} - \\frac{i-1}{n} \\right)',
        colors: { D: COLORS.stat, R: COLORS.norm },
        description: 'R₍ᵢ₎ son los valores ordenados de menor a mayor, n = tamaño de la muestra.',
      },
      {
        label: 'Valor crítico',
        tex: 'D_{crit} \\approx \\frac{1.36}{\\sqrt{n}} \\quad (\\alpha=0.05,\\; n \\geq 35)',
        colors: { D: COLORS.stat },
      },
    ] as FormulaEntry[],
  },
  {
    title: 'Prueba de Póker',
    formulas: [
      {
        label: 'Procedimiento',
        tex: '5\\;dígitos \\rightarrow clasificar \\rightarrow \\chi^2\\;sobre\\;frecuencias',
        description: 'Cada mano se clasifica según el patrón de repetición de dígitos (0-9).',
      },
      {
        label: 'Categorías y probabilidades',
        tex: 'TD\\;(0.3024) \\;|\\; 1P\\;(0.504) \\;|\\; 2P\\;(0.108) \\;|\\; TP\\;(0.072) \\;|\\; FH\\;(0.009) \\;|\\; PK\\;(0.0045) \\;|\\; QN\\;(0.0001)',
        description: 'TD=Todos diferentes, 1P=Un par, 2P=Dos pares, TP=Tercia, FH=Full, PK=Póker, QN=Quintilla.',
      },
    ] as FormulaEntry[],
  },
  {
    title: 'Simulación de Colas M/M/c',
    formulas: [
      {
        label: 'Transformada inversa exponencial',
        tex: 'X = -\\frac{\\ln(1 - U)}{\\lambda}',
        colors: { U: COLORS.norm, '\\lambda': COLORS.mult },
        description: 'Genera una variable aleatoria exponencial a partir de U ~ Uniforme(0,1). λ = tasa.',
      },
      {
        label: 'Factor de utilización',
        tex: '\\rho = \\frac{\\lambda}{c \\cdot \\mu}',
        colors: { '\\lambda': COLORS.mult, '\\mu': COLORS.inc, c: COLORS.seed },
        description: 'λ = tasa de llegada, μ = tasa de servicio, c = número de servidores.',
      },
      {
        label: 'Ley de Little',
        tex: 'L = \\lambda \\cdot W',
        colors: { L: COLORS.stat, '\\lambda': COLORS.mult, W: COLORS.norm },
        description: 'L = número promedio en el sistema, W = tiempo promedio en el sistema.',
      },
      {
        label: 'Estabilidad',
        tex: '\\rho < 1',
        colors: { '\\rho': COLORS.stat },
        description: 'El sistema es estable solo si la tasa de utilización es menor que 1.',
      },
    ] as FormulaEntry[],
  },
  {
    title: 'Normalización',
    formulas: [
      {
        label: 'Número aleatorio normalizado',
        tex: 'R_i = \\frac{X_{n+1}}{m}',
        colors: { R: COLORS.norm, X: COLORS.seed, m: COLORS.mod },
        description: 'Convierte el valor entero generado en un número en el intervalo [0, 1).',
      },
    ] as FormulaEntry[],
  },
];

export function EquationsTab() {
  return (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold">Fórmulas y Ecuaciones</h3>
      <p className="text-sm text-muted-foreground">
        Referencia completa de las fórmulas matemáticas utilizadas en los generadores,
        pruebas estadísticas y simulación de colas.
      </p>

      <Separator />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {FORMULA_SECTIONS.map((section, i) => (
          <FormulaBlock
            key={section.title}
            title={section.title}
            formulas={section.formulas}
            index={i}
          />
        ))}
      </div>
    </div>
  );
}

export default EquationsTab;
