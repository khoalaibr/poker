import { useState } from 'react';
import { type Card, type Deck, sortDeck } from '../../lib/deck';
import { Button } from '../ui/Button';
import { PlayingCard } from '../ui/PlayingCard';

interface DeckSelectorProps {
  deck: Deck;
  mode: 'holeCards' | 'flop' | 'turn' | 'river';
  onConfirm: (selectedCards: Card[]) => void;
  onCancel: () => void;
}

// Lógica para determinar cuántas cartas seleccionar y el título del modal
const getModeConfig = (mode: DeckSelectorProps['mode']) => {
  switch (mode) {
    case 'flop':
      return { maxSelection: 3, title: 'Selecciona el Flop (3 cartas)' };
    case 'turn':
      return { maxSelection: 1, title: 'Selecciona el Turn (1 carta)' };
    case 'river':
      return { maxSelection: 1, title: 'Selecciona el River (1 carta)' };
    case 'holeCards':
    default:
      return { maxSelection: 2, title: 'Selecciona tus Cartas de Mano (2 cartas)' };
  }
};

export const DeckSelector = ({ deck, mode, onConfirm, onCancel }: DeckSelectorProps) => {
  const [selectedCards, setSelectedCards] = useState<Card[]>([]);
  const { maxSelection, title } = getModeConfig(mode);
  
  const sortedDeck = sortDeck(deck);

  const handleCardClick = (clickedCard: Card) => {
    if (clickedCard.inUse) return;

    setSelectedCards(prev => {
      const isAlreadySelected = prev.some(c => c.id === clickedCard.id);
      if (isAlreadySelected) {
        return prev.filter(c => c.id !== clickedCard.id);
      }
      if (prev.length < maxSelection) {
        return [...prev, clickedCard];
      }
      return [...prev.slice(1), clickedCard]; // Reemplaza la más antigua si se excede
    });
  };

  return (
    <div className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-black/80 backdrop-blur-sm">
      <div className="flex h-[80vh] w-full max-w-4xl flex-col gap-4 rounded-lg bg-slate-800 p-6 border border-slate-700">
        <h2 className="text-center text-2xl font-bold text-white">{title}</h2>
        
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
          <Button onClick={onCancel} variant="secondary">Cancelar</Button>
          <Button onClick={() => onConfirm(selectedCards)} disabled={selectedCards.length !== maxSelection}>
            Confirmar ({selectedCards.length}/{maxSelection})
          </Button>
        </div>
      </div>
    </div>
  );
};

