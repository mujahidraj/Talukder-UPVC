import React from 'react';
import SEO from '../../components/SEO';
import { Shield } from 'lucide-react';

export default function PrivacyPolicyPage() {
  return (
    <div className="bg-transparent min-h-screen py-12 md:py-24">
      <SEO 
        title="Privacy Policy" 
        description="Privacy Policy for Talukder uPVC Fittings Ltd." 
        canonical="/privacy-policy" 
      />
      <div className="max-w-4xl mx-auto px-4">
        <div className="bg-white rounded-3xl shadow-xl overflow-hidden border border-gray-100">
          <div className="bg-brand-900 p-8 md:p-12 text-center text-white">
            <Shield className="w-16 h-16 mx-auto mb-6 text-brand-300" />
            <h1 className="text-3xl md:text-5xl font-heading font-bold mb-4 text-white">Privacy Policy</h1>
            <p className="text-brand-200">Last Updated: {new Date().toLocaleDateString()}</p>
          </div>
          
          <div className="p-8 md:p-12 prose prose-brand max-w-none text-gray-600">
            <h2>1. Introduction</h2>
            <p>
              At Talukder <span className="text-red-600">u</span>PVC Fittings Ltd., we take your privacy seriously. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you visit our website or make an enquiry.
            </p>

            <h2>2. Information We Collect</h2>
            <p>
              We may collect personal information that you voluntarily provide to us when you express an interest in obtaining information about us or our products, such as:
            </p>
            <ul>
              <li>Name and contact data (email address, phone number, physical address)</li>
              <li>Company name and professional details</li>
              <li>Enquiry details and product preferences</li>
            </ul>

            <h2>3. How We Use Your Information</h2>
            <p>
              Having accurate information about you permits us to provide you with a smooth, efficient, and customized experience. We use the information we collect to:
            </p>
            <ul>
              <li>Respond to your product enquiries and quotation requests</li>
              <li>Improve our website and customer service</li>
              <li>Communicate with you about new products or services</li>
            </ul>

            <h2>4. Disclosure of Your Information</h2>
            <p>
              We do not sell, trade, or rent your personal identification information to others. We may share generic aggregated demographic information not linked to any personal identification information with our business partners and trusted affiliates.
            </p>

            <h2>5. Contact Us</h2>
            <p>
              If you have questions or comments about this Privacy Policy, please contact us at:
            </p>
            <div className="bg-gray-50 p-6 rounded-xl mt-4">
              <strong>Talukder <span className="text-red-600">u</span>PVC Fittings Ltd.</strong><br/>
              Email: info@talukder-group.com.bd<br/>
              Phone: +880 1966-333355
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
