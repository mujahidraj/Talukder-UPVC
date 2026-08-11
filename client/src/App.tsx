import React, { Suspense } from 'react';
import { BrowserRouter, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { HelmetProvider } from 'react-helmet-async';
import useAuthStore from './store/useAuthStore';

// Layouts
import AdminLayout from './layouts/AdminLayout';
import PublicLayout from './layouts/PublicLayout';

// ─── Code Split Admin Pages ─────────────────────
const Login = React.lazy(() => import('./pages/admin/Login'));
const Dashboard = React.lazy(() => import('./pages/admin/Dashboard')); 

const ProductsManager = React.lazy(() => import('./pages/admin/ProductsManager'));
const AdminProductTrash = React.lazy(() => import('./pages/admin/AdminProductTrash'));
const AdminProductDetail = React.lazy(() => import('./pages/admin/AdminProductDetail'));
const AdminProductEdit = React.lazy(() => import('./pages/admin/AdminProductEdit'));
const CategoriesManager = React.lazy(() => import('./pages/admin/CategoriesManager'));
const EnquiriesManager = React.lazy(() => import('./pages/admin/EnquiriesManager'));
const MediaLibrary = React.lazy(() => import('./pages/admin/MediaLibrary'));
const BulkImport = React.lazy(() => import('./pages/admin/BulkImport'));
const CmsManager = React.lazy(() => import('./pages/admin/CmsManager'));
const ReportsActivityLog = React.lazy(() => import('./pages/admin/ReportsActivityLog'));
const UserManagement = React.lazy(() => import('./pages/admin/UserManagement'));

// ─── Code Split Public Pages ────────────────────
const HomePage = React.lazy(() => import('./pages/public/HomePage'));
const ProductsListing = React.lazy(() => import('./pages/public/ProductsListing'));
const ProductDetail = React.lazy(() => import('./pages/public/ProductDetail'));
const CategoryPage = React.lazy(() => import('./pages/public/CategoryPage'));
const WishlistPage = React.lazy(() => import('./pages/public/WishlistPage'));
const EnquiryPage = React.lazy(() => import('./pages/public/EnquiryPage'));
const AboutPage = React.lazy(() => import('./pages/public/AboutPage'));
const ContactPage = React.lazy(() => import('./pages/public/ContactPage'));
const FaqPage = React.lazy(() => import('./pages/public/FaqPage'));
const DownloadsPage = React.lazy(() => import('./pages/public/DownloadsPage'));
const CertificationsPage = React.lazy(() => import('./pages/public/CertificationsPage'));
const FactoryPage = React.lazy(() => import('./pages/public/FactoryPage'));
const NotFoundPage = React.lazy(() => import('./pages/public/NotFoundPage'));

const ProtectedRoute = () => {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  if (!isAuthenticated) return <Navigate to="/admin/login" replace />;
  return <Outlet />;
};

// Loading fallback component
const PageLoader = () => (
  <div className="min-h-screen flex items-center justify-center bg-slate-50">
    <div className="w-8 h-8 border-4 border-brand-200 border-t-brand-600 rounded-full animate-spin"></div>
  </div>
);

function App() {
  return (
    <HelmetProvider>
      <BrowserRouter>
        <Toaster position="top-right" toastOptions={{ duration: 3000, style: { borderRadius: '12px', padding: '12px 16px' } }} />
        <Suspense fallback={<PageLoader />}>
          <Routes>
            {/* ─── Public Website ─────────────────── */}
            <Route element={<PublicLayout />}>
              <Route index element={<HomePage />} />
              <Route path="products" element={<ProductsListing />} />
              <Route path="products/:slug" element={<ProductDetail />} />
              <Route path="categories/:slug" element={<CategoryPage />} />
              <Route path="wishlist" element={<WishlistPage />} />
              <Route path="enquiry" element={<EnquiryPage />} />
              <Route path="about" element={<AboutPage />} />
              <Route path="contact" element={<ContactPage />} />
              <Route path="faq" element={<FaqPage />} />
              <Route path="downloads" element={<DownloadsPage />} />
              <Route path="certifications" element={<CertificationsPage />} />
              <Route path="factory" element={<FactoryPage />} />
              <Route path="*" element={<NotFoundPage />} />
            </Route>

            {/* ─── Admin Login ────────────────────── */}
            <Route path="/admin/login" element={<Login />} />

            {/* ─── Admin Panel (Protected) ────────── */}
            <Route path="/admin" element={<ProtectedRoute />}>
              <Route element={<AdminLayout />}>
                <Route index element={<Dashboard />} />
                <Route path="products" element={<ProductsManager />} />
                <Route path="products/trash" element={<AdminProductTrash />} />
                <Route path="products/:id" element={<AdminProductDetail />} />
                <Route path="products/:id/edit" element={<AdminProductEdit />} />
                <Route path="categories" element={<CategoriesManager />} />
                <Route path="enquiries" element={<EnquiriesManager />} />
                <Route path="media" element={<MediaLibrary />} />
                <Route path="import" element={<BulkImport />} />
                <Route path="cms" element={<CmsManager />} />
                <Route path="reports" element={<ReportsActivityLog />} />
                <Route path="users" element={<UserManagement />} />
              </Route>
            </Route>
          </Routes>
        </Suspense>
      </BrowserRouter>
    </HelmetProvider>
  );
}

export default App;
