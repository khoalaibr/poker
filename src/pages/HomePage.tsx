import { useState } from 'react';
import { useNavigate } from 'react-router-dom'; // 1. Importar useNavigate
import { useDispatch } from 'react-redux'; // 2. Importar useDispatch
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { setPlayerCount } from '../features/table/tableSlice';

const HomePage = () => {
  const [numPlayers, setNumPlayers] = useState<number>(6);
  const navigate = useNavigate(); // 4. Inicializar hooks
  const dispatch = useDispatch();

  const handlePlayersChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value, 10);
    if (value >= 2 && value <= 10) {
      setNumPlayers(value);
    } else if (e.target.value === '') {
      setNumPlayers(0);
    }
  };

  const handleStartGame = () => {
    // 5. Despachar la acción y navegar
    dispatch(setPlayerCount(numPlayers));
    navigate('/table');
  };

  return (
    <div className="flex min-h-[80vh] flex-col items-center justify-center">
      <div className="w-full max-w-sm rounded-lg border border-slate-200 bg-white p-8 shadow-sm">
        <div className="text-center">
          <h1 className="text-3xl font-bold tracking-tight text-slate-800">
            Poker Hand Logger
          </h1>
          <p className="mt-2 text-slate-600">
            Configura la partida para empezar a registrar.
          </p>
        </div>

        <div className="mt-8 space-y-4">
          <div>
            <label htmlFor="numPlayers" className="block text-sm font-medium text-slate-700">
              Número de Jugadores (2-10)
            </label>
            <Input
              id="numPlayers"
              type="number"
              value={numPlayers === 0 ? '' : numPlayers}
              onChange={handlePlayersChange}
              min="2"
              max="10"
              className="mt-1"
            />
          </div>
          <Button 
            onClick={handleStartGame} 
            disabled={numPlayers < 2 || numPlayers > 10}
            className="w-full"
          >
            Iniciar Partida
          </Button>
        </div>
      </div>
    </div>
  );
};

export default HomePage;

