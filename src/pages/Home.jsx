import { Link } from 'react-router-dom';
import { Trash2, MapPin, Bell, CheckCircle } from 'lucide-react';
import { isAuthenticated, isAdmin } from '../utils/auth';

function Home() {
  const authenticated = isAuthenticated();
  const admin = isAdmin();

  return (
    <div className="min-h-screen">
      <div className="relative overflow-hidden bg-[radial-gradient(1200px_circle_at_15%_10%,rgba(16,185,129,0.35),transparent_45%),radial-gradient(900px_circle_at_90%_0%,rgba(14,165,233,0.22),transparent_40%),linear-gradient(to_bottom,rgba(15,23,42,1),rgba(15,23,42,0.92))] text-white">
        <div className="pointer-events-none absolute inset-0 opacity-40 [background-image:linear-gradient(to_right,rgba(255,255,255,0.07)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.07)_1px,transparent_1px)] [background-size:48px_48px]" />
        <div className="relative app-container py-16 sm:py-20">
          <div className="mx-auto max-w-3xl text-center">
            <div className="mb-6 flex justify-center">
              <span className="inline-flex h-16 w-16 items-center justify-center rounded-3xl bg-white/10 ring-1 ring-white/15 backdrop-blur">
                <Trash2 className="h-9 w-9" />
              </span>
            </div>
            <h1 className="text-4xl sm:text-5xl font-semibold tracking-tight">
              Keep your city clean
            </h1>
            <p className="mt-5 text-base sm:text-lg text-white/80">
              Report garbage issues in your neighborhood and help make our city cleaner and greener.
            </p>
            <div className="mt-8 flex flex-col sm:flex-row justify-center gap-3">
              {authenticated ? (
                <Link
                  to={admin ? '/admin' : '/dashboard'}
                  className="app-btn bg-white text-slate-900 hover:bg-white/90"
                >
                  Go to Dashboard
                </Link>
              ) : (
                <>
                  <Link
                    to="/register"
                    className="app-btn bg-white text-slate-900 hover:bg-white/90"
                  >
                    Get Started
                  </Link>
                  <Link
                    to="/login"
                    className="app-btn bg-emerald-600 text-white hover:bg-emerald-700 ring-1 ring-white/20"
                  >
                    Login
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="app-container py-14">
        <div className="mx-auto max-w-4xl text-center">
          <h2 className="text-2xl sm:text-3xl font-semibold tracking-tight text-slate-900">
            How it works
          </h2>
          <p className="mt-2 text-sm sm:text-base text-slate-600">
            A simple flow from report → action → resolution.
          </p>
        </div>

        <div className="mt-10 grid gap-6 md:grid-cols-3">
          <div className="app-card app-card-hover p-7 text-center">
            <div className="mx-auto mb-4 inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-50 ring-1 ring-emerald-100">
              <MapPin className="w-8 h-8 text-emerald-600" />
            </div>
            <h3 className="text-base font-semibold text-slate-900">1. Report</h3>
            <p className="mt-2 text-sm text-slate-600">Add a location, short description, and optional photo.</p>
          </div>

          <div className="app-card app-card-hover p-7 text-center">
            <div className="mx-auto mb-4 inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-sky-50 ring-1 ring-sky-100">
              <Bell className="w-8 h-8 text-emerald-600" />
            </div>
            <h3 className="text-base font-semibold text-slate-900">2. Track</h3>
            <p className="mt-2 text-sm text-slate-600">See updates as your complaint moves through the system.</p>
          </div>

          <div className="app-card app-card-hover p-7 text-center">
            <div className="mx-auto mb-4 inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-50 ring-1 ring-emerald-100">
              <CheckCircle className="w-8 h-8 text-emerald-600" />
            </div>
            <h3 className="text-base font-semibold text-slate-900">3. Resolve</h3>
            <p className="mt-2 text-sm text-slate-600">Authorities take action and mark the issue as cleaned.</p>
          </div>
        </div>
      </div>

      <div className="border-t border-slate-200/70 bg-white">
        <div className="app-container py-14">
          <div className="app-card p-8 sm:p-10 flex flex-col items-center text-center">
            <h2 className="text-2xl sm:text-3xl font-semibold tracking-tight text-slate-900">
              Ready to make a difference?
            </h2>
            <p className="mt-3 text-sm sm:text-base text-slate-600 max-w-2xl">
              Join citizens working together for a cleaner city — one report at a time.
            </p>
          {!authenticated && (
            <Link
              to="/register"
              className="mt-6 app-btn-primary px-8 py-3"
            >
              Sign Up Now
            </Link>
          )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Home;
