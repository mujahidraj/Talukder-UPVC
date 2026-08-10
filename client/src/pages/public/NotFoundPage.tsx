import React from 'react';
import { Link } from 'react-router-dom';
import { Home } from 'lucide-react';

export default function NotFoundPage() {
  return (
    <div className="min-h-[60vh] flex items-center justify-center">
      <div className="text-center">
        <p className="text-8xl font-heading font-bold text-brand-200">404</p>
        <h1 className="text-3xl font-heading font-bold text-brand-950 mt-4">Page Not Found</h1>
        <p className="text-gray-500 mt-3">The page you're looking for doesn't exist or has been moved.</p>
        <Link to="/" className="mt-8 inline-flex items-center gap-2 admin-btn-primary">
          <Home className="h-4 w-4" /> Back to Home
        </Link>
      </div>
    </div>
  );
}
