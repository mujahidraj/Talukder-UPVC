import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import {
  Search,
  Edit2,
  AlertCircle,
  Eye,
  ArrowRight
} from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../../lib/axios';

interface Product {
  id: string;
  productCode: string;
  productName: string;
  category: { name: string };
  size: string;
  thicknessMm: string | null;
  length: string | null;
  color: string | null;
  material: string | null;
  images: { thumbPath: string }[];
}

export default function ProductsMissingData() {
  const [data, setData] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const limit = 10;

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await api.get('/admin/products/missing-data', {
        params: { page, limit, search }
      });
      setData(res.data.data);
      setTotalPages(res.data.meta.totalPages);
      setTotalCount(res.data.meta.total);
    } catch {
      toast.error('Failed to load missing data products');
    } finally {
      setIsLoading(false);
    }
  }, [page, search]);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchData();
    }, 300);
    return () => clearTimeout(timer);
  }, [page, search, fetchData]);

  const getMissingFields = (product: Product) => {
    const missing = [];
    if (!product.thicknessMm) missing.push('Thickness');
    if (!product.length) missing.push('Length');
    if (!product.color) missing.push('Color');
    if (!product.material) missing.push('Material');
    return missing;
  };

  return (
    <div>
      {/* Header */}
      <div className="sm:flex sm:items-center sm:justify-between mb-8">
        <div>
          <h1 className="text-2xl font-heading font-semibold text-gray-900 flex items-center gap-2">
            <AlertCircle className="h-6 w-6 text-amber-500" />
            Missing Data
          </h1>
          <p className="mt-2 text-sm text-gray-700">
            Products that are missing fields like Thickness, Length, Color, or Material.
          </p>
        </div>
      </div>

      <div className="glass-panel overflow-hidden">
        {/* Search */}
        <div className="p-4 border-b border-gray-200 bg-white/50 sm:flex sm:items-center sm:justify-between">
          <div className="relative max-w-sm w-full">
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
              <Search className="h-4 w-4 text-gray-400" />
            </div>
            <input
              type="text"
              className="admin-input pl-9 bg-white"
              placeholder="Search by code or name..."
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            />
          </div>
          <div className="mt-2 sm:mt-0 text-sm text-gray-500 font-medium">
            {totalCount} product{totalCount !== 1 ? 's' : ''} need attention
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-amber-50/50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Product</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Missing Fields</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Action</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {isLoading ? (
                <tr>
                  <td colSpan={3} className="px-6 py-12 text-center text-gray-500">
                    <div className="flex items-center justify-center gap-3">
                      <div className="w-5 h-5 border-2 border-brand-200 border-t-brand-600 rounded-full animate-spin" />
                      Loading products...
                    </div>
                  </td>
                </tr>
              ) : data.length === 0 ? (
                <tr>
                  <td colSpan={3} className="px-6 py-16 text-center text-gray-500">
                    <div className="flex flex-col items-center gap-3">
                      <div className="h-12 w-12 rounded-full bg-green-50 flex items-center justify-center mb-2">
                        <AlertCircle className="h-6 w-6 text-green-500" />
                      </div>
                      <p className="text-gray-900 font-medium text-lg">All caught up!</p>
                      <p className="text-sm text-gray-500">No products are missing data.</p>
                    </div>
                  </td>
                </tr>
              ) : (
                data.map(product => {
                  const missingFields = getMissingFields(product);
                  return (
                    <tr key={product.id} className="hover:bg-gray-50/50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-10 w-10">
                            {product.images?.[0]?.thumbPath ? (
                              <img
                                src={`http://localhost:3000${product.images[0].thumbPath}`}
                                alt="thumb"
                                className="h-10 w-10 rounded-md object-cover border border-gray-200"
                              />
                            ) : (
                              <div className="h-10 w-10 rounded-md bg-gray-100 flex items-center justify-center border border-gray-200">
                                <span className="text-xs text-gray-400">No Img</span>
                              </div>
                            )}
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">{product.productName}</div>
                            <div className="text-sm text-gray-500 font-mono">{product.productCode}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-wrap gap-1.5">
                          {missingFields.map(field => (
                            <span key={field} className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-amber-100 text-amber-800">
                              {field}
                            </span>
                          ))}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <Link
                          to={`/admin/products/${product.id}/edit`}
                          className="inline-flex items-center justify-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md text-white bg-brand-600 hover:bg-brand-700 transition-colors gap-1.5"
                        >
                          <Edit2 className="h-3.5 w-3.5" />
                          Resolve
                        </Link>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="bg-white px-4 py-3 border-t border-gray-200 sm:px-6 flex items-center justify-between">
          <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
            <div>
              <p className="text-sm text-gray-700">
                Showing page <span className="font-medium">{page}</span> of <span className="font-medium">{totalPages}</span>
              </p>
            </div>
            <div>
              <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                <button
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
                >
                  Previous
                </button>
                <button
                  onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages || totalPages === 0}
                  className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
                >
                  Next
                </button>
              </nav>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
