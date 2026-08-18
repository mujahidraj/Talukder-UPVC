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
    api.post('/wishlist/track', { productId: product.id }).catch(() => { });
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
            <div className="relative bg-white border-[3px] border-[#3769A8] flex flex-col justify-between min-h-[400px] md:min-h-[500px] lg:min-h-[600px] shadow-[8px_8px_15px_rgba(0,0,0,0.35)] overflow-hidden">
              <div className="flex-1 flex items-center justify-center p-8 z-10 relative">
                {product.images?.length > 0 ? (
                  <img src={`http://localhost:3000${product.images[0].fullPath || product.images[0].filePath}`} alt={product.productName} className="max-h-[250px] md:max-h-[350px] lg:max-h-[400px] max-w-full object-contain hover:scale-105 transition-transform duration-300 drop-shadow-xl" />
                ) : (
                  <Droplets className="h-32 w-32 text-gray-200" />
                )}
              </div>
              <div className="relative h-40 md:h-48 w-full mt-auto flex items-end">
                <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="absolute bottom-0 left-0 w-full h-full text-[#3769A8] z-0">
                  <path d="M0,50 C 40,50 70,40 100,0 L100,100 L0,100 Z" fill="currentColor" />
                </svg>
                <div className="relative z-10 w-full px-6 py-4 md:py-5 flex items-center justify-between">
                  <h2 className="text-white text-xl md:text-2xl font-bold tracking-wide leading-tight">{product.productName}</h2>
                  <div className="h-20 md:h-24 flex items-center justify-center flex-shrink-0 ml-4">
                    <img src="/LOGO/Talukder-uPVC-Fittings-LTD-2.png" alt="Talukder uPVC Fittings LTD" className="h-full w-auto object-contain" />
                  </div>
                </div>
              </div>
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
                      ['Status', product.status],
                    ].filter(([, val]) => val).map(([label, value], idx) => {
                      const isEven = idx % 2 === 0;
                      const col1Bg = isEven ? 'bg-[#E8E8E8]' : 'bg-[#D6D6D6]';
                      const col2Bg = isEven ? 'bg-[#E4E6F2]' : 'bg-[#D7DAED]';
                      return (
                        <tr key={label as string}>
                          <td className={`px-4 py-2 font-bold text-gray-900 w-1/3 ${col1Bg}`}>{label}</td>
                          <td className={`px-4 py-2 text-gray-900 font-medium ${col2Bg}`}>{value}</td>
                        </tr>
                      )
                    })}
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
            <div className="relative bg-white border-[3px] border-[#3769A8] flex flex-col justify-between min-h-[400px] md:min-h-[500px] lg:min-h-[600px] shadow-[8px_8px_15px_rgba(0,0,0,0.35)] overflow-hidden">
              <div className="flex-1 flex items-center justify-center p-8 z-10 relative">
                {product.images?.length > 0 ? (
                  <img src={`http://localhost:3000${product.images[0].fullPath || product.images[0].filePath}`} alt={product.productName} className="max-h-[250px] md:max-h-[350px] lg:max-h-[400px] max-w-full object-contain hover:scale-105 transition-transform duration-300 drop-shadow-xl" />
                ) : (
                  <Droplets className="h-32 w-32 text-gray-200" />
                )}
              </div>
              <div className="relative h-40 md:h-48 w-full mt-auto flex items-end">
                <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="absolute bottom-0 left-0 w-full h-full text-[#3769A8] z-0">
                  <path d="M0,50 C 40,50 70,40 100,0 L100,100 L0,100 Z" fill="currentColor" />
                </svg>
                <div className="relative z-10 w-full px-6 py-4 md:py-5 flex items-center justify-between">
                  <h2 className="text-white text-xl md:text-2xl font-bold tracking-wide leading-tight">{product.productName}</h2>
                  <div className="h-20 md:h-24 flex items-center justify-center flex-shrink-0 ml-4">
                    <img src="/LOGO/Talukder-uPVC-Fittings-LTD-2.png" alt="Talukder uPVC Fittings LTD" className="h-full w-auto object-contain" />
                  </div>
                </div>
              </div>
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

            <div className="overflow-hidden shadow-sm">
              <div className="overflow-x-auto">
                <table className="w-full text-sm border-collapse">
                  <thead>
                    <tr>
                      <th className="px-4 py-2 text-center text-sm font-bold text-white bg-[#6B6B6B] whitespace-nowrap">Code</th>
                      {hasSize && <th className="px-4 py-2 text-left text-sm font-bold text-white bg-[#50539F] whitespace-nowrap">Size</th>}
                      {hasThickness && <th className="px-4 py-2 text-center text-sm font-bold text-white bg-[#8393CD] whitespace-nowrap">Thickness (mm)</th>}
                      {hasLength && <th className="px-4 py-2 text-center text-sm font-bold text-white bg-[#8393CD] whitespace-nowrap">Length</th>}
                      {hasFitting && <th className="px-4 py-2 text-center text-sm font-bold text-white bg-[#8393CD] whitespace-nowrap">Fitting</th>}
                      {hasColor && <th className="px-4 py-2 text-center text-sm font-bold text-white bg-[#8393CD] whitespace-nowrap">Color</th>}
                      {hasClass && <th className="px-4 py-2 text-center text-sm font-bold text-white bg-[#8393CD] whitespace-nowrap">Class</th>}
                      {hasMaterial && <th className="px-4 py-2 text-center text-sm font-bold text-white bg-[#8393CD] whitespace-nowrap">Material</th>}
                      <th className="px-4 py-2 text-right text-sm font-bold text-white bg-[#8393CD] whitespace-nowrap">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {variants.map((v: any, idx: number) => {
                      const isEven = idx % 2 === 0;
                      const codeBg = isEven ? 'bg-[#E8E8E8]' : 'bg-[#D6D6D6]';
                      const sizeBg = isEven ? 'bg-[#FFFFFF]' : 'bg-[#8292CA]';
                      const restBg = isEven ? 'bg-[#E4E6F2]' : 'bg-[#D7DAED]';
                      return (
                        <tr
                          key={v.id}
                          className={`hover:opacity-90 transition-opacity cursor-pointer text-gray-900 font-bold whitespace-nowrap`}
                          onClick={() => navigate(`/products/${v.slug}`)}
                        >
                          <td className={`px-4 py-2 ${codeBg} text-center`}>
                            {v.productCode}
                          </td>
                          {hasSize && <td className={`px-4 py-2 ${sizeBg} text-left`}>{v.size || '-'}</td>}
                          {hasThickness && <td className={`px-4 py-2 ${restBg} text-center`}>{v.thicknessMm || '-'}</td>}
                          {hasLength && <td className={`px-4 py-2 ${restBg} text-center`}>{v.length || '-'}</td>}
                          {hasFitting && <td className={`px-4 py-2 ${restBg} text-center`}>{v.fittingConnectionType || '-'}</td>}
                          {hasColor && <td className={`px-4 py-2 ${restBg} text-center`}>{v.color || '-'}</td>}
                          {hasClass && <td className={`px-4 py-2 ${restBg} text-center`}>{v.classType || '-'}</td>}
                          {hasMaterial && <td className={`px-4 py-2 ${restBg} text-center`}>{v.material || '-'}</td>}
                          <td className={`px-4 py-2 text-right ${restBg}`}>
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
                      )
                    })}
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
