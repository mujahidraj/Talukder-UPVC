import React from 'react';
import { Factory, Cog, Gauge, Zap } from 'lucide-react';

export default function FactoryPage() {
  return (
    <div>
      <section className="bg-gradient-to-br from-brand-900 to-brand-950 text-white py-20">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h1 className="text-4xl font-heading font-bold">Our Factory</h1>
          <p className="mt-4 text-brand-200 text-lg">A glimpse into our state-of-the-art manufacturing facility.</p>
        </div>
      </section>
      <section className="max-w-5xl mx-auto px-4 py-16">
        <div className="prose prose-lg max-w-none text-gray-600 mb-12">
          <p>Our manufacturing facility, located in Baniargati, Bashundia, Jashore, is equipped with modern machinery and technology to produce uPVC pipes and fittings of the highest quality.</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            { icon: Factory, title: 'Auto-Belling Machines', desc: 'Precision belling for consistent socket dimensions' },
            { icon: Cog, title: 'Extrusion Lines', desc: 'Multiple extrusion lines for various pipe sizes' },
            { icon: Gauge, title: 'Quality Lab', desc: 'In-house testing for pressure, impact, and dimensions' },
            { icon: Zap, title: 'High Capacity', desc: 'Large-scale production to meet national demand' },
          ].map(f => (
            <div key={f.title} className="bg-white rounded-2xl border border-gray-100 p-6 hover:shadow-lg transition-shadow">
              <div className="h-12 w-12 rounded-xl bg-accent-50 flex items-center justify-center mb-4"><f.icon className="h-6 w-6 text-accent-600" /></div>
              <h3 className="font-heading font-semibold text-gray-900">{f.title}</h3>
              <p className="text-sm text-gray-500 mt-2">{f.desc}</p>
            </div>
          ))}
        </div>
        {/* Factory images placeholder */}
        <div className="mt-12 grid grid-cols-2 md:grid-cols-3 gap-4">
          {[1,2,3].map(i => (
            <div key={i} className="aspect-video bg-gray-100 rounded-2xl flex items-center justify-center text-gray-300">
              <Factory className="h-12 w-12" />
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
