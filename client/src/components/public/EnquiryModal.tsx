import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  X,
  ShoppingCart,
  Trash2,
  Plus,
  Minus,
  Send,
  CheckCircle,
  Package,
  User,
  Mail,
  Phone,
  Building2,
  MapPin,
  MessageSquare,
  Loader2,
} from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../../lib/axios';

interface EnquiryItem {
  id: string;
  name: string;
  code: string;
  size: string;
  quantity: number;
}

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onCountChange?: (count: number) => void;
}

export default function EnquiryModal({ isOpen, onClose, onCountChange }: Props) {
  const [items, setItems] = useState<EnquiryItem[]>([]);
  const [form, setForm] = useState({
    customerName: '',
    email: '',
    phone: '',
    companyName: '',
    address: '',
    district: '',
    deliveryPref: '',
    message: '',
  });
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  // Sync from localStorage when modal opens
  useEffect(() => {
    if (isOpen) {
      const stored = JSON.parse(localStorage.getItem('talukder-enquiry') || '[]');
      setItems(stored);
      setSubmitted(false);
    }
  }, [isOpen]);

  // Notify parent of count changes
  useEffect(() => {
    onCountChange?.(items.length);
  }, [items.length, onCountChange]);

  const syncStorage = (next: EnquiryItem[]) => {
    setItems(next);
    localStorage.setItem('talukder-enquiry', JSON.stringify(next));
    onCountChange?.(next.length);
  };

  const updateQty = (id: string, delta: number) => {
    syncStorage(items.map(i => i.id === id ? { ...i, quantity: Math.max(1, i.quantity + delta) } : i));
  };

  const removeItem = (id: string) => {
    syncStorage(items.filter(i => i.id !== id));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (items.length === 0) {
      toast.error('Add at least one product to your enquiry');
      return;
    }
    setSubmitting(true);
    try {
      await api.post('/enquiries', {
        ...form,
        sourcePage: window.location.href,
        items: items.map(i => ({ productId: i.id, quantity: i.quantity })),
      });
      setSubmitted(true);
      localStorage.removeItem('talukder-enquiry');
      setItems([]);
      onCountChange?.(0);
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Submission failed. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleClose = () => {
    onClose();
    // Reset after animation
    setTimeout(() => {
      if (submitted) {
        setSubmitted(false);
        setForm({ customerName: '', email: '', phone: '', companyName: '', address: '', district: '', deliveryPref: '', message: '' });
      }
    }, 300);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 backdrop-blur-sm"
        onClick={handleClose}
        style={{ animation: 'fadeIn 0.2s ease-out' }}
      />

      {/* Modal */}
      <div
        className="relative bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden"
        style={{ animation: 'modalSlideUp 0.3s ease-out' }}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 bg-gradient-to-r from-brand-600 to-brand-700 text-white">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-xl bg-white/20 flex items-center justify-center">
              <ShoppingCart className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-lg font-heading font-bold">
                {submitted ? 'Enquiry Submitted!' : 'Contact Details'}
              </h2>
              {!submitted && (
                <p className="text-xs text-brand-100">
                  {items.length} product{items.length !== 1 ? 's' : ''} selected
                </p>
              )}
            </div>
          </div>
          <button
            onClick={handleClose}
            className="p-2 rounded-lg hover:bg-white/20 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto">
          {submitted ? (
            /* ─── Success State ────────────────────── */
            <div className="py-16 px-6 text-center">
              <div className="h-20 w-20 mx-auto rounded-full bg-emerald-100 flex items-center justify-center mb-6">
                <CheckCircle className="h-10 w-10 text-emerald-600" />
              </div>
              <h3 className="text-2xl font-heading font-bold text-gray-900">Thank You!</h3>
              <p className="text-gray-500 mt-3 max-w-sm mx-auto leading-relaxed">
                Your enquiry has been submitted successfully. Our sales team will contact you within 24 hours.
              </p>
              <div className="mt-8 flex items-center justify-center gap-3">
                <button onClick={handleClose} className="admin-btn-secondary">
                  Close
                </button>
                <Link
                  to="/products"
                  onClick={handleClose}
                  className="admin-btn-primary flex items-center gap-2"
                >
                  Continue Browsing
                </Link>
              </div>
            </div>
          ) : (
            /* ─── Form Step ────────────────────────── */
            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              {items.length === 0 ? (
                <div className="py-6 text-center">
                  <Package className="h-12 w-12 text-gray-200 mx-auto mb-2" />
                  <p className="text-sm text-gray-500">No products selected.</p>
                </div>
              ) : (
                <div className="bg-gray-50 rounded-xl p-4 border border-gray-100 space-y-3">
                  <h3 className="text-sm font-semibold text-gray-900 mb-2">Selected Products</h3>
                  {items.map(item => (
                    <div key={item.id} className="flex items-center gap-4 bg-white rounded-lg p-3 border border-gray-100 shadow-sm">
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-gray-900 text-sm truncate">{item.name}</p>
                        <p className="text-xs text-gray-400 mt-0.5">{item.code} · Size: {item.size}</p>
                      </div>
                      <div className="flex items-center gap-1">
                        <button type="button" onClick={() => updateQty(item.id, -1)} className="h-6 w-6 rounded border border-gray-300 flex items-center justify-center hover:bg-gray-50">
                          <Minus className="h-3 w-3" />
                        </button>
                        <span className="w-6 text-center text-sm font-bold">{item.quantity}</span>
                        <button type="button" onClick={() => updateQty(item.id, 1)} className="h-6 w-6 rounded border border-gray-300 flex items-center justify-center hover:bg-gray-50">
                          <Plus className="h-3 w-3" />
                        </button>
                      </div>
                      <button type="button" onClick={() => removeItem(item.id)} className="p-1 text-gray-400 hover:text-red-500">
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                <div className="sm:col-span-2">
                  <label className="flex items-center gap-1.5 text-sm font-medium text-gray-700 mb-1.5">
                    <User className="h-3.5 w-3.5 text-gray-400" />
                    Full Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    required
                    type="text"
                    className="admin-input"
                    placeholder="Enter your full name"
                    value={form.customerName}
                    onChange={e => setForm({ ...form, customerName: e.target.value })}
                  />
                </div>

                <div>
                  <label className="flex items-center gap-1.5 text-sm font-medium text-gray-700 mb-1.5">
                    <Mail className="h-3.5 w-3.5 text-gray-400" />
                    Email <span className="text-red-500">*</span>
                  </label>
                  <input
                    required
                    type="email"
                    className="admin-input"
                    placeholder="your@email.com"
                    value={form.email}
                    onChange={e => setForm({ ...form, email: e.target.value })}
                  />
                </div>

                <div>
                  <label className="flex items-center gap-1.5 text-sm font-medium text-gray-700 mb-1.5">
                    <Phone className="h-3.5 w-3.5 text-gray-400" />
                    Phone <span className="text-red-500">*</span>
                  </label>
                  <input
                    required
                    type="tel"
                    className="admin-input"
                    placeholder="+880-XXX-XXX-XXXX"
                    value={form.phone}
                    onChange={e => setForm({ ...form, phone: e.target.value })}
                  />
                </div>

                <div>
                  <label className="flex items-center gap-1.5 text-sm font-medium text-gray-700 mb-1.5">
                    <Building2 className="h-3.5 w-3.5 text-gray-400" />
                    Company
                  </label>
                  <input
                    type="text"
                    className="admin-input"
                    placeholder="Company name (optional)"
                    value={form.companyName}
                    onChange={e => setForm({ ...form, companyName: e.target.value })}
                  />
                </div>

                <div>
                  <label className="flex items-center gap-1.5 text-sm font-medium text-gray-700 mb-1.5">
                    <MapPin className="h-3.5 w-3.5 text-gray-400" />
                    District
                  </label>
                  <input
                    type="text"
                    className="admin-input"
                    placeholder="Your district"
                    value={form.district}
                    onChange={e => setForm({ ...form, district: e.target.value })}
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="flex items-center gap-1.5 text-sm font-medium text-gray-700 mb-1.5">
                    <MapPin className="h-3.5 w-3.5 text-gray-400" />
                    Address
                  </label>
                  <input
                    type="text"
                    className="admin-input"
                    placeholder="Full address (optional)"
                    value={form.address}
                    onChange={e => setForm({ ...form, address: e.target.value })}
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="flex items-center gap-1.5 text-sm font-medium text-gray-700 mb-1.5">
                    <MessageSquare className="h-3.5 w-3.5 text-gray-400" />
                    Message
                  </label>
                  <textarea
                    className="admin-input resize-y"
                    rows={3}
                    placeholder="Any specific requirements, quantities, or questions..."
                    value={form.message}
                    onChange={e => setForm({ ...form, message: e.target.value })}
                  />
                </div>
              </div>

              {/* Submit */}
              <div className="pt-4 border-t border-gray-100">
                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full admin-btn-primary flex items-center justify-center gap-2 py-3 text-base disabled:opacity-60"
                >
                  {submitting ? (
                    <>
                      <Loader2 className="h-5 w-5 animate-spin" />
                      Submitting...
                    </>
                  ) : (
                    <>
                      <Send className="h-5 w-5" />
                      Submit Enquiry
                    </>
                  )}
                </button>
                <p className="text-xs text-gray-400 text-center mt-3">
                  Our sales team will contact you within 24 hours
                </p>
              </div>
            </form>
          )}
        </div>
      </div>

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes modalSlideUp {
          from { opacity: 0; transform: translateY(20px) scale(0.97); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }
      `}</style>
    </div>
  );
}

// Small icon component for use in the header
function ChevronRight(props: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={props.className}>
      <path d="m9 18 6-6-6-6" />
    </svg>
  );
}
