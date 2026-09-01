import React from 'react';
import { Award, ShieldCheck, FileCheck } from 'lucide-react';
import SEO from '../../components/SEO';

export default function CertificationsPage() {
  return (
    <div>
      <SEO 
        title="Certifications & Standards" 
        description="Talukder uPVC products are BS-3505 certified, ISO 9001:2015 compliant, and BSTI approved. Quality you can trust for water supply and drainage." 
        canonical="/certifications" 
      />
      <section className="bg-gradient-to-br from-brand-900 to-brand-950 text-white py-20">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h1 className="text-4xl font-heading font-bold text-white">Certifications & Standards</h1>
          <p className="mt-4 text-brand-200 text-lg">Our commitment to quality is backed by international certifications.</p>
        </div>
      </section>
      <section className="max-w-5xl mx-auto px-4 py-16">


        <div className="text-center mb-10">
          <h2 className="text-3xl font-heading font-bold text-brand-950">Certificate Gallery</h2>
          <p className="mt-2 text-gray-600">View our official compliance certificates and licenses.</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {[
            { src: '/Certified/Bsti.png', alt: 'BSTI Certificate' },
            { src: '/Certified/buetLogo.jpg', alt: 'BUET Certificate' },
            { src: '/Certified/certified.jpg', alt: 'Certification' },
            { src: '/Certified/environmental.png', alt: 'Environmental Clearance' },
            { src: '/Certified/fire.jpg', alt: 'Fire Safety Certificate' },
            { src: '/Certified/xxxx.png', alt: 'Trade License' },
          ].map((img, idx) => (
            <div key={idx} className="bg-white rounded-2xl border border-gray-100 p-4 shadow-sm hover:shadow-md transition-shadow overflow-hidden group">
              <div className="aspect-[3/4] relative bg-gray-50 rounded-xl overflow-hidden flex items-center justify-center p-2">
                <img 
                  src={img.src} 
                  alt={img.alt} 
                  className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-500" 
                />
              </div>
              <p className="text-center mt-4 font-semibold text-gray-700">{img.alt}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
