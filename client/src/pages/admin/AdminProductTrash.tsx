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

  const toggleSelectAll = () => {
    if (selectedIds.size === data.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(data.map(p => p.id)));
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
    <div>
      {/* Header */}
      <div className="sm:flex sm:items-center sm:justify-between mb-8">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Link to="/admin/products" className="text-gray-400 hover:text-brand-600 transition-colors">
              <ArrowLeft className="h-5 w-5" />
            </Link>
            <h1 className="text-2xl font-heading font-semibold text-gray-900 flex items-center gap-2">
              <Trash2 className="h-6 w-6 text-red-500" />
              Recycle Bin
            </h1>
          </div>
          <p className="text-sm text-gray-700 ml-7">
            View soft-deleted products. You can restore them or permanently erase them.
          </p>
        </div>
      </div>

      {/* Bulk Action Bar */}
      {selectedIds.size > 0 && (
        <div
          className="mb-4 bg-brand-50 border border-brand-200 rounded-xl px-5 py-3 flex items-center justify-between"
          style={{ animation: 'slideDown 0.2s ease-out' }}
        >
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center h-8 w-8 rounded-lg bg-brand-600 text-white text-sm font-bold shadow-sm">
              {selectedIds.size}
            </div>
            <span className="text-sm font-medium text-brand-900">
              product{selectedIds.size > 1 ? 's' : ''} selected
            </span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleBulkRestore}
              disabled={isProcessing}
              className="inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-green-600 rounded-lg hover:bg-green-700 transition-colors shadow-sm disabled:opacity-50"
            >
              <RefreshCw className="h-4 w-4" />
              {isProcessing ? 'Processing...' : 'Restore Selected'}
            </button>
            <button
              onClick={handleBulkPermanentDelete}
              disabled={isProcessing}
              className="inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-red-600 rounded-lg hover:bg-red-700 transition-colors shadow-sm disabled:opacity-50"
            >
              <Trash2 className="h-4 w-4" />
              {isProcessing ? 'Processing...' : 'Permanently Delete'}
            </button>
            <button
              onClick={() => setSelectedIds(new Set())}
              className="inline-flex items-center gap-1.5 px-3 py-2 text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X className="h-4 w-4" />
              Clear
            </button>
          </div>
        </div>
      )}

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
              placeholder="Search deleted products..."
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            />
          </div>
          <div className="mt-2 sm:mt-0 text-sm text-gray-500 flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 text-amber-500" />
            {totalCount} item{totalCount !== 1 ? 's' : ''} in trash
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-red-50/50">
              <tr>
                <th className="px-4 py-3 w-12">
                  <button
                    onClick={toggleSelectAll}
                    className="text-gray-400 hover:text-red-600 transition-colors"
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
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Image</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Item Code</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Deleted On</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {isLoading ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                    <div className="flex items-center justify-center gap-3">
                      <div className="w-5 h-5 border-2 border-brand-200 border-t-brand-600 rounded-full animate-spin" />
                      Loading trash...
                    </div>
                  </td>
                </tr>
              ) : data.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-16 text-center text-gray-500">
                    <div className="flex flex-col items-center gap-3">
                      <div className="h-12 w-12 rounded-full bg-gray-50 flex items-center justify-center mb-2">
                        <Trash2 className="h-6 w-6 text-gray-300" />
                      </div>
                      <p className="text-gray-500 font-medium">Recycle Bin is empty</p>
                      <p className="text-sm text-gray-400">No deleted products found.</p>
                    </div>
                  </td>
                </tr>
              ) : (
                data.map(product => (
                  <tr
                    key={product.id}
                    className={`transition-colors ${selectedIds.has(product.id) ? 'bg-red-50/40' : 'hover:bg-gray-50/50'}`}
                  >
                    <td className="px-4 py-4">
                      <button
                        onClick={() => toggleSelect(product.id)}
                        className="text-gray-400 hover:text-red-600 transition-colors"
                      >
                        {selectedIds.has(product.id) ? (
                          <CheckSquare className="h-5 w-5 text-red-600" />
                        ) : (
                          <Square className="h-5 w-5" />
                        )}
                      </button>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {product.images?.[0]?.thumbPath ? (
                        <img
                          src={`http://localhost:3000${product.images[0].thumbPath}`}
                          alt="thumb"
                          className="w-10 h-10 object-cover rounded-md border border-gray-200 grayscale opacity-60"
                        />
                      ) : (
                        <div className="w-10 h-10 bg-gray-100 rounded-md border border-gray-200 flex items-center justify-center opacity-60">
                          <span className="text-xs text-gray-400">No Img</span>
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 line-through font-mono">
                      {product.productCode}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                      {product.productName}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(product.updatedAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex items-center justify-end gap-3">
                        <button
                          onClick={() => handleRestore(product.id)}
                          className="text-green-600 hover:text-green-900 transition-colors flex items-center gap-1"
                          title="Restore"
                        >
                          <RefreshCw className="h-4 w-4" />
                          Restore
                        </button>
                        <span className="text-gray-300">|</span>
                        <button
                          onClick={() => handlePermanentDelete(product.id)}
                          className="text-red-600 hover:text-red-900 transition-colors flex items-center gap-1"
                          title="Permanently Delete"
                        >
                          <Trash2 className="h-4 w-4" />
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
