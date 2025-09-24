import { useState } from 'react';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';

interface ActionPanelProps {
  playerName: string; // Prop añadida para mostrar de quién es el turno
  amountToCall: number;
  playerStack: number;
  minRaise: number;
  onFold: () => void;
  onCheck: () => void;
  onCall: () => void;
  onBet: (amount: number) => void;
  onRaise: (amount: number) => void;
}

export const ActionPanel = ({
  playerName,
  amountToCall,
  playerStack,
  minRaise,
  onFold,
  onCheck,
  onCall,
  onBet,
  onRaise,
}: ActionPanelProps) => {
  const [raiseAmount, setRaiseAmount] = useState(minRaise);

  const canCheck = amountToCall === 0;

  const handleRaiseChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value, 10);
    // Aseguramos que el valor esté dentro de los límites válidos
    if (!isNaN(value)) {
      setRaiseAmount(Math.max(minRaise, Math.min(value, playerStack)));
    } else {
      setRaiseAmount(minRaise); // Resetea al mínimo si el input está vacío
    }
  };

  const handleBetOrRaise = () => {
    if (amountToCall > 0) {
      onRaise(raiseAmount);
    } else {
      onBet(raiseAmount);
    }
  };

  return (
    <div className="flex w-full max-w-2xl flex-col items-center gap-2 rounded-xl bg-slate-900/70 p-4 shadow-2xl backdrop-blur-sm">
      <div className="text-lg font-bold text-white">
        Turno de: <span className="text-yellow-400">{playerName}</span>
      </div>
      <div className="flex items-center gap-4">
        <Button onClick={onFold} variant="secondary" className="!bg-red-800 hover:!bg-red-700">
          Fold
        </Button>

        {canCheck ? (
          <Button onClick={onCheck} variant="secondary">
            Check
          </Button>
        ) : (
          <Button onClick={onCall} variant="secondary" className="!bg-sky-700 hover:!bg-sky-600">
            Call {amountToCall > 0 && amountToCall}
          </Button>
        )}

        <div className="flex items-center gap-2">
          <Input
            type="number"
            value={raiseAmount}
            onChange={handleRaiseChange}
            min={minRaise}
            max={playerStack}
            className="w-28 bg-slate-800 text-center text-white"
          />
          <Button onClick={handleBetOrRaise}>
            {amountToCall > 0 ? 'Raise' : 'Bet'}
          </Button>
        </div>
      </div>
    </div>
  );
};

