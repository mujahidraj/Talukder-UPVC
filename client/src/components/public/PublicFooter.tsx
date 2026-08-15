import React from 'react';
import { Link } from 'react-router-dom';
import { Phone, Mail, MapPin, Globe, MessageSquare, MonitorPlay } from 'lucide-react';

export default function PublicFooter() {
  return (
    <>
      {/* Mega Footer */}
      <footer className="bg-brand-950 text-brand-200">
        <div className="max-w-7xl mx-auto px-4 py-16">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
            {/* Company Info */}
            <div>
              <div className="flex items-center gap-3 mb-4">
                <img src="/LOGO/Talukder-uPVC-Fittings-LTD-4.png" alt="Talukder uPVC Fittings Ltd." className="h-10 w-auto object-contain" />
                <div>
                  <h3 className="font-heading font-bold text-lg"><span className="text-accent-400">Talukder uPVC</span></h3>
                  <p className="text-xs text-brand-300">Fittings Ltd.</p>
                </div>
              </div>
              <p className="text-sm leading-relaxed text-brand-300">
                A concern of Talukder Group of Industries. Leading manufacturer of uPVC pipes and fittings in Bangladesh since establishment.
              </p>
              <div className="flex gap-4 mt-6">
                <a href="#" className="w-10 h-10 rounded-full bg-brand-800 flex items-center justify-center hover:bg-brand-600 transition-colors">
                  <Globe className="w-5 h-5 text-white" />
                </a>
                <a href="#" className="w-10 h-10 rounded-full bg-brand-800 flex items-center justify-center hover:bg-brand-600 transition-colors">
                  <MessageSquare className="w-5 h-5 text-white" />
                </a>
                <a href="#" className="w-10 h-10 rounded-full bg-brand-800 flex items-center justify-center hover:bg-brand-600 transition-colors">
                  <MonitorPlay className="w-5 h-5 text-white" />
                </a>
              </div>
            </div>

            {/* Quick Links */}
            <div>
              <h4 className="text-white font-heading font-semibold mb-4">Quick Links</h4>
              <ul className="space-y-2.5">
                {[
                  { to: '/products', label: 'Browse Products' },
                  { to: '/about', label: 'About Us' },
                  { to: '/certifications', label: 'Certifications' },
                  { to: '/factory', label: 'Factory Tour' },
                  { to: '/downloads', label: 'Downloads' },
                  { to: '/faq', label: 'FAQ' },
                ].map((link) => (
                  <li key={link.to}>
                    <Link to={link.to} className="text-sm text-brand-300 hover:text-white transition-colors hover:pl-1 duration-200">
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Product Categories */}
            <div>
              <h4 className="text-white font-heading font-semibold mb-4">Product Categories</h4>
              <ul className="space-y-2.5">
                {['uPVC Pressure Pipes', 'uPVC Fittings', 'SWR Pipes & Fittings', 'Casing Pipes', 'Electrical Conduit'].map((cat) => (
                  <li key={cat}>
                    <Link to="/products" className="text-sm text-brand-300 hover:text-white transition-colors hover:pl-1 duration-200">
                      {cat}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Contact Info */}
            <div>
              <h4 className="text-white font-heading font-semibold mb-4">Contact Us</h4>
              <ul className="space-y-4">
                <li className="flex items-start gap-3 text-sm">
                  <MapPin className="h-5 w-5 text-accent-400 flex-shrink-0 mt-0.5" />
                  <span className="text-brand-300">Factory: Baniargati, Bashundia, Jashore, Bangladesh</span>
                </li>
                <li className="flex items-center gap-3 text-sm">
                  <Phone className="h-5 w-5 text-accent-400 flex-shrink-0" />
                  <a href="tel:+8801966333355" className="text-brand-300 hover:text-white transition-colors">+880 1966-333355</a>
                </li>
                <li className="flex items-center gap-3 text-sm">
                  <Mail className="h-5 w-5 text-accent-400 flex-shrink-0" />
                  <a href="mailto:info@talukder-group.com.bd" className="text-brand-300 hover:text-white transition-colors">info@talukder-group.com.bd</a>
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-brand-800">
          <div className="max-w-7xl mx-auto px-4 py-4 flex flex-col sm:flex-row items-center justify-between gap-2">
            <p className="text-xs text-brand-400">
              © {new Date().getFullYear()} <span className="text-accent-400">Talukder uPVC</span> Fittings Ltd. All rights reserved.
            </p>
            <div className="flex gap-4 text-xs text-brand-400">
              <Link to="/privacy-policy" className="hover:text-white transition-colors">Privacy Policy</Link>
              <Link to="/terms-conditions" className="hover:text-white transition-colors">Terms of Use</Link>
            </div>
          </div>
        </div>
      </footer>

      {/* WhatsApp Floating Button */}
      <a
        href="https://wa.me/8801966333355"
        target="_blank"
        rel="noopener noreferrer"
        className="fixed bottom-6 right-6 z-50 h-14 w-14 bg-green-500 rounded-full flex items-center justify-center shadow-lg hover:bg-green-600 transition-colors hover:scale-110 duration-200"
        title="Chat on WhatsApp"
      >
        <svg viewBox="0 0 24 24" className="h-7 w-7 text-white fill-current">
          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
        </svg>
      </a>
    </>
  );
}
