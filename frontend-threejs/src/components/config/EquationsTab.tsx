import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';

function FormulaBlock({ title, formulas }: { title: string; formulas: { label: string; formula: string; description?: string }[] }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">{title}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {formulas.map((f, i) => (
          <div key={i} className="space-y-1">
            <p className="text-sm font-medium">{f.label}</p>
            <div className="rounded-md bg-muted p-3 font-mono text-sm overflow-x-auto">
              {f.formula}
            </div>
            {f.description && (
              <p className="text-xs text-muted-foreground">{f.description}</p>
            )}
          </div>
        ))}
      </CardContent>
    </Card>
  );
}

export function EquationsTab() {
  return (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold">Formulas y Ecuaciones</h3>
      <p className="text-sm text-muted-foreground">
        Referencia completa de las formulas matematicas utilizadas en los generadores,
        pruebas estadisticas y simulacion de colas.
      </p>

      <Separator />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Generators */}
        <FormulaBlock
          title="Generadores de Numeros Pseudoaleatorios"
          formulas={[
            {
              label: 'Congruencial Lineal (LCG)',
              formula: 'X(n+1) = (a * X(n) + c) mod m',
              description:
                'Donde a = multiplicador, c = incremento, m = modulo, X(0) = semilla. Ri = X(n+1) / m',
            },
            {
              label: 'Congruencial Multiplicativo (MCG)',
              formula: 'X(n+1) = (a * X(n)) mod m',
              description:
                'Caso especial del LCG con c = 0. Requiere semilla distinta de cero.',
            },
            {
              label: 'Cuadrados Medios',
              formula: 'X(n+1) = digitos_medios(X(n)², d)',
              description:
                'Se eleva al cuadrado X(n), se rellena con ceros a 2d digitos, y se extraen los d digitos centrales.',
            },
          ]}
        />

        {/* Chi-Square */}
        <FormulaBlock
          title="Prueba Chi-Cuadrada (χ²)"
          formulas={[
            {
              label: 'Estadistico',
              formula: 'χ² = Σ (Oi - Ei)² / Ei',
              description:
                'Donde Oi = frecuencia observada en el intervalo i, Ei = frecuencia esperada = n/k, k = numero de intervalos.',
            },
            {
              label: 'Criterio de aceptacion',
              formula: 'χ² calculado ≤ χ² critico (α=0.05, gl=k-1)',
              description:
                'Si el estadistico es menor o igual al valor critico, no se rechaza H₀ (uniformidad).',
            },
          ]}
        />

        {/* K-S */}
        <FormulaBlock
          title="Prueba Kolmogorov-Smirnov"
          formulas={[
            {
              label: 'Estadistico D',
              formula: 'D = max(D⁺, D⁻)',
            },
            {
              label: 'D⁺',
              formula: 'D⁺ = max[i/n - R(i)]  para i = 1, ..., n',
            },
            {
              label: 'D⁻',
              formula: 'D⁻ = max[R(i) - (i-1)/n]  para i = 1, ..., n',
              description:
                'Donde R(i) son los valores ordenados de menor a mayor, n = tamano de la muestra.',
            },
            {
              label: 'Valor critico',
              formula: 'D critico ≈ 1.36 / √n  (para α=0.05, n ≥ 35)',
            },
          ]}
        />

        {/* Poker */}
        <FormulaBlock
          title="Prueba de Poker"
          formulas={[
            {
              label: 'Procedimiento',
              formula: 'Agrupar en manos de 5 digitos → clasificar → χ² sobre frecuencias',
              description:
                'Cada mano se clasifica segun el patron de repeticion de digitos (0-9).',
            },
            {
              label: 'Categorias',
              formula:
                'TD (0.3024) | 1P (0.504) | 2P (0.108) | TP (0.072) | FH (0.009) | PK (0.0045) | QN (0.0001)',
              description:
                'TD=Todos diferentes, 1P=Un par, 2P=Dos pares, TP=Tercia, FH=Full, PK=Poker, QN=Quintilla.',
            },
          ]}
        />

        {/* Queue */}
        <FormulaBlock
          title="Simulacion de Colas M/M/c"
          formulas={[
            {
              label: 'Transformada inversa exponencial',
              formula: 'X = -ln(1 - U) / λ',
              description:
                'Genera una variable aleatoria exponencial a partir de U ~ Uniforme(0,1). λ = tasa.',
            },
            {
              label: 'Factor de utilizacion',
              formula: 'ρ = λ / (c * μ)',
              description:
                'Donde λ = tasa de llegada, μ = tasa de servicio, c = numero de servidores.',
            },
            {
              label: 'Ley de Little',
              formula: 'L = λ * W',
              description:
                'L = numero promedio en el sistema, W = tiempo promedio en el sistema.',
            },
            {
              label: 'Estabilidad',
              formula: 'ρ < 1  (condicion necesaria)',
              description:
                'El sistema es estable solo si la tasa de utilizacion es menor que 1.',
            },
          ]}
        />

        {/* Normalization */}
        <FormulaBlock
          title="Normalizacion"
          formulas={[
            {
              label: 'Numero aleatorio normalizado',
              formula: 'Ri = X(n+1) / m',
              description:
                'Convierte el valor entero generado en un numero en el intervalo [0, 1).',
            },
          ]}
        />
      </div>
    </div>
  );
}

export default EquationsTab;
