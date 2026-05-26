import { lazy, Suspense } from 'react';
import { HashRouter, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import useAppController from './controllers/useAppController';
import LoadingSpinner from './views/components/LoadingSpinner';
import GlobalAlert from './views/components/GlobalAlert';
import AuthLayout from './views/layouts/AuthLayout';
import MainLayout from './views/layouts/MainLayout';

// Lazy loading views for optimized performance
const LoginView = lazy(() => import('./views/pages/LoginView'));
const DashboardView = lazy(() => import('./views/pages/DashboardView'));
const POSView = lazy(() => import('./views/pages/POSView'));
const ProductView = lazy(() => import('./views/pages/ProductView'));
const RecipeView = lazy(() => import('./views/pages/RecipeView'));
const UserManagementView = lazy(() => import('./views/pages/UserManagementView'));
const InventoryView = lazy(() => import('./views/pages/InventoryView'));
const FinanceView = lazy(() => import('./views/pages/FinanceView'));

// Guard component for restricted views (requires authentication & specific roles)
function ProtectedRoute({ controller, allowedRoles, children }) {
  if (!controller.activeUser) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(controller.activeUser.role)) {
    // Redirect staff who don't have access permissions (e.g. cashier to POS cashier panel)
    return <Navigate to={controller.activeUser.role === 'kasir' ? '/pos' : '/'} replace />;
  }

  return children;
}

// Guard component to redirect already logged in users away from login pages
function PublicRoute({ controller, children }) {
  if (controller.activeUser) {
    return <Navigate to={controller.activeUser.role === 'admin' ? '/' : '/pos'} replace />;
  }
  return children;
}

function AppContent() {
  const navigate = useNavigate();
  const controller = useAppController(navigate);

  return (
    <>
      {/* Global Action Toast Notification Banner */}
      {controller.globalAlert && (
        <GlobalAlert 
          message={controller.globalAlert.message} 
          type={controller.globalAlert.type} 
        />
      )}

      {/* Code Splitting & Lazy Loaded views using Suspense with a spinning React logo */}
      <Suspense fallback={<LoadingSpinner />}>
        <Routes>
          {/* Authentication Routes Layout */}
          <Route
            path="/login"
            element={
              <PublicRoute controller={controller}>
                <AuthLayout />
              </PublicRoute>
            }
          >
            <Route index element={<LoginView controller={controller} />} />
          </Route>

          {/* Core App Main Interface Layout */}
          <Route
            path="/"
            element={
              <ProtectedRoute controller={controller}>
                <MainLayout controller={controller} />
              </ProtectedRoute>
            }
          >
            {/* Index redirection based on role */}
            <Route
              index
              element={
                controller.activeUser?.role === 'admin' ? (
                  <DashboardView controller={controller} />
                ) : (
                  <Navigate to="/pos" replace />
                )
              }
            />

            {/* General Pages */}
            <Route
              path="pos"
              element={
                <ProtectedRoute controller={controller} allowedRoles={['kasir']}>
                  <POSView controller={controller} />
                </ProtectedRoute>
              }
            />
            
            <Route
              path="produk"
              element={
                <ProtectedRoute controller={controller}>
                  <ProductView controller={controller} />
                </ProtectedRoute>
              }
            />

            <Route
              path="resep"
              element={
                <ProtectedRoute controller={controller} allowedRoles={['admin']}>
                  <RecipeView controller={controller} />
                </ProtectedRoute>
              }
            />
            <Route
              path="users"
              element={
                <ProtectedRoute controller={controller} allowedRoles={['admin']}>
                  <UserManagementView controller={controller} />
                </ProtectedRoute>
              }
            />
            <Route
              path="inventaris"
              element={
                <ProtectedRoute controller={controller} allowedRoles={['admin']}>
                  <InventoryView controller={controller} />
                </ProtectedRoute>
              }
            />

            <Route
              path="laporan"
              element={
                <ProtectedRoute controller={controller} allowedRoles={['admin']}>
                  <FinanceView controller={controller} />
                </ProtectedRoute>
              }
            />

            {/* Invalid path route redirect */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Route>
        </Routes>
      </Suspense>
    </>
  );
}

export default function App() {
  return (
    <HashRouter>
      <AppContent />
    </HashRouter>
  );
}
