import { Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import Navbar from './components/Navbar';

import { AuthProvider, useAuth } from './context/AuthContext';

const Home = lazy(() => import('./pages/Home'));
const MovieDetails = lazy(() => import('./pages/MovieDetails'));
const SearchResults = lazy(() => import('./pages/SearchResults'));
const ListingPage = lazy(() => import('./pages/ListingPage'));
const Login = lazy(() => import('./pages/Login'));
const AdminDashboard = lazy(() => import('./pages/AdminDashboard'));
const Profile = lazy(() => import('./pages/Profile'));
const NotFound = lazy(() => import('./pages/NotFound'));

const PageLoader = () => (
  <div style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
    <div className="loader"></div>
  </div>
);

const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) return <PageLoader />;

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return children;
};

function AppContent() {
  const { user, loading } = useAuth();

  if (loading) return <PageLoader />;

  return (
    <Router>
      <div className="app">
        {user && <Navbar />}
        <main>
          <Suspense fallback={<PageLoader />}>
            <Routes>
              <Route path="/login" element={!user ? <Login /> : <Navigate to="/" replace />} />

              <Route path="/" element={<ProtectedRoute><Home /></ProtectedRoute>} />
              <Route path="/admin" element={<ProtectedRoute><AdminDashboard /></ProtectedRoute>} />
              <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
              <Route path="/movie/:slug" element={<ProtectedRoute><MovieDetails /></ProtectedRoute>} />
              <Route path="/search" element={<ProtectedRoute><SearchResults /></ProtectedRoute>} />
              <Route path="/category/:slug" element={<ProtectedRoute><ListingPage /></ProtectedRoute>} />
              <Route path="/country/:slug" element={<ProtectedRoute><ListingPage /></ProtectedRoute>} />
              <Route path="/list/:slug" element={<ProtectedRoute><ListingPage /></ProtectedRoute>} />

              <Route path="*" element={<NotFound />} />
            </Routes>
          </Suspense>
        </main>
        {user && (
          <>
            <footer style={{ padding: '4rem 0', textAlign: 'center', borderTop: '1px solid var(--glass-border)', marginTop: '4rem' }}>
              <div className="container">
                <p style={{ color: 'var(--text-secondary)' }}>&copy; 2026 NETPHIM. All rights reserved.</p>
                <p style={{ fontSize: '0.8rem', marginTop: '1rem', opacity: 0.5 }}>Dữ liệu từ Ophim & KKPhim</p>
              </div>
            </footer>
          </>
        )}
      </div>
    </Router>
  );
}

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;
