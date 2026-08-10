import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ChevronRight, Droplets } from 'lucide-react';
import api from '../../lib/axios';

export default function CategoryPage() {
  const { slug } = useParams();
  const [category, setCategory] = useState<any>(null);
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!slug) return;
    setLoading(true);
    api.get(`/categories/${slug}`)
      .then(r => {
        setCategory(r.data);
        return api.get('/products', { params: { categoryId: r.data.id, limit: 50 } });
      })
      .then(r => setProducts(r.data.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [slug]);

  if (loading) return <div className="max-w-7xl mx-auto px-4 py-20 text-center text-gray-400">Loading...</div>;
  if (!category) return <div className="max-w-7xl mx-auto px-4 py-20 text-center">Category not found</div>;

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
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

      {/* Sub-categories */}
      {category.children?.length > 0 && (
        <div className="flex flex-wrap gap-3 mb-8">
          {category.children.map((sub: any) => (
            <Link key={sub.id} to={`/categories/${sub.slug}`} className="px-4 py-2 bg-brand-50 text-brand-700 rounded-full text-sm font-medium hover:bg-brand-100 transition-colors">
              {sub.name} ({sub._count?.products || 0})
            </Link>
          ))}
        </div>
      )}

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {products.map((p: any) => (
          <Link key={p.id} to={`/products/${p.slug}`} className="group bg-white rounded-2xl border border-gray-100 overflow-hidden hover:shadow-lg transition-all">
            <div className="aspect-square bg-gray-50 flex items-center justify-center p-4">
              {p.images?.[0]?.thumbPath ? <img src={`http://localhost:3000${p.images[0].thumbPath}`} className="h-full w-full object-contain group-hover:scale-105 transition-transform" /> : <Droplets className="h-12 w-12 text-gray-300" />}
            </div>
            <div className="p-4">
              <h3 className="font-semibold text-gray-900 text-sm line-clamp-2">{p.productName}</h3>
              <p className="text-xs text-gray-400 mt-1">{p.size} · {p.productCode}</p>
            </div>
          </Link>
        ))}
      </div>

      {products.length === 0 && (
        <div className="py-20 text-center text-gray-400">No products found in this category.</div>
      )}
    </div>
  );
}
