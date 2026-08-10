import React from 'react';
import { Building2, Award, Users, Globe } from 'lucide-react';

export default function AboutPage() {
  return (
    <div>
      <section className="bg-gradient-to-br from-brand-900 to-brand-950 text-white py-20">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h1 className="text-4xl font-heading font-bold">About Talukder uPVC</h1>
          <p className="mt-4 text-brand-200 text-lg max-w-2xl mx-auto">A concern of Talukder Group of Industries — delivering quality uPVC products across Bangladesh.</p>
        </div>
      </section>
      <section className="max-w-5xl mx-auto px-4 py-16">
        <div className="prose prose-lg max-w-none">
          <p className="text-gray-600 leading-relaxed">Talukder uPVC Fittings Industries Ltd. is one of the leading manufacturers of uPVC pipes and fittings in Bangladesh. With a commitment to quality and innovation, we produce a comprehensive range of uPVC products for water supply, drainage, irrigation, and sanitation applications.</p>
          <p className="text-gray-600 leading-relaxed mt-4">Our manufacturing facility is equipped with modern machinery including auto-belling machines, ensuring consistent quality across all our products. Every pipe and fitting is manufactured as per BS-3505 standard using 100% virgin material.</p>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mt-16">
          {[
            { icon: Building2, stat: '1', label: 'Modern Factory' },
            { icon: Award, stat: 'BS-3505', label: 'Certified Standard' },
            { icon: Users, stat: '243+', label: 'Product Range' },
            { icon: Globe, stat: 'Nationwide', label: 'Distribution' },
          ].map(s => (
            <div key={s.label} className="text-center">
              <div className="h-14 w-14 mx-auto rounded-2xl bg-brand-50 flex items-center justify-center mb-3"><s.icon className="h-7 w-7 text-brand-600" /></div>
              <p className="text-2xl font-heading font-bold text-brand-950">{s.stat}</p>
              <p className="text-sm text-gray-500">{s.label}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
