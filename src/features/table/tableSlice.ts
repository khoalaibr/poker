import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import { type Card, createDeck, shuffleDeck, type Deck } from '../../lib/deck';

// --- TYPES ---
export type Position = 'BTN' | 'SB' | 'BB' | 'UTG' | 'MP' | 'CO' | '—';
export type HandState = 'PREHAND' | 'PREFLOP' | 'FLOP' | 'TURN' | 'RIVER' | 'SHOWDOWN';
export type ActionType = 'FOLD' | 'CHECK' | 'CALL' | 'BET' | 'RAISE';

// Usamos tu nombre 'LogEntry' para mantener la consistencia
export interface LogEntry {
  seat: number;
  action: ActionType;
  amount?: number;
  timestamp: number;
  street: HandState; // Propiedad para saber en qué calle ocurrió la acción
}

export interface Player {
  seat: number;
  stack: number;
  position: Position;
  holeCards?: Card[];
  hasFolded: boolean;
  isAllIn: boolean;
  amountInvestedThisStreet: number;
}

export interface TableState {
  players: Player[];
  buttonSeat: number | null;
  heroSeat: number | null;
  blinds: { sb: number; bb: number };
  pot: number;
  deck: Deck;
  handState: HandState;
  currentPlayerSeat: number | null;
  lastAggressorSeat: number | null;
  amountToCall: number;
  log: LogEntry[];
  board: Card[];
}

// --- INITIAL STATE ---
const initialState: TableState = {
  players: [],
  buttonSeat: null,
  heroSeat: null,
  blinds: { sb: 1, bb: 2 },
  pot: 0,
  deck: [],
  handState: 'PREHAND',
  currentPlayerSeat: null,
  lastAggressorSeat: null,
  amountToCall: 0,
  log: [],
  board: [],
};

// --- HELPER LOGIC ---
const getNextPlayerSeat = (state: TableState, startIndex: number): number | null => {
  for (let i = 1; i <= state.players.length; i++) {
    const nextIndex = (startIndex + i) % state.players.length;
    const nextPlayer = state.players[nextIndex];
    if (!nextPlayer.hasFolded && !nextPlayer.isAllIn) {
      return nextPlayer.seat;
    }
  }
  return null;
};

