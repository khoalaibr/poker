export type Suit = "♠" | "♥" | "♦" | "♣";
export type Rank = "A" | "K" | "Q" | "J" | "T" | "9" | "8" | "7" | "6" | "5" | "4" | "3" | "2";

export interface Card {
  rank: Rank;
  suit: Suit;
  id: string; // e.g., "As", "Td"
  inUse?: boolean;
}

export type Deck = Card[];

const SUITS: Suit[] = ["♠", "♥", "♦", "♣"];
const RANKS: Rank[] = ["A", "K", "Q", "J", "T", "9", "8", "7", "6", "5", "4", "3", "2"];
const SUIT_MAP: { [key in Suit]: string } = { "♠": "s", "♥": "h", "♦": "d", "♣": "c" };

export const createDeck = (): Deck => {
  const deck: Deck = [];
  for (const suit of SUITS) {
    for (const rank of RANKS) {
      deck.push({
        rank,
        suit,
        id: `${rank}${SUIT_MAP[suit]}`,
      });
    }
  }
  return deck;
};

export const shuffleDeck = (deck: Deck): Deck => {
  const shuffled = [...deck];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
};

// --- NUEVA LÓGICA DE ORDENAMIENTO ---
const SUIT_ORDER: Suit[] = ["♠", "♥", "♦", "♣"];
const RANK_ORDER: Rank[] = ["A", "K", "Q", "J", "T", "9", "8", "7", "6", "5", "4", "3", "2"];

/**
 * Sorts a deck of cards by suit, then by rank.
 */
export const sortDeck = (deck: Deck): Deck => {
  return [...deck].sort((a, b) => {
    const suitComparison = SUIT_ORDER.indexOf(a.suit) - SUIT_ORDER.indexOf(b.suit);
    if (suitComparison !== 0) {
      return suitComparison;
    }
    return RANK_ORDER.indexOf(a.rank) - RANK_ORDER.indexOf(b.rank);
  });
};

