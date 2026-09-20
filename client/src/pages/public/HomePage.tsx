import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Shield, Award, Factory, Droplets, ChevronRight, Play, Camera, Globe, Video, MessageCircle, Tractor, Building2, HardHat, CheckCircle2, Wrench, Users, Layers } from 'lucide-react';
import api from '../../lib/axios';
import SEO from '../../components/SEO';

export default function HomePage() {
  const [categories, setCategories] = useState<any[]>([]);
  const [featured, setFeatured] = useState<any[]>([]);
  const [newArrivals, setNewArrivals] = useState<any[]>([]);
  const [tubewells, setTubewells] = useState<any[]>([]);
  const [banners, setBanners] = useState<any[]>([]);
  const [currentBanner, setCurrentBanner] = useState(0);

  useEffect(() => {
    api.get('/cms/banners').then(r => {
      const data = r.data || [];
      if (data.length > 0) {
        data[0].imageUrl = '/images/factory 2.jpg';
      }
      setBanners(data);
    }).catch(() => { });
    api.get('/categories/tree').then(r => {
      // Show all root categories, sorted to ensure consistent display
      const allCategories = r.data || [];
      // If we need to limit the number, we could slice here. Let's show up to 8.
      setCategories(allCategories.slice(0, 8));
    }).catch(() => { });
    api.get('/products/grouped', { params: { limit: 50, sortBy: 'name' } }).then(r => {
      const all = r.data.data || [];
      const tbw = all.filter((p: any) => p.isTubewell);
      const others = all.filter((p: any) => !p.isTubewell);
      setFeatured(others.slice(0, 8));
      setTubewells(tbw.slice(0, 8));
    }).catch(() => { });

    api.get('/products', { params: { isNewArrival: true, limit: 8, sortBy: 'createdAt', sortOrder: 'desc' } }).then(r => {
      setNewArrivals(r.data.data || []);
    }).catch(() => { });
  }, []);

  useEffect(() => {
    if (banners.length <= 1) return;
    const interval = setInterval(() => {
      setCurrentBanner(prev => (prev + 1) % banners.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [banners.length]);

  const hasBanners = banners.length > 0;
  const activeBanner = hasBanners ? banners[currentBanner] : null;

  return (
    <div>
      <SEO
        title="Home"
        description="Bangladesh's leading manufacturer of uPVC pipes and fittings for water supply, drainage, and irrigation."
        canonical="/"
      />
      <section className="relative text-white overflow-hidden bg-brand-950 min-h-[90vh] flex items-center transition-all duration-1000">
        {hasBanners ? (
          <>
            {banners.map((banner, idx) => (
              <div
                key={banner.id}
                className={`absolute inset-0 w-full h-full transition-opacity duration-1000 ${idx === currentBanner ? 'opacity-100' : 'opacity-0'}`}
              >
                <img
                  src={banner.imageUrl}
                  className="w-full h-full object-cover object-center scale-105 transform origin-center animate-[subtle-zoom_20s_infinite_alternate]"
                  alt={banner.title || 'Talukder uPVC Banner'}
                />
              </div>
            ))}
            <div className="absolute inset-0 bg-gradient-to-r from-brand-950/90 via-brand-950/60 to-transparent" />

            <div className="max-w-7xl mx-auto px-4 py-24 md:py-32 relative w-full z-10">
              <div className="max-w-3xl" key={currentBanner} style={{ animation: 'fadeInUp 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards' }}>
                {activeBanner.subtitle && (
                  <div className="inline-flex items-center gap-2 bg-brand-800/40 backdrop-blur-md text-brand-100 text-xs font-bold tracking-wide uppercase px-5 py-2.5 rounded-full mb-8 border border-brand-500/30 shadow-[0_0_20px_rgba(59,130,246,0.3)]">
                    <Award className="h-4 w-4 text-accent-400" /> {activeBanner.subtitle}
                  </div>
                )}
                <h1 className="text-4xl md:text-6xl lg:text-7xl font-heading font-black tracking-tight text-white leading-[1.1] drop-shadow-lg">
                  {activeBanner.title ? (
                    activeBanner.title.includes('|') ? (
                      <>
                        {activeBanner.title.split('|')[0]}
                        <span className="block text-red-600 mt-2">{activeBanner.title.split('|')[1]}</span>
                      </>
                    ) : (
                      activeBanner.title
                    )
                  ) : (
                    'Talukder uPVC'
                  )}
                </h1>
                <div className="mt-10 flex flex-wrap gap-5">
                  <Link to={activeBanner.linkUrl || '/products'} className="group relative inline-flex items-center gap-2 bg-white text-brand-900 px-8 py-4 rounded-lg font-bold transition-all duration-300 shadow-[0_0_20px_rgba(255,255,255,0.2)] hover:shadow-[0_0_30px_rgba(255,255,255,0.4)] hover:-translate-y-1 overflow-hidden">
                    <span className="absolute inset-0 bg-gradient-to-r from-white via-brand-50 to-white opacity-0 group-hover:opacity-100 transition-opacity duration-500"></span>
                    <span className="relative z-10 flex items-center gap-2">{activeBanner.linkUrl ? 'Learn More' : 'Browse Catalog'} <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" /></span>
                  </Link>
                  <Link to="/contact" className="group inline-flex items-center gap-2 border border-brand-400/40 text-white px-8 py-4 rounded-lg font-bold hover:bg-brand-800/60 hover:border-brand-400 transition-all duration-300 bg-brand-900/30 backdrop-blur-md hover:-translate-y-1 hover:shadow-[0_0_20px_rgba(59,130,246,0.3)]">
                    Request Quote
                  </Link>
                </div>
              </div>
            </div>

            {/* Slider Dots */}
            {banners.length > 1 && (
              <div className="absolute bottom-24 md:bottom-12 left-0 right-0 flex justify-center gap-3 z-20">
                {banners.map((_, idx) => (
                  <button
                    key={idx}
                    onClick={() => setCurrentBanner(idx)}
                    className={`h-2.5 rounded-full transition-all duration-500 ${idx === currentBanner ? 'w-10 bg-accent-400 shadow-[0_0_10px_rgba(56,189,248,0.8)]' : 'w-2.5 bg-white/40 hover:bg-white/80'}`}
                    aria-label={`Go to slide ${idx + 1}`}
                  />
                ))}
              </div>
            )}
          </>
        ) : (
          /* Fallback static hero */
          <>
            <div className="absolute inset-0 w-full h-full">
              <img
                src="/images/factory 2.jpg"
                className="w-full h-full object-cover object-center opacity-90 scale-105 transform animate-[subtle-zoom_20s_infinite_alternate]"
                alt="Talukder uPVC"
              />
            </div>
            <div className="absolute inset-0 bg-gradient-to-r from-brand-950/90 via-brand-950/70 to-brand-950/20" />

            <div className="max-w-7xl mx-auto px-4 py-24 md:py-32 relative w-full z-10">
              <div className="max-w-3xl" style={{ animation: 'fadeInUp 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards' }}>
                <h1 className="text-4xl md:text-6xl lg:text-7xl font-heading font-black tracking-tight text-white leading-[1.1] drop-shadow-lg">
                  Bangladesh's Trusted
                  <span className="block mt-2 text-red-600">uPVC Pipe & Fittings</span>
                  Manufacturer
                </h1>
                <p className="mt-6 text-lg md:text-xl text-brand-100/90 max-w-2xl leading-relaxed drop-shadow-sm font-medium">
                  Talukder <span className="text-red-500">u</span>PVC Fittings Ltd. delivers premium quality pipes and fittings for water supply, drainage, and irrigation across the nation.
                </p>
                <div className="mt-10 flex flex-wrap gap-5">
                  <Link to="/products" className="group relative inline-flex items-center gap-2 bg-white text-brand-900 px-8 py-4 rounded-lg font-bold transition-all duration-300 shadow-[0_0_20px_rgba(255,255,255,0.2)] hover:shadow-[0_0_30px_rgba(255,255,255,0.4)] hover:-translate-y-1 overflow-hidden">
                    <span className="absolute inset-0 bg-gradient-to-r from-white via-brand-50 to-white opacity-0 group-hover:opacity-100 transition-opacity duration-500"></span>
                    <span className="relative z-10 flex items-center gap-2">Browse Catalog <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" /></span>
                  </Link>
                  <Link to="/contact" className="group inline-flex items-center gap-2 border border-brand-400/40 text-white px-8 py-4 rounded-lg font-bold hover:bg-brand-800/60 hover:border-brand-400 transition-all duration-300 bg-brand-900/30 backdrop-blur-md hover:-translate-y-1 hover:shadow-[0_0_20px_rgba(59,130,246,0.3)]">
                    Request Quote
                  </Link>
                </div>
              </div>
            </div>
          </>
        )}
      </section>

      {/* Product Categories & Trust Bar */}
      <section
        className="pb-16 pt-0 md:pb-32 md:pt-0 relative bg-cover bg-center bg-fixed z-20"
        style={{ backgroundImage: 'url("/images/tubewell.jpg")' }}
      >
        <div className="absolute inset-0 bg-gradient-to-b from-white/90 via-white/40 to-white/90 z-0"></div>

        {/* Trust Bar (Premium Full Width) */}
        <div className="relative z-30 w-full -mt-12 sm:-mt-16 mb-16 md:mb-24">
          <div className="bg-gradient-to-r from-brand-950 via-brand-900 to-brand-950 border-y border-brand-800/60 shadow-[0_30px_60px_-15px_rgba(0,0,0,0.6)] relative overflow-hidden">
            {/* Subtle top edge highlight */}
            <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-accent-500/50 to-transparent"></div>
            
            <div className="max-w-7xl mx-auto px-4 relative z-10">
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-0 divide-y sm:divide-y-0 sm:divide-x divide-brand-800/40">
                {[
                  { icon: Shield, label: 'Quality Certified', desc: 'International standard' },
                  { icon: Factory, label: 'Modern Factory', desc: 'Auto-belling machines' },
                  { icon: Droplets, label: 'Chemical Resistant', desc: 'Corrosion free' },
                  { icon: Award, label: '50+ Year Lifespan', desc: 'Proven durability' },
                ].map((item, idx) => (
                  <div key={item.label} className="flex flex-col sm:flex-row items-center sm:items-center gap-5 group p-8 lg:p-10 hover:bg-white/5 transition-all duration-500 relative overflow-hidden">
                    {/* Hover Glow */}
                    <div className="absolute inset-0 bg-gradient-to-b from-transparent to-brand-800/30 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                    
                    <div className="h-16 w-16 rounded-2xl bg-brand-950/50 border border-brand-700/50 shadow-inner flex items-center justify-center group-hover:border-accent-400/60 group-hover:shadow-[0_0_30px_rgba(56,189,248,0.25)] group-hover:bg-brand-800 transition-all duration-500 flex-shrink-0 group-hover:-translate-y-1 relative z-10">
                      <item.icon className="h-8 w-8 text-accent-400 group-hover:text-white transition-colors duration-500" />
                    </div>
                    
                    <div className="text-center sm:text-left relative z-10 flex-1">
                      <p className="text-xl font-heading font-black text-white tracking-wide group-hover:text-accent-100 transition-colors drop-shadow-sm">{item.label}</p>
                      <p className="text-sm text-brand-200/90 mt-1.5 font-medium leading-snug">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-brand-200 to-transparent opacity-50 z-10"></div>
        <div className="max-w-7xl mx-auto px-4 relative z-10">
          <div className="text-center mb-16 md:mb-20">
            <h2 className="text-3xl md:text-5xl font-heading font-black text-brand-950 tracking-tight">Explore Categories</h2>
            <p className="mt-6 text-gray-600 max-w-2xl mx-auto text-lg font-medium">Discover our comprehensive range of high-quality <span className="text-red-600">u</span>PVC products engineered for perfection.</p>
          </div>
          <div className="flex flex-wrap justify-center gap-6 lg:gap-8">
            {categories.map((cat: any) => {
              const getBgImage = (name: string) => {
                const n = name.toLowerCase();
                if (n.includes('door')) return '/images/factory.jpg';
                if (n.includes('agri')) return '/images/factory 2.jpg';
                if (n.includes('tube')) return '/images/tube.png';
                if (n.includes('fitting')) return '/images/fitting.jpg';
                if (n.includes('cpvc')) return '/images/pipe2.jpg';
                if (n.includes('hdpe')) return '/images/cat-pipes.jpg';
                return '/images/upvc pip.jpg';
              };

              return (
                <Link
                  key={cat.id}
                  to={`/categories/${cat.slug}`}
                  className="flex-1 min-w-[260px] max-w-md group relative rounded-lg p-8 bg-white shadow-[0_10px_40px_-10px_rgba(0,0,0,0.08)] magic-border magic-border-white hover:shadow-[0_20px_50px_-15px_rgba(59,130,246,0.2)] hover:-translate-y-3 transition-all duration-500 overflow-hidden block"
                >
                  {/* Product Image Background */}
                  <div
                    className="absolute inset-0 bg-cover bg-center z-0 group-hover:scale-105 transition-transform duration-1000 opacity-100"
                    style={{ backgroundImage: `url('${getBgImage(cat.name)}')` }}
                  ></div>
                  <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-gray-900/50 to-transparent z-0 transition-opacity duration-500"></div>

                  <div className="flex items-start justify-end relative z-10">
                    <div className="h-12 w-12 rounded-full bg-white flex items-center justify-center shadow-md group-hover:bg-brand-500 group-hover:shadow-[0_0_20px_rgba(59,130,246,0.4)] transition-all duration-500 border border-gray-100 group-hover:border-transparent">
                      <ArrowRight className="h-6 w-6 text-brand-600 group-hover:text-white transition-colors transform group-hover:translate-x-1" />
                    </div>
                  </div>

                  <div className="mt-16 relative z-10">
                    <h3 className="text-2xl font-heading font-black text-white group-hover:text-brand-200 transition-colors drop-shadow-md">{cat.name}</h3>
                    <div className="mt-4 inline-flex items-center gap-2 bg-white/80 backdrop-blur-sm px-4 py-2 rounded-lg border border-gray-200/50 shadow-sm group-hover:border-brand-200 transition-colors">
                      <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.6)] animate-pulse"></span>
                      <p className="text-sm font-bold text-gray-700">
                        {cat.totalProducts ?? cat._count?.products ?? 0} Products
                      </p>
                    </div>
                  </div>
                </Link>
              )
            })}
          </div>
        </div>
      </section>
      {/* Featured Products */}
      <section className="py-16 md:py-32 bg-white relative">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-6">
            <div>
              <h2 className="text-3xl md:text-5xl font-heading font-black text-brand-950 tracking-tight">Our Products</h2>
              <p className="mt-4 text-gray-600 text-lg font-medium">Discover premium quality <span className="text-red-600">u</span>PVC products for every application.</p>
            </div>
            <Link to="/products" className="hidden sm:inline-flex items-center gap-2 text-brand-600 font-bold hover:text-brand-700 transition-colors bg-brand-50 px-6 py-3 rounded-lg hover:bg-brand-100">
              View All Catalog <ArrowRight className="h-5 w-5" />
            </Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 lg:gap-8">
            {featured.map((product: any) => (
              <Link
                key={product.id}
                to={`/products/${product.slug}`}
                className="group bg-white rounded-lg overflow-hidden shadow-[0_5px_15px_-5px_rgba(0,0,0,0.05)] border border-gray-100 hover:shadow-[0_20px_40px_-10px_rgba(59,130,246,0.15)] hover:-translate-y-2 transition-all duration-500 flex flex-col"
              >
                <div className="aspect-square bg-gradient-to-b from-gray-50 to-white flex items-center justify-center p-6 overflow-hidden relative">
                  <div className="absolute inset-0 bg-brand-500/0 group-hover:bg-brand-500/5 transition-colors duration-500"></div>
                  {product.images?.[0]?.thumbPath ? (
                    <img src={`${import.meta.env.VITE_IMAGE_URL}${product.images[0].thumbPath}`} alt={product.productName} className="h-full w-full object-contain group-hover:scale-110 transition-transform duration-700 drop-shadow-sm" />
                  ) : (
                    <Droplets className="h-16 w-16 text-gray-200" />
                  )}
                </div>
                <div className="p-6 flex-1 flex flex-col border-t border-gray-50 relative">
                  <div className="absolute top-0 left-6 right-6 h-px bg-gradient-to-r from-transparent via-gray-200 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                  <p className="text-xs text-brand-500 font-bold tracking-wider uppercase mb-2">{product.category?.name}</p>
                  <h3 className="font-heading font-bold text-gray-900 text-lg group-hover:text-brand-600 transition-colors flex-1">{product.productName}</h3>
                  <div className="mt-4 pt-4 border-t border-gray-100 flex flex-wrap items-center justify-between gap-2">
                    <span className="inline-flex items-center gap-1.5 text-xs font-bold text-gray-600 bg-gray-100/80 px-3 py-1.5 rounded-lg group-hover:bg-brand-50 group-hover:text-brand-700 transition-colors">
                      <Layers className="h-3.5 w-3.5" /> {product.variantCount} {product.variantCount === 1 ? 'Variant' : 'Variants'}
                    </span>
                    <div className="h-8 w-8 rounded-full bg-gray-50 flex items-center justify-center group-hover:bg-brand-600 transition-colors">
                      <ArrowRight className="h-4 w-4 text-gray-400 group-hover:text-white transition-colors transform group-hover:translate-x-0.5" />
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
          <div className="sm:hidden mt-10 text-center">
            <Link to="/products" className="inline-flex items-center justify-center w-full gap-2 bg-brand-600 text-white px-6 py-4 rounded-lg font-bold hover:bg-brand-700 transition-colors shadow-lg">
              View All Products
            </Link>
          </div>
        </div>
      </section>

      {/* New Arrivals Section */}
      {newArrivals.length > 0 && (
        <section className="py-16 md:py-32 bg-gray-50 relative">
          <div className="max-w-7xl mx-auto px-4">
            <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-6">
              <div>
                <h2 className="text-3xl md:text-5xl font-heading font-black text-brand-950 tracking-tight">New Arrivals</h2>
                <p className="mt-4 text-gray-600 text-lg font-medium">Check out the latest additions to our premium <span className="text-red-600">u</span>PVC product line.</p>
              </div>
              <Link to="/products?isNewArrival=true" className="hidden sm:inline-flex items-center gap-2 text-brand-600 font-bold hover:text-brand-700 transition-colors bg-white border border-brand-100 px-6 py-3 rounded-lg hover:bg-brand-50 shadow-sm">
                View All New Items <ArrowRight className="h-5 w-5" />
              </Link>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 lg:gap-8">
              {newArrivals.map((product: any) => (
                <Link
                  key={product.id}
                  to={`/products/${product.slug}`}
                  className="group bg-white rounded-lg overflow-hidden shadow-[0_5px_15px_-5px_rgba(0,0,0,0.05)] border border-gray-100 hover:shadow-[0_20px_40px_-10px_rgba(59,130,246,0.15)] hover:-translate-y-2 transition-all duration-500 flex flex-col"
                >
                  <div className="aspect-square bg-gradient-to-b from-gray-50 to-white flex items-center justify-center p-6 overflow-hidden relative">
                    <div className="absolute top-4 right-4 z-10 bg-red-600 text-white text-xs font-bold px-3 py-1 rounded-full shadow-sm">
                      NEW
                    </div>
                    <div className="absolute inset-0 bg-brand-500/0 group-hover:bg-brand-500/5 transition-colors duration-500"></div>
                    {product.images?.[0]?.thumbPath ? (
                      <img src={`${import.meta.env.VITE_IMAGE_URL}${product.images[0].thumbPath}`} alt={product.productName} className="h-full w-full object-contain group-hover:scale-110 transition-transform duration-700 drop-shadow-sm" />
                    ) : (
                      <Droplets className="h-16 w-16 text-gray-200" />
                    )}
                  </div>
                  <div className="p-6 flex-1 flex flex-col border-t border-gray-50 relative">
                    <div className="absolute top-0 left-6 right-6 h-px bg-gradient-to-r from-transparent via-gray-200 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                    <p className="text-xs text-brand-500 font-bold tracking-wider uppercase mb-2">{product.category?.name}</p>
                    <h3 className="font-heading font-bold text-gray-900 text-lg group-hover:text-brand-600 transition-colors flex-1">{product.productName}</h3>
                    <div className="mt-4 pt-4 border-t border-gray-100 flex flex-wrap items-center justify-between gap-2">
                      <span className="inline-flex items-center gap-1.5 text-xs font-bold text-gray-600 bg-gray-100/80 px-3 py-1.5 rounded-lg group-hover:bg-brand-50 group-hover:text-brand-700 transition-colors">
                        <Layers className="h-3.5 w-3.5" /> View Details
                      </span>
                      <div className="h-8 w-8 rounded-full bg-gray-50 flex items-center justify-center group-hover:bg-brand-600 transition-colors">
                        <ArrowRight className="h-4 w-4 text-gray-400 group-hover:text-white transition-colors transform group-hover:translate-x-0.5" />
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Applications & Use Cases */}
      <section
        className="py-16 md:py-32 relative bg-cover bg-center bg-fixed"
        style={{ backgroundImage: 'url("/images/factoryt%20image.png")' }}
      >
        <div className="absolute inset-0 bg-white/40 backdrop-blur-sm z-0"></div>
        <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-gray-200 to-transparent z-10"></div>
        <div className="max-w-7xl mx-auto px-4 relative z-10">
          <div className="text-center mb-16 md:mb-20">
            <h2 className="text-3xl md:text-5xl font-heading font-black text-brand-950 tracking-tight">Applications & Use Cases</h2>
            <p className="mt-6 text-brand-900 max-w-2xl mx-auto text-lg font-medium">Tailored <span className="text-red-600">u</span>PVC solutions engineered for diverse industries and demanding everyday needs.</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
            {[
              { title: 'Agriculture', desc: 'Durable pipes for efficient irrigation systems.', icon: Tractor, bgImage: '/images/What-is-an-irrigation-pipe-called.jpg' },
              { title: 'Residential', desc: 'Safe and leak-proof plumbing for homes.', icon: Building2, bgImage: '/images/pipe-guide-for-home-plumbing.jpg' },
              { title: 'Industrial', desc: 'Heavy-duty pipes for chemical transport.', icon: Factory, bgImage: '/images/ERW-Pipe-vs.-Seamless-Pipe.webp' },
              { title: 'Infrastructure', desc: 'Underground sewerage and supply lines.', icon: HardHat, bgImage: '/images/images.jpg' },
            ].map((app) => (
              <div key={app.title} className="rounded-lg p-8 shadow-sm hover:shadow-[0_20px_40px_-15px_rgba(59,130,246,0.3)] hover:-translate-y-2 transition-all duration-500 text-center group relative overflow-hidden bg-cover bg-center" style={{ backgroundImage: `url('${app.bgImage}')` }}>
                <div className="absolute inset-0 bg-gray-900/60 group-hover:bg-gray-900/40 transition-colors duration-500"></div>
                <div className="relative z-10 flex flex-col items-center">
                  <div className="h-20 w-20 rounded-lg bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-500 group-hover:border-white/40 group-hover:shadow-[0_10px_20px_-10px_rgba(255,255,255,0.2)]">
                    <app.icon className="h-10 w-10 text-white transition-colors duration-500" />
                  </div>
                  <h3 className="font-heading font-bold text-xl text-white mb-3 drop-shadow-md">{app.title}</h3>
                  <p className="text-base text-gray-200 font-medium leading-relaxed drop-shadow-md">{app.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Tubewell Products */}
      <section className="py-16 md:py-32 bg-transparent relative">
        <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-gray-200 to-transparent"></div>
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-6">
            <div>
              <h2 className="text-3xl md:text-5xl font-heading font-black text-brand-950 tracking-tight">Tubewells</h2>
              <p className="mt-4 text-gray-600 text-lg font-medium">Premium tubewell pipes and high-durability accessories.</p>
            </div>
            <Link to="/products?search=tubewell" className="hidden sm:inline-flex items-center gap-2 text-brand-600 font-bold hover:text-brand-700 transition-colors bg-brand-100/50 px-6 py-3 rounded-lg hover:bg-brand-100">
              View All Tubewells <ArrowRight className="h-5 w-5" />
            </Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 lg:gap-8">
            {tubewells.map((product: any) => (
              <Link
                key={product.id}
                to={`/products/${product.slug}`}
                className="group bg-white rounded-lg overflow-hidden shadow-[0_5px_15px_-5px_rgba(0,0,0,0.05)] border border-gray-100 hover:shadow-[0_20px_40px_-10px_rgba(59,130,246,0.15)] hover:-translate-y-2 transition-all duration-500 flex flex-col"
              >
                <div className="aspect-square bg-gradient-to-b from-gray-50 to-white flex items-center justify-center p-6 overflow-hidden relative">
                  <div className="absolute inset-0 bg-brand-500/0 group-hover:bg-brand-500/5 transition-colors duration-500"></div>
                  {product.images?.[0]?.thumbPath ? (
                    <img src={`${import.meta.env.VITE_IMAGE_URL}${product.images[0].thumbPath}`} alt={product.productName} className="h-full w-full object-contain group-hover:scale-110 transition-transform duration-700 drop-shadow-sm" />
                  ) : (
                    <Droplets className="h-16 w-16 text-gray-200" />
                  )}
                </div>
                <div className="p-6 flex-1 flex flex-col border-t border-gray-50 relative">
                  <div className="absolute top-0 left-6 right-6 h-px bg-gradient-to-r from-transparent via-gray-200 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                  <p className="text-xs text-brand-500 font-bold tracking-wider uppercase mb-2">{product.category?.name}</p>
                  <h3 className="font-heading font-bold text-gray-900 text-lg group-hover:text-brand-600 transition-colors flex-1">{product.productName}</h3>
                  <div className="mt-4 pt-4 border-t border-gray-100 flex flex-wrap items-center justify-between gap-2">
                    <span className="inline-flex items-center gap-1.5 text-xs font-bold text-gray-600 bg-gray-100/80 px-3 py-1.5 rounded-lg group-hover:bg-brand-50 group-hover:text-brand-700 transition-colors">
                      Size: {product.variants?.[0]?.size || '-'}
                    </span>
                    <span className="inline-flex items-center gap-1.5 text-xs font-bold text-brand-700 bg-brand-50 px-3 py-1.5 rounded-lg border border-brand-100/50">
                      Code: {product.variants?.[0]?.productCode}
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
          <div className="sm:hidden mt-10 text-center">
            <Link to="/products?search=tubewell" className="inline-flex items-center justify-center w-full gap-2 bg-brand-600 text-white px-6 py-4 rounded-lg font-bold hover:bg-brand-700 transition-colors shadow-lg">
              View All Tubewells
            </Link>
          </div>
        </div>
      </section>



      {/* Why Talukder */}
      <section
        className="py-20 md:py-32 relative text-white overflow-hidden bg-brand-950 bg-cover bg-center bg-fixed"
        style={{ backgroundImage: 'url("/images/why chose.png")' }}
      >
        {/* Dark overlay to ensure text readability against the image */}
        <div className="absolute inset-0 bg-brand-950/70 backdrop-blur-[2px]"></div>
        <div className="absolute inset-0 bg-gradient-to-b from-brand-950 via-transparent to-brand-950"></div>

        <div className="max-w-7xl mx-auto px-4 relative z-10">
          <div className="text-center mb-16 md:mb-24">
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-heading font-black text-white tracking-tight">Why Choose <span className="text-red-600">Talukder uPVC?</span></h2>
            <p className="mt-6 text-brand-100/80 max-w-2xl mx-auto text-lg font-medium leading-relaxed">Industry-leading quality backed by decades of manufacturing excellence and a relentless pursuit of perfection.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 lg:gap-10">
            {[
              { title: 'International Standards', desc: 'All products manufactured with rigorous quality control at every stage of production.', icon: Award },
              { title: 'Modern Manufacturing', desc: 'State-of-the-art factory equipped with auto-belling machines, ensuring consistent wall thickness and accuracy.', icon: Factory },
              { title: 'Nationwide Distribution', desc: 'Comprehensive distribution network ensuring timely delivery across Bangladesh with dedicated logistics support.', icon: Shield },
            ].map((item, idx) => (
              <div key={item.title} className="group relative bg-brand-900/40 backdrop-blur-xl border border-white/10 rounded-lg p-10 hover:bg-brand-800/50 hover:border-accent-500/40 transition-all duration-500 hover:-translate-y-3 hover:shadow-[0_20px_40px_-10px_rgba(56,189,248,0.2)] overflow-hidden">
                {/* Accent top border glow */}
                <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-accent-400 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700 shadow-[0_0_20px_rgba(56,189,248,1)]"></div>

                {/* Large faded background icon */}
                <div className="absolute -right-10 -bottom-10 opacity-[0.02] group-hover:opacity-[0.05] group-hover:scale-125 transition-all duration-700 pointer-events-none transform -rotate-12">
                  <item.icon className="w-56 h-56 text-white" />
                </div>

                <div className="relative z-10">
                  <div className="h-16 w-16 rounded-lg bg-gradient-to-br from-brand-800 to-brand-950 border border-brand-700 shadow-[inset_0_2px_10px_rgba(255,255,255,0.1)] flex items-center justify-center mb-8 group-hover:scale-110 transition-transform duration-500 group-hover:border-accent-500/50">
                    <item.icon className="h-8 w-8 text-accent-400 group-hover:text-white transition-colors" />
                  </div>
                  <h3 className="text-2xl font-heading font-bold text-white mb-4 group-hover:text-accent-100 transition-colors leading-tight">{item.title}</h3>
                  <p className="text-brand-100/70 text-base leading-relaxed">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>


      {/* Trusted Clients */}
      <section className="py-16 bg-white border-t border-gray-100">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-10">
            <h2 className="text-2xl font-heading font-bold text-gray-900 flex items-center justify-center gap-2">
              <Users className="h-6 w-6 text-brand-600" /> Trusted by Industry Leaders
            </h2>
          </div>
          <div className="flex flex-wrap justify-center items-center gap-8 md:gap-16 transition-all duration-500">
            {[
              { name: 'BADC', img: '/Partners/BADC.png' },
              { name: 'Chittagong Wasa', img: '/Partners/Chittagong Wasa.png' },
              { name: 'DPHE', img: '/Partners/DPHE.png' },
              { name: 'Dhaka Wasa', img: '/Partners/Dhaka Wasa.png' },
              { name: 'JICA', img: '/Partners/JICA.webp' },
              { name: 'Barind', img: '/Partners/barind.webp' }
            ].map((partner) => (
              <div key={partner.name} className="flex items-center justify-center h-16 w-32 md:h-20 md:w-40 hover:scale-110 transition-transform duration-300">
                <img src={partner.img} alt={partner.name} className="max-h-full max-w-full object-contain" />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section
        className="py-24 relative overflow-hidden bg-cover bg-[center_75%]"
        style={{ backgroundImage: 'url("/images/upvc pip.jpg")' }}
      >
        <div className="absolute inset-0 bg-white/60 z-0"></div>
        <div className="max-w-5xl mx-auto px-4 text-center relative z-10">
          <h2 className="text-4xl md:text-5xl font-heading font-black text-brand-950 tracking-tight">Ready to Place an Order?</h2>
          <p className="mt-6 text-gray-800 text-lg md:text-xl font-medium max-w-2xl mx-auto leading-relaxed drop-shadow-sm">Browse our catalog and add products to your enquiry list for a customized quote.</p>
          <div className="mt-10 flex flex-wrap justify-center gap-5">
            <Link to="/products" className="group relative inline-flex items-center gap-2 bg-brand-600 text-white px-8 py-4 rounded-lg font-bold transition-all duration-300 shadow-[0_10px_20px_-10px_rgba(59,130,246,0.6)] hover:shadow-[0_15px_30px_-10px_rgba(59,130,246,0.8)] hover:-translate-y-1 overflow-hidden">
              <span className="absolute inset-0 bg-gradient-to-r from-brand-500 via-brand-600 to-brand-700 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></span>
              <span className="relative z-10 flex items-center gap-2">Browse Catalog <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" /></span>
            </Link>
            <Link to="/contact" className="group inline-flex items-center gap-2 border-2 border-brand-200 text-brand-700 px-8 py-4 rounded-lg font-bold hover:bg-brand-50 hover:border-brand-300 transition-all duration-300">
              Contact Sales
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
