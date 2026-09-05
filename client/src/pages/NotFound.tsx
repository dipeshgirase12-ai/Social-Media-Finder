import { Link } from 'react-router-dom';
import { SearchX } from 'lucide-react';
import { Button } from '../components/ui/Button';

export default function NotFound() {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4 text-center">
      <SearchX size={44} className="dt-muted" aria-hidden />
      <h1 className="text-2xl font-bold">Page not found</h1>
      <p className="dt-muted text-sm">The page you are looking for does not exist or has moved.</p>
      <Button to="/">Back to home</Button>
      <p className="dt-muted text-xs">
        Or start a new search from the <Link to="/" className="text-primary-400 hover:text-primary-300">home page</Link>.
      </p>
    </div>
  );
}
