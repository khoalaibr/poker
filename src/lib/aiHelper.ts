import type { TableState, LogEntry } from '../features/table/tableSlice';
import { PROMPT_TEXT, RESPONSE_STRUCTURE } from './prompt';

// Lo que esperamos que la API de la IA nos devuelva
export interface AiSuggestion {
  action: 'fold' | 'check' | 'call' | 'bet' | 'raise';
  size_bb?: number;
  reason?: string;
}

// Interfaz para el cuerpo de la solicitud a la API
interface ApiRequestBody {
  prompt: string;
  data_json: any;
  structure_json: any;
}

const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:8007/generate';

// --- FUNCIÓN ÚNICA Y PRINCIPAL ---
export const getAiSuggestion = async (tableState: TableState): Promise<AiSuggestion | null> => {
  if (!apiUrl) {
    console.error("Error: VITE_API_URL no está definida en tu archivo .env.local");
    return null;
  }

  const handData = buildHandData(tableState);

  const requestBody: ApiRequestBody = {
    prompt: PROMPT_TEXT,
    data_json: handData,
    structure_json: RESPONSE_STRUCTURE,
  };

  try {
    console.log("Enviando a la API de IA:", JSON.stringify(requestBody, null, 2));
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`La API respondió con un error ${response.status}:`, errorText);
      return null;
    }

    const suggestion: AiSuggestion = await response.json();
    console.log("Sugerencia recibida de la IA:", suggestion);
    return suggestion;

  } catch (error) {
    console.error("Error de red al contactar la API:", error);
    return null;
  }
};

// --- Funciones auxiliares para construir el JSON ---
const buildHandData = (state: TableState) => {
    const hero = state.players.find(p => p.seat === state.heroSeat);
    const activePlayer = state.players.find(p => p.seat === state.currentPlayerSeat);
    const bbSize = state.blinds.bb;
  
    const formatHistory = (history: LogEntry[]) => {
      // Nota: Esta es una simplificación. Para un historial por calles (flop, turn, etc.)
      // necesitaríamos que LogEntry tuviera una propiedad 'street'.
      const streets: Record<string, any[]> = { preflop: [], flop: [], turn: [], river: [] };
      
      history.forEach(entry => {
        const actorPos = state.players.find(p => p.seat === entry.seat)?.position || 'Unknown';
        const actionDetail: any = { actor: actorPos, action: entry.action.toLowerCase() };
        if (entry.amount) {
          actionDetail.size_bb = entry.amount / bbSize;
        }
        // Simplificación: Asumimos que toda la acción es preflop por ahora.
        streets.preflop.push(actionDetail);
      });
      return streets;
    };
    
    // Calcula el raise mínimo permitido en la situación actual
    const lastRaiseAmount = state.log
        .filter(a => a.action === 'RAISE' || a.action === 'BET')
        .reduce((max, a) => Math.max(max, a.amount || 0), 0);
    const minRaise = (state.amountToCall + (lastRaiseAmount > state.blinds.bb ? lastRaiseAmount : state.blinds.bb));

    return {
      hand: {
        street: state.handState.toLowerCase(),
        board: state.board.map(c => c.id),
        pot_bb: state.pot / bbSize,
        to_act: activePlayer?.position || 'Unknown',
      },
      hero: {
        position: hero?.position || 'Unknown',
        stack_bb: (hero?.stack || 0) / bbSize,
        cards: hero?.holeCards?.map(c => c.id) || [],
      },
      players: state.players
        .filter(p => !p.hasFolded)
        .map(p => ({
          id: `P${p.seat}`,
          position: p.position,
          stack_bb: p.stack / bbSize,
        })),
      action_history: formatHistory(state.log),
      legal_actions: {
        can_check: state.amountToCall <= (activePlayer?.amountInvestedThisStreet || 0),
        can_call: state.amountToCall > (activePlayer?.amountInvestedThisStreet || 0),
        amount_to_call_bb: (state.amountToCall - (activePlayer?.amountInvestedThisStreet || 0)) / bbSize,
        min_raise_to_bb: minRaise / bbSize,
        max_raise_to_bb: ((activePlayer?.stack || 0) + (activePlayer?.amountInvestedThisStreet || 0)) / bbSize,
      }
    };
  };