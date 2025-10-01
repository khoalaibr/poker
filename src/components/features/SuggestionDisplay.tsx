import type { AiSuggestion } from '../../lib/aiHelper';

interface SuggestionDisplayProps {
  isLoading: boolean;
  suggestion: AiSuggestion;
  onApply: (suggestion: AiSuggestion) => void;
}

export const SuggestionDisplay = ({ isLoading, suggestion, onApply }: SuggestionDisplayProps) => {
  if (isLoading) {
    return (
      <div className="flex items-center justify-center gap-2 rounded-lg bg-slate-900/80 px-4 py-2 text-white backdrop-blur-sm">
        <div className="h-5 w-5 animate-spin rounded-full border-2 border-slate-500 border-t-slate-200"></div>
        <span>Obteniendo sugerencia...</span>
      </div>
    );
  }

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onApply(suggestion);
  };

  const text = `${suggestion.action.toUpperCase()}${suggestion.size_bb ? ` ${suggestion.size_bb}bb` : ''}`;

  return (
    <button
      onClick={handleClick}
      className="flex items-center justify-center gap-2 rounded-lg bg-amber-500/90 px-4 py-2 text-slate-900 font-bold shadow-lg transition-transform hover:scale-105 backdrop-blur-sm"
      title={suggestion.reason || 'Aplicar esta acción'}
    >
      <span>Sugerencia: {text}</span>
    </button>
  );
};

