export type Suit = "♠" | "♥" | "♦" | "♣";
export type Rank = "A" | "K" | "Q" | "J" | "T" | "9" | "8" | "7" | "6" | "5" | "4" | "3" | "2";

export type Deck = Card[];

export interface Card {
  rank: Rank;
  suit: Suit;
  id: string; // e.g., "As", "Td"
  // SOLUCIÓN: Añadimos la propiedad para rastrear si la carta está en juego.
  // Es opcional (?) porque al crear el mazo, ninguna carta está en uso todavía.
  inUse?: boolean;
}

const SUITS: Suit[] = ["♠", "♥", "♦", "♣"];
const RANKS: Rank[] = ["A", "K", "Q", "J", "T", "9", "8", "7", "6", "5", "4", "3", "2"];
// Mapeo para generar IDs únicos y cortos para las cartas
const SUIT_MAP: { [key in Suit]: string } = { "♠": "s", "♥": "h", "♦": "d", "♣": "c" };


export const createDeck = (): Card[] => {
  const deck: Card[] = [];
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

// Usamos el algoritmo Fisher-Yates para un barajado eficiente
export const shuffleDeck = (deck: Card[]): Card[] => {
  const shuffled = [...deck];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]; // Intercambio de elementos
  }
  return shuffled;
};

