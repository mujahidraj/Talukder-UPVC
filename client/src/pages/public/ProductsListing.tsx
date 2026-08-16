import React, { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Grid3X3, List, Filter, Droplets, ChevronRight, ArrowRight, Layers } from 'lucide-react';
import api from '../../lib/axios';

export default function ProductsListing() {
  const [products, setProducts] = useState<any[]>([]);
  const [meta, setMeta] = useState({ total: 0, page: 1, totalPages: 1 });
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [filters, setFilters] = useState<any>(null);
  const [categories, setCategories] = useState<any[]>([]);
  const [searchParams, setSearchParams] = useSearchParams();

  const page = parseInt(searchParams.get('page') || '1');
  const search = searchParams.get('search') || '';
  const categoryId = searchParams.get('category') || '';
  const size = searchParams.get('size') || '';
  const sortBy = searchParams.get('sort') || 'name';

  useEffect(() => {
    api.get('/products/filters', { params: { categoryId } }).then(r => setFilters(r.data)).catch(() => { });
  }, [categoryId]);

  useEffect(() => {
    api.get('/categories').then(r => {
      const flat: any[] = [];
      const flatten = (cats: any[], level = 0) => {
        cats.forEach(c => {
          flat.push({ ...c, level });
          if (c.children) flatten(c.children, level + 1);
        });
      };
      if (Array.isArray(r.data)) flatten(r.data);
      setCategories(flat);
    }).catch(() => {});
  }, []);

  useEffect(() => {
    setLoading(true);
    api.get('/products/grouped', { params: { page, limit: 24, search, categoryId, size, sortBy } })
      .then(r => { setProducts(r.data.data); setMeta(r.data.meta); })
      .catch(() => { })
      .finally(() => setLoading(false));
  }, [page, search, categoryId, size, sortBy]);

  const [showFiltersMobile, setShowFiltersMobile] = useState(false);

  const updateParam = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams);
    if (value) params.set(key, value);
    else params.delete(key);
    // Reset page to 1 when changing filters
    if (key !== 'page') params.delete('page');
    setSearchParams(params);
  };

  return (
    <div className="bg-slate-50 min-h-screen pt-8 pb-20">
      <div className="max-w-7xl mx-auto px-4">
        {/* Breadcrumb */}
        <nav className="flex items-center text-sm text-gray-400 mb-6 gap-2">
          <Link to="/" className="hover:text-brand-600">Home</Link>
          <ChevronRight className="h-3 w-3" />
          <span className="text-gray-900 font-medium">Products</span>
        </nav>

        <h1 className="text-3xl font-heading font-bold text-brand-950 mb-8">Product Catalog</h1>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar Filters */}
          <aside className="lg:w-72 flex-shrink-0 z-10">
            <div className="bg-white rounded-3xl magic-border magic-border-white shadow-sm p-6 lg:sticky lg:top-40 lg:max-h-[calc(100vh-12rem)] lg:overflow-y-auto">
              <div 
                className="flex items-center justify-between cursor-pointer lg:cursor-default lg:mb-6"
                onClick={() => setShowFiltersMobile(!showFiltersMobile)}
              >
                <h3 className="font-heading font-bold text-gray-900 flex items-center gap-2 text-lg">
                  <Filter className="h-5 w-5 text-brand-600" /> Filter Products
                </h3>
                <button className="lg:hidden text-brand-600 font-semibold text-sm bg-brand-50 px-3 py-1 rounded-lg">
                  {showFiltersMobile ? 'Hide' : 'Show'}
                </button>
              </div>

              <div className={`mt-6 lg:mt-0 space-y-8 ${showFiltersMobile ? 'block' : 'hidden lg:block'}`}>
                {/* Search */}
                <div>
                  <label className="block text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-3">Search</label>
                  <div className="relative group">
                    <input
                      type="text"
                      className="w-full bg-gray-50 rounded-xl border-transparent focus:bg-white focus:border-brand-500 focus:ring-2 focus:ring-brand-200 text-sm px-4 py-3 transition-all outline-none"
                      placeholder="Search products..."
                      defaultValue={search}
                      onKeyDown={(e) => { if (e.key === 'Enter') updateParam('search', (e.target as HTMLInputElement).value); }}
                    />
                  </div>
                </div>

                {/* Categories as Dropdown */}
                {categories.length > 0 && (
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <label className="block text-[11px] font-bold text-gray-400 uppercase tracking-wider">Category</label>
                      {categoryId && (
                        <button onClick={() => updateParam('category', '')} className="text-[11px] font-semibold text-brand-600 hover:text-brand-800">Clear</button>
                      )}
                    </div>
                    <select
                      value={categoryId}
                      onChange={(e) => updateParam('category', e.target.value)}
                      className="w-full bg-gray-50 rounded-xl border-transparent focus:bg-white focus:border-brand-500 focus:ring-2 focus:ring-brand-200 text-sm px-4 py-3 transition-all outline-none cursor-pointer"
                    >
                      <option value="">All Categories</option>
                      {categories.map((c: any) => (
                        <option key={c.id} value={c.id}>
                          {'\u00A0\u00A0'.repeat(c.level)}{c.name}
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                {/* Sizes as Dropdown */}
                {filters?.sizes && filters.sizes.length > 0 && (
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <label className="block text-[11px] font-bold text-gray-400 uppercase tracking-wider">Size</label>
                      {size && (
                        <button onClick={() => updateParam('size', '')} className="text-[11px] font-semibold text-brand-600 hover:text-brand-800">Clear</button>
                      )}
                    </div>
                    <select
                      value={size}
                      onChange={(e) => updateParam('size', e.target.value)}
                      className="w-full bg-gray-50 rounded-xl border-transparent focus:bg-white focus:border-brand-500 focus:ring-2 focus:ring-brand-200 text-sm px-4 py-3 transition-all outline-none cursor-pointer"
                    >
                      <option value="">All Sizes</option>
                      {filters.sizes.map((s: string) => (
                        <option key={s} value={s}>{s}</option>
                      ))}
                    </select>
                  </div>
                )}

                {/* Sort Options */}
                <div>
                  <label className="block text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-3">Sort By</label>
                  <div className="flex flex-col gap-2">
                    {[
                      { val: 'name', label: 'Alphabetical (A-Z)' },
                      { val: 'variants', label: 'Most Variants' },
                    ].map(opt => (
                      <button
                        key={opt.val}
                        onClick={() => updateParam('sort', opt.val)}
                        className={`text-left px-4 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                          sortBy === opt.val
                            ? 'bg-brand-50 text-brand-700'
                            : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900'
                        }`}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>
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
                    <div className="mt-3 flex flex-wrap items-center gap-2">
                      {p.isTubewell ? (
                        <>
                          <span className="text-xs font-bold text-gray-900 bg-gray-100 px-2 py-1 rounded-md border border-gray-200">Size: {p.variants?.[0]?.size || '-'}</span>
                          <span className="text-xs font-bold text-gray-900 bg-brand-50 px-2 py-1 rounded-md border border-brand-100">Code: {p.variants?.[0]?.productCode}</span>
                        </>
                      ) : (
                        <>
                          <span className="inline-flex items-center gap-1 text-xs font-bold text-brand-700 bg-brand-50 px-2.5 py-1 rounded-md border border-brand-100">
                            <Layers className="h-3 w-3" /> {p.variantCount} {p.variantCount === 1 ? 'Variant' : 'Variants'}
                          </span>
                          {p.variants?.[0]?.classType && p.variants[0].classType !== '-' && (
                            <span className="text-xs font-bold text-gray-700 bg-gray-100 px-2 py-1 rounded-md border border-gray-200">
                              Class {p.variants[0].classType}
                            </span>
                          )}
                        </>
                      )}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="flex flex-col gap-4">
              {products.map((p: any) => (
                <Link key={p.id} to={`/products/${p.slug}`} className="group flex flex-col sm:flex-row gap-6 bg-white rounded-2xl border border-gray-100 p-4 sm:p-5 hover:shadow-xl hover:shadow-brand-900/5 hover:border-brand-200 transition-all duration-300">
                  <div className="h-48 w-full sm:w-48 bg-gray-50 rounded-xl flex items-center justify-center flex-shrink-0 p-4 relative overflow-hidden group-hover:bg-brand-50/50 transition-colors">
                    {p.images?.[0]?.thumbPath ? <img src={`http://localhost:3000${p.images[0].thumbPath}`} className="h-full w-full object-contain group-hover:scale-110 transition-transform duration-500" /> : <Droplets className="h-12 w-12 text-gray-300" />}
                  </div>
                  <div className="min-w-0 flex-1 flex flex-col justify-between py-1">
                    <div>
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-xs font-bold text-brand-700 bg-brand-50 border border-brand-100 px-3 py-1 rounded-full uppercase tracking-wider">{p.category?.name}</span>
                        {p.isTubewell ? (
                          <span className="text-xs font-mono text-gray-500 bg-gray-50 border border-gray-100 px-2 py-1 rounded-md">CODE: {p.variants?.[0]?.productCode}</span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-xs font-bold text-brand-700 bg-brand-50 px-2.5 py-1 rounded-md border border-brand-100">
                            <Layers className="h-3 w-3" /> {p.variantCount} {p.variantCount === 1 ? 'Variant' : 'Variants'}
                          </span>
                        )}
                      </div>
                      <h3 className="text-lg sm:text-xl font-bold text-gray-900 group-hover:text-brand-700 transition-colors line-clamp-2">{p.productName}</h3>
                      {p.description && (
                        <p className="text-sm text-gray-500 mt-2 line-clamp-2">{p.description}</p>
                      )}
                    </div>

                    <div className="mt-6 flex flex-wrap items-center gap-x-6 gap-y-3">
                      {!p.isTubewell && p.variantCount > 1 && (
                        <div className="flex items-center gap-1.5 text-sm">
                          <span className="text-gray-400">Sizes:</span>
                          <span className="font-semibold text-gray-900">
                            {p.variants?.slice(0, 3).map((v: any) => v.size).filter(Boolean).join(', ')}
                            {p.variants?.length > 3 ? ` +${p.variants.length - 3} more` : ''}
                          </span>
                        </div>
                      )}
                      {p.isTubewell && p.variants?.[0]?.size && (
                        <div className="flex items-center gap-1.5 text-sm">
                          <span className="text-gray-400">Size:</span>
                          <span className="font-semibold text-gray-900">{p.variants[0].size}</span>
                        </div>
                      )}

                      <div className="ml-auto flex items-center gap-2 text-brand-600 font-semibold text-sm group-hover:translate-x-2 transition-transform">
                        View Product <ArrowRight className="h-4 w-4" />
                      </div>
                    </div>
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
    </div>
  );
}
