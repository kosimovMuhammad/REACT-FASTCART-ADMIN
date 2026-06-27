import { Suspense } from 'react';
import { RouterProvider } from 'react-router-dom';
import { Provider } from 'react-redux';
import { Toaster } from 'sonner';
import { TooltipProvider } from '@/components/ui/tooltip';
import { store } from '@/store';
import { router } from '@/router/router';

function App() {
  return (
    <Provider store={store}>
      <TooltipProvider>
        <Suspense fallback={
          <div className="flex h-screen w-full items-center justify-center bg-white dark:bg-zinc-950">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-t-transparent" />
          </div>
        }>
          <RouterProvider router={router} />
        </Suspense>
      </TooltipProvider>
      <Toaster position="top-right" richColors closeButton />
    </Provider>
  );
}

export default App;