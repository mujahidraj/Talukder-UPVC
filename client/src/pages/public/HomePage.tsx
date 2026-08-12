import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Shield, Award, Factory, Droplets, ChevronRight, Play, Camera, Globe, Video, MessageCircle, Tractor, Building2, HardHat, CheckCircle2, Wrench, Users } from 'lucide-react';
import api from '../../lib/axios';
import SEO from '../../components/SEO';

export default function HomePage() {
  const [categories, setCategories] = useState<any[]>([]);
  const [featured, setFeatured] = useState<any[]>([]);
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
    api.get('/products', { params: { limit: 8 } }).then(r => setFeatured(r.data.data)).catch(() => {});
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
        description="Bangladesh's leading manufacturer of uPVC pipes and fittings. BS-3505 certified, 100% virgin material for water supply, drainage, and irrigation."
        canonical="/"
      />
      <section className="relative text-white overflow-hidden bg-gray-900 min-h-[85vh] flex items-center transition-all duration-1000">
        {hasBanners ? (
          <>
            {banners.map((banner, idx) => (
              <div 
                key={banner.id}
                className={`absolute inset-0 w-full h-full transition-opacity duration-1000 ${idx === currentBanner ? 'opacity-100' : 'opacity-0'}`}
              >
                <img 
                  src={banner.imageUrl} 
                  className="w-full h-full object-cover object-center"
                  alt={banner.title || 'Talukder uPVC Banner'}
                />
              </div>
            ))}
            <div className="absolute inset-0 bg-gray-950/75 md:bg-gray-950/60" />
            
            <div className="max-w-7xl mx-auto px-4 py-24 md:py-32 relative w-full z-10">
              <div className="max-w-3xl" key={currentBanner} style={{ animation: 'fadeIn 0.5s ease-out' }}>
                {activeBanner.subtitle && (
                  <div className="inline-flex items-center gap-2 bg-brand-700/50 backdrop-blur-sm text-brand-200 text-xs font-semibold px-4 py-2 rounded-full mb-6 border border-brand-600/30">
                    <Award className="h-3.5 w-3.5" /> {activeBanner.subtitle}
                  </div>
                )}
                <h1 className="text-4xl md:text-5xl lg:text-6xl font-heading font-bold tracking-tight text-white leading-[1.1]">
                  {activeBanner.title ? (
                    // Simple split if title contains a pipe "|" to highlight second part
                    activeBanner.title.includes('|') ? (
                      <>
                        {activeBanner.title.split('|')[0]}
                        <span className="block text-brand-300">{activeBanner.title.split('|')[1]}</span>
                      </>
                    ) : (
                      activeBanner.title
                    )
                  ) : (
                    'Talukder uPVC'
                  )}
                </h1>
                <div className="mt-8 flex flex-wrap gap-4">
                  <Link to={activeBanner.linkUrl || '/products'} className="inline-flex items-center gap-2 bg-white text-brand-900 px-6 py-3 rounded-xl font-semibold hover:bg-brand-50 transition-colors shadow-lg">
                    {activeBanner.linkUrl ? 'Learn More' : 'Browse Catalog'} <ArrowRight className="h-5 w-5" />
                  </Link>
                  <Link to="/contact" className="inline-flex items-center gap-2 border-2 border-brand-400 text-white px-6 py-3 rounded-xl font-semibold hover:bg-brand-700 transition-colors bg-brand-900/50 backdrop-blur-sm">
                    Request Quote
                  </Link>
                </div>
              </div>
            </div>
            
            {/* Slider Dots */}
            {banners.length > 1 && (
              <div className="absolute bottom-8 left-0 right-0 flex justify-center gap-2 z-20">
                {banners.map((_, idx) => (
                  <button 
                    key={idx} 
                    onClick={() => setCurrentBanner(idx)}
                    className={`h-2.5 rounded-full transition-all duration-300 ${idx === currentBanner ? 'w-8 bg-brand-400' : 'w-2.5 bg-white/50 hover:bg-white/80'}`}
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
                className="w-full h-full object-cover object-center opacity-90"
                alt="Talukder uPVC"
              />
            </div>
            <div className="absolute inset-0 bg-gray-950/75 md:bg-gray-950/60" />
            
            <div className="max-w-7xl mx-auto px-4 py-24 md:py-32 relative w-full z-10">
              <div className="max-w-3xl">
                <div className="inline-flex items-center gap-2 bg-brand-700/50 backdrop-blur-sm text-brand-200 text-xs font-semibold px-4 py-2 rounded-full mb-6 border border-brand-600/30">
                  <Award className="h-3.5 w-3.5" /> BS-3505 Standard · 100% Virgin Material
                </div>
                <h1 className="text-4xl md:text-5xl lg:text-6xl font-heading font-bold tracking-tight text-white leading-[1.1]">
                  Bangladesh's Trusted
                  <span className="block text-brand-300">uPVC Pipe & Fittings</span>
                  Manufacturer
                </h1>
                <p className="mt-6 text-lg text-brand-100 max-w-xl leading-relaxed">
                  Talukder uPVC Fittings Industries Ltd. delivers premium quality pipes and fittings for water supply, drainage, and irrigation across the nation.
                </p>
                <div className="mt-8 flex flex-wrap gap-4">
                  <Link to="/products" className="inline-flex items-center gap-2 bg-white text-brand-900 px-6 py-3 rounded-xl font-semibold hover:bg-brand-50 transition-colors shadow-lg">
                    Browse Catalog <ArrowRight className="h-5 w-5" />
                  </Link>
                  <Link to="/contact" className="inline-flex items-center gap-2 border-2 border-brand-400 text-white px-6 py-3 rounded-xl font-semibold hover:bg-brand-700 transition-colors bg-brand-900/50 backdrop-blur-sm">
                    Request Quote
                  </Link>
                </div>
              </div>
            </div>
          </>
        )}
      </section>

      {/* Trust Bar (Dark & Immersive) */}
      <section className="bg-brand-950 border-t border-brand-800/50 relative z-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 md:py-12">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8 md:gap-0 md:divide-x divide-brand-800/50">
            {[
              { icon: Shield, label: 'BS-3505 Certified', desc: 'International standard' },
              { icon: Factory, label: 'Modern Factory', desc: 'Auto-belling machines' },
              { icon: Droplets, label: '100% Virgin Material', desc: 'No recycled content' },
              { icon: Award, label: '50+ Year Lifespan', desc: 'Proven durability' },
            ].map((item, idx) => (
              <div key={item.label} className={`flex items-center gap-5 group ${idx !== 0 ? 'md:pl-10' : 'md:pr-10'} ${idx === 1 || idx === 2 ? 'md:px-10' : ''}`}>
                <div className="h-16 w-16 rounded-2xl bg-brand-900 border border-brand-700/50 flex items-center justify-center group-hover:bg-brand-800 group-hover:border-brand-500/50 group-hover:shadow-[0_0_30px_rgba(59,130,246,0.2)] transition-all duration-300 flex-shrink-0 group-hover:-translate-y-1">
                  <item.icon className="h-7 w-7 text-brand-300 group-hover:text-white transition-colors" />
                </div>
                <div>
                  <p className="text-base font-bold text-white tracking-wide">{item.label}</p>
                  <p className="text-sm text-brand-300/80 mt-1">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Product Categories */}
      <section 
        className="py-16 md:py-24 relative overflow-hidden bg-cover bg-center bg-fixed"
        style={{ backgroundImage: 'url("/images/HERO-IMAGE-1.png")' }}
      >
        {/* Lighter, less blurry overlay so the image shows through much more */}
        <div className="absolute inset-0 bg-white/60 z-0"></div>
        {/* Subtle background decoration */}
        <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-brand-200 to-transparent opacity-50 z-10"></div>
        <div className="max-w-7xl mx-auto px-4 relative z-10">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-heading font-bold text-brand-950">Product Categories</h2>
            <p className="mt-4 text-gray-500 max-w-xl mx-auto text-lg">Explore our comprehensive range of high-quality uPVC products for every application.</p>
          </div>
          <div className="flex flex-wrap justify-center gap-4 xl:gap-6">
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
                  className="flex-1 min-w-[240px] max-w-sm group relative rounded-3xl p-6 magic-border magic-border-image hover:shadow-[0_0_30px_rgba(59,130,246,0.35)] hover:-translate-y-2 transition-all duration-500 overflow-hidden block"
                >
                  {/* Product Image Background */}
                  <div 
                    className="absolute inset-0 bg-cover bg-center z-0 group-hover:scale-105 transition-transform duration-700" 
                    style={{ backgroundImage: `url('${getBgImage(cat.name)}')` }}
                  ></div>
                  {/* White Overlay for text readability (reduced blur) */}
                  <div className="absolute inset-0 bg-white/70 backdrop-blur-[1px] group-hover:bg-white/60 transition-colors z-0"></div>
                  
                  {/* Decorative background element */}
                  <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-brand-50 to-transparent rounded-bl-full opacity-50 group-hover:scale-110 transition-transform duration-500 z-0"></div>
                  
                  <div className="flex items-start justify-end relative z-10">
                    <div className="h-10 w-10 rounded-full bg-gray-50 flex items-center justify-center group-hover:bg-brand-50 transition-colors border border-gray-100 group-hover:border-brand-100">
                      <ArrowRight className="h-5 w-5 text-gray-400 group-hover:text-brand-600 transition-colors transform group-hover:translate-x-1" />
                    </div>
                  </div>
                  
                  <div className="mt-12 relative z-10">
                    <h3 className="text-xl font-heading font-bold text-gray-900 group-hover:text-brand-700 transition-colors">{cat.name}</h3>
                    <div className="mt-3 inline-flex items-center gap-2 bg-gray-50/80 px-3 py-1.5 rounded-lg border border-gray-100/50">
                      <span className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)] animate-pulse"></span>
                      <p className="text-sm font-medium text-gray-600">
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

      {/* Applications & Use Cases */}
      <section className="py-16 md:py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-heading font-bold text-brand-950">Applications & Use Cases</h2>
            <p className="mt-3 text-gray-500 max-w-xl mx-auto">Tailored uPVC solutions for diverse industries and everyday needs</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { title: 'Agriculture', desc: 'Durable pipes for efficient irrigation systems.', icon: Tractor },
              { title: 'Residential', desc: 'Safe and leak-proof plumbing for homes.', icon: Building2 },
              { title: 'Industrial', desc: 'Heavy-duty pipes for chemical and waste transport.', icon: Factory },
              { title: 'Infrastructure', desc: 'Underground sewerage and main water supply lines.', icon: HardHat },
            ].map((app) => (
              <div key={app.title} className="bg-slate-50 rounded-2xl p-6 magic-border magic-border-slate hover:shadow-[0_0_25px_rgba(59,130,246,0.3)] hover:-translate-y-2 transition-all duration-500 text-center group relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-brand-100/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"></div>
                <div className="h-16 w-16 mx-auto rounded-full bg-brand-100 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform relative z-10">
                  <app.icon className="h-8 w-8 text-brand-600" />
                </div>
                <h3 className="font-heading font-semibold text-lg text-gray-900 mb-2 relative z-10">{app.title}</h3>
                <p className="text-sm text-gray-500 relative z-10">{app.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section className="py-16 md:py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-end justify-between mb-12">
            <div>
              <h2 className="text-3xl md:text-4xl font-heading font-bold text-brand-950">Our Products</h2>
              <p className="mt-3 text-gray-500">Quality uPVC products for every application</p>
            </div>
            <Link to="/products" className="hidden sm:flex items-center gap-2 text-brand-600 font-semibold hover:text-brand-700 transition-colors">
              View all <ArrowRight className="h-5 w-5" />
            </Link>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {featured.map((product: any) => (
              <Link
                key={product.id}
                to={`/products/${product.slug}`}
                className="group bg-white rounded-2xl overflow-hidden magic-border magic-border-white hover:shadow-[0_0_25px_rgba(59,130,246,0.3)] hover:-translate-y-2 transition-all duration-500"
              >
                <div className="aspect-square bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center p-4 overflow-hidden">
                  {product.images?.[0]?.thumbPath ? (
                    <img src={`http://localhost:3000${product.images[0].thumbPath}`} alt={product.productName} className="h-full w-full object-contain group-hover:scale-110 transition-transform duration-500" />
                  ) : (
                    <Droplets className="h-16 w-16 text-gray-300" />
                  )}
                </div>
                <div className="p-4">
                  <p className="text-xs text-brand-600 font-medium">{product.category?.name}</p>
                  <h3 className="font-semibold text-gray-900 mt-1 line-clamp-2 text-sm group-hover:text-brand-600 transition-colors">{product.productName}</h3>
                  <div className="mt-3 flex flex-wrap items-center gap-2">
                    <span className="text-xs font-bold text-gray-900 bg-gray-100 px-2 py-1 rounded-md border border-gray-200">Size: {product.size}</span>
                    <span className="text-xs font-bold text-gray-900 bg-brand-50 px-2 py-1 rounded-md border border-brand-100">Code: {product.productCode}</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
          <div className="sm:hidden mt-8 text-center">
            <Link to="/products" className="admin-btn-primary">View All Products</Link>
          </div>
        </div>
      </section>

      {/* Why Talukder */}
      <section 
        className="py-20 md:py-32 relative text-white overflow-hidden bg-brand-950 bg-cover bg-center bg-fixed"
        style={{ backgroundImage: 'url("/images/why chose.png")' }}
      >
        {/* Dark overlay to ensure text readability against the image */}
        <div className="absolute inset-0 bg-brand-950/40"></div>
        
        <div className="max-w-7xl mx-auto px-4 relative z-10">
          <div className="text-center mb-16 md:mb-24">
            <h2 className="text-4xl md:text-5xl font-heading font-bold text-white tracking-tight">Why Choose <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-300 to-brand-100">Talukder uPVC?</span></h2>
            <p className="mt-6 text-brand-200/80 max-w-2xl mx-auto text-lg">Industry-leading quality backed by decades of manufacturing excellence and a relentless pursuit of perfection.</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 lg:gap-12">
            {[
              { title: 'International Standards', desc: 'All products manufactured as per BS-3505 standard with rigorous quality control at every stage of production.', icon: Award },
              { title: 'Modern Manufacturing', desc: 'State-of-the-art factory equipped with auto-belling machines, ensuring consistent wall thickness and accuracy.', icon: Factory },
              { title: 'Nationwide Distribution', desc: 'Comprehensive distribution network ensuring timely delivery across Bangladesh with dedicated logistics support.', icon: Shield },
            ].map((item, idx) => (
              <div key={item.title} className="group relative bg-brand-900/40 backdrop-blur-md border border-brand-700/50 rounded-3xl p-8 hover:bg-brand-800/60 hover:border-brand-400/80 transition-all duration-500 hover:-translate-y-3 hover:shadow-[0_0_30px_rgba(59,130,246,0.4)] overflow-hidden">
                {/* Accent top border */}
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-brand-500 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                
                {/* Large faded background icon */}
                <div className="absolute -right-6 -bottom-6 opacity-[0.03] group-hover:opacity-[0.06] group-hover:scale-110 transition-all duration-700 pointer-events-none transform -rotate-12">
                  <item.icon className="w-48 h-48 text-brand-100" />
                </div>
                
                <div className="relative z-10">
                  <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-brand-800 to-brand-900 border border-brand-700 shadow-inner flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-500">
                    <item.icon className="h-8 w-8 text-brand-300 group-hover:text-white transition-colors" />
                  </div>
                  <h3 className="text-2xl font-heading font-bold text-white mb-4 group-hover:text-brand-100 transition-colors">{item.title}</h3>
                  <p className="text-brand-200/70 text-base leading-relaxed">{item.desc}</p>
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
      <section className="py-16 bg-white">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-3xl font-heading font-bold text-brand-950">Ready to Place an Order?</h2>
          <p className="mt-3 text-gray-500">Browse our catalog and add products to your enquiry list for a customized quote.</p>
          <div className="mt-8 flex flex-wrap justify-center gap-4">
            <Link to="/products" className="admin-btn-primary text-base px-8 py-3">Browse Products</Link>
            <Link to="/contact" className="admin-btn-secondary text-base px-8 py-3">Contact Sales</Link>
          </div>
        </div>
      </section>
    </div>
  );
}
