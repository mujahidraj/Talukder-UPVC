import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ChevronRight, Heart, ShoppingCart, Droplets, Share2 } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../../lib/axios';
import SEO from '../../components/SEO';
import { productJsonLd } from '../../lib/jsonLd';

export default function ProductDetail() {
  const { slug } = useParams();
  const [product, setProduct] = useState<any>(null);
  const [related, setRelated] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!slug) return;
    setLoading(true);
    api.get(`/products/${slug}`)
      .then(r => {
        setProduct(r.data);
        return api.get(`/products/${r.data.id}/related`, { params: { categoryId: r.data.categoryId, limit: 4 } });
      })
      .then(r => setRelated(r.data))
      .catch(() => toast.error('Product not found'))
      .finally(() => setLoading(false));
  }, [slug]);

  const addToWishlist = () => {
    const list = JSON.parse(localStorage.getItem('talukder-wishlist') || '[]');
    if (list.find((w: any) => w.id === product.id)) { toast('Already in wishlist'); return; }
    list.push({ id: product.id, name: product.productName, slug: product.slug, code: product.productCode, size: product.size });
    localStorage.setItem('talukder-wishlist', JSON.stringify(list));
    api.post('/wishlist/track', { productId: product.id }).catch(() => {});
    toast.success('Added to wishlist!');
  };

  const addToEnquiry = () => {
    const list = JSON.parse(localStorage.getItem('talukder-enquiry') || '[]');
    if (!list.find((e: any) => e.id === product.id)) {
      list.push({ id: product.id, name: product.productName, code: product.productCode, size: product.size, quantity: 1 });
      localStorage.setItem('talukder-enquiry', JSON.stringify(list));
      window.dispatchEvent(new Event('enquiry-updated'));
    }
    // Open the modal immediately
    window.dispatchEvent(new Event('open-enquiry-modal'));
  };

  if (loading) return <div className="max-w-7xl mx-auto px-4 py-20 text-center text-gray-400">Loading...</div>;
  if (!product) return <div className="max-w-7xl mx-auto px-4 py-20 text-center text-gray-400">Product not found</div>;

  const breadcrumbs = [];
  if (product.category?.parent?.parent) breadcrumbs.push(product.category.parent.parent);
  if (product.category?.parent) breadcrumbs.push(product.category.parent);
  breadcrumbs.push(product.category);

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <SEO 
        title={product.productName} 
        description={product.description || `Buy ${product.productName} (${product.size}) from Talukder uPVC.`} 
        canonical={`/products/${product.slug}`} 
        type="product" 
        image={product.images?.[0]?.fullPath ? `http://localhost:3000${product.images[0].fullPath}` : undefined} 
        jsonLd={productJsonLd(product)} 
      />

      {/* Breadcrumb */}
      <nav className="flex items-center text-sm text-gray-400 mb-6 gap-2 flex-wrap">
        <Link to="/" className="hover:text-brand-600">Home</Link>
        <ChevronRight className="h-3 w-3" />
        <Link to="/products" className="hover:text-brand-600">Products</Link>
        {breadcrumbs.map((bc: any) => (
          <React.Fragment key={bc.id}>
            <ChevronRight className="h-3 w-3" />
            <Link to={`/categories/${bc.slug}`} className="hover:text-brand-600">{bc.name}</Link>
          </React.Fragment>
        ))}
      </nav>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
        {/* Image */}
        <div className="bg-white rounded-2xl border border-gray-100 p-8 flex items-center justify-center min-h-[400px]">
          {product.images?.length > 0 ? (
            <img src={`http://localhost:3000${product.images[0].fullPath || product.images[0].filePath}`} alt={product.productName} className="max-h-[400px] w-auto object-contain" />
          ) : (
            <Droplets className="h-32 w-32 text-gray-200" />
          )}
        </div>

        {/* Details */}
        <div>
          <span className="text-sm text-brand-600 font-medium">{product.category?.name}</span>
          <h1 className="text-2xl md:text-3xl font-heading font-bold text-brand-950 mt-2">{product.productName}</h1>
          <div className="mt-3 inline-block">
            <span className="text-lg font-bold text-gray-900 bg-gray-100 px-3 py-1.5 rounded-lg border border-gray-200 tracking-wide">Product Code: {product.productCode}</span>
          </div>

          {product.description && (
            <p className="mt-6 text-gray-600 leading-relaxed">{product.description}</p>
          )}

          {/* Specs Table */}
          <div className="mt-8 border rounded-xl overflow-hidden">
            <table className="w-full text-sm">
              <tbody className="divide-y divide-gray-100">
                {[
                  ['Size', product.size],
                  ['Fitting/Connection', product.fittingConnectionType],
                  ['Thickness', product.thicknessMm],
                  ['Length', product.length],
                  ['Color', product.color],
                  ['Class', product.classType],
                  ['Material', product.material],
                  ['Brand', product.brandManufacturer],
                  ['Status', product.status],
                ].filter(([, val]) => val).map(([label, value]) => (
                  <tr key={label as string}>
                    <td className="px-4 py-3 font-medium text-gray-500 bg-gray-50 w-1/3">{label}</td>
                    <td className="px-4 py-3 text-gray-900">{value}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Features & Applications */}
          {product.features?.length > 0 && (
            <div className="mt-6">
              <h3 className="text-sm font-semibold text-gray-900 mb-2">Features</h3>
              <ul className="space-y-1">
                {product.features.map((f: string, i: number) => (
                  <li key={i} className="text-sm text-gray-600 flex items-start gap-2">
                    <span className="text-brand-500 mt-1">•</span> {f}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {product.applications?.length > 0 && (
            <div className="mt-4">
              <h3 className="text-sm font-semibold text-gray-900 mb-2">Applications</h3>
              <div className="flex flex-wrap gap-2">
                {product.applications.map((a: string, i: number) => (
                  <span key={i} className="px-3 py-1 bg-brand-50 text-brand-700 rounded-full text-xs font-medium">{a}</span>
                ))}
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="mt-8 flex flex-wrap gap-3">
            <button onClick={addToEnquiry} className="admin-btn-primary flex items-center gap-2 text-base px-6 py-3">
              <ShoppingCart className="h-5 w-5" /> Add to Enquiry
            </button>
            <button onClick={addToWishlist} className="admin-btn-secondary flex items-center gap-2">
              <Heart className="h-5 w-5" /> Wishlist
            </button>
            <button onClick={() => { navigator.clipboard.writeText(window.location.href); toast.success('Link copied!'); }} className="admin-btn-secondary flex items-center gap-2">
              <Share2 className="h-5 w-5" /> Share
            </button>
          </div>
        </div>
      </div>

      {/* Related Products */}
      {related.length > 0 && (
        <section className="mt-16">
          <h2 className="text-2xl font-heading font-bold text-brand-950 mb-6">Related Products</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {related.map((p: any) => (
              <Link key={p.id} to={`/products/${p.slug}`} className="group bg-white rounded-2xl border border-gray-100 overflow-hidden hover:shadow-lg transition-all">
                <div className="aspect-square bg-gray-50 flex items-center justify-center p-4">
                  {p.images?.[0]?.thumbPath ? <img src={`http://localhost:3000${p.images[0].thumbPath}`} className="h-full w-full object-contain group-hover:scale-105 transition-transform" /> : <Droplets className="h-12 w-12 text-gray-300" />}
                </div>
                <div className="p-3">
                  <h3 className="font-semibold text-gray-900 mt-1 line-clamp-2 text-sm">{p.productName}</h3>
                  <div className="mt-3 flex flex-wrap items-center gap-2">
                    <span className="text-xs font-bold text-gray-900 bg-gray-100 px-2 py-1 rounded-md border border-gray-200">Size: {p.size}</span>
                    <span className="text-xs font-bold text-gray-900 bg-brand-50 px-2 py-1 rounded-md border border-brand-100">Code: {p.productCode}</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
