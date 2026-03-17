import { Link, useNavigate } from 'react-router-dom';
import { Trash2, LogOut } from 'lucide-react';
import { isAuthenticated, isAdmin, logout } from '../utils/auth';

function Navbar() {
  const navigate = useNavigate();
  const authenticated = isAuthenticated();
  const admin = isAdmin();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="sticky top-0 z-50 border-b border-slate-200/70 app-surface">
      <div className="app-container">
        <div className="flex h-16 items-center justify-between">
          <Link to="/" className="flex items-center gap-2 font-semibold tracking-tight text-slate-900">
            <span className="inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-emerald-600 text-white shadow-sm shadow-emerald-900/15">
              <Trash2 className="h-5 w-5" />
            </span>
            <span className="text-base sm:text-lg">Garbage Reporter</span>
          </Link>

          <div className="flex items-center gap-1 sm:gap-2">
            <Link to="/" className="app-btn-ghost">
              Home
            </Link>

            {authenticated ? (
              <>
                <Link
                  to={admin ? '/admin' : '/dashboard'}
                  className="app-btn-ghost"
                >
                  Dashboard
                </Link>
                <button
                  onClick={handleLogout}
                  className="app-btn-ghost"
                >
                  <LogOut className="w-4 h-4" />
                  <span className="hidden sm:inline">Logout</span>
                </button>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  className="app-btn-ghost"
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  className="app-btn-primary"
                >
                  Register
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;
