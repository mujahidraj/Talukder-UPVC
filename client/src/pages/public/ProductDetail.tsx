import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { ChevronRight, Heart, ShoppingCart, Droplets, Share2, Package, Layers, ArrowRight, CheckCircle2, Sparkles, Zap } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../../lib/axios';
import SEO from '../../components/SEO';
import { productJsonLd } from '../../lib/jsonLd';

export default function ProductDetail() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState<any>(null);
  const [related, setRelated] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!slug) return;
    setLoading(true);
    api.get(`/products/grouped/${slug}`)
      .then(r => {
        setProduct(r.data);
        // Fetch related grouped products
        const catId = r.data.category?.parent?.id || r.data.category?.id || r.data.categoryId;
        return api.get(`/products/grouped/${slug}/related`, {
          params: { productName: r.data.productName, categoryId: catId, limit: 4 }
        });
      })
      .then(r => setRelated(r.data))
      .catch(() => toast.error('Product not found'))
      .finally(() => setLoading(false));
  }, [slug]);

  const addToWishlist = () => {
    let list = [];
    try {
      const parsed = JSON.parse(localStorage.getItem('talukder-wishlist') || '[]');
      list = Array.isArray(parsed) ? parsed : [];
    } catch {
      list = [];
    }
    if (list.find((w: any) => w.id === product.id)) { toast('Already in wishlist'); return; }
    list.push({ id: product.id, name: product.productName, slug: product.slug, code: product.productCode || '', size: product.size || '' });
    localStorage.setItem('talukder-wishlist', JSON.stringify(list));
    window.dispatchEvent(new Event('wishlist-updated'));
    api.post('/wishlist/track', { productId: product.id }).catch(() => {});
    toast.success('Added to wishlist!');
  };

  const addVariantToEnquiry = (variant: any) => {
    const list = JSON.parse(localStorage.getItem('talukder-enquiry') || '[]');
    if (!list.find((e: any) => e.id === variant.id)) {
      list.push({ id: variant.id, name: product.productName, code: variant.productCode, size: variant.size, quantity: 1 });
      localStorage.setItem('talukder-enquiry', JSON.stringify(list));
      window.dispatchEvent(new Event('enquiry-updated'));
    }
    window.dispatchEvent(new Event('open-enquiry-modal'));
  };

  const addAllToEnquiry = () => {
    const list = JSON.parse(localStorage.getItem('talukder-enquiry') || '[]');
    let added = 0;
    for (const variant of product.variants) {
      if (!list.find((e: any) => e.id === variant.id)) {
        list.push({ id: variant.id, name: product.productName, code: variant.productCode, size: variant.size, quantity: 1 });
        added++;
      }
    }
    if (added > 0) {
      localStorage.setItem('talukder-enquiry', JSON.stringify(list));
      window.dispatchEvent(new Event('enquiry-updated'));
    }
    window.dispatchEvent(new Event('open-enquiry-modal'));
  };

  if (loading) return <div className="max-w-7xl mx-auto px-4 py-20 text-center text-gray-400">Loading...</div>;
  if (!product) return <div className="max-w-7xl mx-auto px-4 py-20 text-center text-gray-400">Product not found</div>;

  const breadcrumbs: any[] = [];
  if (product.category?.parent?.parent) breadcrumbs.push(product.category.parent.parent);
  if (product.category?.parent) breadcrumbs.push(product.category.parent);
  breadcrumbs.push(product.category);

  const isTubewell = product.isTubewell;
  const variants = product.variants || [];
  const isMultiVariant = variants.length > 1;

  // Split features and applications by ";" so each part is its own item
  const parsedFeatures = (product.features || [])
    .flatMap((f: string) => f.split(';'))
    .map((f: string) => f.trim())
    .filter((f: string) => f.length > 0);

  const parsedApplications = (product.applications || [])
    .flatMap((a: string) => a.split(';'))
    .map((a: string) => a.trim())
    .filter((a: string) => a.length > 0);

  // Determine which spec columns have data (for the table header)
  const hasSize = variants.some((v: any) => v.size && v.size !== '-');
  const hasThickness = variants.some((v: any) => v.thicknessMm && v.thicknessMm !== '-');
  const hasLength = variants.some((v: any) => v.length && v.length !== '-');
  const hasColor = variants.some((v: any) => v.color && v.color !== '-');
  const hasClass = variants.some((v: any) => v.classType && v.classType !== '-');
  const hasMaterial = variants.some((v: any) => v.material && v.material !== '-');
  const hasFitting = variants.some((v: any) => v.fittingConnectionType && v.fittingConnectionType !== '-');
  const hasBrand = variants.some((v: any) => v.brandManufacturer && v.brandManufacturer !== '-');

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <SEO 
        title={product.metaTitle || product.productName} 
        description={product.metaDescription || product.description || `Buy ${product.productName} – premium uPVC pipes & fittings from Talukder uPVC Fittings Ltd.`} 
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

      {/* ─── TUBEWELL: Original single-product layout ─── */}
      {isTubewell ? (
        <>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
            {/* Image */}
            <div className="bg-white rounded-2xl border border-gray-100 p-4 lg:p-8 flex items-center justify-center min-h-[400px] md:min-h-[500px] lg:min-h-[600px]">
              {product.images?.length > 0 ? (
                <img src={`http://localhost:3000${product.images[0].fullPath || product.images[0].filePath}`} alt={product.productName} className="max-h-[400px] md:max-h-[500px] lg:max-h-[600px] max-w-full object-contain hover:scale-105 transition-transform duration-300" />
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

              {parsedFeatures.length > 0 && (
                <div className="mt-8">
                  <div className="flex items-center gap-2 mb-4">
                    <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-brand-500 to-brand-700 flex items-center justify-center shadow-sm">
                      <Sparkles className="h-4 w-4 text-white" />
                    </div>
                    <h3 className="text-base font-heading font-bold text-gray-900">Key Features</h3>
                  </div>
                  <div className="bg-gradient-to-br from-brand-50/60 to-white rounded-xl border border-brand-100/60 p-4">
                    <div className="grid grid-cols-1 gap-2.5">
                      {parsedFeatures.map((f: string, i: number) => (
                        <div key={i} className="flex items-start gap-3 bg-white/80 rounded-lg px-3.5 py-2.5 border border-brand-50 hover:border-brand-200 hover:shadow-sm transition-all group">
                          <CheckCircle2 className="h-4.5 w-4.5 text-emerald-500 mt-0.5 flex-shrink-0" />
                          <span className="text-sm text-gray-700 font-medium leading-snug">{f}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {product.applications?.length > 0 && (
                <div className="mt-6">
                  <div className="flex items-center gap-2 mb-3">
                    <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center shadow-sm">
                      <Zap className="h-4 w-4 text-white" />
                    </div>
                    <h3 className="text-base font-heading font-bold text-gray-900">Applications</h3>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {product.applications.map((a: string, i: number) => (
                      <span key={i} className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-gradient-to-r from-brand-50 to-brand-100/50 text-brand-800 rounded-full text-xs font-semibold border border-brand-200/50 hover:shadow-md hover:-translate-y-0.5 transition-all cursor-default">
                        <span className="w-1.5 h-1.5 rounded-full bg-brand-500"></span>
                        {a}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Actions */}
              <div className="mt-8 flex flex-wrap gap-3">
                <button onClick={() => addVariantToEnquiry(variants[0])} className="admin-btn-primary flex items-center gap-2 text-base px-6 py-3">
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
        </>
      ) : (
        /* ─── NON-TUBEWELL: Grouped product layout with variants table ─── */
        <>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
            {/* Image */}
            <div className="bg-white rounded-2xl border border-gray-100 p-4 lg:p-8 flex items-center justify-center min-h-[400px] md:min-h-[500px] lg:min-h-[600px]">
              {product.images?.length > 0 ? (
                <img src={`http://localhost:3000${product.images[0].fullPath || product.images[0].filePath}`} alt={product.productName} className="max-h-[400px] md:max-h-[500px] lg:max-h-[600px] max-w-full object-contain hover:scale-105 transition-transform duration-300" />
              ) : (
                <Droplets className="h-32 w-32 text-gray-200" />
              )}
            </div>

            {/* Product Info */}
            <div>
              <span className="text-sm text-brand-600 font-medium">{product.category?.name}</span>
              <h1 className="text-2xl md:text-3xl font-heading font-bold text-brand-950 mt-2">{product.productName}</h1>
              
              {/* Variant count badge */}
              <div className="mt-3 flex flex-wrap items-center gap-3">
                <span className="inline-flex items-center gap-2 text-sm font-semibold text-brand-700 bg-brand-50 px-4 py-2 rounded-xl border border-brand-100">
                  <Layers className="h-4 w-4" />
                  {isMultiVariant ? `${variants.length} Variants Available` : '1 Variant'}
                </span>
                {hasClass && variants[0]?.classType && variants[0].classType !== '-' && (
                  <span className="inline-flex items-center gap-2 text-sm font-semibold text-gray-700 bg-gray-100 px-4 py-2 rounded-xl border border-gray-200">
                    Class: {variants[0].classType}
                  </span>
                )}
              </div>

              {product.description && (
                <p className="mt-6 text-gray-600 leading-relaxed">{product.description}</p>
              )}

              {parsedFeatures.length > 0 && (
                <div className="mt-8">
                  <div className="flex items-center gap-2 mb-4">
                    <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-brand-500 to-brand-700 flex items-center justify-center shadow-sm">
                      <Sparkles className="h-4 w-4 text-white" />
                    </div>
                    <h3 className="text-base font-heading font-bold text-gray-900">Key Features</h3>
                  </div>
                  <div className="bg-gradient-to-br from-brand-50/60 to-white rounded-xl border border-brand-100/60 p-4">
                    <div className="grid grid-cols-1 gap-2.5">
                      {parsedFeatures.map((f: string, i: number) => (
                        <div key={i} className="flex items-start gap-3 bg-white/80 rounded-lg px-3.5 py-2.5 border border-brand-50 hover:border-brand-200 hover:shadow-sm transition-all group">
                          <CheckCircle2 className="h-4.5 w-4.5 text-emerald-500 mt-0.5 flex-shrink-0" />
                          <span className="text-sm text-gray-700 font-medium leading-snug">{f}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {parsedApplications.length > 0 && (
                <div className="mt-6">
                  <div className="flex items-center gap-2 mb-3">
                    <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center shadow-sm">
                      <Zap className="h-4 w-4 text-white" />
                    </div>
                    <h3 className="text-base font-heading font-bold text-gray-900">Applications</h3>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {parsedApplications.map((a: string, i: number) => (
                      <span key={i} className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-gradient-to-r from-brand-50 to-brand-100/50 text-brand-800 rounded-full text-xs font-semibold border border-brand-200/50 hover:shadow-md hover:-translate-y-0.5 transition-all cursor-default">
                        <span className="w-1.5 h-1.5 rounded-full bg-brand-500"></span>
                        {a}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Actions */}
              <div className="mt-8 flex flex-wrap gap-3">
                <button onClick={addToWishlist} className="admin-btn-secondary flex items-center gap-2">
                  <Heart className="h-5 w-5" /> Wishlist
                </button>
                <button onClick={() => { navigator.clipboard.writeText(window.location.href); toast.success('Link copied!'); }} className="admin-btn-secondary flex items-center gap-2">
                  <Share2 className="h-5 w-5" /> Share
                </button>
              </div>
            </div>
          </div>

          {/* ─── Variants Table ─── */}
          <section className="mt-12">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-xl bg-brand-100 flex items-center justify-center">
                  <Package className="h-5 w-5 text-brand-600" />
                </div>
                <div>
                  <h2 className="text-xl font-heading font-bold text-brand-950">Available Sizes & Variants</h2>
                  <p className="text-sm text-gray-500">Select a variant to add to your enquiry</p>
                </div>
              </div>
              {isMultiVariant && (
                <button onClick={addAllToEnquiry} className="admin-btn-primary flex items-center gap-2 text-sm px-4 py-2.5">
                  <ShoppingCart className="h-4 w-4" /> Enquire All
                </button>
              )}
            </div>

            <div className="border border-gray-200 rounded-2xl overflow-hidden bg-white shadow-sm">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-gradient-to-r from-brand-50 to-brand-100/50 border-b border-brand-100">
                      <th className="px-4 py-3.5 text-left text-xs font-bold text-brand-800 uppercase tracking-wider">Code</th>
                      {hasSize && <th className="px-4 py-3.5 text-left text-xs font-bold text-brand-800 uppercase tracking-wider">Size</th>}
                      {hasThickness && <th className="px-4 py-3.5 text-left text-xs font-bold text-brand-800 uppercase tracking-wider">Thickness (mm)</th>}
                      {hasLength && <th className="px-4 py-3.5 text-left text-xs font-bold text-brand-800 uppercase tracking-wider">Length</th>}
                      {hasFitting && <th className="px-4 py-3.5 text-left text-xs font-bold text-brand-800 uppercase tracking-wider">Fitting</th>}
                      {hasColor && <th className="px-4 py-3.5 text-left text-xs font-bold text-brand-800 uppercase tracking-wider">Color</th>}
                      {hasClass && <th className="px-4 py-3.5 text-left text-xs font-bold text-brand-800 uppercase tracking-wider">Class</th>}
                      {hasMaterial && <th className="px-4 py-3.5 text-left text-xs font-bold text-brand-800 uppercase tracking-wider">Material</th>}
                      {hasBrand && <th className="px-4 py-3.5 text-left text-xs font-bold text-brand-800 uppercase tracking-wider">Brand</th>}
                      <th className="px-4 py-3.5 text-right text-xs font-bold text-brand-800 uppercase tracking-wider">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {variants.map((v: any, idx: number) => (
                      <tr 
                        key={v.id} 
                        className={`hover:bg-brand-50/40 transition-colors cursor-pointer ${idx % 2 === 0 ? 'bg-white' : 'bg-gray-50/50'}`}
                        onClick={() => navigate(`/products/${v.slug}`)}
                      >
                        <td className="px-4 py-3.5">
                          <span className="font-mono font-bold text-gray-900 bg-gray-100 px-2.5 py-1 rounded-md border border-gray-200 text-xs">{v.productCode}</span>
                        </td>
                        {hasSize && <td className="px-4 py-3.5 font-semibold text-gray-900">{v.size || '-'}</td>}
                        {hasThickness && <td className="px-4 py-3.5 text-gray-700">{v.thicknessMm || '-'}</td>}
                        {hasLength && <td className="px-4 py-3.5 text-gray-700">{v.length || '-'}</td>}
                        {hasFitting && <td className="px-4 py-3.5 text-gray-700">{v.fittingConnectionType || '-'}</td>}
                        {hasColor && <td className="px-4 py-3.5 text-gray-700">{v.color || '-'}</td>}
                        {hasClass && <td className="px-4 py-3.5 text-gray-700">{v.classType || '-'}</td>}
                        {hasMaterial && <td className="px-4 py-3.5 text-gray-700">{v.material || '-'}</td>}
                        {hasBrand && <td className="px-4 py-3.5 text-gray-700">{v.brandManufacturer || '-'}</td>}
                        <td className="px-4 py-3.5 text-right">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              addVariantToEnquiry(v);
                            }}
                            className="inline-flex items-center gap-1.5 bg-brand-600 text-white px-3 py-1.5 rounded-lg text-xs font-semibold hover:bg-brand-700 transition-colors shadow-sm"
                          >
                            <ShoppingCart className="h-3.5 w-3.5" /> Enquire
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </section>
        </>
      )}

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
                  <p className="text-xs text-brand-600 font-medium">{p.category?.name}</p>
                  <h3 className="font-semibold text-gray-900 mt-1 line-clamp-2 text-sm">{p.productName}</h3>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
