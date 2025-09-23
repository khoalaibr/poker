interface PotProps {
  amount: number;
}

export const Pot = ({ amount }: PotProps) => {
  // No renderizamos nada si el pozo es 0 para mantener la interfaz limpia.
  if (amount === 0) {
    return null;
  }

  return (
    <div className="absolute top-10 left-1/2 -translate-x-1/2 z-10 text-center">
      <div className="rounded-xl border-2 border-slate-500 bg-slate-700 px-6 py-2 shadow-lg">
        <span className="block text-sm font-bold text-slate-300">Pozo</span>
        <span className="text-3xl font-bold text-white">{amount}</span>
      </div>
    </div>
  );
};

