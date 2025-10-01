// Este archivo contiene los textos estáticos para la API, 
// manteniéndolos separados de la lógica principal.

export const PROMPT_TEXT = `Actúas como un ASISTENTE DE PÓKER experto y rápido. Tu tarea: basándote en el JSON de estado de la mano, devuelve la MEJOR ACCIÓN para HERO. Sé conciso. Prioriza la velocidad. Formato de salida: SOLO un JSON con el esquema pedido. No agregues texto fuera del JSON.`;

export const RESPONSE_STRUCTURE = {
  action: "fold|check|call|bet|raise",
  size_bb: "number (optional)",
  reason: "string (optional, very brief)"
};