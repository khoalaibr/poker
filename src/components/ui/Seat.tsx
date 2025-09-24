import type { Player } from '../../features/table/tableSlice';
import { Button } from './Button';
import { Input } from './Input';
import { PlayingCard } from './PlayingCard';

interface SeatProps {
  player: Player;
  isHero: boolean;
  isButton: boolean;
  isHandInProgress: boolean;
  isCurrentPlayer: boolean;
  onSeatClick: () => void;
  onStackChange: (newStack: number) => void;
  onSelectCardsClick: () => void;
}

export const Seat = ({
  player,
  isHero,
  isButton,
  isHandInProgress,
  isCurrentPlayer,
  onSeatClick,
  onStackChange,
  onSelectCardsClick,
}: SeatProps) => {

  const handleStackInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value, 10);
    if (!isNaN(value)) {
      onStackChange(value);
    }
  };

  const stopPropagation = (e: React.MouseEvent) => {
    e.stopPropagation();
  };

  const ringClasses = isCurrentPlayer
    ? 'ring-4 ring-yellow-400 shadow-yellow-400/30'
    : isHero
    ? 'ring-4 ring-amber-400'
    : 'ring-2 ring-slate-600';

  // NEW: Visual feedback for folded players
  const foldedClass = player.hasFolded ? 'opacity-40' : '';

  const seatClasses = `relative flex h-36 w-44 flex-col items-center justify-between rounded-lg bg-slate-700 text-white shadow-lg transition-all cursor-pointer ${ringClasses} ${foldedClass}`;
  const disabledInputStyles = isHandInProgress ? 'opacity-60 cursor-not-allowed' : '';

  return (
    <div className={seatClasses} onClick={onSeatClick}>
      <div className="flex w-full justify-between items-center p-2">
        <span className="font-bold">Asiento {player.seat + 1}</span>
        {isHandInProgress && (
          <span className="text-sm font-semibold text-cyan-400 bg-slate-900/50 px-2 py-0.5 rounded">
            {player.position}
          </span>
        )}
      </div>

      <div className="flex h-14 items-center justify-center gap-1">
        {isHero && isHandInProgress ? (
          player.holeCards && player.holeCards.length === 2 ? (
            <>
              <PlayingCard card={player.holeCards[0]} />
              <PlayingCard card={player.holeCards[1]} />
            </>
          ) : (
            // Prevent showing button if player has folded
            !player.hasFolded && (
              <Button onClick={(e) => { e.stopPropagation(); onSelectCardsClick(); }} variant="secondary">
                Seleccionar Cartas
              </Button>
            )
          )
        ) : null}
      </div>

      <div
        className="flex w-full flex-col items-center rounded-b-md bg-slate-900/50 p-2"
        onClick={stopPropagation}
      >
        <span className="text-xs font-semibold text-slate-400">Stack</span>
        <Input
          type="number"
          value={player.stack}
          onChange={handleStackInputChange}
          disabled={isHandInProgress}
          className={`w-full bg-transparent text-center text-xl font-bold ${disabledInputStyles}`}
        />
      </div>
      
      {isButton && (
        <div className="absolute -top-3 -right-3 flex h-7 w-7 items-center justify-center rounded-full bg-red-600 text-sm font-bold shadow-md ring-2 ring-white">
          D
        </div>
      )}
    </div>
  );
};