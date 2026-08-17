import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Search, Heart, Phone, Mail, Menu, X, ChevronDown, ArrowRight, ShoppingCart } from 'lucide-react';
import api from '../../lib/axios';

interface HeaderProps {
  onEnquiryClick?: () => void;
}

interface Category {
  id: string;
  name: string;
  slug: string;
  children: Category[];
  _count: { products: number };
}

export default function PublicHeader({ onEnquiryClick }: HeaderProps = {}) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [megaOpen, setMegaOpen] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [showSearch, setShowSearch] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  useEffect(() => {
    api.get('/categories/tree').then(res => setCategories(res.data)).catch(() => { });
  }, []);

  useEffect(() => {
    if (searchQuery.length < 2) { setSearchResults([]); return; }
    const timer = setTimeout(async () => {
      try {
        const res = await api.get('/products/search', { params: { q: searchQuery, limit: 8 } });
        setSearchResults(res.data);
      } catch { setSearchResults([]); }
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) setShowSearch(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const [wishlistItems, setWishlistItems] = useState<any[]>([]);
  const [enquiryCount, setEnquiryCount] = useState(0);

  // Sync enquiry and wishlist from localStorage
  useEffect(() => {
    const sync = () => {
      const eItems = JSON.parse(localStorage.getItem('talukder-enquiry') || '[]');
      setEnquiryCount(eItems.length);
      const wItems = JSON.parse(localStorage.getItem('talukder-wishlist') || '[]');
      setWishlistItems(wItems);
    };
    sync();
    // Listen for storage events from other tabs and custom events from same tab
    window.addEventListener('storage', sync);
    window.addEventListener('enquiry-updated', sync);
    window.addEventListener('wishlist-updated', sync);
    // Poll every 2s as fallback for same-tab localStorage changes
    const interval = setInterval(sync, 2000);
    return () => {
      window.removeEventListener('storage', sync);
      window.removeEventListener('enquiry-updated', sync);
      window.removeEventListener('wishlist-updated', sync);
      clearInterval(interval);
    };
  }, []);

  return (
    <header className="sticky top-0 z-50">
      {/* Top Bar */}
      <div className="bg-brand-950 text-brand-200 text-xs py-2 hidden md:block">
        <div className="max-w-7xl mx-auto px-4 flex items-center justify-between">
          <div className="flex items-center gap-6">
            <a href="tel:+8801966333355" className="flex items-center gap-1.5 hover:text-white transition-colors">
              <Phone className="h-3 w-3" /> +880 1966-333355
            </a>
            <a href="mailto:info@talukder-group.com.bd" className="flex items-center gap-1.5 hover:text-white transition-colors">
              <Mail className="h-3 w-3" /> info@talukder-group.com.bd
            </a>
          </div>
          <span>A Concern of Talukder Group of Industries</span>
        </div>
      </div>

      {/* Main Nav */}
      {/* Main Nav */}
      <nav className="bg-white border-b border-gray-100 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center justify-between h-20 md:h-24">
            {/* Logo */}
            <Link to="/" className="flex items-center gap-3 flex-shrink-0">
              <img src="/LOGO/Talukder-uPVC-Fittings-LTD-3.png" alt="Talukder uPVC Fittings Ltd." className="h-12 w-auto object-contain" />
              <div className="hidden sm:block">
                <span className="text-xl font-heading font-bold tracking-tight"><span className="text-brand-800">Talukder </span><span className="text-red-600">u</span><span className="text-brand-800">PVC</span></span>
                <p className="text-[10px] text-brand-800 uppercase tracking-widest font-semibold mt-0.5">Fittings Ltd.</p>
              </div>
            </Link>

            {/* Desktop Nav Links */}
            <div className="hidden lg:flex items-center gap-8">
              <Link to="/" className="text-sm font-semibold text-gray-700 hover:text-brand-800 transition-colors py-2 relative after:absolute after:bottom-0 after:left-0 after:w-0 after:h-0.5 after:bg-accent-600 after:transition-all hover:after:w-full">
                Home
              </Link>

              {/* Products Mega Menu */}
              <div
                className="relative h-full flex items-center"
                onMouseEnter={() => setMegaOpen(true)}
                onMouseLeave={() => setMegaOpen(false)}
              >
                <button className="text-sm font-semibold text-gray-700 hover:text-brand-800 transition-colors py-2 flex items-center gap-1.5 relative after:absolute after:bottom-0 after:left-0 after:w-0 after:h-0.5 after:bg-accent-600 after:transition-all hover:after:w-full">
                  Products <ChevronDown className={`h-3 w-3 transition-transform duration-200 ${megaOpen ? 'rotate-180' : ''}`} />
                </button>

                {megaOpen && (
                  <ul className="absolute top-full left-0 mt-0 w-64 bg-white shadow-xl border border-gray-100 py-2 z-50 animate-in fade-in slide-in-from-top-2 duration-200">
                    {categories.map((cat) => (
                      <li key={cat.id} className="relative group/cat">
                        <Link
                          to={`/categories/${cat.slug}`}
                          className="flex items-center justify-between px-5 py-3 text-sm font-semibold text-gray-700 hover:bg-gray-50 hover:text-brand-700 transition-colors"
                        >
                          {cat.name}
                          {cat.children && cat.children.length > 0 && (
                            <ChevronDown className="h-4 w-4 -rotate-90 text-gray-400 group-hover/cat:text-brand-700" />
                          )}
                        </Link>

                        {/* Sub Categories Flyout */}
                        {cat.children && cat.children.length > 0 && (
                          <ul className="absolute top-0 left-full w-64 bg-white shadow-xl border border-gray-100 py-2 opacity-0 invisible group-hover/cat:opacity-100 group-hover/cat:visible transition-all duration-200 -translate-x-2 group-hover/cat:translate-x-0">
                            {cat.children.map((sub) => (
                              <li key={sub.id} className="relative group/sub">
                                <Link
                                  to={`/categories/${sub.slug}`}
                                  className="flex items-center justify-between px-5 py-2.5 text-sm font-medium text-gray-600 hover:bg-gray-50 hover:text-brand-700 transition-colors"
                                >
                                  {sub.name}
                                  {sub.children && sub.children.length > 0 && (
                                    <ChevronDown className="h-4 w-4 -rotate-90 text-gray-400 group-hover/sub:text-brand-700" />
                                  )}
                                </Link>

                                {/* Sub-Sub Categories Flyout */}
                                {sub.children && sub.children.length > 0 && (
                                  <ul className="absolute top-0 left-full w-64 bg-white shadow-xl border border-gray-100 py-2 opacity-0 invisible group-hover/sub:opacity-100 group-hover/sub:visible transition-all duration-200 -translate-x-2 group-hover/sub:translate-x-0">
                                    {sub.children.map((subSub) => (
                                      <li key={subSub.id}>
                                        <Link
                                          to={`/categories/${subSub.slug}`}
                                          className="block px-5 py-2 text-sm text-gray-500 hover:bg-gray-50 hover:text-brand-700 transition-colors"
                                        >
                                          {subSub.name}
                                        </Link>
                                      </li>
                                    ))}
                                  </ul>
                                )}
                              </li>
                            ))}
                          </ul>
                        )}
                      </li>
                    ))}
                    <div className="border-t border-gray-100 mt-2 pt-2">
                      <Link to="/products" className="block px-5 py-2.5 text-sm font-bold text-brand-700 hover:bg-gray-50 transition-colors">
                        View All Products →
                      </Link>
                    </div>
                  </ul>
                )}
              </div>

              <Link to="/about" className="text-sm font-semibold text-gray-700 hover:text-brand-800 transition-colors py-2 relative after:absolute after:bottom-0 after:left-0 after:w-0 after:h-0.5 after:bg-accent-600 after:transition-all hover:after:w-full">About</Link>
              <Link to="/faq" className="text-sm font-semibold text-gray-700 hover:text-brand-800 transition-colors py-2 relative after:absolute after:bottom-0 after:left-0 after:w-0 after:h-0.5 after:bg-accent-600 after:transition-all hover:after:w-full">FAQ</Link>
              <Link to="/contact" className="text-sm font-semibold text-gray-700 hover:text-brand-800 transition-colors py-2 relative after:absolute after:bottom-0 after:left-0 after:w-0 after:h-0.5 after:bg-accent-600 after:transition-all hover:after:w-full">Contact</Link>
            </div>

            {/* Right Actions */}
            <div className="flex items-center gap-6">
              {/* Search */}
              <div ref={searchRef} className="relative flex items-center">
                <button onClick={() => setShowSearch(!showSearch)} className="p-2 text-gray-600 hover:text-brand-700 bg-gray-50 hover:bg-gray-100 rounded-full transition-all">
                  <Search className="h-5 w-5" />
                </button>
                
                {showSearch && (
                  <div className="absolute right-0 top-full mt-3 w-[90vw] sm:w-[28rem] max-w-lg bg-white shadow-2xl rounded-2xl border border-gray-100 overflow-hidden z-50 animate-in fade-in zoom-in-95 duration-200">
                    <div className="p-4 border-b border-gray-100 bg-gray-50/50">
                      <div className="relative">
                        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                        <input
                          type="text"
                          className="w-full bg-white border border-gray-200 rounded-xl pl-10 pr-4 py-3 text-sm focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 outline-none transition-all placeholder:text-gray-400"
                          placeholder="Search for products, codes, or categories..."
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                          autoFocus
                        />
                      </div>
                    </div>
                    
                    <div className="max-h-[60vh] overflow-y-auto">
                      {searchQuery.length >= 2 ? (
                        searchResults.length > 0 ? (
                          <ul className="py-2">
                            {searchResults.map((p: any) => (
                              <li key={p.id}>
                                <button
                                  onClick={() => { navigate(`/products/${p.slug}`); setShowSearch(false); setSearchQuery(''); }}
                                  className="w-full text-left px-4 py-3 hover:bg-gray-50 text-sm flex items-start gap-4 transition-colors group"
                                >
                                  <div className="h-12 w-12 bg-white rounded-lg border border-gray-100 flex-shrink-0 flex items-center justify-center p-1.5 shadow-sm group-hover:border-brand-200 transition-colors">
                                    {p.images?.[0]?.thumbPath ? (
                                      <img src={`http://localhost:3000${p.images[0].thumbPath}`} className="h-full w-full object-contain" />
                                    ) : (
                                      <span className="text-gray-300 text-xs">IMG</span>
                                    )}
                                  </div>
                                  <div className="min-w-0 flex-1 pt-0.5">
                                    <div className="flex items-center justify-between gap-2 mb-1">
                                      <p className="font-bold text-gray-900 truncate group-hover:text-brand-700 transition-colors">{p.productName}</p>
                                      {p.category?.name && (
                                        <span className="flex-shrink-0 text-[10px] font-semibold text-brand-600 bg-brand-50 px-2 py-0.5 rounded-full whitespace-nowrap">
                                          {p.category.name}
                                        </span>
                                      )}
                                    </div>
                                    <p className="text-[11px] text-gray-500 uppercase tracking-wider font-medium">Code: {p.productCode}</p>
                                  </div>
                                </button>
                              </li>
                            ))}
                          </ul>
                        ) : (
                          <div className="py-12 text-center">
                            <Search className="mx-auto h-8 w-8 text-gray-200 mb-3" />
                            <p className="text-sm text-gray-500 font-medium">No products found for "{searchQuery}"</p>
                            <p className="text-xs text-gray-400 mt-1">Try checking for typos or using general terms.</p>
                          </div>
                        )
                      ) : (
                        <div className="py-8 text-center bg-white">
                          <p className="text-sm text-gray-400">Type at least 2 characters to search...</p>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* Wishlist */}
              <Link to="/wishlist" className="relative text-gray-600 hover:text-brand-700 transition-colors">
                <Heart className="h-5 w-5" />
                {wishlistItems.length > 0 && (
                  <span className="absolute -top-2 -right-2 h-4 w-4 bg-brand-600 text-white text-[10px] font-bold flex items-center justify-center rounded-full">
                    {wishlistItems.length}
                  </span>
                )}
              </Link>

              {/* Enquiry Cart */}
              <button
                onClick={onEnquiryClick}
                className="relative text-gray-600 hover:text-brand-700 transition-colors"
                title="View Enquiry"
              >
                <ShoppingCart className="h-5 w-5" />
                {enquiryCount > 0 && (
                  <span className="absolute -top-2 -right-2 h-4 w-4 bg-amber-500 text-white text-[10px] font-bold flex items-center justify-center rounded-full">
                    {enquiryCount}
                  </span>
                )}
              </button>

              {/* Get Quote CTA */}
              <button
                onClick={onEnquiryClick}
                className="hidden lg:flex items-center gap-2 bg-accent-600 text-white px-7 py-2.5 rounded-md font-semibold text-sm hover:bg-accent-700 transition-colors shadow-sm ml-2"
              >
                Get a Quote
              </button>

              {/* Mobile menu toggle */}
              <button onClick={() => setMenuOpen(!menuOpen)} className="lg:hidden text-gray-600 hover:text-brand-700">
                {menuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Menu */}
        <div className={`lg:hidden fixed inset-0 top-[72px] md:top-[88px] bg-white z-40 transition-transform duration-300 overflow-y-auto ${menuOpen ? 'translate-x-0' : 'translate-x-full'}`}>
          <div className="px-4 py-6 space-y-4">
            <Link to="/" onClick={() => setMenuOpen(false)} className="block px-4 py-3 text-lg font-bold text-gray-900 border-b border-gray-100">Home</Link>

            <div className="border-b border-gray-100">
              <button
                onClick={() => setMegaOpen(!megaOpen)}
                className="w-full flex items-center justify-between px-4 py-3 text-lg font-bold text-gray-900"
              >
                Products
                <ChevronDown className={`h-5 w-5 transition-transform ${megaOpen ? 'rotate-180' : ''}`} />
              </button>
              {megaOpen && (
                <div className="px-4 pb-4 space-y-2 bg-gray-50 rounded-xl mt-2 p-3">
                  {categories.map(cat => (
                    <Link
                      key={cat.id}
                      to={`/categories/${cat.slug}`}
                      onClick={() => setMenuOpen(false)}
                      className="block px-3 py-2 text-base font-semibold text-gray-700 hover:text-brand-700"
                    >
                      {cat.name}
                    </Link>
                  ))}
                  <Link
                    to="/products"
                    onClick={() => setMenuOpen(false)}
                    className="block px-3 py-2 text-base font-bold text-brand-700 mt-2 border-t border-gray-200 pt-2"
                  >
                    View All Products →
                  </Link>
                </div>
              )}
            </div>

            <Link to="/about" onClick={() => setMenuOpen(false)} className="block px-4 py-3 text-lg font-bold text-gray-900 border-b border-gray-100">About</Link>
            <Link to="/faq" onClick={() => setMenuOpen(false)} className="block px-4 py-3 text-lg font-bold text-gray-900 border-b border-gray-100">FAQ</Link>
            <Link to="/contact" onClick={() => setMenuOpen(false)} className="block px-4 py-3 text-lg font-bold text-gray-900 border-b border-gray-100">Contact</Link>

            <div className="pt-6 px-4">
              <button onClick={() => { setMenuOpen(false); onEnquiryClick?.(); }} className="block w-full text-center bg-accent-600 text-white px-7 py-3.5 rounded-lg font-bold text-lg hover:bg-accent-700 transition-colors shadow-md">
                Get a Quote
              </button>
            </div>
          </div>
        </div>
      </nav>
    </header>
  );
}
