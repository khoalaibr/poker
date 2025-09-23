import { Outlet } from 'react-router-dom';

function App() {
  return (
    // Contenedor principal con estilos base
    <div className="min-h-screen bg-gray-50 font-sans text-gray-900 antialiased">
      {/* Aquí irán componentes de layout como Header, Sidebar, etc. */}
      
      {/* El componente Outlet renderizará la ruta hija que corresponda */}
      <main className="p-4 sm:p-6 lg:p-8">
        <Outlet />
      </main>
    </div>
  );
}

export default App;