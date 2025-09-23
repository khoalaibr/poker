import { createBrowserRouter } from 'react-router-dom';
import App from '../App';
import HomePage from '../pages/HomePage';
import StyleGuidePage from '../pages/StyleGuidePage';
import { TablePage } from '../pages/TablePage';

export const router = createBrowserRouter([
  {
    path: '/',
    element: <App />,
    children: [
      {
        index: true,
        element: <HomePage />,
      },
      {
        path: 'style-guide',
        element: <StyleGuidePage />,
      },
      // 2. Añadir la nueva ruta para la mesa
      {
        path: 'table',
        element: <TablePage />,
      },
    ],
  },
]);

