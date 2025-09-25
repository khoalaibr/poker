import type { Player } from '../../features/table/tableSlice';
import { Button } from './Button';
import { Input } from './Input';
import { PlayingCard } from './PlayingCard';

interface SeatProps {
  player: Player;
  isHero: boolean;
  isButton: boolean;
  isHandInProgress: boolean;
  isCurrentPlayer: boolean; // Para saber si es el turno de este jugador
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
  
  // Lógica de estilos para los anillos
  const ringClasses = [
    'ring-2 ring-slate-600', // Anillo base
    isHero ? 'ring-amber-400' : '', // Anillo para el Hero
    isCurrentPlayer ? 'ring-4 ring-green-400' : '', // Anillo para el jugador activo
    player.hasFolded ? 'opacity-40' : '' // Opacidad si el jugador se ha retirado
  ].join(' ');

  const seatClasses = `relative flex h-36 w-44 flex-col items-center justify-between rounded-lg bg-slate-700 text-white shadow-lg transition-all cursor-pointer ${ringClasses}`;
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
            !player.hasFolded && <Button onClick={onSelectCardsClick} variant="secondary">
              Seleccionar Cartas
            </Button>
          )
        ) : null}
         {/* Mostrar cartas retiradas para jugadores que no son el Hero */}
         {!isHero && player.hasFolded && isHandInProgress && (
          <span className="text-lg font-bold text-red-500">FOLD</span>
        )}
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