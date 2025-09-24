import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Seat } from '../components/ui/Seat';
import {
  setButtonSeat,
  setHeroHoleCards,
  setHeroSeat,
  startHand,
  updatePlayerStack,
  playerAct, // Import the new action
} from '../features/table/tableSlice';
import { Button } from '../components/ui/Button';
import { Pot } from '../components/ui/Pot';
import { DeckSelector } from '../components/features/DeckSelector';
import type { Card } from '../lib/deck';
import { ActionPanel } from '../components/features/ActionPanel';
import type { RootState } from '../store/store';

export const TablePage = () => {
  const dispatch = useDispatch();
  const { players, buttonSeat, heroSeat, handState, pot, deck, currentPlayerSeat, amountToCall, blinds } = useSelector(
    (state: RootState) => state.table
  );

  const [isDeckSelectorOpen, setIsDeckSelectorOpen] = useState(false);

  useEffect(() => {
    console.log('El estado de la mano ha cambiado a:', handState);
  }, [handState]);

  const isHandInProgress = handState !== 'PREHAND';
  const activePlayer = players.find(p => p.seat === currentPlayerSeat);

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

  const handleSelectCardsConfirm = (selectedCards: Card[]) => {
    if (selectedCards.length === 2) {
      dispatch(setHeroHoleCards(selectedCards));
      setIsDeckSelectorOpen(false);
    }
  };

  // --- CONNECT ACTIONS TO REDUX ---
  const handleFold = () => {
    if (activePlayer) dispatch(playerAct({ seat: activePlayer.seat, type: 'FOLD' }));
  };
  const handleCheck = () => {
    if (activePlayer) dispatch(playerAct({ seat: activePlayer.seat, type: 'CHECK' }));
  };
  const handleCall = () => {
    if (activePlayer) dispatch(playerAct({ seat: activePlayer.seat, type: 'CALL' }));
  };
  const handleBet = (amount: number) => {
    if (activePlayer) dispatch(playerAct({ seat: activePlayer.seat, type: 'BET', amount }));
  };
  const handleRaise = (amount: number) => {
    if (activePlayer) dispatch(playerAct({ seat: activePlayer.seat, type: 'RAISE', amount }));
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
            isCurrentPlayer={player.seat === currentPlayerSeat}
            onSeatClick={() => handleSeatClick(player.seat)}
            onStackChange={(newStack) => dispatch(updatePlayerStack({ seat: player.seat, stack: newStack }))}
            onSelectCardsClick={() => setIsDeckSelectorOpen(true)}
          />
        ))}
      </div>
      
      <div className="absolute bottom-10 flex flex-col items-center gap-4">
        {!isHandInProgress && buttonSeat !== null && heroSeat !== null && (
          <Button onClick={handleStartHand}>
            Repartir Cartas
          </Button>
        )}

        {isHandInProgress && activePlayer && (
          <ActionPanel
            playerName={`Asiento ${activePlayer.seat + 1}`}
            amountToCall={amountToCall - activePlayer.amountInvestedThisStreet}
            playerStack={activePlayer.stack}
            minRaise={blinds.bb * 2} // Lógica simplificada
            onFold={handleFold}
            onCheck={handleCheck}
            onCall={handleCall}
            onBet={handleBet}
            onRaise={handleRaise}
          />
        )}
      </div>

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

