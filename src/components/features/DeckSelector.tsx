import { useState } from 'react';
import { type Card, type Deck, sortDeck } from '../../lib/deck';
import { Button } from '../ui/Button';
import { PlayingCard } from '../ui/PlayingCard';

interface DeckSelectorProps {
  deck: Deck;
  onConfirm: (selectedCards: Card[]) => void;
  onCancel: () => void;
}

export const DeckSelector = ({ deck, onConfirm, onCancel }: DeckSelectorProps) => {
  const [selectedCards, setSelectedCards] = useState<Card[]>([]);

  // Ordenamos el mazo antes de mostrarlo
  const sortedDeck = sortDeck(deck);

  const handleCardClick = (clickedCard: Card) => {
    // No permitir seleccionar cartas ya en uso
    if (clickedCard.inUse) return;

    setSelectedCards(prev => {
      const isAlreadySelected = prev.some(c => c.id === clickedCard.id);
      if (isAlreadySelected) {
        return prev.filter(c => c.id !== clickedCard.id);
      }
      if (prev.length < 2) {
        return [...prev, clickedCard];
      }
      // Si ya hay 2, reemplaza la primera seleccionada
      return [...prev.slice(1), clickedCard];
    });
  };

  return (
    <div className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-black/80 backdrop-blur-sm">
      <div className="flex h-[80vh] w-full max-w-4xl flex-col gap-4 rounded-lg bg-slate-800 p-6 border border-slate-700">
        <h2 className="text-center text-2xl font-bold text-white">Selecciona 2 Cartas</h2>
        
        {/* Contenedor de cartas con scroll y wrap */}
        <div className="flex-grow overflow-y-auto rounded-md bg-slate-900/50 p-4">
          <div className="flex flex-wrap justify-center gap-2">
            {sortedDeck.map(card => (
              <PlayingCard
                key={card.id}
                card={card}
                onClick={() => handleCardClick(card)}
                isSelected={selectedCards.some(c => c.id === card.id)}
              />
            ))}
          </div>
        </div>

        <div className="flex justify-center gap-4">
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

