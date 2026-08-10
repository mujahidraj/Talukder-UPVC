import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  useTable,
  tableFeatures,
  createColumnHelper,
} from '@tanstack/react-table';
import { Plus, Search, Edit2, Trash2, Copy, Filter } from 'lucide-react';
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
}

const features = tableFeatures({});
const helper = createColumnHelper<typeof features, Product>();

export default function ProductsManager() {
  const [data, setData] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const limit = 10;

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await api.get('/admin/products', {
        params: { page, limit, search }
      });
      setData(res.data.data);
      setTotalPages(res.data.meta.totalPages);
    } catch {
      toast.error('Failed to load products');
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

  const columns = useMemo(
    () => [
      helper.accessor('images', {
        header: 'Image',
        cell: (info) => {
          const imgs = info.getValue();
          const thumb = imgs?.[0]?.thumbPath;
          return thumb ? (
            <img src={`http://localhost:3000${thumb}`} alt="thumb" className="w-10 h-10 object-cover rounded-md border border-gray-200" />
          ) : (
            <div className="w-10 h-10 bg-gray-100 rounded-md border border-gray-200 flex items-center justify-center">
              <span className="text-xs text-gray-400">No Img</span>
            </div>
          );
        }
      }),
      helper.accessor('productCode', { header: 'Item Code' }),
      helper.accessor('productName', { header: 'Name' }),
      helper.accessor('size', { header: 'Size' }),
      helper.accessor((row) => row.category?.name, {
        id: 'category.name',
        header: 'Category',
      }),
      helper.accessor('status', {
        header: 'Status',
        cell: info => {
          const status = info.getValue();
          const colors: Record<string, string> = {
            ACTIVE: 'bg-green-100 text-green-800',
            UPCOMING: 'bg-blue-100 text-blue-800',
            INACTIVE: 'bg-gray-100 text-gray-800',
            DISCONTINUED: 'bg-red-100 text-red-800',
          };
          return (
            <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${colors[status] || colors.ACTIVE}`}>
              {status}
            </span>
          );
        }
      }),
      helper.display({
        id: 'actions',
        header: 'Actions',
        cell: (info) => (
          <div className="flex gap-2">
            <button className="p-1 text-gray-400 hover:text-brand-600 transition-colors" title="Edit">
              <Edit2 className="h-4 w-4" />
            </button>
            <button onClick={() => handleClone(info.row.original.id)} className="p-1 text-gray-400 hover:text-gray-900 transition-colors" title="Clone">
              <Copy className="h-4 w-4" />
            </button>
            <button onClick={() => handleDelete(info.row.original.id)} className="p-1 text-gray-400 hover:text-red-600 transition-colors" title="Delete">
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
        )
      })
    ],
    []
  );

  const table = useTable({
    data,
    columns,
    features,
  });

  return (
    <div>
      <div className="sm:flex sm:items-center sm:justify-between mb-8">
        <div>
          <h1 className="text-2xl font-heading font-semibold text-gray-900">Products Catalog</h1>
          <p className="mt-2 text-sm text-gray-700">
            Manage your uPVC products, update specifications, and organize categories.
          </p>
        </div>
        <div className="mt-4 sm:mt-0 flex gap-3">
          <button type="button" className="admin-btn-secondary flex items-center">
            <Filter className="h-4 w-4 mr-2" />
            Filters
          </button>
          <button type="button" className="admin-btn-primary flex items-center">
            <Plus className="h-4 w-4 mr-2" />
            Add Product
          </button>
        </div>
      </div>

      <div className="glass-panel overflow-hidden">
        <div className="p-4 border-b border-gray-200 bg-white/50 sm:flex sm:items-center sm:justify-between">
          <div className="relative max-w-sm w-full">
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
              <Search className="h-4 w-4 text-gray-400" />
            </div>
            <input
              type="text"
              className="admin-input pl-9"
              placeholder="Search by name, code, or description..."
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50/80">
              {table.getHeaderGroups().map(headerGroup => (
                <tr key={headerGroup.id}>
                  {headerGroup.headers.map(header => (
                    <th key={header.id} className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      {header.isPlaceholder ? null : <table.FlexRender header={header} />}
                    </th>
                  ))}
                </tr>
              ))}
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {isLoading ? (
                <tr>
                  <td colSpan={columns.length} className="px-6 py-12 text-center text-gray-500">
                    Loading products...
                  </td>
                </tr>
              ) : data.length === 0 ? (
                <tr>
                  <td colSpan={columns.length} className="px-6 py-12 text-center text-gray-500">
                    No products found.
                  </td>
                </tr>
              ) : (
                table.getRowModel().rows.map(row => (
                  <tr key={row.id} className="hover:bg-gray-50/50 transition-colors">
                    {row.getAllCells().map(cell => (
                      <td key={cell.id} className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                        <table.FlexRender cell={cell} />
                      </td>
                    ))}
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
