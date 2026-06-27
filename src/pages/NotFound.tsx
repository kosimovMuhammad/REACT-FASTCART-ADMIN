import { useNavigate } from 'react-router-dom';
import { Home, ArrowLeft } from 'lucide-react';

export default function NotFound() {
  const navigate = useNavigate();
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-zinc-50 dark:bg-zinc-950 p-6 text-center">
      <h1 className="text-8xl font-extrabold text-indigo-600 dark:text-indigo-400 mb-2">404</h1>
      <h2 className="text-2xl font-bold text-zinc-900 dark:text-white mb-3">Page Not Found</h2>
      <p className="text-zinc-500 dark:text-zinc-400 max-w-sm mb-8">
        The page you are looking for doesn't exist or has been moved.
      </p>
      <div className="flex items-center gap-3">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-zinc-700 dark:text-zinc-300 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors shadow-sm"
        >
          <ArrowLeft size={16} />
          Go Back
        </button>
        <button
          onClick={() => navigate('/dashboard')}
          className="flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-500 rounded-lg transition-colors shadow-sm"
        >
          <Home size={16} />
          Dashboard
        </button>
      </div>
    </div>
  );
}
