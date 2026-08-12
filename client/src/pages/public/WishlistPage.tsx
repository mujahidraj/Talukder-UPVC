import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Heart, Trash2, ShoppingCart } from 'lucide-react';
import toast from 'react-hot-toast';

export default function WishlistPage() {
  const [items, setItems] = useState<any[]>(() => {
    try {
      const data = JSON.parse(localStorage.getItem('talukder-wishlist') || '[]');
      return Array.isArray(data) ? data : [];
    } catch {
      return [];
    }
  });

  const remove = (id: string) => {
    const next = items.filter(i => i.id !== id);
    setItems(next);
    localStorage.setItem('talukder-wishlist', JSON.stringify(next));
    toast.success('Removed from wishlist');
  };

  const moveToEnquiry = (item: any) => {
    let enq = [];
    try {
      const parsed = JSON.parse(localStorage.getItem('talukder-enquiry') || '[]');
      enq = Array.isArray(parsed) ? parsed : [];
    } catch {}
    
    if (!enq.find((e: any) => e.id === item.id)) {
      enq.push({ id: item.id, name: item.name, code: item.code, size: item.size, quantity: 1 });
      localStorage.setItem('talukder-enquiry', JSON.stringify(enq));
    }
    remove(item.id);
    toast.success('Moved to enquiry list');
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <h1 className="text-3xl font-heading font-bold text-brand-950 flex items-center gap-3">
        <Heart className="h-8 w-8 text-red-500" /> My Wishlist
      </h1>
      <p className="text-gray-500 mt-2">Products you're interested in. Move them to an enquiry to request pricing.</p>

      {items.length === 0 ? (
        <div className="py-20 text-center">
          <Heart className="mx-auto h-16 w-16 text-gray-200" />
          <p className="mt-4 text-gray-500">Your wishlist is empty.</p>
          <Link to="/products" className="mt-4 inline-block admin-btn-primary">Browse Products</Link>
        </div>
      ) : (
        <div className="mt-8 space-y-3">
          {items.map((item: any) => (
            <div key={item.id} className="flex items-center justify-between bg-white rounded-xl border border-gray-100 p-4 hover:shadow-sm transition-shadow">
              <Link to={`/products/${item.slug}`} className="flex-1 min-w-0">
                <p className="font-semibold text-gray-900 text-sm">{item.name}</p>
                <p className="text-xs text-gray-400">{item.code} · {item.size}</p>
              </Link>
              <div className="flex items-center gap-2 ml-4">
                <button onClick={() => moveToEnquiry(item)} className="p-2 text-brand-600 hover:bg-brand-50 rounded-lg transition-colors" title="Move to enquiry">
                  <ShoppingCart className="h-4 w-4" />
                </button>
                <button onClick={() => remove(item.id)} className="p-2 text-red-400 hover:bg-red-50 rounded-lg transition-colors" title="Remove">
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
