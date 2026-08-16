import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Shield, Award, Factory, Droplets, ChevronRight, Play, Camera, Globe, Video, MessageCircle, Tractor, Building2, HardHat, CheckCircle2, Wrench, Users, Layers } from 'lucide-react';
import api from '../../lib/axios';
import SEO from '../../components/SEO';

export default function HomePage() {
  const [categories, setCategories] = useState<any[]>([]);
  const [featured, setFeatured] = useState<any[]>([]);
  const [tubewells, setTubewells] = useState<any[]>([]);
  const [banners, setBanners] = useState<any[]>([]);
  const [currentBanner, setCurrentBanner] = useState(0);

  useEffect(() => {
    api.get('/cms/banners').then(r => setBanners(r.data)).catch(() => {});
    api.get('/categories/tree').then(r => {
      // Prioritize the categories that actually have all the imported products
      const mainCatNames = ['agricultural', 'upvc doors', 'fittings', 'pipes', 'tubewells'];
      const filtered = r.data.filter((c: any) => mainCatNames.includes(c.name.toLowerCase()));
      
      // If the old categories still exist instead, fallback to them
      if (filtered.length < 5) {
        const fallback = ['upvc fittings', 'upvc pipes'];
        const extra = r.data.filter((c: any) => fallback.includes(c.name.toLowerCase()) && !filtered.find((f: any) => f.name.includes('Pipes') && c.name.includes('Pipes')));
        filtered.push(...extra);
      }
      
      setCategories(filtered.slice(0, 5));
    }).catch(() => {});
    api.get('/products/grouped', { params: { limit: 50, sortBy: 'name' } }).then(r => {
      const all = r.data.data || [];
      const tbw = all.filter((p: any) => p.isTubewell);
      const others = all.filter((p: any) => !p.isTubewell);
      setFeatured(others.slice(0, 8));
      setTubewells(tbw.slice(0, 8));
    }).catch(() => {});
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
        description="Bangladesh's leading manufacturer of uPVC pipes and fittings. 100% virgin material for water supply, drainage, and irrigation."
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
                        <span className="block text-transparent bg-clip-text bg-gradient-to-r from-accent-400 to-accent-300 mt-2">{activeBanner.title.split('|')[1]}</span>
                      </>
                    ) : (
                      activeBanner.title
                    )
                  ) : (
                    'Talukder uPVC'
                  )}
                </h1>
                <div className="mt-10 flex flex-wrap gap-5">
                  <Link to={activeBanner.linkUrl || '/products'} className="group relative inline-flex items-center gap-2 bg-white text-brand-900 px-8 py-4 rounded-xl font-bold transition-all duration-300 shadow-[0_0_20px_rgba(255,255,255,0.2)] hover:shadow-[0_0_30px_rgba(255,255,255,0.4)] hover:-translate-y-1 overflow-hidden">
                    <span className="absolute inset-0 bg-gradient-to-r from-white via-brand-50 to-white opacity-0 group-hover:opacity-100 transition-opacity duration-500"></span>
                    <span className="relative z-10 flex items-center gap-2">{activeBanner.linkUrl ? 'Learn More' : 'Browse Catalog'} <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" /></span>
                  </Link>
                  <Link to="/contact" className="group inline-flex items-center gap-2 border border-brand-400/40 text-white px-8 py-4 rounded-xl font-bold hover:bg-brand-800/60 hover:border-brand-400 transition-all duration-300 bg-brand-900/30 backdrop-blur-md hover:-translate-y-1 hover:shadow-[0_0_20px_rgba(59,130,246,0.3)]">
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
                src="/images/tube.png" 
                className="w-full h-full object-cover object-center opacity-90 scale-105 transform animate-[subtle-zoom_20s_infinite_alternate]"
                alt="Talukder uPVC"
              />
            </div>
            <div className="absolute inset-0 bg-gradient-to-r from-brand-950/90 via-brand-950/70 to-brand-950/20" />
            
            <div className="max-w-7xl mx-auto px-4 py-24 md:py-32 relative w-full z-10">
              <div className="max-w-3xl" style={{ animation: 'fadeInUp 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards' }}>
                <div className="inline-flex items-center gap-2 bg-brand-800/40 backdrop-blur-md text-brand-100 text-xs font-bold tracking-wide uppercase px-5 py-2.5 rounded-full mb-8 border border-brand-500/30 shadow-[0_0_20px_rgba(59,130,246,0.3)]">
                  <Award className="h-4 w-4 text-accent-400" /> Premium Quality · 100% Virgin Material
                </div>
                <h1 className="text-4xl md:text-6xl lg:text-7xl font-heading font-black tracking-tight text-white leading-[1.1] drop-shadow-lg">
                  Bangladesh's Trusted
                  <span className="block text-transparent bg-clip-text bg-gradient-to-r from-accent-400 to-accent-300 mt-2">uPVC Pipe & Fittings</span>
                  Manufacturer
                </h1>
                <p className="mt-6 text-lg md:text-xl text-brand-100/90 max-w-2xl leading-relaxed drop-shadow-sm font-medium">
                  Talukder uPVC Fittings Ltd. delivers premium quality pipes and fittings for water supply, drainage, and irrigation across the nation.
                </p>
                <div className="mt-10 flex flex-wrap gap-5">
                  <Link to="/products" className="group relative inline-flex items-center gap-2 bg-white text-brand-900 px-8 py-4 rounded-xl font-bold transition-all duration-300 shadow-[0_0_20px_rgba(255,255,255,0.2)] hover:shadow-[0_0_30px_rgba(255,255,255,0.4)] hover:-translate-y-1 overflow-hidden">
                    <span className="absolute inset-0 bg-gradient-to-r from-white via-brand-50 to-white opacity-0 group-hover:opacity-100 transition-opacity duration-500"></span>
                    <span className="relative z-10 flex items-center gap-2">Browse Catalog <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" /></span>
                  </Link>
                  <Link to="/contact" className="group inline-flex items-center gap-2 border border-brand-400/40 text-white px-8 py-4 rounded-xl font-bold hover:bg-brand-800/60 hover:border-brand-400 transition-all duration-300 bg-brand-900/30 backdrop-blur-md hover:-translate-y-1 hover:shadow-[0_0_20px_rgba(59,130,246,0.3)]">
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
        style={{ backgroundImage: 'url("/images/HERO-IMAGE-1.png")' }}
      >
        <div className="absolute inset-0 bg-gradient-to-b from-white/95 via-white/80 to-white/95 z-0 backdrop-blur-[2px]"></div>
        
        {/* Trust Bar (Full Width Glassmorphism) */}
        <div className="relative z-30 w-full -mt-12 sm:-mt-16 mb-16 md:mb-24">
          <div className="bg-brand-950/80 backdrop-blur-xl border-y border-brand-800/50 shadow-[0_20px_40px_-15px_rgba(0,0,0,0.5)] overflow-hidden">
            <div className="max-w-7xl mx-auto px-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-0 divide-y sm:divide-y-0 sm:divide-x divide-brand-800/50">
                {[
                  { icon: Shield, label: 'Quality Certified', desc: 'International standard' },
                  { icon: Factory, label: 'Modern Factory', desc: 'Auto-belling machines' },
                  { icon: Droplets, label: '100% Virgin Material', desc: 'No recycled content' },
                  { icon: Award, label: '50+ Year Lifespan', desc: 'Proven durability' },
                ].map((item, idx) => (
                  <div key={item.label} className="flex items-center gap-5 group p-6 sm:p-8 lg:p-10 hover:bg-brand-900/50 transition-colors duration-500">
                    <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-brand-900 to-brand-950 border border-brand-800 shadow-inner flex items-center justify-center group-hover:border-accent-500/50 group-hover:shadow-[0_0_30px_rgba(56,189,248,0.2)] transition-all duration-500 flex-shrink-0 group-hover:-translate-y-1">
                      <item.icon className="h-7 w-7 text-accent-400 group-hover:text-accent-300 transition-colors" />
                    </div>
                    <div>
                      <p className="text-base lg:text-lg font-bold text-white tracking-wide group-hover:text-accent-100 transition-colors">{item.label}</p>
                      <p className="text-sm text-brand-300/80 mt-1">{item.desc}</p>
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
            <p className="mt-6 text-gray-600 max-w-2xl mx-auto text-lg font-medium">Discover our comprehensive range of high-quality uPVC products engineered for perfection.</p>
          </div>
          <div className="flex flex-wrap justify-center gap-6 lg:gap-8">
            {categories.map((cat: any) => {
              const getBgImage = (name: string) => {
                const n = name.toLowerCase();
                if (n.includes('door')) return '/images/cat-doors.png';
                if (n.includes('agri')) return '/images/cat-agri.jpg';
                if (n.includes('tube')) return '/images/cat-tubewells.jpg';
                if (n.includes('fitting')) return '/images/cat-fittings.png';
                return '/images/cat-pipes.jpg';
              };
              
              return (
                <Link
                  key={cat.id}
                  to={`/categories/${cat.slug}`}
                  className="flex-1 min-w-[260px] max-w-md group relative rounded-[2rem] p-8 bg-white shadow-[0_10px_40px_-10px_rgba(0,0,0,0.08)] magic-border magic-border-white hover:shadow-[0_20px_50px_-15px_rgba(59,130,246,0.2)] hover:-translate-y-3 transition-all duration-500 overflow-hidden block"
                >
                  {/* Product Image Background */}
                  <div 
                    className="absolute inset-0 bg-cover bg-center z-0 group-hover:scale-110 transition-transform duration-1000 opacity-20 group-hover:opacity-30" 
                    style={{ backgroundImage: `url('${getBgImage(cat.name)}')` }}
                  ></div>
                  <div className="absolute inset-0 bg-gradient-to-t from-white via-white/90 to-white/60 z-0 transition-opacity duration-500"></div>
                  
                  {/* Decorative element */}
                  <div className="absolute -top-10 -right-10 w-40 h-40 bg-gradient-to-br from-brand-100 to-accent-100 rounded-full opacity-40 blur-2xl group-hover:opacity-80 group-hover:scale-150 transition-all duration-700 z-0"></div>
                  
                  <div className="flex items-start justify-end relative z-10">
                    <div className="h-12 w-12 rounded-full bg-white flex items-center justify-center shadow-md group-hover:bg-brand-500 group-hover:shadow-[0_0_20px_rgba(59,130,246,0.4)] transition-all duration-500 border border-gray-100 group-hover:border-transparent">
                      <ArrowRight className="h-6 w-6 text-brand-600 group-hover:text-white transition-colors transform group-hover:translate-x-1" />
                    </div>
                  </div>
                  
                  <div className="mt-16 relative z-10">
                    <h3 className="text-2xl font-heading font-black text-gray-900 group-hover:text-brand-700 transition-colors drop-shadow-sm">{cat.name}</h3>
                    <div className="mt-4 inline-flex items-center gap-2 bg-white/80 backdrop-blur-sm px-4 py-2 rounded-xl border border-gray-200/50 shadow-sm group-hover:border-brand-200 transition-colors">
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
              <p className="mt-4 text-gray-600 text-lg font-medium">Discover premium quality uPVC products for every application.</p>
            </div>
            <Link to="/products" className="hidden sm:inline-flex items-center gap-2 text-brand-600 font-bold hover:text-brand-700 transition-colors bg-brand-50 px-6 py-3 rounded-xl hover:bg-brand-100">
              View All Catalog <ArrowRight className="h-5 w-5" />
            </Link>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 lg:gap-8">
            {featured.map((product: any) => (
              <Link
                key={product.id}
                to={`/products/${product.slug}`}
                className="group bg-white rounded-3xl overflow-hidden shadow-[0_5px_15px_-5px_rgba(0,0,0,0.05)] border border-gray-100 hover:shadow-[0_20px_40px_-10px_rgba(59,130,246,0.15)] hover:-translate-y-2 transition-all duration-500 flex flex-col"
              >
                <div className="aspect-square bg-gradient-to-b from-gray-50 to-white flex items-center justify-center p-6 overflow-hidden relative">
                  <div className="absolute inset-0 bg-brand-500/0 group-hover:bg-brand-500/5 transition-colors duration-500"></div>
                  {product.images?.[0]?.thumbPath ? (
                    <img src={`http://localhost:3000${product.images[0].thumbPath}`} alt={product.productName} className="h-full w-full object-contain group-hover:scale-110 transition-transform duration-700 drop-shadow-sm" />
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
            <Link to="/products" className="inline-flex items-center justify-center w-full gap-2 bg-brand-600 text-white px-6 py-4 rounded-xl font-bold hover:bg-brand-700 transition-colors shadow-lg">
              View All Products
            </Link>
          </div>
        </div>
      </section>

      {/* Applications & Use Cases */}
      <section className="py-16 md:py-32 bg-slate-50/50 relative">
        <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-gray-200 to-transparent"></div>
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-16 md:mb-20">
            <h2 className="text-3xl md:text-5xl font-heading font-black text-brand-950 tracking-tight">Applications & Use Cases</h2>
            <p className="mt-6 text-gray-600 max-w-2xl mx-auto text-lg font-medium">Tailored uPVC solutions engineered for diverse industries and demanding everyday needs.</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
            {[
              { title: 'Agriculture', desc: 'Durable pipes for efficient irrigation systems.', icon: Tractor, color: 'from-emerald-400 to-teal-500' },
              { title: 'Residential', desc: 'Safe and leak-proof plumbing for homes.', icon: Building2, color: 'from-blue-400 to-brand-600' },
              { title: 'Industrial', desc: 'Heavy-duty pipes for chemical transport.', icon: Factory, color: 'from-orange-400 to-rose-500' },
              { title: 'Infrastructure', desc: 'Underground sewerage and supply lines.', icon: HardHat, color: 'from-purple-400 to-indigo-500' },
            ].map((app) => (
              <div key={app.title} className="bg-white rounded-[2rem] p-8 shadow-[0_10px_30px_-15px_rgba(0,0,0,0.05)] border border-gray-100 hover:shadow-[0_20px_40px_-15px_rgba(59,130,246,0.15)] hover:-translate-y-2 transition-all duration-500 text-center group relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-b from-transparent to-gray-50/50 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                <div className="relative z-10 flex flex-col items-center">
                  <div className="h-20 w-20 rounded-2xl bg-gray-50 border border-gray-100 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-500 group-hover:border-transparent group-hover:shadow-[0_10px_20px_-10px_rgba(0,0,0,0.2)]">
                    <div className={`absolute inset-0 bg-gradient-to-br ${app.color} opacity-0 group-hover:opacity-10 rounded-2xl transition-opacity duration-500`}></div>
                    <app.icon className="h-10 w-10 text-gray-400 group-hover:text-brand-600 transition-colors duration-500" />
                  </div>
                  <h3 className="font-heading font-bold text-xl text-gray-900 mb-3">{app.title}</h3>
                  <p className="text-base text-gray-500 font-medium leading-relaxed">{app.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Tubewell Products */}
      <section className="py-16 md:py-32 bg-slate-50 relative">
        <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-gray-200 to-transparent"></div>
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-6">
            <div>
              <h2 className="text-3xl md:text-5xl font-heading font-black text-brand-950 tracking-tight">Tubewells</h2>
              <p className="mt-4 text-gray-600 text-lg font-medium">Premium tubewell pipes and high-durability accessories.</p>
            </div>
            <Link to="/products?search=tubewell" className="hidden sm:inline-flex items-center gap-2 text-brand-600 font-bold hover:text-brand-700 transition-colors bg-brand-100/50 px-6 py-3 rounded-xl hover:bg-brand-100">
              View All Tubewells <ArrowRight className="h-5 w-5" />
            </Link>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 lg:gap-8">
            {tubewells.map((product: any) => (
              <Link
                key={product.id}
                to={`/products/${product.slug}`}
                className="group bg-white rounded-3xl overflow-hidden shadow-[0_5px_15px_-5px_rgba(0,0,0,0.05)] border border-gray-100 hover:shadow-[0_20px_40px_-10px_rgba(59,130,246,0.15)] hover:-translate-y-2 transition-all duration-500 flex flex-col"
              >
                <div className="aspect-square bg-gradient-to-b from-gray-50 to-white flex items-center justify-center p-6 overflow-hidden relative">
                  <div className="absolute inset-0 bg-brand-500/0 group-hover:bg-brand-500/5 transition-colors duration-500"></div>
                  {product.images?.[0]?.thumbPath ? (
                    <img src={`http://localhost:3000${product.images[0].thumbPath}`} alt={product.productName} className="h-full w-full object-contain group-hover:scale-110 transition-transform duration-700 drop-shadow-sm" />
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
            <Link to="/products?search=tubewell" className="inline-flex items-center justify-center w-full gap-2 bg-brand-600 text-white px-6 py-4 rounded-xl font-bold hover:bg-brand-700 transition-colors shadow-lg">
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
            <div className="inline-flex items-center gap-2 bg-white/5 backdrop-blur-md text-brand-100 text-xs font-bold tracking-wide uppercase px-5 py-2.5 rounded-full mb-6 border border-white/10 shadow-[0_0_20px_rgba(255,255,255,0.05)]">
              <Shield className="h-4 w-4 text-accent-400" /> Our Promise
            </div>
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-heading font-black text-white tracking-tight">Why Choose <span className="text-transparent bg-clip-text bg-gradient-to-r from-accent-400 to-brand-200">Talukder uPVC?</span></h2>
            <p className="mt-6 text-brand-100/80 max-w-2xl mx-auto text-lg font-medium leading-relaxed">Industry-leading quality backed by decades of manufacturing excellence and a relentless pursuit of perfection.</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 lg:gap-10">
            {[
              { title: 'International Standards', desc: 'All products manufactured with rigorous quality control at every stage of production.', icon: Award },
              { title: 'Modern Manufacturing', desc: 'State-of-the-art factory equipped with auto-belling machines, ensuring consistent wall thickness and accuracy.', icon: Factory },
              { title: 'Nationwide Distribution', desc: 'Comprehensive distribution network ensuring timely delivery across Bangladesh with dedicated logistics support.', icon: Shield },
            ].map((item, idx) => (
              <div key={item.title} className="group relative bg-brand-900/40 backdrop-blur-xl border border-white/10 rounded-[2rem] p-10 hover:bg-brand-800/50 hover:border-accent-500/40 transition-all duration-500 hover:-translate-y-3 hover:shadow-[0_20px_40px_-10px_rgba(56,189,248,0.2)] overflow-hidden">
                {/* Accent top border glow */}
                <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-accent-400 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700 shadow-[0_0_20px_rgba(56,189,248,1)]"></div>
                
                {/* Large faded background icon */}
                <div className="absolute -right-10 -bottom-10 opacity-[0.02] group-hover:opacity-[0.05] group-hover:scale-125 transition-all duration-700 pointer-events-none transform -rotate-12">
                  <item.icon className="w-56 h-56 text-white" />
                </div>
                
                <div className="relative z-10">
                  <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-brand-800 to-brand-950 border border-brand-700 shadow-[inset_0_2px_10px_rgba(255,255,255,0.1)] flex items-center justify-center mb-8 group-hover:scale-110 transition-transform duration-500 group-hover:border-accent-500/50">
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
          <div className="flex flex-wrap justify-center items-center gap-8 md:gap-16 opacity-60 grayscale hover:grayscale-0 transition-all duration-500">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="flex items-center gap-2 text-xl font-black text-gray-400 cursor-default">
                <Building2 className="h-8 w-8" /> PARTNER {i}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 bg-white relative overflow-hidden">
        <div className="absolute inset-0 bg-brand-50/50"></div>
        <div className="max-w-5xl mx-auto px-4 text-center relative z-10">
          <div className="inline-flex items-center gap-2 bg-brand-100 text-brand-700 text-xs font-bold tracking-wide uppercase px-4 py-2 rounded-full mb-6">
            <CheckCircle2 className="h-4 w-4" /> Available Nationwide
          </div>
          <h2 className="text-4xl md:text-5xl font-heading font-black text-brand-950 tracking-tight">Ready to Place an Order?</h2>
          <p className="mt-6 text-gray-600 text-lg md:text-xl font-medium max-w-2xl mx-auto leading-relaxed">Browse our catalog and add products to your enquiry list for a customized quote.</p>
          <div className="mt-10 flex flex-wrap justify-center gap-5">
            <Link to="/products" className="group relative inline-flex items-center gap-2 bg-brand-600 text-white px-8 py-4 rounded-xl font-bold transition-all duration-300 shadow-[0_10px_20px_-10px_rgba(59,130,246,0.6)] hover:shadow-[0_15px_30px_-10px_rgba(59,130,246,0.8)] hover:-translate-y-1 overflow-hidden">
              <span className="absolute inset-0 bg-gradient-to-r from-brand-500 via-brand-600 to-brand-700 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></span>
              <span className="relative z-10 flex items-center gap-2">Browse Catalog <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" /></span>
            </Link>
            <Link to="/contact" className="group inline-flex items-center gap-2 border-2 border-brand-200 text-brand-700 px-8 py-4 rounded-xl font-bold hover:bg-brand-50 hover:border-brand-300 transition-all duration-300">
              Contact Sales
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
