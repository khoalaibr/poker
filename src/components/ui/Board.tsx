import type { Card } from '../../lib/deck';
import { PlayingCard } from './PlayingCard';

interface BoardProps {
  cards: Card[];
}

export const Board = ({ cards }: BoardProps) => {
  // Creamos marcadores de posición para asegurar que siempre haya 5 espacios
  const placeholders = 5 - cards.length;

  return (
    <div className="flex items-center justify-center gap-2 rounded-lg bg-slate-900/50 p-4 border border-slate-700">
      {/* Mostramos las cartas que ya están en el board */}
      {cards.map((card) => (
        <PlayingCard key={card.id} card={card} />
      ))}
      {/* Mostramos los espacios vacíos */}
      {Array.from({ length: placeholders }).map((_, index) => (
        <div
          key={`placeholder-${index}`}
          className="h-[70px] w-[50px] rounded-md border-2 border-dashed border-slate-600 bg-black/20"
        />
      ))}
    </div>
  );
};