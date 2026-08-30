import React, { useState } from 'react';
import { Factory, Cog, Gauge, Zap, X } from 'lucide-react';
import SEO from '../../components/SEO';

const factoryImages = [
  'IMG_0006.jpg',
  'IMG_0007.jpg',
  'IMG_0009.jpg',
  'IMG_0013.jpg',
  'factory.jpg',
  'factory 2.jpg',
  'factory 3.jpg',
  'factory 4.jpg',
  'factory 5.jpg',
  'factory 6.jpg',
  '7.png',
  '32.png',
  '40.png',
  '41.png',
  '44.png',
  '46.png',
  'factory img png 5.png',
  'factory img png 6.png',
];

export default function FactoryPage() {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  return (
    <div className="bg-gray-50 min-h-screen">
      <SEO 
        title="Our Factory | Premium uPVC Manufacturing" 
        description="Visit our state-of-the-art uPVC manufacturing facility in Jashore, Bangladesh. Modern extrusion lines, auto-belling machines, and rigorous quality testing." 
        canonical="/factory" 
      />
      
      {/* Hero Section */}
      <section className="relative bg-brand-950 text-white overflow-hidden py-24 lg:py-32">
        <div className="absolute inset-0 z-0">
           <img 
              src={`/images/Factory Images/${encodeURIComponent('IMG_0013.jpg')}`} 
              alt="Factory Background" 
              className="w-full h-full object-cover opacity-10"
           />
           <div className="absolute inset-0 bg-gradient-to-t from-brand-950 via-brand-950/80 to-transparent"></div>
        </div>
        <div className="relative z-10 max-w-5xl mx-auto px-4 text-center">
          <span className="inline-block py-1.5 px-4 rounded-full bg-accent-500/10 text-accent-400 font-semibold text-sm mb-6 border border-accent-500/20 backdrop-blur-sm tracking-wide">
            MANUFACTURING EXCELLENCE
          </span>
          <h1 className="text-5xl md:text-6xl lg:text-7xl font-heading font-bold mb-6 tracking-tight text-white">Our Factory</h1>
          <p className="mt-4 text-brand-200 text-lg md:text-xl max-w-2xl mx-auto leading-relaxed">
            Take a glimpse into our state-of-the-art manufacturing facility, where premium quality meets modern technology.
          </p>
        </div>
      </section>

      {/* Facilities Grid */}
      <section className="max-w-7xl mx-auto px-4 py-16 -mt-16 relative z-20">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            { icon: Factory, title: 'Auto-Belling Machines', desc: 'Precision belling for consistent socket dimensions.' },
            { icon: Cog, title: 'Extrusion Lines', desc: 'Multiple extrusion lines for various pipe sizes.' },
            { icon: Gauge, title: 'Quality Lab', desc: 'In-house testing for pressure, impact, and dimensions.' },
            { icon: Zap, title: 'High Capacity', desc: 'Large-scale production to meet national demand.' },
          ].map((f, index) => (
            <div key={f.title} className="bg-white rounded-3xl shadow-xl shadow-brand-900/5 p-8 border border-gray-100/50 hover:-translate-y-2 transition-transform duration-300">
              <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-accent-50 to-brand-50 flex items-center justify-center mb-6">
                <f.icon className="h-8 w-8 text-accent-600" />
              </div>
              <h3 className="font-heading font-bold text-xl text-gray-900 mb-3">{f.title}</h3>
              <p className="text-gray-600 leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>
      
      {/* Description Section */}
      <section className="max-w-4xl mx-auto px-4 py-8 text-center">
        <div className="bg-white rounded-3xl p-8 md:p-12 shadow-sm border border-gray-100">
          <p className="text-base md:text-lg leading-relaxed text-gray-700">
            Our manufacturing facility, located in Baniargati, Bashundia, Jashore, is equipped with modern machinery and technology to produce <span className="text-red-600 font-bold">u</span><span className="font-bold text-gray-900">PVC</span> pipes and fittings of the highest quality. We strictly adhere to international standards to ensure durability and reliability in every product.
          </p>
        </div>
      </section>

      {/* Gallery Section */}
      <section className="max-w-7xl mx-auto px-4 py-20 mb-12">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-heading font-bold text-gray-900 mb-6">Facility Gallery</h2>
          <p className="text-gray-600 text-lg max-w-2xl mx-auto">Explore our production lines, machinery, and quality control processes through our interactive gallery.</p>
        </div>
        
        <div className="columns-1 sm:columns-2 lg:columns-3 xl:columns-4 gap-6 space-y-6">
          {factoryImages.map((img, index) => (
            <div 
              key={index} 
              className="break-inside-avoid relative group rounded-2xl overflow-hidden bg-gray-200 cursor-pointer shadow-sm hover:shadow-2xl transition-all duration-500"
              onClick={() => setSelectedImage(img)}
            >
              <img 
                src={`/images/Factory Images/${encodeURIComponent(img)}`} 
                alt={`Factory view ${index + 1}`}
                className="w-full h-auto object-cover transform group-hover:scale-110 transition-transform duration-700 ease-in-out"
                loading="lazy"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-brand-950/80 via-brand-950/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end">
                <div className="p-6 w-full transform translate-y-4 group-hover:translate-y-0 transition-transform duration-300">
                  <div className="bg-white/20 backdrop-blur-md text-white text-sm font-semibold py-2 px-4 rounded-full inline-flex items-center gap-2">
                    <Factory className="h-4 w-4" />
                    <span>View Image</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Image Modal */}
      {selectedImage && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-brand-950/95 backdrop-blur-md transition-opacity">
          <button 
            onClick={() => setSelectedImage(null)}
            className="absolute top-6 right-6 text-white/70 hover:text-white bg-white/10 hover:bg-white/20 p-3 rounded-full backdrop-blur-md transition-colors z-50"
          >
            <X className="h-6 w-6" />
          </button>
          
          <div 
            className="relative max-w-7xl max-h-[90vh] w-full flex items-center justify-center" 
            onClick={() => setSelectedImage(null)}
          >
            <img 
              src={`/images/Factory Images/${encodeURIComponent(selectedImage)}`} 
              alt="Factory Full View"
              className="max-w-full max-h-[90vh] object-contain rounded-xl shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            />
          </div>
        </div>
      )}
    </div>
  );
}
