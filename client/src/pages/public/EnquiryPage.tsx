import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ShoppingCart, Trash2, Plus, Minus, Send, CheckCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../../lib/axios';

export default function EnquiryPage() {
  const [items, setItems] = useState<any[]>(() => JSON.parse(localStorage.getItem('talukder-enquiry') || '[]'));
  const [form, setForm] = useState({ customerName: '', email: '', phone: '', companyName: '', address: '', district: '', message: '' });
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const updateQty = (id: string, delta: number) => {
    const next = items.map(i => i.id === id ? { ...i, quantity: Math.max(1, i.quantity + delta) } : i);
    setItems(next);
    localStorage.setItem('talukder-enquiry', JSON.stringify(next));
  };

  const remove = (id: string) => {
    const next = items.filter(i => i.id !== id);
    setItems(next);
    localStorage.setItem('talukder-enquiry', JSON.stringify(next));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (items.length === 0) { toast.error('Add products to your enquiry'); return; }
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
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Submission failed');
    } finally {
      setSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-20 text-center">
        <CheckCircle className="mx-auto h-16 w-16 text-green-500" />
        <h1 className="text-3xl font-heading font-bold text-brand-950 mt-6">Enquiry Submitted!</h1>
        <p className="mt-3 text-gray-500">Thank you for your interest. Our sales team will contact you within 24 hours.</p>
        <Link to="/products" className="mt-8 inline-block admin-btn-primary">Continue Browsing</Link>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 py-12">
      <h1 className="text-3xl font-heading font-bold text-brand-950 flex items-center gap-3">
        <ShoppingCart className="h-8 w-8 text-brand-600" /> Enquiry / Quote Request
      </h1>
      <p className="text-gray-500 mt-2">Review your selected products and submit your enquiry for a quote.</p>

      <div className="mt-8 grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Products List */}
        <div className="lg:col-span-2">
          <h2 className="font-heading font-semibold text-gray-900 mb-4">Selected Products ({items.length})</h2>
          {items.length === 0 ? (
            <div className="py-12 text-center bg-white rounded-xl border border-gray-100">
              <p className="text-gray-400">No products selected. <Link to="/products" className="text-brand-600 hover:underline">Browse catalog</Link></p>
            </div>
          ) : (
            <div className="space-y-3">
              {items.map((item: any) => (
                <div key={item.id} className="flex items-center gap-4 bg-white rounded-xl border border-gray-100 p-4">
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-gray-900 text-sm">{item.name}</p>
                    <p className="text-xs text-gray-400">{item.code} · {item.size}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button onClick={() => updateQty(item.id, -1)} className="h-8 w-8 rounded-lg border flex items-center justify-center hover:bg-gray-50"><Minus className="h-3 w-3" /></button>
                    <span className="w-8 text-center text-sm font-semibold">{item.quantity}</span>
                    <button onClick={() => updateQty(item.id, 1)} className="h-8 w-8 rounded-lg border flex items-center justify-center hover:bg-gray-50"><Plus className="h-3 w-3" /></button>
                  </div>
                  <button onClick={() => remove(item.id)} className="p-2 text-red-400 hover:text-red-600"><Trash2 className="h-4 w-4" /></button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Contact Form */}
        <div>
          <h2 className="font-heading font-semibold text-gray-900 mb-4">Your Details</h2>
          <form onSubmit={handleSubmit} className="bg-white rounded-xl border border-gray-100 p-6 space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Full Name *</label>
              <input required type="text" className="admin-input" value={form.customerName} onChange={e => setForm({ ...form, customerName: e.target.value })} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email *</label>
              <input required type="email" className="admin-input" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Phone *</label>
              <input required type="tel" className="admin-input" value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Company</label>
              <input type="text" className="admin-input" value={form.companyName} onChange={e => setForm({ ...form, companyName: e.target.value })} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">District</label>
              <input type="text" className="admin-input" value={form.district} onChange={e => setForm({ ...form, district: e.target.value })} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Message</label>
              <textarea className="admin-input" rows={3} value={form.message} onChange={e => setForm({ ...form, message: e.target.value })} />
            </div>
            <button type="submit" disabled={submitting || items.length === 0} className="admin-btn-primary w-full flex items-center justify-center gap-2">
              <Send className="h-4 w-4" /> {submitting ? 'Submitting...' : 'Submit Enquiry'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
