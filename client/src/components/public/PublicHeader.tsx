import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Search, Heart, Phone, Mail, Menu, X, ChevronDown, ArrowRight } from 'lucide-react';
import api from '../../lib/axios';

interface Category {
  id: string;
  name: string;
  slug: string;
  children: Category[];
  _count: { products: number };
}

export default function PublicHeader() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [megaOpen, setMegaOpen] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [showSearch, setShowSearch] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  useEffect(() => {
    api.get('/categories/tree').then(res => setCategories(res.data)).catch(() => {});
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

  const wishlistItems = JSON.parse(localStorage.getItem('talukder-wishlist') || '[]');

  return (
    <header className="sticky top-0 z-50">
      {/* Top Bar */}
      <div className="bg-brand-950 text-brand-200 text-xs py-2 hidden md:block">
        <div className="max-w-7xl mx-auto px-4 flex items-center justify-between">
          <div className="flex items-center gap-6">
            <a href="tel:+880123456789" className="flex items-center gap-1.5 hover:text-white transition-colors">
              <Phone className="h-3 w-3" /> +880-123-456-789
            </a>
            <a href="mailto:info@talukder-upvc.com" className="flex items-center gap-1.5 hover:text-white transition-colors">
              <Mail className="h-3 w-3" /> info@talukder-upvc.com
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
              <div className="h-10 w-10 bg-brand-700 flex items-center justify-center shadow-sm">
                <span className="text-white text-2xl font-heading font-bold">T</span>
              </div>
              <div className="hidden sm:block">
                <span className="text-xl font-heading font-bold text-gray-900 tracking-tight">Talukder uPVC</span>
                <p className="text-[10px] text-gray-500 uppercase tracking-widest font-semibold mt-0.5">Fittings Industries Ltd.</p>
              </div>
            </Link>

            {/* Desktop Nav Links */}
            <div className="hidden lg:flex items-center gap-8">
              <Link to="/" className="text-sm font-semibold text-gray-700 hover:text-brand-700 transition-colors py-2 relative after:absolute after:bottom-0 after:left-0 after:w-0 after:h-0.5 after:bg-brand-600 after:transition-all hover:after:w-full">
                Home
              </Link>

              {/* Products Mega Menu */}
              <div
                className="relative h-full flex items-center"
                onMouseEnter={() => setMegaOpen(true)}
                onMouseLeave={() => setMegaOpen(false)}
              >
                <button className="text-sm font-semibold text-gray-700 hover:text-brand-700 transition-colors py-2 flex items-center gap-1.5 relative after:absolute after:bottom-0 after:left-0 after:w-0 after:h-0.5 after:bg-brand-600 after:transition-all hover:after:w-full">
                  Products <ChevronDown className={`h-3 w-3 transition-transform duration-200 ${megaOpen ? 'rotate-180' : ''}`} />
                </button>

                {megaOpen && (
                  <div className="absolute top-full left-1/2 -translate-x-1/2 mt-0 w-[800px] bg-white shadow-xl border border-gray-100 p-8 grid grid-cols-4 gap-8 z-50 animate-in fade-in slide-in-from-top-2 duration-200">
                    {categories.map((cat) => (
                      <div key={cat.id}>
                        <Link
                          to={`/categories/${cat.slug}`}
                          className="text-sm font-heading font-bold text-gray-900 hover:text-brand-600 transition-colors block border-b border-gray-100 pb-2 mb-3"
                        >
                          {cat.name}
                        </Link>
                        <ul className="space-y-2.5">
                          {cat.children?.slice(0, 6).map((sub) => (
                            <li key={sub.id}>
                              <Link
                                to={`/categories/${sub.slug}`}
                                className="text-sm text-gray-500 hover:text-brand-600 transition-colors flex items-center gap-2"
                              >
                                <span className="w-1 h-1 bg-gray-300 rounded-full"></span>
                                {sub.name}
                              </Link>
                            </li>
                          ))}
                        </ul>
                      </div>
                    ))}
                    <div className="col-span-4 mt-4 pt-6 border-t border-gray-100 flex justify-end">
                      <Link to="/products" className="text-sm font-semibold text-brand-600 hover:text-brand-800 flex items-center gap-1">
                        View All Products <ArrowRight className="h-4 w-4" />
                      </Link>
                    </div>
                  </div>
                )}
              </div>

              <Link to="/about" className="text-sm font-semibold text-gray-700 hover:text-brand-700 transition-colors py-2 relative after:absolute after:bottom-0 after:left-0 after:w-0 after:h-0.5 after:bg-brand-600 after:transition-all hover:after:w-full">About</Link>
              <Link to="/faq" className="text-sm font-semibold text-gray-700 hover:text-brand-700 transition-colors py-2 relative after:absolute after:bottom-0 after:left-0 after:w-0 after:h-0.5 after:bg-brand-600 after:transition-all hover:after:w-full">FAQ</Link>
              <Link to="/contact" className="text-sm font-semibold text-gray-700 hover:text-brand-700 transition-colors py-2 relative after:absolute after:bottom-0 after:left-0 after:w-0 after:h-0.5 after:bg-brand-600 after:transition-all hover:after:w-full">Contact</Link>
            </div>

            {/* Right Actions */}
            <div className="flex items-center gap-6">
              {/* Search */}
              <div ref={searchRef} className="relative">
                <button onClick={() => setShowSearch(!showSearch)} className="text-gray-600 hover:text-brand-700 transition-colors">
                  <Search className="h-5 w-5" />
                </button>
                {showSearch && (
                  <div className="absolute right-0 mt-4 w-80 bg-white shadow-xl border border-gray-100 p-4 z-50">
                    <input
                      type="text"
                      className="w-full border border-gray-200 px-4 py-2.5 text-sm focus:ring-1 focus:ring-brand-600 focus:border-brand-600 outline-none"
                      placeholder="Search products..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      autoFocus
                    />
                    {searchResults.length > 0 && (
                      <ul className="mt-4 max-h-64 overflow-y-auto divide-y divide-gray-100 border-t border-gray-100">
                        {searchResults.map((p: any) => (
                          <li key={p.id}>
                            <button
                              onClick={() => { navigate(`/products/${p.slug}`); setShowSearch(false); setSearchQuery(''); }}
                              className="w-full text-left py-3 hover:bg-gray-50 text-sm flex items-center gap-4 transition-colors px-2"
                            >
                              <div className="h-10 w-10 bg-white border border-gray-100 flex-shrink-0 flex items-center justify-center p-1">
                                {p.images?.[0]?.thumbPath ? (
                                  <img src={`http://localhost:3000${p.images[0].thumbPath}`} className="h-full w-full object-contain" />
                                ) : (
                                  <span className="text-gray-300 text-xs">IMG</span>
                                )}
                              </div>
                              <div className="min-w-0">
                                <p className="font-semibold text-gray-900 truncate">{p.productName}</p>
                                <p className="text-[11px] text-gray-500 mt-0.5 uppercase tracking-wide">{p.productCode}</p>
                              </div>
                            </button>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                )}
              </div>

              {/* Wishlist */}
              <Link to="/wishlist" className="relative text-gray-600 hover:text-brand-700 transition-colors">
                <Heart className="h-5 w-5" />
                {wishlistItems.length > 0 && (
                  <span className="absolute -top-2 -right-2 h-4 w-4 bg-brand-600 text-white text-[10px] font-bold flex items-center justify-center">
                    {wishlistItems.length}
                  </span>
                )}
              </Link>

              {/* Get Quote CTA */}
              <Link to="/contact" className="hidden lg:flex items-center gap-2 bg-brand-700 text-white px-7 py-2.5 font-semibold text-sm hover:bg-brand-800 transition-colors shadow-sm ml-2">
                Get a Quote
              </Link>

              {/* Mobile menu toggle */}
              <button onClick={() => setMenuOpen(!menuOpen)} className="lg:hidden text-gray-600 hover:text-brand-700">
                {menuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Menu */}
        {menuOpen && (
          <div className="lg:hidden border-t border-gray-100 bg-white pb-4">
            <div className="px-4 pt-2 space-y-1">
              <Link to="/" onClick={() => setMenuOpen(false)} className="block px-3 py-2 text-sm font-medium text-gray-700 hover:bg-brand-50 rounded-lg">Home</Link>
              <Link to="/products" onClick={() => setMenuOpen(false)} className="block px-3 py-2 text-sm font-medium text-gray-700 hover:bg-brand-50 rounded-lg">Products</Link>
              <Link to="/about" onClick={() => setMenuOpen(false)} className="block px-3 py-2 text-sm font-medium text-gray-700 hover:bg-brand-50 rounded-lg">About</Link>
              <Link to="/contact" onClick={() => setMenuOpen(false)} className="block px-3 py-2 text-sm font-medium text-gray-700 hover:bg-brand-50 rounded-lg">Contact</Link>
              <Link to="/faq" onClick={() => setMenuOpen(false)} className="block px-3 py-2 text-sm font-medium text-gray-700 hover:bg-brand-50 rounded-lg">FAQ</Link>
            </div>
          </div>
        )}
      </nav>
    </header>
  );
}
