import React, { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Plus,
  Search,
  Edit2,
  Trash2,
  Copy,
  Filter,
  Eye,
  Download,
  CheckSquare,
  Square,
  MinusSquare,
  X,
  AlertTriangle,
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
  viewCount: number;
  images: { thumbPath: string }[];
}

export default function ProductsManager() {
  const navigate = useNavigate();
  const [data, setData] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [isExporting, setIsExporting] = useState(false);
  const [isBulkDeleting, setIsBulkDeleting] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({ categoryId: '', status: '' });
  const [categories, setCategories] = useState<{ id: string; name: string; level: number; children?: any[] }[]>([]);
  const limit = 10;

  useEffect(() => {
    api.get('/admin/categories').then(res => setCategories(res.data)).catch(() => {});
  }, []);

  const flattenCategories = useCallback((cats: any[], prefix = ''): { id: string; label: string }[] => {
    return cats.reduce((acc: { id: string; label: string }[], cat) => {
      acc.push({ id: cat.id, label: prefix + cat.name });
      if (cat.children?.length) {
        acc.push(...flattenCategories(cat.children, prefix + cat.name + ' → '));
      }
      return acc;
    }, []);
  }, []);

  const flatCats = flattenCategories(categories);

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    try {
      const params: any = { page, limit, search };
      if (filters.categoryId) params.categoryId = filters.categoryId;
      if (filters.status) params.status = filters.status;

      const res = await api.get('/admin/products', { params });
      setData(res.data.data);
      setTotalPages(res.data.meta.totalPages);
      setTotalCount(res.data.meta.total);
    } catch {
      toast.error('Failed to load products');
    } finally {
      setIsLoading(false);
    }
  }, [page, search, filters]);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchData();
    }, 300);
    return () => clearTimeout(timer);
  }, [page, search, filters, fetchData]);

  // Clear selection when page changes
  useEffect(() => {
    setSelectedIds(new Set());
  }, [page]);

  const handleDelete = async (id: string) => {
    if (!window.confirm('Delete this product?')) return;
    try {
      await api.delete(`/admin/products/${id}`);
      toast.success('Product deleted');
      fetchData();
    } catch {
      toast.error('Failed to delete product');
    }
  };

  const handleClone = async (id: string) => {
    try {
      await api.post(`/admin/products/${id}/clone`);
      toast.success('Product cloned successfully');
      fetchData();
    } catch {
      toast.error('Failed to clone product');
    }
  };

  const handleBulkDelete = async () => {
    const count = selectedIds.size;
    if (!window.confirm(`Are you sure you want to delete ${count} product(s)? This action can be undone by an admin.`)) return;
    setIsBulkDeleting(true);
    try {
      await api.delete('/admin/products/bulk/delete', {
        data: { ids: Array.from(selectedIds) }
      });
      toast.success(`${count} product(s) deleted successfully`);
      setSelectedIds(new Set());
      fetchData();
    } catch {
      toast.error('Failed to delete products');
    } finally {
      setIsBulkDeleting(false);
    }
  };

  const handleExport = async () => {
    setIsExporting(true);
    try {
      const res = await api.get('/admin/products/export/csv', {
        responseType: 'blob'
      });
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const a = document.createElement('a');
      a.href = url;
      a.download = `products-export-${new Date().toISOString().slice(0, 10)}.csv`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
      toast.success('Products exported successfully');
    } catch {
      toast.error('Failed to export products');
    } finally {
      setIsExporting(false);
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

  const statusColors: Record<string, string> = {
    ACTIVE: 'bg-emerald-50 text-emerald-700 ring-emerald-600/20',
    UPCOMING: 'bg-blue-50 text-blue-700 ring-blue-600/20',
    INACTIVE: 'bg-gray-50 text-gray-600 ring-gray-500/20',
    DISCONTINUED: 'bg-red-50 text-red-700 ring-red-600/20',
  };

  return (
    <div>
      {/* Header */}
      <div className="sm:flex sm:items-center sm:justify-between mb-8">
        <div>
          <h1 className="text-2xl font-heading font-semibold text-gray-900">Products Catalog</h1>
          <p className="mt-2 text-sm text-gray-700">
            Manage your uPVC products, update specifications, and organize categories.
          </p>
        </div>
        <div className="mt-4 sm:mt-0 flex gap-3">
          <button
            type="button"
            onClick={handleExport}
            disabled={isExporting}
            className="admin-btn-secondary flex items-center"
          >
            <Download className={`h-4 w-4 mr-2 ${isExporting ? 'animate-bounce' : ''}`} />
            {isExporting ? 'Exporting...' : 'Export CSV'}
          </button>
          <button
            type="button"
            onClick={() => setShowFilters(!showFilters)}
            className={`admin-btn-secondary flex items-center transition-colors ${showFilters ? 'bg-brand-50 border-brand-200 text-brand-700' : ''}`}
          >
            <Filter className="h-4 w-4 mr-2" />
            Filters
          </button>
          <button type="button" className="admin-btn-primary flex items-center">
            <Plus className="h-4 w-4 mr-2" />
            Add Product
          </button>
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
              onClick={handleBulkDelete}
              disabled={isBulkDeleting}
              className="inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-red-600 rounded-lg hover:bg-red-700 transition-colors shadow-sm disabled:opacity-50"
            >
              <Trash2 className="h-4 w-4" />
              {isBulkDeleting ? 'Deleting...' : 'Delete Selected'}
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
              placeholder="Search by name, code, or description..."
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            />
          </div>
          <div className="mt-2 sm:mt-0 text-sm text-gray-500">
            {totalCount} product{totalCount !== 1 ? 's' : ''} total
          </div>
        </div>

        {/* Filters */}
        {showFilters && (
          <div className="p-4 bg-gray-50/50 border-b border-gray-200 flex flex-wrap gap-4 items-end" style={{ animation: 'slideDown 0.2s ease-out' }}>
            <div className="flex-1 min-w-[200px] max-w-xs">
              <label className="block text-xs font-medium text-gray-700 mb-1">Category</label>
              <select
                className="admin-input py-1.5 text-sm"
                value={filters.categoryId}
                onChange={e => { setFilters(prev => ({ ...prev, categoryId: e.target.value })); setPage(1); }}
              >
                <option value="">All Categories</option>
                {flatCats.map(c => (
                  <option key={c.id} value={c.id}>{c.label}</option>
                ))}
              </select>
            </div>
            <div className="flex-1 min-w-[150px] max-w-xs">
              <label className="block text-xs font-medium text-gray-700 mb-1">Status</label>
              <select
                className="admin-input py-1.5 text-sm"
                value={filters.status}
                onChange={e => { setFilters(prev => ({ ...prev, status: e.target.value })); setPage(1); }}
              >
                <option value="">All Statuses</option>
                <option value="ACTIVE">Active</option>
                <option value="UPCOMING">Upcoming</option>
                <option value="INACTIVE">Inactive</option>
                <option value="DISCONTINUED">Discontinued</option>
              </select>
            </div>
            {(filters.categoryId || filters.status) && (
              <button
                onClick={() => { setFilters({ categoryId: '', status: '' }); setPage(1); }}
                className="text-sm text-gray-500 hover:text-red-600 transition-colors mb-1.5 px-2"
              >
                Clear Filters
              </button>
            )}
          </div>
        )}

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50/80">
              <tr>
                <th className="px-4 py-3 w-12">
                  <button
                    onClick={toggleSelectAll}
                    className="text-gray-400 hover:text-brand-600 transition-colors"
                    title={allSelected ? 'Deselect all' : 'Select all'}
                  >
                    {allSelected ? (
                      <CheckSquare className="h-5 w-5 text-brand-600" />
                    ) : someSelected ? (
                      <MinusSquare className="h-5 w-5 text-brand-400" />
                    ) : (
                      <Square className="h-5 w-5" />
                    )}
                  </button>
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Image</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Item Code</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Size</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  <div className="flex items-center gap-1">
                    <Eye className="h-3.5 w-3.5" />
                    Views
                  </div>
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {isLoading ? (
                <tr>
                  <td colSpan={9} className="px-6 py-12 text-center text-gray-500">
                    <div className="flex items-center justify-center gap-3">
                      <div className="w-5 h-5 border-2 border-brand-200 border-t-brand-600 rounded-full animate-spin" />
                      Loading products...
                    </div>
                  </td>
                </tr>
              ) : data.length === 0 ? (
                <tr>
                  <td colSpan={9} className="px-6 py-12 text-center text-gray-500">
                    <div className="flex flex-col items-center gap-2">
                      <AlertTriangle className="h-8 w-8 text-gray-300" />
                      No products found.
                    </div>
                  </td>
                </tr>
              ) : (
                data.map(product => (
                  <tr
                    key={product.id}
                    className={`transition-colors ${selectedIds.has(product.id) ? 'bg-brand-50/60' : 'hover:bg-gray-50/50'}`}
                  >
                    {/* Checkbox */}
                    <td className="px-4 py-4">
                      <button
                        onClick={() => toggleSelect(product.id)}
                        className="text-gray-400 hover:text-brand-600 transition-colors"
                      >
                        {selectedIds.has(product.id) ? (
                          <CheckSquare className="h-5 w-5 text-brand-600" />
                        ) : (
                          <Square className="h-5 w-5" />
                        )}
                      </button>
                    </td>
                    {/* Image */}
                    <td className="px-6 py-4 whitespace-nowrap">
                      {product.images?.[0]?.thumbPath ? (
                        <img
                          src={`http://localhost:3000${product.images[0].thumbPath}`}
                          alt="thumb"
                          className="w-10 h-10 object-cover rounded-md border border-gray-200"
                        />
                      ) : (
                        <div className="w-10 h-10 bg-gray-100 rounded-md border border-gray-200 flex items-center justify-center">
                          <span className="text-xs text-gray-400">No Img</span>
                        </div>
                      )}
                    </td>
                    {/* Code */}
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 font-mono">
                      {product.productCode}
                    </td>
                    {/* Name — Clickable */}
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <Link
                        to={`/admin/products/${product.id}`}
                        className="font-medium text-brand-700 hover:text-brand-900 hover:underline transition-colors"
                      >
                        {product.productName}
                      </Link>
                    </td>
                    {/* Size */}
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                      {product.size}
                    </td>
                    {/* Category */}
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                      {product.category?.name || '—'}
                    </td>
                    {/* Status */}
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ring-1 ring-inset ${statusColors[product.status] || statusColors.ACTIVE}`}>
                        {product.status}
                      </span>
                    </td>
                    {/* Views */}
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <div className="flex items-center gap-1.5">
                        <Eye className="h-3.5 w-3.5 text-gray-400" />
                        <span className="font-medium tabular-nums">{product.viewCount ?? 0}</span>
                      </div>
                    </td>
                    {/* Actions */}
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex gap-1">
                        <button
                          onClick={() => navigate(`/admin/products/${product.id}/edit`)}
                          className="p-1.5 text-gray-400 hover:text-brand-600 hover:bg-brand-50 rounded-md transition-all"
                          title="Edit"
                        >
                          <Edit2 className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleClone(product.id)}
                          className="p-1.5 text-gray-400 hover:text-gray-900 hover:bg-gray-100 rounded-md transition-all"
                          title="Clone"
                        >
                          <Copy className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(product.id)}
                          className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-md transition-all"
                          title="Delete"
                        >
                          <Trash2 className="h-4 w-4" />
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

      {/* Inline keyframes for the bulk action bar animation */}
      <style>{`
        @keyframes slideDown {
          from { opacity: 0; transform: translateY(-8px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}
