import React from 'react';
import { Phone, Mail, MapPin, Clock, Send } from 'lucide-react';
import toast from 'react-hot-toast';

export default function ContactPage() {
  const handleSubmit = (e: React.FormEvent) => { e.preventDefault(); toast.success('Message sent! We will get back to you soon.'); };

  return (
    <div>
      <section className="bg-gradient-to-br from-brand-900 to-brand-950 text-white py-20">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h1 className="text-4xl font-heading font-bold">Contact Us</h1>
          <p className="mt-4 text-brand-200 text-lg">Get in touch with our sales team for orders, quotes, and inquiries.</p>
        </div>
      </section>
      <section className="max-w-6xl mx-auto px-4 py-16 grid grid-cols-1 lg:grid-cols-2 gap-12">
        <div>
          <h2 className="text-2xl font-heading font-bold text-brand-950 mb-6">Get In Touch</h2>
          <div className="space-y-6">
            {[
              { icon: MapPin, title: 'Factory Address', detail: 'Dhaka-Aricha Highway, Savar, Dhaka, Bangladesh' },
              { icon: Phone, title: 'Phone', detail: '+880-123-456-789' },
              { icon: Mail, title: 'Email', detail: 'info@talukder-upvc.com' },
              { icon: Clock, title: 'Office Hours', detail: 'Saturday - Thursday, 9:00 AM - 6:00 PM' },
            ].map(c => (
              <div key={c.title} className="flex gap-4">
                <div className="h-12 w-12 rounded-xl bg-brand-50 flex items-center justify-center flex-shrink-0"><c.icon className="h-6 w-6 text-brand-600" /></div>
                <div>
                  <p className="font-semibold text-gray-900">{c.title}</p>
                  <p className="text-sm text-gray-500">{c.detail}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
        <div>
          <h2 className="text-2xl font-heading font-bold text-brand-950 mb-6">Send a Message</h2>
          <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-gray-100 p-6 space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div><label className="block text-sm font-medium text-gray-700 mb-1">Name</label><input required className="admin-input" /></div>
              <div><label className="block text-sm font-medium text-gray-700 mb-1">Phone</label><input required className="admin-input" /></div>
            </div>
            <div><label className="block text-sm font-medium text-gray-700 mb-1">Email</label><input required type="email" className="admin-input" /></div>
            <div><label className="block text-sm font-medium text-gray-700 mb-1">Subject</label><input className="admin-input" /></div>
            <div><label className="block text-sm font-medium text-gray-700 mb-1">Message</label><textarea required className="admin-input" rows={4} /></div>
            <button type="submit" className="admin-btn-primary w-full flex items-center justify-center gap-2"><Send className="h-4 w-4" /> Send Message</button>
          </form>
        </div>
      </section>
    </div>
  );
}
