import { useMemo, useState, useCallback } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import type { PokerHandSample } from "@/lib/tests/types";

// ─── Rank mapping ────────────────────────────────────────────────────────────
function digitToCardRank(digit: number): string {
  const ranks = ["A", "2", "3", "4", "5", "6", "7", "8", "9", "10"];
  return ranks[Math.max(0, Math.min(9, digit))];
}

// ─── Suit cycle (decorative, non-semantic) ───────────────────────────────────
const SUITS = ["♠", "♥", "♦", "♣", "♠"] as const;

// ─── Category label map ──────────────────────────────────────────────────────
const CATEGORY_LABELS: Record<string, { label: string; color: string }> = {
  TD: { label: "Todos distintos", color: "var(--poker-cat-td)" },
  "1P": { label: "Un par", color: "var(--poker-cat-1p)" },
  "2P": { label: "Dos pares", color: "var(--poker-cat-2p)" },
  TP: { label: "Trío", color: "var(--poker-cat-tp)" },
  FH: { label: "Full house", color: "var(--poker-cat-fh)" },
  PK: { label: "Póker", color: "var(--poker-cat-pk)" },
  QN: { label: "Quintilla", color: "var(--poker-cat-qn)" },
};

// ─── Single playing card ─────────────────────────────────────────────────────
interface PlayingCardProps {
  digit: number;
  index: number;
  suit: string;
}

function PlayingCard({ digit, index, suit }: PlayingCardProps) {
  const rank = digitToCardRank(digit);
  const isRed = suit === "♥" || suit === "♦";

  return (
    <div
      className="playing-card-neon"
      style={{ animationDelay: `${index * 80}ms` }}
      aria-label={`Carta ${rank}`}
    >
      {/* Top-left corner */}
      <div className={`card-corner card-corner--tl ${isRed ? "is-red" : ""}`}>
        <span className="card-corner-rank">{rank}</span>
        <span className="card-corner-suit">{suit}</span>
      </div>

      {/* Center */}
      <div className="card-center">
        <span className={`card-center-suit ${isRed ? "is-red" : ""}`}>
          {suit}
        </span>
        <span className="card-center-digit">{rank}</span>
      </div>

      {/* Bottom-right corner (rotated) */}
      <div className={`card-corner card-corner--br ${isRed ? "is-red" : ""}`}>
        <span className="card-corner-rank">{rank}</span>
        <span className="card-corner-suit">{suit}</span>
      </div>
    </div>
  );
}

// ─── Main carousel ───────────────────────────────────────────────────────────
export function PokerHandsCarousel({
  sampleHands,
}: {
  sampleHands: PokerHandSample[];
}) {
  const [currentIndex, setCurrentIndex] = useState(0);

  const safeHands = useMemo(() => sampleHands ?? [], [sampleHands]);
  const total = safeHands.length;
  const currentHand = safeHands[currentIndex] ?? null;

  const goPrev = useCallback(() => {
    setCurrentIndex((prev) => (prev === 0 ? total - 1 : prev - 1));
  }, [total]);

  const goNext = useCallback(() => {
    setCurrentIndex((prev) => (prev === total - 1 ? 0 : prev + 1));
  }, [total]);

  if (!currentHand || total === 0) {
    return (
      <div className="rounded-md border bg-muted/20 p-3 text-xs text-muted-foreground">
        No hay manos disponibles para mostrar.
      </div>
    );
  }

  const catMeta = CATEGORY_LABELS[currentHand.categoryCode] ?? {
    label: currentHand.categoryName,
    color: "var(--poker-cat-td)",
  };

  return (
    <div
      className="poker-carousel"
      role="region"
      aria-label="Carrusel de manos de póker"
    >
      {/* ── Header: nav + counter ─────────────────────────────────────────── */}
      <div className="poker-carousel__header">
        <button
          type="button"
          className="poker-nav-btn"
          onClick={goPrev}
          aria-label="Mano anterior"
        >
          <ChevronLeft className="h-4 w-4" />
          <span className="poker-nav-btn__label">Anterior</span>
        </button>

        <div
          className="poker-carousel__counter"
          aria-live="polite"
          aria-atomic="true"
        >
          <span className="poker-carousel__counter-hand">Mano</span>
          <span className="poker-carousel__counter-num">
            {currentIndex + 1}
          </span>
          <span className="poker-carousel__counter-sep">de</span>
          <span className="poker-carousel__counter-total">{total}</span>
        </div>

        <button
          type="button"
          className="poker-nav-btn"
          onClick={goNext}
          aria-label="Mano siguiente"
        >
          <span className="poker-nav-btn__label">Siguiente</span>
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>

      {/* ── Table / hand display ──────────────────────────────────────────── */}
      <div
        className="poker-table"
        role="group"
        aria-label={`Mano ${currentIndex + 1}: ${catMeta.label}`}
      >
        {/* Scanline overlay (purely decorative) */}
        <div className="poker-table__scanlines" aria-hidden="true" />

        {/* Category badge */}
        <div className="poker-table__badge-row">
          <span
            className="poker-cat-badge"
            style={{ "--cat-color": catMeta.color } as React.CSSProperties}
          >
            <span className="poker-cat-badge__code">
              {currentHand.categoryCode}
            </span>
            <span className="poker-cat-badge__name">{catMeta.label}</span>
          </span>
          <span className="poker-hand-index">
            #{String(currentHand.handIndex).padStart(3, "0")}
          </span>
        </div>

        {/* Cards row */}
        <div
          className="poker-cards-row"
          key={`hand-${currentHand.handIndex}-${currentIndex}`}
        >
          {currentHand.digits.map((digit, digitIdx) => (
            <PlayingCard
              key={`${currentHand.handIndex}-${digitIdx}`}
              digit={digit}
              index={digitIdx}
              suit={SUITS[digitIdx % SUITS.length]}
            />
          ))}
        </div>

        {/* Frequency / explanation */}
        <div className="poker-freq-row">
          <span className="poker-freq-label">Frecuencias:</span>
          <span className="poker-freq-pattern">
            {currentHand.frequencyPattern.join("-")}
          </span>
          <span className="poker-freq-arrow">→</span>
          <span className="poker-freq-name">{currentHand.categoryName}</span>
        </div>
      </div>

      {/* ── Dot pagination ────────────────────────────────────────────────── */}
      <div
        className="poker-dots"
        role="tablist"
        aria-label="Navegación de manos"
      >
        {safeHands.map((sample, idx) => (
          <button
            key={`dot-${sample.handIndex}`}
            type="button"
            role="tab"
            aria-selected={idx === currentIndex}
            aria-label={`Ir a mano ${idx + 1}`}
            className={`poker-carousel-dot${idx === currentIndex ? " is-active" : ""}`}
            onClick={() => setCurrentIndex(idx)}
          />
        ))}
      </div>
    </div>
  );
}

export default PokerHandsCarousel;
