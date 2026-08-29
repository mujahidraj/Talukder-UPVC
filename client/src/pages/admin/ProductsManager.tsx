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
  ArrowUp,
  ArrowDown,
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
  viewCount: number;
  isNewArrival: boolean;
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
  const [sortBy, setSortBy] = useState('createdAt');
  const [sortOrder, setSortOrder] = useState('desc');
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
      const params: any = { page, limit, search, sortBy, sortOrder };
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
  }, [page, search, filters, sortBy, sortOrder]);

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

  const handleSort = (field: string) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('asc');
    }
    setPage(1);
  };

  const renderSortIcon = (field: string) => {
    if (sortBy !== field) return <span className="w-4 h-4 ml-1 inline-block opacity-30 group-hover:opacity-100 transition-opacity" />;
    return sortOrder === 'asc' ? <ArrowUp className="h-4 w-4 ml-1 inline-block text-brand-600" /> : <ArrowDown className="h-4 w-4 ml-1 inline-block text-brand-600" />;
  };

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

  const handleToggleNewArrival = async (id: string, currentValue: boolean) => {
    try {
      await api.put(`/admin/products/${id}/toggle-new-arrival`);
      toast.success(currentValue ? 'Removed from New Arrivals' : 'Added to New Arrivals');
      fetchData();
    } catch (error) {
      console.error(error);
      toast.error('Failed to toggle new arrival status');
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

  const [isSelectingAll, setIsSelectingAll] = useState(false);

  const toggleSelectAll = async () => {
    if (selectedIds.size === totalCount && totalCount > 0) {
      setSelectedIds(new Set());
    } else {
      setIsSelectingAll(true);
      try {
        const queryParams = { ...filters, search };
        const cleanParams = Object.fromEntries(
          Object.entries(queryParams).filter(([_, v]) => v !== '')
        );
        const res = await api.get('/admin/products/bulk/ids', {
          params: cleanParams
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

  const statusColors: Record<string, string> = {
    ACTIVE: 'bg-emerald-50 text-emerald-700 border-emerald-200 shadow-sm',
    UPCOMING: 'bg-blue-50 text-blue-700 border-blue-200 shadow-sm',
    INACTIVE: 'bg-gray-50 text-gray-600 border-gray-200 shadow-sm',
    DISCONTINUED: 'bg-red-50 text-red-700 border-red-200 shadow-sm',
  };

  return (
    <div className="animate-fade-in pb-12">
      {/* Premium Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8">
        <div className="max-w-xl">
          <h1 className="text-3xl font-bold tracking-tight text-gray-900 mb-2">Products Catalog</h1>
          <p className="text-sm font-medium text-gray-500 leading-relaxed">
            Manage your <span className="text-brand-600 font-bold">u</span>PVC products, update specifications, and keep your inventory perfectly organized.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={handleExport}
            disabled={isExporting}
            className="flex items-center px-4 py-2.5 bg-white border border-gray-200 text-gray-700 text-sm font-semibold rounded-xl hover:bg-gray-50 hover:border-gray-300 shadow-sm transition-all disabled:opacity-50"
          >
            <Download className={`h-4 w-4 mr-2 ${isExporting ? 'animate-bounce' : 'text-gray-500'}`} />
            {isExporting ? 'Exporting...' : 'Export CSV'}
          </button>
          <button
            type="button"
            onClick={() => setShowFilters(!showFilters)}
            className={`flex items-center px-4 py-2.5 border text-sm font-semibold rounded-xl shadow-sm transition-all ${
              showFilters 
                ? 'bg-brand-50 border-brand-200 text-brand-700' 
                : 'bg-white border-gray-200 text-gray-700 hover:bg-gray-50 hover:border-gray-300'
            }`}
          >
            <Filter className={`h-4 w-4 mr-2 ${showFilters ? 'text-brand-600' : 'text-gray-500'}`} />
            Filters
          </button>
          <button 
            type="button" 
            className="flex items-center px-5 py-2.5 bg-gradient-to-r from-brand-600 to-brand-500 text-white text-sm font-bold rounded-xl shadow-lg shadow-brand-500/30 hover:shadow-brand-500/50 hover:-translate-y-0.5 transition-all active:scale-95"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Product
          </button>
        </div>
      </div>

      {/* Bulk Action Bar */}
      {selectedIds.size > 0 && (
        <div
          className="mb-6 bg-brand-50 border border-brand-200 rounded-2xl px-6 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-sm relative overflow-hidden"
          style={{ animation: 'slideDown 0.2s ease-out' }}
        >
          <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-brand-500"></div>
          <div className="flex items-center gap-4">
            <div className="flex items-center justify-center h-10 w-10 rounded-xl bg-brand-600 text-white text-base font-bold shadow-md shadow-brand-500/20">
              {selectedIds.size}
            </div>
            <span className="text-base font-bold text-brand-900">
              product{selectedIds.size > 1 ? 's' : ''} selected
            </span>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={handleBulkDelete}
              disabled={isBulkDeleting}
              className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-bold text-white bg-red-600 rounded-xl hover:bg-red-700 transition-colors shadow-sm disabled:opacity-50"
            >
              {isBulkDeleting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
              {isBulkDeleting ? 'Deleting...' : 'Delete Selected'}
            </button>
            <button
              onClick={() => setSelectedIds(new Set())}
              className="inline-flex items-center gap-1.5 px-4 py-2.5 text-sm font-semibold text-gray-600 hover:text-gray-900 hover:bg-gray-100/80 rounded-xl transition-colors"
            >
              <X className="h-4 w-4" />
              Clear
            </button>
          </div>
        </div>
      )}

      {/* Main Container */}
      <div className="bg-white rounded-3xl shadow-[0_2px_15px_-3px_rgba(6,81,237,0.05)] border border-gray-100 overflow-hidden relative">
        {/* Search & Filter Bar */}
        <div className="p-5 border-b border-gray-100 bg-white flex flex-col lg:flex-row lg:items-center justify-between gap-5 relative z-10">
          <div className="flex flex-col sm:flex-row items-center gap-4 w-full lg:max-w-2xl">
            <div className="relative w-full">
              <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4">
                <Search className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                className="w-full bg-gray-50 border border-gray-200 text-gray-900 rounded-xl pl-11 pr-4 py-3 text-sm focus:bg-white focus:border-brand-500 focus:ring-4 focus:ring-brand-500/10 transition-all outline-none"
                placeholder="Search by name, code, or description..."
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
                {selectedIds.size === totalCount ? <MinusSquare className="h-5 w-5 text-brand-600" /> : <CheckSquare className="h-5 w-5 text-gray-400" />}
                {isSelectingAll ? 'Selecting...' : selectedIds.size === totalCount ? 'Deselect All' : 'Select All Files'}
              </button>
            )}
          </div>
          <div className="text-sm font-bold text-gray-500 bg-gray-50 px-4 py-2.5 rounded-xl border border-gray-100 whitespace-nowrap inline-flex items-center shadow-sm">
            Total: <span className="text-brand-600 ml-1.5">{totalCount} product{totalCount !== 1 ? 's' : ''}</span>
          </div>
        </div>

        {/* Filters Panel */}
        {showFilters && (
          <div className="p-6 bg-gray-50/80 border-b border-gray-100 flex flex-wrap gap-6 items-end" style={{ animation: 'slideDown 0.2s ease-out' }}>
            <div className="flex-1 min-w-[200px] max-w-sm">
              <label className="block text-xs font-bold text-gray-700 mb-2 uppercase tracking-wider">Category</label>
              <select
                className="w-full bg-white border border-gray-200 text-gray-900 rounded-xl px-4 py-3 text-sm focus:border-brand-500 focus:ring-4 focus:ring-brand-500/10 outline-none shadow-sm transition-all cursor-pointer"
                value={filters.categoryId}
                onChange={e => { setFilters(prev => ({ ...prev, categoryId: e.target.value })); setPage(1); }}
              >
                <option value="">All Categories</option>
                {flatCats.map(c => (
                  <option key={c.id} value={c.id}>{c.label}</option>
                ))}
              </select>
            </div>
            <div className="flex-1 min-w-[150px] max-w-[250px]">
              <label className="block text-xs font-bold text-gray-700 mb-2 uppercase tracking-wider">Status</label>
              <select
                className="w-full bg-white border border-gray-200 text-gray-900 rounded-xl px-4 py-3 text-sm focus:border-brand-500 focus:ring-4 focus:ring-brand-500/10 outline-none shadow-sm transition-all cursor-pointer"
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
                className="text-sm font-bold text-gray-500 hover:text-red-600 transition-colors mb-3 px-2 flex items-center gap-1.5"
              >
                <X className="h-4 w-4" />
                Clear Filters
              </button>
            )}
          </div>
        )}

        {/* Table Data */}
        <div className="overflow-x-auto relative z-0">
          <table className="min-w-full divide-y divide-gray-100">
            <thead className="bg-gray-50/50">
              <tr>
                <th className="px-6 py-4 w-16">
                  <button
                    onClick={toggleSelectAll}
                    className="text-gray-400 hover:text-brand-600 transition-colors bg-white border border-gray-200 rounded p-1 shadow-sm"
                    title={allSelected ? 'Deselect all' : 'Select all'}
                  >
                    {allSelected ? (
                      <CheckSquare className="h-5 w-5 text-brand-600" />
                    ) : someSelected ? (
                      <MinusSquare className="h-5 w-5 text-brand-500" />
                    ) : (
                      <Square className="h-5 w-5" />
                    )}
                  </button>
                </th>
                <th className="px-6 py-4 text-left text-[11px] font-bold text-gray-500 uppercase tracking-widest">Image</th>
                <th 
                  className="px-6 py-4 text-left text-[11px] font-bold text-gray-500 uppercase tracking-widest cursor-pointer hover:bg-gray-200 transition-colors select-none group"
                  onClick={() => handleSort('code')}
                >
                  <div className="flex items-center">
                    Item Code {renderSortIcon('code')}
                  </div>
                </th>
                <th 
                  className="px-6 py-4 text-left text-[11px] font-bold text-gray-500 uppercase tracking-widest cursor-pointer hover:bg-gray-200 transition-colors select-none group"
                  onClick={() => handleSort('name')}
                >
                  <div className="flex items-center">
                    Name {renderSortIcon('name')}
                  </div>
                </th>
                <th className="px-6 py-4 text-left text-[11px] font-bold text-gray-500 uppercase tracking-widest">Size</th>
                <th className="px-6 py-4 text-left text-[11px] font-bold text-gray-500 uppercase tracking-widest">Category</th>
                <th className="px-6 py-4 text-left text-[11px] font-bold text-gray-500 uppercase tracking-widest">Status</th>
                <th className="px-6 py-4 text-center text-[11px] font-bold text-gray-500 uppercase tracking-widest">
                  New Arrival
                </th>
                <th 
                  className="px-6 py-4 text-left text-[11px] font-bold text-gray-500 uppercase tracking-widest cursor-pointer hover:bg-gray-200 transition-colors select-none group"
                  onClick={() => handleSort('views')}
                >
                  <div className="flex items-center">
                    <Eye className="h-3.5 w-3.5 mr-1" />
                    Views {renderSortIcon('views')}
                  </div>
                </th>
                <th className="px-6 py-4 text-left text-[11px] font-bold text-gray-500 uppercase tracking-widest">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-50">
              {isLoading ? (
                <tr>
                  <td colSpan={10} className="px-6 py-20 text-center text-gray-500">
                    <div className="flex flex-col items-center justify-center gap-4 text-brand-600">
                      <Loader2 className="h-8 w-8 animate-spin" />
                      <span className="font-bold text-gray-500">Loading your products...</span>
                    </div>
                  </td>
                </tr>
              ) : data.length === 0 ? (
                <tr>
                  <td colSpan={10} className="px-6 py-20 text-center text-gray-500">
                    <div className="flex flex-col items-center gap-3">
                      <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100">
                        <AlertTriangle className="h-10 w-10 text-gray-400" />
                      </div>
                      <p className="text-lg font-bold text-gray-900 mt-2">No products found</p>
                      <p className="text-sm">Try adjusting your filters or search terms.</p>
                    </div>
                  </td>
                </tr>
              ) : (
                data.map(product => (
                  <tr
                    key={product.id}
                    className={`transition-all duration-200 group ${selectedIds.has(product.id) ? 'bg-brand-50/50' : 'hover:bg-gray-50/80'}`}
                  >
                    {/* Checkbox */}
                    <td className="px-6 py-5 whitespace-nowrap">
                      <button
                        onClick={() => toggleSelect(product.id)}
                        className="text-gray-400 hover:text-brand-600 transition-colors bg-white border border-gray-200 rounded p-1 shadow-sm"
                      >
                        {selectedIds.has(product.id) ? (
                          <CheckSquare className="h-5 w-5 text-brand-600" />
                        ) : (
                          <Square className="h-5 w-5" />
                        )}
                      </button>
                    </td>
                    {/* Image */}
                    <td className="px-6 py-5 whitespace-nowrap">
                      {product.images?.[0]?.thumbPath ? (
                        <div className="relative group-hover:scale-105 transition-transform duration-300">
                          <img
                            src={`http://localhost:3000${product.images[0].thumbPath}`}
                            alt="thumb"
                            className="w-12 h-12 object-cover rounded-xl border border-gray-200 shadow-sm"
                          />
                        </div>
                      ) : (
                        <div className="w-12 h-12 bg-gray-100 rounded-xl border border-gray-200 flex flex-col items-center justify-center">
                          <span className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">No Img</span>
                        </div>
                      )}
                    </td>
                    {/* Code */}
                    <td className="px-6 py-5 whitespace-nowrap text-sm font-mono text-gray-600">
                      <span className="bg-gray-100 px-2.5 py-1.5 rounded-lg border border-gray-200/60 shadow-sm">
                        {product.productCode}
                      </span>
                    </td>
                    {/* Name — Clickable */}
                    <td className="px-6 py-5 text-sm">
                      <Link
                        to={`/admin/products/${product.id}`}
                        className="font-bold text-gray-900 hover:text-brand-600 transition-colors line-clamp-2"
                        title={product.productName}
                      >
                        {product.productName}
                      </Link>
                    </td>
                    {/* Size */}
                    <td className="px-6 py-5 whitespace-nowrap text-sm font-medium text-gray-600">
                      {product.size || '—'}
                    </td>
                    {/* Category */}
                    <td className="px-6 py-5 whitespace-nowrap text-sm text-gray-600">
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-gray-100 text-gray-700 border border-gray-200 shadow-sm">
                        {product.category?.name || 'Uncategorized'}
                      </span>
                    </td>
                    {/* Status */}
                    <td className="px-6 py-5 whitespace-nowrap">
                      <span className={`inline-flex items-center px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider border ${statusColors[product.status] || statusColors.ACTIVE}`}>
                        {product.status}
                      </span>
                    </td>
                    {/* New Arrival Toggle */}
                    <td className="px-6 py-5 whitespace-nowrap text-center">
                      <button
                        onClick={() => handleToggleNewArrival(product.id, product.isNewArrival)}
                        className={`relative inline-flex h-6 w-12 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-brand-500 focus:ring-offset-2 ${
                          product.isNewArrival ? 'bg-brand-500 shadow-inner' : 'bg-gray-200 shadow-inner'
                        }`}
                      >
                        <span
                          className={`inline-block h-4 w-4 transform rounded-full bg-white shadow-sm transition-transform duration-300 ${
                            product.isNewArrival ? 'translate-x-7' : 'translate-x-1'
                          }`}
                        />
                      </button>
                    </td>
                    {/* Views */}
                    <td className="px-6 py-5 whitespace-nowrap text-sm text-gray-500">
                      <div className="flex items-center gap-2 bg-gray-50 px-2 py-1 rounded-lg w-fit border border-gray-100">
                        <Eye className="h-4 w-4 text-brand-500" />
                        <span className="font-bold tabular-nums text-gray-700">{product.viewCount ?? 0}</span>
                      </div>
                    </td>
                    {/* Actions */}
                    <td className="px-6 py-5 whitespace-nowrap">
                      <div className="flex gap-2">
                        <button
                          onClick={() => navigate(`/admin/products/${product.id}/edit`)}
                          className="p-2 text-brand-600 bg-brand-50 hover:bg-brand-100 hover:text-brand-700 rounded-xl transition-all shadow-sm"
                          title="Edit"
                        >
                          <Edit2 className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleClone(product.id)}
                          className="p-2 text-gray-600 bg-gray-100 hover:bg-gray-200 hover:text-gray-900 rounded-xl transition-all shadow-sm"
                          title="Clone"
                        >
                          <Copy className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(product.id)}
                          className="p-2 text-red-600 bg-red-50 hover:bg-red-100 hover:text-red-700 rounded-xl transition-all shadow-sm"
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
        <div className="bg-gray-50/50 px-6 py-4 border-t border-gray-100 flex flex-col sm:flex-row items-center justify-between gap-4">
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
