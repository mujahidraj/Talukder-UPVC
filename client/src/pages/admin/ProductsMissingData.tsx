import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import {
  Search,
  Edit2,
  AlertCircle,
  Eye,
  ArrowRight,
  CheckCircle2,
  Loader2
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
    <div className="animate-fade-in pb-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8">
        <div className="max-w-2xl">
          <h1 className="text-3xl font-bold tracking-tight text-gray-900 mb-2 flex items-center gap-3">
            <div className="p-2.5 bg-amber-50 rounded-xl">
              <AlertCircle className="h-7 w-7 text-amber-500" />
            </div>
            Action Required
          </h1>
          <p className="text-sm font-medium text-gray-500 leading-relaxed">
            These products are missing critical specifications like <span className="font-bold text-gray-700">Thickness, Length, Color,</span> or <span className="font-bold text-gray-700">Material</span>. Update them to improve customer experience.
          </p>
        </div>
      </div>

      <div className="bg-white rounded-3xl shadow-[0_2px_15px_-3px_rgba(6,81,237,0.05)] border border-gray-100 overflow-hidden relative">
        {/* Search */}
        <div className="p-6 border-b border-gray-100 bg-white flex flex-col sm:flex-row sm:items-center justify-between gap-5 relative z-10">
          <div className="relative max-w-md w-full">
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4">
              <Search className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              className="w-full bg-gray-50 border border-gray-200 text-gray-900 rounded-xl pl-11 pr-4 py-3 text-sm focus:bg-white focus:border-brand-500 focus:ring-4 focus:ring-brand-500/10 transition-all outline-none"
              placeholder="Search by product code or name..."
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            />
          </div>
          <div className="text-sm font-bold text-amber-700 bg-amber-50 px-5 py-3 rounded-xl border border-amber-200/60 whitespace-nowrap inline-flex items-center shadow-sm">
            <span className="text-xl mr-2">{totalCount}</span> product{totalCount !== 1 ? 's' : ''} need attention
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto relative z-0">
          <table className="min-w-full divide-y divide-gray-100">
            <thead className="bg-gray-50/50">
              <tr>
                <th className="px-8 py-5 text-left text-[11px] font-bold text-gray-500 uppercase tracking-widest">Product Details</th>
                <th className="px-8 py-5 text-left text-[11px] font-bold text-gray-500 uppercase tracking-widest">Missing Specifications</th>
                <th className="px-8 py-5 text-right text-[11px] font-bold text-gray-500 uppercase tracking-widest">Action</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-50">
              {isLoading ? (
                <tr>
                  <td colSpan={3} className="px-8 py-20 text-center text-gray-500">
                    <div className="flex flex-col items-center justify-center gap-4 text-brand-600">
                      <Loader2 className="h-8 w-8 animate-spin" />
                      <span className="font-bold text-gray-500">Checking products...</span>
                    </div>
                  </td>
                </tr>
              ) : data.length === 0 ? (
                <tr>
                  <td colSpan={3} className="px-8 py-24 text-center">
                    <div className="flex flex-col items-center gap-4">
                      <div className="h-16 w-16 rounded-3xl bg-emerald-50 flex items-center justify-center mb-2 shadow-sm border border-emerald-100">
                        <CheckCircle2 className="h-8 w-8 text-emerald-500" />
                      </div>
                      <div>
                        <p className="text-gray-900 font-bold text-xl mb-1">All caught up!</p>
                        <p className="text-sm font-medium text-gray-500">Your entire catalog has complete data. Great job!</p>
                      </div>
                    </div>
                  </td>
                </tr>
              ) : (
                data.map(product => {
                  const missingFields = getMissingFields(product);
                  return (
                    <tr key={product.id} className="hover:bg-amber-50/30 transition-colors duration-200 group">
                      <td className="px-8 py-5 whitespace-nowrap">
                        <div className="flex items-center gap-5">
                          <div className="flex-shrink-0 relative group-hover:scale-105 transition-transform duration-300">
                            {product.images?.[0]?.thumbPath ? (
                              <img
                                src={`http://localhost:3000${product.images[0].thumbPath}`}
                                alt="thumb"
                                className="h-12 w-12 rounded-xl object-cover border border-gray-200 shadow-sm"
                              />
                            ) : (
                              <div className="h-12 w-12 rounded-xl bg-gray-100 flex items-center justify-center border border-gray-200">
                                <span className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">No Img</span>
                              </div>
                            )}
                          </div>
                          <div>
                            <div className="text-sm font-bold text-gray-900 mb-1 group-hover:text-brand-600 transition-colors">{product.productName}</div>
                            <div className="text-xs font-mono font-medium text-gray-500 bg-gray-100 px-2 py-0.5 rounded inline-block border border-gray-200/60">{product.productCode}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-8 py-5">
                        <div className="flex flex-wrap gap-2 max-w-sm">
                          {missingFields.map(field => (
                            <span key={field} className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-amber-50 text-amber-700 border border-amber-200/50 shadow-sm">
                              <AlertCircle className="h-3 w-3 mr-1.5 opacity-70" />
                              {field}
                            </span>
                          ))}
                        </div>
                      </td>
                      <td className="px-8 py-5 whitespace-nowrap text-right">
                        <Link
                          to={`/admin/products/${product.id}/edit`}
                          className="inline-flex items-center justify-center px-5 py-2.5 bg-white border border-gray-200 text-sm font-bold rounded-xl text-gray-700 hover:bg-brand-50 hover:text-brand-700 hover:border-brand-200 transition-all shadow-sm group-hover:shadow-md gap-2"
                        >
                          <Edit2 className="h-4 w-4" />
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
        <div className="bg-gray-50/50 px-8 py-4 border-t border-gray-100 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>
            <p className="text-sm font-medium text-gray-500">
              Showing page <span className="font-bold text-gray-900">{page}</span> of <span className="font-bold text-gray-900">{totalPages}</span>
            </p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page === 1}
              className="inline-flex items-center justify-center px-4 py-2 bg-white border border-gray-200 text-sm font-bold text-gray-700 rounded-xl shadow-sm hover:bg-gray-50 hover:border-gray-300 transition-all disabled:opacity-50 disabled:pointer-events-none"
            >
              Previous
            </button>
            <button
              onClick={() => setPage(p => Math.min(totalPages, p + 1))}
              disabled={page === totalPages || totalPages === 0}
              className="inline-flex items-center justify-center px-4 py-2 bg-white border border-gray-200 text-sm font-bold text-gray-700 rounded-xl shadow-sm hover:bg-gray-50 hover:border-gray-300 transition-all disabled:opacity-50 disabled:pointer-events-none"
            >
              Next
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
