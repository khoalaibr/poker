import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Seat } from '../components/ui/Seat';
import {
  setButtonSeat,
  setHeroHoleCards,
  setHeroSeat,
  startHand,
  updatePlayerStack,
  playerAct,
  dealCommunityCards, // Importar la nueva acción
} from '../features/table/tableSlice';
import { Button } from '../components/ui/Button';
import { Pot } from '../components/ui/Pot';
import { DeckSelector } from '../components/features/DeckSelector';
import type { Card } from '../lib/deck';
import { ActionPanel } from '../components/features/ActionPanel';
import { Board } from '../components/ui/Board'; // Importar el nuevo componente
import type { RootState } from '../store/store';

export const TablePage = () => {
  const dispatch = useDispatch();
  const { players, buttonSeat, heroSeat, handState, pot, deck, currentPlayerSeat, amountToCall, blinds, board } = useSelector(
    (state: RootState) => state.table
  );

  // ESTADO PARA GESTIONAR EL MODO DEL SELECTOR DE CARTAS
  type DeckSelectorMode = 'holeCards' | 'flop' | 'turn' | 'river' | null;
  const [deckSelectorMode, setDeckSelectorMode] = useState<DeckSelectorMode>(null);

  useEffect(() => {
    console.log('El estado de la mano ha cambiado a:', handState);
  }, [handState]);

  const isHandInProgress = handState !== 'PREHAND';
  const activePlayer = players.find(p => p.seat === currentPlayerSeat);
  const isBettingRoundOver = isHandInProgress && currentPlayerSeat === null;

  // Lógica para determinar qué botón mostrar cuando la ronda de apuestas termina
  let dealButtonText = '';
  if (isBettingRoundOver) {
    if (handState === 'PREFLOP') dealButtonText = 'Repartir Flop';
    else if (handState === 'FLOP') dealButtonText = 'Repartir Turn';
    else if (handState === 'TURN') dealButtonText = 'Repartir River';
  }

  const handleSeatClick = (seatIndex: number) => {
    if (isHandInProgress) return;
    if (buttonSeat === null) dispatch(setButtonSeat(seatIndex));
    else if (heroSeat === null && seatIndex !== buttonSeat) dispatch(setHeroSeat(seatIndex));
  };

  const handleStartHand = () => dispatch(startHand());

  const handleDealCommunityClick = () => {
    if (handState === 'PREFLOP') setDeckSelectorMode('flop');
    else if (handState === 'FLOP') setDeckSelectorMode('turn');
    else if (handState === 'TURN') setDeckSelectorMode('river');
  };

  const handleSelectCardsConfirm = (selectedCards: Card[]) => {
    if (deckSelectorMode === 'holeCards') {
      if (selectedCards.length === 2) dispatch(setHeroHoleCards(selectedCards));
    } else {
      dispatch(dealCommunityCards(selectedCards));
    }
    setDeckSelectorMode(null); // Cerrar el modal en cualquier caso
  };

  const handleFold = () => { if (activePlayer) dispatch(playerAct({ seat: activePlayer.seat, type: 'FOLD' })); };
  const handleCheck = () => { if (activePlayer) dispatch(playerAct({ seat: activePlayer.seat, type: 'CHECK' })); };
  const handleCall = () => { if (activePlayer) dispatch(playerAct({ seat: activePlayer.seat, type: 'CALL' })); };
  const handleBet = (amount: number) => { if (activePlayer) dispatch(playerAct({ seat: activePlayer.seat, type: 'BET', amount })); };
  const handleRaise = (amount: number) => { if (activePlayer) dispatch(playerAct({ seat: activePlayer.seat, type: 'RAISE', amount })); };

  return (
    <div className="flex min-h-screen w-full flex-col items-center justify-center gap-8 bg-slate-800 p-4">
      <div className="flex flex-col items-center gap-4">
        <Pot amount={pot} />
        <Board cards={board} />
      </div>
      
      <div className="flex flex-wrap items-center justify-center gap-4">
        {players.map((player) => (
          <Seat key={player.seat} player={player} isButton={player.seat === buttonSeat} isHero={player.seat === heroSeat} isHandInProgress={isHandInProgress} isCurrentPlayer={player.seat === currentPlayerSeat} onSeatClick={() => handleSeatClick(player.seat)} onStackChange={(newStack) => dispatch(updatePlayerStack({ seat: player.seat, stack: newStack }))} onSelectCardsClick={() => setDeckSelectorMode('holeCards')} />
        ))}
      </div>
      
      <div className="absolute bottom-10 flex flex-col items-center gap-4">
        {!isHandInProgress && buttonSeat !== null && heroSeat !== null && <Button onClick={handleStartHand}>Repartir Cartas</Button>}
        {isBettingRoundOver && dealButtonText && <Button onClick={handleDealCommunityClick}>{dealButtonText}</Button>}
        {isHandInProgress && activePlayer && <ActionPanel playerName={`Asiento ${activePlayer.seat + 1}`} amountToCall={amountToCall - activePlayer.amountInvestedThisStreet} playerStack={activePlayer.stack} minRaise={blinds.bb * 2} onFold={handleFold} onCheck={handleCheck} onCall={handleCall} onBet={handleBet} onRaise={handleRaise} />}
      </div>

      {deckSelectorMode && (
        <DeckSelector mode={deckSelectorMode} deck={deck} onConfirm={handleSelectCardsConfirm} onCancel={() => setDeckSelectorMode(null)} />
      )}
    </div>
  );
};

