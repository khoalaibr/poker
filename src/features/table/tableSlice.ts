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
  // NEW: Player state properties
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
  // NEW: Game flow properties
  currentPlayerSeat: number | null;
  lastAggressorSeat: number | null;
  amountToCall: number;
  log: LogEntry[];
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
};

// --- HELPER LOGIC ---
/**
 * Finds the next player to act and handles the end of a betting round.
 */
const moveToNextPlayer = (state: TableState) => {
  if (state.currentPlayerSeat === null) return;

  const activePlayers = state.players.filter(p => !p.hasFolded && !p.isAllIn);
  if (activePlayers.length <= 1) {
    // Hand over logic (to be implemented)
    state.currentPlayerSeat = null;
    return;
  }
  
  // End of round check: Does everyone who is still in the hand have the same amount invested?
  const amountsInvested = activePlayers.map(p => p.amountInvestedThisStreet);
  const allMatched = new Set(amountsInvested).size === 1;
  const actionIsClosed = state.currentPlayerSeat === state.lastAggressorSeat || state.lastAggressorSeat === null;

  if (allMatched && actionIsClosed) {
    // End of the betting round, proceed to next street (simplified for now)
    state.handState = state.handState === 'PREFLOP' ? 'FLOP' : 'SHOWDOWN'; // Simplified
    state.players.forEach(p => { p.amountInvestedThisStreet = 0; });
    state.amountToCall = 0;
    const firstPlayerIndex = state.players.findIndex(p => p.seat === state.buttonSeat);
    let nextPlayer = state.players.slice(firstPlayerIndex + 1).find(p => !p.hasFolded);
    if (!nextPlayer) {
      nextPlayer = state.players.find(p => !p.hasFolded);
    }
    state.currentPlayerSeat = nextPlayer ? nextPlayer.seat : null;
    state.lastAggressorSeat = null;
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
    setPlayerCount: (state, action: PayloadAction<number>) => {
      state.players = Array.from({ length: action.payload }, (_, i) => ({
        seat: i,
        stack: 100,
        position: '—',
        hasFolded: false,
        isAllIn: false,
        amountInvestedThisStreet: 0,
      }));
      // Reset everything else
      Object.assign(state, initialState, { players: state.players });
    },
    // ... other reducers like setButtonSeat, setHeroSeat etc. remain the same
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
      if (state.buttonSeat === null) return;
      
      // Reset players' status for the new hand
      state.players.forEach(p => {
        p.hasFolded = false;
        p.isAllIn = false;
        p.amountInvestedThisStreet = 0;
        p.holeCards = undefined;
      });

      // Assign positions
      const positions = getPlayerPositions(state.players.length, state.buttonSeat);
      state.players.forEach((player, index) => {
        player.position = positions[index];
      });

      // Post blinds
      const sbPlayer = state.players.find(p => p.position === 'SB');
      const bbPlayer = state.players.find(p => p.position === 'BB' || (state.players.length === 2 && p.position === 'BTN'));

      let sbAmount = 0, bbAmount = 0;
      if (sbPlayer) {
        sbAmount = Math.min(sbPlayer.stack, state.blinds.sb);
        sbPlayer.stack -= sbAmount;
        sbPlayer.amountInvestedThisStreet = sbAmount;
      }
      if (bbPlayer) {
        bbAmount = Math.min(bbPlayer.stack, state.blinds.bb);
        bbPlayer.stack -= bbAmount;
        bbPlayer.amountInvestedThisStreet = bbAmount;
      }
      
      state.pot = sbAmount + bbAmount;
      state.amountToCall = bbAmount;
      state.deck = shuffleDeck(createDeck());
      
      // Determine who acts first
      const bbIndex = state.players.findIndex(p => p.seat === bbPlayer?.seat);
      const firstToActIndex = (bbIndex + 1) % state.players.length;
      state.currentPlayerSeat = state.players[firstToActIndex].seat;
      state.lastAggressorSeat = bbPlayer ? bbPlayer.seat : null;
      
      state.handState = 'PREFLOP';
      state.log = []; // Clear log for new hand
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
    // --- NEW PLAYER ACTIONS ---
    playerAct: (state, action: PayloadAction<{ seat: number; type: ActionType; amount?: number }>) => {
      const { seat, type, amount = 0 } = action.payload;
      const player = state.players.find(p => p.seat === seat);
      if (!player || player.seat !== state.currentPlayerSeat) return; // Act only on your turn

      state.log.push({ seat, action: type, amount, timestamp: Date.now() });

      switch (type) {
        case 'FOLD':
          player.hasFolded = true;
          break;
        case 'CHECK':
          // Can only check if amountToCall is 0
          if (state.amountToCall > player.amountInvestedThisStreet) return;
          break;
        case 'CALL':
          const callAmount = Math.min(player.stack, state.amountToCall - player.amountInvestedThisStreet);
          player.stack -= callAmount;
          player.amountInvestedThisStreet += callAmount;
          state.pot += callAmount;
          if (player.stack === 0) player.isAllIn = true;
          break;
        case 'BET':
        case 'RAISE':
          // This covers both Bet (amountToCall is 0) and Raise
          const raiseAmount = amount - player.amountInvestedThisStreet;
          if (player.stack < raiseAmount) return; // Not enough stack
          player.stack -= raiseAmount;
          player.amountInvestedThisStreet += raiseAmount;
          state.pot += raiseAmount;
          state.amountToCall = player.amountInvestedThisStreet;
          state.lastAggressorSeat = player.seat;
          if (player.stack === 0) player.isAllIn = true;
          break;
      }
      
      moveToNextPlayer(state);
    },
  },
});

// --- HELPER OUTSIDE SLICE FOR POSITIONS ---
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


export const {
  setPlayerCount,
  setButtonSeat,
  setHeroSeat,
  updatePlayerStack,
  startHand,
  setHeroHoleCards,
  playerAct, // Export the new action
} = tableSlice.actions;

export default tableSlice.reducer;
