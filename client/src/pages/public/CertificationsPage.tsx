import React from 'react';
import { Award, ShieldCheck, FileCheck } from 'lucide-react';

export default function CertificationsPage() {
  return (
    <div>
      <section className="bg-gradient-to-br from-brand-900 to-brand-950 text-white py-20">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h1 className="text-4xl font-heading font-bold">Certifications & Standards</h1>
          <p className="mt-4 text-brand-200 text-lg">Our commitment to quality is backed by international certifications.</p>
        </div>
      </section>
      <section className="max-w-5xl mx-auto px-4 py-16">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
            { icon: Award, title: 'BS-3505 Standard', desc: 'All uPVC pressure pipes manufactured as per British Standard BS-3505, ensuring accurate wall thickness, dimensional precision, and pressure ratings.' },
            { icon: ShieldCheck, title: 'ISO 9001:2015', desc: 'Quality management system certified to ISO 9001:2015, reflecting our commitment to continuous improvement and customer satisfaction.' },
            { icon: FileCheck, title: 'BSTI Approved', desc: 'Products tested and approved by Bangladesh Standards and Testing Institution, meeting national quality requirements.' },
          ].map(cert => (
            <div key={cert.title} className="bg-white rounded-2xl border border-gray-100 p-8 text-center hover:shadow-lg transition-shadow">
              <div className="h-16 w-16 mx-auto rounded-2xl bg-brand-50 flex items-center justify-center mb-5">
                <cert.icon className="h-8 w-8 text-brand-600" />
              </div>
              <h3 className="text-xl font-heading font-bold text-brand-950">{cert.title}</h3>
              <p className="mt-3 text-sm text-gray-600 leading-relaxed">{cert.desc}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
