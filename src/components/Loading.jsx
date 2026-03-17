import { Loader2 } from 'lucide-react';

function Loading({ message = 'Loading...' }) {
  return (
    <div className="flex flex-col items-center justify-center py-12">
      <div className="app-card px-5 py-4">
        <div className="flex items-center gap-3">
          <Loader2 className="w-5 h-5 text-emerald-600 animate-spin" />
          <p className="text-sm text-slate-600">{message}</p>
        </div>
      </div>
    </div>
  );
}

export default Loading;
