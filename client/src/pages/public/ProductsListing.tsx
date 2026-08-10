import React, { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Grid3X3, List, Filter, Droplets, ChevronRight } from 'lucide-react';
import api from '../../lib/axios';

export default function ProductsListing() {
  const [products, setProducts] = useState<any[]>([]);
  const [meta, setMeta] = useState({ total: 0, page: 1, totalPages: 1 });
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [filters, setFilters] = useState<any>(null);
  const [searchParams, setSearchParams] = useSearchParams();

  const page = parseInt(searchParams.get('page') || '1');
  const search = searchParams.get('search') || '';
  const categoryId = searchParams.get('category') || '';
  const size = searchParams.get('size') || '';
  const sortBy = searchParams.get('sort') || 'createdAt';

  useEffect(() => {
    api.get('/products/filters').then(r => setFilters(r.data)).catch(() => {});
  }, []);

  useEffect(() => {
    setLoading(true);
    api.get('/products', { params: { page, limit: 12, search, categoryId, size, sortBy } })
      .then(r => { setProducts(r.data.data); setMeta(r.data.meta); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [page, search, categoryId, size, sortBy]);

  const updateParam = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams);
    if (value) params.set(key, value); else params.delete(key);
    params.set('page', '1');
    setSearchParams(params);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Breadcrumb */}
      <nav className="flex items-center text-sm text-gray-400 mb-6 gap-2">
        <Link to="/" className="hover:text-brand-600">Home</Link>
        <ChevronRight className="h-3 w-3" />
        <span className="text-gray-900 font-medium">Products</span>
      </nav>

      <h1 className="text-3xl font-heading font-bold text-brand-950 mb-8">Product Catalog</h1>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Sidebar Filters */}
        <aside className="lg:w-64 flex-shrink-0">
          <div className="bg-white rounded-2xl border border-gray-100 p-5 sticky top-28">
            <h3 className="font-heading font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Filter className="h-4 w-4 text-brand-600" /> Filters
            </h3>

            <div className="space-y-5">
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase mb-2">Search</label>
                <input
                  type="text"
                  className="w-full rounded-lg border-gray-200 text-sm px-3 py-2 focus:ring-brand-500 focus:border-brand-500"
                  placeholder="Search products..."
                  defaultValue={search}
                  onKeyDown={(e) => { if (e.key === 'Enter') updateParam('search', (e.target as HTMLInputElement).value); }}
                />
              </div>

              {filters?.sizes && (
                <div>
                  <label className="block text-xs font-semibold text-gray-500 uppercase mb-2">Size</label>
                  <select className="w-full rounded-lg border-gray-200 text-sm" value={size} onChange={(e) => updateParam('size', e.target.value)}>
                    <option value="">All sizes</option>
                    {filters.sizes.map((s: string) => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase mb-2">Sort By</label>
                <select className="w-full rounded-lg border-gray-200 text-sm" value={sortBy} onChange={(e) => updateParam('sort', e.target.value)}>
                  <option value="createdAt">Newest First</option>
                  <option value="name">Name A-Z</option>
                  <option value="views">Most Viewed</option>
                </select>
              </div>
            </div>
          </div>
        </aside>

        {/* Product Grid */}
        <div className="flex-1">
          <div className="flex items-center justify-between mb-6">
            <p className="text-sm text-gray-500">Showing {products.length} of {meta.total} products</p>
            <div className="flex items-center gap-2">
              <button onClick={() => setViewMode('grid')} className={`p-2 rounded-lg transition-colors ${viewMode === 'grid' ? 'bg-brand-100 text-brand-600' : 'text-gray-400 hover:text-gray-600'}`}>
                <Grid3X3 className="h-5 w-5" />
              </button>
              <button onClick={() => setViewMode('list')} className={`p-2 rounded-lg transition-colors ${viewMode === 'list' ? 'bg-brand-100 text-brand-600' : 'text-gray-400 hover:text-gray-600'}`}>
                <List className="h-5 w-5" />
              </button>
            </div>
          </div>

          {loading ? (
            <div className="py-20 text-center text-gray-400">Loading products...</div>
          ) : products.length === 0 ? (
            <div className="py-20 text-center text-gray-400">No products found matching your criteria.</div>
          ) : viewMode === 'grid' ? (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
              {products.map((p: any) => (
                <Link key={p.id} to={`/products/${p.slug}`} className="group bg-white rounded-2xl border border-gray-100 overflow-hidden hover:shadow-lg hover:border-brand-200 transition-all duration-300">
                  <div className="aspect-square bg-gray-50 flex items-center justify-center p-4">
                    {p.images?.[0]?.thumbPath ? (
                      <img src={`http://localhost:3000${p.images[0].thumbPath}`} alt={p.productName} className="h-full w-full object-contain group-hover:scale-105 transition-transform" />
                    ) : (
                      <Droplets className="h-12 w-12 text-gray-300" />
                    )}
                  </div>
                  <div className="p-4">
                    <p className="text-xs text-brand-600 font-medium">{p.category?.name}</p>
                    <h3 className="font-semibold text-gray-900 mt-1 line-clamp-2 text-sm">{p.productName}</h3>
                    <p className="text-xs text-gray-400 mt-1">{p.size} · {p.productCode}</p>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="space-y-3">
              {products.map((p: any) => (
                <Link key={p.id} to={`/products/${p.slug}`} className="flex items-center gap-4 bg-white rounded-xl border border-gray-100 p-4 hover:shadow-md hover:border-brand-200 transition-all">
                  <div className="h-16 w-16 bg-gray-50 rounded-lg flex items-center justify-center flex-shrink-0">
                    {p.images?.[0]?.thumbPath ? <img src={`http://localhost:3000${p.images[0].thumbPath}`} className="h-full w-full object-contain" /> : <Droplets className="h-8 w-8 text-gray-300" />}
                  </div>
                  <div className="min-w-0 flex-1">
                    <h3 className="font-semibold text-gray-900 text-sm">{p.productName}</h3>
                    <p className="text-xs text-gray-400 mt-0.5">{p.category?.name} · {p.size} · {p.productCode}</p>
                  </div>
                </Link>
              ))}
            </div>
          )}

          {/* Pagination */}
          {meta.totalPages > 1 && (
            <div className="mt-8 flex items-center justify-center gap-2">
              {Array.from({ length: meta.totalPages }, (_, i) => i + 1).slice(Math.max(0, page - 3), page + 2).map(p => (
                <button
                  key={p}
                  onClick={() => { const params = new URLSearchParams(searchParams); params.set('page', String(p)); setSearchParams(params); }}
                  className={`h-10 w-10 rounded-lg text-sm font-medium transition-colors ${p === page ? 'bg-brand-600 text-white' : 'bg-white text-gray-700 border border-gray-200 hover:bg-brand-50'}`}
                >
                  {p}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
