import React, { useEffect, useState } from 'react';
import { HelpCircle, ChevronDown, ChevronUp } from 'lucide-react';
import api from '../../lib/axios';
import SEO from '../../components/SEO';
import { faqJsonLd } from '../../lib/jsonLd';

export default function FaqPage() {
  const [faqs, setFaqs] = useState<any[]>([]);
  const [openId, setOpenId] = useState<string | null>(null);

  useEffect(() => { api.get('/cms/faqs').then(r => setFaqs(r.data)).catch(() => { }); }, []);

  return (
    <div>
      <SEO
        title="Frequently Asked Questions"
        description="Find answers to commonly asked questions about Talukder uPVC products, standards, and services."
        canonical="/faq"
        jsonLd={faqs.length > 0 ? faqJsonLd(faqs) : undefined}
      />
      <section className="bg-gradient-to-br from-brand-900 to-brand-950 text-white py-20">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h1 className="text-4xl font-heading font-bold text-white">Frequently Asked Questions</h1>
          <p className="mt-4 text-brand-200 text-lg">Everything you need to know about our products and services.</p>
        </div>
      </section>
      <section className="max-w-3xl mx-auto px-4 py-16">
        <div className="space-y-3">
          {faqs.map((faq: any) => (
            <div key={faq.id} className="bg-white rounded-xl border border-gray-100 overflow-hidden hover:border-brand-200 transition-colors">
              <button
                onClick={() => setOpenId(openId === faq.id ? null : faq.id)}
                className="w-full flex items-center justify-between px-6 py-5 text-left"
              >
                <span className="font-semibold text-gray-900 pr-4">{faq.question}</span>
                {openId === faq.id ? <ChevronUp className="h-5 w-5 text-accent-600 flex-shrink-0" /> : <ChevronDown className="h-5 w-5 text-gray-400 flex-shrink-0" />}
              </button>
              {openId === faq.id && (
                <div className="px-6 pb-5 text-gray-600 text-sm leading-relaxed border-t border-gray-50 pt-4">
                  {faq.answer}
                </div>
              )}
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
