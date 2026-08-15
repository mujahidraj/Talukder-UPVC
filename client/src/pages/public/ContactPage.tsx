import React from 'react';
import { Phone, Mail, MapPin, Send, MessageSquare } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../../lib/axios';
import SEO from '../../components/SEO';

export default function ContactPage() {
  const [form, setForm] = React.useState({ name: '', phone: '', email: '', subject: '', message: '' });
  const [submitting, setSubmitting] = React.useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await api.post('/enquiries', {
        customerName: form.name,
        phone: form.phone,
        email: form.email,
        message: `${form.subject ? `Subject: ${form.subject}\n\n` : ''}${form.message}`,
        sourcePage: 'Contact Page',
        items: []
      });
      toast.success('Message sent successfully! Our team will contact you soon.');
      setForm({ name: '', phone: '', email: '', subject: '', message: '' });
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to send message');
    } finally {
      setSubmitting(false);
    }
  };

  const contactMethods = [
    { 
      icon: MapPin, 
      title: 'Factory Location', 
      detail: 'Baniargati, Bashundia',
      subDetail: 'Jashore, Bangladesh',
      action: 'Visit us'
    },
    { 
      icon: Phone, 
      title: 'Phone Number', 
      detail: '+880 1966-333355',
      subDetail: 'Sat-Thu, 9AM-6PM',
      action: 'Call now',
      href: 'tel:+8801966333355'
    },
    { 
      icon: Mail, 
      title: 'Email Address', 
      detail: 'info@talukder-group.com.bd',
      subDetail: 'Online support 24/7',
      action: 'Send an email',
      href: 'mailto:info@talukder-group.com.bd'
    }
  ];

  return (
    <div className="bg-slate-50 min-h-screen">
      <SEO 
        title="Contact Us" 
        description="Get in touch with Talukder uPVC Fittings Ltd. Contact our sales team for orders, quotes, and inquiries." 
        canonical="/contact" 
      />

      {/* Hero Section */}
      <section className="relative bg-brand-950 text-white pt-24 pb-36 overflow-hidden">
        {/* Decorative background elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-1/2 -right-1/4 w-[1000px] h-[1000px] rounded-full bg-brand-900/40 blur-3xl mix-blend-screen"></div>
          <div className="absolute -bottom-1/2 -left-1/4 w-[800px] h-[800px] rounded-full bg-accent-900/20 blur-3xl mix-blend-screen"></div>
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-heading font-bold mb-6 drop-shadow-md text-white">
            Get in <span className="text-accent-500">Touch</span>
          </h1>
          <p className="mt-4 text-white text-lg md:text-xl max-w-2xl mx-auto leading-relaxed">
            Have questions about our uPVC products? Looking for a custom quote? Our dedicated team is ready to help you find the right solution.
          </p>
        </div>
      </section>

      {/* Contact Cards - Overlapping Hero */}
      <section className="relative z-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-20 mb-20">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
          {contactMethods.map((method, idx) => (
            <div key={idx} className="bg-white rounded-2xl shadow-xl shadow-slate-200/50 p-8 border border-slate-100 hover:-translate-y-2 transition-transform duration-300 group">
              <div className="h-14 w-14 rounded-2xl bg-brand-50 flex items-center justify-center mb-6 group-hover:bg-accent-50 transition-colors">
                <method.icon className="h-7 w-7 text-brand-600 group-hover:text-accent-600 transition-colors" />
              </div>
              <h3 className="text-xl font-heading font-bold text-gray-900 mb-2">{method.title}</h3>
              <p className="text-gray-900 font-medium text-lg">{method.detail}</p>
              <p className="text-slate-500 mt-1 mb-6">{method.subDetail}</p>
              
              {method.href ? (
                <a href={method.href} className="inline-flex items-center gap-2 text-brand-600 font-semibold hover:text-accent-600 transition-colors">
                  {method.action} <span className="text-xl leading-none">&rarr;</span>
                </a>
              ) : (
                <span className="inline-flex items-center gap-2 text-slate-400 font-semibold">
                  {method.action}
                </span>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* Main Content Area: Map & Form */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-24">
        <div className="bg-white rounded-3xl shadow-xl shadow-slate-200/50 border border-slate-100 overflow-hidden flex flex-col lg:flex-row">
          
          {/* Left Side: Map */}
          <div className="lg:w-5/12 bg-slate-200 relative min-h-[400px] lg:min-h-[auto]">
            <iframe 
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d117367.66874837568!2d89.26388414999999!3d23.18683525!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x39ff10577d4c8b6b%3A0xf62a4b8686f7de1b!2sJashore!5e0!3m2!1sen!2sbd!4v1700000000000!5m2!1sen!2sbd" 
              className="absolute inset-0 w-full h-full border-0"
              allowFullScreen={false}
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              title="Factory Location"
            ></iframe>
            {/* Map overlay content */}
            <div className="absolute inset-0 bg-brand-950/20 pointer-events-none"></div>
          </div>

          {/* Right Side: Form */}
          <div className="lg:w-7/12 p-8 md:p-12 lg:p-16">
            <div className="flex items-center gap-3 mb-8">
              <div className="h-10 w-10 rounded-full bg-accent-100 flex items-center justify-center">
                <MessageSquare className="h-5 w-5 text-accent-600" />
              </div>
              <h2 className="text-3xl font-heading font-bold text-gray-900">Send us a Message</h2>
            </div>
            
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-gray-700">Full Name *</label>
                  <input 
                    required 
                    placeholder="John Doe"
                    className="w-full bg-slate-50 border border-slate-200 text-gray-900 px-4 py-3 rounded-xl focus:ring-2 focus:ring-accent-500/20 focus:border-accent-500 transition-all outline-none" 
                    value={form.name} 
                    onChange={e => setForm({...form, name: e.target.value})} 
                  />
                </div>
                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-gray-700">Phone Number *</label>
                  <input 
                    required 
                    placeholder="+880 1..."
                    className="w-full bg-slate-50 border border-slate-200 text-gray-900 px-4 py-3 rounded-xl focus:ring-2 focus:ring-accent-500/20 focus:border-accent-500 transition-all outline-none" 
                    value={form.phone} 
                    onChange={e => setForm({...form, phone: e.target.value})} 
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-gray-700">Email Address *</label>
                  <input 
                    required 
                    type="email" 
                    placeholder="john@example.com"
                    className="w-full bg-slate-50 border border-slate-200 text-gray-900 px-4 py-3 rounded-xl focus:ring-2 focus:ring-accent-500/20 focus:border-accent-500 transition-all outline-none" 
                    value={form.email} 
                    onChange={e => setForm({...form, email: e.target.value})} 
                  />
                </div>
                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-gray-700">Subject</label>
                  <input 
                    placeholder="How can we help?"
                    className="w-full bg-slate-50 border border-slate-200 text-gray-900 px-4 py-3 rounded-xl focus:ring-2 focus:ring-accent-500/20 focus:border-accent-500 transition-all outline-none" 
                    value={form.subject} 
                    onChange={e => setForm({...form, subject: e.target.value})} 
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-semibold text-gray-700">Your Message *</label>
                <textarea 
                  required 
                  placeholder="Tell us about your requirements..."
                  className="w-full bg-slate-50 border border-slate-200 text-gray-900 px-4 py-3 rounded-xl focus:ring-2 focus:ring-accent-500/20 focus:border-accent-500 transition-all outline-none resize-none" 
                  rows={5} 
                  value={form.message} 
                  onChange={e => setForm({...form, message: e.target.value})} 
                />
              </div>

              <button 
                type="submit" 
                disabled={submitting} 
                className="w-full sm:w-auto px-8 py-4 bg-accent-600 hover:bg-accent-700 text-white font-bold rounded-xl transition-all duration-300 flex items-center justify-center gap-3 shadow-lg shadow-accent-600/30 disabled:opacity-70 disabled:cursor-not-allowed hover:-translate-y-1"
              >
                {submitting ? 'Sending Message...' : 'Send Message'} 
                <Send className="h-5 w-5" />
              </button>
            </form>
          </div>
        </div>
      </section>
    </div>
  );
}
