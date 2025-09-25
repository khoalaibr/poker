import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import { type Card, createDeck, shuffleDeck, type Deck } from '../../lib/deck';

// --- TYPES ---
export type Position = 'BTN' | 'SB' | 'BB' | 'UTG' | 'MP' | 'CO' | '—';
export type HandState = 'PREHAND' | 'PREFLOP' | 'FLOP' | 'TURN' | 'RIVER' | 'SHOWDOWN';
export type ActionType = 'FOLD' | 'CHECK' | 'CALL' | 'BET' | 'RAISE';

export interface LogEntry {
  seat: number;
  action: ActionType;
  amount?: number;
  timestamp: number;
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
  // NEW: Community cards
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
  board: [], // Initialize board
};

// --- HELPER LOGIC ---
const moveToNextPlayer = (state: TableState) => {
  if (state.currentPlayerSeat === null) return;

  const activePlayers = state.players.filter(p => !p.hasFolded && !p.isAllIn);
  if (activePlayers.length <= 1) {
    state.handState = 'SHOWDOWN'; // Simplified end of hand
    state.currentPlayerSeat = null;
    return;
  }
  
  // Check if the betting round is over
  const lastAggressor = state.players.find(p => p.seat === state.lastAggressorSeat);
  const startPlayerIndex = state.players.findIndex(p => p.seat === (lastAggressor ? lastAggressor.seat : state.buttonSeat));

  let playersToAct = 0;
  for (let i = 0; i < state.players.length; i++) {
    const player = state.players[(startPlayerIndex + i) % state.players.length];
    if (!player.hasFolded && !player.isAllIn) {
      if (player.amountInvestedThisStreet < state.amountToCall) {
        playersToAct++;
      }
    }
  }

  // A special case for the Big Blind pre-flop
  const isPreflop = state.handState === 'PREFLOP';
  const bbPlayer = state.players.find(p => p.position === 'BB');
  const bbCanStillAct = isPreflop && bbPlayer && !bbPlayer.hasFolded && !bbPlayer.isAllIn && bbPlayer.amountInvestedThisStreet === state.amountToCall && state.lastAggressorSeat === bbPlayer.seat;


  if (playersToAct === 0 && !bbCanStillAct) {
    // End of the betting round
    state.currentPlayerSeat = null; // Signal to UI to deal next street
    return;
  }

  // Find next player in turn
  const currentIndex = state.players.findIndex(p => p.seat === state.currentPlayerSeat);
  for (let i = 1; i < state.players.length; i++) {
    const nextIndex = (currentIndex + i) % state.players.length;
    const nextPlayer = state.players[nextIndex];
    if (!nextPlayer.hasFolded && !nextPlayer.isAllIn) {
      state.currentPlayerSeat = nextPlayer.seat;
      return;
    }
  }
};

// --- SLICE ---
export const tableSlice = createSlice({
  name: 'table',
  initialState,
  reducers: {
    // ... setPlayerCount, setButtonSeat, etc. remain the same, just ensure they reset the board
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
      if (state.buttonSeat === null) return;
      state.board = []; // Clear board for new hand
      // ... rest of startHand logic remains the same
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
      state.pot = sbAmount + bbAmount; state.amountToCall = bbAmount; state.deck = shuffleDeck(createDeck());
      const bbIndex = state.players.findIndex(p => p.seat === bbPlayer?.seat);
      const firstToActIndex = (bbIndex + 1) % state.players.length;
      state.currentPlayerSeat = state.players[firstToActIndex].seat;
      state.lastAggressorSeat = bbPlayer ? bbPlayer.seat : null;
      state.handState = 'PREFLOP'; state.log = [];
    },
    setHeroHoleCards: (state, action: PayloadAction<Card[]>) => {
      // ... logic remains the same
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
      // ... logic remains the same
      const { seat, type, amount = 0 } = action.payload;
      const player = state.players.find(p => p.seat === seat);
      if (!player || player.seat !== state.currentPlayerSeat) return;
      state.log.push({ seat, action: type, amount, timestamp: Date.now() });
      switch (type) {
        case 'FOLD': player.hasFolded = true; break;
        case 'CHECK': if (state.amountToCall > player.amountInvestedThisStreet) return; break;
        case 'CALL':
          const callAmount = Math.min(player.stack, state.amountToCall - player.amountInvestedThisStreet);
          player.stack -= callAmount; player.amountInvestedThisStreet += callAmount; state.pot += callAmount;
          if (player.stack === 0) player.isAllIn = true; break;
        case 'BET': case 'RAISE':
          const totalBetAmount = amount; // The amount is the total bet for the street
          const amountToAdd = totalBetAmount - player.amountInvestedThisStreet;
          if (player.stack < amountToAdd) return;
          player.stack -= amountToAdd; player.amountInvestedThisStreet = totalBetAmount; state.pot += amountToAdd;
          state.amountToCall = totalBetAmount; state.lastAggressorSeat = player.seat;
          if (player.stack === 0) player.isAllIn = true; break;
      }
      moveToNextPlayer(state);
    },
    // --- NEW ACTION TO DEAL COMMUNITY CARDS ---
    dealCommunityCards: (state, action: PayloadAction<Card[]>) => {
      const newCards = action.payload;
      // 1. Add cards to board and mark as used
      state.board.push(...newCards);
      newCards.forEach(card => {
        const deckCard = state.deck.find(c => c.id === card.id);
        if (deckCard) deckCard.inUse = true;
      });

      // 2. Transition to next state
      if (state.board.length === 3) state.handState = 'FLOP';
      else if (state.board.length === 4) state.handState = 'TURN';
      else if (state.board.length === 5) state.handState = 'RIVER';

      // 3. Reset betting for the new round
      state.players.forEach(p => { p.amountInvestedThisStreet = 0; });
      state.amountToCall = 0;
      state.lastAggressorSeat = null;

      // 4. Find first player to act (first active player after the button)
      const buttonIndex = state.players.findIndex(p => p.seat === state.buttonSeat);
      for (let i = 1; i <= state.players.length; i++) {
        const player = state.players[(buttonIndex + i) % state.players.length];
        if (!player.hasFolded && !player.isAllIn) {
          state.currentPlayerSeat = player.seat;
          return; // Found the first player
        }
      }
    },
  },
});

// --- HELPER OUTSIDE SLICE FOR POSITIONS ---
const getPlayerPositions = (playerCount: number, buttonSeat: number): Position[] => {
  // ... logic remains the same
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
  dealCommunityCards, // Export the new action
} = tableSlice.actions;

export default tableSlice.reducer;
