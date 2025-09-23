
import { clsx } from 'clsx';
import type { Card } from '../../lib/deck';

interface PlayingCardProps {
  card: Card;
  isSelected?: boolean;
  // CORRECCIÓN: Hacemos que la prop onClick sea opcional añadiendo "?"
  onClick?: () => void; 
}

export const PlayingCard = ({ card, isSelected, onClick }: PlayingCardProps) => {
  const suitColor = (card.suit === '♥' || card.suit === '♦') ? 'text-red-600' : 'text-slate-800';

  return (
    <div
      onClick={onClick}
      className={clsx(
        "flex h-20 w-14 flex-col justify-between rounded-md border-2 bg-white font-bold shadow-sm",
        {
          // CORRECCIÓN: El cursor solo será un puntero si la función onClick existe.
          'cursor-pointer transition-transform hover:scale-105 hover:border-sky-500': onClick, 
          'cursor-not-allowed bg-slate-200 text-slate-400 opacity-50': card.inUse,
          'border-sky-500 ring-2 ring-sky-500': isSelected,
          'border-slate-300': !isSelected && !card.inUse,
        }
      )}
    >
      <div className={`flex flex-col items-start p-1 ${suitColor}`}>
        <span>{card.rank}</span>
      </div>
      <div className={`flex flex-col items-end p-1 text-2xl ${suitColor}`}>
        <span>{card.suit}</span>
      </div>
    </div>
  );
};

