import { lazy, Suspense } from 'react';
import { BrowserRouter, Navigate, Route, Routes, Outlet } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import { ToastProvider } from './context/ToastContext';
import { AppLayout } from './components/layout/AppLayout';
import { Spinner } from './components/ui/Card';

const Landing = lazy(() => import('./pages/Landing'));
const Login = lazy(() => import('./pages/auth/Login'));
const Register = lazy(() => import('./pages/auth/Register'));
const ForgotPassword = lazy(() => import('./pages/auth/ForgotPassword'));
const Dashboard = lazy(() => import('./pages/Dashboard'));
const SearchRun = lazy(() => import('./pages/SearchRun'));
const SearchResults = lazy(() => import('./pages/SearchResults'));
const ProfileDetail = lazy(() => import('./pages/ProfileDetail'));
const RepositoryPage = lazy(() => import('./pages/RepositoryPage'));
const History = lazy(() => import('./pages/History'));
const Saved = lazy(() => import('./pages/Saved'));
const Privacy = lazy(() => import('./pages/Privacy'));
const Terms = lazy(() => import('./pages/Terms'));
const Docs = lazy(() => import('./pages/Docs'));
const Admin = lazy(() => import('./pages/Admin'));
const NotFound = lazy(() => import('./pages/NotFound'));

function PageLoader(): JSX.Element {
  return (
    <div className="flex min-h-[50vh] items-center justify-center" role="status" aria-label="Loading page">
      <Spinner />
    </div>
  );
}

/** Redirects unauthenticated users to /login. */
function RequireAuth(): JSX.Element {
  const { user, loading } = useAuth();
  if (loading) return <PageLoader />;
  if (!user) return <Navigate to="/login" replace />;
  return <Outlet />;
}

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <ToastProvider>
          <BrowserRouter>
            <Suspense fallback={<PageLoader />}>
              <Routes>
                <Route path="/demo" element={<SearchRun />} />
                <Route element={<AppLayout />}>
                  <Route path="/" element={<Landing />} />
                  <Route path="/login" element={<Login />} />
                  <Route path="/register" element={<Register />} />
                  <Route path="/forgot-password" element={<ForgotPassword />} />
                  <Route path="/privacy" element={<Privacy />} />
                  <Route path="/terms" element={<Terms />} />
                  <Route path="/docs" element={<Docs />} />
                  <Route path="/search-results" element={<SearchRun />} />
                  <Route path="/search/:searchId" element={<SearchResults />} />
                  <Route path="/profile/:platform/:username" element={<ProfileDetail />} />
                  <Route path="/repository/:owner/:repo" element={<RepositoryPage />} />

                  <Route element={<RequireAuth />}>
                    <Route path="/dashboard" element={<Dashboard />} />
                    <Route path="/history" element={<History />} />
                    <Route path="/saved" element={<Saved />} />
                    <Route path="/admin" element={<Admin />} />
                  </Route>

                  <Route path="*" element={<NotFound />} />
                </Route>
              </Routes>
            </Suspense>
          </BrowserRouter>
        </ToastProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}
