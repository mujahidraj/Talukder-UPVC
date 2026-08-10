import React, { useEffect, useState } from 'react';
import { useParams, Link, useSearchParams } from 'react-router-dom';
import { ArrowRight, ChevronRight, Droplets, Filter, Grid3X3, List } from 'lucide-react';
import api from '../../lib/axios';

export default function CategoryPage() {
  const { slug } = useParams();
  const [category, setCategory] = useState<any>(null);
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState<any>(null);
  const [searchParams, setSearchParams] = useSearchParams();
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  const search = searchParams.get('search') || '';
  const size = searchParams.get('size') || '';
  const sortBy = searchParams.get('sort') || 'createdAt';

  useEffect(() => {
    if (category?.id) {
      api.get('/products/filters', { params: { categoryId: category.id } })
        .then(r => setFilters(r.data))
        .catch(() => { });
    }
  }, [category?.id]);

  useEffect(() => {
    if (!slug) return;
    setLoading(true);
    api.get(`/categories/${slug}`)
      .then(r => {
        setCategory(r.data);
        return api.get('/products', { params: { categoryId: r.data.id, limit: 100, search, size, sortBy } });
      })
      .then(r => setProducts(r.data.data))
      .catch(() => { })
      .finally(() => setLoading(false));
  }, [slug, search, size, sortBy]);

  const [showFiltersMobile, setShowFiltersMobile] = useState(false);

  const updateParam = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams);
    if (value) params.set(key, value); else params.delete(key);
    setSearchParams(params);
  };

  if (loading && !category) return <div className="min-h-screen pt-32 pb-20 flex items-center justify-center text-gray-400">Loading...</div>;
  if (!category) return <div className="min-h-screen pt-32 pb-20 flex items-center justify-center">Category not found</div>;

  return (
    <div className="bg-slate-50 min-h-screen pt-8 pb-20">
      <div className="max-w-7xl mx-auto px-4">
        <nav className="flex items-center text-sm text-gray-400 mb-6 gap-2">
          <Link to="/" className="hover:text-brand-600">Home</Link>
          <ChevronRight className="h-3 w-3" />
          <Link to="/products" className="hover:text-brand-600">Products</Link>
          {category.parent && (
            <><ChevronRight className="h-3 w-3" /><Link to={`/categories/${category.parent.slug}`} className="hover:text-brand-600">{category.parent.name}</Link></>
          )}
          <ChevronRight className="h-3 w-3" />
          <span className="text-gray-900 font-medium">{category.name}</span>
        </nav>

        <h1 className="text-3xl font-heading font-bold text-brand-950 mb-4">{category.name}</h1>

        {category.children?.length > 0 && (
          <div className="flex flex-wrap gap-2.5 mb-8">
            {category.children.map((sub: any) => (
              <Link 
                key={sub.id} 
                to={`/categories/${sub.slug}`} 
                className="px-5 py-2.5 bg-white border border-gray-100 shadow-sm text-gray-700 rounded-xl text-sm font-semibold hover:border-brand-300 hover:text-brand-600 hover:shadow-md hover:-translate-y-0.5 transition-all duration-300"
              >
                {sub.name}
              </Link>
            ))}
          </div>
        )}

        <div className="flex flex-col lg:flex-row gap-8">
          <aside className="lg:w-72 flex-shrink-0">
            <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6 lg:sticky lg:top-40 lg:max-h-[calc(100vh-12rem)] lg:overflow-y-auto">
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
                <div>
                  <label className="block text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-3">Search</label>
                  <div className="relative group">
                    <input
                      type="text"
                      className="w-full bg-gray-50 rounded-xl border-transparent focus:bg-white focus:border-brand-500 focus:ring-2 focus:ring-brand-200 text-sm px-4 py-3 transition-all outline-none"
                      placeholder="Search in category..."
                      defaultValue={search}
                      onKeyDown={(e) => { if (e.key === 'Enter') updateParam('search', (e.target as HTMLInputElement).value); }}
                    />
                  </div>
                </div>

                {filters?.sizes && filters.sizes.length > 0 && (
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <label className="block text-[11px] font-bold text-gray-400 uppercase tracking-wider">Size</label>
                      {size && (
                        <button onClick={() => updateParam('size', '')} className="text-[11px] font-semibold text-brand-600 hover:text-brand-800">Clear</button>
                      )}
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {filters.sizes.map((s: string) => (
                        <button
                          key={s}
                          onClick={() => updateParam('size', s === size ? '' : s)}
                          className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all border ${
                            s === size 
                              ? 'bg-brand-600 text-white border-brand-600 shadow-md shadow-brand-600/20' 
                              : 'bg-white text-gray-600 border-gray-200 hover:border-brand-300 hover:text-brand-600 hover:bg-brand-50/50'
                          }`}
                        >
                          {s}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                <div>
                  <label className="block text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-3">Sort By</label>
                  <div className="flex flex-col gap-2">
                    {[
                      { val: 'createdAt', label: 'Newest First' },
                      { val: 'name', label: 'Alphabetical (A-Z)' },
                      { val: 'views', label: 'Most Viewed' }
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
            <p className="text-sm text-gray-500">Showing {products.length} products in this category</p>
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
                    {p.images?.[0]?.thumbPath ? <img src={`http://localhost:3000${p.images[0].thumbPath}`} className="h-full w-full object-contain group-hover:scale-105 transition-transform" /> : <Droplets className="h-12 w-12 text-gray-300" />}
                  </div>
                  <div className="p-4">
                    <h3 className="font-semibold text-gray-900 mt-1 line-clamp-2 text-sm">{p.productName}</h3>
                    <div className="mt-3 flex flex-wrap items-center gap-2">
                      <span className="text-xs font-bold text-gray-900 bg-gray-100 px-2 py-1 rounded-md border border-gray-200">Size: {p.size}</span>
                      <span className="text-xs font-bold text-gray-900 bg-brand-50 px-2 py-1 rounded-md border border-brand-100">Code: {p.productCode}</span>
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
                        <span className="text-xs font-bold text-brand-700 bg-brand-50 border border-brand-100 px-3 py-1 rounded-full uppercase tracking-wider">{category?.name || p.category?.name}</span>
                        <span className="text-xs font-mono text-gray-500 bg-gray-50 border border-gray-100 px-2 py-1 rounded-md">CODE: {p.productCode}</span>
                      </div>
                      <h3 className="text-lg sm:text-xl font-bold text-gray-900 group-hover:text-brand-700 transition-colors line-clamp-2">{p.productName}</h3>
                      {p.description && (
                        <p className="text-sm text-gray-500 mt-2 line-clamp-2">{p.description}</p>
                      )}
                    </div>

                    <div className="mt-6 flex flex-wrap items-center gap-x-6 gap-y-3">
                      {p.size && (
                        <div className="flex items-center gap-1.5 text-sm">
                          <span className="text-gray-400">Size:</span>
                          <span className="font-semibold text-gray-900">{p.size}</span>
                        </div>
                      )}
                      {p.material && (
                        <div className="flex items-center gap-1.5 text-sm">
                          <span className="text-gray-400">Material:</span>
                          <span className="font-semibold text-gray-900">{p.material}</span>
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
        </div>
      </div>
    </div>
    </div>
  );
}
