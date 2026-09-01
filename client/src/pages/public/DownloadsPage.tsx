import React from 'react';
import { Download, FileText } from 'lucide-react';
import SEO from '../../components/SEO';

export default function DownloadsPage() {
  return (
    <div>
      <SEO 
        title="Downloads" 
        description="Download Talukder uPVC product catalogs, BS-3505 compliance sheets, pressure rating guides, and installation manuals." 
        canonical="/downloads" 
      />
      <section className="bg-gradient-to-br from-brand-900 to-brand-950 text-white py-20">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h1 className="text-4xl font-heading font-bold text-white">Downloads</h1>
          <p className="mt-4 text-brand-200 text-lg">Access our product catalogs, specification sheets, and certificates.</p>
        </div>
      </section>
      <section className="max-w-4xl mx-auto px-4 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {[
            { title: 'Product Catalog (Full PDF)', desc: <>Complete catalog of all <span className="text-red-600">u</span>PVC pipes and fittings</>, size: '2.4 MB', href: '/PVC%20Catalog.pdf' },
            { title: 'BS-3505 Compliance Sheet', desc: 'Technical specification and compliance documentation', size: '680 KB', href: '#' },
            { title: 'Pressure Rating Guide', desc: 'Guide to pipe classes and pressure ratings', size: '420 KB', href: '#' },
            { title: 'Installation Manual', desc: <>Step-by-step installation guide for <span className="text-red-600">u</span>PVC pipes</>, size: '1.2 MB', href: '#' },
          ].map(doc => (
            <a key={doc.title} href={doc.href} target="_blank" rel="noopener noreferrer" className="flex items-start gap-4 bg-white rounded-2xl border border-gray-100 p-6 hover:shadow-lg hover:border-brand-200 transition-all group">
              <div className="h-12 w-12 rounded-xl bg-brand-50 flex items-center justify-center flex-shrink-0 group-hover:bg-brand-100 transition-colors">
                <FileText className="h-6 w-6 text-brand-600" />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-gray-900 group-hover:text-brand-600 transition-colors">{doc.title}</h3>
                <p className="text-sm text-gray-500 mt-1">{doc.desc}</p>
                <p className="text-xs text-gray-400 mt-2 flex items-center gap-1"><Download className="h-3 w-3" /> {doc.size}</p>
              </div>
            </a>
          ))}
        </div>
      </section>
    </div>
  );
}
