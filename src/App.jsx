import { lazy, Suspense } from 'react';
import { HashRouter, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import useAppController from './controllers/useAppController';
import LoadingSpinner from './views/components/LoadingSpinner';
import GlobalAlert from './views/components/GlobalAlert';
import AuthLayout from './views/layouts/AuthLayout';
import MainLayout from './views/layouts/MainLayout';
const LoginView = lazy(() => import('./views/pages/LoginView'));
const DashboardView = lazy(() => import('./views/pages/DashboardView'));
const POSView = lazy(() => import('./views/pages/POSView'));
const ProductView = lazy(() => import('./views/pages/ProductView'));
const RecipeView = lazy(() => import('./views/pages/RecipeView'));
const UserManagementView = lazy(() => import('./views/pages/UserManagementView'));
const ResetVerify = lazy(() => import('./views/pages/ResetVerify'));
const ResetPassword = lazy(() => import('./views/pages/ResetPassword'));
const FinanceView = lazy(() => import('./views/pages/FinanceView'));
const InventoryView = lazy(() => import('./views/pages/InventoryView'));
function ProtectedRoute({ controller, allowedRoles, children }) {
  if (!controller.activeUser) {
    return <Navigate to="/login" replace />;
  }
  if (allowedRoles && !allowedRoles.includes(controller.activeUser.role)) {
    return <Navigate to={controller.activeUser.role === 'kasir' ? '/pos' : '/'} replace />;
  }
  return children;
}
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
      {}
      {controller.globalAlert && (
        <GlobalAlert 
          message={controller.globalAlert.message} 
          type={controller.globalAlert.type} 
        />
      )}
      {}
      <Suspense fallback={<LoadingSpinner />}>
        <Routes>
          {}
          <Route path="/login" element={<PublicRoute controller={controller}><AuthLayout><LoginView controller={controller} /></AuthLayout></PublicRoute>} />
          <Route path="/reset-verify" element={<PublicRoute controller={controller}><ResetVerify controller={controller} /></PublicRoute>} />
          <Route path="/reset-password" element={<PublicRoute controller={controller}><ResetPassword controller={controller} /></PublicRoute>} />
          {}
          <Route
            path="/"
            element={
              <ProtectedRoute controller={controller}>
                <MainLayout controller={controller} />
              </ProtectedRoute>
            }
          >
            {}
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
            {}
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
            {}
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
