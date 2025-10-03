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
  dealCommunityCards,
  type ActionType,
  // --- NUEVO: Importamos las nuevas acciones ---
  resetGame,
  prepareNextHand,
} from '../features/table/tableSlice';
import { Button } from '../components/ui/Button';
import { Pot } from '../components/ui/Pot';
import { DeckSelector } from '../components/features/DeckSelector';
import type { Card } from '../lib/deck';
import { ActionPanel } from '../components/features/ActionPanel';
import { Board } from '../components/ui/Board';
import type { RootState } from '../store/store';
import { getAiSuggestion, type AiSuggestion } from '../lib/aiHelper';
import { SuggestionDisplay } from '../components/features/SuggestionDisplay';
// --- NUEVO: Importamos useNavigate para la redirección ---
import { useNavigate } from 'react-router-dom';

export const TablePage = () => {
  const dispatch = useDispatch();
  // --- NUEVO: Hook para navegar ---
  const navigate = useNavigate();
  const tableState = useSelector((state: RootState) => state.table);
  const { players, buttonSeat, heroSeat, handState, pot, deck, currentPlayerSeat, amountToCall, blinds, board } = tableState;

  const [deckSelectorMode, setDeckSelectorMode] = useState<'holeCards' | 'flop' | 'turn' | 'river' | null>(null);
  const [suggestion, setSuggestion] = useState<AiSuggestion | null>(null);
  const [isLoadingSuggestion, setIsLoadingSuggestion] = useState(false);

  // --- NUEVO: useEffect para redirigir si el juego se reinicia ---
  useEffect(() => {
    // Si no hay jugadores (estado inicial), volvemos al inicio.
    if (players.length === 0) {
      navigate('/');
    }
  }, [players, navigate]);

  const isHandInProgress = handState !== 'PREHAND';
  const activePlayer = players.find(p => p.seat === currentPlayerSeat);
  const isBettingRoundOver = isHandInProgress && currentPlayerSeat === null && handState !== 'SHOWDOWN';

  let dealButtonText = '';
  if (isBettingRoundOver) {
    if (handState === 'PREFLOP') dealButtonText = 'Repartir Flop';
    else if (handState === 'FLOP') dealButtonText = 'Repartir Turn';
    else if (handState === 'TURN') dealButtonText = 'Repartir River';
  }

  useEffect(() => {
    if (currentPlayerSeat === heroSeat && !isLoadingSuggestion && heroSeat !== null) {
      const fetchSuggestion = async () => {
        setIsLoadingSuggestion(true);
        setSuggestion(null);
        const result = await getAiSuggestion(tableState);
        if (result) setSuggestion(result);
        setIsLoadingSuggestion(false);
      };
      fetchSuggestion();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPlayerSeat, heroSeat]);

  const handleSeatClick = (seatIndex: number) => {
    if (isHandInProgress) return;
    if (buttonSeat === null) dispatch(setButtonSeat(seatIndex));
    else if (heroSeat === null && seatIndex !== buttonSeat) dispatch(setHeroSeat(seatIndex));
  };

  const handleStartHand = () => dispatch(startHand());

  // --- NUEVO: Handlers para los nuevos botones ---
  const handleResetGame = () => dispatch(resetGame());
  const handlePrepareNextHand = () => dispatch(prepareNextHand());

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
    setDeckSelectorMode(null);
  };
  
  const handlePlayerAct = (type: ActionType, amount?: number) => {
    if (activePlayer) {
      dispatch(playerAct({ seat: activePlayer.seat, type, amount }));
      setSuggestion(null);
    }
  };

  const handleApplySuggestion = (sug: AiSuggestion) => {
    if (!activePlayer) return;
    const actionType = sug.action.toUpperCase() as ActionType;
    let actionAmount = 0;
    if ((actionType === 'RAISE' || actionType === 'BET') && sug.size_bb) {
      actionAmount = Math.round(sug.size_bb * tableState.blinds.bb);
    }
    handlePlayerAct(actionType, actionAmount);
  };

  return (
    <div className="flex min-h-screen w-full flex-col items-center justify-center gap-8 bg-slate-800 p-4">
      {/* --- NUEVO: Botones globales en la esquina superior derecha --- */}
      <div className="absolute top-4 right-4 flex gap-2">
        <Button onClick={handleResetGame} variant="secondary" className="bg-red-800 hover:bg-red-700">
          Reiniciar Partida
        </Button>
      </div>

      <div className="flex flex-col items-center gap-4">
        <Pot amount={pot} />
        <Board cards={board} />
      </div>
      
      <div className="flex flex-wrap items-center justify-center gap-4">
        {players.map((player) => (
          <Seat key={player.seat} player={player} isButton={player.seat === buttonSeat} isHero={player.seat === heroSeat} isHandInProgress={isHandInProgress} isCurrentPlayer={player.seat === currentPlayerSeat} onSeatClick={() => handleSeatClick(player.seat)} onStackChange={(newStack) => dispatch(updatePlayerStack({ seat: player.seat, stack: newStack }))} onSelectCardsClick={() => setDeckSelectorMode('holeCards')} />
        ))}
      </div>
      
      <div className="absolute bottom-10 flex w-full max-w-4xl flex-col items-center gap-4">
        {(isLoadingSuggestion || suggestion) && heroSeat === currentPlayerSeat && (
          <SuggestionDisplay isLoading={isLoadingSuggestion} suggestion={suggestion!} onApply={handleApplySuggestion} />
        )}

        {!isHandInProgress && buttonSeat !== null && heroSeat !== null && <Button onClick={handleStartHand}>Repartir Cartas</Button>}
        {isBettingRoundOver && dealButtonText && <Button onClick={handleDealCommunityClick}>{dealButtonText}</Button>}

        {/* --- NUEVO: Botón para la siguiente mano cuando termina la actual --- */}
        {handState === 'SHOWDOWN' && (
          <Button onClick={handlePrepareNextHand} variant="primary" className="animate-pulse">
            Siguiente Mano
          </Button>
        )}

        {isHandInProgress && activePlayer && (
          <ActionPanel 
            playerName={`Asiento ${activePlayer.seat + 1}`} 
            amountToCall={amountToCall - activePlayer.amountInvestedThisStreet} 
            playerStack={activePlayer.stack} 
            minRaise={blinds.bb * 2}
            onAction={handlePlayerAct}
          />
        )}
      </div>

      {deckSelectorMode && (
        <DeckSelector 
          mode={deckSelectorMode} 
          deck={deck} 
          onConfirm={handleSelectCardsConfirm} 
          onCancel={() => setDeckSelectorMode(null)} 
        />
      )}
    </div>
  );
};

