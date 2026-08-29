import React, { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Search,
  Trash2,
  RefreshCw,
  AlertTriangle,
  ArrowLeft,
  X,
  CheckSquare,
  Square,
  MinusSquare,
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
  status: string;
  images: { thumbPath: string }[];
  updatedAt: string;
}

export default function AdminProductTrash() {
  const navigate = useNavigate();
  const [data, setData] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [isProcessing, setIsProcessing] = useState(false);
  const limit = 10;

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await api.get('/admin/products/trash/list', {
        params: { page, limit, search }
      });
      setData(res.data.data);
      setTotalPages(res.data.meta.totalPages);
      setTotalCount(res.data.meta.total);
    } catch {
      toast.error('Failed to load trash products');
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

  useEffect(() => {
    setSelectedIds(new Set());
  }, [page]);

  const handleRestore = async (id: string) => {
    try {
      await api.put(`/admin/products/${id}/restore`);
      toast.success('Product restored successfully');
      fetchData();
    } catch {
      toast.error('Failed to restore product');
    }
  };

  const handlePermanentDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to PERMANENTLY delete this product? This action cannot be undone!')) return;
    try {
      await api.delete(`/admin/products/${id}/permanent`);
      toast.success('Product permanently deleted');
      fetchData();
    } catch {
      toast.error('Failed to permanently delete product');
    }
  };

  const handleBulkRestore = async () => {
    const count = selectedIds.size;
    if (!window.confirm(`Are you sure you want to restore ${count} product(s)?`)) return;
    setIsProcessing(true);
    try {
      await Promise.all(Array.from(selectedIds).map(id => api.put(`/admin/products/${id}/restore`)));
      toast.success(`${count} product(s) restored successfully`);
      setSelectedIds(new Set());
      fetchData();
    } catch {
      toast.error('Failed to restore some products');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleBulkPermanentDelete = async () => {
    const count = selectedIds.size;
    if (!window.confirm(`Are you sure you want to PERMANENTLY delete ${count} product(s)? This CANNOT be undone.`)) return;
    setIsProcessing(true);
    try {
      await Promise.all(Array.from(selectedIds).map(id => api.delete(`/admin/products/${id}/permanent`)));
      toast.success(`${count} product(s) permanently deleted`);
      setSelectedIds(new Set());
      fetchData();
    } catch {
      toast.error('Failed to permanently delete some products');
    } finally {
      setIsProcessing(false);
    }
  };

  const [isSelectingAll, setIsSelectingAll] = useState(false);

  const toggleSelectAll = async () => {
    if (selectedIds.size === totalCount && totalCount > 0) {
      setSelectedIds(new Set());
    } else {
      setIsSelectingAll(true);
      try {
        const params: Record<string, string> = {};
        if (search) params.search = search;
        const res = await api.get('/admin/products/trash/bulk/ids', {
          params
        });
        setSelectedIds(new Set(res.data));
      } catch {
        toast.error('Failed to select all products');
      } finally {
        setIsSelectingAll(false);
      }
    }
  };

  const toggleSelect = (id: string) => {
    const next = new Set(selectedIds);
    if (next.has(id)) {
      next.delete(id);
    } else {
      next.add(id);
    }
    setSelectedIds(next);
  };

  const allSelected = data.length > 0 && selectedIds.size === data.length;
  const someSelected = selectedIds.size > 0 && selectedIds.size < data.length;

  return (
    <div className="animate-fade-in pb-12">
      {/* Premium Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8">
        <div className="max-w-2xl">
          <div className="flex items-center gap-4 mb-3">
            <Link 
              to="/admin/products" 
              className="p-2 bg-white border border-gray-200 rounded-xl text-gray-500 hover:text-brand-600 hover:border-brand-200 hover:bg-brand-50 transition-all shadow-sm group"
            >
              <ArrowLeft className="h-5 w-5 group-hover:-translate-x-0.5 transition-transform" />
            </Link>
            <h1 className="text-3xl font-bold tracking-tight text-gray-900 flex items-center gap-3">
              <div className="p-2.5 bg-red-50 rounded-xl text-red-500">
                <Trash2 className="h-7 w-7" />
              </div>
              Recycle Bin
            </h1>
          </div>
          <p className="text-sm font-medium text-gray-500 leading-relaxed ml-[3.25rem]">
            View soft-deleted products. You can gracefully <span className="font-bold text-green-600">restore</span> them or <span className="font-bold text-red-600">permanently erase</span> them to free up space.
          </p>
        </div>
      </div>

      {/* Bulk Action Bar */}
      {selectedIds.size > 0 && (
        <div
          className="mb-6 bg-red-50/80 border border-red-200 rounded-2xl px-6 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-sm relative overflow-hidden"
          style={{ animation: 'slideDown 0.2s ease-out' }}
        >
          <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-red-500"></div>
          <div className="flex items-center gap-4">
            <div className="flex items-center justify-center h-10 w-10 rounded-xl bg-red-600 text-white text-base font-bold shadow-md shadow-red-500/20">
              {selectedIds.size}
            </div>
            <span className="text-base font-bold text-red-900">
              product{selectedIds.size > 1 ? 's' : ''} selected
            </span>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={handleBulkRestore}
              disabled={isProcessing}
              className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-bold text-white bg-green-600 rounded-xl hover:bg-green-700 transition-colors shadow-sm disabled:opacity-50"
            >
              {isProcessing ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
              {isProcessing ? 'Processing...' : 'Restore Selected'}
            </button>
            <button
              onClick={handleBulkPermanentDelete}
              disabled={isProcessing}
              className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-bold text-white bg-red-600 rounded-xl hover:bg-red-700 transition-colors shadow-sm disabled:opacity-50"
            >
              {isProcessing ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
              {isProcessing ? 'Processing...' : 'Delete Forever'}
            </button>
            <button
              onClick={() => setSelectedIds(new Set())}
              className="inline-flex items-center gap-1.5 px-4 py-2.5 text-sm font-semibold text-gray-600 hover:text-gray-900 hover:bg-white/80 rounded-xl transition-colors"
            >
              <X className="h-4 w-4" />
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Main Container */}
      <div className="bg-white rounded-3xl shadow-[0_2px_15px_-3px_rgba(6,81,237,0.05)] border border-gray-100 overflow-hidden relative">
        {/* Search Bar */}
        <div className="p-5 border-b border-gray-100 bg-white flex flex-col lg:flex-row lg:items-center justify-between gap-5 relative z-10">
          <div className="flex flex-col sm:flex-row items-center gap-4 w-full lg:max-w-2xl">
            <div className="relative w-full">
              <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4">
                <Search className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                className="w-full bg-gray-50 border border-gray-200 text-gray-900 rounded-xl pl-11 pr-4 py-3 text-sm focus:bg-white focus:border-red-500 focus:ring-4 focus:ring-red-500/10 transition-all outline-none"
                placeholder="Search deleted products..."
                value={search}
                onChange={(e) => { setSearch(e.target.value); setPage(1); }}
              />
            </div>
            {data.length > 0 && (
              <button
                onClick={toggleSelectAll}
                disabled={isSelectingAll}
                className="flex items-center justify-center gap-2 px-5 py-3 bg-white border border-gray-200 rounded-xl text-sm font-bold text-gray-700 hover:bg-gray-50 hover:border-gray-300 transition-all whitespace-nowrap disabled:opacity-50 shadow-sm"
              >
                {selectedIds.size === totalCount ? <MinusSquare className="h-5 w-5 text-red-500" /> : <CheckSquare className="h-5 w-5 text-gray-400" />}
                {isSelectingAll ? 'Selecting...' : selectedIds.size === totalCount ? 'Deselect All' : 'Select All Files'}
              </button>
            )}
          </div>
          <div className="text-sm font-bold text-red-600 bg-red-50 px-4 py-2.5 rounded-xl border border-red-100 whitespace-nowrap inline-flex items-center shadow-sm">
            <AlertTriangle className="h-4 w-4 mr-2" />
            <span className="text-red-700">{totalCount} item{totalCount !== 1 ? 's' : ''} in trash</span>
          </div>
        </div>

        {/* Table Data */}
        <div className="overflow-x-auto relative z-0">
          <table className="min-w-full divide-y divide-gray-100">
            <thead className="bg-red-50/30">
              <tr>
                <th className="px-6 py-4 w-16">
                  <button
                    onClick={toggleSelectAll}
                    className="text-gray-400 hover:text-red-600 transition-colors bg-white border border-gray-200 rounded p-1 shadow-sm"
                    title={allSelected ? 'Deselect all' : 'Select all'}
                  >
                    {allSelected ? (
                      <CheckSquare className="h-5 w-5 text-red-600" />
                    ) : someSelected ? (
                      <MinusSquare className="h-5 w-5 text-red-400" />
                    ) : (
                      <Square className="h-5 w-5" />
                    )}
                  </button>
                </th>
                <th className="px-6 py-4 text-left text-[11px] font-bold text-gray-500 uppercase tracking-widest">Image</th>
                <th className="px-6 py-4 text-left text-[11px] font-bold text-gray-500 uppercase tracking-widest">Item Code</th>
                <th className="px-6 py-4 text-left text-[11px] font-bold text-gray-500 uppercase tracking-widest">Name</th>
                <th className="px-6 py-4 text-left text-[11px] font-bold text-gray-500 uppercase tracking-widest">Deleted On</th>
                <th className="px-6 py-4 text-right text-[11px] font-bold text-gray-500 uppercase tracking-widest">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-50">
              {isLoading ? (
                <tr>
                  <td colSpan={6} className="px-6 py-20 text-center text-gray-500">
                    <div className="flex flex-col items-center justify-center gap-4 text-red-500">
                      <Loader2 className="h-8 w-8 animate-spin" />
                      <span className="font-bold text-gray-500">Loading trash...</span>
                    </div>
                  </td>
                </tr>
              ) : data.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-24 text-center">
                    <div className="flex flex-col items-center gap-4">
                      <div className="h-16 w-16 rounded-3xl bg-gray-50 flex items-center justify-center mb-2 shadow-sm border border-gray-100">
                        <Trash2 className="h-8 w-8 text-gray-300" />
                      </div>
                      <div>
                        <p className="text-gray-900 font-bold text-xl mb-1">Recycle Bin is empty</p>
                        <p className="text-sm font-medium text-gray-500">No deleted products found.</p>
                      </div>
                    </div>
                  </td>
                </tr>
              ) : (
                data.map(product => (
                  <tr
                    key={product.id}
                    className={`transition-all duration-200 group ${selectedIds.has(product.id) ? 'bg-red-50/50' : 'hover:bg-red-50/30'}`}
                  >
                    {/* Checkbox */}
                    <td className="px-6 py-5 whitespace-nowrap">
                      <button
                        onClick={() => toggleSelect(product.id)}
                        className="text-gray-400 hover:text-red-600 transition-colors bg-white border border-gray-200 rounded p-1 shadow-sm"
                      >
                        {selectedIds.has(product.id) ? (
                          <CheckSquare className="h-5 w-5 text-red-600" />
                        ) : (
                          <Square className="h-5 w-5" />
                        )}
                      </button>
                    </td>
                    {/* Image */}
                    <td className="px-6 py-5 whitespace-nowrap">
                      <div className="relative overflow-hidden rounded-xl border border-gray-200 shadow-sm opacity-70 group-hover:opacity-100 transition-opacity">
                        {product.images?.[0]?.thumbPath ? (
                          <img
                            src={`http://localhost:3000${product.images[0].thumbPath}`}
                            alt="thumb"
                            className="w-12 h-12 object-cover grayscale group-hover:grayscale-0 transition-all duration-500"
                          />
                        ) : (
                          <div className="w-12 h-12 bg-gray-100 flex flex-col items-center justify-center">
                            <span className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">No Img</span>
                          </div>
                        )}
                      </div>
                    </td>
                    {/* Code */}
                    <td className="px-6 py-5 whitespace-nowrap text-sm font-mono text-gray-400 line-through decoration-gray-300 group-hover:text-gray-600 transition-colors">
                      {product.productCode}
                    </td>
                    {/* Name */}
                    <td className="px-6 py-5 text-sm">
                      <span className="font-bold text-gray-600 line-clamp-2 group-hover:text-gray-900 transition-colors">
                        {product.productName}
                      </span>
                    </td>
                    {/* Date */}
                    <td className="px-6 py-5 whitespace-nowrap text-sm font-medium text-gray-500">
                      <div className="bg-gray-100 px-3 py-1 rounded-full w-fit">
                        {new Date(product.updatedAt).toLocaleDateString()}
                      </div>
                    </td>
                    {/* Actions */}
                    <td className="px-6 py-5 whitespace-nowrap text-right">
                      <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                        <button
                          onClick={() => handleRestore(product.id)}
                          className="inline-flex items-center justify-center px-4 py-2 bg-green-50 text-green-700 hover:bg-green-600 hover:text-white rounded-xl text-xs font-bold transition-all shadow-sm gap-1.5"
                          title="Restore Product"
                        >
                          <RefreshCw className="h-3.5 w-3.5" />
                          Restore
                        </button>
                        <button
                          onClick={() => handlePermanentDelete(product.id)}
                          className="inline-flex items-center justify-center px-4 py-2 bg-red-50 text-red-700 hover:bg-red-600 hover:text-white rounded-xl text-xs font-bold transition-all shadow-sm gap-1.5"
                          title="Permanently Delete"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                          Delete Forever
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
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
      
      <style>{`
        @keyframes slideDown {
          from { opacity: 0; transform: translateY(-8px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}
