import React from 'react';
import { Building2, Award, Users, Globe, Shield, Target, Lightbulb, Recycle, TrendingUp, CheckCircle, Factory, Droplets } from 'lucide-react';
import SEO from '../../components/SEO';

export default function AboutPage() {
  return (
    <div className="bg-white">
      <SEO 
        title="About Us" 
        description="Learn about Talukder uPVC Fittings Ltd., a concern of Talukder Group of Industries. Our history, mission, vision, and core values." 
        canonical="/about" 
      />

      {/* 1. Hero Section */}
      <section className="relative overflow-hidden bg-brand-950 py-20 md:py-24 flex items-center border-b border-brand-800">
        <div className="absolute inset-0 w-full h-full">
          <img 
            src="/images/HERO-IMAGE-1.png" 
            className="w-full h-full object-cover object-center opacity-30 mix-blend-luminosity grayscale"
            alt="Talukder Factory"
          />
        </div>
        <div className="absolute inset-0 bg-gradient-to-r from-brand-950 via-brand-950/90 to-brand-900/40" />
        <div className="max-w-7xl mx-auto px-4 relative z-10 w-full">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-brand-800/50 border border-brand-700/50 backdrop-blur-md mb-6 shadow-sm">
              <span className="h-2 w-2 rounded-full bg-brand-400 animate-pulse"></span>
              <span className="text-xs font-semibold text-brand-200 tracking-wider uppercase">About Our Company</span>
            </div>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-heading font-bold tracking-tight mb-6 text-white leading-[1.15]">
              Building the Future of <br className="hidden md:block" />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-300 to-brand-50">Piping Systems</span>
            </h1>
            <p className="text-lg md:text-xl text-brand-200/90 leading-relaxed max-w-2xl font-medium">
              Talukder uPVC Fittings Ltd., a proud concern of Talukder Group of Industries, has been delivering uncompromising quality across Bangladesh for years.
            </p>
          </div>
        </div>
      </section>

      {/* 2. Who We Are / Our Story */}
      <section className="py-20 md:py-28 bg-white">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div className="relative">
              {/* Decorative elements */}
              <div className="absolute -top-4 -left-4 w-32 h-32 bg-brand-100 rounded-2xl -z-10" />
              <div className="absolute -bottom-4 -right-4 w-32 h-32 bg-gray-100 rounded-2xl -z-10" />
              <img 
                src="/images/tube.png" 
                alt="Our Journey" 
                className="rounded-3xl shadow-xl w-full h-[500px] object-cover"
              />
              <div className="absolute bottom-8 -left-8 bg-white p-6 rounded-2xl shadow-xl border border-gray-100">
                <div className="flex items-center gap-4">
                  <div className="h-12 w-12 bg-brand-600 rounded-full flex items-center justify-center">
                    <Award className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <p className="font-heading font-bold text-2xl text-gray-900">100%</p>
                    <p className="text-sm text-gray-500 font-medium">Virgin Material</p>
                  </div>
                </div>
              </div>
            </div>
            <div>
              <span className="text-brand-600 font-bold tracking-wider uppercase text-sm">Our Story</span>
              <h2 className="text-3xl md:text-4xl font-heading font-bold text-gray-900 mt-4 mb-6">
                A Legacy of Trust & Engineering Excellence
              </h2>
              <div className="prose prose-lg text-gray-600 max-w-none">
                <p>
                  Talukder uPVC Fittings Ltd. is one of the leading and most trusted manufacturers of uPVC pipes and fittings in Bangladesh. Since our inception, we have been driven by a singular commitment: to produce a comprehensive range of uPVC products that stand the test of time.
                </p>
                <p>
                  Our manufacturing facility is equipped with state-of-the-art machinery, including high-precision auto-belling machines, ensuring consistent quality and structural integrity across all our products. We specialize in solutions for water supply, deep tube-wells, drainage, irrigation, and modern sanitation applications.
                </p>
                <p>
                  Every pipe and fitting is manufactured strictly adhering to the highest quality standards, using only 100% virgin raw materials without any compromises.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3. Stats & Scale */}
      <section className="bg-brand-950 py-16">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 divide-x divide-brand-800/50">
            {[
              { icon: Building2, stat: 'Modern', label: 'Manufacturing Facility' },
              { icon: Shield, stat: 'Premium', label: 'Quality Assured' },
              { icon: Users, stat: '240+', label: 'Total Products' },
              { icon: Globe, stat: 'Nationwide', label: 'Distribution Network' },
            ].map((s, idx) => (
              <div key={s.label} className={`text-center ${idx !== 0 ? 'pl-8' : ''}`}>
                <div className="h-14 w-14 mx-auto rounded-2xl bg-brand-900 border border-brand-800 flex items-center justify-center mb-4">
                  <s.icon className="h-7 w-7 text-accent-400" />
                </div>
                <p className="text-2xl md:text-3xl font-heading font-bold text-white mb-1">{s.stat}</p>
                <p className="text-sm text-brand-300/80">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 4. Mission & Vision */}
      <section className="py-20 md:py-28 bg-gray-50 relative overflow-hidden">
        {/* Subtle background decoration */}
        <div className="absolute top-0 right-0 -mr-32 -mt-32 w-[600px] h-[600px] bg-brand-100/50 rounded-full blur-3xl opacity-50" />
        
        <div className="max-w-7xl mx-auto px-4 relative z-10">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
            {/* Mission */}
            <div className="bg-white p-10 md:p-14 rounded-3xl shadow-xl shadow-gray-200/50 border border-gray-100 hover:border-brand-300 transition-colors group">
              <div className="h-16 w-16 bg-brand-50 rounded-2xl flex items-center justify-center mb-8 group-hover:scale-110 transition-transform">
                <Target className="h-8 w-8 text-brand-600" />
              </div>
              <h3 className="text-3xl font-heading font-bold text-gray-900 mb-4">Our Mission</h3>
              <p className="text-lg text-gray-600 leading-relaxed">
                To manufacture and deliver the highest quality uPVC pipes and fittings that provide safe, sustainable, and affordable water management solutions for every household and industry in Bangladesh, while ensuring continuous innovation and customer satisfaction.
              </p>
            </div>
            
            {/* Vision */}
            <div className="bg-brand-900 p-10 md:p-14 rounded-3xl shadow-xl shadow-brand-900/20 border border-brand-800 hover:border-brand-500 transition-colors group">
              <div className="h-16 w-16 bg-brand-800 rounded-2xl flex items-center justify-center mb-8 group-hover:scale-110 transition-transform">
                <Lightbulb className="h-8 w-8 text-brand-300" />
              </div>
              <h3 className="text-3xl font-heading font-bold text-white mb-4">Our Vision</h3>
              <p className="text-lg text-brand-200/90 leading-relaxed">
                To be the undisputed market leader in the polymer and fittings industry across South Asia, recognized for our uncompromising engineering standards, ethical business practices, and contribution to national infrastructural development.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 5. Core Values */}
      <section className="py-20 md:py-28 bg-white">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <span className="text-brand-600 font-bold tracking-wider uppercase text-sm">Principles We Stand By</span>
            <h2 className="text-3xl md:text-4xl font-heading font-bold text-gray-900 mt-4 mb-4">Our Core Values</h2>
            <p className="text-lg text-gray-600">The fundamental beliefs that guide our business, dictate our behavior, and help us achieve our vision.</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { icon: Shield, title: 'Uncompromising Quality', desc: 'We never cut corners. From sourcing 100% virgin raw materials to final extrusion, quality is our signature.' },
              { icon: Target, title: 'Customer Centricity', desc: 'Our customers\' needs dictate our innovations. We build products designed to solve real-world plumbing challenges.' },
              { icon: Recycle, title: 'Sustainability', desc: 'Committed to environmentally friendly manufacturing processes that minimize waste and energy consumption.' },
              { icon: Users, title: 'Integrity & Ethics', desc: 'Honesty and transparency govern all our operations, partnerships, and interactions with stakeholders.' },
              { icon: Lightbulb, title: 'Continuous Innovation', desc: 'We constantly upgrade our machinery and techniques to stay ahead of the technological curve.' },
              { icon: TrendingUp, title: 'Nation Building', desc: 'Proudly contributing to the infrastructure, agriculture, and economic growth of Bangladesh.' },
            ].map((value, i) => (
              <div key={i} className="p-8 bg-gray-50 rounded-2xl border border-gray-100 hover:shadow-lg hover:border-brand-200 transition-all">
                <div className="h-12 w-12 bg-white rounded-xl shadow-sm border border-gray-100 flex items-center justify-center mb-6">
                  <value.icon className="h-6 w-6 text-accent-600" />
                </div>
                <h3 className="text-xl font-heading font-bold text-gray-900 mb-3">{value.title}</h3>
                <p className="text-gray-600 leading-relaxed">{value.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 6. Manufacturing Excellence */}
      <section className="py-20 md:py-28 bg-gray-900 text-white relative overflow-hidden">
        <div className="absolute inset-0 w-full h-full">
          <img 
            src="/images/why chose.png" 
            className="w-full h-full object-cover object-center opacity-20"
            alt="Manufacturing"
          />
        </div>
        <div className="max-w-7xl mx-auto px-4 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div>
              <h2 className="text-3xl md:text-4xl font-heading font-bold text-white mb-6">
                Manufacturing Excellence
              </h2>
              <p className="text-lg text-gray-300 leading-relaxed mb-8">
                Our advanced factory located in Baniargati, Bashundia, Jashore is a testament to modern industrial engineering. We employ rigorous quality control checks at every phase of production.
              </p>
              <ul className="space-y-4">
                {[
                  '100% Virgin Food-Grade Material',
                  'High-Precision Auto-Belling Machines',
                  'Automated Extrusion Lines',
                  'Rigorous Pressure & Impact Testing',
                  'Compliance with International Standards'
                ].map((item, i) => (
                  <li key={i} className="flex items-center gap-3">
                    <CheckCircle className="h-5 w-5 text-brand-400 shrink-0" />
                    <span className="text-gray-200">{item}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-4 mt-8">
                <div className="bg-gray-800/80 backdrop-blur border border-gray-700 p-6 rounded-3xl">
                  <Factory className="h-10 w-10 text-brand-400 mb-4" />
                  <h4 className="font-bold text-xl text-white mb-2">Modern Machinery</h4>
                  <p className="text-sm text-gray-400">Imported state-of-the-art extrusion technology.</p>
                </div>
                <div className="bg-brand-900/80 backdrop-blur border border-brand-800 p-6 rounded-3xl">
                  <Droplets className="h-10 w-10 text-brand-300 mb-4" />
                  <h4 className="font-bold text-xl text-white mb-2">Pure Material</h4>
                  <p className="text-sm text-brand-200/70">No recycled plastics. 100% pure formulation.</p>
                </div>
              </div>
              <div className="space-y-4">
                <div className="bg-brand-900/80 backdrop-blur border border-brand-800 p-6 rounded-3xl">
                  <Shield className="h-10 w-10 text-brand-300 mb-4" />
                  <h4 className="font-bold text-xl text-white mb-2">Certified</h4>
                  <p className="text-sm text-brand-200/70">Stringent adherence to international standards.</p>
                </div>
                <div className="bg-gray-800/80 backdrop-blur border border-gray-700 p-6 rounded-3xl">
                  <Users className="h-10 w-10 text-brand-400 mb-4" />
                  <h4 className="font-bold text-xl text-white mb-2">Expert Team</h4>
                  <p className="text-sm text-gray-400">Led by experienced engineers and operators.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 7. Corporate Leadership / Talukder Group */}
      <section className="py-20 md:py-28 bg-brand-50">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <div className="inline-flex items-center justify-center p-3 bg-white rounded-2xl shadow-sm mb-6">
            <span className="text-2xl font-heading font-black text-brand-900">T</span>
          </div>
          <h2 className="text-3xl md:text-4xl font-heading font-bold text-gray-900 mb-6">A Concern of Talukder Group</h2>
          <p className="text-lg text-gray-600 leading-relaxed mb-8">
            Talukder uPVC Fittings Ltd. draws its strength and corporate governance from its parent organization, the <strong>Talukder Group of Industries</strong>. With diverse business interests and a rich history of contributing to the national economy, the Group provides the financial stability, strategic vision, and vast distribution network that allows us to serve our customers better every single day.
          </p>
        </div>
      </section>
    </div>
  );
}
