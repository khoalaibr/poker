import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Seat } from '../components/ui/Seat';
import {
  setButtonSeat,
  setHeroHoleCards,
  setHeroSeat,
  startHand,
  updatePlayerStack,
} from '../features/table/tableSlice';
import { Button } from '../components/ui/Button';
import { Pot } from '../components/ui/Pot';
import { DeckSelector } from '../components/features/DeckSelector';
import type { RootState } from '../store/store';
import type { Card } from '../lib/deck';

export const TablePage = () => {
  const dispatch = useDispatch();
  const { players, buttonSeat, heroSeat, handState, pot, deck } = useSelector(
    (state: RootState) => state.table
  );

  // --- NUEVO ESTADO PARA CONTROLAR EL MODAL ---
  const [isDeckSelectorOpen, setIsDeckSelectorOpen] = useState(false);

  useEffect(() => {
    console.log('El estado de la mano ha cambiado a:', handState);
  }, [handState]);

  const isHandInProgress = handState !== 'PREHAND';

  const handleSeatClick = (seatIndex: number) => {
    if (isHandInProgress) return;
    if (buttonSeat === null) {
      dispatch(setButtonSeat(seatIndex));
    } else if (heroSeat === null && seatIndex !== buttonSeat) {
      dispatch(setHeroSeat(seatIndex));
    }
  };

  const handleStartHand = () => {
    dispatch(startHand());
  };

  // --- NUEVA FUNCIÓN PARA CONFIRMAR LA SELECCIÓN ---
  const handleSelectCardsConfirm = (selectedCards: Card[]) => {
    if (selectedCards.length === 2) {
      dispatch(setHeroHoleCards(selectedCards));
      setIsDeckSelectorOpen(false); // Cierra el modal
    }
  };


  return (
    <div className="flex min-h-screen w-full flex-col items-center justify-center gap-8 bg-slate-800 p-4">
      
      <Pot amount={pot} />
      
      <div className="flex flex-wrap items-center justify-center gap-4">
        {players.map((player) => (
          <Seat
            key={player.seat}
            player={player}
            isButton={player.seat === buttonSeat}
            isHero={player.seat === heroSeat}
            isHandInProgress={isHandInProgress}
            onSeatClick={() => handleSeatClick(player.seat)}
            onStackChange={(newStack) => dispatch(updatePlayerStack({ seat: player.seat, stack: newStack }))}
            onSelectCardsClick={() => setIsDeckSelectorOpen(true)} // Abre el modal
          />
        ))}
      </div>
      
      <div className="absolute bottom-10">
        {!isHandInProgress && buttonSeat !== null && heroSeat !== null && (
          <Button onClick={handleStartHand}>
            Repartir Cartas
          </Button>
        )}
      </div>

      {/* --- RENDERIZADO CONDICIONAL DEL MODAL --- */}
      {isDeckSelectorOpen && (
        <DeckSelector
          deck={deck}
          onConfirm={handleSelectCardsConfirm}
          onCancel={() => setIsDeckSelectorOpen(false)}
        />
      )}

    </div>
  );
};

