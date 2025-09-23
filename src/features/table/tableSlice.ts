import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import { createDeck, shuffleDeck, type Card } from '../../lib/deck';

// DEFINICIÓN DE TIPOS
export type Position = 'BTN' | 'SB' | 'BB' | 'UTG' | 'MP' | 'CO' | '—';
export type HandState = 'PREHAND' | 'PREFLOP' | 'FLOP' | 'TURN' | 'RIVER' | 'SHOWDOWN';

export interface Player {
  seat: number;
  stack: number;
  position: Position;
  holeCards?: Card[];
}

export interface TableState {
  players: Player[];
  buttonSeat: number | null;
  heroSeat: number | null;
  blinds: { sb: number; bb: number };
  pot: number;
  deck: Card[];
  handState: HandState;
}

// ESTADO INICIAL
const initialState: TableState = {
  players: [],
  buttonSeat: null,
  heroSeat: null,
  blinds: { sb: 1, bb: 2 },
  pot: 0,
  deck: [],
  handState: 'PREHAND',
};

// LÓGICA DE POSICIONES
const getPlayerPositions = (playerCount: number, buttonSeat: number): Position[] => {
  const positions: Position[] = Array(playerCount).fill('—');
  if (playerCount < 2) return positions;

  if (playerCount === 2) {
    positions[buttonSeat] = 'BTN';
    positions[(buttonSeat + 1) % playerCount] = 'BB';
    return positions;
  }

  const sbIndex = (buttonSeat + 1) % playerCount;
  const bbIndex = (buttonSeat + 2) % playerCount;
  
  positions[buttonSeat] = 'BTN';
  positions[sbIndex] = 'SB';
  positions[bbIndex] = 'BB';
  
  const positionOrder: Position[] = ['UTG', 'MP', 'CO'];
  let currentPosIndex = 0;
  for (let i = 3; i < playerCount; i++) {
    const playerIndex = (buttonSeat + i) % playerCount;
    positions[playerIndex] = positionOrder[currentPosIndex] ?? 'MP';
    if(currentPosIndex < positionOrder.length - 1) currentPosIndex++;
  }
  
  return positions;
};

// SLICE
export const tableSlice = createSlice({
  name: 'table',
  initialState,
  reducers: {
    setPlayerCount: (state, action: PayloadAction<number>) => {
      state.players = Array.from({ length: action.payload }, (_, i) => ({
        seat: i,
        stack: 100,
        position: '—',
      }));
      state.buttonSeat = null;
      state.heroSeat = null;
      state.handState = 'PREHAND';
      state.pot = 0;
    },
    setButtonSeat: (state, action: PayloadAction<number | null>) => {
      state.buttonSeat = action.payload;
    },
    setHeroSeat: (state, action: PayloadAction<number | null>) => {
      state.heroSeat = action.payload;
    },
    updatePlayerStack: (state, action: PayloadAction<{ seat: number; stack: number }>) => {
      const player = state.players.find(p => p.seat === action.payload.seat);
      if (player) {
        player.stack = action.payload.stack;
      }
    },
    startHand: (state) => {
      // --- INICIO DE DEPURACIÓN ---
      console.log('[startHand] La acción ha comenzado.');
      console.log('[startHand] El valor de buttonSeat es:', state.buttonSeat);

      if (state.buttonSeat === null) {
        console.error('[startHand] SALIDA ANTICIPADA: buttonSeat es nulo. La acción no continuará.');
        return;
      }
      // --- FIN DE DEPURACIÓN ---
      
      // 1. Asignar posiciones
      const positions = getPlayerPositions(state.players.length, state.buttonSeat);
      state.players.forEach((player, index) => {
        player.position = positions[index];
      });

      // 2. Postear ciegas y crear pozo
      const sbPlayer = state.players.find(p => p.position === 'SB');
      const bbPlayer = state.players.find(p => p.position === 'BB' || (state.players.length === 2 && p.position === 'BTN'));

      let sbAmount = 0;
      let bbAmount = 0;

      if (sbPlayer && sbPlayer.stack > 0) {
        sbAmount = Math.min(sbPlayer.stack, state.blinds.sb);
        sbPlayer.stack -= sbAmount;
      }
      if (bbPlayer && bbPlayer.stack > 0) {
        bbAmount = Math.min(bbPlayer.stack, state.blinds.bb);
        bbPlayer.stack -= bbAmount;
      }
      
      state.pot = sbAmount + bbAmount;
      
      // 3. Preparar el mazo
      state.deck = shuffleDeck(createDeck());
      
      console.log('[startHand] Todo ha ido bien, se va a cambiar el estado a PREFLOP.');
      // 4. Cambiar el estado de la mano
      state.handState = 'PREFLOP';
    },
    setHeroHoleCards: (state, action: PayloadAction<Card[]>) => {
      if (state.heroSeat !== null) {
        const hero = state.players.find(p => p.seat === state.heroSeat);
        if (hero) {
          hero.holeCards = action.payload;
          action.payload.forEach(card => {
            const deckCard = state.deck.find(c => c.id === card.id);
            if (deckCard) deckCard.inUse = true;
          });
        }
      }
    },
  },
});

export const {
  setPlayerCount,
  setButtonSeat,
  setHeroSeat,
  updatePlayerStack,
  startHand,
  setHeroHoleCards,
} = tableSlice.actions;

export default tableSlice.reducer;


