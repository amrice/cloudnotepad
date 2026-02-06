import { RouterProvider } from 'react-router-dom';
import { router } from './routes';
import { Providers } from './providers';
import { ToastContainer } from '@/components/ui';

export function App() {
  return (
    <Providers>
      <RouterProvider router={router} />
      <ToastContainer />
    </Providers>
  );
}
