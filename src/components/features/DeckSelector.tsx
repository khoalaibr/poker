import { useState } from 'react';
import { Button } from '../ui/Button';
import { PlayingCard } from '../ui/PlayingCard';
import type { Card, Deck } from '../../lib/deck';

export interface DeckSelectorProps {
  deck: Deck;
  onConfirm: (selectedCards: Card[]) => void;
  onCancel: () => void;
}

export const DeckSelector = ({ deck, onConfirm, onCancel }: DeckSelectorProps) => {
  const [selectedCards, setSelectedCards] = useState<Card[]>([]);

  const handleCardClick = (clickedCard: Card) => {
    // Si la carta está en uso (ej. ya en el board), no hacer nada
    if (clickedCard.inUse) return;

    setSelectedCards(prev => {
      const isAlreadySelected = prev.some(c => c.id === clickedCard.id);
      
      if (isAlreadySelected) {
        // Deseleccionar la carta
        return prev.filter(c => c.id !== clickedCard.id);
      } else {
        // Seleccionar la carta, manteniendo un máximo de 2
        const newSelection = [...prev, clickedCard];
        return newSelection.length > 2 ? newSelection.slice(1) : newSelection;
      }
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-black/80 p-4 backdrop-blur-sm">
      <div className="flex w-full max-w-4xl flex-col gap-4 rounded-lg border border-slate-700 bg-slate-800 p-6 shadow-xl">
        <h2 className="text-center text-2xl font-bold text-white">Selecciona tus dos cartas</h2>
        
        {/* --- CORRECCIÓN DE ESTILO --- */}
        {/* - flex y flex-wrap: Permiten que las cartas se organicen en filas y pasen a la siguiente línea si no caben.
          - h-[60vh] y overflow-y-auto: Crean un contenedor con altura limitada (60% de la pantalla) y activan el scroll vertical.
          - justify-center: Centra las cartas en el contenedor.
        */}
        <div className="flex h-[60vh] flex-wrap content-start justify-center gap-2 overflow-y-auto rounded-md bg-slate-900/50 p-4">
          {deck.map(card => (
            <PlayingCard
              key={card.id}
              card={card}
              onClick={() => handleCardClick(card)}
              isSelected={selectedCards.some(c => c.id === card.id)}
            />
          ))}
        </div>

        <div className="mt-2 flex justify-end gap-4">
          <Button onClick={onCancel} variant="secondary">
            Cancelar
          </Button>
          <Button onClick={() => onConfirm(selectedCards)} disabled={selectedCards.length !== 2}>
            Confirmar ({selectedCards.length}/2)
          </Button>
        </div>
      </div>
    </div>
  );
};