// --- SLICE ---
export const tableSlice = createSlice({
  name: 'table',
  initialState,
  reducers: {
    // --- NUEVO: Acción para reiniciar el juego por completo ---
    resetGame: () => {
      return initialState;
    },
    // --- NUEVO: Acción para preparar la siguiente mano ---
    prepareNextHand: (state) => {
      if (state.buttonSeat === null) return;
      
      const currentIndex = state.players.findIndex(p => p.seat === state.buttonSeat);
      const nextButtonPlayer = state.players[(currentIndex + 1) % state.players.length];
      state.buttonSeat = nextButtonPlayer.seat;

      state.handState = 'PREHAND';
      state.pot = 0;
      state.board = [];
      state.log = [];
      state.currentPlayerSeat = null;
      state.amountToCall = 0;
      state.lastAggressorSeat = null;

      state.players.forEach(player => {
        player.holeCards = undefined;
        player.hasFolded = false;
        player.isAllIn = false;
        player.amountInvestedThisStreet = 0;
        player.position = '—';
      });
    },
    setPlayerCount: (state, action: PayloadAction<number>) => {
      state.players = Array.from({ length: action.payload }, (_, i) => ({
        seat: i, stack: 100, position: '—', hasFolded: false, isAllIn: false, amountInvestedThisStreet: 0,
      }));
      Object.assign(state, initialState, { players: state.players });
    },
    setButtonSeat: (state, action: PayloadAction<number | null>) => { state.buttonSeat = action.payload; },
    setHeroSeat: (state, action: PayloadAction<number | null>) => { state.heroSeat = action.payload; },
    updatePlayerStack: (state, action: PayloadAction<{ seat: number; stack: number }>) => {
      const player = state.players.find(p => p.seat === action.payload.seat);
      if (player) player.stack = action.payload.stack;
    },
    startHand: (state) => {
      // (código de startHand existente, sin cambios)
      if (state.buttonSeat === null) return;
      state.board = [];
      state.players.forEach(p => {
        p.hasFolded = false; p.isAllIn = false; p.amountInvestedThisStreet = 0; p.holeCards = undefined;
      });
      const positions = getPlayerPositions(state.players.length, state.buttonSeat);
      state.players.forEach((player, index) => { player.position = positions[index]; });

      const sbPlayer = state.players.find(p => p.position === 'SB');
      const bbPlayer = state.players.find(p => p.position === 'BB' || (state.players.length === 2 && p.position === 'BTN'));
      
      let sbAmount = 0, bbAmount = 0;
      if (sbPlayer) {
        sbAmount = Math.min(sbPlayer.stack, state.blinds.sb);
        sbPlayer.stack -= sbAmount; sbPlayer.amountInvestedThisStreet = sbAmount;
      }
      if (bbPlayer) {
        bbAmount = Math.min(bbPlayer.stack, state.blinds.bb);
        bbPlayer.stack -= bbAmount; bbPlayer.amountInvestedThisStreet = bbAmount;
      }
      state.pot = sbAmount + bbAmount;
      state.amountToCall = state.blinds.bb;
      state.deck = shuffleDeck(createDeck());
      
      const bbIndex = state.players.findIndex(p => p.seat === bbPlayer?.seat);
      const firstToActIndex = (bbIndex + 1) % state.players.length;
      state.currentPlayerSeat = state.players[firstToActIndex].seat;
      state.lastAggressorSeat = bbPlayer ? bbPlayer.seat : null;
      state.handState = 'PREFLOP';
      state.log = [];
    },
    setHeroHoleCards: (state, action: PayloadAction<Card[]>) => {
      // (código existente, sin cambios)
      if (state.heroSeat === null) return;
      const hero = state.players.find(p => p.seat === state.heroSeat);
      if (hero) {
        hero.holeCards = action.payload;
        action.payload.forEach(card => {
          const deckCard = state.deck.find(c => c.id === card.id);
          if (deckCard) deckCard.inUse = true;
        });
      }
    },
    playerAct: (state, action: PayloadAction<{ seat: number; type: ActionType; amount?: number }>) => {
      const { seat, type, amount = 0 } = action.payload;
      const player = state.players.find(p => p.seat === seat);
      if (!player || player.seat !== state.currentPlayerSeat) return;
      // --- MODIFICADO: Usamos LogEntry y añadimos la propiedad 'street' ---
      state.log.push({ seat, action: type, amount, timestamp: Date.now(), street: state.handState });

      switch (type) {
        // (código del switch existente, sin cambios)
        case 'FOLD':
          player.hasFolded = true;
          break;
        case 'CHECK':
          if (state.amountToCall > player.amountInvestedThisStreet) return;
          break;
        case 'CALL':
          const callAmount = Math.min(player.stack + player.amountInvestedThisStreet, state.amountToCall) - player.amountInvestedThisStreet;
          player.stack -= callAmount;
          player.amountInvestedThisStreet += callAmount;
          state.pot += callAmount;
          if (player.stack === 0) player.isAllIn = true;
          break;
        case 'BET':
        case 'RAISE':
          const totalBet = amount;
          const amountToAdd = totalBet - player.amountInvestedThisStreet;
          if (amountToAdd > player.stack) return;
          player.stack -= amountToAdd;
          player.amountInvestedThisStreet = totalBet;
          state.pot += amountToAdd;
          state.amountToCall = totalBet;
          state.lastAggressorSeat = player.seat;
          if (player.stack === 0) player.isAllIn = true;
          break;
      }
      
      // --- LÓGICA MEJORADA para determinar el fin de la ronda/mano ---
      const activePlayers = state.players.filter(p => !p.hasFolded);
      if (activePlayers.length === 1) {
        state.handState = 'SHOWDOWN';
        state.currentPlayerSeat = null;
        return;
      }

      const playersWhoCanAct = state.players.filter(p => !p.hasFolded && !p.isAllIn);
      const aggressor = state.players.find(p => p.seat === state.lastAggressorSeat);
      
      const actionIsClosed = playersWhoCanAct.every(p => 
        (p.amountInvestedThisStreet === state.amountToCall) || p.seat === aggressor?.seat
      );
      
      if (actionIsClosed && aggressor) {
        if (state.handState === 'RIVER') {
            state.handState = 'SHOWDOWN';
        }
        state.currentPlayerSeat = null;
        return;
      }

      const currentIndex = state.players.findIndex(p => p.seat === state.currentPlayerSeat);
      state.currentPlayerSeat = getNextPlayerSeat(state, currentIndex);
    },
    dealCommunityCards: (state, action: PayloadAction<Card[]>) => {
      // (código existente, sin cambios)
      const newCards = action.payload;
      state.board.push(...newCards);
      newCards.forEach(card => {
        const deckCard = state.deck.find(c => c.id === card.id);
        if (deckCard) deckCard.inUse = true;
      });

      if (state.board.length === 3) state.handState = 'FLOP';
      else if (state.board.length === 4) state.handState = 'TURN';
      else if (state.board.length === 5) state.handState = 'RIVER';

      state.players.forEach(p => { p.amountInvestedThisStreet = 0; });
      state.amountToCall = 0;
      state.lastAggressorSeat = null;

      const buttonIndex = state.players.findIndex(p => p.seat === state.buttonSeat);
      state.currentPlayerSeat = getNextPlayerSeat(state, buttonIndex);
    },
  },
});

const getPlayerPositions = (playerCount: number, buttonSeat: number): Position[] => {
  // (código existente, sin cambios)
  const positions: Position[] = Array(playerCount).fill('—');
  if (playerCount < 2) return positions;
  if (playerCount === 2) {
    positions[buttonSeat] = 'BTN';
    positions[(buttonSeat + 1) % playerCount] = 'BB';
    return positions;
  }
  const sbIndex = (buttonSeat + 1) % playerCount; const bbIndex = (buttonSeat + 2) % playerCount;
  positions[buttonSeat] = 'BTN'; positions[sbIndex] = 'SB'; positions[bbIndex] = 'BB';
  const positionOrder: Position[] = ['UTG', 'MP', 'CO']; let currentPosIndex = 0;
  for (let i = 3; i < playerCount; i++) {
    const playerIndex = (buttonSeat + i) % playerCount;
    positions[playerIndex] = positionOrder[currentPosIndex] ?? 'MP';
    if(currentPosIndex < positionOrder.length - 1) currentPosIndex++;
  }
  return positions;
};

export const {
  setPlayerCount,
  setButtonSeat,
  setHeroSeat,
  updatePlayerStack,
  startHand,
  setHeroHoleCards,
  playerAct,
  dealCommunityCards,
  // --- NUEVO: Exportamos las nuevas acciones ---
  resetGame,
  prepareNextHand,
} = tableSlice.actions;

export default tableSlice.reducer;

