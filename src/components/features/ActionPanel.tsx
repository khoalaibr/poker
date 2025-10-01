import { useState } from 'react';
import type { ActionType } from '../../features/table/tableSlice';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';

interface ActionPanelProps {
  playerName: string;
  amountToCall: number;
  playerStack: number;
  minRaise: number;
  // --- CORRECCIÓN: Ahora aceptamos una única función 'onAction' ---
  onAction: (type: ActionType, amount?: number) => void;
}

export const ActionPanel = ({
  playerName,
  amountToCall,
  playerStack,
  minRaise,
  onAction,
}: ActionPanelProps) => {
  const [raiseAmount, setRaiseAmount] = useState(minRaise.toString());

  const canCheck = amountToCall <= 0;
  const totalRaiseAmount = Number(raiseAmount);

  // --- LÓGICA DE BOTONES ACTUALIZADA ---
  const handleFold = () => onAction('FOLD');
  const handleCheck = () => onAction('CHECK');
  const handleCall = () => onAction('CALL');
  const handleBetOrRaise = () => {
    // Si hay una apuesta que igualar, es un RAISE. Si no, es un BET.
    const actionType = amountToCall > 0 ? 'RAISE' : 'BET';
    onAction(actionType, totalRaiseAmount);
  };

  return (
    <div className="flex w-full max-w-4xl flex-col items-center gap-4 rounded-lg bg-slate-900/80 p-4 shadow-2xl backdrop-blur-sm">
      <h3 className="text-xl font-bold text-white">
        Turno de: <span className="text-amber-400">{playerName}</span>
      </h3>
      <div className="flex w-full flex-wrap items-center justify-center gap-2 md:gap-4">
        <Button onClick={handleFold} variant="secondary" className="flex-1 bg-red-800 hover:bg-red-700">
          Fold
        </Button>

        {canCheck ? (
          <Button onClick={handleCheck} variant="secondary" className="flex-1">
            Check
          </Button>
        ) : (
          <Button onClick={handleCall} variant="secondary" className="flex-1">
            Call {amountToCall}
          </Button>
        )}

        <div className="flex flex-1 items-stretch gap-2">
          <Input
            type="number"
            value={raiseAmount}
            onChange={(e) => setRaiseAmount(e.target.value)}
            className="w-full min-w-[80px] rounded-md border-2 border-slate-600 bg-slate-800 text-center text-lg font-bold"
            min={minRaise}
            max={playerStack + amountToCall} // El total que puede apostar es su stack + lo que ya ha puesto
          />
          <Button onClick={handleBetOrRaise} variant="primary" className="flex-grow">
            {amountToCall > 0 ? 'Raise' : 'Bet'}
          </Button>
        </div>
      </div>
    </div>
  );
};

