import { Suspense } from 'react';
import { RouterProvider } from 'react-router-dom';
import { Provider } from 'react-redux';
import { store } from '@/store';
import { router } from '@/router/router';

function App() {
  return (
    <Provider store={store}>
      <Suspense fallback={
        <div className="flex h-screen w-full items-center justify-center bg-white dark:bg-zinc-950">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-t-transparent" />
        </div>
      }>
        <RouterProvider router={router} />
      </Suspense>
    </Provider>
  );
}

export default App;